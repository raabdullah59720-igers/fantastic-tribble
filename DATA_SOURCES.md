# Data sources and technical notes

## USGS ComCat GeoJSON
Endpoint: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`

Used for current public earthquake features and the 24-hour event list. Event magnitudes, location estimates, timestamps, depths and URLs are read from provider GeoJSON. Catalog content may be revised; some events are reviewed later.

Documentation: https://earthquake.usgs.gov/earthquakes/feed/v1.0/ and https://earthquake.usgs.gov/fdsnws/event/1/

## Open-Meteo Forecast API
Endpoint: `https://api.open-meteo.com/v1/forecast`

Used for current model fields and hourly precipitation probability, CAPE where available, clouds and gusts for the chosen Bangladesh coordinate. Data is model output and the city coordinate is only a representative point, not an installed station.

Documentation: https://open-meteo.com/en/docs

## NASA Global Imagery Browse Services (GIBS)
Endpoint domain: `https://gibs.earthdata.nasa.gov/`

The application requests a WMS global image using the `MODIS_Terra_CorrectedReflectance_TrueColor` layer with an intentionally lagged date to reduce empty-tile risk. The layer may still be unavailable for a given date. GIBS imagery is not a lightning strike sensor or real-time hazard warning.

Documentation: https://nasa-gibs.github.io/gibs-api-docs/access-basics/

## Three.js
Pinned CDN dependency: Three.js `0.170.0` and its matching OrbitControls module. Textures are loaded from the Three.js public examples endpoint, with a procedural fallback texture if an image cannot be fetched.

Documentation: https://threejs.org/docs/

## Calculators
Road model: `E_gross = 0.5 × m × ((v_in/3.6)^2 − (v_out/3.6)^2)`; modelled recovered energy is `max(0,E_gross) × η_net`. Daily energy multiplies per-event recovery by eligible passages/day and converts joules to kWh (`3.6 × 10^6 J = 1 kWh`).

Micro-hydro: `P = ρ × g × Q × H × η`, where `ρ` is water density, `g` gravitational acceleration, `Q` flow and `H` net head; `E_day = P × 24 h`. These calculators do not replace site survey, detailed losses, ecological-flow constraints, structural design or measured testing.

## Weather environment proxy
A weighted, bounded score is computed from model-based precipitation probability, cloud cover, gust speed and CAPE when provided. Weighting is heuristic and has not been trained, calibrated or validated against lightning strike records. It must never be described as an actual lightning probability or official alert.
