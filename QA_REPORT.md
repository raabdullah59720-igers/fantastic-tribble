# TERRAVEX APEX Bangladesh Observatory — QA Report

## Result summary

- JavaScript syntax checks: 5/5 passed.
- HTML sections: 15; duplicate IDs: 0; missing local references: 0.
- CSS files parsed: 5; CSS syntax-error files: 0.
- Chromium inline-DOM test: all recorded checks passed, with zero uncaught page errors and zero console errors. External resources were omitted from this test harness.
- File count: 22 (limit: 98).

## Numerical spot checks

| Check | Expected/result |
|---|---:|
| 37 mm/year × 10 years | 0.37 m |
| Reference strain over 100 km | 3.7 µε |
| Latency 900 + 5 + 1 + 2 seconds | 908 s, state DEGRADED because observation age exceeds the configured maximum |
| POD (16 hits, 4 misses) | 80.0% |
| FAR (6 false alarms, 16 hits) | 27.3% |
| CSI (16 hits, 4 misses, 6 false alarms) | 61.5% |
| Accuracy (16 hits, 74 correct negatives, 4 misses, 6 false alarms) | 90.0% |
| Brier score for (0.7,1), (0.2,0), (0.4,1) | 0.1633 |

## What passed

- Five project JavaScript files parse under Node.js.
- HTML parser check found no duplicate IDs or missing local file references.
- Stylesheets parse without `tinycss2` syntax errors.
- Inline-DOM tests confirm panel navigation, calculator results, stale-feed/latency guard, validation metrics, and earthquake list updates using an explicitly synthetic QA fixture.
- ZIP package is validated separately with `zipfile.testzip()` and `unzip -t`.

## Limitations and unverified items

- NASA imagery, Leaflet CDN, PB2002 GeoJSON and the live USGS feed require the user browser to reach external services. Their live responses were not validated in this environment.
- Normal browser URL navigation was blocked by environment policy; the functional test used an inline Chromium DOM harness with external resources omitted. The map therefore displayed its expected offline fallback during QA; this is not evidence that NASA tile requests succeeded.
- GitHub Pages deployment and mobile devices were not tested.
- Plate arrows/section are schematic. Relative plate motion values are cited literature estimates, not live GNSS readings.
- No operational Bangladesh 30-second lightning forecast is enabled. It is an analysis/validation workspace with synthetic demonstration values only.

## Data provenance and scientific handling

- NASA GIBS: date-stamped near-real-time MODIS/VIIRS true-colour imagery, subject to product availability and latency.
- USGS GeoJSON: occurred/reported earthquakes, subject to feed caching and revision.
- PB2002: static third-party GeoJSON boundary dataset with attribution links in README.
- Research: the two user-provided PDF reports cited in README.

No sensor telemetry, earthquake prediction, satellite lightning strike prediction, field capture energy, or GitHub deployment is represented as verified.
