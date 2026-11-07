# TERRAVEX APEX — Consolidated Companion Documentation

**Current package:** v50 99-file GitHub-ready Universal Building / Mansion upgrade (v48 and earlier notes are retained as history)
**Purpose:** Preserve the complete text of 17 previously separate guides, source notes, and release records in one indexed file so the deployable project remains within the 99-file limit.

> **Current deployment authority:** Use the first sections of `README.md` and `DEPLOYMENT_BN.md` for this package. Several archived documents below contain instructions and cache versions from earlier releases. They are retained for technical history, not as the current upload procedure. The current package is a flat root overlay of 99 files; do not create an `earth-command-center/` or `relay-server/` subfolder.

## Contents

- [Desktop installation and local VPN bridge](#desktop-install-and-vpn) (`DESKTOP-INSTALL-AND-VPN-GUIDE.md`)
- [Earth Orbit Sentinel and public SATCAT inventory](#earth-orbit-sentinel) (`EARTH-ORBIT-SENTINEL-UPGRADE-NOTES.md`)
- [Earth Traffic 3D Monitor](#earth-traffic-3d-monitor) (`EARTH-TRAFFIC-3D-MONITOR.md`)
- [GitHub installation guide](#github-install) (`INSTALL-IN-GITHUB.txt`)
- [Emergency Connectivity Link Budget Lab](#link-budget-lab) (`LINK-BUDGET-LAB.md`)
- [PWA installation and cache refresh](#pwa-install) (`PWA-INSTALL-NOW.md`)
- [RF Spectrum and Interference Intelligence](#rf-interference-intelligence) (`RF-INTERFERENCE-INTELLIGENCE.md`)
- [Security and deployment notes](#security-deployment) (`SECURITY-DEPLOYMENT.md`)
- [Space Communications and encrypted voice mail](#space-comms-voice-mail) (`SPACE-COMMS-REAL-VOICE-MAIL.md`)
- [Space Communications relay guide](#space-comms-relay-guide) (`SPACE-COMMS-RELAY-GUIDE.md`)
- [Space and atmosphere modules](#space-environment-modules) (`SPACE-ENVIRONMENT-MODULES.md`)
- [v47 integrated civil engineering release notes](#v47-engineering-release) (`TERRAVEX-v47-ENGINEERING-RELEASE-NOTES.md`)
- [v48 adaptive architecture release notes](#v48-architecture-release) (`TERRAVEX-v48-ARCHITECTURE-FORM-RELEASE-NOTES.md`)
- [v48 architecture form user guide](#v48-architecture-user-guide) (`TERRAVEX-v48-ARCHITECTURE-FORM-USER-GUIDE.md`)
- [Thunderstorm energy lab installation guide](#thunderstorm-install) (`THUNDERSTORM-UPGRADE-INSTALL.txt`)
- [Legacy upload stub (historical only)](#legacy-upload-stub) (`UPLOAD-THIS-FOLDER.txt`)
- [Ozone and space environment research notes](#ozone-watch-research) (`ozone-watch-research.md`)

---

<a id="desktop-install-and-vpn"></a>
## Desktop installation and local VPN bridge

*Consolidated from `DESKTOP-INSTALL-AND-VPN-GUIDE.md`.*

> **Archived guide:** This text is retained to preserve setup details from its release. For the current v50 file count, root layout and cache name, follow `README.md` and `DEPLOYMENT_BN.md`.

# TERRAVEX APEX desktop install + VPN control

## Important distinction

The website is a PWA; Chrome/Edge can install it as a desktop app when served from HTTPS (for example, GitHub Pages). A PWA alone cannot operate the Windows VPN client. This package therefore includes a separate **local VPN bridge**. The bridge binds only to `127.0.0.1:8765`, accepts a freshly generated one-use pairing token for 10 minutes, exchanges it once for a random 4-hour session token, allows only configured exact web origins, and exposes only `status`, `on`, and `off` actions for one preconfigured backend.

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
6. Double-click `Start-VPN-Bridge-Windows.bat`. A console will display a new one-run pairing token. It expires after 10 minutes and can be exchanged only once. The app receives a separate random 4-hour session token stored in the current tab's `sessionStorage`; it is not written to `localStorage` or cookies. Keep the bridge window open while using the app. Restarting the helper invalidates sessions and prints a fresh pairing token.
7. If Windows refuses WireGuard service control, close the helper. Only if you trust this local project and want to grant it elevated VPN control, start the batch file with **Run as administrator**. Never run an unknown helper elevated.
8. In the installed TERRAVEX app, open **VPN Control & Desktop Install**, enter `http://127.0.0.1:8765` and paste the pairing token from the helper console. Click **Connect local bridge**, then **Refresh status**.
9. Use **VPN ON** or **VPN OFF**. Each action requires a confirmation dialog. After the action the app queries the native client/service again. Current Chromium versions may show a Local Network Access / loopback permission prompt because the HTTPS app talks to a helper on your own computer. Allow it only for your own trusted app; the helper does not rely on deprecated Private Network Access preflight behavior.
10. To disconnect the bridge, close its console or press `Ctrl+C`. To clear the session, press **Clear token**. The session persists across reloads in the same tab until expiry; a new browser tab may require a new pairing. Restart the helper to generate a fresh token after the pairing token has been consumed.

## Backend behavior

- **Tailscale:** the helper calls fixed `tailscale up`, `tailscale down`, and `tailscale status --json` commands. It never takes a command/path from the browser.
- **WireGuard for Windows:** the helper queries/starts/stops only `WireGuardTunnel$<configured tunnel name>` via Windows Service Control Manager. It never accepts tunnel names from web requests.
- A reported connected state means the native client/service reports running; it does not prove the remote server, all routes, satellite carrier, or emergency service is reachable. Use a separately authorized HTTPS health endpoint for end-to-end verification.
- Running VPN ON/OFF can interrupt current network access or alter routing. Do not toggle it in the middle of an emergency call or critical download.

## Security model and limits

- Localhost bind only: `127.0.0.1`; not exposed on Wi-Fi/LAN.
- Exact Origin allow-list, Host validation, per-run one-use pairing token (10-minute window), constant-time pairing comparison, random 4-hour session token, exact Origin/Host validation, bounded JSON body, fixed operations, no shell expansion, no arbitrary command endpoint.
- The one-use pairing token is not stored by the web app. A separate short-lived bearer session is stored in `sessionStorage` for this tab only so refreshes remain paired until expiry; clear it from the UI or close the tab to remove the browser-side copy. If the app is compromised by same-origin script injection, any active tab session could still be exposed, so keep the deployment and dependencies trusted.
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

## New Emergency Link Budget Lab

Open **Emergency Link Budget Lab** to calculate FSPL, EIRP, estimated receive power and link margin with animated RF path graphics. The default values are examples, not an actual satellite connection. See `TERRAVEX-COMPANION-DOCUMENTATION.md#link-budget-lab` for equations and engineering limitations. No Russian satellite or provider credential is issued by this app.

---

<a id="earth-orbit-sentinel"></a>
## Earth Orbit Sentinel and public SATCAT inventory

*Consolidated from `EARTH-ORBIT-SENTINEL-UPGRADE-NOTES.md`.*

# Earth Orbit Sentinel and Complete Public SATCAT Inventory

## What is included

- A separate **Earth Orbit Sentinel** panel alongside the existing **Earth Traffic 3D Monitor**.
- Public CelesTrak GP/OMM orbital-element feeds from `ACTIVE`, `LAST-30-DAYS`, `SPECIAL=DECAYING`, and `ANALYST`. Overlapping records are merged by catalogue ID.
- Satellite.js SGP4/SDP4 position calculation from each element set at current UTC time; position propagation is recalculated locally every 15 seconds while monitoring is ON. The clock updates each second.
- Public CelesTrak SATCAT CSV inventory for Earth-orbit catalogue rows, including payloads, rocket bodies, debris, unknown types, and other categories. Search by object name, catalogue ID, international designator, operator, or object type; filter by type and page through results.
- SATCAT record selection opens metadata and reports whether the current GP/OMM set contains a matching element record. When no matching element set exists, no fake orbit or coordinates are drawn.
- A browser-local baseline comparison flags newly seen SATCAT records, unknown-type records, new GP IDs, and provider-listed possible-decay records for review. Browser desktop notifications require permission and the monitoring switch ON.
- Service-worker shell generation `terravex-apex-shell-v22`, so an already-installed PWA can fetch the updated panel and code.

## Data cadence and sources

- CelesTrak GP elements: the provider says current GP data updates every two hours. The app caps GP queries at two hours and stops making further source requests after a non-200 HTTP response. Source data may still be cached or stale.
- SATCAT metadata: CelesTrak says it updates manually once or twice each day. The app caches its inventory for 12 hours and rate-limits the SATCAT fetch attempt accordingly.
- Position clock: 1-second UTC/Dhaka clocks. Local orbit propagation: 15-second cadence while Monitor is ON. These are **local calculations** from orbital elements, not incoming satellite telemetry or 1 Hz spacecraft data.
- Official sources: CelesTrak GP elements at `https://celestrak.org/NORAD/elements/`; SATCAT format at `https://celestrak.org/satcat/satcat-format.php`; SATCAT CSV at `https://celestrak.org/pub/satcat.csv`; usage policy at `https://celestrak.org/usage-policy.php`; Satellite.js SGP4/SDP4 library at `https://github.com/shashwatak/satellite-js`.

## Important boundary

SATCAT is a metadata inventory, not a position sensor. Only records that have compatible public orbital elements can be propagated and plotted. A public-feed catalogue cannot see an object that is absent from all public datasets, and a changed or unknown catalogue entry cannot establish a probe, hostile intent, collision risk, or other threat. Alerts are **review notifications only**. No military surveillance sensor, restricted Space-Track account, spacecraft radio, or satellite uplink is connected. This package does not contact an emergency authority or automatically trigger any external response.

## Validation

Run `python run-static-qa.py`, `node tests/test-earth-traffic-monitor.cjs`, and `python run-space-env-tests.py`. Other retained-module checks are listed in `QA_REPORT.md`. These validate static structure and deterministic helper functions; they do not prove the live CelesTrak feed will be reachable from every browser/network, or that the GitHub Pages deployment has been tested in the user's browser. If public requests fail or CORS blocks them, the panel should report unavailable/degraded rather than invent live values.

---

<a id="earth-traffic-3d-monitor"></a>
## Earth Traffic 3D Monitor

*Consolidated from `EARTH-TRAFFIC-3D-MONITOR.md`.*

# Earth Traffic 3D Monitor

## What this panel shows

The panel combines two different data classes in one interactive globe:

1. **Satellites:** public CelesTrak General Perturbations (GP/OMM) orbital elements for the selected categories are propagated to the current display time using Satellite.js (SGP4/SDP4). The code converts propagated inertial position to Earth-fixed/geodetic latitude, longitude and altitude, then draws the object on the globe. Selected orbit lines are propagated ground tracks, not telemetry tracks. Element epoch and feed age are shown because propagation quality degrades as orbital elements age.
2. **Aircraft:** the optional OpenSky `/states/all` feed supplies aircraft state vectors for the selected geographic bounding box. The panel plots the returned position and source timestamps. It does not invent positions between snapshots or interpolate unreported aircraft into “live” data.

## Accuracy and limitations

- SGP4/SDP4 is a standard propagation model for GP/TLE-style elements. Position accuracy depends on element age, object type, orbital maneuvers, propagation errors and the time standard. The marker is a model-propagated position, **not a direct satellite telemetry fix**.
- Catalogue epoch age is displayed; records missing an epoch or older than 72 hours are flagged for review. “Live” means propagated to the current clock from a public element set, not continuously measured by the satellite.
- Aircraft positions are only as fresh as the state-vector snapshot. The panel displays source time and stale/unavailable status. Public OpenSky access is quota-limited and may be unavailable due to CORS, network policy or provider limits.
- OpenSky anonymous state-vector data has a 10-second time resolution and the `/states/all` endpoint uses API credits. The code estimates credit cost from bounding-box area, disables automatic polling for global scope, throttles repeat calls, and keeps aircraft refresh user-triggered by default. See the official REST documentation before configuring higher-volume use.
- Three.js renders the globe and markers. The orbit altitude radius is intentionally compressed for visibility; numbers in the detail pane use the propagated altitude in kilometres. This visual scale is labelled and is not a physical scale model.
- The default map fallback is a schematic 2D canvas. It may help show marker geography when WebGL or external textures fail, but it is not a true Earth imagery layer. The Three.js Earth texture loads from an external example-texture URL and requires internet access.
- Markers represent only loaded catalog objects with valid propagation, or aircraft states that included valid coordinates. Feed failure does not trigger dummy live markers.
- Browser location is only requested after the user clicks **Use device location**. The app builds a bounded aircraft query around the returned coordinates; it does not send location during satellite propagation.

## Algorithms used

- **Satellite state:** CelesTrak OMM/GP JSON -> `satellite.js` `json2satrec` -> `propagate(date)` (SGP4/SDP4) -> `gstime(date)` -> `eciToGeodetic` -> latitude/longitude/altitude.
- **Orbit visualization:** sample the same propagated orbit at multiple future/past timestamps and transform points to Earth-fixed coordinates for the conceptual ground-track line. Track is periodically rebuilt from the orbital elements.
- **Aircraft:** fetch latest OpenSky state vector snapshot -> validate latitude/longitude/ranges and null values -> apply optional airborne filter -> draw actual returned state coordinates -> mark source timestamp age.
- **Rendering:** Three.js/WebGL globe, atmosphere, cloud layer, graticule, stars, satellite markers and aircraft markers; a simplified canvas renderer is used if WebGL is unavailable.
- **Refresh policy:** public element groups are cached locally for up to two hours. Aircraft snapshots are manual by default; optional regional polling is every 20 minutes. Global polling is disabled due to provider credit cost.

## Run and use

1. Upload all project files and `assets/` to the repository root.
2. Publish via GitHub Pages and open its HTTPS URL, or use the included Windows launcher for a local-only app.
3. Open **Space & Atmosphere -> Earth Traffic 3D Monitor**.
4. Click **Load / update orbital data**. Choose the satellite catalogue categories to display.
5. Choose a bounded aircraft region and click **Refresh aircraft feed**. Global queries cost more credits and may be rate-limited.
6. Optional: click **Use device location** to request browser permission, then refresh the aircraft feed.
7. Inspect the source/epoch age and the selected object's details before interpreting a marker.

## Data sources and documentation

- CelesTrak current GP elements: https://celestrak.org/NORAD/elements/
- CelesTrak GP JSON/OMM formats: https://celestrak.org/NORAD/documentation/gp-data-formats.php
- Satellite.js propagation library: https://github.com/shashwatak/satellite-js
- OpenSky REST API, state vectors and credit/rate limits: https://openskynetwork.github.io/opensky-api/rest.html
- Three.js WebGL renderer: https://threejs.org/docs/pages/WebGLRenderer.html

## Test

Run `node tests/test-earth-traffic-monitor.cjs` and `python run-static-qa.py`. The tests include coordinate-transform checks, mocked propagation, malformed/null state-vector filtering, stale-data diagnostics, PWA asset integration and local-reference validation. They do not verify current public API reachability, satellite observation truth against independent sensors, or a deployed website.


## Earth Orbit Sentinel extension

The separate `Earth Orbit Sentinel` page is integrated within this existing module/file pair to avoid adding files to the package. It fetches public CelesTrak GP/OMM snapshots (Active, Last-30-Days and provider-listed possible decays), merges duplicate object IDs, calculates SGP4/SDP4 geodetic positions, and provides search, object inspection, a procedural orbit globe, a local catalogue-delta alert log and optional browser notifications. The public source records are not spacecraft telemetry.

Upstream GP requests are limited to once per 2-hour window per CelesTrak usage policy. While Monitor is ON, local position propagation updates every 15 seconds, and the panel clock updates every second. Newly seen public catalogue entries and newly provider-flagged potential decays are review alerts only. No public catalogue can prove that all physical objects are tracked or detect an object that does not appear in any connected source.

---

<a id="github-install"></a>
## GitHub installation guide

*Consolidated from `INSTALL-IN-GITHUB.txt`.*

> **Archived guide:** This text is retained to preserve setup details from its release. For the current v50 file count, root layout and cache name, follow `README.md` and `DEPLOYMENT_BN.md`.

TERRAVEX APEX - FULL APP INSTALL GUIDE

1. Back up your GitHub repository first.
2. Download TERRAVEX-APEX-STORM-SEISMIC-OCEAN-ALERT-UPGRADE.zip and extract it.
3. Select every file and the assets folder inside the extracted folder.
4. Upload all of those contents to the ROOT of the terravex-apex repository.
5. Confirm index.html is directly in repository root and not inside a nested project folder.
6. GitHub: Settings > Pages > Deploy from a branch > main > /(root) > Save.
7. Open the published Pages URL and click Bangladesh Observatory and Lightning Nowcast Lab.
8. The core interface runs on static hosting; NASA imagery, map tiles, tectonic boundary data, USGS events and model weather require internet access.

Keep the source timestamp and status labels visible. NASA imagery is date-based, Earthquake events are historical/observed reports, plate arrows are literature references, and simulated graphics are not measurements. This is not an official warning service.

Live Location panel: after upload, open “Live Location” in the Command navigation. Use HTTPS (GitHub Pages) and press “Locate once” or “Start live tracking”; accept the browser prompt. Stop tracking when finished.


ADVANCED WORKBENCH UPGRADE
- Upload all extracted root files and the assets/ folder together. The ZIP has no nested project folder.
- New panels: Air Quality Intelligence, NASA Natural Events, GNSS Geodesy Workbench, Hybrid Energy Planner, and Source Health & Offline System.
- Press Ctrl+K (or Command+K on macOS) to open the command palette.
- For install/offline app-shell support, use GitHub Pages HTTPS. Open once while online and allow the service worker to install; then optionally use the browser's Install/Add to Home Screen command.
- The source health panel only probes endpoints on demand. It does not provide scientific validation or guarantee uptime.


NEW HAZARD PANELS
After deploying, select “Storm & Lightning Watch” for the opt-in forecast model watcher + dated NASA satellite imagery context; “Earthquake Rapid Alerts” then Start alert watcher and enable browser notification permission if needed; or “Bay of Bengal Ocean & Tsunami” for modeled sea level/waves, GEBCO bathymetry and conservative event screening. Open-Meteo and public imagery feeds need internet. Browser notifications require HTTPS permission. The model screeners are not official warnings; follow Bangladesh DDM/BMD or relevant regional warning authorities.


STORM / EARTHQUAKE / OCEAN PANELS (Hazard Intelligence update)
- Storm & Lightning Watch: set a Bangladesh location, press Refresh weather model, then optionally enable browser alerts and check the threshold watcher. It uses Open-Meteo model fields; it is not a measured electric-field sensor or live lightning detection system.
- Earthquake Rapid Alerts: press Fetch current feed, choose the magnitude / region, press Enable notifications, then Start alert watcher. Only newly appearing public USGS catalog records are notified after the initial baseline. The feed may be delayed and is not an earthquake early-warning service.
- Bay of Bengal Ocean & Tsunami Observatory: choose a coastal or offshore point, refresh the marine model, and toggle GEBCO bathymetry. The animated sea surface is model-driven; GEBCO is static gridded seabed context. “Tsunami source screening” is not a tsunami forecast or official warning.
- To receive browser notifications, serve the app over HTTPS (GitHub Pages qualifies), grant permission, keep the web app open, and leave the relevant watcher enabled. This package does not provide a server-side push notification service and cannot guarantee alerts if the tab is closed or the browser is suspended.
- For real tsunami warnings use official bulletins (INCOIS / Bangladesh DDM). Model wave height and sea-level values must not be used for maritime navigation or evacuation decisions. Follow official emergency instructions.


SATELLITE PASS & RUSSIAN ORBITAL WATCH
- Upload every file and the assets/ folder to the repository root. This package adds satellite-pass-tracker.js and satellite-pass-tracker.css; the service worker cache was bumped to v4.
- Open “Satellite Pass & Russian Orbital Watch”. Click “Use device location” to request a device fix (optional) and “Load / update public orbit data” to load CelesTrak groups.
- The satellite.js 6.0.2 library loads from jsDelivr. If the CDN is unreachable, orbit propagation will say unavailable rather than display fabricated positions.
- Satellite data are public orbital elements, not satellite communications/imagery access. Group data are cached for two hours.


SECURE SATELLITE & VPN PANEL
----------------------------
The new navigation item is “Secure Satellite & VPN”. All static files in this folder must be uploaded together. The panel cannot activate an actual satellite terminal or OS VPN. It can test the public Open-Meteo route and a user-authorized HTTPS health endpoint.

Never enter private keys, passwords or API tokens in the panel or repository. A GitHub Pages site is public; a client-side PIN is not access control. Read TERRAVEX-COMPANION-DOCUMENTATION.md#security-deployment before using the app for confidential/emergency operations.

DESKTOP INSTALL + LOCAL VPN CONTROL (NEW)
- Desktop PWA: publish via HTTPS, then use Chrome/Edge menu > Install app or open Source Health & PWA > Install app. Manifest includes icon-192.png and icon-512.png; service-worker shell version is v6.
- VPN ON/OFF is controlled by a separate Windows desktop helper, not by static web JavaScript alone.
- Read TERRAVEX-COMPANION-DOCUMENTATION.md#desktop-install-and-vpn. Run Start-VPN-Bridge-Windows.bat; review vpn-bridge-config.example.json (launcher creates local vpn-bridge-config.json); configure your exact app origin and already-installed Tailscale or WireGuard client.
- Paste the per-run token shown in the helper console into VPN Control & Desktop Install. Chrome/Edge may also ask for Local Network Access / loopback permission; allow only if you trust the app. Use ON/OFF only after reading the confirmation. Keep the helper console open while operating the panel.
- Never upload vpn-bridge-config.json, VPN private keys, passwords or tokens to GitHub. The bridge listens only on 127.0.0.1 and has no arbitrary command endpoint. Native status does not guarantee satellite route or emergency-service availability.

New panel: Operations → RF Spectrum & Interference. The virtual spectrum display is SIMULATED only. To inspect a real authorized receiver capture, import a CSV with frequency_mhz,power_dbm columns. This module is receive-only and has no transmitter/jammer controls.

For RF panel scope, formulas, and a CSV example, see TERRAVEX-COMPANION-DOCUMENTATION.md#rf-interference-intelligence. It is a receive-only monitor/simulator and does not transmit or jam signals.

CHROME ADDRESS-BAR INSTALL (FIXED)
- pwa-install.js intentionally does not call preventDefault() for beforeinstallprompt, so Chrome/Edge native address-bar Install UI remains eligible to appear.
- Open the deployed HTTPS GitHub Pages URL, not the ZIP preview or file:// URL. If the icon is absent, click the app top-bar Install App button for guidance and use the browser menu fallback. A website cannot force Chrome UI to show the icon.
- Service worker cache version: terravex-apex-shell-v38.

Address-bar install fix (historical v16 bug; fixed in current build)
- Previous bug: pwa-install.js cancelled beforeinstallprompt with event.preventDefault(), suppressing the browser-native install affordance. This has been removed from that listener.
- Upload every extracted file and assets/ folder to the repository root, then visit the real HTTPS Pages URL. The browser decides whether/when to show its Install icon.
- If the icon is absent, inspect DevTools > Application > Manifest and Service Workers, check browser policy/already-installed state, refresh the v27 app shell, and try the browser menu fallback.

Space Communications & Encrypted Voice Mail uses the included dependency-free Node.js relay. The relay is not publicly available until you deploy the repository root (root-level `server.js`) to a public Node host. Local mode is same-computer only. The asynchronous mailbox stores AES-GCM ciphertext in process memory for up to 24 hours and is not guaranteed or emergency-grade. It does not send audio to a Russian satellite or an astronaut. See `TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail`.

App-shell cache uses terravex-apex-shell-v38.


EARTH TRAFFIC 3D MONITOR (NEW)
- After deployment, open Space & Atmosphere > Earth Traffic 3D Monitor. Press “Load / update orbital data” for CelesTrak GP/OMM elements; Satellite.js propagates the records into modelled current positions.
- Select an aircraft region and press “Refresh aircraft feed” to request actual OpenSky state vectors. Use a bounded region. Anonymous/global queries use provider credits and may be rate-limited; global automatic polling is disabled.
- “Use device location” asks permission only after you press it and creates a bounded aircraft query region.
- The 3D scene needs external Three.js/texture resources. If WebGL/CDN fails, the page uses a schematic 2D fallback and labels the renderer status.
- Satellite location is propagated from an orbital-element epoch; aircraft location is a provider snapshot. These are not direct satellite telemetry or an air-traffic-control certified display. Read TERRAVEX-COMPANION-DOCUMENTATION.md#earth-traffic-3d-monitor.

Mobile Network Monitor: open Operations > Bangladesh Mobile Network Monitor. Its switch only controls read-only app monitoring, not radio towers.


ATMOSPHERIC ENTRY / EXIT WATCH + OZONE OBSERVATORY (NEW)
- Open Space & Atmosphere > Atmospheric Entry / Exit Watch. This is a separate panel; the existing Ozone & Atmosphere Observatory remains unchanged.
- Press Refresh catalogue to retrieve the public CelesTrak recently-decayed catalogue. The catalogue is updated periodically and covers listed decays from the recent 60-day window; it is not a live radar sensor. New catalogue rows after the first baseline can trigger browser notifications while the app is open, the panel is active, and the optional hourly monitor is enabled.
- Browser notifications require HTTPS and explicit permission. A closed/suspended browser tab cannot be relied on for alerts.
- NASA/JPL fireball observations are provided as an external reference because that dataset is not real-time. The Ozone Watch card opens NASA's official total-column ozone monitoring source; the panel does not invent a current Dobson Unit reading.
- Atmospheric EXIT / ascent events are explicitly marked NOT LIVE because no validated open global feed is integrated for that event class. The Earth/atmosphere graphic is a schematic, not measured tracking. No event is presented as radar-confirmed.
- Data source notes and limitations are documented in DATA_SOURCES.md. This panel is a research/monitoring aid, not an official warning or flight-safety service.
- After replacing the GitHub Pages files, visit the HTTPS site and reload. For an already-installed PWA, open Source Health & PWA > Refresh cached app shell (or close and reopen the app) to apply shell v27.


LIVE 3D EARTH & COMMAND - VISIBILITY FIX (v29)
------------------------------------------------
1. Open TERRAVEX APEX. The top bar now has a permanent "3D Earth" button. The Command Overview page also has a large "Open 3D Earth Command" launch card.
2. The sidebar entry is highlighted as "Live 3D Earth & Command" under COMMAND. On mobile, tap the hamburger menu first or use the always-visible top-bar 3D Earth button.
3. Direct route: add ?page=earthcommand after your GitHub Pages URL.
4. IMPORTANT: GitHub Pages must serve this package's index.html from the published root. Extract the ZIP and upload the files INSIDE fantastic-tribble-main/ to the repository root. Do not upload the ZIP itself and do not create a nested fantastic-tribble-main/fantastic-tribble-main/ directory.
5. After commit/deploy, open the HTTPS Pages URL and press Ctrl+Shift+R once. Service-worker cache is v29 and checks for an update when the app opens. For an old installed PWA, first open the HTTPS Pages URL in Chrome, let it reload, then reopen the installed app.


V32 CIVILIAN SAFETY PANEL
- Open the Bangladesh Radiological Safety & Emergency Centre from the Operations sidebar or Overview launch card.
- Direct route: ?page=radiologicalsafety
- It contains a Cesium 3D Bangladesh globe, a public DGHS district GIS layer, and a Leaflet map for user-selected report points.
- User reports remain in the current browser page session and export to JSON only when the user asks. They are not official measurements or alerts.
- No live radiation sensor, national radiation monitoring, IAEA IRMIS or satellite operator connection is included.
- Current service-worker shell cache: terravex-apex-shell-v38.


v38 service worker cache: terravex-apex-shell-v38. The Bay of Bengal marine safety layer loads broad public marine model conditions, not ship traffic.

---

<a id="link-budget-lab"></a>
## Emergency Connectivity Link Budget Lab

*Consolidated from `LINK-BUDGET-LAB.md`.*

# Emergency Connectivity Link Budget Lab

This panel is an engineering calculator and animated explanatory view. Its path graphic is illustrative; it does not connect to a radio, antenna, satellite payload, or provider network.

## Inputs and equations

- Frequency `f_MHz`; convert to `f_GHz = f_MHz / 1000`.
- Slant range `d_km`; user must provide a realistic path range for the orbit/service being studied.
- Transmitter power `P_W`, transmit antenna gain `G_tx` dBi, receive antenna gain `G_rx` dBi, aggregate losses `L_total` dB, and receiver sensitivity `S_rx` dBm.

Free-space path loss:

`FSPL(dB) = 92.45 + 20 log10(f_GHz) + 20 log10(d_km)`

EIRP:

`EIRP(dBW) = 10 log10(P_W) + G_tx(dBi)`

Estimated receive power:

`P_rx(dBm) = EIRP(dBW) + G_rx(dBi) - FSPL(dB) - L_total(dB) + 30`

Link margin:

`Margin(dB) = P_rx(dBm) - S_rx(dBm)`

## Example reference result

Defaults in the panel are illustrative: 14,000 MHz, 38,000 km, 10 W, 42 dBi transmit gain, 40 dBi receive gain, 8 dB aggregate losses and -110 dBm receiver sensitivity. Expected values are approximately 206.97 dB FSPL, 52.00 dBW EIRP, -92.97 dBm receive power and +17.03 dB margin.

## Scope and limits

A positive model margin is not an actual connection or guarantee of service. A complete satellite link budget also requires legal/assigned carrier frequency, bandwidth, modulation and coding, antenna pointing/polarization, receiver noise temperature, G/T, rain fade statistics, interference, implementation losses, terminal certification, uplink/downlink asymmetry, provider scheduling and authorization. The panel intentionally does not estimate real-world service availability or manufacture provider credentials.

Russian satellite provider tokens, VPN credentials, terminals, airtime and subscription are not obtainable/generated from public orbital data by this web app. Use only credentials issued to you by the provider or your approved VPN service.

---

<a id="pwa-install"></a>
## PWA installation and cache refresh

*Consolidated from `PWA-INSTALL-NOW.md`.*

> **Archived guide:** This text is retained to preserve setup details from its release. For the current v50 file count, root layout and cache name, follow `README.md` and `DEPLOYMENT_BN.md`.

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

For **asynchronous internet voice mail between TERRAVEX users on different devices**, deploy the repository root (root-level `server.js`) publicly using `render.yaml`, set `ALLOWED_ORIGINS` to the exact HTTPS app origin, and enter the deployed `wss://` URL in Space Communications. Local launcher mode binds to `127.0.0.1` and is same-computer only. The mailbox encrypts audio/metadata in the sender's browser and stores only ciphertext in relay memory for up to 24 hours; restart can erase messages. It is not emergency-grade and does not deliver to a spacecraft or Russian satellite. See `TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail` and `TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail`.


## Earth Traffic 3D Monitor (current cache v29)

The new **Space & Atmosphere → Earth Traffic 3D Monitor** combines CelesTrak orbital elements propagated by Satellite.js with optional OpenSky aircraft state vectors. Click **Load / update orbital data** for public orbital-element groups, then choose a geographic aircraft region and press **Refresh aircraft feed**. Aircraft auto-refresh is opt-in for bounded regions only; global auto-refresh is disabled to conserve API credits.

The Three.js WebGL scene may require internet for the CDN and Earth textures. If unavailable, the panel falls back to a schematic 2D canvas and reports degraded renderer/data status. Satellite positions are model-propagated from the displayed element epoch; aircraft positions are provider snapshots, not extrapolated predictions. See `TERRAVEX-COMPANION-DOCUMENTATION.md#earth-traffic-3d-monitor` for methodology and limitations.


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
The Engineering Sector is available from the sidebar, persistent top-bar `Engineering` button, Overview launch card and the first PWA install shortcut. Open `?page=engineering`. The calculator updates locally when inputs change and can export a concept-only AutoCAD-compatible DXF, CSV surface allowance schedule and JSON scenario report. Service-worker cache: `terravex-apex-shell-v46`. After GitHub Pages deployment, hard-refresh the HTTPS origin; for an installed PWA use Source Health & Offline → Refresh cached app shell.


### v42: plot the concept on the shared 3D Earth
In Engineering Studio, enter user-authorized/survey-derived latitude and longitude, calculate the concept, then use **Plot concept on shared 3D Earth**. This creates a schematic parcel boundary, one extruded building massing volume and floor-level outlines in the existing Cesium viewer. **Clear Earth concept** removes only those Engineering Studio entities. Direct route: `?page=engineering`. This is not a topographic survey, true BIM model or structural design.


### v43 Engineering Studio report and export controls
The Engineering & Architecture page (`?page=engineering`) now shows its report monitor near the top. If the installed app continues to display an older page, refresh the cached app shell from Source Health & Offline; the current shell is `terravex-apex-shell-v46`. The Engineering Studio requires `advanced-workbench.js` and `advanced-workbench.css` in the local shell. The report download toolbar exports conceptual DXF, SVG, CSV, JSON and printable HTML.


## v45 Engineering Studio auto-design and CAD
Current shell cache: `terravex-apex-shell-v46`. Open `?page=engineering`. Choose only the number of storeys and one of the supported civilian building types; Terravex will calculate an assumed concept parcel, footprint, height, GFA, FAR scenario, functional zoning and non-structural finish allowances. Review the visible auto-assumption summary before exporting. Optional satellite context requires panning the shared 3D Earth to the intended region and explicitly selecting **Use current 3D Earth view centre**.

Download actions: **2D AutoCAD floor plan DXF**, 3D massing DXF, plan SVG, complete JSON report, preliminary finish CSV and HTML safety/design report (Print / Save as PDF). 2D DXF is a schematic typical-floor functional-zone plan, not construction/permit drawing.

Engineering Studio v45 geometry and typology selector is in the Engineering Sector. Refresh the cached app shell after deploying.

Engineering Studio v45 uses cache `terravex-apex-shell-v46`. After GitHub Pages deploy, refresh the cached app shell before testing the new geometry and typology selector.


## v46 Engineering Studio redraw and AutoCAD 2007 compatibility

The Engineering Studio v46 live redraws the 2D plan when geometry, civilian building type, storeys or plan arrangement changes. It also redraws after the Engineering page becomes visible. The plan arrangement choices are Auto by infrastructure type, Central service core and Linear / wing arrangement.

CAD downloads are legacy ASCII DXF R12 / AC1009 to maximise backward compatibility with AutoCAD 2007. After download, open the DXF in AutoCAD 2007 and run `ZOOM` → `E` (Extents) if the drawing is not centred in the initial view. The drawing coordinates are metres; check the visible unit note and use `UNITS` if you need to set a matching display format.

Current PWA shell cache: `terravex-apex-shell-v46`. After uploading all 99 files to the repository root, perform a hard refresh. For an installed PWA, use Source Health & Offline → Refresh cached app shell, then reload.


## v47 Integrated Civil Engineering Companion

Open `?page=engineering` and scroll to **Integrated Civil Engineering Analysis & Quantity System**. The new section is an additive companion to the v46 geometry-aware concept model. It imports the current conceptual floor plate/storey count when available, but requires real member schedules, load values, soil report values and engineer-checked design inputs before any result is used beyond planning.

The location controls require a deliberate GPS permission or manually entered coordinates. Public-source checks are limited to Sentinel-2 L2A catalogue metadata and Open-Meteo/Copernicus GLO-90 elevation context. ISRIC currently reports the SoilGrids beta point REST API as paused; the panel explicitly discloses this and links to the map explorer. No subsurface bearing or pile capacity is inferred from satellite/model data.

Calculate the preliminary load screen, enter actual concrete geometry, mix assumptions, masonry geometry and an engineer-prepared bar schedule. Export the HTML report, JSON record, material CSV, BBS CSV and the separate A3 R12/AC1009 summary sheet. The A3 sheet is millimetre-based model-space review geometry. The older v46 plan/3D DXF downloads retain their original metre-based concept exports.

**Current shell cache:** `terravex-apex-shell-v50`. After deployment, hard-refresh the HTTPS page. For an installed PWA, go to Source Health & Offline → Refresh cached app shell, then reload. Direct page route: `?page=engineering`.

The new system does not run a finite-element frame solver, generate code-certified reinforcement details, calculate pile capacity from satellite data, certify material mix strength, or create permit/construction documents. AutoCAD 2007 desktop opening/plotting of the v47 sheet has not been independently verified in this environment.


## v48 Architecture Form Studio
The engineering section now includes six-form comparative architecture ranking, selectable concept geometry, linked-load/site-context report traceability and four typography presets for the plan/SVG/report/R12 DXF. The index is not a structural safety rating. Current cache: `terravex-apex-shell-v50`. AutoCAD 2007 desktop open/plot confirmation must be performed on the target workstation.

---

<a id="rf-interference-intelligence"></a>
## RF Spectrum and Interference Intelligence

*Consolidated from `RF-INTERFERENCE-INTELLIGENCE.md`.*

# RF Spectrum & Interference Intelligence

## What this module does

- Presents a high-resolution **synthetic** spectrum trace with clean-channel, adjacent-channel, broadband-noise, burst-noise and fading scenarios.
- Calculates approximate combined noise/interference power, modeled SNR and the Shannon capacity upper bound.
- Imports a local receiver/SDR CSV export in read-only mode; the file is not uploaded to a server.
- Flags spectral peaks as review candidates. A peak is not proof of intentional jamming, location of an emitter, or attribution to an actor.
- Exports a JSON analysis report and can add a local review item to this tab's session-scoped incident log.

## Important boundary

This is a **receive-only, non-transmitting** panel. It contains no jammer/transmitter controls, radio-control API, signal-spoofing function, or instructions for interfering with operational radio systems. Virtual interference scenarios affect only the visualization and mathematical model in the browser. Real observations require an authorized RF receiver, SDR or documented read-only sensor interface.

ITU explains that harmful interference can degrade or obstruct communications and radionavigation services, and that radio stations must not cause harmful interference. Bangladesh radio equipment usage and import may require BTRC approvals/authorization. See the official references below.

- ITU harmful-interference guidance: https://www.itu.int/en/mediacentre/backgrounders/Pages/radio-interference.aspx
- ITU Radio Regulations: https://www.itu.int/pub/R-REG-RR
- Bangladesh Telecommunication Regulatory Commission: https://btrc.gov.bd/

## Equations and assumptions

Power levels expressed in dBm cannot be added arithmetically. For noise floor `N` and simulated interference power `I`, the combined level is computed by converting dBm to linear power, summing, and converting back:

`P_combined(dBm) = 10 log10(10^(N/10) + 10^(I/10))`

`SNR(dB) = P_signal(dBm) - P_combined(dBm)`

`C = B log2(1 + 10^(SNR/10))`

`C` is an idealized Shannon capacity bound, not measured goodput or an actual radio link's performance. The slider-to-interference mapping is illustrative and not calibrated to a physical transmitter or jammer.

## CSV import format

Header must contain `frequency_mhz,power_dbm`, with at least two numeric sample rows. The parser limits imports to 2 MiB and 5,000 samples. Keep source metadata (device, antenna, calibration, gain, RBW/VBW, detector mode, timestamp, and frequency settings) separately so results can be interpreted correctly. The app does not infer missing calibration metadata.

Example:

```csv
frequency_mhz,power_dbm
2390.0,-101.2
2400.0,-99.8
2410.0,-80.1
2420.0,-100.4
```

Peak detection is a simple heuristic for triage. Use appropriate calibrated equipment, approved operating procedures, repeat measurements and provider/regulator coordination for suspected harmful interference.

## QA

Run the dependency-free focused logic/UI harness with Node.js:

```sh
node tests/test-rf-interference-intelligence.cjs
```

---

<a id="security-deployment"></a>
## Security and deployment notes

*Consolidated from `SECURITY-DEPLOYMENT.md`.*

# TERRAVEX APEX: Secure access and connectivity notes

## Critical distinction

The static GitHub Pages application is a frontend dashboard. It cannot create a satellite-radio link, provision a commercial satellite subscription, start an operating-system VPN, or reliably inspect whether a VPN tunnel is active. The new panel only performs explicit browser-side tests against a user-authorized HTTPS health endpoint. A successful check proves only that the endpoint responded; it does not prove traffic passed through a particular satellite or VPN.

## Do not put secrets in the repository

Never commit WireGuard private keys, VPN configuration bundles, passwords, API tokens, emergency contact lists, or personal coordinates. The panel does not store the health URL or credentials, and its exported status report omits the health URL, response body, and coordinates. Do not add secrets to client-side JavaScript: anyone receiving the files can inspect them.

## GitHub Pages is not a private console

GitHub documents that published Pages sites are publicly accessible on the internet even when the source repository is private on plans that support private repositories. A client-side PIN, hidden panel, obscured navigation item, or CSS display rule is not a security boundary.

For real restricted access, move the sensitive console behind a host-side identity/authentication layer or deploy it as a private web application. One documented pattern is Cloudflare Access in front of an application on a hostname you control, with allow policies for named identities and a validated origin. See:

- GitHub Pages visibility: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Cloudflare Access web applications: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/
- Cloudflare private web application: https://developers.cloudflare.com/cloudflare-one/setup/secure-private-apps/private-web-app/
- WireGuard quick start: https://www.wireguard.com/quickstart/

Follow the provider's current setup instructions. Do not assume this guide automatically makes an existing github.io hostname private. Test access from a logged-out browser and a network/device that should not be allowed, and verify the origin cannot be bypassed.

## Satellite communications in Bangladesh

Public CelesTrak orbital elements are tracking data, not a satellite communications endpoint. The Russian Satellite Communications Company (RSCC) publishes contracted satellite communications and VSAT offerings; the app cannot subscribe, generate terminal credentials, align an antenna, or establish a link. Contact RSCC or an authorized service provider to confirm actual service availability in Bangladesh, terminal approval, licensing, service contract, installation, and support. Check Bangladesh regulatory requirements with BTRC before deployment.

- RSCC services: https://eng.rscc.ru/services/
- RSCC communications services / VSAT: https://eng.rscc.ru/services/uslugi-svyazi/
- BTRC guidelines: https://btrc.gov.bd/pages/static-pages/6922e0e3933eb65569e290b1

## Health endpoint contract

Use a public HTTPS hostname you own or are explicitly authorized to test, standard HTTPS port 443, no URL query string, no username/password in the URL, and no secrets in the response. Prefer a minimal non-sensitive JSON response such as `{ "status": "ok" }`. Enable suitable CORS headers for your exact dashboard origin. The monitor does not send cookies or authorization headers. CORS, DNS, TLS, redirect, and network failures are reported as inconclusive rather than proof the service is down.

Monitoring starts only after the user presses Start, checks no more often than once per minute while the page is open and visible, and stops when Stop is pressed or the page is unloaded. Browser notification and VPN state are not treated as proof of an established emergency connection.

## Desktop VPN control add-on

The optional `vpn-bridge.py` helper is a separate local component. It listens only on `127.0.0.1:8765`, restricts the Origin to explicit allow-listed origins, and validates the Host header. A cryptographically random per-run pairing token can be exchanged only once during a 10-minute window; it is then replaced by a separate, in-memory 4-hour session token. Status/control routes accept only the session token, never the pairing token. Only fixed Tailscale `up/down/status` operations or a single configured WireGuard for Windows tunnel service can be requested. It does not accept arbitrary commands, profiles or tunnel names from the browser. Review `vpn-bridge.py` before running; the source script is not a signed binary. The pairing token is shown in the local console and should never be sent to anyone else. This helper does not establish satellite connectivity or independently validate end-to-end VPN routes.

## One-use pairing token lifecycle

The local VPN helper generates a cryptographically random token at startup, prints it only in the helper console, gives it a 10-minute pairing window and consumes it on the first successful `/api/pair` exchange. Pairing yields a distinct, random bearer session token with a 4-hour in-memory TTL. The app keeps that session in the current tab's `sessionStorage` to survive a refresh; it is not stored in `localStorage` or cookies. Restarting the helper invalidates all sessions. This does not issue or emulate a Russian satellite-provider authentication token.

---

<a id="space-comms-voice-mail"></a>
## Space Communications and encrypted voice mail

*Consolidated from `SPACE-COMMS-REAL-VOICE-MAIL.md`.*

# TERRAVEX APEX — End-to-End Encrypted Internet Voice Mail & One-Room Voice Link (v16)

## What this upgrade really does

- **Local voice memo:** record through the browser microphone, play it back, and download audio plus message details. Requires HTTPS or localhost and microphone permission.
- **One-room live peer call:** WebRTC can connect two app users after they pair. Audio and the peer voice-mail transfer use the browser's WebRTC connection. A signaling service exchanges setup metadata only.
- **Asynchronous internet voice mailbox:** create a random `mailbox-address.encryption-secret` key, share it privately with the intended TERRAVEX recipient, and send a recorded voice message through the configured HTTPS API. The server stores only AES-GCM ciphertext in process memory for up to 24 hours; the recipient can check and decrypt it later while offline. Audio is limited to 8 MiB, 8 messages per inbox, and the server has a 64 MiB aggregate memory cap. Messages may be lost when the service restarts or deploys; this is a prototype mailbox, not guaranteed or emergency-grade delivery.
- **End-to-end encryption:** audio and metadata are encrypted in the sender's browser using AES-GCM before upload and decrypted in the recipient's browser. The server receives the random mailbox address and ciphertext, not the encryption secret or plaintext voice/notes. Anyone you share the complete inbox key with can decrypt messages in that shared inbox. The key is not automatically stored by TERRAVEX; save it safely.
- **Dependency-free signaling service:** `server.js` uses only Node.js 18+ built-ins. Local pairing does not require `npm install` or a network package download.
- **Public satellite observation catalogue:** SatNOGS remains read-only observation metadata. It is not a spacecraft uplink or astronaut voicemail inbox.

The server does not provide persistent database storage or guaranteed uptime. Do not use this prototype to send critical emergency messages; use verified official services for emergency response.

## Local Windows quick start

1. Install Node.js 18 or newer (the static app works without Node; local signaling and internet mailbox service use built-in Node modules only, with no `npm install`).
2. Extract the entire ZIP.
3. Double-click `START-TERRAVEX-COMMS-ONE-RUN.bat`. It opens a local signaling/mailbox service in one console and launches the app at `http://127.0.0.1:8000/` in the other.
4. Wait until the relay console says it is listening on port 8787.
5. Open the Space Communications & Voice Relay panel. One browser chooses **Create one-run room**, then shares the room code privately. The other client joins the same room code.
6. Both users grant microphone permission. If ICE connects, voice and text are live. A room code connects two app users, not a spacecraft.

Local mode is suitable for a same-computer test only. Both the static web server and local relay bind to `127.0.0.1`, which is not reachable from a second computer or phone on the LAN. To connect separate devices over the internet, deploy the public relay and point both browsers to the hosted `wss://` endpoint.

## Enable asynchronous internet voice mail and connect peers over the public internet

A public HTTPS web app needs a public WSS signalling endpoint. This package includes a small Node.js service under the repository root (root-level `server.js`) and a `render.yaml` Blueprint.

1. Push the repository (including the repository root (root-level `server.js`) and `render.yaml`) to a GitHub repository you control.
2. In Render, create a new Blueprint from that repository and deploy `terravex-voice-signaling-relay`.
3. Set `ALLOWED_ORIGINS` to the exact **origin** of the published app, without a path or trailing slash. For example, for a GitHub Pages site it may look like `https://YOUR-ACCOUNT.github.io`. Include `http://127.0.0.1:8000,http://localhost:8000` only if you also want the local launcher to connect to this relay. The same host serves an HTTPS API for temporary encrypted voice mail; your app converts the configured WSS relay host to HTTPS automatically.
4. Wait for `/healthz` to return JSON with `ok: true`, then copy the service's `wss://...` URL into **Signaling server WSS/WS URL** in TERRAVEX.
5. The host creates a room and shares its code privately; the guest joins it.

The signalling server accepts only allowed browser origins, allows two peers per room, rate-limits room-join attempts, caps messages, and expires idle rooms. It does **not** provide TURN media relay. A few networks block direct WebRTC paths; those require a TURN server you control or a trusted hosted TURN service. Configure temporary TURN credentials in the optional ICE JSON field. Do not commit TURN secrets to GitHub or store long-lived credentials in a public web app.

## Is this a real Russian-satellite/astronaut voice mail?

**No.** A successful WebRTC call is a real browser-to-browser internet call, not a satellite uplink. A satellite is not a generic public inbox where this app can post an audio file. RSCC offers commercial communications services that require an operator arrangement and compatible ground terminal; the panel links to its official service information but cannot activate service or invent provider credentials.

For an astronaut voice contact, ARISS organises scheduled amateur-radio/telebridge contacts, typically for educational organisations and with radio operators and station equipment. It is not an instant open voicemail service. Follow the official application and local radio licensing path. Bangladesh's BTRC states that radio apparatus operation/frequency use is subject to licensing and allocation requirements.

Official sources:
- RSCC communication services: <https://eng.rscc.ru/services/>
- ARISS contact guidance: <https://www.ariss.org/about-ariss-contacts.html>
- ARISS applying for contacts: <https://www.ariss.org/>
- Bangladesh Telecommunications Regulatory Commission: <https://btrc.gov.bd/>
- WebRTC TURN guidance: <https://webrtc.org/getting-started/turn-server>

## Privacy & emergency use

- Audio and message notes stay on this device unless you explicitly download or send them to a paired browser peer.
- The signalling relay forwards WebRTC offer/answer metadata only. WebRTC audio/data goes peer-to-peer unless a TURN service is used.
- A room code is temporary rendezvous information, not a satellite access token.
- An emergency packet sent to a peer is **not** delivered to police, rescue agencies, a satellite, spacecraft or mission control. For immediate danger, use verified local emergency services; do not wait for a peer or satellite connection.

---

<a id="space-comms-relay-guide"></a>
## Space Communications relay guide

*Consolidated from `SPACE-COMMS-RELAY-GUIDE.md`.*

# TERRAVEX APEX — Space Communications Guide (v16)

The current implementation and setup instructions are in [`TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail`](TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail), with relay implementation details in [`TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail`](TERRAVEX-COMPANION-DOCUMENTATION.md#space-comms-voice-mail).

The app supports browser-to-browser WebRTC voice/text after pairing, and an end-to-end encrypted temporary internet voice mailbox after the relay is publicly deployed. The included local launcher only serves the same computer; `127.0.0.1` is not reachable from a second device.

Neither path transmits directly to a spacecraft or creates a Russian satellite provider connection. Real satellite service requires a provider arrangement, compatible terminal, authorised radio use and valid credentials. ARISS astronaut contacts are scheduled through its official contact pathway. Do not use this prototype for critical emergency messages.

---

<a id="space-environment-modules"></a>
## Space and atmosphere modules

*Consolidated from `SPACE-ENVIRONMENT-MODULES.md`.*

# Space & Atmosphere panels — engineering notes

## Panel A: Ozone & Atmosphere Observatory

- Animated Earth-limb, atmospheric bands, UV-B ray-path concept, and altitude-profile canvas.
- Dobson Unit to compressed pure-ozone thickness conversion: `thickness_mm = DU × 0.01` under the reference conditions shown in the UI.
- 300 DU is a teaching reference input only. It is not measured ozone above Bangladesh.
- NASA Ozone Watch links for latest source page, monthly products, daily maps and seasonal context.
- Embedded NASA source page is lazy-loaded after the user opens its disclosure, to avoid blocking initial app rendering. Direct source links are the fallback if framing is denied.

## Panel B: Solar Activity & Magnetosphere Monitor

- Fetches recent `FLR`, `CME`, and `GST` entries from NASA CCMC DONKI for a rolling seven-day window.
- Source fields are normalized for UI display; source timestamps and links are retained.
- Refresh uses request timeouts and `Promise.allSettled`, so one failed event class does not hide other available classes.
- Optional browser notifications require an explicit user opt-in and permission. The initial feed load never notifies for old items; later refreshes notify only for newly observed event IDs within the session.
- Magnetosphere graphic is conceptual and does not infer the direction or impact of a CME.

## Panel C: Near-Earth Object Watch

- Requests one UTC day's `NeoWs Feed` response to reduce NASA Demo-key usage.
- Normalizes the first reported close-approach record, maximum/minimum estimated diameter, relative velocity, miss distance and NASA's hazardous-object flag.
- Sorts by reported miss distance. `LD` uses a reference lunar distance of 384,400 km for visualization/summary.
- Canvas markers are arranged for illustration; no real heliocentric coordinates are implied.
- In-memory 30-minute cache; manual refresh can be throttled by NASA's public Demo key.

## Source endpoints

- NASA Ozone Watch: https://ozonewatch.gsfc.nasa.gov/
- NASA Dobson Unit facts: https://ozonewatch.gsfc.nasa.gov/facts/dobson_SH.html
- NASA atmospheric layers: https://www.nasa.gov/image-article/earths-atmospheric-layers-3/
- NASA CCMC DONKI: https://ccmc.gsfc.nasa.gov/tools/DONKI/
- DONKI event guide: https://ccmc.gsfc.nasa.gov/DONKI/guide/events/
- NASA Open APIs / NeoWs: https://api.nasa.gov/
- CelesTrak orbital elements: https://celestrak.org/NORAD/elements/

---

<a id="v47-engineering-release"></a>
## v47 integrated civil engineering release notes

*Consolidated from `TERRAVEX-v47-ENGINEERING-RELEASE-NOTES.md`.*

# TERRAVEX APEX v47 — Integrated Civil Engineering Companion

**Release basis:** User-uploaded TERRAVEX source archive, expanded and checked before modification.  
**Release date:** 7 November 2026.  
**Integration approach:** additive companion module. Existing v46 geometry, architectural concepts, plan rendering and original DXF export remain available. The existing `advanced-workbench.js` was changed only where needed to recognise the v47 service-worker cache and verify the two new cached assets.

## 1. What v47 adds

The existing Engineering page now contains a separate `Integrated Civil Engineering Analysis & Quantity System` panel. It does not overwrite or rename the v46 conceptual building designer.

- User-controlled site coordinates and explicit browser GPS permission.
- Site-source checks using Sentinel-2 L2A catalogue metadata and a regional elevation model.
- A transparent gravity-load takedown for a typical floor plate and one interior tributary grid cell.
- Geometric concrete take-off for slabs, beams, columns, isolated footings and bored piles from user-entered dimensions.
- Nominal volumetric concrete-mix material estimate, including cement, sand, coarse aggregate and batch water.
- Masonry wall volume, modular brick count and nominal mortar quantities.
- User-entered reinforcement bar schedule with theoretical mass and CSV export.
- Limited foundation screening against allowable bearing pressure and axial pile capacity entered from a geotechnical report.
- Printable/HTML engineering report, JSON scenario, material CSV, user-input BBS CSV and an A3-size R12/AC1009 DXF summary sheet.

## 2. Remote sensing and location: exactly what is and is not inferred

### Sentinel-2 catalogue

The module queries the Copernicus Data Space STAC `/v1/search` endpoint for Sentinel-2 L2A catalogue records within a small coordinate-centred bounding box and a recent time window. It reports the number of matching records, acquisition date and cloud-cover attribute where present. This is **catalogue metadata discovery**, not image classification, cadastral boundary extraction, roof/road measurement or a verified site survey.

### Elevation context

The module calls the Open-Meteo Elevation API. Its documented elevation source is the Copernicus DEM GLO-90 at about 90 m resolution. The returned number is a regional digital elevation model value. It is not a survey benchmark, finished-floor level, contour survey, flood level or foundation datum.

### SoilGrids

ISRIC currently documents SoilGrids as a global soil-property mapping product at 250 m resolution and six standard depth intervals. However, the official documentation currently says the beta point-query REST API is temporarily paused. v47 therefore **does not call that unavailable point-query API**. The panel labels its status as paused and links to the official SoilGrids explorer. WMS/WCS products can be viewed/downloaded for regional context, but no SoilGrids property is converted into an allowable bearing pressure, SPT value, CPT resistance, shear strength or pile capacity.

### GPS and coordinates

GPS is requested only after the user clicks the GPS control and grants the browser permission. Manual coordinates are also supported. Coordinates are reference points only; they are not legal parcel boundaries or a cadastral/survey control network. The user must explicitly copy them to the older concept site context if desired.

## 3. Calculation basis and equations

All calculations are deterministic and driven by entered values. The interface/report labels them as preliminary take-off or screening, not a structural design certificate.

### Gravity-load screening

For entered uniform floor loads `Gk`, `Qk`, floor-plate area `A` and storeys `n`:

- Service total: `Nservice = (Gk + Qk) × A × n`
- Factored scenario total: `Nscenario = (γG × Gk + γQ × Qk) × A × n`
- One interior grid tributary area: `At = gridX × gridY`
- One interior-column service estimate: `Ncolumn = (Gk + Qk) × At × n`

The factors are user-editable scenario inputs, not automatically verified BNBC load combinations. The result is not a frame-analysis reaction. It does not solve stiffness, moment distribution, force redistribution, torsion, diaphragm action, lateral load, seismic response, wind response, drift, deflection, punching shear, beam shear or member capacity.

### Concrete geometric take-off

- Slab: `slab area × thickness`
- Beam: `total beam length × width × overall depth`
- Columns: `column count per floor × width × depth × number of storeys × storey height`
- Footings: `footing count × length × width × thickness`
- Piles: `pile count × π × diameter² / 4 × length`

The total wet geometric volume is multiplied by the entered dry-volume factor for a nominal volumetric mix estimate. Cement, sand and aggregate are divided according to the entered ratio. Cement mass uses the entered bulk density; nominal batch water is `cement mass × water/cement ratio` with water density approximated as 1 kg/L. The output does not establish strength, workability, durability, pumpability or an approved mix design. Moisture corrections, admixtures, aggregate grading, yield trials, wastage and site batching controls remain external inputs.

### Masonry take-off

Net wall area is wall length × height less entered opening area. Wall volume is net area × thickness. Nominal brick count uses the brick dimensions plus mortar-joint allowance as a modular unit. Nominal wet mortar volume is the wall volume less the solid brick volume. Mortar material is estimated using a documented 1:6 nominal proportion and dry-volume allowance. This remains a quantity estimate; bond pattern, cut bricks, piers, lintels, movement joints and local unit sizes must be checked.

### Reinforcement schedule

Bar mass is estimated using the common theoretical approximation `d²/162 kg/m`, with diameter in millimetres. Total length is count × user-entered cut length. The schedule is user supplied; v47 does not design bar spacing, hooks, bends, anchorage, lap length, development length, confinement, seismic detailing, cover, congestion, curtailment or bar shapes. A CSV is provided for an engineer-prepared BBS, not an automatically designed BBS.

### Footing/pile screening

A simple bearing screen divides the single interior tributary service-load estimate by the entered footing plan area and compares it to the allowable pressure entered from the geotechnical report. A simple axial pile-count screen divides that one tributary service load by the entered allowable axial capacity per pile and rounds upward. These screens exclude footing self-weight/backfill, moments, eccentricity, settlement, groundwater, sliding, overturning, punching, one-way shear, pile-group efficiency, group settlement, pile spacing, lateral capacity, downdrag, pile-cap action and construction/test acceptance.

## 4. CAD export

The companion creates a separate **A3 landscape model-space sheet template** (420 × 297 drawing units treated as millimetres), with a 10 mm border, title block, fitted concept-plan viewport, engineering summary, notes and named layers. It is legacy ASCII DXF R12 / AC1009 and uses ordinary POLYLINE/VERTEX, LINE and TEXT entities. The sheet includes an explicit millimetre note; it does not rely on modern `$INSUNITS` metadata that is not part of the R12 format.

The existing v46 plan and 3D-massing DXFs remain unchanged and remain metre-based. The v47 sheet is a schematic review sheet, not a dimensionally coordinated construction drawing. Because AutoCAD 2007 itself is not installed in this validation environment, direct application-level opening/plotting in that exact release remains unverified. The generated v47 sheet did parse successfully with ezdxf 1.4.4 as AC1009 and contained the expected geometry/layers.

## 5. Code basis and professional review

The selector offers BNBC 2020 as the Bangladesh reference and optional ACI CODE-318-25, ASCE/SEI 7-22 and Eurocode references. Selecting a reference does not perform code checks or legal approval. BNBC 2020 was published by Government Gazette as the Bangladesh building code; local authority requirements must also be identified. For Dhaka sites within RAJUK's jurisdiction, check the current Dhaka Metropolitan Building Construction Regulations 2025 and related planning/building rules. Other locations may fall under a different authority.

A real design must also establish, as applicable: accurate topographic/cadastral survey; soil investigation with boreholes/SPT or CPT and laboratory results; groundwater and seasonal effects; hazard-specific seismic/wind parameters; occupancy/fire/egress; drainage/flood; MEP and utility coordination; material specifications; structural analysis and member/connection design; construction method; inspection/testing; qualified engineer sign-off and authority approval.

## 6. Validation completed in this build environment

- Source ZIP integrity checked before edits; original upload hash recorded separately from the prior hash noted in conversation.
- Main HTML: 1,335 IDs, zero duplicates; no missing local HTML assets.
- Service-worker required shell: 54 local resources, zero missing; cache renamed to `terravex-apex-shell-v47`.
- JavaScript syntax: 26 files checked, zero syntax errors.
- CSS parsing: 21 stylesheets, zero parse errors.
- Python syntax: 4 files checked.
- Static QA: zero errors.
- v47 Engineering Companion deterministic tests: 32 assertions passed, including gravity-load arithmetic, five concrete volume components, mix water conversion, bar mass, bearing/pile screening boundaries, invalid-input rejection and mock public-source status handling.
- Generated A3 sheet parsed with ezdxf 1.4.4 as AC1009; 33 model-space entities across the expected layers.
- Existing app regression tests passed: Earth Traffic 25 assertions; PWA omnibox 9/9 plus inherited integration assertions; relay mailbox 14 groups; RF simulator 5/5; Space Comms 21 assertions; Space Environment 11 assertions; voice-mail/mailbox static tests; VPN bridge 11 Python tests; space-environment QA suite.

## 7. Not tested or not claimed

- No live public remote API was contacted as part of deterministic CI-style tests. Remote calls are exercised with mocked responses. Browser CORS, provider uptime, live quota and availability can differ at deployment.
- SoilGrids point REST is not contacted because ISRIC currently reports it paused.
- No real Chromium end-to-end visual session was run for this build.
- No AutoCAD 2007 desktop open/plot test was run.
- No finite-element/3D frame analysis, code-compliant structural member design, automated reinforcement detailing, verified pile design, construction-ready drawing, bill certified for tender or statutory permit package is generated.

**Release classification: v47 adds an auditable preliminary engineering calculation and quantity companion. It is not a replacement for professional civil/structural/geotechnical engineering, field investigation or authority approval.**

---

<a id="v48-architecture-release"></a>
## v48 adaptive architecture release notes

*Consolidated from `TERRAVEX-v48-ARCHITECTURE-FORM-RELEASE-NOTES.md`.*

# TERRAVEX APEX v48 — Adaptive Architecture Form & Drawing Typography

## What changed

This release adds a separate Architecture Form Studio inside the v47 Integrated Civil Engineering Analysis section. Existing v46 Design Studio controls and v47 engineering calculations are retained.

### Analysis-led shape comparison

The Architecture Form Studio compares the six geometry families already supported by the Design Studio: rectangle, square, circle, regular triangle, regular pentagon and regular octagon. Candidates are compared at the same assumed parcel area and site-coverage percentage. The tool presents:

- perimeter and perimeter-to-area ratio;
- compactness index `C = 4πA/P²`;
- indicative facade envelope `Af ≈ Pfootprint × H`;
- bounding-box grid-module fit against a user-entered preferred bay module;
- heuristic form-simplicity and symmetry indices;
- a priority-weighted comparative form index.

The user can change the objective, review all candidate cards and apply a selected shape to the existing `engGeometry` control. The legacy live plan redraw and existing 2D/3D R12 DXF exporters then recalculate from that selected shape.

When available, the companion panel also attaches the latest user-entered v47 gravity-load and quantity results and the existing satellite-context status to the comparison output/report for traceability. Those values are displayed as linked engineering context only; they are deliberately not turned into a structural shape score because this application does not calculate frame stiffness, lateral-force distribution, diaphragm action, torsion, drift, member capacities or foundation response. The ranking is an architectural-form heuristic. It is not a claim of structural safety, construction readiness, code compliance, aerodynamic performance, seismic performance, or optimality. No FEM solver, CFD/wind-tunnel solver, response-spectrum/time-history analysis, diaphragm/torsion check, member capacity check, reinforcement design, foundation design, fire/egress validation, or permit decision is included. The interface expressly states `STRUCTURAL SAFETY: NOT ASSESSED`.

### Lettering and CAD typography

The user can select:

- Technical single-stroke (`simplex.shx`)
- Architectural Roman (`romans.shx`)
- Standard clear lettering (`txt.shx`)
- Monospaced engineering schedules (`txt.shx`)

The selector updates the main 2D drawing canvas, SVG export, report typography, v46 R12 2D/3D DXF text-style references and v47 A3 R12 engineering summary DXF. The DXF R12 STYLE table declares each named style. A target CAD workstation must have the named SHX font installed; AutoCAD may substitute a font if it is missing.

DXF R12 TEXT output is ASCII-oriented. Non-ASCII scripts such as Bengali/Arabic/Japanese are not guaranteed by the selected SHX style and are not embedded; use a Unicode-capable modern CAD text style/font and confirm target-machine glyph coverage for multilingual deliverables.

## QA performed

- Original v47 package was used as the base; no existing project file was removed.
- Six geometry candidates checked for finite positive area/perimeter, compactness bounds, and equal comparison area.
- Linked user-entered gravity-load, quantity and site-context fields checked as provenance/context only, never as structural approval inputs.
- Priority weight sets checked to sum to one.
- Grid-fit edge cases (zero module, exact module multiples, non-finite/invalid inputs) checked.
- Typography options checked for unique style IDs and known SHX font filenames.
- JS syntax, HTML IDs/references, CSS parsing, offline-shell registrations and existing v46/v47 regression tests checked.
- R12 DXF test files parsed by ezdxf where available, checking `AC1009`, STYLE table entries, entity style references, and no unknown table references.

## Deploy

Extract the contents of the ZIP into the existing GitHub Pages repository root, preserving the root layout. Do not upload the ZIP as a single file and do not create an extra nested folder. Commit the new and updated files, let Pages deploy, hard-refresh, then use Source Health & Offline → Refresh cached app shell. The service-worker cache is `terravex-apex-shell-v48`.

## Engineering boundary

This product is a concept/planning environment. A selected shape still needs full architect/structural/geotechnical/fire/MEP review and authority approvals. Never use the comparative form index as a substitute for professional design sign-off.

---

<a id="v48-architecture-user-guide"></a>
## v48 architecture form user guide

*Consolidated from `TERRAVEX-v48-ARCHITECTURE-FORM-USER-GUIDE.md`.*

# Using the new Architecture Form Studio

1. Open the existing Engineering Studio and run **Calculate concept**.
2. Scroll to **Integrated Civil Engineering Analysis & Quantity System**.
3. In **Adaptive Architecture Form & Drawing Typography**, choose the comparison objective and preferred planning grid module.
4. Select **Analyze architectural forms**. Six supported geometries are ranked using the current concept model's assumed area, coverage, typology, height and storeys.
5. Review compactness, perimeter, grid-module fit, indicative facade area, and heuristic simplicity/symmetry values. The summary also displays the latest v47 gravity-load/site-source context, when available; it is a traceability aid and is not included as a member-capacity or safety rating.
6. Apply a shape only after considering site boundary, planning, architectural use and actual engineering constraints. The existing Design Studio recalculates and redraws the 2D/3D concept.
7. Choose a lettering style. It applies to the 2D preview, SVG and R12 DXF styles, and report typography.

A high form index means only that a candidate scored well against the selected comparative weights. It does not mean safe. No structural safety calculation is completed by this component.

## Equations shown in the panel

- Compactness: `C = 4πA/P²` (dimensionless; 1.0 for a perfect circle and lower for less compact polygons).
- Perimeter-area ratio: `P/A` (m/m²).
- Approximate vertical facade envelope: `Af ≈ Pfootprint × H` (m², gross geometric estimate).
- Grid fit: normalized closeness of bounding-box spans to an integer multiple of a user-entered planning module.
- Form index: weighted combination of compactness, grid fit, conceptual simplicity and symmetry. Facade-reduction objective uses compactness as a perimeter-reduction proxy at equal candidate area and coverage.

The module is explicitly a comparison aid. It does not calculate design wind pressure, dynamic response, seismic base shear, torsion, drift, P-delta, member forces, reinforcement, foundations, soil settlement, fire compartments or egress.

---

<a id="thunderstorm-install"></a>
## Thunderstorm energy lab installation guide

*Consolidated from `THUNDERSTORM-UPGRADE-INSTALL.txt`.*

> **Archived guide:** This text is retained to preserve setup details from its release. For the current v50 file count, root layout and cache name, follow `README.md` and `DEPLOYMENT_BN.md`.

TERRAVEX APEX — THUNDERSTORM DEVICE DIGITAL TWIN UPGRADE

1) Back up your current GitHub repository.
2) Extract this ZIP. Upload every file and folder contained inside the extracted project folder to the repository ROOT (not the ZIP and not an extra nested folder).
3) Keep index.html, thunderstorm-energy-lab.html, thunderstorm-energy-lab.css, thunderstorm-energy-lab.js and the four referenced .webp images in their current root-level locations. Do not create an assets/ subfolder.
4) GitHub Settings → Pages → Deploy from a branch → choose your publishing branch and /(root) → Save.
5) Wait until GitHub Pages deployment reports success. Open the HTTPS site and hard reload with Ctrl+Shift+R.
6) If the app is installed as a PWA, open Source Health & Offline System → Refresh cached app shell. The current shell cache is terravex-apex-shell-v38.
7) Open Thunderstorm Energy Recovery — Device Digital Twin. Drag the device canvas to rotate it; enable the local simulation interlock before using model-pulse controls.

DATA AND CONTROL LIMITS
- Three.js is loaded from a pinned public CDN. If it is blocked or WebGL is unavailable, a local isometric canvas fallback is shown. Internet access is required for the Three.js high-detail renderer and public data feeds.
- The JMA Himawari-9 panel opens the official South Asia public real-time imagery viewer. It is a web feed, not a physical satellite receiver or spacecraft command link. A direct JMA viewer link and image-index link remain available if the embedded view is blocked by browser policy.
- Open-Meteo provides forecast/model fields. Precipitation probability is not thunderstorm probability; CAPE is an atmospheric instability metric, not lightning detection. No direct lightning-strike sensor feed is connected.
- Device controls operate only the browser-side mathematical digital twin. There is no physical hardware I/O, high-voltage, lightning conductor, storage unit or satellite command channel.
- Never connect experimental energy-storage electronics to a lightning protection system or actual lightning path.


Latest v38 service-worker shell cache: terravex-apex-shell-v38. The Live 3D Earth page displays the Bay of Bengal marine safety model layer (not vessel tracking).

---

<a id="legacy-upload-stub"></a>
## Legacy upload stub (historical only)

*Consolidated from `UPLOAD-THIS-FOLDER.txt`.*

> **Historical / superseded instructions:** The original text below referred to an older standalone `earth-command-center` subfolder. Do not follow it for the current TERRAVEX APEX v48 package. The current deployment instructions are in `README.md` and `DEPLOYMENT_BN.md`.

UPLOAD GUIDE

Upload the folder named earth-command-center into your existing IGERS repository root.
Do not upload this ZIP itself as the only repo file; extract it first.

After GitHub Pages has deployed, open:
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/earth-command-center/

The old root homepage is left unchanged. The module uses live public data when providers are reachable and marks offline/demo states visibly.

---

<a id="ozone-watch-research"></a>
## Ozone and space environment research notes

*Consolidated from `ozone-watch-research.md`.*

# Ozone & Space Environment Module: source notes

## NASA Ozone Watch

NASA Ozone Watch publishes satellite-derived total-column ozone maps, daily/monthly archives, animations and seasonal context. Total ozone is reported in Dobson Units (DU). NASA notes that 300 DU is equivalent to a compressed pure-ozone column about 3 mm thick at standard temperature/pressure. The app's default 300 DU is an illustrative input only; it is not a current measurement over Bangladesh. The 220 DU threshold has a specific historical use in defining the Antarctic ozone-hole area and must not be treated as a universal health or local-Bangladesh alert threshold.

Sources: https://ozonewatch.gsfc.nasa.gov/ · https://ozonewatch.gsfc.nasa.gov/monthly/ · https://ozonewatch.gsfc.nasa.gov/facts/dobson_SH.html

## Atmosphere layers

The canvas layer scene and ozone profile are explanatory diagrams with exaggeration for legibility. They do not reconstruct a measured atmospheric vertical profile. Approximate layer boundaries vary with latitude, season and how the layer is defined. NASA reference: https://www.nasa.gov/image-article/earths-atmospheric-layers-3/

## Solar activity

The Solar Activity panel requests recent FLR, CME and GST records from the NASA CCMC DONKI web service. Each provider record retains its timestamp and link. The app does not infer that a CME is Earth-directed, and it does not convert a catalogue event into an official warning. DONKI describes its near-real-time analyses and model outputs as research/prototyping quality. Source: https://ccmc.gsfc.nasa.gov/tools/DONKI/ and https://ccmc.gsfc.nasa.gov/DONKI/guide/events/

## Near-Earth objects

The object list uses NASA NeoWs Feed API records for one UTC date per request. The “potentially hazardous” label is a catalog attribute; it does not mean impact is predicted. The display's orbit geometry is schematic, not an ephemeris. The NASA DEMO_KEY has lower request limits than a registered API key. Source: https://api.nasa.gov/

## Data-handling principles

- Network failures are reported as unavailable/degraded, never replaced by pretend live readings.
- Last successful fetch time is shown separately from event observation/approach timestamps.
- The ozone calculator labels user-entered values and does not estimate local ozone from a generic number.
- Animated canvases are visual explanations only, not sensor measurements or forecast outputs.

---

<a id="legacy-earthcommand-deployment-note"></a>
## Legacy standalone EarthCommand deployment note (historical)

> This earlier note described a separate `earth-command-center/` application. It is not the deployment procedure for the current 99-file TERRAVEX APEX package.

# GitHub-এ আপলোড নির্দেশনা (বাংলা)

এই প্যাকেজটি আগের IGERS root `index.html` overwrite করে না। এটি নতুন `earth-command-center/` path হিসেবে যুক্ত হবে।

1. ZIP extract করো।
2. Extract করা `earth-command-center` folder-টি তোমার GitHub repository-র root-এ upload করো; folder-এর নাম পরিবর্তন কোরো না।
3. Commit changes করে Pages build/deploy শেষ হলে এই path খুলবে: `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/earth-command-center/`
4. Pages যদি `/docs` directory থেকে deploy হয়, তাহলে folder-টি `/docs/earth-command-center/`-এ রাখবে।
5. পুরোনো homepage থেকে app-এ যেতে চাইলে navigation-এ `<a href="./earth-command-center/">Open EarthCommand</a>` link যোগ করা যায়।


<a id="v50-universal-building-studio"></a>
## v50 Universal Building & Mansion Design Studio

v50 is an additive release built on the consolidated v48 99-file root. It adds a single command-driven design-development monitor for mansion and other civilian building programmes. Supported planning uses include private/multi-generation mansion, apartment, guest/hospitality, office, school, healthcare/clinic, retail, assembly, mixed-use and industrial/warehouse. The room-programme templates can be applied per floor with balcony/verandah options and the floor selector redraws the selected level.

### Stair, lift, roof and exterior
- **Stairs / accessibility:** straight, dog-leg, L-return, scissor and spiral concept geometry; riser/tread/landing/headroom/width inputs; entered exit count, clear width and travel-distance comparisons; ramp-slope fields. This is not a fire-code egress calculation or certification.
- **Lift:** passenger, service/goods, hydraulic, traction and specialist firefighter/evacuation profiles; car/shaft inputs; rated load versus assumed passenger mass; idealized traffic/capacity screen; floors served, pit, overhead, door and manufacturer static/dynamic support reactions. Final shaft, pit, overhead, rail/bracket and machine/support loads must come from the selected lift supplier's project GA and certified technical data.
- **Roof:** occupiable use, tank volume/support footprint, PV area/mass, green-roof saturated load, roof live load, drainage fall and Rational Method runoff estimate. These outputs do not check slab/punching/support capacity or drainage hydraulic design.
- **Exterior:** style/orientation, glazing ratio, cladding dead load, balcony geometry/loading and user-entered net wind pressure. Global facade wind resultant is not local component-and-cladding pressure or anchor design; facade fire, water, thermal, acoustic, guard and waterproofing design remain separate.

### Unified command and drawings
Commands: `HELP`, `CALCULATE`, `FLOOR n`, `ROOM model`, `STAIR CHECK`, `LIFT CHECK`, `VERTICAL CHECK`, `ROOF CHECK`, `FACADE CHECK`, `FACADE STYLE style`, `FRAME RUN`, `COORDINATION CHECK`, `RUN ALL`, `EXPORT DXF`, `REPORT JSON`, `SAVE LOCAL`, `LOAD LOCAL`, `SHAPE name`. The monitor reports unresolved inputs; it is a completeness check, not a BIM clash detector. DXF export is an A3 landscape, millimetre-labelled AutoCAD R12/AC1009 design-review set with floor, roof, stair/lift diagram and elevation layers.

### Structural boundary and use range
Programme/massing planning is available for 1–60 storeys. The embedded linear-elastic Euler–Bernoulli direct-stiffness solver is restricted to one representative 2D frame line and 1–8 storeys. It is not a 3D building analysis; it omits torsion/diaphragm, shear-wall/core interaction, P-Delta, geometric/material nonlinearity, modal/response-spectrum analysis, member strength/design, rebar detailing, slab punching, foundation/pile/soil-structure interaction and full MEP/BIM coordination. The frame test establishes numerical assembly/equilibrium for the specified idealised model only, not real building safety.

All outputs remain `DESIGN DEVELOPMENT / NOT FOR CONSTRUCTION`. Construction-ready documents must be produced and independently checked by the responsible licensed architects/engineers using verified topographic and geotechnical data, adopted code provisions, complete 3D analysis, detailed design, supplier information, inspection/testing specifications, signed drawings and statutory permits. No software can guarantee that an unseen error will not exist.

Current cache: `terravex-apex-shell-v50`. The flat root package contains exactly 99 entries; upload/overwrite the extracted contents at the existing GitHub Pages repository root.


### v50 DXF / geometry validation refinements
- Plan sheets and elevation sheets use independent representative scales; elevations calculate a separate scale to fit the full entered building height and width inside the A3 sheet frame.
- Square and circular concepts use equal bounding dimensions and are constrained to the shorter setback-clear site dimension.
- Room blocks in DXF are schematic programme cells; cells whose corners fall outside the idealized footprint are not drawn. They are not construction partitions or set-out coordinates.
- Stair-section step height uses the calculated actual riser after the target riser is rounded to a whole number of risers.
- When stair or lift shaft dimensions are missing, the DXF labels them as not entered instead of drawing a fabricated default size.
- These safeguards improve drawing honesty and scale discipline but do not turn the package into construction drawings or a code-certified BIM model.
