# TERRAVEX APEX: install on Windows desktop

## Recommended: actual Chrome/Edge PWA

**This release fixes the address-bar issue:** the `beforeinstallprompt` handler no longer calls `preventDefault()`, which previously suppressed the browser-native Install UI. Chrome/Edge can now show its own Install icon when the site meets its criteria.

1. Publish every file in this folder, including `assets/`, to the root of your GitHub Pages repository.
2. Open the resulting **HTTPS** Pages URL in Chrome or Edge. Do not use the ChatGPT sandbox download URL and do not double-click `index.html`.
3. Keep the app open online long enough for the service worker to install and the app shell to cache. The current service-worker shell cache is `terravex-apex-shell-v36`.
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

The installed app retains the Ozone & Atmosphere, Solar Activity & Magnetosphere, and Near-Earth Object panels as well as Space Communications. The app-shell cache is `terravex-apex-shell-v36`.

For **asynchronous internet voice mail between TERRAVEX users on different devices**, deploy `relay-server/` publicly using `render.yaml`, set `ALLOWED_ORIGINS` to the exact HTTPS app origin, and enter the deployed `wss://` URL in Space Communications. Local launcher mode binds to `127.0.0.1` and is same-computer only. The mailbox encrypts audio/metadata in the sender's browser and stores only ciphertext in relay memory for up to 24 hours; restart can erase messages. It is not emergency-grade and does not deliver to a spacecraft or Russian satellite. See `SPACE-COMMS-REAL-VOICE-MAIL.md` and `relay-server/README.md`.


## Earth Traffic 3D Monitor (current cache v29)

The new **Space & Atmosphere → Earth Traffic 3D Monitor** combines CelesTrak orbital elements propagated by Satellite.js with optional OpenSky aircraft state vectors. Click **Load / update orbital data** for public orbital-element groups, then choose a geographic aircraft region and press **Refresh aircraft feed**. Aircraft auto-refresh is opt-in for bounded regions only; global auto-refresh is disabled to conserve API credits.

The Three.js WebGL scene may require internet for the CDN and Earth textures. If unavailable, the panel falls back to a schematic 2D canvas and reports degraded renderer/data status. Satellite positions are model-propagated from the displayed element epoch; aircraft positions are provider snapshots, not extrapolated predictions. See `EARTH-TRAFFIC-3D-MONITOR.md` for methodology and limitations.


## v35 update — 3D launch and Russian public weather imagery
- Added visible 3D launch controls in the overview and Bangladesh Radiological Safety panel. Direct route: `?page=radiologicalsafety`.
- CesiumJS globe now starts independently of DGHS district GIS success. If the primary Cesium CDN is unavailable, the panel attempts a pinned jsDelivr CesiumJS fallback; imagery tiles try Esri first and OpenStreetMap second.
- Added a user-launched public weather imagery view of the official Russian Elektro-L meteorological portal (`https://electro.ntsomz.ru/en/`) with a direct-open fallback. Its page is titled “Earth in the last twenty-four hours”; the page snapshot inspected on 6 November 2026 displayed entries dated 25–26 October 2026, so freshness is not guaranteed. Verify the newest capture timestamp. This safety panel omits high-resolution EO scene ordering, tasking, target imaging and spacecraft control.
- This is public weather/Earth-observation imagery access, not a direct satellite command/uplink, not a continuous video stream, and not target or person surveillance. Cross-origin iframe load does not prove image pixels or capture time; verify inside the official viewer.
- Service-worker cache: `terravex-apex-shell-v36`.


## v36 cache refresh
- Latest shell cache: `terravex-apex-shell-v36`. After upload, open the HTTPS GitHub Pages URL, perform `Ctrl+Shift+R`, then refresh the cached shell from Source Health & Offline System if the PWA is installed.
- Launch the Bangladesh Radiological Safety Centre using `?page=radiologicalsafety`; press **Launch 3D + Russian Weather View**.
- A 3D engine running does not itself mean satellite imagery loaded. Look for `ESRI TILE RECEIVED` or `OSM TILE RECEIVED`; otherwise the panel displays a degraded tile state.


## v37 same-globe mobility overlays
- Current cache: `terravex-apex-shell-v38`. After upload, hard refresh the HTTPS Pages URL and refresh the shell if installed as a PWA.
- Open `?page=earthcommand`. Air Activity Density uses the existing OpenSky Bangladesh snapshot; request that snapshot first. Road, Maritime and Authorized Drone layers need an authorized HTTPS aggregate GeoJSON endpoint from your own backend.
- Provider response requirements are listed in `DATA_SOURCES.md`. No raw identifiers or per-object tracks are accepted. Data age and source are shown; unconfigured feeds remain disconnected.

## v37 — Same-globe civilian mobility overlays

The current shell cache is `terravex-apex-shell-v38`. The mobility overlay adds no new files and stays inside the existing Live 3D Earth panel at `?page=earthcommand`. Hard-refresh once after GitHub Pages deploy, then refresh the installed PWA shell if necessary. Air density requires a successful manual OpenSky snapshot. Road/maritime/drone layers require approved aggregate-only HTTPS GeoJSON endpoints and will remain unconfigured until supplied. The globe's 1 Hz render loop is not a 1 Hz data feed.


## v38 marine safety layer
Open Live 3D Earth. The Bay of Bengal marine safety layer requests Open-Meteo marine model data automatically on panel entry. Use “Load marine safety layer” to retry. It draws broad wave/current model cells on the same globe; it does not display ship traffic.


## v38 — Bay of Bengal marine safety layer
Open `?page=earthcommand`; broad marine wave/current model cells are requested automatically on panel entry. Use `Load marine safety layer` to retry. If offline or the provider is unavailable, the card reports the error and does not insert dummy cells. These are weather-model values, not ship traffic or navigation-grade measurements. Current shell: `terravex-apex-shell-v38`.


## v39 shell update
The service worker cache is `terravex-apex-shell-v39`. The five civil environmental panels are embedded in the existing `index.html` and use `app.js`; no additional asset files were introduced. If the old interface remains visible after deployment, reload over HTTPS and use Source Health & Offline → Refresh cached app shell. External public data is not cached as live data.


## v40 civil-panel visibility fix
The five civil panels remain inside the original `page-earthcommand` and share the existing single Cesium globe. They now have a visible launch strip near the top of the page, a persistent top-bar `Civil 3D` button, an Overview launch banner, and five per-panel jump buttons. Direct routes: `?page=earthcommand&panel=all|flood|humanitarian|forest|ocean|archive`. These are in-page jumps; they do not create duplicate globe instances. The previous app-shell cache was `terravex-apex-shell-v40`; the v41 release cache was `terravex-apex-shell-v41`. After upload, open the HTTPS Pages root, hard-refresh, then refresh the installed PWA shell if needed.


## v41 — Civil panel visual and render-quality update
The existing five civil panels now show source-driven graphics: river model time-series, coarse humanitarian resource grid, GBIF regional record bars, marine model wave-height bars, and satellite scene preview cards when preview assets are supplied by STAC. Humanitarian public-resource summary is automatically requested when entering Live 3D Earth. The shared Cesium viewer has Balanced / High / Ultra render profiles, capped for device performance. Cache: `terravex-apex-shell-v41`. A source with no data stays in an explicit waiting/offline state; no mock observations are drawn.


## v43 Engineering Studio shortcut and cache
The Engineering Sector is available from the sidebar, persistent top-bar `Engineering` button, Overview launch card and the first PWA install shortcut. Open `?page=engineering`. The calculator updates locally when inputs change and can export a concept-only AutoCAD-compatible DXF, CSV surface allowance schedule and JSON scenario report. Service-worker cache: `terravex-apex-shell-v45`. After GitHub Pages deployment, hard-refresh the HTTPS origin; for an installed PWA use Source Health & Offline → Refresh cached app shell.


### v42: plot the concept on the shared 3D Earth
In Engineering Studio, enter user-authorized/survey-derived latitude and longitude, calculate the concept, then use **Plot concept on shared 3D Earth**. This creates a schematic parcel boundary, one extruded building massing volume and floor-level outlines in the existing Cesium viewer. **Clear Earth concept** removes only those Engineering Studio entities. Direct route: `?page=engineering`. This is not a topographic survey, true BIM model or structural design.


### v43 Engineering Studio report and export controls
The Engineering & Architecture page (`?page=engineering`) now shows its report monitor near the top. If the installed app continues to display an older page, refresh the cached app shell from Source Health & Offline; the current shell is `terravex-apex-shell-v45`. The Engineering Studio requires `advanced-workbench.js` and `advanced-workbench.css` in the local shell. The report download toolbar exports conceptual DXF, SVG, CSV, JSON and printable HTML.


## v45 Engineering Studio auto-design and CAD
Current shell cache: `terravex-apex-shell-v45`. Open `?page=engineering`. Choose only the number of storeys and one of the supported civilian building types; Terravex will calculate an assumed concept parcel, footprint, height, GFA, FAR scenario, functional zoning and non-structural finish allowances. Review the visible auto-assumption summary before exporting. Optional satellite context requires panning the shared 3D Earth to the intended region and explicitly selecting **Use current 3D Earth view centre**.

Download actions: **2D AutoCAD floor plan DXF**, 3D massing DXF, plan SVG, complete JSON report, preliminary finish CSV and HTML safety/design report (Print / Save as PDF). 2D DXF is a schematic typical-floor functional-zone plan, not construction/permit drawing.

Engineering Studio v45 geometry and typology selector is in the Engineering Sector. Refresh the cached app shell after deploying.

Engineering Studio v45 uses cache `terravex-apex-shell-v45`. After GitHub Pages deploy, refresh the cached app shell before testing the new geometry and typology selector.
