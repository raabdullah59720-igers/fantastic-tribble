@echo off
setlocal
cd /d "%~dp0"
title Install TERRAVEX APEX Desktop Shortcut
where powershell.exe >nul 2>nul
if %errorlevel% neq 0 (
  echo Windows PowerShell was not found.
  pause
  exit /b 1
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-desktop-shortcut.ps1"
if %errorlevel% neq 0 pause
endlocal
