@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>nul
if %errorlevel% equ 0 (
  start "TERRAVEX Voice Signalling Relay" cmd.exe /k ""%~dp0START-TERRAVEX-VOICE-RELAY.bat""
  timeout /t 3 /nobreak >nul
) else (
  echo Node.js is not installed. The web app will still open, but automatic room pairing requires a deployed relay service or Node.js.
  echo Install Node.js 18+ from https://nodejs.org/ or use the manual WebRTC mode.
  timeout /t 4 /nobreak >nul
)
call "%~dp0START-TERRAVEX-WEB-APP.bat"
endlocal
