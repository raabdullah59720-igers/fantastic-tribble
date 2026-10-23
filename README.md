# TERRAVEX APEX · Bangladesh Satellite & Science Upgrade

**Static deployment:** GitHub Pages, repository root  
**Deliverable file count:** 22 (including docs, license, `.nojekyll`, and four compressed visual assets)  
**Intent:** additive dashboard update based on the previously supplied TERRAVEX APEX Earth-science package and two lightning research PDFs.

## Install
1. Back up your current repository.
2. Download and extract `TERRAVEX-APEX-BANGLADESH-OBSERVATORY.zip`.
3. Upload the **contents** of the extracted folder (not only the ZIP and not a nested folder) into the root of `terravex-apex`.
4. Keep all CSS/JS files next to `index.html`; preserve the `assets/` directory for the earlier thunderstorm demonstrator assets.
5. Configure **Settings → Pages → Deploy from a branch → main → /(root)**.
6. Open the Pages URL and test the new **Bangladesh Observatory** and **Lightning Nowcast Lab** pages. Internet is required for remote map/image/feed services.

## New: Bangladesh Satellite & Tectonic Observatory
- Leaflet interactive map centered on Bangladesh and the Bay of Bengal.
- NASA GIBS near-real-time daily corrected-reflectance true-colour imagery through WMS; the date/layer are visible and editable. A daily composite is not live video and the latest day may be incomplete.
- PB2002 plate-boundary reference layer pulled from a publicly published GeoJSON conversion by `fraxen/tectonicplates`; map remains useful if that third-party source fails.
- USGS-reported earthquake markers reused from the app's shared USGS adapter, with event time, depth, coordinates and source record link.
- Published relative-motion reference vector: Panda et al. (2020) reports approximately 37 mm/year along N11°E near 24°N, 90°E for its India–Sunda model. This is a geodetic research result, not live GNSS telemetry.
- Cross-section visual is expressly schematic and uses exaggerated animation to show relative plate geometry. It is not a 3-D seismic tomography product.
- Plate displacement and reference strain calculator, snapshot JSON export, and links to BMD / NASA / GPlates resources.
- Bangabandhu Satellite-1 is correctly described as communications/broadcasting infrastructure; no public verified Earth-imaging feed is claimed.

## New: Lightning Nowcast Research & Validation Lab
Based on the attached *Thunderstorm Interception & Lightning Energy Engineering Analysis* and *Lightning / Thunderstorm Satellite Sensing, 30-second Nowcasting and the Physics of Energy Capture* PDFs:
- Multi-sensor data/source panel with explicit unavailable-sensor and model-validation status.
- User-entered end-to-end latency budget calculator. A latency budget within 30 seconds does not establish prediction skill.
- Illustrative logistic sigmoid with no trained coefficients claimed.
- Performance metrics: POD/recall, false-alarm ratio, CSI, accuracy and Brier score.
- JSON export of assumptions and sample validation data.
- Operational 30-second lightning-risk scoring remains withheld because no verified low-latency Bangladesh lightning network or locally trained and independently validated model has been configured.

## Attached research sources reviewed
- `Thunderstorm_Interception_and_Lightning_Energy_Engineering_Analysis.pdf` (provided with the request; safety architecture, energy accounting and low-voltage demonstrator limits).
- `Lightning_Thirty_Second_Satellite_Sensing_and_Energy_Harvesting_Research.pdf` (provided with the request; source latency, lightning nowcasting validation, sensor coverage and Bangladesh-specific deployment constraints).

These PDFs are references used during implementation; they are not bundled in the app ZIP.

## Sources
- NASA GIBS access/API documentation: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA Earth Observation: Bangladesh: https://science.nasa.gov/earth/earth-observatory/bangladesh-77364/
- Bangladesh Meteorological Department satellite products: https://live6.bmd.gov.bd/satelite
- USGS earthquake real-time feeds: https://earthquake.usgs.gov/earthquakes/feed/v1.0/
- PB2002 plate-boundary GeoJSON conversion: https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json
- Bird (2003), PB2002 plate model: https://doi.org/10.1029/2001GC000252
- Panda et al. (2020), India-Sunda plate motion: https://doi.org/10.1029/2019TC006034
- Mallick et al. (2019), continuous GNSS across India-Burma-Sunda: https://doi.org/10.1029/2018JB016480
- GPlates EarthByte model catalogue: https://gwsdoc.gplates.org/models/
- BSCL Satellite-1 service/mission information: https://bscl.gov.bd/index.php/about/
- NOAA GOES-R GLM instrument: https://goes-r.noaa.gov/spacesegment/glm.html
- Open-Meteo documentation: https://open-meteo.com/en/docs

## Scientific guardrails
- Satellite lightning imagers observe optical flashes already underway; satellite cloud context alone does not guarantee an exact strike prediction 30 seconds ahead.
- The PDFs require timestamps, source region, data age, latency, uncertainty and source health to be visible. Stale or missing data must be flagged, not relabeled as live.
- A cited plate-motion value is a model/reference estimate from a study and epoch, not a live coordinate displacement measurement.
- Earthquake event feeds report detected/reviewed events. They do not predict future earthquakes.
- Lightning-protection down-conductors must remain separate from experimental capacitors, rectifiers, converters and storage circuits. Lightning is a hazard, not an energy source to approach during a storm.
- The default performance-metric numbers and Brier pairs in the validation tool are synthetic examples. Replace with true labelled, time-aligned held-out results.

## QA
See `QA_REPORT.md`. Static syntax/structure/calculator checks were run locally. Remote NASA tiles, third-party GeoJSON, browser interaction and GitHub Pages deployment depend on external services and were not represented as successful unless verified.
