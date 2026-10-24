# TERRAVEX APEX — Earth Traffic 3D Monitor Upgrade QA

Build: **Earth Traffic 3D Monitor + previous space communications, hazard, RF, VPN and PWA modules**  
Service-worker cache: `terravex-apex-shell-v17`  
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
- Service worker: `terravex-apex-shell-v17`; **41 required local app-shell resources, 0 missing**.
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
