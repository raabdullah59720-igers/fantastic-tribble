# TERRAVEX APEX

Static GitHub Pages web app for Earth intelligence, disaster monitoring, satellite orbit visualization, scientific scenario calculators, IGERS energy research, desktop PWA installation, local device password lock and optional local VPN bridge.

## Fastest Windows start

- For a local browser session: extract the full ZIP and double-click `START-TERRAVEX-WEB-APP.bat`.
- For a desktop shortcut: double-click `INSTALL-TERRAVEX-DESKTOP.bat` once, then open the **TERRAVEX APEX** icon on your desktop. This starts a loopback-only local server and opens an app-style Chrome/Edge window where available.
- For a browser-registered PWA: publish the full folder to the root of GitHub Pages, open the HTTPS URL, then use **Install App** or the browser's `Install page as app` menu.

## App lock

First launch asks you to create a password (minimum 10 characters). A salted PBKDF2-SHA-256 verifier is saved in this origin's local browser storage, never the plaintext password. The same origin asks for the password again after each new app launch. The local URL and GitHub Pages URL have separate browser storage and therefore separate locks.

This is a client-side/device-level interface lock only. It does not secure public source files, API routes, or static assets. For genuine private deployment, use server-side authentication or an identity-aware access gateway. Do not commit credentials, VPN keys, local bridge tokens, location history or emergency contact records.

## Architecture and data integrity

- `index.html`, CSS and JavaScript run on static hosting; no public backend secrets are embedded.
- `sw.js` caches the local application shell only and does not label cached external feeds as live.
- `password-lock.js` hashes passwords with a per-device random salt and Web Crypto PBKDF2-SHA-256.
- `pwa-install.js` uses the browser installation event when available and provides browser-menu guidance otherwise.
- `INSTALL-TERRAVEX-DESKTOP.bat` creates a local Windows shortcut. This app-style shortcut is a fallback and is distinct from a browser-registered PWA.
- `START-VPN-Bridge-Windows.bat` and `vpn-bridge.py` are separate, opt-in local VPN controls; install/configure a VPN client first.
- External datasets, geospatial images, weather model data, and published earthquake records have their own source timestamps and limitations. Simulations are not field measurements.

## GitHub Pages deployment

Upload all files and `assets/` to the repository root. In **Settings → Pages**, choose **Deploy from a branch**, `main`, and `/(root)`. Open the HTTPS Pages URL after deployment. Do not upload just the ZIP archive and expect the site to run.

See `PWA-INSTALL-NOW.md`, `DESKTOP-INSTALL-AND-VPN-GUIDE.md`, `SECURITY-DEPLOYMENT.md`, `INSTALL-IN-GITHUB.txt`, and `QA_REPORT.md` for more details.
