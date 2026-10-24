@echo off
setlocal
cd /d "%~dp0"
title TERRAVEX APEX Desktop App
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch-terravex-app.ps1"
endlocal
