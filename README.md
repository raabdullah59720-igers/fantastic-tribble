# TERRAVEX APEX · Bangladesh Satellite & Science Upgrade

**Static deployment:** GitHub Pages, repository root  
**Deliverable file count:** 29 (including PWA app-shell files, advanced workbench modules, docs, licence, and compressed visual assets) (including docs, license, `.nojekyll`, two live-location files, and four compressed visual assets)  
**Intent:** additive dashboard update based on the previously supplied TERRAVEX APEX Earth-science package and two lightning research PDFs.

## Install
1. Back up your current repository.
2. Download and extract `TERRAVEX-APEX-FUTURE-WORKBENCH-UPGRADE.zip`.
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

## Live location panel

The **Live Location & Position Monitor** uses the browser Geolocation API only after the user selects **Locate once** or **Start live tracking** and grants permission. It displays latitude, longitude, horizontal accuracy, timestamp, and optional altitude/speed/heading. Position is held in page memory, not sent to this app's server, and not persisted. The optional “Also overlay my position in the Observatory map” control shares the fix only inside this page. “Use for weather model” sends coordinates to Open-Meteo on an explicit button press. OpenStreetMap tiles load the map viewport and are subject to the provider's tile policy and privacy terms.

Geolocation requires a secure context (HTTPS or localhost) and browser permission. Live tracking stops when the user presses Stop; browsers may throttle updates when a tab is backgrounded. Reference: [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). The map uses [OpenStreetMap standard tiles](https://operations.osmfoundation.org/policies/tiles/) with attribution; availability is best effort and provider policy applies.


## Advanced workbench upgrade (2026-10-23)
This update is additive: previous modules remain in the package and five advanced pages have been added.

- **Air Quality Intelligence:** retrieves Open-Meteo/CAMS model PM2.5, PM10, US AQI, European AQI, ozone and NO₂ for a Bangladesh reference location; optional browser-location lookup requests permission only after clicking and then sends the coordinates to Open-Meteo. Values are model outputs, not local regulatory monitors.
- **NASA Natural Events:** fetches open curated events through NASA EONET v3; draws a schematic equirectangular event plot. It is not an official local emergency-warning feed.
- **GNSS Geodesy Workbench:** great-circle displacement, azimuth, velocity and propagated per-epoch coordinate uncertainty calculator. Values are computed from entered coordinates, not a live GNSS station network.
- **Hybrid Energy Planner:** editable PV, wind, hydraulic, battery, load, cost and emissions assumptions; calculates daily energy, load coverage, storage autonomy, annual useful energy, indicative capex and simple payback. It is a first-order scenario tool, not a bankable PVWatts/SAM or site feasibility report.
- **Source Health & Offline System:** on-demand endpoint reachability/latency probes, app-install prompt and same-origin offline application-shell service worker.
- **Command Palette:** `Ctrl+K` / `⌘K` to find and jump to any panel.

### PWA / offline behaviour
Open the site through HTTPS (GitHub Pages qualifies), load it once online, then use the browser's Install/Add to Home Screen menu if supported. The service worker caches the local application shell and visual assets only; remote model APIs, NASA imagery, public maps and alert feeds remain network-dependent. It does not cache exact location or live hazard data intentionally. Update `sw.js` cache name when deliberately changing cache policy.

### New sources
- Open-Meteo Air Quality API: https://open-meteo.com/en/docs/air-quality-api (CAMS model forecast; coarse global model grid, not a point monitor).
- NASA EONET v3: https://eonet.gsfc.nasa.gov/docs/v3 (open curated natural-event catalogue; not authoritative emergency dispatch).
- NREL PVWatts model reference: https://developer.nlr.gov/docs/solar/pvwatts/ (reference for a more detailed PV production model; this project uses its own transparent first-order formula and does not call the NREL API).
- USGS earthquake feeds: https://earthquake.usgs.gov/earthquakes/feed/v1.0/

### New limitations
The on-demand source probe confirms reachability only, not scientific accuracy or completeness. Cross-origin requests may fail because of network restrictions or CORS even when a source is otherwise operational. The EONET event plot uses simplified schematic continent shapes. Geodesy outputs require externally processed GNSS epoch data and suitable reference-frame/uncertainty handling for scientific interpretation. Energy price and emissions values are editable scenario assumptions, not official Bangladesh tariffs or verified project costs.


### Advanced alert integration
- The Air Quality page has an optional, default-off model AQI threshold rule that can append an advisory to the existing Alert Center. Its values are Open-Meteo/CAMS model outputs, not station alerts. Browser notification delivery is used only if the existing browser-notification permission has already been granted.
- The NASA EONET panel can optionally log *newly appearing global catalogue records* after a baseline fetch. It does not replay the initial catalogue and never labels global EONET records as local Bangladesh warnings.


## Hazard Intelligence Extension (Oct 2026)

New panels: **Storm & Lightning Watch**, **Earthquake Rapid Alerts**, and **Bay of Bengal Ocean & Tsunami Observatory**. The storm panel combines a date-stamped NASA GIBS MODIS imagery layer with Open-Meteo forecast fields (relative humidity, dew point, cloud cover, CAPE, thunderstorm probability where returned, lightning potential where returned, integrated water vapour, gusts). The forecast alert watcher is user-opt-in and checks the model every 15 minutes while the app is open. It is not satellite-detected lightning or a calibrated local short-horizon predictor. NOAA GOES-R GLM's operational view covers the Americas and adjacent oceans, not Bangladesh.

The earthquake panel polls the USGS all-hour GeoJSON feed every 60 seconds only after the user starts the watcher. Alert delivery occurs after a record appears in that provider feed; international catalog reporting can be delayed (USGS reports an average around 20 minutes for earthquakes outside the U.S. in sparse networks), so this is **not** an earthquake early-warning service. The P/S-wave widget is a theoretical teaching model, not the JMA system. JMA's operational EEW depends on dense Japanese seismic infrastructure and cannot be presented as a Bangladesh service.

The ocean panel queries Open-Meteo Marine for modeled wave height/period/direction, sea-level height including tides relative to global mean sea level, sea-surface temperature, and modeled current data when available. The 3D-style water surface is a live animation scaled by those model values, not 3D sonar or bathymetry telemetry. GEBCO WMS provides static gridded bathymetry/elevation context. A broad USGS earthquake filter only flags events for official tsunami-bulletin review; it does not predict tsunami generation or arrival and cannot declare a coast safe. Official references: [INCOIS Tsunami Early Warning System](https://tsunami.incois.gov.in/TEWS/searlywarnings.jsp), [Bangladesh DDM AWARE](https://rapid.ddm.gov.bd/home/weather/), and [JMA EEW method](https://www.jma.go.jp/jma/en/Activities/eew2.html).

### Hazard extension files
- `hazard-intelligence.js` - storm model advisory, NASA GIBS/Leaflet overlay, USGS rapid catalog watcher, P/S arrival separation demonstration, marine-model request, GEBCO WMS and tsunami source-event screening.
- `hazard-intelligence.css` - responsive styling.

All three new panels use the shared local alert center through the `terravex:advanced-alert` event. Notifications require explicit browser permission. Pollers operate only after users enable them, and only while the page is open/visible. A degraded or missing source is shown as unknown, never as all-clear.


## Storm, Seismic & Bay of Bengal Intelligence (2026-10-24)
This extension adds three separate operational-awareness panels while retaining the existing workbench, Bangladesh observatory, live-location, energy and research modules.

- **Storm & Lightning Watch:** Open-Meteo forecast/model fields for relative humidity, dew-point depression, cloud, CAPE, thunderstorm probability (if returned), lightning potential and integrated water vapour. The alert watcher is opt-in and refreshes every 15 minutes while the page is open and visible. NASA GIBS MODIS True Color is dated satellite imagery context, not a live lightning detection feed. `lightning_potential` is displayed in its model unit (J/kg), not as a probability. NOAA GOES-R GLM coverage does not include Bangladesh.
- **Earthquake Rapid Alerts:** USGS `all_hour.geojson` published-event watcher, optional browser notifications, regional/magnitude filters and a teaching-only P/S arrival interval. Browser alerts arrive only after the public feed has updated. They are not JMA-style operational EEW; Japan's EEW is based on dense seismic instrumentation, and even it may not arrive before shaking close to the source.
- **Bay of Bengal Ocean & Tsunami Observatory:** Open-Meteo Marine current/hourly outputs for significant wave height, period, direction, model sea-level height (including tide effects), sea-surface temperature and ocean currents; animated water surface is a visualisation scaled by model output. GEBCO WMS is static gridded seafloor/bathymetry context, not live sonar. A USGS earthquake filter identifies events for a human to review official tsunami bulletins; it does not predict tsunami generation/arrival and never displays a “safe” verdict.

### Important data and warning limits
Open-Meteo Marine says coastal sea-level accuracy is limited and the data are not suitable for coastal navigation: https://open-meteo.com/en/docs/marine-weather-api. USGS earthquake GeoJSON feeds cache short-period products and report delays vary: https://www.usgs.gov/faqs/how-quickly-earthquake-information-posted-usgs-website-and-sent-out-earthquake-notification. Japanese EEW timing/limitations: https://www.jma.go.jp/jma/en/Activities/eew3.html. For tsunami bulletins, check the [INCOIS Tsunami Early Warning System](https://tsunami.incois.gov.in/TEWS/searlywarnings.jsp) and [Bangladesh DDM AWARE](https://rapid.ddm.gov.bd/home/weather/). The browser's alerts are optional, require permission, and run only while the app is open; they are not a background push service.

The three alerting pathways are source-specific: weather-model threshold advisory, newly published earthquake record, and a conservative earthquake-source screen that tells the user to inspect official tsunami bulletins. Do not combine these into a claim of guaranteed pre-storm or tsunami prediction.


### Satellite Pass & Russian Orbital Watch (2026-10-24)
- Uses public CelesTrak GP OMM JSON groups: `stations`, `glonass-ops`, and `weather` (weather group entries are filtered to Russian-labelled mission names such as METEOR/RESURS/KANOPUS/ELEKTRO-L/ARKTIKA-M).
- Uses pinned Satellite.js 6.0.2 from jsDelivr for SGP4/SDP4 orbit propagation. If the CDN is unavailable, this panel reports the dependency as unavailable and does not fabricate satellite positions.
- Uses browser geolocation only after the user clicks “Use device location” and grants permission. Coordinates stay in page memory and are not posted by this panel. It can also consume the current page's user-authorized `terravex:live-location` event.
- Calculates azimuth/elevation/range, sub-satellite coordinates, and approximate passes over a 3/6/12/24-hour horizon. Pass crossing estimates use 60-second steps with interpolation; results are only as current/accurate as orbital element epochs and omit local obstructions, cloud, sunlight and visual visibility.
- CelesTrak GP data is cached for two hours per group to respect its usage policy.
- This is orbital tracking only. It does not connect to satellite radio, obtain restricted telemetry, access a payload, or guarantee imagery/data access from a Russian satellite or station. GLONASS is a Russian navigation constellation; weather-group “Russian-labelled” classification is a name filter and not independent operator verification.
- Satellite.js is MIT-licensed and loaded from a pinned CDN URL. Internet access is needed for the dependency and current public orbital elements.


## Secure Satellite Relay & VPN Health panel (Oct 2026)

New navigation panel: **Secure Satellite & VPN** (`page-securelink`), styled by `secure-satellite-vpn.css` and implemented in `secure-satellite-vpn.js`.

- Separates browser network status, satellite-provider status, VPN tunnel status, and health-endpoint reachability. It does not falsely show a satellite/VPN link as active.
- Includes an explicit public HTTPS baseline probe to Open-Meteo, and an optional user-supplied HTTPS health endpoint (requires user authorization and compatible CORS). Endpoint probes send no cookies or authorization headers, deny redirects, require HTTPS on port 443, reject URL credentials/query/hash and literal IP/local hostnames, use an 8-second timeout, and cap JSON health responses at 8 KiB.
- Health status is considered verified only when the endpoint returns HTTP success and a JSON `status` value of `ok`, `healthy`, `up`, or `ready`. Any CORS/network/TLS/timeout problem is reported as inconclusive, not automatically as service-down.
- Optional 60-second endpoint monitoring begins only after the user presses Start; it runs while the page is open, and is stopped when requested or on page unload. Optional browser failure notifications are off by default and only notify after an endpoint that previously returned a healthy response fails a later check. Browser `navigator.onLine` is only a coarse signal. The VPN checkbox is explicitly self-reported and does not verify or control the OS tunnel.
- Local JSON report export omits the endpoint URL, response body, coordinates and credentials.
- Provider links point to RSCC's commercial communication services and BTRC guidance. A subscription, compatible approved satellite terminal, service eligibility, local regulatory compliance and actual internet access must be arranged outside this static app. Public orbital elements do not give direct access to a spacecraft's communications payload.

### Critical privacy note
GitHub Pages is static and published websites are public even when the source repository is private on plans that permit that configuration. Client-side hiding or passwords cannot make this app private. For confidential monitoring, put the whole application behind server-side authentication/identity-aware access or deploy a private application. See `SECURITY-DEPLOYMENT.md` before sharing or publishing sensitive information.

## Desktop PWA + native VPN control (new)

- A dedicated **VPN Control & Desktop Install** page is included. The app can request ON/OFF of a VPN client already configured on the local desktop only when the local bridge is running and paired.
- Run `Start-VPN-Bridge-Windows.bat` on your Windows desktop. It uses Python 3.10+ and a local `vpn-bridge-config.json`. Review the allowlisted origin and choose `tailscale` or the already-installed WireGuard tunnel backend.
- The bridge binds to `127.0.0.1:8765`, validates the exact browser Origin and Host, uses a random per-run bearer token, and only accepts fixed `status`, `on`, and `off` operations. It has no arbitrary shell-command endpoint.
- The pairing token is printed to the local console and is only held in the current app page's memory. It is not saved in localStorage/cookies. Stop the bridge with Ctrl+C.
- Install as a desktop PWA using the **Source Health & Offline System → Install app** button or the Chrome/Edge browser menu. Serve via GitHub Pages HTTPS. Chromium-sized PNG icons (192 and 512 px) and service-worker shell caching are included.
- A PWA cannot itself control OS-level VPN software. Real control requires the separate helper and a preconfigured client; no satellite service, VPN account/server, private key, or subscription is provided.
- Read `DESKTOP-INSTALL-AND-VPN-GUIDE.md` before running the bridge. `.gitignore` excludes the actual local config file from Git.
