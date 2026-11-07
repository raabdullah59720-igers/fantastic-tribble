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


## v35 update — 3D launch and Russian public weather imagery
- Added visible 3D launch controls in the overview and Bangladesh Radiological Safety panel. Direct route: `?page=radiologicalsafety`.
- CesiumJS globe now starts independently of DGHS district GIS success. If the primary Cesium CDN is unavailable, the panel attempts a pinned jsDelivr CesiumJS fallback; imagery tiles try Esri first and OpenStreetMap second.
- Added a user-launched public weather imagery view of the official Russian Elektro-L meteorological portal (`https://electro.ntsomz.ru/en/`) with a direct-open fallback. Its page is titled “Earth in the last twenty-four hours”; the page snapshot inspected on 6 November 2026 displayed entries dated 25–26 October 2026, so freshness is not guaranteed. Verify the newest capture timestamp. This safety panel omits high-resolution EO scene ordering, tasking, target imaging and spacecraft control.
- This is public weather/Earth-observation imagery access, not a direct satellite command/uplink, not a continuous video stream, and not target or person surveillance. Cross-origin iframe load does not prove image pixels or capture time; verify inside the official viewer.
- Service-worker cache: `terravex-apex-shell-v35`.


## v36: explicit launch controls, independent 3D startup and Russian weather imagery
- The Bangladesh Radiological Safety Centre has Launch 3D Globe buttons in the Overview banner, panel header and globe card. Direct route: `?page=radiologicalsafety`.
- Cesium loading no longer depends on DGHS district GIS success. Startup is serialized to avoid duplicate Viewer instances. A pinned Cesium CDN fallback is attempted if the primary bundle is unavailable.
- Esri imagery tile delivery is probed with a real tile request before the UI reports a tile received; OpenStreetMap is tried as fallback. Engine availability and imagery availability remain separate states.
- Russian source is limited in this safety panel to the public Elektro-L meteorological imagery portal: https://electro.ntsomz.ru/en/ . The provider page title says “Earth in the last twenty-four hours”, but the page inspected 6 Nov 2026 displayed entries dated 25–26 Oct 2026; live freshness is not established. Confirm provider timestamp. Cross-origin iframe load means page navigation only, not image-pixel verification.
- This panel has no Russian EO scene ordering, camera tasking, spacecraft control, individual tracking or targeting features. PWA cache: `terravex-apex-shell-v36`.


## v37 — Same-globe aggregate civil mobility layers (2026-11-06)

The existing Live 3D Earth & Integrated Command page now has four optional same-globe overlays: coarse Air Activity Density (derived from an already-requested OpenSky Bangladesh snapshot), Road Congestion, Maritime Activity Density, and Authorized Drone Activity. The air layer bins positions into 1-degree cells and only paints cells meeting a 10-observation minimum. The other three layers accept read-only HTTPS GeoJSON from a provider gateway. They require `metadata.dataType="aggregated"`, `spatialResolutionKm >= 20`, an ISO `generatedAt`, a `source`, and Point cells with `count >= 10`, `radiusKm >= 10`, and `aggregationLevel` of `grid`, `district`, or `region`. Raw identifiers and per-object tracks are rejected.

- Air: existing OpenSky ADS-B state-vector snapshot. The provider documents 10-second anonymous and 5-second authenticated time resolution; these are not a guarantee of end-to-end display latency, and API requests are quota-limited. Source timestamp/fetch time is shown.
- Road: requires a backend adapter from an authorized traffic provider. Google Routes API can return traffic-aware route polylines and speed categories (`NORMAL`, `SLOW`, `TRAFFIC_JAM`) for DRIVE/TWO_WHEELER route requests; it is route-scoped, billed at a higher rate for traffic-aware use, and does not itself provide a free nationwide all-road sensor feed. Transform only permitted route/corridor observations into coarse cells before returning GeoJSON.
- Maritime: Global Fishing Watch 4Wings supports PNG/MVT aggregate tiles and gridded AIS vessel-presence data, but its documented vessel-presence dataset runs to about 96 hours before current time, is not live vessel telemetry and does not provide individual vessel tracks through that dataset. An API token and compliant backend adapter are required. Its terms specify non-commercial use (CC BY-NC 4.0) and attribution.
- Drone: no global public satellite feed exists for all drones. Drone Remote ID is a local radio broadcast in jurisdictions that require it; coverage depends on equipped aircraft and nearby authorized receivers. Terravex accepts only coarse authorized fleet activity summaries, not individual Remote ID identity/location.

The three external provider endpoint fields are optional and session-only. No API keys/tokens are stored in the browser. Endpoints must provide HTTPS, CORS access, aggregate-only GeoJSON, and their own provenance/latency metadata. Missing sources remain `NOT CONFIGURED`; no dummy live movements are drawn. The existing `Aircraft snapshot` feature remains separate and unchanged.

## v37 — Same-globe civil mobility overlays (2026-11-06)

- **Air activity density:** reuses the existing manually requested Bangladesh OpenSky ADS-B snapshot, then bins observations into 1-degree cells. Only cells with at least 10 observations are rendered as broad regional density ellipses. This layer is a snapshot, not a continuous radar feed. OpenSky's API documentation describes anonymous state-vector requests at 10-second time resolution and authenticated access at 5-second resolution; actual latency, availability and quotas remain provider-dependent: https://openskynetwork.github.io/opensky-api/rest.html .
- **Road congestion:** the UI accepts only a provider/backend-generated regional aggregate GeoJSON product. Google Routes traffic-aware polylines are route-scoped and can return NORMAL/SLOW/TRAFFIC_JAM categories; they are not a free nationwide raw traffic sensor. A backend must combine permitted route segments into coarse cells before publishing a summary: https://developers.google.com/maps/documentation/routes/traffic_on_polylines . Google Routes API billing and field-mask requirements apply.
- **Maritime activity density:** an authorized AIS provider may supply broad regional density. Global Fishing Watch's 4Wings API supports aggregated AIS-derived vessel-presence products; the documented vessel-presence dataset is an hourly point per vessel and may be available up to about 96 hours after the event, so it must not be labelled live vessel tracking. API access requires a token and its data license is non-commercial CC BY-NC 4.0; review the current terms before use: https://globalfishingwatch.org/our-apis/documentation .
- **Authorized drone activity:** only a drone fleet operator's authorized coarse summary endpoint is accepted. Remote ID is a local radio broadcast / local receiver capability in jurisdictions that implement it; it is not a global satellite-based drone tracking feed. FAA Remote ID overview: https://www.faa.gov/uas/getting_started/remote_id . Bangladesh-specific law, frequency allocation and data rights must be reviewed before deploying any receiver or fleet integration.
- **Aggregate GeoJSON contract:** HTTPS CORS endpoint; top-level `FeatureCollection`; `metadata.dataType="aggregated"`; `metadata.generatedAt` ISO timestamp; `metadata.source`; `metadata.spatialResolutionKm >= 20`; at most 300 Point features and 2 MB; each cell needs `count >= 10`, `radiusKm >= 10`, and `aggregationLevel` of `grid`, `district`, or `region`. Road cells additionally require provider-derived `congestionIndex` in [0,100]. The browser rejects feature IDs, nested individual identifiers and track/route/path properties. Keep API credentials on a backend; never embed provider secrets in this static app.
- **Rendering:** four overlays use the existing Cesium Earth, globe container, and camera. No second globe, synthetic traffic animation, individual ship/drone identity, or raw track is generated. Data that lacks a provider gateway remains `NOT CONFIGURED` or `FEED UNAVAILABLE`.


## v38 · Bangladesh marine safety layer
- The visible marine layer on Live 3D Earth is a broad Bay of Bengal marine-weather model overlay, not vessel traffic. It samples a 4×4 coarse set of sea-grid coordinates through Open-Meteo Marine API and displays returned wave height, wave direction, ocean-current speed/direction, and sea-surface temperature as broad 72 km ellipses on the same Cesium globe.
- API: https://marine-api.open-meteo.com/v1/marine ; required fields `current=wave_height,wave_direction,ocean_current_velocity,ocean_current_direction,sea_surface_temperature`, `cell_selection=sea`, metric units. The returned `current.time`, resolved model grid coordinates, response time and source attribution are shown.
- This is model output, not measured navigation data, not AIS, and not live ship tracking. Open-Meteo documentation says tides/current coastal accuracy is limited and not suitable for coastal navigation. Model sources have different update cadence (roughly 6–24 h for several global inputs). Attribution is displayed in the UI.
- Individual ship location, vessel identity, routes, or naval tracking are not enabled in this package.


## v38 corrective maritime display behavior (2026-11-06)
The v37 marine overlay was not visible because it only accepted a user-provided AIS aggregate GeoJSON endpoint. No endpoint or credentials had been configured, so `NOT CONFIGURED` was the correct result. v38 changes the visible card to `Bay of Bengal marine safety`, automatically requesting 16 broad sea-grid marine-model locations from Open-Meteo when the Earth Command page opens. The same Cesium globe receives broad 72 km model ellipses coloured by significant wave height; popups contain wave/current/SST model values and model-valid time. This is **not naval traffic** and no ship positions, identities or routes are shown. See the Open-Meteo marine API documentation for current fields, model coverage, update frequency and coastal accuracy limitations.


## v39 — five additional civil environmental panels (2026-11-06)
These five panels are separate cards within the existing `page-earthcommand` and use the existing Cesium `S.viewer`, camera and imagery stack. They do not create a second globe or replace existing layers. All map geometry is coarse regional context.

- **Flood & River Intelligence:** Open-Meteo Flood API (`https://flood-api.open-meteo.com/v1/flood`) with GloFAS v4 daily `river_discharge`, for five broad Bangladesh river reference regions. It is a model grid estimate, not a local water-level gauge, validated river cross-section or official warning. Compare with DDM AWARE and BWDB sources before operational decisions. GloFAS data and forecast dates must be shown.
- **Humanitarian Response Network:** OpenStreetMap Overpass (`https://overpass-api.de/api/interpreter`, with `https://overpass.kumi.systems/api/interpreter` fallback) queries public hospital, clinic, doctor and shelter tags. Raw site coordinates/names are discarded after aggregation into approximately 0.18-degree (~20 km) grid cells; only cells with at least two mapped records are drawn. OSM is volunteer-mapped and incomplete, and tags do not confirm current service/shelter availability. DDM AWARE warning and shelter pages remain the authoritative public links: https://rapid.ddm.gov.bd/home/weather/ and https://rapid.ddm.gov.bd/service/shelter_info . Emergency contacts are shortcuts only, not a dispatch integration.
- **Forest & Biodiversity Monitor:** GBIF Occurrence API (`https://api.gbif.org/v1/occurrence/search`) is queried for broad regional bounding boxes in the Sundarbans, Chittagong Hill Tracts, Sylhet and Madhupur. Only record totals and broad region markers are plotted; individual records/coordinates are not displayed. Occurrence counts mean published records, not animal population, abundance, current presence, or a forest-loss measurement. The optional NASA VIIRS true-colour layer is dated contextual imagery, not NDVI or automated deforestation detection.
- **Ocean & Coastal Intelligence:** reuses the v38 Open-Meteo Marine model cells and same Cesium viewer, now also showing `sea_level_height_msl` where the provider returns it. This is model output; it is not a coastal tide gauge, ship tracking or navigation-grade information.
- **Earth Observation Archive:** public Earth Search STAC endpoint (`https://earth-search.aws.element84.com/v1/search`) lists Sentinel-2 L2A and Landsat Collection 2 Level-2 scene metadata inside Bangladesh bounding box and user-selected date interval. A scene is not considered live. Scene acquisition time/cloud cover are metadata. NASA GIBS VIIRS SNPP corrected-reflectance imagery is a dated tile layer on the same globe; processing and tile availability vary by date.

External sources are requested from the user's browser and remain subject to CORS, provider availability, rate limits and network. Failure states are surfaced; no mock live data is generated. Public model/catalogue timestamps and local retrieval time must not be conflated.


## v41 visual stage provenance
The visual charts are generated only from the source-returned values already stored by the civil modules: Open-Meteo Flood API daily `river_discharge`; OpenStreetMap Overpass results after approximate 20 km aggregation; GBIF occurrence `/occurrence/search` count results; Open-Meteo Marine API returned wave-height cells; and preview links supplied by Earth Search STAC items. If a STAC item has no supported HTTPS thumbnail/preview asset, the gallery shows “Preview asset not supplied.” No bundled stock image is substituted.


## v42 Engineering Studio reference and data boundaries
- **BNBC 2020:** official Bangladesh Gazette link is included in the panel. The app does not compute or certify code compliance; use the applicable code edition and current local authority rules with a qualified design team.
- **RAJUK GIS / planning:** linked as a geographic/planning reference for areas under its jurisdiction. User-entered FAR, coverage and height limits are scenario inputs, not an automated approval result.
- **Copernicus DEM:** broad regional elevation/surface context; not a cadastral, topographic or construction survey and not a reliable basis for setting foundation levels.
- **SoilGrids:** global soil-property predictions at approximately 250 m scale with uncertainty; not site boreholes, laboratory tests, bearing capacity, settlement, pile capacity or liquefaction analysis.
- **OpenStreetMap:** optional public context only; incomplete volunteer-mapped content requires attribution and field verification.

The calculator uses explicit conceptual arithmetic: plot area from selected idealised geometry; footprint = plot area × target coverage; GFA = footprint × concept storeys; FAR = GFA ÷ plot area; concept height = storeys × floor-to-floor height. Finish quantities are gross surface allowances only. No structural/load/reinforcement calculation is present.


## Engineering Studio — reference links (checked 7 November 2026)
- Bangladesh National Building Code 2020 official gazette: Government Press, S.R.O. No. 55-Law/2020.
- RAJUK current rules portal lists the Dhaka Metropolitan Building Construction Regulations 2025; check local applicability and latest adopted notices.
- RAJUK Electronic Construction Permitting System FAQ: construction permit and project submission requirements, including additional review documentation for buildings above 10 floors within its jurisdiction.
- Copernicus DEM: regional elevation/surface context only; not a boundary or engineering survey.
- ISRIC SoilGrids: regional gridded soil predictions only; not borehole/laboratory results or design soil parameters.
- ThinkHazard: regional screening only; obtain site-specific hazard studies.
