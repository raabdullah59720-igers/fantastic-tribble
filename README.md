# TERRAVEX APEX — Earth Systems & Safety Upgrade

**Repository:** `terravex-apex`  
**Hosting:** GitHub Pages (static root)  
**Package:** complete app, with additive seismic, satellite-imagery, and alert-center panels  
**License:** Apache-2.0 project license; review attribution and third-party asset terms before redistribution.

## Quick deployment

1. Download `TERRAVEX-APEX-EARTH-SCIENCE-UPGRADE.zip` and extract it.
2. Open the extracted folder. Upload the **contents** of that folder to the root of your `terravex-apex` GitHub repository. Do not upload only the ZIP, and do not create an extra nested project folder.
3. Keep `index.html`, `app.js`, `styles.css`, `earth-systems-upgrade.js`, `earth-systems-upgrade.css`, the Thunderstorm Energy Lab files, and the `assets/` folder together.
4. In GitHub, open **Settings → Pages**. Select **Deploy from a branch**, choose `main` and `/(root)`, then save.
5. Open the Pages URL and test the panels and data indicators below. Allow external requests in the browser.

Back up your existing repository before replacing files. This ZIP is a complete build of the supplied TERRAVEX APEX starter plus the earlier Thunderstorm Energy Lab, not a patch for arbitrary unknown repository versions.

## New modules

### Seismic & Plate Motion Command

- Fetches the USGS `all_day.geojson` earthquake summary, with timeout/error handling and a dated fetch status.
- Plots source-reported earthquake coordinates on a regional/global schematic canvas.
- Provides an animated, stylized cross-section of the India–Eurasia–Burma/Sunda interaction zone.
- Includes editable convergence-rate, duration, reference-length, moment-magnitude, stress, area and slip calculators.
- The geology motion is an explicitly exaggerated time-lapse model. It is **not a live GNSS displacement sensor**, authoritative plate-boundary GIS, earthquake prediction, or a measurement of recoverable energy.

### NASA Earth Observation

- Requests date-stamped imagery from NASA GIBS WMS (`MODIS Terra/Aqua` and `VIIRS` true-color products when available).
- Offers date, layer and geographic-extent controls, an image failure state, and a link to NASA Worldview.
- NASA GIBS imagery is product-dependent and date-based. It is not continuous satellite video. A source may return a blank/incomplete map when acquisition or processing is still pending.
- Bangladesh Satellite-1 (BS-1) is represented accurately as a communications/broadcasting service. No public, verified BS-1 Earth-imaging feed is included in this app.

### Unified Earth Alert Center

- Polls the USGS 24-hour earthquake catalog and alerts on newly appearing records that meet the user-set magnitude and region threshold. The first good fetch creates a baseline rather than replaying old earthquakes.
- Polls Open-Meteo forecast/model fields for a Bangladesh location. A thunderstorm probability is used only when the endpoint returns that field. Lightning Potential Index remains a J/kg environmental index and is never mislabeled as percent probability.
- Keeps a local alert log, source/quality state, JSON export, a simulated-alert test button, and optional browser notifications (requires the user's explicit click and browser permission).
- Watchers default on within the open page. Earthquake polling uses a 2-minute interval; weather-model polling uses 15 minutes. Polling pauses while the tab is hidden.
- No SMS/email dispatch, government-warning integration, lightning-event detector, or physical device control is implemented.

## Data source references

- **USGS Earthquake Hazards Program — real-time GeoJSON feeds:** https://earthquake.usgs.gov/earthquakes/feed/v1.0/
- **USGS event catalog/API documentation:** https://earthquake.usgs.gov/fdsnws/event/1/
- **NASA GIBS API documentation:** https://nasa-gibs.github.io/gibs-api-docs/
- **NASA Worldview:** https://worldview.earthdata.nasa.gov/
- **Open-Meteo API documentation:** https://open-meteo.com/en/docs
- **GPlates Web Service plate-model catalogue:** https://gwsdoc.gplates.org/models/
- **Bangladesh Satellite Company Limited (BSCL):** https://bscl.gov.bd/index.php/about/
- **ISRO MOSDAC:** https://mosdac.gov.in/
- **NOAA GOES-R GLM instrument overview:** https://goes-r.noaa.gov/spacesegment/glm.html. Its lightning mapper coverage does not provide a Bangladesh-specific feed for this package.

The implementation was informed by the user-supplied *Thunderstorm Interception & Lightning Energy Engineering Analysis* and *Lightning / Thunderstorm Satellite Sensing, 30-second Nowcasting and the Physics of Energy Capture* PDFs. Their main engineering constraints are retained: distinguish satellite context from occurred lightning; do not promise a precise 30-second strike prediction; separate a professionally designed lightning-protection path from a low-voltage energy demonstrator; and do not present simulated energy transfer as measured atmospheric capture.

## Scientific definitions

- Instantaneous electrical power: `P(t) = V(t) I(t)`.
- Transferred electrical energy: `E = integral V(t) I(t) dt`.
- Ideal capacitor energy: `E_C = 0.5 C V^2`.
- Simple plate-motion scenario displacement: `delta_x = velocity * elapsed_time`.
- Reference strain: `epsilon = delta_x / reference_length`.
- Rough empirical radiated earthquake-energy scale: `log10(E[J]) ≈ 1.5 M + 4.8`; this is an order estimate from magnitude, not recoverable energy.
- User-defined fault-work scale: `W ≈ stress * area * slip`; it is a toy scenario and not a validated fault-energy model.

All scenario outputs should be interpreted within their displayed assumptions. The app does not predict when/where an earthquake or lightning strike will occur.

## Safety policy

If thunder is audible or official guidance indicates that a thunderstorm is threatening, move to a substantial enclosed building or hard-topped vehicle. Do not wait for a model score. Never connect experimental energy-storage circuitry to a real lightning protection conductor, down-conductor, grounding electrode, utility line or outdoor mast. Any installed lightning protection or sensor hardware requires appropriately qualified engineering and compliant design.

## Browser support and offline behavior

The app is dependency-light and static-hosted. The core UI opens without live internet sources. USGS/Open-Meteo/NASA requests require browser network access and may fail due to provider availability, product latency, or local network restrictions. No API secrets are bundled. The canvas views are original schematic visualizations, not certified GIS or scientific 3D reconstruction engines.

## QA

See `QA_REPORT.md` for automated syntax, structure, file-reference, archive and calculation checks. A successful local ZIP check does not prove that all remote APIs or GitHub Pages will work in every deployment; run the acceptance checklist in that report after upload.
