# Install TERRAVEX APEX as a desktop web app

## Fastest route on Windows

1. Download `TERRAVEX-APEX-INSTALL-READY.zip` and extract all files to a normal folder.
2. No Python installation is required for PWA installation. Double-click `START-TERRAVEX-WEB-APP.bat`. A PowerShell/.NET local server opens the app at `http://127.0.0.1:8000/`. Keep the terminal window open.
3. In the app, click **Install App**. If the browser does not show an in-page prompt, use the browser's app-install menu.
4. In Microsoft Edge: `… → More tools → Apps → Install this site as an app`; Edge lets you create desktop/taskbar shortcuts. In Chrome, use its `Install page as app` menu option where available.

## Why this works

PWA installation requires a served origin (HTTPS, localhost or loopback), a valid web app manifest, suitable 192px/512px icons and installable app display settings. Opening `index.html` directly as `file://` does not meet the installation-origin requirement. This package has `manifest.webmanifest`, `sw.js`, `pwa-install.js`, icons, and a service-worker readiness panel.

## If install still does not appear

- Ensure the URL is `http://127.0.0.1:8000/` or your HTTPS GitHub Pages URL.
- In Source Health & PWA, look for `PWA READY` and `ACTIVE` shell-cache status.
- Click `Refresh cached app shell`, then reload once.
- In Chrome/Edge DevTools Application, inspect Manifest and Service Workers; look for 404s in Network.
- If port 8000 is already in use, close the other local server, then run the launcher again.
- If the app was previously installed from a different URL, this is a different origin and browser treats it as a separate app.

## Local server security

`serve_terravex.ps1` binds a small .NET TCP server to `127.0.0.1` only, disables directory listing, and denies direct web requests for script files, batch files, JSON config, key, certificate, archive and PDF files. It is intended for local installation/testing, not as a public web server. The PWA can still fetch remote public feeds while internet is available. Python 3 is required only for the separate local VPN bridge, not for PWA installation.

## GitHub Pages route

Upload the contents of the extracted folder (not the ZIP itself) to the repository root and configure Settings → Pages → Deploy from a branch → `main` → `/(root)`. Open the resulting HTTPS URL, not a source-file preview URL.
