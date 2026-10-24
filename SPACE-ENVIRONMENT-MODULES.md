# Space & Atmosphere panels — engineering notes

## Panel A: Ozone & Atmosphere Observatory

- Animated Earth-limb, atmospheric bands, UV-B ray-path concept, and altitude-profile canvas.
- Dobson Unit to compressed pure-ozone thickness conversion: `thickness_mm = DU × 0.01` under the reference conditions shown in the UI.
- 300 DU is a teaching reference input only. It is not measured ozone above Bangladesh.
- NASA Ozone Watch links for latest source page, monthly products, daily maps and seasonal context.
- Embedded NASA source page is lazy-loaded after the user opens its disclosure, to avoid blocking initial app rendering. Direct source links are the fallback if framing is denied.

## Panel B: Solar Activity & Magnetosphere Monitor

- Fetches recent `FLR`, `CME`, and `GST` entries from NASA CCMC DONKI for a rolling seven-day window.
- Source fields are normalized for UI display; source timestamps and links are retained.
- Refresh uses request timeouts and `Promise.allSettled`, so one failed event class does not hide other available classes.
- Optional browser notifications require an explicit user opt-in and permission. The initial feed load never notifies for old items; later refreshes notify only for newly observed event IDs within the session.
- Magnetosphere graphic is conceptual and does not infer the direction or impact of a CME.

## Panel C: Near-Earth Object Watch

- Requests one UTC day's `NeoWs Feed` response to reduce NASA Demo-key usage.
- Normalizes the first reported close-approach record, maximum/minimum estimated diameter, relative velocity, miss distance and NASA's hazardous-object flag.
- Sorts by reported miss distance. `LD` uses a reference lunar distance of 384,400 km for visualization/summary.
- Canvas markers are arranged for illustration; no real heliocentric coordinates are implied.
- In-memory 30-minute cache; manual refresh can be throttled by NASA's public Demo key.

## Source endpoints

- NASA Ozone Watch: https://ozonewatch.gsfc.nasa.gov/
- NASA Dobson Unit facts: https://ozonewatch.gsfc.nasa.gov/facts/dobson_SH.html
- NASA atmospheric layers: https://www.nasa.gov/image-article/earths-atmospheric-layers-3/
- NASA CCMC DONKI: https://ccmc.gsfc.nasa.gov/tools/DONKI/
- DONKI event guide: https://ccmc.gsfc.nasa.gov/DONKI/guide/events/
- NASA Open APIs / NeoWs: https://api.nasa.gov/
- CelesTrak orbital elements: https://celestrak.org/NORAD/elements/
