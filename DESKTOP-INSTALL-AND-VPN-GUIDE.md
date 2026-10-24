# TERRAVEX APEX desktop install + VPN control

## Important distinction

The website is a PWA; Chrome/Edge can install it as a desktop app when served from HTTPS (for example, GitHub Pages). A PWA alone cannot operate the Windows VPN client. This package therefore includes a separate **local VPN bridge**. The bridge binds only to `127.0.0.1:8765`, requires a freshly generated bearer token, allows only configured exact web origins, and exposes only `status`, `on`, and `off` actions for one preconfigured backend.

The bridge controls the VPN app already installed/configured on your own computer. It does not provide satellite internet service, a VPN subscription/server, or Russian satellite access.

## A. Install TERRAVEX APEX on Windows desktop

1. Upload all web files and the `assets/` directory to the root of the GitHub Pages repository. Do not upload this ZIP as a nested folder.
2. In GitHub repository settings, enable **Settings → Pages → Deploy from a branch → main → /(root)**.
3. Open the HTTPS Pages URL in current Chrome or Microsoft Edge.
4. Open **Source Health & Offline System → Install app**. If the install prompt is not available, use the browser menu (`⋮`) → **Install TERRAVEX APEX** or **Apps → Install this site as an app**. Menu wording varies by browser.
5. Open the installed app once while online so the service worker can cache the local application shell. Live data still requires network access.

PWA install requires HTTPS or localhost and suitable manifest/icon support. The generated `icon-192.png` and `icon-512.png` are included for Chromium PWA requirements.

## B. Configure the local VPN bridge

1. Install and authenticate your chosen VPN client first. Supported control backends are **Tailscale CLI** or a **pre-installed WireGuard for Windows tunnel service**.
2. Copy `vpn-bridge-config.example.json` to `vpn-bridge-config.json` (the Windows launcher does this automatically if the config is missing).
3. Confirm `allowed_origins` contains the exact origin of your installed app, such as `https://YOUR-USERNAME.github.io`. An origin contains scheme + hostname only, not the repository path. Do not use `*`.
4. For Tailscale, leave `backend` as `tailscale`. The helper detects the CLI on PATH or common Windows install paths. Authenticate the client before use.
5. For WireGuard, set `backend` to `wireguard` and `wireguard_tunnel_name` to the existing installed tunnel's service name, without `.conf`. The tunnel must already be installed using the official WireGuard app. No tunnel config/private key is included or uploaded by this app.
6. Double-click `Start-VPN-Bridge-Windows.bat`. A console will display a new one-run pairing token. Keep this window open while using the app. The token changes each time the helper restarts.
7. If Windows refuses WireGuard service control, close the helper. Only if you trust this local project and want to grant it elevated VPN control, start the batch file with **Run as administrator**. Never run an unknown helper elevated.
8. In the installed TERRAVEX app, open **VPN Control & Desktop Install**, enter `http://127.0.0.1:8765` and paste the pairing token from the helper console. Click **Connect local bridge**, then **Refresh status**.
9. Use **VPN ON** or **VPN OFF**. Each action requires a confirmation dialog. After the action the app queries the native client/service again. Current Chromium versions may show a Local Network Access / loopback permission prompt because the HTTPS app talks to a helper on your own computer. Allow it only for your own trusted app; the helper does not rely on deprecated Private Network Access preflight behavior.
10. To disconnect the bridge, close its console or press `Ctrl+C`. To clear the browser token, press **Clear token** or close/reload the app.

## Backend behavior

- **Tailscale:** the helper calls fixed `tailscale up`, `tailscale down`, and `tailscale status --json` commands. It never takes a command/path from the browser.
- **WireGuard for Windows:** the helper queries/starts/stops only `WireGuardTunnel$<configured tunnel name>` via Windows Service Control Manager. It never accepts tunnel names from web requests.
- A reported connected state means the native client/service reports running; it does not prove the remote server, all routes, satellite carrier, or emergency service is reachable. Use a separately authorized HTTPS health endpoint for end-to-end verification.
- Running VPN ON/OFF can interrupt current network access or alter routing. Do not toggle it in the middle of an emergency call or critical download.

## Security model and limits

- Localhost bind only: `127.0.0.1`; not exposed on Wi-Fi/LAN.
- Exact Origin allow-list, Host validation, per-run random token, constant-time token comparison, bounded JSON body, rateable fixed operations, no shell expansion, no arbitrary command endpoint.
- Token is not stored by the web app; paste it per browser session.
- Do not commit `vpn-bridge-config.json` if you customize it, and never include VPN profiles, passwords, keys, or tokens in GitHub.
- A public PWA site isn't private just because its source repository is private. Use actual server-side identity access control for restricted pages/data.
- The local bridge is source code, not a signed binary. Review it before running. Python 3.10+ is recommended.

## Troubleshooting

- `LOCAL HELPER OFFLINE`: start the batch file; verify that the console says it's listening on `127.0.0.1:8765`.
- `ORIGIN NOT ALLOWED`: edit `allowed_origins` to include your app's exact HTTPS origin, save, and restart the helper.
- Browser blocks local request: in Chrome/Edge on current versions, check the site permission for Local Network Access / loopback access and allow it only for your own app; ensure `http://127.0.0.1:8765` is not blocked by endpoint security. This requires a secure HTTPS app origin. Keep the token.
- `Tailscale CLI not found`: install Tailscale, open it once, authenticate, and retry.
- `WireGuard service not found`: configure the exact existing installed tunnel name, not a config filename path; make sure it was installed through WireGuard for Windows.
- `Access denied`: Windows may require an elevated helper for service control. Only elevate the trusted local script when you intend to grant this capability.
- If native status is `UNVERIFIED`, do not treat the tunnel as connected. Use the VPN client itself to inspect diagnostics.
