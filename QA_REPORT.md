# TERRAVEX APEX - Independent Package Verification

Date: 2026-10-24
Base archive: `TERRAVEX-APEX-STORM-SEISMIC-OCEAN-ALERT-UPGRADE.zip`
New module: `Satellite Pass & Russian Orbital Watch`

## Checks
- Storm & Lightning Watch: `page-stormwatch`, navigation, and `initStorm()` are present. Static source checks found the Open-Meteo forecast endpoint, NASA GIBS WMS imagery request, explicit model advisory threshold, and enabled/disabled watcher timer.
- Earthquake Rapid Alerts: `page-quakeearly`, navigation, and `initRapidQuakes()` are present. Static source checks found the USGS `all_hour.geojson` feed, magnitude/region filtering, event deduplication, watcher start/stop, and shared alert dispatcher.
- Bay of Bengal Ocean & Tsunami: `page-ocean`, navigation, and `initOcean()` are present. Static source checks found the Open-Meteo Marine endpoint, GEBCO bathymetry layer, wave visualization, USGS all-day earthquake source screening, and explicit wording that a screening match is not a tsunami prediction or official warning.
- These are source-integrity/integration checks, not a claim that the external live endpoints responded during this build.
- Satellite navigation present: PASS
- Satellite page present: PASS
- Satellite page loaded by script: PASS
- Pinned SGP4 dependency present: PASS
- Space stations source present: PASS
- GLONASS source present: PASS
- Weather group source present: PASS
- Device geolocation permission request present: PASS
- Horizon pass propagation present: PASS
- Two-hour public data cache present: PASS
- Offline shell includes new JS: PASS
- Cache version bumped: PASS
- Russian satellite data-access limitation disclosed: PASS
- Local CSS/JS/image ref styles.css: exists
- Local CSS/JS/image ref bangladesh-observatory.css: exists
- Local CSS/JS/image ref geolocation-live.css: exists
- Local CSS/JS/image ref lightning-nowcast-lab.css: exists
- Local CSS/JS/image ref earth-systems-upgrade.css: exists
- Local CSS/JS/image ref advanced-workbench.css: exists
- Local CSS/JS/image ref hazard-intelligence.css: exists
- Local CSS/JS/image ref manifest.webmanifest: exists
- Local CSS/JS/image ref icon.svg: exists
- Local CSS/JS/image ref satellite-pass-tracker.css: exists
- HTML duplicate IDs: 0
- Files in deliverable package: 33
- JavaScript syntax: checked with Node.js --check for every local .js file.
- HTML parse: stdlib HTMLParser completed; this is a structural parse, not an HTML conformance validator.
- CSS syntax: checked with tinycss2 where available.
- Browser/GitHub deployment: not verified in this build environment. Public CelesTrak endpoint and jsDelivr availability/CORS require checking after deploy.
- Original hazard modules: present in the base ZIP; static checks confirm all three page sections and initializers exist. Full live external API behavior is not certified by these static checks.
- Satellite geometry calculations: the pass-time interpolation helper passed a deterministic test (`-10°` to `+10°` across 60 seconds at a `0°` elevation threshold gives a 30-second crossing). Source is wired to Satellite.js v6.0.2; full SGP4 propagation against current CelesTrak OMM records was not executed here because this build environment has no outbound network access.

## Source and provenance
- CelesTrak GP data format/API: https://celestrak.org/NORAD/documentation/gp-data-formats.php
- CelesTrak usage policy (group data are cached for two hours): https://celestrak.org/usage-policy.php
- Satellite.js SGP4/SDP4 implementation (MIT): https://github.com/shashwatak/satellite-js
- NASA ISS tracking context: https://www.nasa.gov/spot-the-station/

## User-facing meaning
This panel computes sky geometry and predicted orbital passes from public orbital elements; it is not a direct satellite radio/telemetry session and does not guarantee access to satellite imagery or communications. Device location requires explicit user action and permission. If the satellite.js CDN, CelesTrak, or browser network access fails, the user should see a degraded state, not synthetic live positions.

- CSS parser detail: tinycss2 parse: PASS for all CSS files.
