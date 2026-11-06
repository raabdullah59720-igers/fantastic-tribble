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
