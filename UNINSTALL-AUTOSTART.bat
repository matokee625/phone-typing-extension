@echo off
title Remove Phone Type Remote Autostart
set "SHORTCUT_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PhoneTypeRemote.lnk"

echo ========================================================
echo     Phone Type Remote - Remove Autostart Setup
echo ========================================================
echo.

if exist "%SHORTCUT_PATH%" (
    del "%SHORTCUT_PATH%"
    echo [SUCCESS] Removed startup shortcut from Windows Startup.
) else (
    echo [INFO] No autostart shortcut found in Windows Startup.
)

echo.
pause
