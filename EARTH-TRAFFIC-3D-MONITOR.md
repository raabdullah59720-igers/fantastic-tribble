# Earth Traffic 3D Monitor

## What this panel shows

The panel combines two different data classes in one interactive globe:

1. **Satellites:** public CelesTrak General Perturbations (GP/OMM) orbital elements for the selected categories are propagated to the current display time using Satellite.js (SGP4/SDP4). The code converts propagated inertial position to Earth-fixed/geodetic latitude, longitude and altitude, then draws the object on the globe. Selected orbit lines are propagated ground tracks, not telemetry tracks. Element epoch and feed age are shown because propagation quality degrades as orbital elements age.
2. **Aircraft:** the optional OpenSky `/states/all` feed supplies aircraft state vectors for the selected geographic bounding box. The panel plots the returned position and source timestamps. It does not invent positions between snapshots or interpolate unreported aircraft into “live” data.

## Accuracy and limitations

- SGP4/SDP4 is a standard propagation model for GP/TLE-style elements. Position accuracy depends on element age, object type, orbital maneuvers, propagation errors and the time standard. The marker is a model-propagated position, **not a direct satellite telemetry fix**.
- Catalogue epoch age is displayed; records missing an epoch or older than 72 hours are flagged for review. “Live” means propagated to the current clock from a public element set, not continuously measured by the satellite.
- Aircraft positions are only as fresh as the state-vector snapshot. The panel displays source time and stale/unavailable status. Public OpenSky access is quota-limited and may be unavailable due to CORS, network policy or provider limits.
- OpenSky anonymous state-vector data has a 10-second time resolution and the `/states/all` endpoint uses API credits. The code estimates credit cost from bounding-box area, disables automatic polling for global scope, throttles repeat calls, and keeps aircraft refresh user-triggered by default. See the official REST documentation before configuring higher-volume use.
- Three.js renders the globe and markers. The orbit altitude radius is intentionally compressed for visibility; numbers in the detail pane use the propagated altitude in kilometres. This visual scale is labelled and is not a physical scale model.
- The default map fallback is a schematic 2D canvas. It may help show marker geography when WebGL or external textures fail, but it is not a true Earth imagery layer. The Three.js Earth texture loads from an external example-texture URL and requires internet access.
- Markers represent only loaded catalog objects with valid propagation, or aircraft states that included valid coordinates. Feed failure does not trigger dummy live markers.
- Browser location is only requested after the user clicks **Use device location**. The app builds a bounded aircraft query around the returned coordinates; it does not send location during satellite propagation.

## Algorithms used

- **Satellite state:** CelesTrak OMM/GP JSON -> `satellite.js` `json2satrec` -> `propagate(date)` (SGP4/SDP4) -> `gstime(date)` -> `eciToGeodetic` -> latitude/longitude/altitude.
- **Orbit visualization:** sample the same propagated orbit at multiple future/past timestamps and transform points to Earth-fixed coordinates for the conceptual ground-track line. Track is periodically rebuilt from the orbital elements.
- **Aircraft:** fetch latest OpenSky state vector snapshot -> validate latitude/longitude/ranges and null values -> apply optional airborne filter -> draw actual returned state coordinates -> mark source timestamp age.
- **Rendering:** Three.js/WebGL globe, atmosphere, cloud layer, graticule, stars, satellite markers and aircraft markers; a simplified canvas renderer is used if WebGL is unavailable.
- **Refresh policy:** public element groups are cached locally for up to two hours. Aircraft snapshots are manual by default; optional regional polling is every 20 minutes. Global polling is disabled due to provider credit cost.

## Run and use

1. Upload all project files and `assets/` to the repository root.
2. Publish via GitHub Pages and open its HTTPS URL, or use the included Windows launcher for a local-only app.
3. Open **Space & Atmosphere -> Earth Traffic 3D Monitor**.
4. Click **Load / update orbital data**. Choose the satellite catalogue categories to display.
5. Choose a bounded aircraft region and click **Refresh aircraft feed**. Global queries cost more credits and may be rate-limited.
6. Optional: click **Use device location** to request browser permission, then refresh the aircraft feed.
7. Inspect the source/epoch age and the selected object's details before interpreting a marker.

## Data sources and documentation

- CelesTrak current GP elements: https://celestrak.org/NORAD/elements/
- CelesTrak GP JSON/OMM formats: https://celestrak.org/NORAD/documentation/gp-data-formats.php
- Satellite.js propagation library: https://github.com/shashwatak/satellite-js
- OpenSky REST API, state vectors and credit/rate limits: https://openskynetwork.github.io/opensky-api/rest.html
- Three.js WebGL renderer: https://threejs.org/docs/pages/WebGLRenderer.html

## Test

Run `node tests/test-earth-traffic-monitor.cjs` and `python run-static-qa.py`. The tests include coordinate-transform checks, mocked propagation, malformed/null state-vector filtering, stale-data diagnostics, PWA asset integration and local-reference validation. They do not verify current public API reachability, satellite observation truth against independent sensors, or a deployed website.
