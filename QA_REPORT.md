# TERRAVEX APEX · PWA Install-Ready Build QA

## Package inventory

- Deliverable files: **50** (including one `assets/` directory with four WebP visuals).
- Entry point: `index.html` at ZIP root.
- Manifest: `manifest.webmanifest`.
- Service worker: `sw.js`, cache version `terravex-apex-shell-v7`.
- Early install UI/event handler: `pwa-install.js`.
- Windows local installer launcher: `START-TERRAVEX-WEB-APP.bat`.
- Loopback-only static server: `serve_terravex.ps1`.

## Checks actually performed

| Check | Result | Detail |
|---|---|---|
| JavaScript syntax | PASS | Node `--check` completed for all 13 `.js` files. |
| CSS parse | PASS | `tinycss2` parsed 11 stylesheets with no parser errors. |
| HTML structure | PASS | Parsed the main page; 27 page sections and 27 navigation controls found. |
| Duplicate HTML IDs | PASS | No duplicate IDs found. |
| Local HTML references | PASS | No missing local script, stylesheet, icon or image `src`/`href` reference found. |
| Web app manifest | PASS | JSON parses; name, `start_url`, `scope`, standalone display and install metadata exist. |
| Install icons | PASS | `icon-192.png` is 192×192; `icon-512.png` is 512×512. |
| Service worker shell list | PASS | All 29 required local shell assets exist in the package. Optional assets are cached best-effort and cannot block installation. |
| PWA install flow | Static PASS | A separate early-loaded `beforeinstallprompt` listener captures the prompt; the global and health-panel buttons share one install handler. Browser-menu fallback is provided. |
| Shortcut routes | Static PASS | `?page=quake`, `?page=location` and `?page=stormwatch` are routed to their navigation pages. |
| VPN bridge regression | PASS | `python test_vpn_bridge.py`: 6 tests passed (fake VPN CLI only). |
| ZIP integrity | PASS (checked during final packaging) | The final archive is reopened and `ZipFile.testzip()` returns `None`. |

## Why installation may previously have failed

PWA installation does not work from a ZIP preview or directly opened `file://.../index.html`. A browser needs an installable origin: normally HTTPS, or a development loopback origin such as `http://127.0.0.1`. The package now contains a Windows launcher that serves the app on `127.0.0.1:8000` and opens it in the browser. The app displays the browser-specific install-menu steps if no `beforeinstallprompt` event is offered.

The `beforeinstallprompt` event is browser-specific and not guaranteed. The supported fallback is to use the browser's own “Install app / Install this site as an app” menu.

## Local Windows launcher security notes

- `serve_terravex.ps1` binds to `127.0.0.1` only; it does not listen on the LAN.
- Directory listing is disabled.
- Direct requests for `.py`, `.bat`, `.ps1`, `.json`, `.zip`, `.pdf`, private-key-like files and hidden paths are blocked.
- The local server is intended only for local app installation/testing, not public hosting.
- Python is not required to install the PWA; it remains required only if the user chooses to run the optional VPN bridge.

## Checks not performed / limitations

- A real browser installation run could not be completed in this build environment: Chromium navigation to both localhost and local file URLs returned `ERR_BLOCKED_BY_ADMINISTRATOR`. This is an environment restriction, not a successful PWA install test.
- The Windows PowerShell/TCP launcher was statically reviewed but could not be executed in this Linux build environment.
- The `beforeinstallprompt` event, Chrome/Edge install UI, and final desktop shortcut creation require testing on the user's Windows Chrome/Edge installation.
- GitHub Pages publishing and public network API availability were not tested here.
- The local PWA and the GitHub Pages PWA have different origins and are installed as separate browser apps.

## Repeatable user-side verification

1. Extract the entire ZIP to a writable folder.
2. Double-click `START-TERRAVEX-WEB-APP.bat`; keep the terminal window open.
3. Confirm the browser URL is `http://127.0.0.1:8000/`, not `file://`.
4. Open **Source Health & Offline System** and confirm `PWA READY` plus `ACTIVE` shell-cache status.
5. Click **Install App**. If the in-app prompt is not available, use Edge `… → More tools → Apps → Install this site as an app` or Chrome's available “Install page as app” menu option.
6. After installation, close/reopen the app from the desktop shortcut. Test live feeds while online; offline mode only guarantees best-effort local shell caching.
