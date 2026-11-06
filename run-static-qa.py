from pathlib import Path
import json, re, subprocess, sys
from bs4 import BeautifulSoup
import tinycss2
root=Path(__file__).resolve().parent
errors=[]; report=[]
# Parse HTML and duplicate IDs
html=(root/'index.html').read_text(encoding='utf-8')
soup=BeautifulSoup(html,'html.parser')
ids=[e.get('id') for e in soup.select('[id]')]
dups=sorted({x for x in ids if ids.count(x)>1})
if dups: errors.append('Duplicate IDs: '+', '.join(dups))
report.append(f'HTML: parsed; {len(ids)} IDs; duplicate IDs={len(dups)}')
# Internal resources referenced by HTML
missing=[]
for tag,attr in [('script','src'),('link','href'),('img','src')]:
 for el in soup.find_all(tag):
  url=el.get(attr)
  if not url or url.startswith(('http://','https://','data:','#','mailto:','tel:','javascript:','blob:')): continue
  clean=url.split('?')[0].split('#')[0]
  if clean and not (root/clean).exists(): missing.append(f'{tag}:{url}')
if missing: errors.append('Missing local references: '+', '.join(missing))
report.append(f'HTML local references: {"PASS" if not missing else "FAIL"}; missing={len(missing)}')
# Inspect the standalone Thunderstorm Energy Lab document as well as the SPA shell.
storm_path=root/'thunderstorm-energy-lab.html'
storm_html=storm_path.read_text(encoding='utf-8')
storm=BeautifulSoup(storm_html,'html.parser')
storm_ids=[e.get('id') for e in storm.select('[id]')]
storm_dups=sorted({x for x in storm_ids if storm_ids.count(x)>1})
storm_missing=[]
for tag,attr in [('script','src'),('link','href'),('img','src')]:
 for el in storm.find_all(tag):
  url=el.get(attr)
  if not url or url.startswith(('http://','https://','data:','#','mailto:','tel:','javascript:','blob:')): continue
  clean=url.split('?')[0].split('#')[0]
  if clean and not (root/clean).exists(): storm_missing.append(f'{tag}:{url}')
if storm_dups: errors.append('Thunderstorm page duplicate IDs: '+', '.join(storm_dups))
if storm_missing: errors.append('Thunderstorm page missing local references: '+', '.join(storm_missing))
if 'assets/' in storm_html: errors.append('Thunderstorm page still contains obsolete assets/ relative paths')
for token in ('device3dCanvas','deviceModelInterlock','deviceRunModelPulse','deviceSafeStop','himawariFrame','TERRAVEX_DEVICE_3D'):
 if token not in storm_html and token not in (root/'thunderstorm-energy-lab.js').read_text(encoding='utf-8'):
  errors.append('Thunderstorm module missing expected component: '+token)
storm_js=(root/'thunderstorm-energy-lab.js').read_text(encoding='utf-8')
for token in ('precipitation_probability','cape','TERRAVEX_THUNDERSTORM_LAB','terravex:storm-model-update','terravex:thunderstorm-pulse','setPointerCapture','fallbackDraw'):
 if token not in storm_js: errors.append('Thunderstorm JS missing expected behaviour: '+token)
for forbidden in ('thunderstorm_probability','lightning_potential','thunderstormProbability'):
 if forbidden in storm_js: errors.append('Thunderstorm module uses unsupported or misleading forecast field: '+forbidden)
if 'sat_img.php?area=se4' not in storm_html or 'list_se4.html' not in storm_html:
 errors.append('Thunderstorm panel missing official JMA South Asia viewer/index links')
if 'NOT CONNECTED' not in storm_html or 'READ-ONLY' not in storm_html:
 errors.append('Thunderstorm panel must clearly disclose absent hardware/satellite command links')
report.append(f'Thunderstorm standalone panel: {len(storm_ids)} IDs; duplicate IDs={len(storm_dups)}; local resource misses={len(storm_missing)}; 3D/fallback/feed/control checks included')
# Manifest
manifest=json.loads((root/'manifest.webmanifest').read_text())
assert manifest.get('name') and manifest.get('short_name') and manifest.get('start_url') and manifest.get('scope') and manifest.get('display') in ('standalone','minimal-ui','fullscreen')
for size in ('192x192','512x512'):
 assert any(size in item.get('sizes','').split() for item in manifest['icons']), f'Missing {size} icon declaration'
report.append(f'Manifest: JSON valid; display={manifest["display"]}; required icons declared')
# Service worker required paths
sw=(root/'sw.js').read_text()
cache=re.search(r"CACHE_NAME = '([^']+)'",sw).group(1)
arr=re.search(r'const REQUIRED_SHELL = \[(.*?)\];',sw,re.S).group(1)
paths=re.findall(r'"(.*?)"',arr)
missing_sw=[v for v in paths if not (root/v.removeprefix('./')).exists()]
if missing_sw: errors.append('Missing service-worker files: '+', '.join(missing_sw))
if cache!='terravex-apex-shell-v40': errors.append('Unexpected service-worker cache version '+cache)
if './bangladesh-satellite-intel.js' not in paths: errors.append('Bangladesh Satellite 3D monitor missing from required PWA shell')
# Live 3D Earth command panel must have a visible entry point from all app layouts.
nav_ok = bool(re.search(r'data-page="earthcommand"', html))
quick_ok = bool(re.search(r'id="openEarthCommandTop"[^>]*data-goto="earthcommand"', html))
overview_ok = bool(re.search(r'id="openEarthCommandOverview"[^>]*data-goto="earthcommand"', html))
page_ok = bool(re.search(r'id="page-earthcommand"', html))
if not all([nav_ok, quick_ok, overview_ok, page_ok]):
    errors.append('Live 3D Earth panel visibility / launch-entry regression')
if html.find('id="tvxCivilSystems"') < html.find('id="page-earthcommand"') or html.find('id="tvxCivilSystems"') > html.find('id="page-earth"'):
    errors.append('v39 civil panels must remain inside the original Live 3D Earth page / shared globe shell')
# v40: the panels must be directly reachable, not only buried far below the command page.
for panel_key, element_id in [('all','tvxCivilSystems'),('flood','tvxFloodPanel'),('humanitarian','tvxHumanitarianPanel'),('forest','tvxForestPanel'),('ocean','tvxOceanPanel'),('archive','tvxArchivePanel')]:
    if f"{panel_key}:'{element_id}'" not in (root/'app.js').read_text(encoding='utf-8'):
        errors.append('v40 missing direct civil panel route mapping: '+panel_key)
    if f'data-civil-target="{element_id}"' not in html:
        errors.append('v40 missing visible launch shortcut for '+element_id)
if not re.search(r'id="openCivilPanelsTop"[^>]*data-civil-target="tvxCivilSystems"',html):
    errors.append('v40 persistent top-bar Civil 3D shortcut missing')
if not re.search(r'id="openCivilPanelsOverview"[^>]*data-civil-target="tvxCivilSystems"',html):
    errors.append('v40 Overview Civil 3D launch card missing')
if 'function navigate(name,civilTarget=' not in (root/'app.js').read_text(encoding='utf-8'):
    errors.append('v40 route controller does not support civil-panel navigation')

# Bangladesh Satellite 3D panel must be registered, reachable and backed by the cached module.
bd_nav = bool(re.search(r'data-page="bangladeshsats"', html))
bd_page = bool(re.search(r'id="page-bangladeshsats"', html))
bd_script = bool(re.search(r'<script[^>]+src="bangladesh-satellite-intel.js"', html))
bd_route = 'bangladeshsats:' in (root/'app.js').read_text(encoding='utf-8')
bd_module = (root/'bangladesh-satellite-intel.js').read_text(encoding='utf-8') if (root/'bangladesh-satellite-intel.js').exists() else ''
bd_context = bd_module + html
for token in ('CelesTrak', 'json2satrec', 'propagate', 'NASA GIBS', 'NO DIRECT FEED', 'currentlyOverBangladesh'):
    if token not in bd_context:
        errors.append('Bangladesh Satellite module missing required semantic marker: '+token)
if not all([bd_nav,bd_page,bd_script,bd_route]): errors.append('Bangladesh Satellite 3D page navigation / module registration regression')
report.append('Bangladesh Satellite 3D panel: nav/page/route/script registration + orbital/image disclosure checks')
# Dedicated Russian-labelled satellite / Bangladesh command panel.
rbd_nav = bool(re.search(r'data-page="russiansatbd"', html))
rbd_page = bool(re.search(r'id="page-russiansatbd"', html))
rbd_route = "russiansatbd:'Russian Satellite" in (root/'app.js').read_text(encoding='utf-8')
rbd_module = bd_module
for token in ('TERRAVEX_RU_BD_MONITOR', 'getRussianRecords', 'propagate', 'ROSCOSMOS GEOPORTAL', 'not a Russian satellite image', 'NASA GIBS'):
    if token not in rbd_module + html:
        errors.append('Russian Satellite BD panel missing expected marker: '+token)
if not all([rbd_nav, rbd_page, rbd_route]):
    errors.append('Russian Satellite Bangladesh panel nav/page/route registration regression')
if not re.search(r'id="openRussianSatTop"[^>]*data-goto="russiansatbd"', html):
    errors.append('Russian Satellite Bangladesh top-bar shortcut missing')
if not re.search(r'id="openRussianSatOverview"[^>]*data-goto="russiansatbd"', html):
    errors.append('Russian Satellite Bangladesh overview shortcut missing')
if './bangladesh-satellite-intel.js' not in paths:
    errors.append('Shared Bangladesh/Russian satellite module missing from required PWA shell')
report.append('Russian Satellite Bangladesh panel: separate nav/page/route + 3D/orbit/imagery provenance checks')

report.append(f'Service worker: {cache}; required local assets={len(paths)}; missing={len(missing_sw)}')
# Runtime diagnostics must inspect the same service-worker version.
adv=(root/'advanced-workbench.js').read_text(encoding='utf-8')
if cache not in adv: errors.append('PWA runtime diagnostics cache version does not match service worker.')
report.append('PWA diagnostics cache-version parity: ' + ('PASS' if cache in adv else 'FAIL'))
# User-controlled device location precision/privacy module checks (not remote satellite tracking).
loc_js=(root/'geolocation-live.js').read_text(encoding='utf-8')
loc_ids=('page-location','locPositionAge','locFixQuality','locFixSource','locSatelliteAccess','locTrackingScope','locOverlayBangladesh','startLocationWatchBtn','stopLocationWatchBtn')
for token in loc_ids:
    if f'id=\"{token}\"' not in html and token not in ('startLocationWatchBtn','stopLocationWatchBtn'):
        errors.append('Location panel missing expected element: '+token)
for token in ('enableHighAccuracy:true','maximumAge:1000','watchPosition','clearWatch','validPosition','locFixQuality','locPositionAge','terravex:live-location','pagehide','does not reveal which GPS/GNSS satellites'):
    if token not in loc_js and token not in html:
        errors.append('Location module missing safety/accuracy behaviour: '+token)
if 'terravex:live-location' not in loc_js or 'userConsented:true' not in loc_js:
    errors.append('Location overlay must be explicit and consent-tagged')
if 'satellite tracking guaranteed' in (loc_js+html).lower():
    errors.append('Location module must not claim guaranteed satellite tracking')
report.append('Device location module: user-consented watch, accuracy radius, age/stale state, privacy and satellite-provider disclosure checked')
# v37 same-globe aggregate civil mobility overlay checks.
activity_ids=('tveActivityConsole','tveLayerAirDensity','tveLayerRoadDensity','tveLayerMarineDensity','tveLayerDroneDensity','tveRoadAggregateUrl','tveDroneAggregateUrl','tveLoadAllActivity','tveLoadMarineSafety','tveMarineSummary')
for token in activity_ids:
    if f'id="{token}"' not in html: errors.append('Missing v37 activity-layer UI control: '+token)
app_js=(root/'app.js').read_text(encoding='utf-8')
for token in ('function renderAirDensity(','function validateAggregateGeoJSON(','spatialResolutionKm','count<10','radius<10','aggregationLevel','Raw object identifiers are not accepted','loadAllConfiguredActivities','function loadMarineConditions(','marine-api.open-meteo.com/v1/marine','function paintMarineSafety(','No synthetic marine data is displayed'):
    if token not in app_js: errors.append('Missing aggregate-only mobility validation: '+token)
if '1-degree' not in (root/'DATA_SOURCES.md').read_text(encoding='utf-8'): errors.append('Air activity aggregation methodology missing')
if 'Bay of Bengal marine safety' not in (root/'index.html').read_text(encoding='utf-8'): errors.append('Marine safety layer label missing')
if 'terravex-apex-shell-v40' not in (root/'sw.js').read_text(encoding='utf-8'): errors.append('PWA cache not bumped to v40')
report.append('v38 same-globe civil activity layers: air density, aggregate providers and Bay of Bengal marine model remain registered')
# v39 five environmental/civil panels sharing one Cesium viewer.
for token in ('tvxCivilSystems','tvxFloodPanel','tvxHumanitarianPanel','tvxForestPanel','tvxOceanPanel','tvxArchivePanel','tvxFloodRefresh','tvxHumanRefresh','tvxForestRefresh','tvxOceanRefresh','tvxArchiveSearch','tvxArchiveShowImage'):
    if f'id="{token}"' not in html: errors.append('Missing v39 civil panel UI element: '+token)
for token in ('function loadFloodRiverModel(','flood-api.open-meteo.com/v1/flood','function loadHumanitarianSummary(','overpass-api.de/api/interpreter','spatialResolution','function loadBiodiversitySummary(','api.gbif.org/v1/occurrence/search','function searchEarthObservationArchive(','earth-search.aws.element84.com/v1/search','function showNasaArchiveImagery(','gibs.earthdata.nasa.gov/wmts/epsg3857/best/','function updateCivilOceanPanel(','getViewer:()=>S.viewer','getCesium:()=>window.Cesium'):
    if token not in app_js: errors.append('Missing v39 civil panel behaviour: '+token)
for token in ('individual site locations are not shown','not animal counts or live sightings','not river-stage height','not live video'):
    if token not in html and token not in app_js: errors.append('Missing v39 data-limitation disclosure: '+token)
if 'terravex-apex-shell-v40' not in (root/'sw.js').read_text(encoding='utf-8'): errors.append('PWA cache not bumped to v40')
report.append('v39 civil panels: GloFAS flood model, DDM/OSM humanitarian aggregates, GBIF regional records, existing marine model and NASA GIBS/STAC archive use the shared Cesium engine; source-limitation disclosures checked')

# Manifest app shortcuts must target existing navigation pages.
page_keys={b.get('data-page') for b in soup.select('button[data-page]')}
invalid_shortcuts=[]
for shortcut in manifest.get('shortcuts', []):
 try: target=json.loads(json.dumps(shortcut)).get('url','').split('page=',1)[1].split('&',1)[0]
 except Exception: target=''
 if not target or target not in page_keys: invalid_shortcuts.append(shortcut.get('name','unnamed'))
if invalid_shortcuts: errors.append('Manifest shortcuts target missing pages: '+', '.join(invalid_shortcuts))
report.append('Manifest shortcuts: ' + str(len(manifest.get('shortcuts', []))) + ' checked; invalid=' + str(len(invalid_shortcuts)))
# JS syntax via node
js_files=sorted(root.glob('*.js'))
for f in js_files:
 r=subprocess.run(['node','--check',str(f)],text=True,capture_output=True)
 if r.returncode: errors.append(f'Node syntax {f.name}: {r.stderr.strip()}')
report.append(f'JavaScript syntax: {len(js_files)} files checked; errors=0' if not any(e.startswith('Node syntax') for e in errors) else 'JavaScript syntax failed')
# CSS parse, surface errors
css_files=sorted(root.glob('*.css')); css_errors=[]
for f in css_files:
 tokens=tinycss2.parse_stylesheet(f.read_text(),skip_comments=True,skip_whitespace=True)
 es=[t for t in tokens if t.type=='error']
 if es: css_errors.append(f'{f.name}: '+', '.join(e.message for e in es))
if css_errors: errors.extend(css_errors)
report.append(f'CSS parser: {len(css_files)} stylesheets; parse errors={len(css_errors)}')
# Python syntax
import ast
for n in ('vpn-bridge.py','test_vpn_bridge.py','run-static-qa.py','run-space-env-tests.py'):
 try: ast.parse((root/n).read_text())
 except Exception as e: errors.append(f'Python syntax {n}: {e}')
report.append('Python syntax: 4 files checked')
# password gate safety checks
pl=(root/'password-lock.js').read_text()
for phrase in ('PBKDF2','SHA-256','localStorage.setItem','iterations: ITERATIONS'):
 if phrase not in pl: errors.append('Password lock missing expected primitive: '+phrase)
if 'localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1' not in pl: errors.append('Password verifier storage pattern missing')
if 'tvx-lock-pending .shell' not in (root/'password-lock.css').read_text(): errors.append('Early app-shell mask missing')
report.append('Password lock: PBKDF2 verifier, salted storage path, startup mask present')
# launcher presence
for n in ('START-TERRAVEX-WEB-APP.bat','START-TERRAVEX-DESKTOP-APP.bat','INSTALL-TERRAVEX-DESKTOP.bat','serve_terravex.ps1','launch-terravex-app.ps1','install-desktop-shortcut.ps1'):
 if not (root/n).exists(): errors.append('Missing launcher file '+n)
report.append('Windows launcher assets: 6 expected files present (Windows runtime not available here)')
# Run Earth Traffic 3D unit-style DOM/API mock tests as part of the standard QA pass.
et_test=root/'test-earth-traffic-monitor.cjs'
if not et_test.exists():
 errors.append('Missing Earth Traffic monitor test script')
 report.append('Earth Traffic 3D tests: missing')
else:
 et_run=subprocess.run(['node',str(et_test)],text=True,capture_output=True)
 if et_run.returncode: errors.append('Earth Traffic 3D tests failed: '+(et_run.stderr.strip() or et_run.stdout.strip()))
 report.append('Earth Traffic 3D tests: '+(et_run.stdout.strip().splitlines()[-1] if et_run.returncode==0 and et_run.stdout.strip() else 'FAIL'))
print('\n'.join(report))
print('TOTAL ERRORS:',len(errors))
for e in errors: print('ERROR:',e)
sys.exit(1 if errors else 0)
