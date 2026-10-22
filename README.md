# Phone Type Remote — Chrome forms + Windows Google Docs keyboard mode

This project is an improved version of the phone-controlled Chrome typing extension. **New:** open `http://localhost:8765/connect` on the computer for a scannable QR code, or scan the QR from the updated Chrome extension popup. The phone then opens the controller on the same Wi-Fi. Pairing still requires the terminal’s 8-digit code.

It supports two typing methods:

- **Web form**: The original Chrome content script enters text into ordinary `input`, `textarea`, and many `contenteditable` elements. This mode requires the extension to show a textbox selected in Chrome.
- **Desktop keyboard (Windows)**: A short-lived Windows PowerShell process sends OS-level simulated keystrokes to the **foreground Google Chrome window**. This mode does *not* depend on the extension detecting a textbox. It is intended for Google Docs and rich editors, where direct DOM editing often fails. Google Docs/browser compatibility is best-effort: some editors may ignore or transform simulated input.

## Requirements

- Windows 10/11 for the new desktop keyboard mode (no extra Python or npm packages)
- Google Chrome
- Node.js 22 or newer
- Phone and computer on the same trusted private Wi-Fi

The original Web form mode also works on other desktop operating systems.

## Upgrading from the previous Phone Type Remote

1. **Stop your old Node server** by pressing `Ctrl+C` in its terminal. You must stop it first, because both versions use port `8765`.
2. Extract this ZIP into a **new folder**. You can keep the older project folder as a backup.
3. Open Windows Terminal in the new `phone-type-universal` folder.
4. Run:

   ```powershell
   node server/server.js
   ```

5. Keep the terminal running. It will print a **new 8-digit pairing code**.
6. The **previously installed Chrome extension can stay installed**: its Chrome-side files are unchanged. Open its popup and connect using the new code. Do not load another copy of the extension unless you need to reinstall it.
7. On your phone, open `http://YOUR-WIFI-IP:8765/?docs=1`, substituting the Wi-Fi IP printed in the server terminal. If your Wi-Fi address is still `192.168.150.218`, use `http://192.168.150.218:8765/?docs=1`.
8. Enter the new pairing code in the phone controller, if asked.

You should see the tag **PRIVATE WI-FI · WINDOWS DOCS MODE** at the top.

## Test Google Docs

1. Open a Google Docs document **in Chrome on your computer**.
2. On your phone, choose **Typing method → Desktop keyboard — Google Docs & rich editors (Windows)**.
3. Enter `Hello test from my phone.` on your phone.
4. **On your computer**, click into the Google Docs document body and leave Chrome as the frontmost window. Do **not** open the extension popup afterward.
5. On your phone, tap **Start typing**.
6. The Windows keyboard process types each character into the *currently focused Chrome window* with short, variable delays. Click **Stop** on your phone to interrupt it.

No "Textbox selected" indicator is required in Desktop keyboard mode. A clicked Chrome document is still essential: this mode cannot identify the active Google Docs text caret and cannot tell if you accidentally focused Chrome's address bar or another part of the page.

To type into ordinary website forms, change the method back to **Web form**, click the actual textbox in Chrome, and use Start.

## Important limitations

- **Not a guarantee for every editor.** Windows simulated keystrokes may behave differently across Google Docs, embedded editors, websites, and browser versions. This version's JavaScript tests ran successfully, but the Windows keystroke injector **has not been tested on a real Windows/Google Docs system here**.
- **Only Chrome windows** are authorized in Desktop keyboard mode. The script refuses to type if the foreground window is not a Chrome process, and stops if you switch to another window. It does not currently detect tab changes within a Chrome window, so do not change tabs while typing.
- This is **not** actual physical keyboard hardware input. Sites can sometimes distinguish OS-injected events from human input, and protected fields may reject them.
- Don't use with passwords, payment forms, authentication fields, or sensitive data. Desktop mode cannot inspect the focused field to distinguish these fields.
- The Windows typing process does not elevate its privileges. It cannot type into administrator-elevated or otherwise protected windows.
- It uses local HTTP/WebSocket traffic without TLS encryption. Do not port-forward this server to the Internet; use only a trusted private Wi-Fi network.
- Phone text is kept in temporary process memory, not saved to a database or uploaded to an outside service. The project is local-only.
- To disable keyboard control, stop the Node server with `Ctrl+C`.

## Developer test

```sh
npm test
```

The Node.js test suite verifies the controller readiness rules, mode selection, local relay, and simulated lifecycle of the desktop keyboard job. Windows PowerShell/SendInput behavior must be tested locally on your Windows computer.

## Project files

- `server/server.js`: local phone API + job router
- `server/desktop.js`: Windows keyboard job launcher and stop/error handling
- `server/desktop-typing.ps1`: per-job Windows keystroke implementation using `SendInput`
- `server/public/*`: mobile-friendly phone controller with typing method selector
- `extension/*`: the unchanged Chrome extension
- `tests/*`: automated tests

## Scan a QR code instead of typing the IP

After starting the server with `node server/server.js`, open the **large QR code on your computer** at:

`http://localhost:8765/connect`

Or, update the installed extension from the new `extension` folder and click its toolbar icon. The extension popup now includes a **Scan with phone** QR code and a **Large QR code** button.

1. Open the computer's QR page (or the extension popup) on the computer screen.
2. Scan the QR using your phone's camera. It opens your computer's phone-controller address, e.g. `http://192.168.150.218:8765/`.
3. On your phone, enter the **8-digit pairing code** shown in the computer's terminal. The QR does **not** include this secret code.
4. Choose **Desktop keyboard** for Google Docs, or **Web form** for regular editable fields, and start typing as usual.

If the page shows multiple addresses, prefer **Wi-Fi**. The other addresses can belong to VirtualBox or other virtual adapters and may not work on the phone. Your computer and phone must be on the same trusted private Wi-Fi, with TCP port 8765 permitted through the Windows firewall.

### To show the QR inside the Chrome extension popup

The installed older Chrome extension continues to work with the new server, but its popup won't display the QR until you upgrade the extension. Remove the old **Phone Type Remote** entry at `chrome://extensions`, then use **Load unpacked** to select the new `extension` folder from this ZIP. You will need to reconnect with the server's current pairing code. **Do not keep two copies enabled.**

This QR is for opening the **phone controller**, not for installing a Chrome extension on the phone. The Chrome extension runs on your computer.
