# IGERS EarthCommand — public-data Earth monitor & disaster scenario lab

A static, GitHub Pages-compatible single-page app that combines an interactive 3D Earth visualization, USGS past-day earthquake events, Open-Meteo model-based weather data, NASA GIBS satellite imagery, disaster planning scenarios, and IGERS-BD-01 concept calculators.

## Important integrity statement

- **USGS feed**: public earthquake catalog observations; coverage and review latency vary.
- **Open-Meteo**: numerical weather-model output for the chosen Bangladesh location, not a local sensor.
- **NASA GIBS**: satellite-derived imagery visualizations; processing and available dates can lag acquisition.
- **Convective environment index**: unvalidated research/demo index, **not** probability of a lightning strike and not an official warning.
- **3D satellite orbit overlay**: illustration only; not live orbital tracking.
- **Disaster scenario engine and incident board**: local browser-only planning functions; no emergency dispatch, evacuation instruction, or physical actuator control.
- **IGERS Energy Lab**: transparent illustrative calculations; output depends on user assumptions and does not establish field performance.

If a provider cannot be reached, the interface marks it unavailable or uses clearly labelled example events. It must not be used as the sole basis for public warnings, evacuations or emergency operations.

## Run locally

Serve this directory over HTTP (ES modules, import maps and the service worker do not work reliably from `file://`). For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` from this directory. The 3D globe uses a pinned Three.js CDN dependency. Public data requires a network connection.

## GitHub Pages deployment

This module is intentionally stored in a separate `earth-command-center/` folder to avoid overwriting the existing IGERS root `index.html`.

1. Extract the update ZIP.
2. Upload the **earth-command-center folder** into the root of the existing IGERS repository (keep the folder name intact).
3. Commit and push the upload.
4. Open `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/earth-command-center/`.
5. If the repository's Pages deployment uses a `/docs` folder rather than the root, put `earth-command-center/` inside that `/docs/` folder instead.

You can add a navigation link to the existing IGERS homepage if useful:

```html
<a href="./earth-command-center/">Open EarthCommand</a>
```

No API key or backend server is required for the included public feeds. This is a frontend prototype, not a secured production command-and-control platform.
