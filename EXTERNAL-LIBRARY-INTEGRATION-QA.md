# TERRAVEX APEX v54: External Engine Library Integration QA

## Release scope

A root-level overlay for the v53 app. It changes 13 application files and does not replace the full app. `index.html`, the shared loader, map/globe/satellite adapters and service-worker assets are updated together.

## Version and integration choices

| Engine | Primary version | Primary URL strategy | Fallback |
|---|---:|---|---|
| Leaflet | 1.9.4 | jsDelivr classic global `L` | unpkg 1.9.4 |
| CesiumJS | 1.147.0 | CDNJS package root, `Cesium.js` + `Widgets/widgets.css` | npm CDN / unpkg CesiumJS 1.146.0 |
| satellite.js | 7.1.0 | jsDelivr ESM `+esm` | esm.sh 7.1.0, then UMD 6.0.2 |
| Three.js | 0.187.0 | jsDelivr ESM `build/three.module.js` | esm.sh 0.187.0, then UMD r160 |

Leaflet 1.9.4 is retained because the current app uses the Leaflet 1.x global `L` API and the vendor's current install guidance still recommends 1.9.4 for projects relying on 1.x plugins; 2.0 is beta. CesiumJS 1.147.0 was released in November 2026. CesiumJS 1.147 is served from the CDNJS root path, not the npm `Build/Cesium/` layout. The 1.146 compatibility fallback reports its actual version in the diagnostics card. satellite.js 7.1.0 provides SGP4/SDP4 propagation and coordinate transforms. Three.js 0.187.0 is the current npm package revision, delivered as ESM; an older global UMD build is retained only as compatibility fallback.

## Browser test results

Chromium 144.0.7559.96 was used with the actual TERRAVEX `index.html`, local JS/CSS assets and the real application loader. External CDN responses were intercepted and replaced with deterministic API-shaped fixtures because the execution environment cannot resolve external CDN hostnames.

| Test | Result |
|---|---|
| Full app index + local scripts and styles | PASS |
| Shared engine loader registers and executes | PASS |
| Primary URL path for all four engine APIs | 4/4 READY |
| Duplicate requests after READY when calling all loaders again | NONE |
| CDN fallback path (Leaflet/ unpkg, Cesium 1.146 fallback, satellite/Three esm.sh) | PASS |
| Legacy UMD fallback (satellite.js 6.0.2, Three.js r160) | PASS |
| Fully blocked Leaflet URLs produce UNAVAILABLE, then recover on retry | PASS |
| Browser page runtime exceptions during full app probe | 0 |
| Browser console errors from library fixtures | 0 |

The full-app test did show resource failures for NASA GIBS, USGS and Open-Meteo requests because all non-library public endpoints were deliberately blocked in the hermetic test. These are expected test-network failures, not library-loader errors. The app reports the associated feeds as unavailable/degraded instead of generating synthetic live values.

## Network limitation and interpretation

Direct `curl` checks from this environment could not resolve `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `unpkg.com` or `esm.sh`. Therefore this QA does **not** claim that the public CDNs were fetched live from this workspace, nor that live map tiles/data-provider services were online. The browser tests prove the loader's API-contract, lazy load, fallback, deduplication, error-state and retry behavior using intercepted responses. After GitHub Pages deployment, the user's browser should run **Source Health & PWA → Check external engine libraries** on the actual internet connection to verify live CDN reachability.

## Engineering caution

A library showing READY means the JavaScript API is loaded. It is not a claim that remote satellite imagery, tiles, orbital-element feeds, an ion account, direct spacecraft telemetry, or a working WebGL context are available. Three.js and CesiumJS still depend on browser WebGL capability. The diagnostics card reports WebGL separately.
