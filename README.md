# TERRAVEX APEX

Static GitHub Pages/PWA application for Earth intelligence, Bangladesh satellite observation, disaster monitoring, research calculators, IGERS energy engineering, desktop installation, and opt-in local VPN control.

## Fastest Windows start

1. Extract the complete ZIP to a normal Windows folder.
2. For a browser-based local run, double-click `START-TERRAVEX-WEB-APP.bat`. It serves only on `127.0.0.1:8000` and opens the local app in your browser.
3. For a desktop shortcut, double-click `INSTALL-TERRAVEX-DESKTOP.bat` once, then use the **TERRAVEX APEX** shortcut.
4. For a browser-registered PWA, publish all files and `assets/` to the root of GitHub Pages, open the resulting HTTPS URL in Chrome/Edge, then look for the browser's native **Install** icon beside the address bar. This build deliberately leaves the `beforeinstallprompt` event unprevented, so it does not suppress Chrome's install icon. Use the in-app **Install App** button or browser menu if the icon is absent.

## One-use local VPN pairing

- Install and configure an actual VPN client on your own computer first. The bridge supports Tailscale CLI or an already-installed WireGuard for Windows tunnel.
- Start `Start-VPN-Bridge-Windows.bat`. On that run the helper generates a random pairing token and prints it to the console. The token expires after 10 minutes and can be exchanged once.
- In **VPN Control & Desktop Install**, paste the token and click **Connect local bridge**. A separate random session token is returned for up to 4 hours and kept only in that browser tab's `sessionStorage`. The startup pairing token is not stored in the app.
- Restarting the helper invalidates all sessions and prints a new pairing token. Closing/clearing the app tab may require restarting the helper to pair again.
- Only fixed `status`, `on`, and `off` operations are exposed. The helper binds to `127.0.0.1`, validates exact Origins and Host headers, and never executes arbitrary shell commands.

**No provider/Russian satellite token is created by this project.** The local token only pairs this app to the local bridge. Actual satellite communications require an authorized provider, supported terminal, subscription/service profile, and relevant regulatory approval.

## Emergency Connectivity Link Budget Lab

The new **Emergency Link Budget Lab** uses an SVG RF-path visual and calculates idealized free-space path loss, EIRP, received power and link margin from entered values. It is an engineering estimate, not a live link measurement or a claim of connection to any satellite. It excludes detailed availability engineering such as coded modem sensitivity, rain fade profile, antenna pointing, interference, receiver noise temperature, bandwidth and carrier authorization unless these are represented in the user-entered total losses/sensitivity.

## App lock / privacy

The startup password is a device-level UI lock: a salted PBKDF2-SHA-256 verifier is stored in browser storage; plaintext password is not stored. It does not protect static public files or replace server-side authentication. GitHub Pages remains a static hosting platform; use a real identity gateway/server for restricted access. Do not commit local bridge config, credentials, VPN keys, pairing tokens, coordinates or private records.

## PWA architecture

- `manifest.webmanifest`: app identity, standalone mode, valid 192/512 icons, shortcuts.
- `sw.js`: cache `terravex-apex-shell-v11`; caches local shell assets only and never substitutes cached external feeds as live.
- `pwa-install.js`: uses `beforeinstallprompt` when Chromium provides it and shows browser-menu guidance otherwise.
- `vpn-bridge.py`: loopback-only bridge, one-use 10-minute pairing token, 4-hour session token, origin allow-list, bounded JSON and fixed VPN actions.
- `connectivity-lab.js` / `connectivity-lab.css`: visual RF link budget calculator and connection-readiness model.

## GitHub Pages

Upload all package contents and `assets/` to the repository root. In **Settings → Pages**, select **Deploy from a branch**, branch `main`, folder `/(root)`. Open the HTTPS Pages URL. Do not upload the ZIP inside the repo expecting it to run.

See `PWA-INSTALL-NOW.md`, `DESKTOP-INSTALL-AND-VPN-GUIDE.md`, `SECURITY-DEPLOYMENT.md`, `LINK-BUDGET-LAB.md`, and `QA_REPORT.md`.


## RF Spectrum & Interference Intelligence

The new RF panel is receive-only and non-transmitting. It provides a virtual interference scenario, calculated SNR/idealized Shannon capacity, and local CSV import for authorized receiver/SDR exports (`frequency_mhz,power_dbm`). It does not transmit or jam radio signals, modify an RF device, or confirm a live spectrum without an imported/connected measurement source.

The scenario controls are simulation-only. For suspected harmful interference, preserve receiver logs and contact the radio/service operator or regulator. ITU Radio Regulations prohibit harmful interference and protect safety-of-life services. See https://www.itu.int/en/mediacentre/backgrounders/Pages/radio-interference.aspx and https://btrc.gov.bd/.


See [RF Spectrum & Interference Intelligence](RF-INTERFERENCE-INTELLIGENCE.md) for formula definitions, CSV format, limitations, and the receive-only safety boundary. A dependency-free focused test can be run using `node tests/test-rf-interference-intelligence.cjs`.


## Chrome address-bar installation

The PWA script deliberately leaves `beforeinstallprompt` unprevented so Chromium can show its native Install icon beside the address bar when its installability and browser policy conditions are met. The website cannot force browser chrome to show an icon. If absent, check HTTPS/127.0.0.1 origin, manifest and icon requests, service-worker activation, browser profile installation state and browser policy. Use the top-bar Install App button or browser menu for guidance.
