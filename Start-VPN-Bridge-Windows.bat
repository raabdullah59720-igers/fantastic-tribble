@echo off
setlocal
cd /d "%~dp0"
title TERRAVEX APEX Local VPN Bridge
if not exist "vpn-bridge-config.json" (
  copy /Y "vpn-bridge-config.example.json" "vpn-bridge-config.json" >nul
  echo Created vpn-bridge-config.json from the example.
  echo Review backend and allowed_origins before using the control panel.
)
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 vpn-bridge.py --config vpn-bridge-config.json
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    python vpn-bridge.py --config vpn-bridge-config.json
  ) else (
    echo Python 3 is not installed or not on PATH.
    echo Install Python from https://www.python.org/downloads/windows/
    pause
    exit /b 1
  )
)
echo.
echo Bridge stopped. This window can be closed.
pause
