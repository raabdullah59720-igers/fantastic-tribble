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
- `sw.js`: cache `terravex-apex-shell-v22`; caches local shell assets only and never substitutes cached external feeds as live.
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

The service-worker app-shell cache is `terravex-apex-shell-v22`. The new CSS/JS files are required shell assets. Public network data are fetched on opening the relevant panel or pressing its Refresh button; data are not shown as live if source requests fail.

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

See `EARTH-TRAFFIC-3D-MONITOR.md` for algorithms, caveats, data sources and the test procedure. The PWA shell cache is `terravex-apex-shell-v22`, and the Earth Traffic CSS/JS files are required cached resources.

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

The `mobilenet` page adds a separate monitor panel for the four mobile network operators and tower-sharing categories published by BTRC. The tower-count snapshot is dated April 2026 and is not a live health feed. Default signal-quality values are explicitly synthetic. An operator-authorized read-only HTTPS endpoint can provide `networks[]` measurements, subject to CORS and access approval. The switch starts/stops the local monitoring loop and provider polling only. This panel has no radio transmitter, carrier-frequency control, RF output, or tower ON/OFF command. The app shell cache is `terravex-apex-shell-v22`.


## Earth Orbit Sentinel (added October 2026)

The dedicated `orbitsentinel` panel is integrated into `earth-traffic-monitor.js` / `earth-traffic-monitor.css` to preserve the existing project file count. It fetches CelesTrak GP/OMM records from the Active, Last-30-Days and potential-decay sources in sequence, merges duplicate catalogue IDs, propagates orbital positions through the existing Satellite.js dependency, and plots source-based positions on an original procedural globe. The whole merged feed snapshot is stored in IndexedDB where available. A browser-local catalogue baseline flags newly seen public IDs and new entries in the provider's possible-decay list. Browser notifications are opt-in and require Monitor ON.

CelesTrak GP updates are requested no more frequently than every two hours, in line with the provider's published usage policy. When Monitor is ON, the application recalculates orbital positions locally every 15 seconds and updates the UTC/local clock every second. This is not a live spacecraft link, independent radar, direct telemetry receiver, or detector of objects absent from the public catalogue. A review flag is not evidence of hostile intent.


## Earth Orbit Sentinel and Full Public SATCAT Browser (2026-10-26)

The separate **Earth Orbit Sentinel** page merges public CelesTrak GP/OMM feeds (`ACTIVE`, `LAST-30-DAYS`, `SPECIAL=DECAYING`, and `ANALYST`) and propagates positions with Satellite.js SGP4/SDP4. A full public SATCAT CSV inventory browser now lets the user search Earth-orbit catalogue rows, including payloads/satellites, rocket bodies, debris, unknown object types and other categories. Selecting a SATCAT row shows whether a compatible GP/OMM element record was loaded; metadata-only rows are not plotted at made-up coordinates.

Local UTC/Dhaka clocks update every second. Positions are recalculated locally every 15 seconds while the Monitor switch is ON. CelesTrak GP data is requested no more than every two hours; SATCAT attempts are rate-limited to a 12-hour window. New catalogue entries, unknown-type rows, and provider-listed possible decays create **review alerts**, not threat findings. Desktop notifications require permission and monitoring ON.

The feed cannot detect an object missing from all public catalogues, read private satellite telemetry, or establish hostile intent. The scene is a procedural orbital visualization, not a live camera feed. Public feed reachability depends on browser/network/CORS conditions. See `EARTH-ORBIT-SENTINEL-UPGRADE-NOTES.md`. The PWA shell cache is `terravex-apex-shell-v22`.


## Public Welfare Space Data Hub (cache v22)

The `publichub` page is a separate read-only aggregation panel for the public orbital catalogue state, public SatNOGS observation metadata, NASA DONKI space weather, NASA/JPL NeoWs, and the app's current USGS earthquake/Open-Meteo weather state. It uses existing module state bridges where possible, source timestamps, source-aware caching, browser notification opt-in, and a local JSON snapshot export. Its CSS is bundled into `advanced-workbench.css` and its JavaScript is appended to `mobile-network-monitor.js`, preserving the 98-file project package target. See the source cadence and limitations below.

This does **not** directly connect to every spacecraft or expose private telemetry. GP/OMM position predictions are not live spacecraft packets; SatNOGS observations are crowdsourced and coverage-dependent. The hub has no spacecraft command, RF transmit, or operator-network control functions. CelesTrak refreshes remain bounded by its public usage policy. Cache version is `terravex-apex-shell-v22`.


### Public Welfare Data Hub: sources, cadence, and operation

## What is connected
- CelesTrak GP/OMM and SATCAT state through the existing Earth Orbit Sentinel module.
- Latest public observation metadata from `https://network.satnogs.org/api/observations/?limit=12&ordering=-start` (read-only, cached in the browser for 15 minutes).
- The existing NASA DONKI and NASA/JPL NeoWs module state and refresh methods, which keep their own in-memory response caches.
- The existing app's USGS earthquake and Open-Meteo weather model state, with 5-minute / 15-minute minimum refresh checks in the core app.

## Cadence and honest status
- CelesTrak GP/OMM requests are delegated to Earth Orbit Sentinel, whose source logic applies the two-hour refresh boundary and SATCAT cache. CelesTrak states GP data should be updated no more than once every two hours and SATCAT is manually updated once or twice daily: https://celestrak.org/usage-policy.php
- SatNOGS observation metadata is cached for 15 minutes before another request.
- NASA NeoWs is requested through the existing module, which caches for 30 minutes; the API `DEMO_KEY` may be rate-limited.
- Clock/health display updates every second. This is not the same as receiving a fresh packet every second from a spacecraft.

## Important boundaries
This is a public-data dashboard, not a universal satellite network gateway. Public catalogues and crowd-sourced observations do not expose private mission payloads or create a direct command/telemetry path to every spacecraft. SATCAT rows do not guarantee current orbit elements; GP/OMM positions are propagated from catalogued elements. SatNOGS records show public observations made by participating stations, which depend on station coverage and availability. The hub emits optional informational browser notifications from public data changes; it is not an official emergency dispatch service and does not autonomously infer hostile activity from ordinary feed data.

## Operation
Open **Space & Atmosphere → Public Welfare Data Hub**. `Sync permitted feeds` performs a one-time source-aware refresh. `Start welfare sync` enables local hub monitoring and periodic checks. `Stop welfare sync` stops the periodic hub checks; existing source modules retain their own existing refresh behaviours. `Export hub snapshot (JSON)` saves a source-labelled snapshot to the current device.

## Tests
Run:

```sh
node tests/test-public-welfare-data-hub.cjs
node --check mobile-network-monitor.js
node tests/test-earth-traffic-monitor.cjs  # includes Public Welfare Data Hub helper checks
node --check app.js
node --check space-environment.js
python run-static-qa.py
```

A source adapter reaching `UNAVAILABLE` or `PARTIAL` is not counted as zero activity; it is shown explicitly. This runtime did not perform a full browser-internet/CORS acceptance test.
