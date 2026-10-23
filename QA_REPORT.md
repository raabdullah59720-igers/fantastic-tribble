# QA / release notes — EarthCommand preview build

Build ID: `2026.10.23-preview-01`
Target: static hosting / GitHub Pages; all app source is below 98 files.

## Scope and design checks

- Kept the new module under `earth-command-center/` to avoid overwriting the existing IGERS root homepage.
- Uses public provider APIs from the browser; no embedded secret keys.
- USGS, Open-Meteo and NASA GIBS source states are tracked independently; failed requests are not marked live.
- Earthquake fallback markers are explicitly labelled `DEMO`; they are never described as real observations.
- Weather results are described as model data, not station telemetry.
- The convective environment score is labelled an experimental proxy, not a lightning probability or warning.
- Satellite orbit in the 3D globe is explicitly illustrative, not live ephemeris.
- Scenario/incident controls have no dispatch or external-control implementation; records remain in page memory and export locally.
- IGERS calculators update from the entered assumptions and display formula notes and model limitations.
- Service worker caches same-origin shell files only; external APIs remain network requests.
- No user location permission is requested. The user selects from named Bangladesh locations.

## Automated/local checks to run after extraction

1. `python -m http.server 8000` from this directory; open `http://localhost:8000`.
2. Confirm first-party HTML/CSS/JS load without 404 errors.
3. Confirm the WebGL globe loads if CDN/network/WebGL is available; the 2D fallback appears otherwise.
4. Confirm USGS and Open-Meteo states reflect success or offline accurately.
5. Confirm NASA image either loads or shows its fallback panel.
6. Change the city selector and confirm coordinates and weather fields update on successful response.
7. Adjust disaster sliders, add/remove a local scenario and export the JSON brief.
8. Change road/water inputs and confirm calculated outputs update; compare with the displayed formulas.
9. Test mobile widths and keyboard navigation; verify no layout clipping in a target browser.

## Verification boundary

This package has been inspected for file layout and JavaScript syntax. Provider availability, returned values, WebGL rendering and Pages deployment depend on the user's browser, network policy, browser extensions, CDN access and repository Pages settings. A successful live-browser/API integration test against all providers is not claimed in this report.
