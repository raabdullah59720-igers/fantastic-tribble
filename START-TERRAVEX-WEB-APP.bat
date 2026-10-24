@echo off
setlocal
cd /d "%~dp0"
title TERRAVEX APEX - Local Web App Installer
where powershell.exe >nul 2>nul
if %errorlevel% neq 0 (
  echo Windows PowerShell was not found. Use GitHub Pages HTTPS instead.
  echo Open the PWA install guide in this folder.
  pause
  exit /b 1
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve_terravex.ps1"
echo.
echo TERRAVEX local server has stopped.
pause
endlocal
