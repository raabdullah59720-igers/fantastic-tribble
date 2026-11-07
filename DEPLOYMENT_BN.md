# GitHub-এ আপলোড নির্দেশনা (বাংলা)

এই প্যাকেজটি আগের IGERS root `index.html` overwrite করে না। এটি নতুন `earth-command-center/` path হিসেবে যুক্ত হবে।

1. ZIP extract করো।
2. Extract করা `earth-command-center` folder-টি তোমার GitHub repository-র root-এ upload করো; folder-এর নাম পরিবর্তন কোরো না।
3. Commit changes করে Pages build/deploy শেষ হলে এই path খুলবে: `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/earth-command-center/`
4. Pages যদি `/docs` directory থেকে deploy হয়, তাহলে folder-টি `/docs/earth-command-center/`-এ রাখবে।
5. পুরোনো homepage থেকে app-এ যেতে চাইলে navigation-এ `<a href="./earth-command-center/">Open EarthCommand</a>` link যোগ করা যায়।

## কী কী কাজ করবে
- Interactive 3D Earth globe; Earth texture ও event markers;
- USGS-এর past-24-hour earthquake GeoJSON feed;
- Bangladesh-এর নির্বাচিত শহরের Open-Meteo weather-model data;
- NASA GIBS satellite imagery tile/WMS request;
- Flood, thunderstorm, earthquake ও landslide planning scenarios;
- Local incident board এবং JSON export;
- IGERS road kinetic-energy ও micro-hydro estimate calculators;
- Offline/network failure হলে status labels দিয়ে fallback state দেখানো।

## সীমাবদ্ধতা
Weather feed numerical model; সরাসরি weather-station measurement নয়। Convective index কোনো verified lightning probability নয়। NASA imagery acquisition/processing-এর কারণে delayed হতে পারে। EarthCommand কোনো সরকারি warning, evacuation instruction, emergency dispatch বা physical control trigger করে না।

## নিজের ডিভাইসের অবস্থান নির্ণয় (v33)

- GitHub Pages-এর HTTPS URL থেকে Terravex খুলুন এবং `?page=location` প্যানেল নির্বাচন করুন।
- `Locate once` একবারের অবস্থান নেবে; `Start live tracking` চাপলে browser permission নিয়ে অবস্থানের watch শুরু হবে। ব্রাউজার যে horizontal accuracy radius দেয়, সেটিই metre-এ দেখানো হয়; এটিকে নিশ্চয়তাপ্রাপ্ত survey accuracy ভাববেন না।
- `Stop tracking` যেকোনো সময় watch বন্ধ করে। অন্য প্যানেলে গেলে, page reload/close হলে watch স্বয়ংক্রিয়ভাবে বন্ধ হয়।
- Browser API GNSS satellite-এর নাম, satellite count বা receiver lock status জানায় না। ফোনের GNSS, Wi-Fi/cellular assistance ও browser scheduler অনুযায়ী fix এবং update cadence বদলাবে। প্রতি সেকেন্ডে satellite থেকে নতুন signal/telemetry পাওয়া হচ্ছে এমন দাবি নয়।
- নিজের অবস্থান Observatory map-এ দেখাতে checkbox opt-in করুন। এটি একই পৃষ্ঠার local event; backend-এ upload নয়। আবহাওয়ার জন্য location পাঠানো আলাদা button action এবং তাতে external weather provider coordinates পায়।


### v34 map / satellite imagery check
- Confirm the `location` and `radiologicalsafety` panels open after navigation; their maps initialize only after the panel becomes visible.
- In Location, choose `NASA MODIS true-colour` and select a UTC date. Wait for `TILES RECEIVED`; `TILE ERROR` means that provider did not return tiles in the current browser/network.
- The JMA Himawari Southeast Asia frame is a public RGB weather imagery page. If its embedded view does not show the image and observation timestamp, open the official JMA viewer link beside it.
- On Radiological Safety, click `Load NASA true-colour`; district boundaries and raster imagery are separate layers. `GIS SOURCE UNAVAILABLE`, `TILE ERROR`, or `EMBED NOT CONFIRMED` are real degraded states, not successful connection indicators.
- Browser/device and deployed GitHub Pages checks are still required; external feeds are not included in the offline app shell.


## v35 update — 3D launch and Russian public weather imagery
- Added visible 3D launch controls in the overview and Bangladesh Radiological Safety panel. Direct route: `?page=radiologicalsafety`.
- CesiumJS globe now starts independently of DGHS district GIS success. If the primary Cesium CDN is unavailable, the panel attempts a pinned jsDelivr CesiumJS fallback; imagery tiles try Esri first and OpenStreetMap second.
- Added a user-launched public weather imagery view of the official Russian Elektro-L meteorological portal (`https://electro.ntsomz.ru/en/`) with a direct-open fallback. Its page is titled “Earth in the last twenty-four hours”; the page snapshot inspected on 6 November 2026 displayed entries dated 25–26 October 2026, so freshness is not guaranteed. Verify the newest capture timestamp. This safety panel omits high-resolution EO scene ordering, tasking, target imaging and spacecraft control.
- This is public weather/Earth-observation imagery access, not a direct satellite command/uplink, not a continuous video stream, and not target or person surveillance. Cross-origin iframe load does not prove image pixels or capture time; verify inside the official viewer.
- Service-worker cache: `terravex-apex-shell-v35`.


## v36 deployment note
- Upload all 99 root files, replacing the previous version, and commit. `sw.js` now uses `terravex-apex-shell-v36`; refresh the HTTPS GitHub Pages app with `Ctrl+Shift+R`, then use Source Health & Offline System → Refresh cached app shell if needed.
- The Safety Centre direct route is `?page=radiologicalsafety`. Use the visible **Launch 3D + Russian Weather View** button. A successful basemap tile probe is shown separately from the 3D engine state.
- Russian weather imagery opens the public Elektro-L provider page. Cross-origin page load does not confirm image pixels or a current capture; check the provider's displayed timestamp.


## v37 — Live 3D Earth mobility overlays

- The Live 3D Earth page now includes Air Activity Density, Road Congestion, Maritime Activity Density, and Authorized Drone Activity toggles within the same existing globe and camera.
- Air density is derived from the existing, manually requested OpenSky Bangladesh snapshot and shown only as 1-degree aggregate cells with at least 10 observations per cell.
- Road, maritime and drone overlays require an authorized HTTPS/CORS aggregate GeoJSON endpoint. They are intentionally not marked connected until a provider response passes schema, spatial-resolution, minimum-count and timestamp checks.
- Do not paste provider secrets into the static page. Configure a read-only backend gateway and keep tokens/keys server-side. Global Fishing Watch AIS vessel-presence data may be delayed by up to approximately 96 hours and is non-commercial CC BY-NC 4.0; it is not a live vessel-tracking stream. Google traffic-aware Routes API is route-scoped and billed; it is not blanket nationwide traffic surveillance.
- Upload the same 99 files to repository root. PWA cache is now `terravex-apex-shell-v38`; hard-refresh the HTTPS GitHub Pages deployment, then refresh the app shell in Source Health & Offline.

## v37 — same-globe mobility layers

1. Extract the ZIP and upload all 99 files to the repository root, overwriting prior versions. Do not upload the ZIP as one file.
2. Commit and wait for GitHub Pages to publish. Hard-refresh the HTTPS Pages origin (`Ctrl+Shift+R`). For installed PWA, open Source Health & Offline and refresh the app shell; service-worker cache is `terravex-apex-shell-v38`.
3. Open `?page=earthcommand`. The four activity toggles are inside the existing Live 3D Earth card; camera and globe design are unchanged.
4. For air density, click **Refresh air density**. It uses the existing Bangladesh OpenSky snapshot and only paints 1-degree cells with at least 10 observations.
5. Road, maritime and authorized drone data remain disconnected until an approved HTTPS/CORS backend aggregate endpoint is provided. Configure only aggregate GeoJSON endpoints under **Configure read-only aggregate providers**. Do not place API keys in the browser. No endpoint is automatically invented.
6. Review each source timestamp and stale status. A 1 Hz rendering loop does not imply 1 Hz source data.

The new activity layer is for civilian, regional aggregate awareness only. It does not add individual vessel/drone tracking, raw target tracks or targeting controls. Public API availability and provider terms are not guaranteed by GitHub Pages.


## v38 — Marine layer visibility correction
The former AIS aggregate field had no configured provider, so the marine card remained blank. The current `Bay of Bengal marine safety` card auto-loads Open-Meteo marine model conditions on opening `?page=earthcommand`; use `Load marine safety layer` to retry. It plots broad wave/current model cells on the same globe, not vessels. The shell cache is `terravex-apex-shell-v38`.


## v39 deployment note
Upload/overwrite all 99 files in the repository root. Do not upload the ZIP as a single file and do not place `index.html` inside an extra folder. Deploy GitHub Pages from the same root. Then open the HTTPS site, hard-refresh (`Ctrl+Shift+R`), open **Source Health & Offline System**, and select **Refresh cached app shell** if an installed PWA still shows the prior version. The current cache is `terravex-apex-shell-v39`.

Use `?page=earthcommand` to open the existing 3D Earth page. The five new cards are beneath the existing globe and reuse the same camera. External endpoints require internet and may need retries. A successful HTTP request is not proof of scientific correctness or official operational status. See `DATA_SOURCES.md` for caveats.


## v40: পাঁচটি Civil 3D Panel খোলার নতুন shortcut
Live 3D Earth পেজের শিরোনামের ঠিক নিচে পাঁচটি quick-jump button আছে। Top bar-এর `Civil 3D` এবং Overview-এর `Open Civil 3D Panels` button দিয়েও খোলা যাবে। Direct URL: `?page=earthcommand&panel=all` অথবা `panel=flood`, `humanitarian`, `forest`, `ocean`, `archive`। এগুলো একই Live 3D Earth পেজের ভিতরে সংশ্লিষ্ট panel-এ scroll করবে; আলাদা globe তৈরি করে না। GitHub upload-এর পরে HTTPS root-এ `Ctrl+Shift+R`, তারপর installed PWA থাকলে Source Health & Offline থেকে cached shell refresh করতে হবে।


## v41: High-graphics Civil 3D visual upgrade
এই সংস্করণে আগের 3D globe/camera অক্ষত রেখে পাঁচটি Civil panel-এ live-source-driven chart/scene-preview stage যোগ হয়েছে। Flood chart GloFAS-এর source-provided daily series থেকে, Humanitarian visual OSM-এর ২০ কিমি-প্রায় aggregate cell থেকে, Forest chart GBIF-এর occurrence-record count থেকে, Ocean chart Open-Meteo-এর wave model cells থেকে, এবং Archive gallery STAC item-এর source-provided preview asset থাকলে তা দেখায়। কোনো source unavailable থাকলে empty/offline state দেখাবে। 3D quality selector: Balanced / High / Ultra; device capability অনুযায়ী resolution scale cap করা হয়। Humanitarian data Earth Command-এ প্রবেশের সময় auto-request হয়। PWA cache v41।


## v43 Engineering Studio deployment
1. Extract the v42 ZIP. Upload/overwrite all 99 extracted files at the same repository root used by the existing TERRAVEX app; do not upload the ZIP as a single repository file or nest the files in a new folder.
2. Confirm `index.html` and `manifest.webmanifest` are at that root, then commit and publish GitHub Pages.
3. Hard-refresh the HTTPS Pages URL (`Ctrl+Shift+R`). If running the installed PWA, open Source Health & Offline and refresh the cached app shell (v42).
4. Open `?page=engineering`. You should see `TERRAVEX Engineering Studio` in the sidebar, an `Engineering` topbar shortcut and an Overview launch card.
5. Export DXF/CSV/JSON only as conceptual planning artifacts. DXF has plot boundary, schematic footprint, building massing shell and level outlines in metres; it is not a construction drawing.


### v42: shared 3D Earth concept plot
Engineering Studio-তে সাইটের latitude/longitude দিন, scenario calculate করুন, তারপর `Plot concept on shared 3D Earth` চাপুন। এটি existing Cesium Earth viewer-এ schematic parcel outline, extruded building massing ও floor-level outline যোগ করে। `Clear Earth concept` শুধু Engineering Studio-এর entity সরায়; অন্য map/layer অক্ষত থাকে। Direct URL: `?page=engineering`। Coordinates survey-verified না হলে plot-কে কেবল concept হিসেবে ধরতে হবে।


### v43 Engineering Studio report/export fix
After deploying v43, open `?page=engineering`. The Engineering Design & Safety Report monitor is located directly below the page status strip. Use Calculate & Render to refresh; DXF, SVG, HTML report, CSV and JSON downloads are available in the report toolbar. The HTML report can be printed or saved as PDF via the browser. Refresh the installed PWA shell from Source Health & Offline after deployment. Outputs are preliminary civilian concept geometry and non-structural finish allowances only, not construction documents.


### v43 Engineering Studio report and download fix
Deploy all 99 files at the repository root, then open `?page=engineering`. The Engineering Design & Safety Report appears directly below the page status strip. It includes live-updated concept metrics, safety/approval statuses, finish allowances, assumptions and unit conversions. Use the download toolbar for DXF, SVG, HTML report, CSV and JSON. The HTML report can be printed or saved as PDF from the browser. If using an installed PWA, open Source Health & Offline, refresh the app shell (v43), then reload.

The report is a civilian concept-stage feasibility document only. Planning-limit comparisons are based on values entered by the user; missing limits are marked NOT ASSESSED. Survey, geology, structural wind/seismic, fire/life safety, MEP and authority review are not certified by the app. Finish allowances are not a full BOQ.


## v44: দুই-input auto-design ও 2D CAD export
Engineering Studio-তে ব্যবহারকারী শুধু storey count এবং civilian building type নির্বাচন করবেন। Terravex typology heuristic দিয়ে assumed rectangular parcel, floor plate, coverage, height, GFA ও functional zoning তৈরি করবে। সব assumption report-এ লেখা থাকবে; এটি surveyed plot বা authority-approved design নয়।

Satellite context চাইলে Live 3D Earth-এ project region-এ pan/zoom করে Engineering Studio-তে ফিরে **Use current 3D Earth view centre** চাপুন। এটি ওই camera-centre-কে আনুমানিক location হিসেবে নিয়ে public Sentinel-2 L2A catalogue metadata query করে। Catalogue unavailable হলে UI-তে তা স্পষ্ট দেখাবে। Satellite image দিয়ে cadastral boundary, soil bearing capacity, groundwater বা foundation condition নির্ধারণ করা হবে না।

2D preview canvas এবং **Download 2D floor plan DXF** ব্যবহার করুন। DXF AC1015/R2000, metre units ও পৃথক layer-সহ তৈরি; parser verification সম্পন্ন। এটি schematic typical-floor functional zoning, room-by-room construction plan নয়। 3D massing DXF, SVG, CSV finish allowance, JSON এবং printable HTML report-ও রয়েছে।

GitHub Pages-এ সব ৯৯টি ফাইল repository root-এ overwrite করে deploy করুন। Direct route: `?page=engineering`। Installed PWA-তে Source Health & Offline থেকে v44 app-shell refresh করে reload করুন।
