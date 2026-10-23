# TERRAVEX APEX — QA Report

## Scope
Standalone build from the supplied master prompt. No prior application archive or research PDF was present in the supplied files, so no baseline-preservation test was possible.

## Static and package checks
- [x] Root entry point `index.html` created; CSS and JavaScript are separate root files (`styles.css`, `app.js`).
- [x] ZIP is flat: upload the extracted contents directly to the repository root, with no nested project directory.
- [x] JSON export cleanup adjusted to avoid revoking the download URL immediately.
- [x] JavaScript syntax check passed with Node.js `--check`.
- [x] HTML parser smoke check passed.
- [x] Formula benchmark checks passed for kinetic energy, hydraulic output and water-load pressure.
- [x] ZIP integrity test passed; 7 deliverable files, well under the 98-file limit.
- [x] README, Apache 2.0 license and QA report included.
- [x] No build step or server-side runtime required.
- [x] No API secrets or credentials included.
- [x] Public feeds use request timeout handling and visible failure states.
- [x] Calculation inputs validate non-negative values and efficiency ranges where applicable.
- [x] JSON export is implemented for the local disaster planning board.
- [ ] Full browser matrix / accessibility audit: not performed in this environment. A headless Chromium smoke attempt timed out because the page runs continuous animation; this is not counted as a pass.
- [ ] GitHub Pages deployment: not performed; requires upload to the user's repository.
- [ ] Live endpoint availability in the user's browser: not guaranteed and must be checked after deployment.

## Functional checks to run after upload
1. Open the Pages URL and check the command overview renders.
2. Confirm USGS feed shows `CONNECTED` or an honest `OFFLINE` state.
3. Change weather location and verify the model timestamp and values update.
4. Test kinetic energy with mass 1500 kg, 50 km/h to 20 km/h: ideal kinetic difference should be about 121.5 kJ before efficiency.
5. Test hydraulic output with ρ=1000 kg/m³, Q=0.05 m³/s, H=2 m, η=60%: about 588.4 W.
6. Test water load with ρ=1000 kg/m³, g=9.80665 m/s², Δh=0.5 m: about 4.903 kPa.
7. Add a planning item and export JSON; verify the downloaded file parses.
8. Test on mobile width and verify navigation drawer, cards, and calculators remain usable.

- [x] Literal JavaScript element-ID references checked against the HTML: 84 referenced IDs, none missing.
- [x] Flat ZIP layout checked: `index.html`, `styles.css`, and `app.js` are all at the archive root.

## Known limitations
The Earth scene is a custom 2D canvas-based globe illustration with rotation and perspective effects, not a full Three.js 3D terrain engine. NASA Worldview is an external iframe and may refuse embedding. NOAA GLM lightning ingestion is not implemented. Lightning pulses are synthetic. Incident planning is local to the page session and is not persistent or transmitted. No official alerting, authentication, emergency dispatch, or hardware control is provided.
