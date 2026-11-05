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
- `sw.js`: cache `terravex-apex-shell-v29`; caches local shell assets only and never substitutes cached external feeds as live.
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

The service-worker app-shell cache is `terravex-apex-shell-v29`. The new CSS/JS files are required shell assets. Public network data are fetched on opening the relevant panel or pressing its Refresh button; data are not shown as live if source requests fail.

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

See `EARTH-TRAFFIC-3D-MONITOR.md` for algorithms, caveats, data sources and the test procedure. The current PWA shell cache is `terravex-apex-shell-v29`, and the Earth Traffic CSS/JS files are required cached resources.

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

The `mobilenet` page adds a separate monitor panel for the four mobile network operators and tower-sharing categories published by BTRC. The tower-count snapshot is dated April 2026 and is not a live health feed. Default signal-quality values are explicitly synthetic. An operator-authorized read-only HTTPS endpoint can provide `networks[]` measurements, subject to CORS and access approval. The switch starts/stops the local monitoring loop and provider polling only. This panel has no radio transmitter, carrier-frequency control, RF output, or tower ON/OFF command. The app shell cache is `terravex-apex-shell-v29`.


## Earth Orbit Sentinel (added October 2026)

The dedicated `orbitsentinel` panel is integrated into `earth-traffic-monitor.js` / `earth-traffic-monitor.css` to preserve the existing project file count. It fetches CelesTrak GP/OMM records from the Active, Last-30-Days and potential-decay sources in sequence, merges duplicate catalogue IDs, propagates orbital positions through the existing Satellite.js dependency, and plots source-based positions on an original procedural globe. The whole merged feed snapshot is stored in IndexedDB where available. A browser-local catalogue baseline flags newly seen public IDs and new entries in the provider's possible-decay list. Browser notifications are opt-in and require Monitor ON.

CelesTrak GP updates are requested no more frequently than every two hours, in line with the provider's published usage policy. When Monitor is ON, the application recalculates orbital positions locally every 15 seconds and updates the UTC/local clock every second. This is not a live spacecraft link, independent radar, direct telemetry receiver, or detector of objects absent from the public catalogue. A review flag is not evidence of hostile intent.


## Earth Orbit Sentinel and Full Public SATCAT Browser (2026-10-26)

The separate **Earth Orbit Sentinel** page merges public CelesTrak GP/OMM feeds (`ACTIVE`, `LAST-30-DAYS`, `SPECIAL=DECAYING`, and `ANALYST`) and propagates positions with Satellite.js SGP4/SDP4. A full public SATCAT CSV inventory browser now lets the user search Earth-orbit catalogue rows, including payloads/satellites, rocket bodies, debris, unknown object types and other categories. Selecting a SATCAT row shows whether a compatible GP/OMM element record was loaded; metadata-only rows are not plotted at made-up coordinates.

Local UTC/Dhaka clocks update every second. Positions are recalculated locally every 15 seconds while the Monitor switch is ON. CelesTrak GP data is requested no more than every two hours; SATCAT attempts are rate-limited to a 12-hour window. New catalogue entries, unknown-type rows, and provider-listed possible decays create **review alerts**, not threat findings. Desktop notifications require permission and monitoring ON.

The feed cannot detect an object missing from all public catalogues, read private satellite telemetry, or establish hostile intent. The scene is a procedural orbital visualization, not a live camera feed. Public feed reachability depends on browser/network/CORS conditions. See `EARTH-ORBIT-SENTINEL-UPGRADE-NOTES.md`. The PWA shell cache is `terravex-apex-shell-v29`.


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
