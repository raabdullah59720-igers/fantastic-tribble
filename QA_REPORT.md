# TERRAVEX APEX Install + Password Lock QA Report

Build: Install-ready PWA and local desktop launcher upgrade (cache v8)

## Static checks performed in this environment

- ZIP source extracted and checked with `zipfile.testzip()` before editing; final ZIP is rebuilt and integrity-checked before delivery.
- Node.js `--check` run against all 14 local `.js` files: no syntax errors.
- `tinycss2` parsed all 12 local `.css` files: no parser errors.
- HTML parsed with BeautifulSoup: 539 IDs, 0 duplicate IDs.
- All local `script`, `link`, and image references in `index.html` resolve to files in the package.
- Manifest JSON parses; `name`, `short_name`, `start_url`, `scope`, `standalone`, and 192x192 / 512x512 icon declarations are present.
- Service worker uses cache `terravex-apex-shell-v8`; 31 required shell assets are present in the package.
- Python syntax parsed for the VPN bridge/test and QA helper.
- Existing VPN bridge unit tests using a fake VPN CLI: 6/6 pass.
- Desktop shortcut installer and local launcher file references are present.

## Install and app-lock changes

- `pwa-install.js` loaded early to capture `beforeinstallprompt` when Chromium emits it; native install still depends on browser policy and installability.
- `Refresh cached app shell` control now runs service-worker update/cache verification from `advanced-workbench.js`.
- PWA diagnostics check cache v8 and verify the password lock files are cached.
- Startup screen blocks the visible app until device password creation/unlock.
- Password minimum 10 characters; confirmation required at setup; show/hide toggle; manual lock button; 5 failed attempts cause a short UI throttle.
- Password record uses a random 16-byte salt and PBKDF2-HMAC-SHA-256 with 310,000 iterations; only salt/hash/metadata are stored in localStorage. Plaintext password is not written to storage.
- Password is per browser storage and origin. Localhost and GitHub Pages have separate local locks.
- Added Windows shortcut creation and a launcher that serves only on `127.0.0.1:8000` and opens Chrome/Edge in app-style mode where found.
- Static server now uses `no-cache` for HTML, JS, CSS and manifest so local update troubleshooting is not held back by a one-hour browser cache.

## Environment blockers / unverified checks

- Attempted Playwright/Chromium navigation to `http://127.0.0.1:8000/`; this environment returns `ERR_BLOCKED_BY_ADMINISTRATOR`, so DOM interaction and browser-native installation prompt could not be executed here.
- Windows PowerShell/COM desktop shortcut creation cannot be executed in this Linux runtime. The `.ps1`/`.bat` assets are included, but final validation on Windows remains necessary.
- A PWA install prompt cannot be forced by website JavaScript. If `beforeinstallprompt` is not supplied, the app provides Chrome/Edge menu steps and a Windows desktop shortcut fallback. This is not falsely reported as a successful native PWA install.
- GitHub Pages deployment and live external APIs were not tested during this build.

## Security limit

The device password is a client-side UI lock, not server-side authorization. A public static GitHub Pages site still exposes its static source/assets; a determined visitor can bypass a client-only gate. Use server-side authentication or an identity access gateway for genuine website-wide restriction. No secrets should be placed in the repository.
