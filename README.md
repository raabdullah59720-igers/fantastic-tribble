# TERRAVEX APEX

**Earth Intelligence · Environmental Monitoring · Disaster Operations · IGERS Energy Systems**

A static-hosted prototype combining a canvas-based conceptual Earth view, public environmental data integrations, scientific calculators, and a local disaster-preparedness board.

## Quick start

1. Extract this ZIP. The files are at the ZIP root; there is no nested project folder.
2. Keep `index.html`, `styles.css`, and `app.js` together in the same folder.
3. Open `index.html` in a modern browser. For best results, use a local static server or GitHub Pages so browser security policies are predictable.
4. Internet access is required for USGS and Open-Meteo feeds. The application itself does not require a backend.

## GitHub Pages deployment

1. Create a repository named `terravex-apex`.
2. Upload the contents of this folder to the repository root. Keep `index.html` at the root.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Wait for the deployment workflow to finish and open the Pages URL shown by GitHub.
6. If a feed fails, use Refresh and inspect the connection state. Third-party availability is not guaranteed.

## Implemented modules

- Command Overview with current feed summaries and a stylized rotating canvas globe.
- Earthquake monitor consuming the USGS `all_day.geojson` summary feed, with event filters and source links.
- Weather panel consuming Open-Meteo current model values and an hourly temperature series for selected Bangladesh locations.
- Lightning impulse visualizer using explicitly synthetic low-voltage values.
- Water-load and strain scenario calculators.
- IGERS kinetic-energy difference, hydraulic power, and capacitor-energy calculators.
- Local disaster planning board, preparedness checklist, and JSON report export.
- NASA Worldview external imagery browser (embedding may be blocked; direct link is provided).

## Scientific and operational limits

- The globe is a custom canvas illustration with event markers, not a full Three.js terrain globe or certified GIS/navigation map.
- Open-Meteo values are model/forecast output, not ground-sensor observations.
- USGS feed events can be revised and feed caching can introduce delay.
- NASA Worldview/GIBS imagery has product-dependent latency and availability.
- NOAA GOES-R lightning feed ingestion is **not** implemented. Lightning waveform values are synthetic and do not forecast strikes.
- No official emergency alerts, SMS/email distribution, dispatch, authentication, persistent database, or physical device control is implemented.
- Energy outputs are simplified estimates and are not validated IGERS field-performance measurements. Net recoverable energy may be lower due to system losses and energy penalties.

## Data sources and references

- USGS Earthquake GeoJSON feeds: https://earthquake.usgs.gov/earthquakes/feed/v1.0/
- USGS earthquake software and catalog guidance: https://earthquake.usgs.gov/data/software/
- Open-Meteo Forecast API documentation: https://open-meteo.com/en/docs
- NASA GIBS documentation: https://nasa-gibs.github.io/gibs-api-docs/
- NASA Worldview: https://worldview.earthdata.nasa.gov/
- NOAA GOES-R GLM instrument overview (reference only): https://goes-r.noaa.gov/spacesegment/glm.html

Open-Meteo data is provided under its published terms/attribution guidance. Check each upstream provider's current terms before commercial redistribution. NASA GIBS attribution should be included when its imagery is used, as described in its official documentation. No third-party imagery or font assets are bundled.

## License

Apache License 2.0. See `LICENSE`.


## Thunderstorm Energy Lab Add-on (October 2026)

This release adds an integrated **Thunderstorm Energy Recovery** navigation panel. It is implemented as a separate page (`thunderstorm-energy-lab.html`) displayed inside the main app, with its own CSS and JavaScript. All previous app modules remain in the package. The add-on includes low-voltage pulse energy accounting, configurable induction/rectifier/DC-DC efficiency, capacitor energy storage, simulated load draw, animated synthetic waveform, model weather context for selected Bangladesh locations, local UI alerts, and JSON/CSV export.

- `thunderstorm-energy-lab.html` — panel markup
- `thunderstorm-energy-lab.css` — responsive visual system
- `thunderstorm-energy-lab.js` — calculation, local alerts, synthetic simulation and weather API client
- `assets/` — three concept visuals and the supplied reference image

The animation and circuit values are simulation inputs, not measurements from a lightning strike or a validated physical prototype. Open-Meteo fields are forecast/model output, not lightning detection. No direct NOAA GLM ingestion is implemented; GLM coverage is centered on the Americas and adjacent oceans. The lab does not trigger lightning, operate high-voltage equipment, send official alerts or control hardware.

Official references: [Open-Meteo documentation](https://open-meteo.com/en/docs), [NOAA GOES-R GLM](https://goes-r.noaa.gov/spacesegment/glm.html), [NOAA lightning safety](https://www.weather.gov/safety/lightning-safety-overview).
