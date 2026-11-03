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
