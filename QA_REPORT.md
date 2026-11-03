# TERRAVEX APEX — Earth Traffic 3D Monitor Upgrade QA

Build: **Earth Traffic 3D Monitor + previous space communications, hazard, RF, VPN and PWA modules**  
Service-worker cache: `terravex-apex-shell-v22`  
Verification date: **25 October 2026**

## Deliverable

- Project files: **92** after excluding Python bytecode/cache artifacts; below the 98-file project limit.
- `index.html` is at ZIP root; all prior panels remain in the complete project.
- New files: `earth-traffic-monitor.js`, `earth-traffic-monitor.css`, `tests/test-earth-traffic-monitor.cjs`, and `EARTH-TRAFFIC-3D-MONITOR.md`.

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
node tests/test-earth-traffic-monitor.cjs
python run-static-qa.py
node tests/test-pwa-omnibox.cjs
node tests/test-rf-interference-intelligence.cjs
node tests/test-space-environment.cjs
node test_connectivity_lab.js
node tests/test-space-comms-relay.cjs
node tests/test-voice-mail-service-v16.cjs
node tests/test-relay-server.cjs
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
- PWA app-shell cache incremented to `terravex-apex-shell-v23`; PWA runtime diagnostics and tests were updated. No new files were needed; the new route and view are modular additions inside the existing Earth Traffic module files.
- Package count: **99 files** (the project remains within the requested one-upload limit).
- Latest static QA: HTML parsed, 882 IDs and 0 duplicate IDs; no missing local references; 47 required service-worker assets and 0 missing; service-worker/PWA diagnostics parity v23; 24 JS files syntax-checked; 20 CSS files parsed with 0 errors; 13 manifest shortcuts with 0 invalid targets; aggregate 0 errors.
- Regression tests: Earth Traffic + Asia Activity Watch **45 assertions PASS**, PWA **9/9**, relay/signalling **14 check groups**, RF **5/5**, Space Communications **16 assertions**, Space Environment **11 assertions**, connectivity **6 assertions**, voice-mail static tests PASS, VPN bridge **11 tests**, and npm server syntax check PASS.
- Runtime limitations: OpenSky browser CORS/provider reachability, current API quota, browser notification delivery and GitHub Pages deployment were not tested against the end-user's browser. OpenSky documents 400 anonymous credits/day and a 4-credit cost for broad (>400 sq°) state-vector queries; 15-minute polling is a conservative client-side limit for this panel. OpenSky's API is for research/non-commercial use unless commercial permission is granted.
- Classification limitation: a geofence transition is only a public-data review cue. The panel does not establish that an aircraft was unauthorised, detect aircraft without usable ADS-B data, or function as an air-traffic-control/security sensor.
