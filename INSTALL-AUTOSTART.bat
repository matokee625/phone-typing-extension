@echo off
title Install Phone Type Remote Autostart
setlocal enabledelayedexpansion

set "TARGET_DIR=%~dp0"
set "BAT_FILE=%TARGET_DIR%HOST-FOR-ME.bat"
set "SHORTCUT_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PhoneTypeRemote.lnk"

echo ========================================================
echo     Phone Type Remote - Windows Autostart Setup
echo ========================================================
echo.
echo Installing autostart shortcut into Windows Startup folder:
echo   "%SHORTCUT_PATH%"
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
  "$s.TargetPath = '%BAT_FILE%'; " ^
  "$s.WorkingDirectory = '%TARGET_DIR%'; " ^
  "$s.WindowStyle = 7; " ^
  "$s.Description = 'Phone Type Remote Server & Tunnel'; " ^
  "$s.Save()"

if exist "%SHORTCUT_PATH%" (
    echo [SUCCESS] Phone Type Remote will now automatically start when you sign in to Windows.
) else (
    echo [ERROR] Could not create startup shortcut.
)

echo.
pause
