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


## Atmospheric Entry & Exit Watch
- CelesTrak Recently Decayed Objects: https://celestrak.org/satcat/decayed-with-last.php — a 60-day catalogue list, not a direct radar stream. The displayed decay date and last-element epoch are source catalogue fields.
- CelesTrak SATCAT format: https://celestrak.org/satcat/satcat-format.php — authoritative field definitions including decay date.
- NASA/JPL CNEOS fireballs: https://cneos.jpl.nasa.gov/fireballs/ and https://ssd-api.jpl.nasa.gov/doc/fireball.html — government-sensor reports; NASA states the feed is not real-time and not all fireballs are reported. The API terms say not to embed this API in websites; this app provides source links only.
- NASA Ozone Watch: https://ozonewatch.gsfc.nasa.gov/ — satellite-derived total-column ozone products. Dobson Units are not interchangeable with surface ozone concentration.
- Monitoring cadence: optional 60-minute browser-side re-check. It requires the browser and app to remain open; it is not a guaranteed real-time alert service.


## Asia Regional Activity Watch
- OpenSky Network REST API `/api/states/all`: https://openskynetwork.github.io/opensky-api/rest.html — ADS-B/Mode-S-derived aircraft state vectors from the crowd-sourced receiver network. The panel requests a broad Asia observation bounding box and compares consecutive recent position-bearing states against a selected rectangular analysis zone.
- Entry/exit events are generated only when a previous and current fresh position fall on opposite sides of the selected zone boundary and the observation gap is no more than 30 minutes. The displayed event time is an interval bounded by source position timestamps; it is not an exact radar crossing time. First-seen observations do not create entry alerts.
- OpenSky access conditions and anonymous API credits are provider-controlled. The current documentation describes 400 daily credits for anonymous access; requests covering more than 400 square degrees cost 4 credits. The panel therefore applies a conservative 15-minute query cooldown to its broad Asia envelope. Shared app use by other panels can still consume the same public service allowance. Check current provider policy before deployment.
- OpenSky data are intended for research and non-commercial use under the public API terms; commercial use requires provider consent. This panel does not infer authorisation, intent, nationality of control, or threat status. ADS-B does not cover every aircraft or drone.
- Ship/AIS, non-cooperative drone/radar, and ground-object detection feeds are not connected in this package and are explicitly shown as unavailable. The existing CelesTrak panel separately propagates public orbital elements; those are calculated catalogue positions, not satellite telemetry or a live Earth-imaging sensor.


## Thunderstorm Energy Device Digital Twin
- **JMA Himawari-9 South Asia public viewer:** https://www.data.jma.go.jp/mscweb/data/himawari/sat_img.php?area=se4 ; public South Asia file index: https://www.data.jma.go.jp/mscweb/data/himawari/list_se4.html . JMA lists the South Asia sector as 70°E–100°E, 0°N–30°N, which includes Bangladesh. The browser embeds JMA's public viewer and offers direct links as a fallback. It provides satellite RGB/cloud imagery, not ground lightning-strike observations, private telemetry or a command uplink.
- **Himawari-9:** JMA identifies the operational geostationary satellite at approximately 140.7°E and 35,800 km altitude. Imagery is delivered through JMA's public web service; full operational data dissemination to National Meteorological and Hydrological Services has separate arrangements.
- **Open-Meteo:** https://open-meteo.com/en/docs . The device dashboard requests current model context plus hourly `precipitation_probability` and `cape` for the selected Bangladesh reference location. Precipitation probability is not thunderstorm probability. CAPE (J/kg) is a model-derived convective-instability measure, not a lightning strike count or direct lightning observation. Values are stamped with model-valid time and fetch time. If the API does not return a field, the UI displays `Not returned`; no synthetic live value is inserted.
- **Control integrity:** all pulse, cycle, conversion and storage controls operate the mathematical low-voltage digital twin in the browser. Hardware I/O, high-voltage / lightning path and satellite command are permanently marked `NOT CONNECTED` / `READ-ONLY`; no physical actuators or satellite commands exist in this PWA.
- **3D renderer:** pinned Three.js CDN build with local 2D isometric canvas fallback. The animated device and energy particles are schematic, not measured physical behaviour or proof of device performance.
