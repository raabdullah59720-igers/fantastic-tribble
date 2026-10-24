@echo off
setlocal
cd /d "%~dp0relay-server"
title TERRAVEX One-Room Voice Signalling + Encrypted Mail Relay
where node.exe >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js 18 or newer is required for voice relay and temporary encrypted mailbox.
  echo Install from https://nodejs.org/ then run this file again.
  echo Local voice recording/download remains available without Node.js.
  pause
  exit /b 1
)
set "HOST=127.0.0.1"
set "PORT=8787"
set "ALLOWED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000"
echo Starting dependency-free relay. No npm package download is required.
node server.js
pause
endlocal
