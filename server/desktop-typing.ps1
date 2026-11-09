# This file is launched for each Desktop keyboard job by server/desktop.js.
# It simulates text entry into active Windows applications (WhatsApp, Google Docs/Chrome, and any Windows app).
# It attaches to the user desktop, ensures the target window is frontmost,
# and safely types keystrokes into the focused editor or chat input.
$ErrorActionPreference = 'Stop'
try {
    $requestLine = [Console]::In.ReadLine()
    if ([string]::IsNullOrWhiteSpace($requestLine)) { throw 'No typing request supplied.' }
    $request = ConvertFrom-Json -InputObject $requestLine
    $text = [Text.Encoding]::Unicode.GetString([Convert]::FromBase64String([string]$request.textBase64))
    $speed = [string]$request.speed
    if ($speed -notin @('slow','normal','fast') -or $text.Length -gt 3000 -or [string]::IsNullOrWhiteSpace($text)) {
        throw 'Invalid typing request.'
    }

    Add-Type -TypeDefinition @'
using System;
using System.Text;


using System.Threading;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Collections.Generic;

[StructLayout(LayoutKind.Sequential)]
public struct DesktopKeyboardInput {
    public int type;
    public DesktopInputUnion U;
}
[StructLayout(LayoutKind.Explicit)]
public struct DesktopInputUnion {
    [FieldOffset(0)] public DesktopKeyData ki;
    [FieldOffset(0)] public DesktopMouseData mi;
}
[StructLayout(LayoutKind.Sequential)]
public struct DesktopKeyData {
    public ushort wVk;
    public ushort wScan;
    public uint dwFlags;
    public uint time;
    public UIntPtr dwExtraInfo;
}
[StructLayout(LayoutKind.Sequential)]
public struct DesktopMouseData {
    public int dx;
    public int dy;
    public uint mouseData;
    public uint dwFlags;
    public uint time;
    public UIntPtr dwExtraInfo;
}

public static class DesktopTypingEngine {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll", SetLastError=true)] public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);
    [DllImport("user32.dll", SetLastError=true)] public static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);
    [DllImport("user32.dll", SetLastError=true)] public static extern bool SetThreadDesktop(IntPtr hDesktop);
    [DllImport("user32.dll", SetLastError=true)] public static extern bool CloseDesktop(IntPtr hDesktop);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll", SetLastError=true)] public static extern uint SendInput(uint count, DesktopKeyboardInput[] inputs, int size);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern short VkKeyScanW(char ch);
    [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();

    private const uint KEYUP = 0x0002;
    private const uint UNICODE = 0x0004;
    private const byte VK_SHIFT = 0x10;
    private const byte VK_RETURN = 0x0D;
    private const uint DESKTOP_ALL = 0x01FF;

    public static bool IsDisallowedProcess(string procName, string windowTitle) {
        if (string.IsNullOrEmpty(procName)) return false;
        string n = procName.ToLower();
        if (n == "logonui" || n == "dwm" || n == "shellexperiencehost") return true;
        if (n == "explorer" && (string.IsNullOrWhiteSpace(windowTitle) || windowTitle.Equals("Program Manager", StringComparison.OrdinalIgnoreCase) || windowTitle.Equals("Taskbar", StringComparison.OrdinalIgnoreCase))) return true;
        if (!string.IsNullOrEmpty(windowTitle) && (windowTitle.Contains("Phone Type Remote - Host") || windowTitle.Contains("HOST-FOR-ME"))) return true;
        return false;
    }

    public static bool IsValidTargetWindow(IntPtr hWnd) {
        if (hWnd == IntPtr.Zero) return false;
        if (!IsWindowVisible(hWnd) || IsIconic(hWnd)) return false;
        uint pid;
        GetWindowThreadProcessId(hWnd, out pid);
        if (pid == 0) return false;
        try {
            var p = Process.GetProcessById((int)pid);
            StringBuilder sb = new StringBuilder(256);
            GetWindowText(hWnd, sb, 256);
            string title = sb.ToString().Trim();
            if (IsDisallowedProcess(p.ProcessName, title)) return false;
            return true;
        } catch { return false; }
    }

    public static IntPtr FindBestTargetWindow() {
        IntPtr best = IntPtr.Zero;
        int bestScore = -1;

        EnumWindows((hWnd, lParam) => {
            if (!IsWindowVisible(hWnd)) return true;
            uint pid;
            GetWindowThreadProcessId(hWnd, out pid);
            if (pid == 0) return true;
            try {
                var p = Process.GetProcessById((int)pid);
                string procName = p.ProcessName.ToLower();
                StringBuilder sb = new StringBuilder(256);
                GetWindowText(hWnd, sb, 256);
                string title = sb.ToString().Trim();

                if (IsDisallowedProcess(procName, title)) return true;
                if (string.IsNullOrEmpty(title)) return true;

                int score = 0;
                // High priority: WhatsApp (Desktop or Web)
                if (procName.Contains("whatsapp") || title.ToLower().Contains("whatsapp")) {
                    score = 100;
                }
                // High priority: Browsers (Google Chrome, Edge, Brave, Firefox, etc.)
                else if (procName == "chrome" || procName == "msedge" || procName == "brave" || procName == "firefox" || procName == "opera" || procName == "vivaldi") {
                    score = 80;
                    if (title.ToLower().Contains("google") || title.ToLower().Contains("docs")) score += 10;
                }
                // Common editors & productivity: Word, Notepad, VS Code, Slack, Telegram
                else if (procName == "notepad" || procName == "winword" || procName == "code" || procName == "telegram" || procName == "slack") {
                    score = 60;
                } else {
                    score = 20;
                }

                if (IsIconic(hWnd)) score -= 10;

                if (score > bestScore) {
                    bestScore = score;
                    best = hWnd;
                }
            } catch {}
            return true;
        }, IntPtr.Zero);

        return best;
    }

    public static bool ActivateWindow(IntPtr hWnd) {
        if (hWnd == IntPtr.Zero) return false;
        if (IsIconic(hWnd)) ShowWindow(hWnd, 9);
        else ShowWindow(hWnd, 5);

        IntPtr fg = GetForegroundWindow();
        uint fgPid;
        uint fgThread = GetWindowThreadProcessId(fg, out fgPid);
        uint currentThread = GetCurrentThreadId();

        if (fgThread != 0 && fgThread != currentThread) {
            AttachThreadInput(currentThread, fgThread, true);
            SetForegroundWindow(hWnd);
            BringWindowToTop(hWnd);
            AttachThreadInput(currentThread, fgThread, false);
        } else {
            SetForegroundWindow(hWnd);
            BringWindowToTop(hWnd);
        }
        return true;
    }

    public static bool TargetHasFocus(IntPtr targetWindow, uint targetPid) {
        IntPtr fg = GetForegroundWindow();
        if (fg == IntPtr.Zero) return true;
        if (targetWindow != IntPtr.Zero && fg == targetWindow) return true;
        uint fgPid;
        GetWindowThreadProcessId(fg, out fgPid);
        if (fgPid != 0 && targetPid != 0 && fgPid == targetPid) return true;

        try {
            string fgName = Process.GetProcessById((int)fgPid).ProcessName.ToLower();
            if (fgName == "textinputhost" || fgName == "applicationframehost") return true;
        } catch {}

        return false;
    }

    public static string GetForegroundDescription() {
        IntPtr hwnd = GetForegroundWindow();
        if (hwnd == IntPtr.Zero) return "no foreground window";
        uint pid;
        GetWindowThreadProcessId(hwnd, out pid);
        if (pid == 0) return "unidentified window";
        try {
            Process p = Process.GetProcessById((int)pid);
            StringBuilder sb = new StringBuilder(256);
            GetWindowText(hwnd, sb, 256);
            string title = sb.ToString().Trim();
            if (!string.IsNullOrEmpty(title)) {
                return p.ProcessName + " (" + title + ")";
            }
            return p.ProcessName + ".exe";
        } catch { return "PID " + pid; }
    }

    private static DesktopKeyboardInput Keyboard(ushort key, ushort scan, uint flags) {
        DesktopKeyboardInput input = new DesktopKeyboardInput();
        input.type = 1;
        input.U.ki.wVk = key;
        input.U.ki.wScan = scan;
        input.U.ki.dwFlags = flags;
        return input;
    }

    public static bool TypeSurrogatePair(char high, char low) {
        DesktopKeyboardInput[] inputs = new DesktopKeyboardInput[] {
            Keyboard(0, (ushort)high, UNICODE),
            Keyboard(0, (ushort)high, UNICODE | KEYUP),
            Keyboard(0, (ushort)low, UNICODE),
            Keyboard(0, (ushort)low, UNICODE | KEYUP)
        };
        return SendInput(4, inputs, Marshal.SizeOf(typeof(DesktopKeyboardInput))) == 4;
    }

    public static bool TypeCharacter(char ch) {
        if (ch == '\r') return true;
        if (ch == '\n') {
            DesktopKeyboardInput[] enter = new DesktopKeyboardInput[] {
                Keyboard(VK_RETURN, 0, 0),
                Keyboard(VK_RETURN, 0, KEYUP)
            };
            if (SendInput(2, enter, Marshal.SizeOf(typeof(DesktopKeyboardInput))) == 2) return true;
            keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
            keybd_event(VK_RETURN, 0, 2, UIntPtr.Zero);
            return true;
        }
        if (ch == '\t') ch = ' ';
        if (ch >= ' ' && ch <= '~') {
            short mapped = VkKeyScanW(ch);
            if (mapped != -1) {
                ushort vk = (ushort)(mapped & 0xff);
                ushort modifiers = (ushort)((mapped >> 8) & 0xff);
                if (modifiers == 0) {
                    DesktopKeyboardInput[] keys = new DesktopKeyboardInput[] {
                        Keyboard(vk, 0, 0),
                        Keyboard(vk, 0, KEYUP)
                    };
                    if (SendInput(2, keys, Marshal.SizeOf(typeof(DesktopKeyboardInput))) == 2) return true;
                    keybd_event((byte)vk, 0, 0, UIntPtr.Zero);
                    keybd_event((byte)vk, 0, 2, UIntPtr.Zero);
                    return true;
                }
                if (modifiers == 1) {
                    DesktopKeyboardInput[] keys = new DesktopKeyboardInput[] {
                        Keyboard(VK_SHIFT, 0, 0),
                        Keyboard(vk, 0, 0),
                        Keyboard(vk, 0, KEYUP),
                        Keyboard(VK_SHIFT, 0, KEYUP)
                    };
                    if (SendInput(4, keys, Marshal.SizeOf(typeof(DesktopKeyboardInput))) == 4) return true;
                    keybd_event(VK_SHIFT, 0, 0, UIntPtr.Zero);
                    keybd_event((byte)vk, 0, 0, UIntPtr.Zero);
                    keybd_event((byte)vk, 0, 2, UIntPtr.Zero);
                    keybd_event(VK_SHIFT, 0, 2, UIntPtr.Zero);
                    return true;
                }
            }
        }
        DesktopKeyboardInput[] unicodeKeys = new DesktopKeyboardInput[] {
            Keyboard(0, ch, UNICODE),
            Keyboard(0, ch, UNICODE | KEYUP)
        };
        if (SendInput(2, unicodeKeys, Marshal.SizeOf(typeof(DesktopKeyboardInput))) == 2) return true;
        return true;
    }

    public static void RunSession(string text, string speed) {
        Exception threadEx = null;
        Thread worker = new Thread(() => {
            try {
                IntPtr hDesk = OpenDesktop("Default", 0, false, DESKTOP_ALL);
                if (hDesk == IntPtr.Zero) hDesk = OpenInputDesktop(0, false, DESKTOP_ALL);
                if (hDesk != IntPtr.Zero) {
                    SetThreadDesktop(hDesk);
                    CloseDesktop(hDesk);
                }

                IntPtr window = GetForegroundWindow();
                if (!IsValidTargetWindow(window)) {
                    IntPtr target = FindBestTargetWindow();
                    if (target != IntPtr.Zero) {
                        ActivateWindow(target);
                        Thread.Sleep(300);
                        IntPtr after = GetForegroundWindow();
                        window = (after != IntPtr.Zero && IsValidTargetWindow(after)) ? after : target;
                    }
                }

                for (int attempt = 0; attempt < 5; attempt++) {
                    if (IsValidTargetWindow(window)) break;
                    Thread.Sleep(200);
                    window = GetForegroundWindow();
                }

                if (!IsValidTargetWindow(window)) {
                    string desc = GetForegroundDescription();
                    throw new Exception("No target window active (detected: " + desc + "). Please click into WhatsApp, Google Docs, or any Windows app and tap Start.");
                }

                uint targetPid = 0;
                GetWindowThreadProcessId(window, out targetPid);
                ActivateWindow(window);
                Thread.Sleep(100);

                int delay = (speed == "slow") ? 180 : ((speed == "fast") ? 35 : 75);
                Console.Out.WriteLine("STARTED");
                Console.Out.Flush();

                Random rnd = new Random();
                for (int i = 0; i < text.Length; i++) {
                    if (!TargetHasFocus(window, targetPid)) {
                        Thread.Sleep(150);
                        if (!TargetHasFocus(window, targetPid)) {
                            throw new Exception("Target window lost focus (" + GetForegroundDescription() + "). Typing stopped.");
                        }
                    }

                    if (char.IsHighSurrogate(text[i]) && i + 1 < text.Length && char.IsLowSurrogate(text[i + 1])) {
                        TypeSurrogatePair(text[i], text[i + 1]);
                        i++;
                    } else {
                        TypeCharacter(text[i]);
                    }

                    if ((i + 1) % 20 == 0) {
                        int pct = (int)Math.Round(100.0 * (i + 1) / text.Length);
                        Console.Out.WriteLine("PROGRESS:" + pct);
                        Console.Out.Flush();
                    }

                    if (i < text.Length - 1) {
                        int pause = (int)(delay * rnd.Next(75, 128) / 100.0);
                        char c = text[i];
                        if (c == ',' || c == '.' || c == ';' || c == ':' || c == '!' || c == '?') pause += 120;
                        if (c == '\n') pause += 150;
                        Thread.Sleep(pause);
                    }
                }

                Console.Out.WriteLine("DONE");
                Console.Out.Flush();
            } catch (Exception ex) {
                threadEx = ex;
            }
        });

        worker.SetApartmentState(ApartmentState.STA);
        worker.Start();
        worker.Join();

        if (threadEx != null) {
            throw threadEx;
        }
    }
}
'@

    $text = $text.Replace("`r`n", "`n")
    [DesktopTypingEngine]::RunSession($text, $speed)
}
catch {
    $message = ([string]$_.Exception.Message -replace '[\r\n]+',' ').Trim()
    [Console]::Out.WriteLine('ERROR:' + $message)
    [Console]::Out.Flush()
    exit 1
}
