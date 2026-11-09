@echo off
title Phone Type Remote - Host & Tunnel
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0HOST-FOR-ME.ps1"
pause
