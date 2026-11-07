# GitHub-এ TERRAVEX APEX v50 আপলোড নির্দেশনা

এই release-এ **ঠিক ৯৯টি root-level file** আছে। v50 DXF-এ plan/elevation-এর পৃথক fit scale, schematic room-cell footprint clipping এবং input না থাকলে stair/lift dimension warning আছে। পুরোনো feature, Engineering Studio, v47 Civil Engineering module, v48 Architecture Form Studio এবং v50 Universal Building & Mansion Studio একই root deployment-এ থাকবে। ১৭টি আলাদা guide/release-note-এর লেখা `TERRAVEX-COMPANION-DOCUMENTATION.md`-এ একত্র করা হয়েছে; app source, image, launcher, script বা test file বাদ দেওয়া হয়নি।

1. আগে GitHub repository-র backup/branch তৈরি করুন।
2. ZIP download করে Windows-এ Extract করুন।
3. Extract করা package-এর **সব ৯৯টি file** আপনার existing GitHub repository-র root-এ upload করুন এবং একই নামের পুরোনো file overwrite করুন। `index.html` অবশ্যই repository root-এ থাকবে।
4. ZIP-টিকে একক file হিসেবে upload করবেন না; `fantastic-tribble-main/`, `earth-command-center/` বা অন্য কোনো extra nested folder তৈরি করবেন না।
5. **Settings → Pages → Deploy from a branch → main → /(root)** নির্বাচন করুন (আপনার repository-তে অন্য branch/Docs configuration থাকলে সেটিই বজায় রাখুন)।
6. Commit/push হওয়ার পর GitHub Pages deploy সম্পন্ন হলে HTTPS site-এ `Ctrl+Shift+R` দিন। Installed PWA পুরোনো দেখালে **Source Health & Offline → Refresh cached app shell** চালিয়ে app reload করুন।

**Current service-worker cache:** `terravex-apex-shell-v50`।

**Upload file layout:** flat root overlay; no nested project directory. Existing user data/local browser storage is not uploaded or deleted by this ZIP. Keep local credentials and `vpn-bridge-config.json` out of GitHub.

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

GitHub Pages-এ সব ৯৯টি ফাইল repository root-এ overwrite করে deploy করুন। Direct route: `?page=engineering`। Installed PWA-তে Source Health & Offline থেকে v45 app-shell refresh করে reload করুন।


Engineering Studio v45 adds geometry selection (square, rectangle, circle, regular triangle, regular pentagon, regular octagon), duplex/triplex, multinational civilian corporate, eco-friendly and civil-protection campus typologies. Military operational facility design remains excluded. DXF exports use R2000 / AC1015 metre units for AutoCAD 2007 compatibility.


### v45 geometry ও typology
Engineering Studio-তে Square, Rectangle, Circular, Regular Triangle, Pentagon ও Octagon geometry এবং Duplex/Triplex, Multinational Civilian Corporate, Eco-friendly ও Civil Protection Campus typology যোগ হয়েছে। Military base operational design নেই; নিরাপদ বিকল্প হলো civilian emergency logistics campus। DXF export R2000 / AC1015 metre units, AutoCAD 2007+ compatible।


### Engineering Studio v46: 2D preview ও AutoCAD 2007 fix

v46-এ geometry selection বদলালে 3D massing এবং 2D floor-plan canvas দুটোই নতুন করে render হবে। Engineering page-এ প্রবেশের পরও canvas redraw হয়। Square, Rectangle, Circle, Triangle, Pentagon ও Octagon footprint অনুযায়ী zone-গুলো polygon clipping দিয়ে footprint-এর ভেতরে রাখা হয়; আর layout preference হিসেবে Auto by infrastructure type, Central service core এবং Linear / wing arrangement নির্বাচন করা যায়। Infrastructure type অনুযায়ী zone label/functional program বদলায়।

2D ও 3D DXF export-কে legacy ASCII R12 / AC1009-এ নামানো হয়েছে, যা AutoCAD 2007-এ backward-compatible। এতে legacy POLYLINE/VERTEX, LINE, TEXT, 3DFACE, layer table এবং model/paper-space block section আছে। Drawing coordinates metre-এ এবং notes-এ metre unit উল্লেখ আছে। ezdxf 1.4.4 দিয়ে 36টি 2D/3D DXF combination parse ও audit করা হয়েছে; AutoCAD 2007 সফটওয়্যারে সরাসরি খোলার পরীক্ষা করা সম্ভব হয়নি।

GitHub Pages-এ সব ৯৯টি ফাইল root-এ overwrite করে deploy করুন। PWA cache: `terravex-apex-shell-v46`। Deployment-এর পর hard refresh করুন; installed PWA হলে Source Health & Offline থেকে cached app shell refresh করে reload দিন।


### v47 Integrated Civil Engineering Companion

v47-এ পুরোনো Engineering Studio-এর পাশে আলাদা `Integrated Civil Engineering Analysis & Quantity System` যুক্ত হয়েছে। Location/GPS permission বা manual coordinate, Sentinel-2 L2A catalogue metadata, GLO-90 regional elevation context, gravity-load screening, slab/beam/column/footing/pile geometric quantity take-off, nominal concrete mix/material estimate, brick/mortar estimate, user-entered reinforcement/BBS mass schedule এবং HTML/JSON/CSV/A3 DXF export পাওয়া যাবে। পুরোনো v46 2D geometry preview, 3D massing এবং original metre-based R12 DXF মুছে বা বদলে দেওয়া হয়নি।

**SoilGrids REST status:** ISRIC-এর official notice অনুযায়ী point-query beta REST API সাময়িকভাবে paused; তাই v47 ওই endpoint-এ request পাঠায় না। Official map/WMS/WCS থেকে কেবল regional context দেখা যায়। কোনো remote data দিয়ে SPT, soil bearing, groundwater বা pile capacity অনুমান করা হয় না।

নতুন A3 DXF হলো 420×297 mm model-space review sheet, 10 mm border এবং title block-সহ; এটি construction-scale plan নয়। AC1009/R12 হিসেবে ezdxf 1.4.4 parser test পাস করেছে, কিন্তু AutoCAD 2007 desktop-এ সরাসরি খোলা/plot করা এই environment-এ সম্ভব হয়নি।

Deploy: সব project file GitHub Pages repository root-এ upload/overwrite করুন; ZIP-কে single file হিসেবে upload করবেন না এবং আলাদা nested project folder-এ রাখবেন না। এরপর HTTPS site hard-refresh করুন। Installed PWA হলে Source Health & Offline → Refresh cached app shell ব্যবহার করে reload দিন। Current cache: `terravex-apex-shell-v50`.


### v48 Adaptive Architecture Form & Drawing Typography

v48-এ Civil Engineering section-এর মধ্যে `Adaptive Architecture Form & Drawing Typography` card যুক্ত হয়েছে। আগের Design Studio-এর ৬টি geometry সমান assumed area-তে compactness, perimeter/facade estimate, user-selected grid module fit এবং প্রকাশিত heuristic simplicity/symmetry index দিয়ে তুলনা করে। নির্বাচিত candidate পুরোনো geometry selector-এ apply করলে existing plan/massing redraw হয়। চারটি lettering style 2D preview, SVG/report ও R12 DXF STYLE reference-এ প্রয়োগ হয়। v47-এর gravity-load/material ও satellite-context ফল report-এ linked context হিসেবে দেখা যায়; এগুলো shape-এর structural pass/fail score নয়। কোনো structural safety certification, FEM solver বা construction approval তৈরি হয় না।

Deploy: v48 ZIP extract করে সব contents repository root-এ upload/overwrite করুন; extra nested folder করবেন না। পুরোনো project backup রাখুন। GitHub Pages deploy হওয়ার পর hard refresh দিন; installed PWA-তে `Source Health & Offline → Refresh cached app shell` ব্যবহার করুন। Cache: `terravex-apex-shell-v50`.


### v50 Universal Building & Mansion Design Studio

v50-এ আগের Design Studio-র পাশে একটি unified workflow যুক্ত হয়েছে। Residential mansion, apartment, hotel/hospitality, office, education, healthcare, retail, assembly, mixed-use এবং industrial/warehouse building-use profile; floor-by-floor room programme; room template; balcony/verandah; stair/egress input comparison; lift car/shaft/traffic/vendor reaction-data gate; rooftop tank/PV/green-roof/drainage; facade/elevation/glazing/balcony/wind context; visual coordination monitor এবং command console এক জায়গায় পাওয়া যাবে।

**Planning range:** ১–৬০ storey programme/massing। **Structural solver:** embedded solver কেবল ১–৮ storey-এর একটি representative 2D frame line বিশ্লেষণ করে। ৯ বা তার বেশি storey, irregular/torsional system, transfer structure, long-span, high-rise, hospital, assembly বা complex structure-এর জন্য full 3D analysis ও discipline-specific design software/engineer review দরকার। Stair 2R+T, lift traffic, wind resultant, roof tank load ও drainage এগুলো screening/entered-data comparison, পূর্ণ code design নয়।

Command console-এ `HELP` লিখে command list দেখুন। প্রাথমিক command: `CALCULATE`, `FLOOR 3`, `ROOM luxury`, `STAIR CHECK`, `LIFT CHECK`, `ROOF CHECK`, `FACADE CHECK`, `FRAME RUN`, `COORDINATION CHECK`, `RUN ALL`, `EXPORT DXF`, `REPORT JSON`, `SAVE LOCAL`, `LOAD LOCAL`। `RUN ALL` সব সংশ্লিষ্ট screen update করবে; কোনো unresolved gate নিজে থেকে approve করবে না।

**International use:** country / jurisdiction, structural-code profile, fire-code profile ও lift-standard profile নির্বাচন করুন। BNBC 2020, local authority, adopted IBC/ASCE/ACI, Eurocodes/National Annex, UK, NCC, NBCC, India এবং custom authority profiles আছে। এগুলো reference basis selector; clause-by-clause code calculation engine নয়। সাইটের আইনগতভাবে গৃহীত edition ও amendments আলাদাভাবে নিশ্চিত করতে হবে।

**Release status:** সব DXF / JSON / CSV / HTML output `DESIGN DEVELOPMENT / NOT FOR CONSTRUCTION`। Construction release-এর আগে survey, geotechnical report, hazard study, full 3D structural model, member/rebar/foundation design, stair/fire/accessibility, lift supplier GA, MEP/fire protection, independent checking, licensed professional signature এবং কর্তৃপক্ষের approval প্রয়োজন। software-এ construction-ready auto-approval নেই।

Deploy: ZIP extract করে ৯৯টি flat-root file existing GitHub Pages repository root-এ upload/overwrite করুন। কোনো nested folder যোগ করবেন না। Cache: `terravex-apex-shell-v50`; deployment-এর পর HTTPS hard refresh এবং installed PWA-তে Source Health & Offline → Refresh cached app shell ব্যবহার করুন।
