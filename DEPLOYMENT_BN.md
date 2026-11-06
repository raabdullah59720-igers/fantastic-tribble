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
