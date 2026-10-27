# TERRAVEX APEX — Earth Traffic 3D Monitor Upgrade QA

Build: **Earth Traffic 3D Monitor + previous space communications, hazard, RF, VPN and PWA modules**  
Service-worker cache: `terravex-apex-shell-v21`  
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
- Service worker: `terravex-apex-shell-v21`; **41 required local app-shell resources, 0 missing**.
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
- Static QA after upgrade: HTML parsed; 0 duplicate IDs; no missing local HTML references; cache v21 has 45 required local assets and 0 missing; 22 JS files syntax-checked; 19 CSS files parsed with 0 parse errors; TOTAL ERRORS: 0.
- Runtime limitation: no actual BTCL/BSCL or mobile-network operator feed was provided, and this package was not connected to nationwide tower infrastructure or validated in a deployed browser. No RF transmission occurs.


## Earth Orbit Sentinel / SATCAT full-inventory upgrade (2026-10-26)

- Added a searchable/paginated public SATCAT list for Earth-orbit catalogue rows, including metadata-only records without loaded propagatable elements. The object browser distinguishes `GP/OMM matched` from `no loaded GP match`.
- CSV parser validates required SATCAT fields, respects quoted commas/doubled quotes, excludes non-Earth orbit and missing orbit-type rows, and keeps object metadata for the inventory list. It includes `ORB` and `DOC` Earth-centred catalogue records.
- Added a persistent SATCAT baseline: the first snapshot establishes baseline without noisy alerts; newly appearing catalogue rows and unknown object types are emitted as **review notifications only**. Existing GP ID and possible-decay review alerts remain unchanged.
- Source policy: GP elements minimum 2-hour query interval; SATCAT query attempt throttled to 12 hours, consistent with CelesTrak's stated update cadence. Local position propagation runs at 15 seconds while the monitor is ON.
- PWA service-worker shell incremented to `terravex-apex-shell-v21` and PWA diagnostics/tests updated to match.
- SATCAT parser and delta test fixture covers quoted commas, Earth vs non-Earth filtering, docked records, missing orbital-type exclusion, payload/debris counts, full inventory row retention, first-baseline no-alert behaviour, and new-ID review alert behaviour.
- Final bundle composition: 98 project files after excluding Python bytecode cache and root `.gitignore`; existing feature modules and support files remain in the archive.
- Current static QA: 837 HTML IDs, no duplicate IDs, no missing local references, 22 JavaScript files syntax-checked, 19 stylesheets parsed, PWA cache version v21, zero errors.
- Live external-feed fetch and installed-Chrome visual runtime are not verified in this container. A CORS/rate-limit/source failure is intentionally displayed as unavailable or degraded, not as live data.
