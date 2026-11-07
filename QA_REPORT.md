# TERRAVEX APEX — Earth Traffic 3D Monitor Upgrade QA

Build: **Earth Traffic 3D Monitor + previous space communications, hazard, RF, VPN and PWA modules**  
Service-worker cache: `terravex-apex-shell-v22`  
Verification date: **25 October 2026**

## Deliverable

- Project files: **92** after excluding Python bytecode/cache artifacts; below the 98-file project limit.
- `index.html` is at ZIP root; all prior panels remain in the complete project.
- New files: `earth-traffic-monitor.js`, `earth-traffic-monitor.css`, `test-earth-traffic-monitor.cjs`, and `EARTH-TRAFFIC-3D-MONITOR.md`.

## Earth Traffic 3D Monitor

- **Satellites:** requests CelesTrak GP/OMM JSON categories (stations, weather/Earth observation, GPS operational, GLONASS operational, and visual objects), caches successful catalogues locally for up to 2 hours, and propagates each record using Satellite.js `json2satrec`, `propagate`, `gstime`, and `eciToGeodetic`.
- **Aircraft:** optional OpenSky `/states/all` bounding-box query; validates state-vector latitude/longitude and null values, filters grounded aircraft when selected, and plots only provider-returned states without estimating positions between snapshots.
- **Source age:** element epoch age, aircraft state timestamp, stale/offline and partial-feed statuses are displayed.
- **Quota policy:** manual aircraft refresh by default, a 60-second request guard, optional 20-minute auto-refresh for bounded regions only, and no global auto-polling. Estimated OpenSky credit cost is reported from bounding-box area.
- **3D render:** Three.js/WebGL Earth, atmosphere, optional cloud texture, graticule, stars, satellite markers, aircraft markers and propagated ground-track lines. Altitude display is visually compressed for legibility; numerical data use propagated altitude. A labelled schematic canvas fallback is used if WebGL/CDN or remote texture loading fails.
- **Location:** coordinates are requested only after the user clicks **Use device location** and are used to construct a bounded aircraft region.

## Static QA

- HTML parsed: **736 IDs, 0 duplicates**.
- Local HTML/asset references: **0 missing**.
- PWA manifest: valid JSON; `standalone`; 192x192 and 512x512 icons present; **11 shortcut targets, 0 invalid**.
- Service worker: `terravex-apex-shell-v22`; **41 required local app-shell resources, 0 missing**.
- PWA diagnostics/cache version parity: **PASS**.
- JavaScript syntax: **20 root JS files, 0 syntax errors**.
- CSS parser: **17 stylesheets, 0 parse errors**.
- Python syntax: **4 files checked**.
- Launcher asset checks: **PASS** (Windows runtime execution is not available in this QA environment).
- Static QA aggregate: **0 errors**.

## Functional/regression tests

- Earth Traffic 3D monitor: **25 assertions PASS** (PWA integration, coordinate transforms, display-radius transform, mocked satellite propagation, malformed/null aircraft state rejection, airborne-only filter).
- PWA omnibox: **9/9 PASS**.
- RF interference simulator: **5/5 PASS**.
- Space environment: **11 assertions PASS**.
- Connectivity/link-budget: **6 assertions PASS**.
- Space communications relay UI/data: **16 assertions PASS**.
- Encrypted voice-mail service checks: **PASS**.
- Dependency-free signaling/mailbox relay: **14 integration check groups PASS**.
- VPN bridge fake-client/security tests: **11/11 PASS**.
- ZIP CRC test: **PASS**.

## Scientific and operational limitations

- Satellite markers are **model-propagated positions from public orbital element epochs**, not direct satellite telemetry. Accuracy depends on element age, the orbit model, maneuvers, record validity and propagation errors. The UI warns for missing or older-than-72-hour epochs.
- Aircraft markers represent **provider state-vector snapshots**. OpenSky anonymous data is rate-limited, has 10-second time resolution and uses request credits; current quotas and access rules may change. Browser CORS, network policy, or provider limits can make the feed unavailable.
- Satellite catalogue, aircraft and texture feeds have not been verified live from the end user's browser in this runtime. Failure is labelled rather than replaced with synthetic “live” objects.
- This is not a certified air-traffic-control, collision-avoidance or navigation display.
- Native Windows installation, GitHub Pages deployment, public API reachability, and a live browser-to-browser voice/satellite connection were not verified in this run. Static PWA checks do not guarantee Chrome will display its Install UI under every browser policy/profile.

## Reproducible checks

```bash
node test-earth-traffic-monitor.cjs
python run-static-qa.py
node test-pwa-omnibox.cjs
node test-rf-interference-intelligence.cjs
node test-space-environment.cjs
node test_connectivity_lab.js
node test-space-comms-relay.cjs
node test-voice-mail-service-v16.cjs
node test-relay-server.cjs
python test_vpn_bridge.py
python run-space-env-tests.py
```

Passing checks establish package and simulated integration behaviour only. They do not establish current public API delivery, exact real-world orbital accuracy, an air-traffic-control function, or successful hosting/deployment.


## BTCL Satellite Signal Hub add-on QA

- New dedicated navigation route and page: `btclhub`.
- Switch controls the local 1 Hz engine and stops the authorized-feed polling timer when OFF.
- Demo data, source feed status, and carrier assignment have separate labels; demo values are not described as measured data.
- Approved endpoint adapter accepts HTTPS read-only GET only; expects timestamped `links[]` JSON and uses a minimum 10-second remote polling interval while local processing remains 1 Hz.
- No RF transmitter, radio configuration command, frequency assignment, satellite command, or real BTCL credentials are included.
- Service-worker cache version bumped and both new assets added to the required shell.
- Static structural tests are supplied in `tests/test-btcl-signal-hub.cjs`. Real provider connection and end-user browser CORS are not verifiable without an authorized provider endpoint.
- Browser-level headless visual smoke test did not complete in this runtime; no claim is made that the rendered UI was confirmed in the user's Chrome or on a deployed site.

## Additional upgrade: Bangladesh Mobile Network Signal Monitor (2026-10-26)

- Added a standalone Operations panel (`mobilenet`) without replacing the existing BTCL satellite hub, RF intelligence, Earth Traffic, Space Environment, PWA, or communication modules.
- Default state is OFF. ON/OFF applies only to the app-local 1 Hz monitoring loop and authorized read-only HTTPS polling. There is no RF transmitter API, frequency-setting command, or tower ON/OFF implementation.
- BTRC published tower inventory is displayed as an April 2026 snapshot (reported national total 46,286); it is explicitly not a live tower-health feed.
- Demo RSRP/SINR/latency values are labelled synthetic. A live mode requires operator-authorized `networks[]` JSON and successful HTTPS/CORS access. A failed live feed is never replaced with demo readings.
- New panel tests: 15/15 PASS; previous BTCL hub: 13/13 PASS; Earth Traffic: 25 assertions PASS; PWA: 9/9 PASS; RF panel: 5/5 PASS; Space Environment: 11 assertions PASS; Space Communications: 16 assertions PASS; relay/mailbox suite: 14 check groups PASS.
- VPN bridge tests: 11/11 PASS on isolated rerun. One earlier combined-suite run experienced a transient HTTP test timeout; the repeated isolated run passed.
- Static QA after upgrade: HTML parsed; 0 duplicate IDs; no missing local HTML references; cache v22 has 45 required local assets and 0 missing; 22 JS files syntax-checked; 19 CSS files parsed with 0 parse errors; TOTAL ERRORS: 0.
- Runtime limitation: no actual BTCL/BSCL or mobile-network operator feed was provided, and this package was not connected to nationwide tower infrastructure or validated in a deployed browser. No RF transmission occurs.


## Earth Orbit Sentinel / SATCAT full-inventory upgrade (2026-10-26)

- Added a searchable/paginated public SATCAT list for Earth-orbit catalogue rows, including metadata-only records without loaded propagatable elements. The object browser distinguishes `GP/OMM matched` from `no loaded GP match`.
- CSV parser validates required SATCAT fields, respects quoted commas/doubled quotes, excludes non-Earth orbit and missing orbit-type rows, and keeps object metadata for the inventory list. It includes `ORB` and `DOC` Earth-centred catalogue records.
- Added a persistent SATCAT baseline: the first snapshot establishes baseline without noisy alerts; newly appearing catalogue rows and unknown object types are emitted as **review notifications only**. Existing GP ID and possible-decay review alerts remain unchanged.
- Source policy: GP elements minimum 2-hour query interval; SATCAT query attempt throttled to 12 hours, consistent with CelesTrak's stated update cadence. Local position propagation runs at 15 seconds while the monitor is ON.
- PWA service-worker shell incremented to `terravex-apex-shell-v22` and PWA diagnostics/tests updated to match.
- SATCAT parser and delta test fixture covers quoted commas, Earth vs non-Earth filtering, docked records, missing orbital-type exclusion, payload/debris counts, full inventory row retention, first-baseline no-alert behaviour, and new-ID review alert behaviour.
- Final bundle composition: 98 project files after excluding Python bytecode cache and root `.gitignore`; existing feature modules and support files remain in the archive.
- Current static QA: 837 HTML IDs, no duplicate IDs, no missing local references, 22 JavaScript files syntax-checked, 19 stylesheets parsed, PWA cache version v22, zero errors.
- Live external-feed fetch and installed-Chrome visual runtime are not verified in this container. A CORS/rate-limit/source failure is intentionally displayed as unavailable or degraded, not as live data.


## Atmospheric Entry & Exit Watch add-on QA (2026-11-03)

- Added a separate `atmoswatch` navigation page and PWA shortcut. Existing Ozone Observatory and all other panels remain in place.
- Added `atmospheric-watch.js` and `atmospheric-watch.css`; both are required service-worker assets. App-shell cache bumped to `terravex-apex-shell-v22`; PWA cache diagnostics and tests match v22.
- CelesTrak Recently Decayed Objects page parser reads source-provided international designator, catalogue number, object name, decay date and last-element timestamp from provider table rows. UTC timestamps are normalized; signed decay-date/last-epoch difference is displayed without converting it into an ungrounded position or location.
- Optional browser alerts fire only when new catalogue rows appear after the initial baseline. Browser monitor polling is hourly and only while the app remains open and the panel is active. Notifications do not claim real-time radar detection.
- NASA/JPL fireball source is linked, not embedded: NASA states fireball data are not real-time and not all events are reported; the API documentation prohibits embedding its APIs in websites. A validated global ascent/atmospheric-exit feed is not available in this package, so exit alerts are explicitly marked `NOT LIVE`.
- NASA Ozone Watch is linked as the source for satellite-derived total-column ozone products. No current Dobson Unit measurement is invented; the animated Earth/atmosphere scene is labelled schematic.
- Final ZIP target: **99 files**. Five unreferenced standalone guide documents were omitted to keep the one-upload package within the requested count; application modules, assets, launchers, tests and core installation instructions remain.
- Static QA: 855 HTML IDs, 0 duplicates; no missing HTML resources; 13 PWA shortcuts, 0 invalid; 47 required service-worker assets, 0 missing; 24 root JavaScript files syntax-checked; 20 CSS files parsed with 0 errors; aggregate 0 errors.
- Regression: Earth Traffic 25 assertions; PWA 9 checks plus new watch structure; Space Environment 11 assertions; RF 5 checks; Space Communications 16 assertions; relay/mailbox 14 integration check groups; connectivity 6 assertions; VPN bridge 11 tests. All passed in this environment.
- Runtime limitation: external CelesTrak browser CORS/reachability, browser notification permission, GitHub Pages deployment and visual behaviour in the end-user Chrome profile cannot be verified in this local build environment. A feed failure is reported as degraded; no synthetic live events are substituted.


## Asia Regional Activity Watch add-on QA (2026-11-03)

- Added a distinct `intrusionwatch` page/navigation route: **Asia Regional Activity Watch**. Existing Earth Traffic, Earth Orbit Sentinel, Ozone/Atmospheric Watch and other app panels are retained.
- Reused the existing OpenSky state-vector module instead of adding another copy of the API client. Added a broad Asia observation envelope (45°E–155°E, 10°S–60°N) and South Asia, Bangladesh/Bay of Bengal, Southeast Asia and East Asia rectangular analysis zones.
- Added a separate interactive Three.js Earth scene with source-derived aircraft markers and a selected-zone outline; the basemap texture is explicitly described as visual reference artwork, not live satellite imagery. A labelled fallback renderer is used when WebGL is unavailable.
- Entry/exit events require two recent, ordered position-bearing observations on opposite sides of the selected zone boundary and a gap no greater than 30 minutes. First-seen objects and stale/missing positions do not produce crossing alerts. Each event records ICAO24, callsign/country as returned, last observed coordinates, reported altitude where available, UTC observation interval, source and `AUTHORISATION UNKNOWN` review status.
- Added local-only event persistence, browser permission-based notifications, 15-minute broad-region request cooldown, zone filters and CSV export. Ship AIS, global drone/non-cooperative target feeds and ground object tracking are shown as not connected; no synthetic tracks are inserted.
- PWA app-shell cache incremented to `terravex-apex-shell-v26`; PWA runtime diagnostics and tests were updated. No new files were needed; the new route and view are modular additions inside the existing Earth Traffic module files.
- Package count: **99 files** (the project remains within the requested one-upload limit).
- Latest static QA: HTML parsed, 882 IDs and 0 duplicate IDs; no missing local references; 47 required service-worker assets and 0 missing; service-worker/PWA diagnostics parity v24; 24 JS files syntax-checked; 20 CSS files parsed with 0 errors; 13 manifest shortcuts with 0 invalid targets; aggregate 0 errors.
- Regression tests: Earth Traffic + Asia Activity Watch **45 assertions PASS**, PWA **9/9**, relay/signalling **14 check groups**, RF **5/5**, Space Communications **16 assertions**, Space Environment **11 assertions**, connectivity **6 assertions**, voice-mail static tests PASS, VPN bridge **11 tests**, and npm server syntax check PASS.
- Runtime limitations: OpenSky browser CORS/provider reachability, current API quota, browser notification delivery and GitHub Pages deployment were not tested against the end-user's browser. OpenSky documents 400 anonymous credits/day and a 4-credit cost for broad (>400 sq°) state-vector queries; 15-minute polling is a conservative client-side limit for this panel. OpenSky's API is for research/non-commercial use unless commercial permission is granted.
- Classification limitation: a geofence transition is only a public-data review cue. The panel does not establish that an aircraft was unauthorised, detect aircraft without usable ADS-B data, or function as an air-traffic-control/security sensor.


## Asia Activity Watch visual reliability fix (2026-11-03)

- Corrected deferred rendering: the 3D scene is initialized only after the user opens the hidden panel, when the container has real dimensions.
- Added an embedded procedural vector Earth texture (continents, graticule and ocean shading) as the immediate Three.js basemap; the external Three.js example texture is now optional enhancement only. This prevents the scene from becoming a plain blue sphere when the external texture host is unreachable.
- Enhanced the 2D fallback canvas with visible landmass shapes so a globe remains visible when WebGL or the Three.js CDN is unavailable.
- Bumped the PWA shell cache to v24 and updated PWA diagnostics and installation guidance so old cached files are replaced.
- Verification: `node --check` passed; all 7 bundled CJS suites passed (45 Earth/Asia assertions, 9 PWA checks, 14 relay groups, 5 RF checks, 16 space-communications assertions, 11 space-environment assertions, voice/mailbox suite); `python run-static-qa.py` reported 0 errors.
- Limitation: Chromium headless visual capture was attempted but could not complete in this container because the browser's GPU/WebGL runtime failed to initialize. The application visual must still be confirmed on the user's target Chrome/device after deployment. The reference picture in chat is not itself embedded as an image; the globe is rendered locally by the panel code.


## Thunderstorm Device Digital Twin upgrade (2026-11-04)

- Fixed the root-level optimized WebP paths; the standalone iframe no longer expects a nonexistent `assets/` directory.
- Added a dedicated digital-twin control plane with an interlock, start/pause, low-voltage model pulse, model pulse cycle, safe stop/disarm, local event log and opt-in browser notifications. These controls do not operate hardware.
- Added a rotating Three.js device assembly with pointer-drag rotation and a local isometric canvas fallback.
- Embedded the official JMA South Asia public real-time viewer; direct viewer and image-index links remain available if the remote page refuses iframe embedding.
- Corrected the weather-field semantics: the module now requests documented hourly `precipitation_probability` and `cape`, not an assumed `thunderstorm_probability` or regional `lightning_potential` field. The interface explicitly states lightning-strike detection is not connected.
- Added a small live data/status integration card to the existing Storm Watch panel; the full device remains a separate page.
- PWA cache incremented to v26. Browser visual capture was attempted in the build container but Chromium headless did not complete; visual verification on the deployed Chrome installation remains outstanding.


## Thunderstorm Digital Twin final package verification (2026-11-04)

- Bumped the current PWA shell from **v26 to v27** so installed users of the previous Asia Activity Watch build receive a new cache namespace and replace stale panel files. Updated cache diagnostics, tests and install guidance to v27.
- Final archive composition: **99 files total**. Removed four unreferenced high-resolution PNG duplicates because equivalent optimized WebP artwork is referenced by the panel, plus one unreferenced short relay guide. Runtime assets, primary launcher/install instructions, app modules and tests remain.
- Promoted the four local Thunderstorm WebP artworks from optional to **required offline shell assets**. The PWA v27 diagnostics now verify the dedicated panel HTML/CSS/JS and all four artworks are cached; this prevents an installed/offline panel from silently missing its device artwork.
- Safety/control refinement: turning the local simulation interlock OFF now stops an active model pulse cycle and clears pending simulated pulse visuals. Safe Stop also disarms local controls. The physical hardware I/O indicator remains **NOT CONNECTED**; no remote device actuation or satellite command channel is represented.
- Final static QA: 885 main-app HTML IDs, 0 duplicates; standalone Thunderstorm panel 88 IDs, 0 duplicates; no missing local resource references; 51 required PWA resources, 0 missing; PWA cache diagnostics parity PASS; 13 manifest shortcuts, 0 invalid; 24 JavaScript files syntax-checked, 0 errors; 20 stylesheets parsed, 0 errors; Python syntax checks PASS; aggregate **0 static QA errors**.
- Regression suites: Earth Traffic/Activity Watch 25 assertions PASS; Space Environment 11 assertions PASS; PWA 9/9 PASS; RF Intelligence 5/5 PASS; Space Communications 16 assertions PASS; relay/mailbox 14 integration check groups PASS; local VPN bridge 11 tests PASS. The VPN bridge test was rerun after stopping a leftover local preview server that had occupied its fixed test port; the clean rerun passed.
- Browser runtime limitation: Chromium headless visual capture did not complete successfully in this container, so final deployed Chrome/WebGL appearance, JMA iframe embedding, API CORS and external feed availability are **not claimed as verified**. The page supplies a local canvas fallback when Three.js/WebGL is unavailable, and direct JMA viewer links remain available if the provider refuses iframe embedding.


## Live 3D Earth & Integrated Command upgrade (2026-11-05, cache v28)

- Added a separate `earthcommand` navigation page and PWA shortcut. Existing pages and routes are retained.
- CesiumJS 1.147 is loaded from the official Cesium CDN. The scene uses a WGS84 ellipsoid, World Imagery mosaic, optional NASA GIBS VIIRS daily imagery, optional Cesium ion terrain, and optional external OGC 3D Tiles.
- Read-only accessors expose current CelesTrak/Satellite.js element records and WebRTC peer state; the new 3D panel propagates positions locally at 1 Hz. It does not claim 1 Hz satellite downlink or control.
- Added opt-in browser location marker/watch and a separate browser-local message outbox. Outbox is plaintext localStorage; messages are only submitted after an explicit user action to the currently connected browser peer.
- Added optional camera video to the existing WebRTC voice/text system. Camera is included only when selected before a new peer session; HTTPS and explicit browser permission are required.
- External Earth2 SDK/API embed was not confirmed or configured. Earth2 opens externally; an independent HTTPS OGC 3D Tiles URL can be supplied where the owner/operator provides an authorized tileset and CORS access.
- Static GitHub Pages cannot make an unauthorized satellite uplink, activate satellite/telecom hardware, or guarantee all-network coverage. Provider telemetry needs operator endpoint, credentials, modem/terminal, service plan and local regulatory authorization.
- PWA cache changed from v27 to v28. Final archive target: 99 files; four unreferenced PNG duplicates and the unused short relay guide are excluded, while referenced WebP artwork, original modules, existing scripts, tests, launchers and install instructions remain.
- End-user browser checks for Cesium CDN, NASA/Esri tile reachability, ion token, Earth2 API, OpenSky/CelesTrak, provider CORS, camera, GPS, WSS/TURN and satellite terminal connectivity cannot be completed without the user's deployed origin, permissions, accounts and provider equipment. These states remain explicitly not verified until those resources respond.

- Final integration refinement: added an explicit one-time GPS location share over the existing WebRTC data channel, a validated receive handler, and a visible shortcut to the existing SOS panel. No background location broadcast is enabled.
- Final static QA after this refinement: 943 main-app HTML IDs, 0 duplicates; 0 missing local references; 51 required service-worker shell assets present; 24 JavaScript files syntax-checked; 20 stylesheets parsed; PWA cache parity v28; Earth Traffic 25 assertions; Space Communications 16 assertions; PWA 9/9; aggregate 0 static QA errors.
- Existing test suites passed in this environment: Earth Traffic, PWA, RF Intelligence, Space Communications, Space Environment, relay/signalling integration, voice-mail static checks, connectivity lab, VPN bridge (11 tests), and space environment aggregate runner. The headless Chromium visual runtime attempt timed out, so browser rendering and third-party live feed connections remain unverified; verify on HTTPS GitHub Pages after upload.


## v29 visibility hotfix (2026-11-05)
- Added a permanent top-bar 3D Earth shortcut, a prominent Command Overview launch card and highlighted sidebar navigation item. All three routes target the existing `earthcommand` page; no existing page or feature was removed.
- Added direct route instructions (`?page=earthcommand`) and explicit GitHub Pages root-upload instructions to address nested-folder / ZIP-upload mistakes.
- Updated service-worker cache from v28 to v29 and now requests a service-worker update check on app visits.
- Static verification: `page-earthcommand` still exists exactly once; all three launch controls target `earthcommand`; nav item remains registered; service-worker and documentation cache versions agree at v29.
- Browser/runtime integration with third-party Cesium imagery, GPS, satellite feeds and peer relay still requires the deployed HTTPS origin and browser permissions.
- v29 test rerun after visibility hotfix: static QA 0 errors; Earth Traffic 25 assertions; PWA 9/9; relay/signalling + encrypted mailbox 14 groups; RF 5/5; Space Communications 21 assertions; Space Environment 11 assertions; voice-mail static checks passed; VPN bridge 11/11; connectivity 6/6; Node relay server syntax check passed.
- Package hygiene: removed the obsolete `UPLOAD-THIS-FOLDER.txt` stub, whose old earth-command-center subfolder instructions contradicted this root-deployable project. The v29 delivery archive is exactly 99 files at ZIP root.


## Russian Satellite · Bangladesh 3D Command v31 (2026-11-05)

- Separate `russiansatbd` route added with sidebar, top-bar and Overview entry points. Existing Bangladesh Satellite 3D panel retained.
- Shared existing CelesTrak GP/OMM + Satellite.js module exposes read-only Russian-labelled EO / GLONASS catalogue records and propagation for this new panel. No second orbital feed or new source file added.
- 3D viewer, local 1 Hz SGP4 refresh, satellite register, selected 45-minute path, and user-triggered 24-hour regional ground-track forecast added. One-second update is local calculation, not spacecraft telemetry.
- NASA GIBS imagery is labelled independent/date-stamped. Russian Geoportal and NTs OMZ are linked as official scene archive/operator sources. Direct Russian camera/API is explicitly NOT CONNECTED.
- PWA cache bumped v30 → v31; new route added to manifest shortcut. Package remains capped at 99 files after excluding generated Python bytecode cache.
- External source terms: Roscosmos Geoportal publishes up to 50 daily routes from Resurs-P, Kanopus-V and Meteor-M; its public page says published scene viewing is available to all, while some ordering/new-acquisition functions are restricted. NTs OMZ provides contracted Russian EO data services.
- Browser/WebGL imagery, GIBS image response, real Russian imagery delivery and operator credential integration are not claimed as verified in this container.

- Final v31 regression run: Earth Traffic 25 assertions; PWA 9 baseline checks + 9 Russian BD navigation/integration checks; Relay/mailbox 14 groups; RF 5/5; Space Communications 21 assertions; Space Environment 11 assertions; voice-mail checks passed; Connectivity 6 assertions; VPN bridge 11 tests; aggregate static QA 0 errors.
- New panel direct route: `?page=russiansatbd`. GitHub Pages install remains root-folder replacement; upload the extracted 99-file package contents, not the ZIP as a single repository file.


## Bangladesh Radiological Safety & Emergency Centre v32 (2026-11-06)

- Added a separate civilian public-safety page and top-bar/sidebar/overview shortcuts.
- Includes a Cesium 3D Bangladesh view, Leaflet district map with live public GIS boundary request, explicit-coordinate local report pins, session-only local report log and JSON export.
- Source links: BAERA, BAEC radiation protection, DDM AWARE warnings/shelters, IAEA IEC/IRMIS context and Bangladesh NSDI. No sensor API, operator satellite link, emergency dispatch or official IAEA/national network integration is claimed.
- All user-entered reports are marked unverified; no readings are automatically classified as safe/unsafe. No dispersion/plume or weapon-oriented module is present.
- Package target remains 99 files; PWA cache v32.


### v32 verification detail

- `node --check app.js`: PASS.
- `node --check hazard-intelligence.js`: PASS.
- `node test-pwa-omnibox.cjs`: base PWA 9 checks, prior Russian Bangladesh 9 checks + 5 bootstrap checks, new Radiological Safety Centre 12 integration assertions: PASS.
- `node test-earth-traffic-monitor.cjs`: 25 assertions PASS.
- `node test-rf-interference-intelligence.cjs`: 5/5 PASS.
- `node test-space-comms-relay.cjs`: 21 assertions PASS.
- `node test-space-environment.cjs`: 11 assertions PASS.
- `node test-voice-mail-service-v16.cjs`: PASS.
- `node test_connectivity_lab.js`: 6 assertions PASS.
- `python test_vpn_bridge.py`: 11 tests PASS.
- `python run-static-qa.py`: HTML 1050 IDs, 0 duplicate IDs, no missing local references, PWA cache parity PASS, 25 JavaScript files syntax checked, 20 stylesheets parsed, 0 errors.
- The runtime container has no outbound DNS/network to `gis.dghs.gov.bd`, so the remote district GeoJSON service could not be exercised here. No browser/WebGL screenshot was captured in this environment. The app explicitly labels this source unavailable when a live browser request fails.
- Windows launcher and deployed GitHub Pages runtime are not tested in this Linux container.

## User-controlled Location Precision & Fix Integrity v33 (2026-11-06)

- Patched `geolocation-live.js` and the existing Location page in `index.html`; no new project file was added and existing page routes/features were retained.
- Added device/browser fix age, stale-state display, accuracy quality band, provider disclosure, and GNSS satellite status disclosure. All values are sourced from the browser position object; no simulated satellite reception is inserted.
- Added strict coordinate/timestamp/accuracy validation. Invalid callback payloads cannot overwrite the last valid fix.
- Accuracy circle uses the reported accuracy radius when present; repeated watch callbacks no longer force-open the marker popup.
- Watch lifecycle is user-controlled: explicit start/stop, stop on navigation away from the Location panel, and cleanup on pagehide/beforeunload. Optional Observatory sharing dispatches only a local, consent-tagged last-fix event.
- `test-pwa-omnibox.cjs`: new device-location runtime mock checks cover high-accuracy request hint, maxAge setting, accuracy display, source/satellite disclosure, fresh age, opt-in local overlay, invalid-fix rejection, manual stop and automatic stop on navigation. 19 assertions passed.
- Static QA: 1,055 HTML IDs, 0 duplicates; no missing local references; 52 required service-worker assets, 0 missing; PWA cache/diagnostics parity `terravex-apex-shell-v34`; 25 JavaScript files syntax checked, 0 errors; 20 CSS files parsed, 0 errors; Python syntax checks passed; aggregate 0 static QA errors.
- Regression suites: Earth Traffic 25 assertions; PWA baseline 9/9; Russian Satellite route 9 assertions + 5 bootstrap checks; Radiological Safety 12 assertions; device location 19 assertions; RF 5/5; Space Communications 21 assertions; Space Environment 11 assertions; relay/mailbox 14 integration groups; voice-mail static checks; Connectivity 6 assertions; VPN bridge 11 tests. All passed.
- Safety/accuracy limit: the browser Geolocation API does not expose the specific GNSS satellites, carrier channels or receiver lock. This update provides opt-in device location only; it does not provide remote satellite tracking, satellite operator connectivity, a guaranteed one-second update rate, targeting accuracy or survey-grade positioning.
- Runtime limit: browser/device GPS accuracy, background scheduling, Leaflet tiles and deployed PWA behavior still require an HTTPS test on the user's own handset. Hardware and browser results are not certified by static/unit tests.
- Package maintained at 99 files; service worker cache incremented v32 → v33.


## Map and public environmental satellite imagery repair v34 (2026-11-06)
- Added Location map layer control: OSM streets, Esri World Imagery mosaic, and dated NASA GIBS MODIS Terra true-colour WMTS tiles (UTC date selector).
- Added JMA Himawari Southeast Asia public RGB-composite page to Location and civilian Radiological Safety Centre, with direct official-viewer links.
- Added real Leaflet tile `loading` / `tileload` / `tileerror` health reporting. A map layer is not marked as tile-received until its tileload event occurs. JMA cross-origin iframe events are labelled as navigation events requiring visual timestamp verification.
- Fixed direct-route hidden-container map initialization by waiting for visible dimensions, invoking `invalidateSize` on panel entry, and adding a jsDelivr/unpkg Leaflet fallback.
- Fixed Radiological Safety map refresh/retry and duplicate report-layer creation; district geometry is fetched through the cached retryable helper. NASA imagery and district polygons remain distinct layers and distinct sources.
- `python run-static-qa.py`: 1,073 HTML IDs; 0 duplicates; 0 missing local references; 52 service-worker assets; cache version v34; 25 JS syntax checks passed; 20 CSS files parsed; 0 static errors.
- `node test-pwa-omnibox.cjs`: PWA baseline, Russian satellite route, Radiological Safety, Location precision, and v34 map/feed integration checks passed (15 new assertions in v34).
- Existing regression tests: Earth Traffic 25; RF 5; Space Communications 21; Space Environment 11; Connectivity 6; Voice-mail static checks passed.
- Environment limitation: Python VPN bridge HTTP tests could not bind their test port because it was already in use (8 HTTP test setup errors); the earlier 3 non-network bridge tests passed. This is an environment/port collision, not a result of the map changes.
- Runtime limitation: outbound DNS/network and browser screenshot are not available in this container. Therefore tile delivery and iframe rendering cannot be verified here or claimed as connected on the user's GitHub Pages deployment. User must test the deployed HTTPS app while online; provider failures will remain visible as degraded/unconfirmed rather than fabricated as live.
- Safety scope: this update adds only public weather/environmental imagery and civilian geographic reference. No satellite command uplink, satellite camera tasking, individual tracking or targeting functionality is provided.


## v35 update — 3D launch and Russian public weather imagery
- Added visible 3D launch controls in the overview and Bangladesh Radiological Safety panel. Direct route: `?page=radiologicalsafety`.
- CesiumJS globe now starts independently of DGHS district GIS success. If the primary Cesium CDN is unavailable, the panel attempts a pinned jsDelivr CesiumJS fallback; imagery tiles try Esri first and OpenStreetMap second.
- Added a user-launched public weather imagery view of the official Russian Elektro-L meteorological portal (`https://electro.ntsomz.ru/en/`) with a direct-open fallback. Its page is titled “Earth in the last twenty-four hours”; the page snapshot inspected on 6 November 2026 displayed entries dated 25–26 October 2026, so freshness is not guaranteed. Verify the newest capture timestamp. This safety panel omits high-resolution EO scene ordering, tasking, target imaging and spacecraft control.
- This is public weather/Earth-observation imagery access, not a direct satellite command/uplink, not a continuous video stream, and not target or person surveillance. Cross-origin iframe load does not prove image pixels or capture time; verify inside the official viewer.
- Service-worker cache: `terravex-apex-shell-v35`.


### v35.1 follow-up verification: visible 3D launch and imagery tile probe
- Explicit 3D launch controls are present in the Overview quick-launch banner, Radiological Safety header and 3D globe card.
- Cesium initialization is serialized to prevent duplicate Viewer instances if page entry and a button click occur together. The Retry action resets imagery fallback state.
- Public basemap connection is reported only after a real sample tile image loads; Esri is tried first, then OpenStreetMap. If both fail, the 3D engine remains separately identified from imagery availability.
- Russian integration in this safety panel is limited to the public Elektro-L weather imagery portal. A cross-origin iframe load is labelled as a page-load event, not proof of image delivery. The page snapshot inspected 6 Nov 2026 showed entries dated 25–26 Oct 2026, so current imagery freshness is not guaranteed.
- The safety panel does not expose Roscosmos high-resolution scene search/order links, camera tasking, or spacecraft control.


## v36 final verification
- Launch buttons verified in Overview, Safety Centre header and globe card; direct page route and event handlers checked.
- Cesium initialization no longer depends on district GIS; concurrent initialization is serialized; Retry resets fallback/probe state.
- The map reports imagery receipt only after an actual sample tile loads. Esri is probed first and OSM is fallback.
- Russian source is the public Elektro-L meteorological viewer only. Iframe load is not interpreted as confirmed image delivery; capture freshness must be read from the provider. No high-resolution EO scene ordering, camera tasking or spacecraft command is included in this Safety Centre panel.
- Runtime browser/WebGL and external provider delivery on the user's deployed GitHub Pages still require online browser verification.
- Service-worker cache: `terravex-apex-shell-v36`.

## v37 — Same-globe civil mobility overlay verification (2026-11-06)

- **Project package:** 99 root files; no new file introduced. The v36 3D Earth card, camera, imagery controls, orbit overlay, existing aircraft snapshot, location and communications controls remain in place. New activity overlays are rendered on the same Cesium viewer and camera.
- **Layers:** Air Activity Density (OpenSky snapshot binned into 1-degree cells and rendered only at >=10 source observations per cell); Road Congestion, Maritime Activity Density and Authorized Drone Activity (optional provider/backend GeoJSON aggregates, disabled/unconfigured until a real endpoint is supplied).
- **Aggregate input guard:** HTTPS only, no embedded query credentials, CORS fetch with omitted credentials, 15-second timeout, 2 MB / 300-cell limits, timestamp validation, source metadata, resolution >=20 km, cell count >=10, radius >=10 km, grid/district/region aggregation, road congestion index 0–100. Feature IDs, nested individual identifiers, route/path/track payload keys are rejected. No provider secrets are stored in this static page.
- **Rendering/accuracy disclosure:** cells are coarse ellipses, not individual trajectories. Source age is shown; stale thresholds differ by source. Existing OpenSky source cadence/rate limits remain provider-controlled. Air snapshot is manual refresh, not continuous telemetry. No dummy or interpolated vehicles are added by the new layers.
- **Static QA:** HTML parsed: 1,108 IDs, 0 duplicate IDs; local references missing=0; 52 required service-worker shell assets, missing=0; cache/diagnostics parity `terravex-apex-shell-v37`; 25 JavaScript files syntax checked, 0 errors; 20 CSS files parsed, 0 errors; Python syntax checks passed; static QA aggregate 0 errors.
- **Integration/regression:** PWA baseline 9/9; Russian satellite route 9 assertions; Russian bootstrap 5 assertions; Radiological Safety 12 assertions; device location 19 assertions; inherited 3D/Russian imagery checks 15 + 25 assertions; new civil mobility UI/schema/toggle checks 24 assertions; new aggregate payload runtime checks 4 assertions (valid aggregate accepted; Feature.id, nested identity and raw track rejected); Earth Traffic 25; RF 5; Space Communications 21; Space Environment 11; relay/mailbox 14 integration groups; voice-mail static checks; Connectivity 6; VPN bridge 11. All executed tests passed.
- **Provider connection status:** OpenSky air density can be populated after the user manually requests its existing Bangladesh snapshot, subject to public API/CORS/credits/rate limits. Road, maritime and drone endpoints were not supplied and therefore correctly remain unconfigured. The container cannot validate live CORS/provider access or the user's deployed GitHub Pages visual rendering. No feed is claimed connected without an actual response.
- **Safety scope:** new views are coarse civilian activity summaries only. No individual ship/drone identity, raw path/track, target association, camera tasking or weapons function has been added.


v38 corrective change: maritime activity was not visible because v37 only contained a blank, user-supplied AIS aggregate endpoint field. That provider was not connected. To avoid implying a feed exists, v38 replaces the empty display with an automatically fetched public Bay of Bengal marine safety model layer (Open-Meteo). The 16 coarse model grid points are drawn on the existing Cesium globe. Individual vessel positions/routes are not enabled.


## v38 — Corrective marine model layer (2026-11-06)
- Root cause: v37 marine display depended on a user-entered AIS aggregate endpoint; no provider endpoint was configured, so there was no marine data to draw.
- Corrected visible panel: renamed to Bay of Bengal marine safety; fetches broad sea-grid wave height, wave direction, ocean-current speed/direction and SST from Open-Meteo Marine API when the page opens; also has a manual retry.
- Draws 16 broad model cells on the same Cesium globe. No vessel positions, identities, tracks or routes.
- Source timestamp and retrieval time shown; fetch failures clear stale overlay and never insert fake data.
- PWA cache and runtime diagnostics bumped to `terravex-apex-shell-v38`.

- Final v38 verification: JavaScript syntax 25/25; CSS parse 20/20; Python syntax 4/4; HTML IDs 1,108 with 0 duplicates; 52 cached assets, 0 missing; static QA TOTAL ERRORS 0.
- Regression results: Earth Traffic 25; RF 5; Space Communications 21; relay/mailbox 14 integration groups; PWA/route/source tests 9 + Russian panel 9 + bootstrap 5 + radiological 12 + location 19 + inherited 3D/Russian checks 15 + 25 + aggregate validator 4 + marine query builder 6; Space Environment 11; VPN bridge 11; Connectivity 6. All executed tests passed.
- External API runtime and GitHub Pages visual rendering were not directly verified in this environment; the UI reports response/error state when opened online.


## v39 regression and static QA record (2026-11-06)
- Static QA: PASS, 0 errors; 1,154 HTML IDs; 0 duplicate IDs; 0 missing local references; 25 JavaScript files pass `node --check`; 20 CSS stylesheets parse; PWA required local assets all present; cache/version parity v39.
- New v39 checks: five civil panels registered inside original `page-earthcommand`; GloFAS, OSM coarse aggregates, GBIF region counts, existing Marine model and NASA GIBS/STAC archive use the same Cesium viewer. Limitation disclosures checked.
- Regression: Earth Traffic 25 assertions; PWA omnibox 9/9; Russian satellite entry/integration 9/9 plus bootstrap 5/5; radiological safety 12; device location privacy 19; inherited 3D launch/imagery 25; aggregate validation 4; marine request 6; relay/mailbox 14 groups; RF 5/5; Space Communications 21; Space Environment 11; Connectivity 6; VPN bridge 11 Python tests. All executed suites passed.
- Browser rendering against all public third-party endpoints was not available in the build runtime; live API delivery, GitHub Pages browser appearance and source freshness must be checked after deployment. No live provider success is claimed by this QA record.


## v40 panel discoverability / navigation fix
- Root cause: v39 panel cards were present inside `page-earthcommand`, but placed below the long command workspace and had no visible launch/jump shortcuts in the persistent top bar or the page header.
- Fix: persistent topbar `Civil 3D` button; Overview launch banner; five-button shortcut bar under the Live 3D Earth heading; focus/scroll highlight; deep-link panel keys `all`, `flood`, `humanitarian`, `forest`, `ocean`, `archive`; same Cesium viewer and camera retained.
- PWA app-shell cache bumped to `terravex-apex-shell-v40`; runtime diagnostics and regression expectations updated.
- Full static and regression test results are recorded in the v40 package build record.

## v40 regression results (6 November 2026)
- Root cause verified from v39 source: the five civil cards existed inside `page-earthcommand` but appeared after the long command workspace; there was no persistent top-bar shortcut, no visible panel jump bar and no deep-link parameter for the individual cards.
- v40 fix: added top-bar `Civil 3D`, Overview `Open Civil 3D Panels`, five direct jump buttons below the Live 3D Earth heading, scroll/focus highlighting, and deep links `?page=earthcommand&panel=all|flood|humanitarian|forest|ocean|archive`. All targets remain inside the original page and reuse the single `tveCesium` viewer/camera.
- Static QA: 1,156 HTML IDs; duplicate IDs=0; local reference misses=0; 52 required PWA shell resources found; JavaScript 25/25; CSS 20/20; Python 4/4; cache and diagnostics both v40; aggregate static QA errors=0.
- New visibility/deep-link assertions: 9 PASS. Civil panel semantic/source assertions: 27 PASS.
- Regression suites: Earth Traffic 25 PASS; PWA/omnibox 9/9; Russian satellite integration 9+5; Radiological Safety 12; Location privacy 19; inherited 3D/imagery 15+25; aggregate payload 4; marine model request 6; RF 5/5; Space Environment 11; Space Communications 21; voice-mail static checks PASS; relay/mailbox 14 groups; Connectivity 6; VPN bridge 11 tests.
- Archive is kept at exactly 99 root files. External provider/browser rendering was not exercised by these local code tests.


## v41 civil visual studio verification
- Five panels gained actual-data visual stages: GloFAS time-series, OSM coarse aggregate grid, GBIF regional bars, Open-Meteo marine wave grid bars, and STAC preview gallery (only if source assets exist).
- Added Balanced/High/Ultra Cesium render profiles with device cap; existing viewer/camera retained.
- Civil entry now auto-requests Humanitarian OSM summary with freshness gating.
- Empty states explicitly state no synthetic observations.
- PWA cache and diagnostics bumped to `terravex-apex-shell-v41`.
- Runtime/public API and remote browser rendering still require verification on the deployed GitHub Pages site; static QA does not certify external service availability.


### v41 final QA execution record
- Static QA: 1,167 HTML IDs; duplicate IDs=0; missing local references=0; service-worker shell assets=52/52; JS syntax=25/25; CSS parse=20/20; Python syntax=4/4; aggregate static errors=0.
- Earth Traffic: 25 assertions PASS.
- PWA/navigation checks: 9/9 PASS; Russian satellite entry/integration 9 assertions PASS; module bootstrap 5 assertions PASS.
- Radiological Safety Centre: 12 assertions PASS.
- Device location privacy/precision: 19 assertions PASS.
- v37 inherited visual/launch checks: 15 + 25 assertions PASS.
- v38 marine and aggregate validation: integration PASS; payload identity/track rejection 4/4; marine deterministic assertions 6/6.
- v39 civil panels: 27 assertions PASS. v40 civil visibility/deep links: 9 assertions PASS.
- Relay/mailbox: 14 integration groups PASS; RF: 5/5; Space Communications: 21 assertions; Space Environment: 11 assertions; VPN bridge: 11 tests as part of previous integrated suite.
- v41 added source-driven graphics, High/Ultra render profiles, source-supplied STAC preview handling, and direct-route auto-entry into the shared 3D viewer. External API and remote GitHub Pages rendering still need live browser verification after deployment.


## v43 Engineering Studio QA record
- Static QA: 1,219 HTML IDs; duplicate IDs=0; missing local references=0; service-worker shell assets 52/52; JavaScript syntax 25/25; CSS parsing 20/20; Python syntax 4/4; manifest shortcuts 17/17 valid; aggregate static errors=0.
- Engineering runtime calculation/DXF harness: 25 assertions PASS (rectangle, right triangle, circle, area and length conversions, eight-storey and 100-storey calculations, FAR/GFA/height, invalid-input guards, DXF units/layers and exclusion of structural/reinforcement detail).
- PWA omnibox: 9/9; Russian satellite navigation/integration: 9 assertions; module bootstrap: 5 assertions; Radiological Safety: 12; location precision/privacy: 19; civil launch and imagery regression: 15 + 25; v38 aggregate validation: 4; marine model deterministic checks: 6; v39 civil panels: 27; v40 visibility/navigation: 9; Earth Traffic: 25.
- Relay/mailbox: 14 check groups; RF: 5/5; Space Communications: 21; Space Environment: 11; Connectivity: 6; VPN bridge: 11 tests.
- v43 Engineering Studio: live input recalculation, unit conversion, concept-only 1–100 storey massing, non-structural finish surface allowances, DXF/CSV/JSON download, professional-review boundaries and PWA shortcut.
- ZIP package: exactly 99 root files; archive integrity and SHA-256 verified. External GIS/API availability and the user's deployed GitHub Pages/browser rendering are not certified by local static/regression tests.


## v43 Engineering Studio final verification (7 November 2026)
- Engineering route available through sidebar, topbar, Overview and command palette; direct route `?page=engineering`.
- Site geometry: rectangle, right triangle and circle; length units m/ft/cm/mm/km; area units m²/ft²/acre/hectare/decimal/km².
- Scenario calculator: plot area, perimeter, coverage, footprint, gross floor area, concept height and user-entered FAR/coverage/height limit comparisons. Floors 1–100 are visual scenario inputs, not feasibility approval.
- Local animated massing canvas plus real Cesium extruded concept volume on the existing Earth viewer. User must explicitly supply coordinates and trigger the overlay; clear action removes only engineering entities.
- Download tests: DXF AC1015 metre units and layers SITE/FOOTPRINT/MASSING/LEVELS/NOTES parsed successfully with ezdxf; CSV finish allowances and JSON scenario report remain separate exports.
- Runtime harness: 22 assertions passed across shapes, dimensions, units, GFA/FAR/height, floor bounds, invalid inputs, DXF content and Cesium overlay add/clear lifecycle.
- Limits: conceptual architecture only; no reinforcement, load paths, member sizing, foundations, structural materials, construction BOQ, permit approval or military/naval/weapon-related design.
- Full static QA: 1,218 IDs, duplicates=0, missing local references=0, JS=25/25, CSS=20/20, static errors=0; PWA cache parity v42. Full existing regression suites passed including 11 VPN bridge tests on isolated rerun.
- Deployed browser, remote API availability and the user's own Cesium/GPU rendering still require on-site verification.


## v42 final package record
- Exactly 99 root-level project files retained; no new loose application files added.
- Static QA: 1,219 HTML IDs; duplicates=0; missing local resources=0; JavaScript=25/25 syntax clean; CSS=20/20 parsed; Python=4/4 syntax clean; PWA cache/diagnostics parity v42; 52/52 required shell assets present; aggregate static errors=0.
- Regression suites: PWA/navigation + Russian Satellite integration/bootstrap + Radiological Safety + location privacy + civil-panel/deep-link + marine/aggregate + Earth Traffic 25 + RF 5 + Space Communications 21 + Space Environment 11 + relay/mailbox 14 groups + voice-mail + connectivity 6 all passed. VPN bridge 11/11 passed on isolated run.
- Engineering runtime harness: 23 assertions passed, including rectangle/right-triangle/circle geometry, unit conversion, 1–100 floors, GFA/footprint/FAR/height, invalid-input guards, DXF export content, shared Cesium massing overlay creation/removal and 20 km local-projection guard.
- Export verification: generated ASCII DXF parsed with ezdxf 1.4.4 as AC1015; 109 modelspace entities; SITE, FOOTPRINT, MASSING, LEVELS and NOTES layers present.
- External services, RAJUK/authority responses, user-provided survey coordinates, deployed GitHub Pages rendering and browser/GPU Cesium performance were not live-certified by this local QA run.


## v43 Engineering Studio report / download bug-fix record
- Root cause found: the prior live-input debounce referenced `calcTimer` without declaring it under strict mode. Changing a dimension/floor count could throw a ReferenceError, preventing the report and massing from updating. Added an explicit timer state and verified recalculation after input changes.
- Fixed the 3D preview animation loop so queued frames always redraw the latest validated scenario; an older animation no longer overwrites the current model.
- Added a visible Engineering Design & Safety Report monitor above the workspace. It updates project summary, site coordinate provenance, area conversions, GFA/FAR/height/coverage, preliminary finish allowances, entered-limit comparisons, and explicit missing/unchecked professional reviews.
- Invalid inputs now clear all prior outputs and prevent stale reports or exports from being downloaded. A partial or out-of-range latitude/longitude pair is rejected; coordinates are labelled user-entered and unverified.
- Added prominent download controls: conceptual DXF, SVG site plan, non-structural finish CSV, complete JSON scenario and printable HTML safety/design report. HTML report supports browser Print / Save as PDF. Download errors are surfaced in the UI.
- Safety boundary remains explicit: civilian concept planning and non-structural finish areas only; no reinforcement, beams, columns, foundations, structural steel, structural BOQ, permit certification or military/naval/weapons/nuclear facility design.
- Verification: static QA 0 errors, duplicate IDs 0, missing local references 0, 25 JS files syntax-checked, 20 CSS stylesheets parsed. PWA cache/diagnostics parity v43. PWA/earth traffic integration, RF 5/5, Space Communications 21, Space Environment 11, relay/mailbox 14 groups, Connectivity 6, VPN bridge 11/11, Engineering calculations/DXF 25 assertions, Engineering UI/report/export runtime test passed.
- Browser caveat: Playwright-driven Chromium navigation was blocked by the runtime administrator policy for both localhost and file URLs. The report renderer, live input debounce, invalid-input clearing and download dispatch were instead verified with deterministic DOM/API mocks; deployed GitHub Pages rendering still requires browser verification after upload.

- Final v43 static pass after report-field integration: 1,235 HTML IDs, duplicate IDs=0, missing local references=0, JavaScript 25/25, CSS 20/20, Python 4/4, required app-shell assets 52/52, static QA errors=0. Invalid-input path now also cancels the previous animation frame before displaying the error report.


## v44 Engineering Studio two-input design workflow and CAD parser verification (7 November 2026)
- Primary inputs reduced to storey count (1–100) and a supported civilian building typology. Site geometry, floor plate, coverage, height, FAR scenario and floor zoning are auto-assumed and visibly disclosed as heuristics.
- Added optional satellite-context selector using the existing shared Cesium camera centre and public Sentinel-2 L2A STAC scene metadata. No site coordinates are silently inferred; no cadastral, subsurface, soil bearing or foundation attributes are claimed from imagery.
- Added 2D floor-plan canvas, functional zoning, core/support blocks, dimensions, assumed plot outline and dedicated DXF download. Fixed the AutoCAD DXF entity structure by adding the required R2000 subclasses for LWPOLYLINE, LINE and TEXT.
- Generated 2D DXF parsed with ezdxf 1.4.4 as AC1015 with metre units; 23 model-space entities and required layers. 3D massing DXF also parsed as AC1015. SVG XML and HTML report parsing passed. Forty deterministic storey/type combinations across eight civilian profiles passed calculations, with output bounds checked.
- Live report now includes engineering descriptions, functional-zone program, satellite catalogue provenance when selected, and professional safety review. Invalid input clears stale reports; every export recalculates from the current two inputs before downloading.
- PWA cache and runtime diagnostics moved to v44; existing app shell retains 99 files.
- Remaining verification limit: external STAC imagery and deployed GitHub Pages/Cesium rendering require online browser verification after deployment. All concept outputs are preliminary and not construction/permit drawings.

## v44 final verification after DXF entity repair (7 November 2026)
- Auto-assumption UI initialization test: report KPI cards, program/engineering descriptions, safety review, assumed parcel summary, finish schedule and 2D canvas all populated on first entry; 12 live-update, invalid-input and download-current-input assertions passed.
- Forty deterministic combinations passed: eight supported civilian building typologies × storey counts 1, 8, 30, 60 and 100. All produced finite positive GFA and a valid plan object.
- The first independent DXF parser check exposed missing R2000 subclass markers in 2D LWPOLYLINE entities. The 2D DXF writer was corrected to write AcDbEntity/AcDbPolyline, AcDbLine and AcDbText subclass markers. This was then reopened with ezdxf 1.4.4 as AC1015, metre units, 23 modelspace entities and all ten required layers. The separate 3D massing DXF also parsed as AC1015 (21 modelspace entities).
- Generated SVG parsed as valid XML; generated HTML report parsed successfully. Report includes site context status, area-unit conversions, typology/zoning description, safety review, assumptions, professional review and reference list.
- Current service-worker cache and runtime diagnostics: `terravex-apex-shell-v44`; app shell required resources 52/52. Package limit: exactly 99 files.
- Final static QA: 1,247 HTML IDs; duplicate IDs 0; missing local resource references 0; JS syntax 25/25; CSS parser 20/20; Python syntax 4/4; zero static errors.
- Regression suites: PWA 9/9; Earth Traffic 25; RF 5/5; Space Communications 21; Space Environment 11; relay/mailbox 14 integration groups; VPN bridge 11/11; Russian imagery, radiological safety, GPS privacy, same-globe civil panels and five civil environmental panels all passed.
- External Sentinel-2 STAC requests, actual browser download behavior, GitHub Pages deployment and Cesium/WebGL rendering still require online browser confirmation after upload. Satellite context is optional and user-selected; assumed parcel dimensions are typology heuristics, not satellite-derived measurements.


## v45 engineering geometry and typology update

Validation includes area/perimeter/vertex count for square, rectangle, circle, regular triangle, regular pentagon and regular octagon; 1–100 storey range; duplex/triplex minimum floors; multinational civilian campus; eco-friendly profile; civil-protection campus; safe exclusion of military typologies; 2D polygon boundary exports and AC1015 DXF parser compatibility.


## v45 geometry / typology and AutoCAD 2007 validation
- Plot geometries: square, rectangle, circle, regular triangle, regular pentagon, regular octagon.
- Civilian typologies: residential, duplex, triplex, commercial, multinational corporate, education, healthcare, civic, hotel, mixed-use, eco-friendly, non-hazardous industrial and civil-protection/emergency-logistics campus.
- Military base/weapon/force-protection design excluded; public civil-protection substitute.
- 2D floor-plan and 3D massing DXF headers set to AC1015 / R2000 and metre units for opening in AutoCAD 2007.
- Polygon boundaries preserved in canvas, SVG, 2D DXF and 3D massing exports.


Additional deterministic v45 geometry validation: all six plot types produced correct area/perimeter and expected vertices; every generated zoning rectangle corner remained inside its conceptual footprint. Duplex (min. 2 floors), triplex (min. 3 floors), multinational civilian corporate, eco-friendly and civil-protection campus profiles passed; military profile rejected. Twelve 2D/3D DXF files were opened by ezdxf 1.4.4 as AC1015 with the expected layers/entities.


## v46 Engineering Studio: geometry-aware preview and AutoCAD 2007 DXF repair

- Root cause addressed: the previous 2D plan used rectangular zone blocks regardless of the selected polygon footprint. v46 clips functional zones to the actual selected footprint polygon, so square, rectangle, circle, triangle, pentagon and octagon plans now have shape-aware zoning.
- Added plan-arrangement selector: Auto by infrastructure type, Central service core, and Linear / wing arrangement. The selected building typology drives the zone labels/program.
- Fixed visible-canvas lifecycle: entering the Engineering page schedules a fresh render of both 3D massing and 2D plan after the page becomes visible. Invalid input clears both previews rather than leaving stale geometry.
- AutoCAD repair: replaced the minimal R2000 writer with legacy ASCII DXF R12 / AC1009 entities and complete basic VPORT, LTYPE, LAYER, STYLE and BLOCKS sections. 2D plan uses POLYLINE/VERTEX, LINE and TEXT; 3D concept uses legacy 3D POLYLINE and 3DFACE. Drawing coordinates are metres and the drawing includes a visible unit note.
- Validation: 173 geometry/layout/typology/render assertions passed; live UI simulation passed 8 assertions for geometry, typology and layout changes; 36 generated 2D/3D DXF files were parsed and audited by ezdxf 1.4.4 with zero audit errors. Existing app regression suites passed, static QA errors=0, JavaScript syntax errors=0, CSS parse errors=0, duplicate HTML IDs=0, missing local references=0.
- Limitation: AutoCAD 2007 itself was not available in the environment, so actual application-level open/render verification remains unperformed. R12/AC1009 is a backward-compatible DXF format; users should open the file in AutoCAD 2007 and use `ZOOM` → `E` (Extents) if needed.
- Package target remains exactly 99 files. PWA cache bumped to `terravex-apex-shell-v46`.


## v47 Integrated Civil Engineering Companion release QA — 7 November 2026

- Additive `engineering-depth-system.js` / `.css` panel integrated into the existing Engineering page; original v46 designer and DXF functions remain in place.
- Current service-worker cache: `terravex-apex-shell-v48`; 54 required shell assets present, 0 missing.
- HTML parsed: 1,335 IDs, 0 duplicates; local references: 0 missing.
- JavaScript syntax: 26 files, 0 errors. CSS parsing: 21 stylesheets, 0 errors. Python syntax: 4 files.
- Static QA aggregate: **0 errors**.
- v47 deterministic engineering tests: **32 assertions PASS**. Includes gravity-load totals, interior tributary load, slab/beam/column/footing/pile volume arithmetic, nominal mix water conversion (water litres = cement mass × w/c ratio), theoretical bar mass, foundation-screen boundary conditions, invalid input guards and mocked remote-source status handling.
- Remote-source mocks cover Open-Meteo elevation and Copernicus STAC catalogue metadata; SoilGrids is labelled paused and no point REST call is made.
- Generated A3 landscape model-space drawing parsed by ezdxf 1.4.4 as **AC1009/R12**, 33 entities, expected layers: FOOTPRINT, NOTES, SCHEDULE, SHEET_BORDER, SITE, TEXT, TITLE_BLOCK and ZONES.
- Regression tests: Earth Traffic 25 assertions; PWA omnibox 9/9 plus inherited integration assertions; relay mailbox 14 groups; RF simulator 5/5; Space Comms 21 assertions; Space Environment 11 assertions; voice-mail/mailbox static tests; VPN bridge 11 Python tests; space-environment QA suite.

### Limits / not claimed

Live public API reachability and browser CORS were not certified; API calls are mocked in deterministic tests. SoilGrids REST is currently paused per ISRIC's public notice. No full browser end-to-end visual run or AutoCAD 2007 desktop open/plot test was available. This companion does not produce a finite-element structural analysis, code-compliant member design, automatic rebar detailing, geotechnically determined pile capacity, construction-ready drawings or statutory permit certificate. All results are preliminary screening / quantity estimates requiring qualified professional review.


## v48 99-file GitHub overlay consolidation — 7 November 2026

- Repacked the v48 application as a flat-root **99-file** ZIP for direct GitHub repository-root overwrite.
- Preserved all runtime source, styling, imagery, icons, Windows launchers, configuration, calculation modules and test scripts from the v48 source archive. The only count reduction is consolidation of 17 standalone guides/release-note files into the indexed `TERRAVEX-COMPANION-DOCUMENTATION.md`; their text is retained there.
- Corrected a root-path deployment defect: `render.yaml` previously referenced nonexistent `relay-server/`, while `server.js` and `package.json` are in the repository root. The Blueprint now builds/starts from the root. `START-TERRAVEX-VOICE-RELAY.bat` now changes to the root before starting `server.js`, and the UI deployment hint matches that layout.
- Updated README and Bengali deployment instructions for a 99-file flat-root overlay and current `terravex-apex-shell-v48` cache. No application feature or asset was removed to meet the file-count limit.
- Archive integrity: PASS; root entries: 99; path traversal: none; nested project directories: none.
- Static QA: 1,347 HTML IDs, duplicates=0; missing local references=0; 27 JavaScript files syntax checked, errors=0; 22 CSS files parsed, errors=0; Python syntax checks passed; required service-worker shell assets=56/56; total static errors=0.
- Regression: architecture/typography 38 assertions; R12 typography/DXF 20 assertions; civil engineering 32 assertions; Earth Traffic 25 assertions; PWA/navigation inherited integration suite passed; relay/mailbox 14 groups; RF 5/5; Space Communications 21; Space Environment 11; connectivity 6; VPN bridge 11/11.
- The VPN bridge test was rerun after stopping the earlier local HTTP preview server occupying fixed test port 8765; all 11 tests then passed.
- Not verified here: deployment on the user's GitHub Pages account, live third-party API/CORS reachability, Windows BAT execution, real Chrome/Edge PWA installation, and opening/plotting a DXF inside AutoCAD 2007.


## v50 Universal Building / Mansion Design upgrade QA — 8 November 2026

- Additive v50 design-development section integrated in the existing application; package remains 99 flat-root files and preserves the prior release filenames.
- Added building-use profiles, 1–60-level floor programme, per-floor room templates, room/interior styles, balcony/verandah schedule inputs, shape-aware massing context, stair/egress input comparison, lift shaft/car/capacity/traffic/vendor-data checks, rooftop tank/PV/green-roof/drainage screens, exterior/facade/glazing/balcony/wind-context screen, command palette and coordination completeness monitor.
- Commands include HELP, CALCULATE, FLOOR n, ROOM model, STAIR CHECK, LIFT CHECK, ROOF CHECK, FACADE CHECK, FACADE STYLE style, FRAME RUN, COORDINATION CHECK, RUN ALL, EXPORT DXF, REPORT JSON, SAVE LOCAL and LOAD LOCAL.
- DXF review output is R12 / AC1009, A3 landscape, millimetre-labelled, with level/floor, roof, stair/lift diagram and exterior/elevation layers. Legacy v46 engineering DXF exports remain in the earlier panel.
- Embedded frame solver: linear elastic Euler–Bernoulli 2D representative frame-line, direct-stiffness assembly, fixed-base support, partial-pivot Gaussian elimination, member-end N/V/M, displacement/drift and residual checks. Deliberately limited to 1–8 storeys. Programme/massing planning is 1–60 levels; >8-level projects show an explicit need for a separate full 3D structural model.
- v50 architecture/mansion deterministic suite: **76 assertions PASS** (38 legacy architecture/typography + 38 mansion / universal-building assertions). v47 civil suite: **32 PASS**. Earth Traffic: **25 PASS**. PWA suite: **9/9 PASS** with v50 cache expectations. Relay/mailbox: **14 groups PASS**. RF: **5/5 PASS**. Space Communications: **21 PASS**. Space Environment: **11 PASS**. R12 typography test: **20 PASS**. Connectivity: **6 PASS**. VPN Bridge: **11/11 PASS**.
- Final static QA: **1,502 HTML IDs, 0 duplicates; 0 missing local HTML assets; 28 JavaScript files syntax checked, 0 errors; 22 CSS files parsed, 0 errors; 4 Python files parsed; 56/56 required service-worker shell assets present; total static errors = 0**.
- PWA cache `terravex-apex-shell-v50`; app diagnostics and test expectations updated.

### Explicitly not verified / not claimed

- No full Chromium/Edge visual, interaction, accessibility or responsive end-to-end test was performed here. GitHub Pages deployment, live external-source reachability, browser download, installed-PWA activation and Windows runtime behavior require user-side verification after upload.
- AutoCAD 2007 itself was not launched to open/plot the generated v50 mansion DXF in this environment. DXF R12/AC1009 is written for backward compatibility, but target-machine open, scale, SHX font, layer, print and sheet checks remain necessary.
- No automated construction-ready design is claimed. Stairs are geometry/entered-limit screens; lift analysis needs vendor GA and certified support reactions; roof/facade computations are simplified; the frame model is 2D and does not replace a complete 3D structural model, code member design, reinforcement detailing, foundation/soil design, fire/accessibility, MEP or permit review.
- No claim is made that a building plan is guaranteed free of errors or automatically accepted by any authority. All exports are marked DESIGN DEVELOPMENT / NOT FOR CONSTRUCTION.


## v50 Universal Building / Mansion Studio release QA (8 November 2026)

- Package base: consolidated v48 99-file root overlay; updated in place, no new root filenames.
- Scope: 1–60 storey programme/massing, per-floor room-template schedules, building typologies, balcony/verandah take-off, stair/egress input comparison, lift car/shaft/traffic/vendor-reaction completeness screen, roof tank/PV/green roof/drainage screens, facade/glazing/balcony/wind context, command monitor, coordination completeness gates, reports and multi-sheet R12/AC1009 design-review DXF.
- Structural kernel: one regular first-order linear-elastic 2D Euler–Bernoulli plane-frame line, 1–8 storeys only. It is not a 3D building or member-capacity design engine.
- Latest safeguard checks: square/circle fit within the shorter setback clear dimension; room blocks are emitted only when their rectangular cells fit the idealized footprint; elevations use a separately computed sheet scale; stair section uses entered actual rise; missing stair/lift dimensions are called out instead of silently assumed.
- Tests executed: architecture/mansion regression suite PASS; civil engineering depth 32 assertions PASS; Earth Traffic 25 assertions PASS; PWA/location/inherited integration suite PASS; relay/mailbox 14 groups PASS; RF 5/5 PASS; space communications 21 assertions PASS; space environment 11 assertions PASS; R12 typography 20 assertions PASS; voice-mail static checks PASS; connectivity 6 assertions PASS; VPN bridge 11/11 PASS; static QA aggregate 0 errors.
- Static QA: 1,502 HTML IDs, no duplicate IDs; zero missing local references; JavaScript syntax 27 files, zero errors; CSS parser 22 stylesheets, zero parse errors; Python syntax 4 files; service-worker shell 56/56 local resources present.
- Not verified here: live GitHub Pages deployment, browser end-to-end rendering in the user's device, Windows AutoCAD 2007 open/plot, authority submissions, vendor lift GA validation or construction sign-off.
- **Status remains DESIGN DEVELOPMENT / NOT FOR CONSTRUCTION.** Complete site survey, geotechnical investigation, adopted-code review, full 3D structural analysis, detailed member/rebar/foundation design, fire/MEP/accessibility coordination, supplier data, independent checks and statutory approval are required.
