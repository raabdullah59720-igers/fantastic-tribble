# TERRAVEX APEX Desktop PWA + VPN Control Upgrade — QA Report

## Package inventory
- Deliverable: `TERRAVEX-APEX-DESKTOP-VPN-PWA-UPGRADE.zip`
- Source: previous TERRAVEX APEX Secure Satellite & VPN app bundle, with the previous feature set retained.
- Files before ZIP: 46 (maximum allowed: 98).
- JavaScript syntax checks: all root `.js` files.
- CSS parsing: all 11 root stylesheets.
- Entry point: `index.html` at archive root.

## Checks performed
- `node --check` on all root JavaScript files: PASS.
- Python syntax compilation for `vpn-bridge.py` and `test_vpn_bridge.py`: PASS.
- Local bridge automated tests: 6/6 PASS. Tests use a fake Tailscale CLI; they do not operate a real VPN.
- Bridge security tests: bearer token required, exact Origin allow-list, invalid origin rejected, arbitrary actions rejected, fixed ON/OFF actions verified against fake CLI.
- HTML structure: PASS; 27 page sections match 27 navigation entries, 525 IDs with no duplicates, no missing local file references.
- CSS parsing: PASS; 11 stylesheets, no parser errors found.
- PWA manifest: PASS; `display=standalone`, relative start URL, icon-192.png (192×192), icon-512.png (512×512), SVG icon present.
- Service-worker shell: PASS; cache version v6, 38 precache paths checked and none missing.
- Secrets/config: no actual `vpn-bridge-config.json`, VPN profile, private key or pairing token is included; `.gitignore` excludes a locally generated config.
- Final ZIP integrity and exact file count checked after packaging.

## Checks not completed
- No real Tailscale client or Windows WireGuard tunnel was available in this environment; native VPN switching was verified only with a fake CLI. The helper has not been run on the user's Windows computer.
- Automated browser navigation was blocked by this execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR` for localhost and file navigation), so a full end-to-end browser UI test could not be completed here.
- The user's GitHub Pages deployment and Chrome/Edge install prompt were not run against the user's repository.
- No satellite service, VPN server, account, subscription or satellite terminal connection is supplied.

## Implementation & safety notes
- The PWA is designed to install on supported desktop browsers over HTTPS and caches the local app shell, not remote live feeds.
- VPN ON/OFF controls become available only after the user starts the companion desktop helper and pairs with the per-run token printed in its console.
- The helper binds only to `127.0.0.1:8765`, uses an exact Origin allow-list and Host validation, requires a random bearer token for status/control, caps request body size, and accepts only fixed `on` / `off` operations. It has no arbitrary command endpoint and accepts no tunnel name supplied by the browser.
- Tailscale control uses its CLI. WireGuard control supports one already-installed WireGuard for Windows tunnel service configured locally. Windows service permissions may require intentional manual elevation.
- Current Chromium versions may show a Local Network Access / loopback permission prompt for a public HTTPS app connecting to localhost. Grant it only to the trusted app.
- A native client state of CONNECTED is not proof of the remote route, satellite carrier, encryption configuration, or emergency-service reachability. Use the VPN client's official diagnostics and a separate authorized endpoint for end-to-end checks.
