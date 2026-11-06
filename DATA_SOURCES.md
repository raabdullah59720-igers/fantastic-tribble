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


## Bangladesh Satellite 3D & Imagery Monitor
- CelesTrak public GP/OMM groups: `https://celestrak.org/NORAD/elements/gp.php?GROUP=earth-resources&FORMAT=JSON` and corresponding `weather`, `gps-ops`, `glonass-ops`, `galileo`, `beidou`, and `stations` groups. Positions are locally propagated with Satellite.js SGP4/SDP4 from the OMM epoch; the 1-second display cadence is not new satellite telemetry. Respect the CelesTrak usage policy: https://celestrak.org/usage-policy.php .
- NASA GIBS imagery: https://gibs.earthdata.nasa.gov/wms/epsg3857/nrt/wms.cgi . The preview uses dated MODIS/VIIRS corrected-reflectance imagery; it is a processed satellite image product, not a live camera stream. Product availability is date/layer dependent. Documentation: https://nasa-gibs.earthdata.nasa.gov/ .
- Russian EO access: Roscosmos Geoportal https://gptl.ru/ and project information https://gptl.ru/about ; NTs OMZ operator information https://ntsomz.ru/research-center-for-earth-operative-monitoring/ . The Geoportal describes published image routes from Resurs-P, Kanopus-V and Meteor-M and states published full-resolution scenes are viewable by all users, while new capture/order tools are restricted to federal executive authorities. Bangladesh imagery availability is not assumed. A direct operator API/contract and authorized credentials are not present in this static app.
- WMO KANOPUS-V3 profile: https://space.oscar.wmo.int/satellites/view/kanopus_v3 . Mission metadata and operational status are time-dependent and must be rechecked with the operator.


## Russian EO imagery / Bangladesh panel (2026-11-05, cache v31)

- Orbit elements: CelesTrak GP/OMM JSON groups, propagated locally with Satellite.js SGP4/SDP4. The panel identifies Russian-labelled Earth-observation candidates by public catalogue name and GLONASS records by group. A name match is not a complete independent operator verification.
- Public Russian scene archive: Roscosmos Geoportal (https://gptl.ru/) publishes imagery routes from Resurs-P, Kanopus-V and Meteor-M. Its project page says published full-resolution scenes are publicly viewable, while some archive ordering / new-acquisition features are restricted to federal executive bodies.
- Russian EO operator: NTs OMZ (https://ntsomz.ru/research-center-for-earth-operative-monitoring/) describes access to Russian EO data, acquisition scheduling, reception and processing; deployment of Russian EO assets is organized on a contract basis with Roscosmos.
- Independent preview imagery: NASA GIBS daily/near-real-time MODIS/VIIRS products. These are not Russian satellite scenes and not live camera video. Product date is shown in the panel; availability and latency depend on the chosen product.
- No Russian direct image API, camera stream, tasking channel or credentials are embedded. A provider-side authorized API, license/contract and server-side credential handling are prerequisites for a genuine Russian scene to be delivered inside Terravex.


## Bangladesh Radiological Safety & Civil Protection Centre (v32)

- **Administrative map layer:** DGHS-hosted `All_Districts` ArcGIS FeatureServer layer. The browser requests GeoJSON through the layer query endpoint using `division` and `district` attributes and WGS84 coordinates. If the endpoint, CORS or network is unavailable, the panel keeps the base map and reports the boundary feed as unavailable; it does not invent polygons. Service metadata: https://gis.dghs.gov.bd/server/rest/services/Hosted/All_Districts/FeatureServer/0
- **National mapping reference:** Bangladesh NSDI / Survey of Bangladesh data catalogue, which describes national, division, district and upazila mapping products and coordinate reference details: https://new.nsdi.gov.bd/datacatalog/
- **Emergency information:** Department of Disaster Management AWARE portal provides public multi-hazard warning and shelter information. The app links to it but does not scrape or certify its live records: https://rapid.ddm.gov.bd/home/weather/ and https://rapid.ddm.gov.bd/service/shelter_info
- **Radiological safety expertise:** BAEC Radiation Protection & Medical Dosimetry information page describes radiation protection, calibration and radiological/nuclear emergency-response responsibilities: https://baec.gov.bd/pages/static-pages/695b97d2c4774958d7b702c7
- **Regulatory reference:** Bangladesh Atomic Energy Regulatory Authority: https://baera.gov.bd/
- **International reference:** IAEA Incident and Emergency Centre describes USIE, EPRIMS, IRMIS and assessment/prognosis resources. This static app is not connected to these restricted/member-state channels: https://nucleus.iaea.org/Pages/IEC.aspx
- **Measurement integrity:** No calibrated radiation sensor API, national environmental dose-rate network, BAERA/BAEC backend, IAEA IRMIS interface, official warning feed, emergency dispatch, nuclear plant process-control interface, or satellite command link is connected. User-entered logs are session-only and labeled `UNVERIFIED_USER_SUBMISSION`. No automatic dose classification, plume model, evacuation route decision, weapon functionality or facility operations are provided. Satellite imagery is context only and is never interpreted as a radiation measurement.

## User-controlled device location (v33)

- **Source:** Browser Geolocation API (`navigator.geolocation`) on the user's own device, after HTTPS origin and explicit browser permission. MDN reference: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API and https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy .
- `enableHighAccuracy` is a request hint to the browser/device, not a promise of GNSS-only positioning or a guaranteed accuracy. The provider may combine GNSS/GPS, Wi-Fi, cellular and other device signals. The web API exposes coordinates, timestamp, optional altitude/speed/heading and a horizontal accuracy estimate, but does not expose a live satellite/constellation lock list.
- `maximumAge: 1000` bounds reuse of a cached location to one second; it does **not** set the update frequency. The browser/device determines callback cadence and can throttle background pages.
- The panel validates coordinate ranges, accuracy and timestamps; shows a fix-age indicator; and uses only the browser-reported accuracy radius. Accuracy bands are UI groupings, not an engineering standard or guarantee.
- Location remains in page memory. It is not uploaded to the Terravex backend or written to persistent browser storage. The user may explicitly open coordinates in OpenStreetMap or send them to the selected weather provider. The optional Observatory overlay shares the last fix via a local browser event only.
- The watch ends when the user leaves the Location panel or closes/reloads the page. Satellite operator tracking, satellite modem access, raw GNSS measurement data, NMEA receiver telemetry and guaranteed one-second updates are not integrated.


## Public environmental satellite imagery integration (v34)
- **JMA Himawari Real-Time Image, Southeast Asia 1:** https://ds.data.jma.go.jp/mscweb/data/himawari/sat_img.php?area=se1 . This public JMA page presents RGB-composite geostationary satellite imagery for the Southeast Asia sector. The JMA page controls/display its own observation time. The embedded browser frame cannot be inspected cross-origin by Terravex; a browser iframe `load` event is not proof that imagery rendered. A direct official-page link is provided as fallback. This is public weather/cloud imagery, not live video, private satellite telemetry, person tracking or radiation measurement.
- **NASA EOSDIS GIBS WMTS:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/` uses the official REST tile pattern `/{LayerIdentifier}/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.{FormatExt}`. Terravex uses `MODIS_Terra_CorrectedReflectance_TrueColor` with `GoogleMapsCompatible_Level9` and a user-selected UTC date. This is dated satellite imagery; availability/latency depend on product and date. Documentation: https://nasa-gibs.github.io/gibs-api-docs/access-basics/ .
- **Map handling:** Leaflet is initialized only after the page is visible and then resized with `invalidateSize`; a jsDelivr CDN fallback is attempted if the primary Leaflet script did not load. Each tile layer has request/load/error indicators. A status is only changed to tile-received after an actual tileload event. External imagery and GIS endpoints are never cached in the PWA shell as if they were live.
- **District polygons:** DGHS All_Districts FeatureServer query returns public administrative geometry and fields such as `division` and `district`; this is geographic reference data only. The browser retries it when the map is re-entered/refreshed and preserves a base-map-only degraded state if the GIS request fails: https://gis.dghs.gov.bd/server/rest/services/Hosted/All_Districts/FeatureServer/0 .
- **Limitations:** This package cannot inspect a cross-origin iframe's image pixels or provider acquisition timestamp. A frame load event is shown as an iframe navigation event only. User must visually verify the official provider page's timestamp. No operator satellite uplink, sensor feed, user tracking, targeting or camera control is included.
