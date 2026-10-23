# TERRAVEX APEX — Earth Science Upgrade QA Report

**Build:** Earth Systems & Safety Upgrade v1.0  
**Hosting target:** GitHub Pages static site  
**Date:** 2026-10-23  
**Status:** Static/source checks passed; browser/API/deployment acceptance remains to be run in the user's GitHub Pages environment.

## Automated checks performed

| Check | Result | Notes |
|---|---|---|
| Main application JavaScript syntax | PASS | `node --check app.js` |
| Earth-systems upgrade JavaScript syntax | PASS | `node --check earth-systems-upgrade.js` |
| Thunderstorm energy module syntax | PASS | `node --check thunderstorm-energy-lab.js` |
| HTML parsing | PASS | Parsed both `index.html` and `thunderstorm-energy-lab.html`; 1,311 start tags across both pages |
| Duplicate HTML IDs | PASS | None found within either HTML file |
| Literal JavaScript DOM ID references | PASS | All simple `$('<id>')` references resolve to an ID in one of the local HTML files |
| Local `href`, `src`, iframe, and CSS `url(...)` references | PASS | No missing local resources were found |
| CSS parser check | PASS | `tinycss2` found no top-level parse errors in all three CSS files |
| NASA async-image request state | PASS | Added initialized request token and timeout state; prevents callbacks being discarded because of an undefined request counter |
| GitHub Pages static structure | PASS | `index.html` is at the archive root; `.nojekyll` included; no build server required |
| Package file count | PASS | 17 files total, including four WebP assets; below the 98-file limit |
| ZIP integrity | PASS | Verified after writing; all members can be read without CRC errors |

## Independent numeric spot checks

These are formula checks with illustrative inputs, not field measurements.

| Calculation | Inputs | Independently calculated result |
|---|---|---:|
| Plate-motion displacement | 42 mm/year × 10 years | 0.42 m |
| Reference strain | 0.42 m / 100,000 m | 4.2 × 10⁻⁶, or 4.2 µε |
| Approximate earthquake radiated-energy scale | `log10(E[J]) ≈ 1.5M + 4.8`, M = 4 | 6.31 × 10¹⁰ J; approximately 17,527 kWh-equivalent by unit conversion only |
| Toy fault-work scenario | 1 MPa × 1 km² × 0.1 m slip | 1.0 × 10¹¹ J; approximately 27,778 kWh-equivalent by unit conversion only |

The earthquake-energy figure is a rough empirical magnitude relation, not useful energy that can be collected. The fault-work relation is a toy scenario calculator, not a complete geophysical energy model. The plate speed is an editable illustrative assumption, not a live GNSS reading.

## Implemented panels

- Existing application panels retained in the complete standalone package.
- New **Seismic & Plate Motion Command** with a clearly labelled exaggerated geological time-lapse, USGS event plot/list, plate displacement/reference-strain calculator, empirical earthquake energy scale, and toy fault-work calculator.
- Enhanced **Earth Observation** panel requesting date-based NASA GIBS WMS imagery, with date/layer/region selection, failure/timeout state, and external NASA Worldview link.
- New **Unified Earth Alert Center** with USGS new-catalog-record watcher, Open-Meteo forecast-model advisory, threshold/region controls, local alert log, JSON export, test-alert button, and optional browser notifications.
- Existing **Thunderstorm Energy Recovery** iframe module and its generated WebP assets retained.

## Checks not completed / known limitations

1. A local browser-driven test was attempted, but this execution environment blocked Chromium/Playwright navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore, button interactions, rendered screenshots, mobile layout and iframe behavior have **not** been proven by a completed browser test.
2. NASA GIBS, USGS and Open-Meteo endpoints were checked against their public documentation during implementation, but live requests were not successfully validated from the browser runtime here. Their availability, selected product/date support, network/CORS conditions and GitHub Pages behavior must be confirmed after upload.
3. GitHub Pages deployment itself was not performed because this environment has no authenticated access to the user's repository.
4. No actual GNSS plate-motion stream, Bangladesh lightning-detection network, official BMD lightning-warning API, BS-1 Earth-imaging feed, SMS/email gateway, or physical sensor/control integration is included.
5. No calibrated Bangladesh-specific 30-second lightning nowcast, earthquake prediction, official emergency alerting, or physical lightning-energy capture is implemented.

## Post-deployment acceptance checklist

- Confirm GitHub Pages URL loads `index.html` without 404s.
- Open **Seismic & Plate Motion** and verify source state, regional/global event list, canvas redraw, and calculator output.
- Open **Earth Observation**, select date, layer and geographic extent; verify that NASA GIBS returns an image. If not, confirm that the explicit unavailable state is shown and use NASA Worldview.
- Open **Alert Center**, run the simulated alert test, export JSON, and confirm no simulated item is described as a real event.
- Permit browser notifications only after pressing the notification button, then verify browser permission behavior.
- Open **Thunderstorm Energy Recovery**, run the low-voltage synthetic pulse, and verify that all images load from `assets/*.webp`.
- Test on desktop and mobile; check reduced-motion settings, readability and external-feed failure messages.

## Data integrity / scientific boundaries

- USGS feed events are reported catalog entries. Feed/caching delays and event revisions are possible; this is not an earthquake prediction service.
- NASA GIBS imagery is time-stamped, product-dependent Earth observation, not continuous live video.
- Bangladesh Satellite-1 is a communications/broadcast satellite in the public BSCL service description; this build does not claim BS-1 supplies Earth-observation imagery.
- Thunderstorm model data, any probability returned by the forecast API, Lightning Potential Index (J/kg), satellite cloud observations, detected lightning and simulated electrical pulses are different quantities and are labelled separately.
- Never connect experimental storage/conversion equipment to a lightning-protection conductor, grounding electrode, power utility or real lightning path. Real lightning protection requires qualified design and compliant installation.
