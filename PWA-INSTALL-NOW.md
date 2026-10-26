# TERRAVEX APEX: install on Windows desktop

## Recommended: actual Chrome/Edge PWA

**This release fixes the address-bar issue:** the `beforeinstallprompt` handler no longer calls `preventDefault()`, which previously suppressed the browser-native Install UI. Chrome/Edge can now show its own Install icon when the site meets its criteria.

1. Publish every file in this folder, including `assets/`, to the root of your GitHub Pages repository.
2. Open the resulting **HTTPS** Pages URL in Chrome or Edge. Do not use the ChatGPT sandbox download URL and do not double-click `index.html`.
3. Keep the app open online long enough for the service worker to install and the app shell to cache. The current service-worker shell cache is `terravex-apex-shell-v18`.
4. Look for Chrome’s **Install** icon at the right side of the address bar. The app no longer suppresses the browser-native install UI. If the icon is absent, click the top-bar **Install App** button for diagnostics, then use Chrome’s menu: **⋮ → Cast, save and share → Install page as app**. In Edge use **⋯ → Apps → Install this site as an app**. Browser wording varies by version and policy.
5. If the install command is missing, open DevTools → **Application** → **Manifest** and **Service Workers**. Check the manifest and any console/network errors. Also check if the app is already installed in the same browser profile or if browser policy disables installation.

## Local app-style window fallback

1. Extract the complete ZIP to a normal folder on Windows.
2. Double-click `INSTALL-TERRAVEX-DESKTOP.bat` once to create a desktop shortcut.
3. Double-click the new **TERRAVEX APEX** desktop shortcut. It starts a local-only server on `127.0.0.1:8000`, then opens an app-style Chrome/Edge window if the browser is installed.
4. Keep the minimized PowerShell server window open while using the app. Closing it stops the local app server. This shortcut fallback is not the same as a browser-registered PWA; for that, use the HTTPS install steps above.

The original `START-TERRAVEX-WEB-APP.bat` remains available to open the local site in the default browser.

## Password lock

On the first launch for a given origin/browser storage, create a password of at least 10 characters and confirm it. The password itself is not stored; a salted PBKDF2-SHA-256 verifier is saved in browser local storage. On future launches of the **same origin** the app asks for that password again. `http://127.0.0.1:8000` and your GitHub Pages HTTPS URL have different storage, so they use separate passwords.

If you forget it, the local verifier cannot be recovered. Clear this app's site data for that specific origin to start over, then create a new password.

**Security limit:** This static app lock is a device-level privacy curtain, not real website access control. GitHub Pages still serves public HTML/JavaScript and a determined visitor can bypass client-side checks. For confidential website-wide access, use server-side authentication or an identity access gateway, and do not publish private API keys, GPS records, VPN keys or emergency contacts in the repository.

## Troubleshooting

- **No Install button/prompt:** make sure the URL is HTTPS or `http://127.0.0.1`, the manifest and icon files return HTTP 200, the service worker is active, and no browser policy blocks installs. A website cannot make Chrome display its native install dialog by force.
- **App is blank/old:** reload once online, open **Source Health & PWA**, click **Refresh cached app shell**, then reload again. If needed clear this origin's site data/service worker and revisit the current deployment.
- **VPN button disabled:** the native VPN client and local bridge must be configured and running separately. The PWA alone cannot switch Windows VPNs.
- **Offline:** cached UI may open after first successful load; satellite tiles, weather feeds, earthquake feeds, public APIs, and VPN connectivity still require their services/network.

## Local VPN pairing update

The local bridge now prints a random **one-use pairing token** on each startup. It expires after 10 minutes and works only once to obtain a separate 4-hour browser-tab session token. Paste the startup token into **VPN Control & Desktop Install**. If it was consumed already, restart `Start-VPN-Bridge-Windows.bat` for a new one. This token is local to your computer; it is not a Russian satellite provider token.


## Why the address-bar icon may be absent

Chrome owns this icon and does not let a website force it to appear. The app must be on HTTPS or `http://127.0.0.1`, have a valid manifest with `name`/`short_name`, 192px and 512px icons, `start_url`, `scope`, and standalone display mode, and must have no browser policy block. If already installed in this Chrome profile, the install control may be replaced by an app-open control or hidden. Keep the site open and interact with it, reload once after the service worker activates, and inspect DevTools → Application → Manifest / Service Workers if needed.


## Space Communications & Encrypted Voice Mail (retained module)

The installed app retains the Ozone & Atmosphere, Solar Activity & Magnetosphere, and Near-Earth Object panels as well as Space Communications. The app-shell cache is `terravex-apex-shell-v18`.

For **asynchronous internet voice mail between TERRAVEX users on different devices**, deploy `relay-server/` publicly using `render.yaml`, set `ALLOWED_ORIGINS` to the exact HTTPS app origin, and enter the deployed `wss://` URL in Space Communications. Local launcher mode binds to `127.0.0.1` and is same-computer only. The mailbox encrypts audio/metadata in the sender's browser and stores only ciphertext in relay memory for up to 24 hours; restart can erase messages. It is not emergency-grade and does not deliver to a spacecraft or Russian satellite. See `SPACE-COMMS-REAL-VOICE-MAIL.md` and `relay-server/README.md`.


## Earth Traffic 3D Monitor (cache v17)

The new **Space & Atmosphere → Earth Traffic 3D Monitor** combines CelesTrak orbital elements propagated by Satellite.js with optional OpenSky aircraft state vectors. Click **Load / update orbital data** for public orbital-element groups, then choose a geographic aircraft region and press **Refresh aircraft feed**. Aircraft auto-refresh is opt-in for bounded regions only; global auto-refresh is disabled to conserve API credits.

The Three.js WebGL scene may require internet for the CDN and Earth textures. If unavailable, the panel falls back to a schematic 2D canvas and reports degraded renderer/data status. Satellite positions are model-propagated from the displayed element epoch; aircraft positions are provider snapshots, not extrapolated predictions. See `EARTH-TRAFFIC-3D-MONITOR.md` for methodology and limitations.
