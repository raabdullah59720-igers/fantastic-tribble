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
- `sw.js`: cache `terravex-apex-shell-v38`; caches local shell assets only and never substitutes cached external feeds as live.
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

## Space & Atmosphere Observatory (retained module)

Three new panels are included:

- **Ozone & Atmosphere Observatory**: animated explanatory atmosphere/ozone visual, altitude-layer reference, a Dobson Unit to compressed-thickness calculator, and links to the official NASA Ozone Watch maps. The canvas is a schematic, not a current measured ozone map.
- **Solar Activity & Magnetosphere Monitor**: fetches recent solar-flare (FLR), coronal-mass-ejection (CME), and geomagnetic-storm (GST) records from NASA CCMC DONKI. Failed feeds are shown as unavailable; no synthetic events are substituted. DONKI itself describes the system as research/prototyping quality.
- **Near-Earth Object Watch**: requests one UTC day's NASA/JPL NeoWs close-approach feed and displays the catalog's close-approach date, miss distance, relative velocity, estimated diameter and NASA hazardous-object flag. Diagram positions are illustrative, not ephemerides. `DEMO_KEY` is rate limited; add your own NASA API key only in a private local build if needed, and do not commit it publicly.

The service-worker app-shell cache is `terravex-apex-shell-v38`. The new CSS/JS files are required shell assets. Public network data are fetched on opening the relevant panel or pressing its Refresh button; data are not shown as live if source requests fail.

### Scientific references

- NASA Ozone Watch: https://ozonewatch.gsfc.nasa.gov/
- NASA explanation of Dobson Units: https://ozonewatch.gsfc.nasa.gov/facts/dobson_SH.html
- NASA atmospheric layers: https://www.nasa.gov/image-article/earths-atmospheric-layers-3/
- NASA CCMC DONKI: https://ccmc.gsfc.nasa.gov/tools/DONKI/
- NASA Open APIs / NeoWs documentation: https://api.nasa.gov/
- CelesTrak public orbital elements: https://celestrak.org/NORAD/elements/

Run local validation with `python run-space-env-tests.py`; on Windows, `VERIFY-TERRAVEX-SPACE-ENVIRONMENT.ps1` calls the same checks if Python and Node.js are installed.

### VPN bridge QA (optional)

The isolated VPN bridge test suite uses a fake Tailscale CLI and does not turn on/off a real tunnel. Run `python test_vpn_bridge.py` only when `127.0.0.1:8765` is not occupied. The suite covers one-use pairing, expiry, origin allow-list and ON/OFF-only actions.


## Earth Traffic 3D Monitor (new)

The new **Earth Traffic 3D Monitor** page overlays public satellite catalogues and aircraft state vectors on an interactive Three.js Earth. Satellites use CelesTrak GP/OMM JSON, propagated using Satellite.js SGP4/SDP4 to the display time; aircraft are plotted only from returned OpenSky state vectors. Public elements are not direct satellite telemetry, and aircraft positions are not predicted between feed snapshots. The UI reports element epoch/source age, stale/offline states, and partial-feed conditions instead of inserting dummy “live” markers.

- Satellite categories: space stations, weather/Earth observation, GPS operational, GLONASS operational, and bright/visual objects.
- Aircraft feed: OpenSky `/states/all` on a selected geographic region. Manual refresh is the default; optional regional polling is 20 minutes. Global auto-poll is disabled, and the panel reports estimated API credit cost.
- WebGL: Three.js Earth, atmosphere, cloud layer, starfield, graticule, markers and propagated ground-track lines. A schematic 2D fallback is used if WebGL/CDN/texture resources fail. Orbit altitude is visually compressed for legibility; numerical details show propagated altitude.
- Location: only requested after pressing **Use device location**. The coordinates establish a bounded aircraft query region.

Accuracy depends on orbital-element age and provider state-vector freshness. The panel is a real-data monitor with model-propagated satellite positions, not a direct telemetry receiver, radar, aircraft separation system, or navigation-certified display. Live external feeds still need internet and may be limited by CORS or source quotas.

See `EARTH-TRAFFIC-3D-MONITOR.md` for algorithms, caveats, data sources and the test procedure. The current PWA shell cache is `terravex-apex-shell-v38`, and the Earth Traffic CSS/JS files are required cached resources.

## Space Communications & Encrypted Voice Mail (retained module)

- `space-comms-relay.js` / `.css` includes read-only public SatNOGS observation data, official RSCC/ARISS contact-route links, local voice recording/playback/export, WebRTC peer calls and asynchronous internet voice mail.
- **Internet voice mailbox:** generate a private `mailbox-address.encryption-secret` key in the panel. The recipient must save the complete key safely and share it privately with an intended sender. Audio and message metadata are AES-GCM encrypted in the sender's browser before upload and decrypted only in a browser with the matching secret. The service receives the random mailbox address and ciphertext, not the encryption key or plaintext.
- The bundled Node.js 18+ relay is dependency-free: no `npm install` is needed locally. It provides WebSocket signaling and an HTTP API for encrypted voice-mail storage in process memory for up to 24 hours, maximum 8 MiB audio, 8 messages per inbox, and 64 MiB aggregate ciphertext storage. Service restart/deployment can erase messages; delivery is not persistent or guaranteed. Do not use it for emergency-critical messaging.
- Local one-run mode binds to `127.0.0.1:8787` and `127.0.0.1:8000`, so it is for the same computer. To reach another person over the internet, deploy `relay-server/` with the included `render.yaml`, set `ALLOWED_ORIGINS` to your exact public app origin, and configure the deployed `wss://` service URL in the panel. A TURN service may still be needed for some live WebRTC calls.
- Public peer voice call and asynchronous mailbox are real browser-to-browser internet features after the relay is running/deployed. **They are not spacecraft uplink or a Russian-satellite/astronaut inbox.** Direct satellite voice service requires an authorised satellite operator, compatible terminal/subscription, and applicable radio authorisation; ARISS astronaut contacts are arranged through its official contact pathway.

Official routes: [RSCC services](https://eng.rscc.ru/services/), [ARISS contacts](https://www.ariss.org/about-ariss-contacts.html), [BTRC](https://btrc.gov.bd/), and [WebRTC TURN guidance](https://webrtc.org/getting-started/turn-server).

For exact steps, see `SPACE-COMMS-REAL-VOICE-MAIL.md`, `relay-server/README.md`, `PWA-INSTALL-NOW.md`, and `QA_REPORT.md`.


## BTCL Satellite Signal Hub (read-only integration adapter)

The new **BTCL Satellite Signal Hub** is an independent panel. Its local 1 Hz processing loop and signal-flow animation are explicitly labelled DEMO until an authorized BTCL/BSCL telemetry endpoint is configured. The app does not transmit RF, assign frequencies, command a spacecraft, or claim a BTCL network connection. It can parse source-provided read-only JSON from an HTTPS endpoint that permits browser CORS. Provider polling is limited to at least 10 seconds; the local display heartbeat runs every second. Do not paste API secrets into the page. For production use, deploy a provider-approved authenticated backend and use only measurements and carrier assignments supplied by the operator.


## Bangladesh Mobile Network Signal Monitor (receive-only)

The `mobilenet` page adds a separate monitor panel for the four mobile network operators and tower-sharing categories published by BTRC. The tower-count snapshot is dated April 2026 and is not a live health feed. Default signal-quality values are explicitly synthetic. An operator-authorized read-only HTTPS endpoint can provide `networks[]` measurements, subject to CORS and access approval. The switch starts/stops the local monitoring loop and provider polling only. This panel has no radio transmitter, carrier-frequency control, RF output, or tower ON/OFF command. The app shell cache is `terravex-apex-shell-v38`.


## Earth Orbit Sentinel (added October 2026)

The dedicated `orbitsentinel` panel is integrated into `earth-traffic-monitor.js` / `earth-traffic-monitor.css` to preserve the existing project file count. It fetches CelesTrak GP/OMM records from the Active, Last-30-Days and potential-decay sources in sequence, merges duplicate catalogue IDs, propagates orbital positions through the existing Satellite.js dependency, and plots source-based positions on an original procedural globe. The whole merged feed snapshot is stored in IndexedDB where available. A browser-local catalogue baseline flags newly seen public IDs and new entries in the provider's possible-decay list. Browser notifications are opt-in and require Monitor ON.

CelesTrak GP updates are requested no more frequently than every two hours, in line with the provider's published usage policy. When Monitor is ON, the application recalculates orbital positions locally every 15 seconds and updates the UTC/local clock every second. This is not a live spacecraft link, independent radar, direct telemetry receiver, or detector of objects absent from the public catalogue. A review flag is not evidence of hostile intent.


## Earth Orbit Sentinel and Full Public SATCAT Browser (2026-10-26)

The separate **Earth Orbit Sentinel** page merges public CelesTrak GP/OMM feeds (`ACTIVE`, `LAST-30-DAYS`, `SPECIAL=DECAYING`, and `ANALYST`) and propagates positions with Satellite.js SGP4/SDP4. A full public SATCAT CSV inventory browser now lets the user search Earth-orbit catalogue rows, including payloads/satellites, rocket bodies, debris, unknown object types and other categories. Selecting a SATCAT row shows whether a compatible GP/OMM element record was loaded; metadata-only rows are not plotted at made-up coordinates.

Local UTC/Dhaka clocks update every second. Positions are recalculated locally every 15 seconds while the Monitor switch is ON. CelesTrak GP data is requested no more than every two hours; SATCAT attempts are rate-limited to a 12-hour window. New catalogue entries, unknown-type rows, and provider-listed possible decays create **review alerts**, not threat findings. Desktop notifications require permission and monitoring ON.

The feed cannot detect an object missing from all public catalogues, read private satellite telemetry, or establish hostile intent. The scene is a procedural orbital visualization, not a live camera feed. Public feed reachability depends on browser/network/CORS conditions. See `EARTH-ORBIT-SENTINEL-UPGRADE-NOTES.md`. The PWA shell cache is `terravex-apex-shell-v34`.


## Atmospheric Entry & Exit Watch (introduced in cache v26)

The separate `atmoswatch` panel reads CelesTrak's public recently-decayed-object catalogue (`decayed-with-last.php`) when the panel is opened or manually refreshed. Optional monitoring rechecks hourly and can issue browser notifications for newly added catalogue records after the initial baseline. This is a catalogue-change notification, not a real-time radar detection. The source list covers objects with catalogue decay dates; it does not provide a reliable global ground track or exact atmospheric interface-crossing instant.

NASA/JPL fireball records are linked as an independent observation catalogue. NASA states that the records are not real-time and that not all fireballs are reported; its API documentation also says not to embed the API in websites, so this panel links to the official source instead of proxying it. No automatic atmospheric-exit/ascent alerts are claimed because a validated open global real-time crossing feed is not connected.

Stratospheric total-column ozone is linked to NASA Ozone Watch. No made-up Dobson Unit value is displayed; satellite observation dates must be read from the published source. The animation is explicitly schematic. New files `atmospheric-watch.css` and `atmospheric-watch.js` are required service-worker shell assets.


## Thunderstorm Energy Device Digital Twin (2026-11-04, cache v27)

The `stormenergy` page is a standalone iframe-based engineering panel with a Three.js 3D assembly (drag to rotate), local canvas fallback, low-voltage mathematical pulse/conversion/storage model, interlocked local controls, event log, and optional browser notifications for model threshold crossings. The JMA Himawari-9 South Asia public real-time viewer is embedded with direct viewer/index links as fallback. Open-Meteo provides current model context plus hourly precipitation probability and CAPE; these are model values, not lightning detection. Direct lightning-strike sensor, physical device I/O, high-voltage control and spacecraft command interfaces are not connected. See `DATA_SOURCES.md` and `THUNDERSTORM-UPGRADE-INSTALL.txt`.


## Live 3D Earth & Integrated Command (2026-11-05, cache v29)

- A separate `earthcommand` page uses CesiumJS 1.147 and does not replace the existing conceptual Earth globe, Earth Traffic 3D, orbit tracking, hazard, RF, or communications pages.
- Global camera and Bangladesh focus; World Imagery mosaic and optional NASA GIBS VIIRS daily true-colour imagery; optional Cesium ion World Terrain token held in page memory only; optional authorized OGC 3D Tileset URL.
- The existing CelesTrak/satellite.js tracker is exposed through a read-only accessor. Satellite positions are recalculated locally once per second from the epoch of public orbital elements. This is SGP4 propagation, not live spacecraft telemetry or a modem link. Invalid/missing data produces no fake markers.
- The existing Earth Traffic/OpenSky adapter can supply a Bangladesh aircraft state-vector snapshot. This is not a continuous live video feed or a certified air-traffic-control display. Provider resolution, quota, CORS, and coverage govern update timing.
- Existing BTCL/BSCL and SecureLink statuses are summarized without upgrading a DEMO feed or an HTTP health check into proof of satellite connectivity. Authorized provider telemetry endpoints and terminals still need to be supplied and provisioned by their operators.
- New local outbox stores text in the browser and sends only when the user selects the current, connected WebRTC peer. Local storage is not encrypted; queueing is not emergency-grade delivery. Existing voice mailbox remains end-to-end encrypted in-browser but is ephemeral at the relay.
- Existing WebRTC peer links now support optional camera video, selected before the call. Microphone/camera permission and HTTPS are required. A signaling relay and (for some networks) TURN service are still required for internet calls. A separately labelled, explicit Send Current Location action shares only the currently acquired fix with the connected peer; the receiving panel validates and records the coordinate message. The existing SOS packet remains a user-composed peer message, not emergency-services dispatch.
- Earth2 opens as an external platform. This build does not claim a direct Earth2 API/SDK or embedded engine connection. A provider-approved 3D Tiles URL can be loaded independently when a compliant endpoint is supplied.
- Command controls affect the Terravex browser app and read-only data adapters only. There are no spacecraft command uplinks, satellite payload controls, radio transmitters, telecom tower switches, or emergency-service dispatch functions.
- Browser GPS watch is best effort; the device/browser controls update cadence and reported accuracy. Location sharing to other existing Terravex panels is opt-in.
- CesiumJS / imagery need internet. GitHub Pages remains a static front end; voice/video signaling and store-and-forward service need the separately deployed WSS/HTTPS relay already described in this README.


## Live 3D Earth & Command visibility (v29)

- Open the panel from the always-visible **3D Earth** button in the top bar, the highlighted **Live 3D Earth & Command** sidebar item, or the large quick-launch card on the Command Overview page.
- Direct route: append `?page=earthcommand` to the published GitHub Pages URL. Example: `https://OWNER.github.io/REPOSITORY/?page=earthcommand`.
- Deploy the extracted project files directly into the repository root. Do not upload the ZIP as a ZIP file and do not leave the project nested inside `fantastic-tribble-main/`; GitHub Pages must find `index.html` at the published root.
- The service-worker shell is now v29 and asks the browser to check for a worker update on each app visit. After deployment, open the Pages site, then hard-refresh once (Ctrl+Shift+R). If an installed PWA still shows the old interface, close the installed app and reopen the HTTPS Pages URL in Chrome first so the service worker can update.


## Bangladesh Satellite 3D & Imagery Monitor (2026-11-05, cache v30)

- New separate `bangladeshsats` page, registered in navigation and the app command palette. It uses CesiumJS 1.147 with an Esri World Imagery base layer, an approximate Bangladesh monitoring envelope, current satellite markers, and selected-satellite predicted ground track.
- Public CelesTrak GP/OMM groups: Earth-resources, weather, GPS operational, GLONASS operational, Galileo, BeiDou, and space stations. Records are deduplicated by catalogue ID. Satellite.js SGP4/SDP4 propagates the current subpoint locally every second from the last retrieved element set. The data download is not a one-second spacecraft telemetry connection. Orbit catalogue fetches are cached for two hours.
- The register distinguishes ground-track subpoints inside an approximate Bangladesh bounding envelope from satellites geometrically above the Dhaka horizon. The envelope is not a legally exact border polygon. The 24-hour pass forecast samples the predicted ground track in two-minute intervals and refines boundary crossings; output is an estimate dependent on source element epoch and orbit model.
- A dated NASA GIBS image snapshot panel and optional dated image overlay are included. These are processed MODIS/VIIRS image products, not continuous video and not Russian imagery. Download is attempted through browser CORS; the official image source link is the fallback.
- Russian EO candidates are identified by catalogue-name matching across the selected public groups. The panel links to the Roscosmos Geoportal and NTs OMZ. The public Roscosmos portal describes published scenes from Resurs-P, Kanopus-V and Meteor-M, but Bangladesh coverage is not guaranteed. The public portal says new acquisition/order tools are currently limited to federal executive authorities. No direct Russian camera feed, operator API credentials, satellite tasking or spacecraft control are bundled.
- The service-worker cache is `terravex-apex-shell-v34`; the new JS module is a required shell asset.


## Russian Satellite · Bangladesh 3D Command (2026-11-05, cache v31)

- Added a distinct `russiansatbd` page with its own sidebar item, top-bar shortcut and Command Overview launch card. Existing `bangladeshsats` and all other page routes remain.
- Reuses the existing public CelesTrak GP/OMM records and Satellite.js SGP4/SDP4 propagation. The 3D scene marks Russian-labelled Earth-observation candidates and GLONASS navigation records above a Bangladesh-focused World Imagery globe. The map recomputes positions locally once per second; the source orbit elements are not one-second spacecraft telemetry.
- Adds a Russian EO register, a user-triggered next-24-hour Bangladesh ground-track window scan, a selected satellite predicted 45-minute orbit path, and an exportable JSON report. No camera pointing, tasking, acquisition or downlink status is inferred from orbital position.
- Adds a dated NASA GIBS MODIS/VIIRS image preview as an **independent reference image**, explicitly not a Russian satellite scene or live video. The official Roscosmos Geoportal and NTs OMZ operator pages are linked for public scene discovery.
- Russian direct imagery is **NOT CONNECTED**. Roscosmos describes public viewing of published imagery routes and restrictions on certain new-tasking/archive-order tools; NTs OMZ describes contracted EO data services. A real in-app Russian scene requires an authorized provider API/contract, credentials, delivery schema and private server-side integration.
- PWA cache changed to `terravex-apex-shell-v34`. The panel reuses the existing satellite module file, keeping the deliverable at the 99-file limit.
- Validation includes JS syntax, static HTML/navigation/PWA checks, orbit-helper unit tests and existing regression suites. Deployed browser rendering, third-party imagery availability, provider authentication and any real Russian operator delivery feed remain unverified until tested against the user's GitHub Pages origin and authorized account.


## Bangladesh Radiological Safety & Emergency Centre v32 (2026-11-06)

A separate civilian public-safety workspace is available through `?page=radiologicalsafety`, with a Bangladesh 3D globe, a DGHS-hosted district-boundary layer, explicit-coordinate local report markers, session-only unverified observation logging, and BAERA/BAEC/DDM/IAEA reference links. It is not a nuclear facility control system and does not provide weapon design, operations, targeting, satellite command, radiation plume prediction, or automatic protective-action decisions. No live calibrated radiation sensor API, national response network, IAEA IRMIS channel, emergency dispatch, or operator satellite link is connected. Satellite imagery is context only, never a radiation measurement. The 99-file package is maintained by extending existing `index.html`, `app.js`, `hazard-intelligence.js`, and `hazard-intelligence.css`; the PWA cache is `terravex-apex-shell-v34`.

## User-controlled Location Precision & Fix Integrity v33 (2026-11-06)

- Refined the existing `location` panel to display the device/browser-reported horizontal accuracy estimate, a coarse quality band, fix age (fresh/aging/stale), provider disclosure, and an explicit GNSS-satellite-status limitation.
- Uses the browser Geolocation API with `enableHighAccuracy:true`, `maximumAge:1000`, and a 30-second timeout. This is a best-effort device request, not a guarantee of GPS-only positioning, a survey-grade fix, or one update per second.
- Validates latitude/longitude ranges, numeric types, accuracy values and fix timestamps before allowing a new reading to replace the last valid fix.
- Accuracy circle now uses the browser-reported radius only when a valid radius is supplied; the module no longer opens the marker popup on every watch callback.
- Location watch automatically stops when the user navigates away from the Location page or closes/reloads the page. The optional Observatory overlay receives a local in-app last-fix event only after the user enables that checkbox. No app-server upload or persistent storage was added.
- The standard browser API does not reveal which GNSS satellites/constellations or receiver channels produced the location. The panel does not claim a satellite downlink, satellite lock, operator connection, or guaranteed one-second tracking. Device updates depend on handset hardware, permission, sky view, network assistance and browser scheduling.
- Updated service-worker cache v32 → v33; cache diagnostics, installer guidance and QA assertions use the same cache name. Existing panels remain in place; package target remains 99 files.
- Direct panel route: `?page=location`.


## v34 Map & public environmental satellite imagery repair (2026-11-06)
- Fixed Location map startup when the panel is first opened through a direct `?page=location` route: map creation now waits until the container is visible and runs Leaflet `invalidateSize` after navigation.
- Added a Leaflet CDN fallback (jsDelivr, then unpkg) if the primary deferred script is unavailable.
- Added switchable OSM street map, Esri World Imagery mosaic, and dated NASA GIBS MODIS Terra true-colour tiles to the Location map. The UTC date is selectable; the map reports actual tile-load / tile-error events instead of assuming provider connectivity.
- Added JMA Himawari Southeast Asia 1 public RGB composite viewer to the Location and civilian Radiological Safety panels, with direct official-page fallback. A cross-origin iframe load event is not proof that pixels rendered; the user must visually confirm the imagery and provider timestamp.
- Fixed Radiological Safety map startup/refresh and report-layer duplication, added district GIS request retry and NASA GIBS dated imagery overlay with tile health indicators.
- App route now calls the Location panel's visible-entry initializer. PWA cache bumped to `terravex-apex-shell-v34`; external imagery/GIS feeds are not cached as live data.
- No new project files added; package remains exactly 99 project files.


## v35 update — 3D launch and Russian public weather imagery
- Added visible 3D launch controls in the overview and Bangladesh Radiological Safety panel. Direct route: `?page=radiologicalsafety`.
- CesiumJS globe now starts independently of DGHS district GIS success. If the primary Cesium CDN is unavailable, the panel attempts a pinned jsDelivr CesiumJS fallback; imagery tiles try Esri first and OpenStreetMap second.
- Added a user-launched public weather imagery view of the official Russian Elektro-L meteorological portal (`https://electro.ntsomz.ru/en/`) with a direct-open fallback. Its page is titled “Earth in the last twenty-four hours”; the page snapshot inspected on 6 November 2026 displayed entries dated 25–26 October 2026, so freshness is not guaranteed. Verify the newest capture timestamp. This safety panel omits high-resolution EO scene ordering, tasking, target imaging and spacecraft control.
- This is public weather/Earth-observation imagery access, not a direct satellite command/uplink, not a continuous video stream, and not target or person surveillance. Cross-origin iframe load does not prove image pixels or capture time; verify inside the official viewer.
- Service-worker cache: `terravex-apex-shell-v35`.


## v35: explicit 3D launch and public Russian weather imagery

The radiological safety map now exposes visible Launch 3D controls in Overview, the panel header and the globe card. Cesium startup is independent from district-GIS success and is serialized to prevent duplicate Viewer instances. A pinned CDN fallback is attempted if the primary bundle fails. A real Esri imagery tile is probed before the UI reports tile receipt; OpenStreetMap is the fallback. The Russian imagery section opens only the public Elektro-L meteorological imagery portal. Its page heading is not proof of current imagery: the snapshot inspected 6 November 2026 displayed entries dated 25–26 October 2026, so verify the provider timestamp yourself. Cross-origin page load is not proof that image pixels rendered. This is weather imagery, not a spacecraft command link, personal tracking service, guaranteed live video, high-resolution tasking or targeting function. Current service-worker shell cache: `terravex-apex-shell-v35`.


## v36: map launch & public Russian weather view
The Bangladesh Radiological Safety Centre has visible Launch 3D controls in Overview and the panel, an independent Cesium startup path, a pinned CDN fallback, duplicate-start protection, retry-state reset, and sample-tile verification (Esri then OSM). The Russian panel opens only the public Elektro-L meteorological imagery viewer. The page may show older capture times despite its “last twenty-four hours” heading; check the source timestamp. An iframe load is not proof that image pixels rendered. This is public weather imagery, not a spacecraft command link, high-resolution EO tasking, individual tracking or targeting system. Current service-worker shell cache: `terravex-apex-shell-v38`.


## v37 — Integrated civil mobility overlays on the existing 3D Earth

The Live 3D Earth & Integrated Command page has four additional optional overlays on the same Cesium globe: Air Activity Density, Road Congestion, Maritime Activity Density and Authorized Drone Activity. The visual design, existing globe, camera controls, satellite imagery, orbit layer, existing aircraft-snapshot panel controls, location and communications functions remain in place. Air density is coarsened to 1-degree cells and requires at least 10 observations per cell. Road/maritime/drone layers use HTTPS aggregate GeoJSON adapters, require 20 km or coarser resolution and at least 10 observations per cell, and reject individual identifiers. These external layers remain NOT CONFIGURED until a real provider gateway is supplied. No mock live traffic is generated.

Open `?page=earthcommand`. See `DATA_SOURCES.md` for provider/API limitations and the aggregate GeoJSON contract. Current service-worker shell cache: `terravex-apex-shell-v38`.


### v38 marine layer correction
The Maritime card no longer silently waits for an unconfigured AIS provider endpoint. It now loads the public Open-Meteo Marine model over the Bay of Bengal when the Live 3D Earth page opens, and plots broad wave/current condition cells on the same Cesium globe. This is marine-safety weather context, not vessel traffic or navigation-grade data. The card reports source time, fetch time, cell count, mean/maximum wave height and mean current speed. Individual ship positions and routes are not plotted.


## v38 — Marine display correction
The v37 maritime card only had an empty user-supplied AIS aggregate URL field and therefore could not draw anything without a provider. v38 replaces that visible card with an automatically loaded Open-Meteo Bay of Bengal marine-safety model layer on the existing Cesium globe. It plots broad wave-height/current cells and reports model-valid/retrieval time. It does not plot ships, ship identities, routes or naval traffic. If the source is unavailable, the UI explicitly reports the error. Current service-worker shell cache: `terravex-apex-shell-v38`.


## v39 — Civil environmental 3D panels
The Live 3D Earth & Integrated Command page now includes five additional cards: Flood & River Intelligence, Humanitarian Response Network, Forest & Biodiversity Monitor, Ocean & Coastal Intelligence, and Earth Observation Archive. They reuse the same Cesium viewer/camera and do not alter the existing globe or earlier features.

**Real data vs model/catalogue:** GloFAS v4 river discharge is model output, OSM humanitarian facilities are incomplete volunteer-mapped tags aggregated to ~20 km cells, GBIF is published occurrence-record counts (not population/live sightings), Open-Meteo Marine is model output, and STAC/NASA GIBS are dated scene catalogues/imagery (not live video). Source timestamps and retrieval time are described separately. Public feeds may be unavailable due to CORS, rate limits or provider outages.

Open the page with `?page=earthcommand`. Use each card's refresh/search button. Flood, GBIF and archive catalogue requests are attempted on entry; humanitarian OSM aggregation is user-triggered. The NASA VIIRS true-colour overlay can be added/removed without replacing the base imagery.

The package retains exactly 99 root files. PWA service-worker cache: `terravex-apex-shell-v39`.


## v40 — Civil panel visibility and navigation hotfix
The five v39 civil/environmental panels were present in the Live 3D Earth page but located below the long command workspace, without visible jump controls. v40 adds a persistent top-bar Civil 3D shortcut, an Overview launch banner, a five-button quick-jump bar below the Live 3D Earth heading, focus/scroll highlighting, and direct `?page=earthcommand&panel=` routes (`all`, `flood`, `humanitarian`, `forest`, `ocean`, `archive`). Navigation scrolls to the existing panel IDs and retains the same Cesium viewer/camera. No duplicate 3D globe is created. Service-worker cache: `terravex-apex-shell-v40`.

### v40 direct access to civil panels
The `Civil 3D` top-bar shortcut and Overview launch card open the existing Live 3D Earth page and jump to the five civil panels. The five-button strip is immediately below the Live 3D Earth heading. Direct URLs: `?page=earthcommand&panel=all`, `?page=earthcommand&panel=flood`, `?page=earthcommand&panel=humanitarian`, `?page=earthcommand&panel=forest`, `?page=earthcommand&panel=ocean`, and `?page=earthcommand&panel=archive`. These are scroll targets within the same page; they do not create another Cesium viewer. See `PWA-INSTALL-NOW.md` and `DEPLOYMENT_BN.md`. The historical v40 cache was `terravex-apex-shell-v40`; at the v41 release stage the cache was `terravex-apex-shell-v41`.


## v41 — Civil 3D visual studio and source-driven graphics
The five civil/environmental panels now include high-contrast visual stages rendered from actual returned provider data: GloFAS daily river-discharge lines; coarse OpenStreetMap public-resource grid; GBIF regional occurrence bars; Open-Meteo wave-height cells; and public STAC scene-preview thumbnails when the catalogue supplies preview assets. Empty or unavailable sources remain visibly empty; no synthetic observations or stock imagery are substituted. The shared Cesium globe/camera is retained. A Balanced/High/Ultra render-quality selector adjusts Cesium resolution scale and globe screen-space error with a device cap. The Humanitarian summary now auto-loads with the other civil panels on entering Live 3D Earth.

### v41 source and interpretation rules
- GloFAS is a daily simulated river-discharge model, not a river-gauge reading or official warning.
- OpenStreetMap resource summaries are incomplete volunteer-mapped records, aggregated before plotting; not verified shelter capacity or live availability.
- GBIF occurrence records reflect published sampling, not species abundance or live animal sightings.
- Marine charts display Open-Meteo forecast/model grid cells, not vessel movements or navigation-grade hydrography.
- Earth archive thumbnails are source-provided scene previews with acquisition timestamps; imagery is archived/dated, not continuous live video.
- 3D imagery/terrain quality is provider-dependent. Ultra render profile does not create missing terrain or image data.
- Service-worker cache: `terravex-apex-shell-v41`.


## v42 — Engineering Sector / Architecture Feasibility Studio
A separate **Engineering Sector** sidebar entry, persistent top-bar `Engineering` shortcut, Overview launch card and PWA install shortcut open `?page=engineering`. This is a civilian concept-planning tool. The existing Earth/command panels and prior app features remain in place.

### Concept calculations and downloads
- Plot shapes: rectangle, right triangle and circle. Dimension units: m, ft, cm, mm and km. Area display: m², ft², acre, hectare, Bangladesh decimal and km².
- Input changes automatically recalculate the scenario and animated canvas massing; a manual Calculate & Render button remains available.
- Concept storeys: 1–100; user-entered floor-to-floor height, site coverage, FAR limit, authority coverage limit, height limit, glazing allowance and finish allowance.
- Reported outputs: plot area, conceptual footprint, gross floor area, concept height, FAR scenario, plot perimeter and five non-structural surface allowances.
- Downloads: AutoCAD-compatible ASCII DXF in metres (site boundary, conceptual footprint, simplified massing shell and floor-level outlines), CSV finish allowance schedule and JSON scenario report.

### Strict design scope
These outputs are **conceptual planning estimates, not construction drawings, tender BOQ, structural design or a permit**. No beams, columns, slabs, foundations, load paths, structural concrete, structural steel, reinforcement schedules, connection details, military/naval installations or weapon-related facilities are designed. DXF includes only schematic architectural massing. The finish schedule is limited to floor/ceiling finishes, roof membrane, facade finish and glazing surface allowances.

Site-context links include the Bangladesh BNBC 2020 Gazette and RAJUK GIS/planning resources, Copernicus DEM, SoilGrids and OpenStreetMap attribution. DEM and global soil datasets are regional screening inputs, not cadastral/topographic survey, borehole logs, laboratory tests, soil bearing capacity, groundwater or liquefaction assessment. Enter only verified local FAR, coverage and height limits. A licensed architect/engineer must independently perform site survey, geotechnical investigation, structural/fire/MEP/accessibility review and authority submissions before any construction decision.

- PWA shell cache: `terravex-apex-shell-v42`.
- Main page: `?page=engineering`.
- The download contains exactly 99 root files.


### v42 shared 3D Earth overlay and final engineering runtime checks
The Engineering Studio retains its local animated isometric canvas preview and can also plot a true Cesium extruded conceptual building volume, parcel outline and floor-level outlines onto the existing shared `TERRAVEX_EARTH_COMMAND` viewer. The user must enter site latitude/longitude and explicitly choose **Plot concept on shared 3D Earth**. A dedicated **Clear Earth concept** action removes only the entities created by this studio; it does not remove imagery or other viewer layers. Local coordinate projection is schematic/equirectangular and is only appropriate for small parcels; user-supplied coordinates are not survey-verified.

Final runtime validation exercised rectangle, right-triangle and circle area/perimeter, unit conversion, GFA/footprint/FAR/height, 1–100 storey bounds, invalid input rejection, DXF layers/units, and shared Cesium overlay add/clear lifecycle (22 assertions). The generated ASCII DXF was parsed successfully by ezdxf as AC1015 with SITE, FOOTPRINT, MASSING, LEVELS and NOTES layers.

RAJUK's current rules list includes Dhaka Metropolitan Building Construction Regulations 2025. Its ECPS construction-permit FAQ describes the permit process and additional submissions/clearances for projects above 10 floors within its jurisdiction. Confirm the currently applicable local authority rules for every actual parcel; do not copy limits from another site.
