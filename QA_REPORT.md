# TERRAVEX APEX — Space & Atmosphere Upgrade QA Report

Build: **Space Environment Upgrade v12**  
Test date: **24 October 2026**  
Scope: previous application package plus three additive panels: Ozone & Atmosphere Observatory, Solar Activity & Magnetosphere Monitor, and Near-Earth Object Watch.

## Package and static validation

- HTML parsed successfully: **634 element IDs**, **0 duplicate IDs**.
- Navigation and page sections: **32 navigation buttons / 32 page sections**.
- Local HTML resource references: **0 missing**.
- PWA manifest: valid JSON, `standalone` display, 192×192 and 512×512 icons declared, **8 shortcuts**, **0 invalid shortcut targets**.
- Service worker: `terravex-apex-shell-v12`; **37 required app-shell resources**, **0 missing**.
- Runtime PWA diagnostics and service-worker cache version: **PASS**.
- JavaScript syntax: **18 root JavaScript files**, **0 syntax errors**.
- CSS parser: **15 stylesheets**, **0 parser errors**.
- Python syntax: **4 files** checked.
- ZIP CRC/integrity: **PASS**.

## Package inventory

- Deliverable files after excluding Python bytecode/cache: **73 files** (under the 98-file constraint).
- Entry page `index.html`, manifest, service worker and all three new panel assets are at the package root or referenced local asset paths.

## Functional tests

- Space science math/feed normalizer: **11 assertions PASS** (Dobson Unit conversion, invalid input, NEO data normalization/sorting, and NASA hazardous flag preservation).
- PWA install regression checks: **9/9 PASS**.
- RF interference simulation tests retained: **5/5 PASS**.
- VPN local-bridge isolated tests: **11/11 PASS** (fake VPN CLI; does not control a real VPN during tests).
- Browser mock integration with Chromium: **8 assertions PASS**, **0 page errors**. The test provided mock NASA DONKI and NeoWs JSON responses and verified FLR/CME/GST counts, source event rows, NEO count, catalog hazardous flag, normalized list and closest-pass distance. No public network response was used in this test.
- Visual smoke checks: all three new panel canvases rendered in a self-contained Chromium preview with no JavaScript page errors.

## New-panel data integrity

- **Ozone:** animated atmosphere/ozone-shell and altitude-profile graphics are explicitly labeled schematic. The 300 DU default is only an illustrative user input, converting to 3 mm compressed equivalent ozone at 0 °C / 1 atm; it is not presented as a live Bangladesh observation. NASA Ozone Watch is linked and can optionally be opened in an embedded frame where browser policy permits.
- **Space weather:** attempts to fetch NASA CCMC DONKI FLR, CME and GST records. The panel preserves source timestamps/links and reports partial/offline states; it does not infer that a CME is Earth-directed or turn research records into an official warning.
- **Near-Earth objects:** requests one UTC date via NASA NeoWs using `DEMO_KEY`, shows only received feed values and reports an unavailable/throttled state on failure. The orbit canvas is illustrative geometry; it is not an orbital ephemeris. NASA's Demo key has low request limits, so avoid repeated manual refreshes.
- **Existing satellite/orbit monitor:** retained; public CelesTrak orbital data still require online browser access. The new panels do not access classified or private tracking data.

## Not verified in this environment

- Live NASA DONKI, NeoWs and Ozone Watch network delivery from the final public GitHub Pages origin.
- Real deployment on GitHub Pages or a Windows machine.
- Whether NASA Ozone Watch permits embedding in each browser; direct official-source links remain available.
- Live space-weather forecasting skill, real ozone measurements over Bangladesh, or impact prediction. This application is an engineering/observability prototype, not a certified warning service.
- The PowerShell verification script was authored, but Windows PowerShell execution could not be performed in this Linux test environment.

## Reproduce checks

On a machine with Python 3, Node.js, and the project directory extracted:

```bash
python run-space-env-tests.py
```

On Windows PowerShell:

```powershell
.\VERIFY-TERRAVEX-SPACE-ENVIRONMENT.ps1
```

Passing local tests does not prove external APIs are available or that an online deployment succeeded. Always inspect the feed-status label and its fetch time.
