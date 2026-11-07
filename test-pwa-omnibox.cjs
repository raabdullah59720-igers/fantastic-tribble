const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const pwa = fs.readFileSync('pwa-install.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
const sw = fs.readFileSync('sw.js', 'utf8');
const adv = fs.readFileSync('advanced-workbench.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const satelliteModule = fs.readFileSync('bangladesh-satellite-intel.js', 'utf8');
assert.match(pwa, /addEventListener\('beforeinstallprompt'/);
const nativeHandler = pwa.match(/addEventListener\('beforeinstallprompt',\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/);
assert.ok(nativeHandler, 'beforeinstallprompt listener exists');
assert.doesNotMatch(nativeHandler[1], /preventDefault\s*\(/, 'must preserve native address-bar install UI');
assert.match(pwa, /globalInstallApp/);
assert.match(html, /id="globalInstallApp"/);
assert.match(html, /rel="manifest"/);
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some(x => x.sizes === '192x192'));
assert.ok(manifest.icons.some(x => x.sizes === '512x512'));
assert.match(sw, /terravex-apex-shell-v44/);
assert.match(adv, /terravex-apex-shell-v44/);
console.log('PWA omnibox checks: 9/9 PASS');

assert.match(html, /id=\"openEarthCommandTop\"[^>]*data-goto=\"earthcommand\"/);
assert.match(html, /id=\"openEarthCommandOverview\"[^>]*data-goto=\"earthcommand\"/);

assert.match(html, /id="page-russiansatbd"/);
assert.match(html, /data-page="russiansatbd"/);
assert.match(html, /id="openRussianSatTop"[^>]*data-goto="russiansatbd"/);
assert.match(html, /id="openRussianSatOverview"[^>]*data-goto="russiansatbd"/);
assert.ok(manifest.shortcuts.some(x => x.url === './?page=russiansatbd'));
assert.match(app, /russiansatbd:'Russian Satellite/);
assert.match(app, /TERRAVEX_RU_BD_MONITOR\?\.enter/);
assert.match(satelliteModule, /getRussianRecords/);
assert.match(satelliteModule, /TERRAVEX_RU_BD_MONITOR/);
assert.match(satelliteModule, /loadForRussianPanel/);
console.log('Russian Satellite Bangladesh entry/integration checks: 9/9 PASS');

const listeners = {};
const fakeDocument = { readyState: 'loading', getElementById: () => null, addEventListener: (name, fn) => { listeners[name] = fn; }, querySelectorAll: () => [] };
const fakeWindow = {};
const sandbox = { document: fakeDocument, window: fakeWindow, navigator: {}, console, Date, Math, Number, String, Array, Object, Set, Map, Promise, URLSearchParams, AbortController, setTimeout, clearTimeout, localStorage: { getItem: () => null, setItem: () => {} }, fetch: async () => { throw new Error('not called in initialization test'); } };
vm.runInNewContext(satelliteModule, sandbox, { filename: 'bangladesh-satellite-intel.js' });
assert.ok(fakeWindow.TERRAVEX_BD_SATELLITE_INTEL, 'shared orbital module initialized');
assert.ok(fakeWindow.TERRAVEX_RU_BD_MONITOR, 'Russian Bangladesh monitor initialized');
assert.equal(fakeWindow.TERRAVEX_RU_BD_MONITOR.getState().records, 0, 'empty source is reported as zero records, not synthetic satellites');
assert.equal(fakeWindow.TERRAVEX_BD_SATELLITE_INTEL.getRussianRecords().length, 0, 'no placeholder Russian records');
assert.equal(fakeWindow.TERRAVEX_BD_SATELLITE_INTEL.propagate('missing-id', new Date()), null, 'missing object has no fabricated position');
fakeWindow.TERRAVEX_RU_BD_MONITOR.leave();
console.log('Russian Satellite Bangladesh module bootstrap checks: 5/5 PASS');

// v32 Bangladesh Radiological Safety & Civil Protection panel integration checks
const hazard = fs.readFileSync('hazard-intelligence.js', 'utf8');
const hazardCss = fs.readFileSync('hazard-intelligence.css', 'utf8');
assert.match(html, /data-page="radiologicalsafety"/);
assert.match(html, /id="page-radiologicalsafety"/);
assert.match(html, /id="rscDistrictMap"/);
assert.match(html, /id="rscBaseMapConnection"/);
assert.match(html, /id="rscGlobe"/);
assert.match(html, /NO VERIFIED SENSOR FEED/);
assert.match(app, /radiologicalsafety:'Bangladesh Radiological Safety/);
assert.match(app, /TERRAVEX_RSC\?\.enter/);
assert.match(hazard, /TERRAVEX_RSC/);
assert.match(hazard, /FeatureServer\/0\/query/);
assert.match(hazard, /UNVERIFIED_USER_SUBMISSION/);
assert.match(hazard, /rscExportReports/);
assert.match(hazardCss, /\.rsc-globe/);
assert.match(hazardCss, /\.rsc-map/);
console.log('Radiological Safety Centre: 12 integration assertions passed (civilian safety-only panel, map, report provenance, and route).');

// v33: user-consented device-location accuracy, stale-fix and privacy regression checks
const geoJs = fs.readFileSync('geolocation-live.js', 'utf8');
const locationNodes = new Map();
const locationEvents = {};
const dispatched = [];
const clearedWatches = [];
let geoSuccess = null;
let geoError = null;
let watchOptions = null;
function makeNode(id) {
  return {
    id, textContent: '', className: '', disabled: false, checked: false, style: {},
    dataset: {}, options: [], value: '', children: [], handlers: {},
    addEventListener(type, fn) { this.handlers[type] = fn; },
    replaceChildren(...children) { this.children = children; },
    appendChild(child) { this.children.push(child); return child; },
    setAttribute() {},
    getAttribute() { return null; }
  };
}
const locationDocument = {
  readyState: 'complete',
  getElementById(id) { if (!locationNodes.has(id)) locationNodes.set(id, makeNode(id)); return locationNodes.get(id); },
  createElement(tag) { return makeNode(tag); },
  querySelectorAll() { return []; },
  addEventListener(type, fn) { locationEvents[type] = fn; }
};
const locationWindow = {
  isSecureContext: true,
  addEventListener(type, fn) { locationEvents['window:' + type] = fn; },
  dispatchEvent(event) { dispatched.push(event); return true; }
};
const locationNavigator = {
  geolocation: {
    watchPosition(success, error, options) { geoSuccess = success; geoError = error; watchOptions = options; return 41; },
    getCurrentPosition(success, error, options) { geoSuccess = success; geoError = error; watchOptions = options; },
    clearWatch(id) { clearedWatches.push(id); }
  }
};
class FakeCustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } }
const locSandbox = {
  window: locationWindow, document: locationDocument, navigator: locationNavigator,
  console, Date, Math, Number, String, Array, Object, Promise,
  CustomEvent: FakeCustomEvent, Event: class { constructor(type, init = {}) { this.type = type; this.bubbles = init.bubbles; } },
  setTimeout: fn => { fn(); return 1; }, clearTimeout() {},
  setInterval: () => 1, clearInterval() {},
};
locationDocument.getElementById('page-location');
vm.runInNewContext(geoJs, locSandbox, { filename: 'geolocation-live.js' });
const startNode = locationDocument.getElementById('startLocationWatchBtn');
const stopNode = locationDocument.getElementById('stopLocationWatchBtn');
const overlayNode = locationDocument.getElementById('locOverlayBangladesh');
assert.equal(typeof startNode.handlers.click, 'function', 'live tracking start handler registered');
startNode.handlers.click();
assert.equal(watchOptions.enableHighAccuracy, true, 'browser high-accuracy hint enabled');
assert.equal(watchOptions.maximumAge, 1000, 'fix cache bounded to one second');
assert.equal(startNode.disabled, true, 'start disabled while watch active');
assert.equal(stopNode.disabled, false, 'stop enabled while watch active');
geoSuccess({
  timestamp: Date.now(),
  coords: { latitude: 23.8103, longitude: 90.4125, accuracy: 6.4, altitude: null, speed: null, heading: null }
});
assert.match(locationDocument.getElementById('locAccuracy').textContent, /±6 m/);
assert.match(locationDocument.getElementById('locFixQuality').textContent, /FINE/);
assert.match(locationDocument.getElementById('locFixSource').textContent, /not exposed/);
assert.match(locationDocument.getElementById('locSatelliteAccess').textContent, /Not exposed/);
assert.match(locationDocument.getElementById('locPositionAge').textContent, /FRESH/);
overlayNode.checked = true;
overlayNode.handlers.change({ target: overlayNode });
assert.ok(dispatched.some(e => e.type === 'terravex:live-location'), 'overlay sends a local in-app consent event');
const oldLat = locationDocument.getElementById('locLat').textContent;
geoSuccess({ timestamp: Date.now(), coords: { latitude: 123, longitude: 90, accuracy: 5 } });
assert.equal(locationDocument.getElementById('locLat').textContent, oldLat, 'invalid coordinates do not overwrite the last valid fix');
stopNode.handlers.click();
assert.ok(clearedWatches.includes(41), 'stop control clears the browser watch');
assert.equal(startNode.disabled, false, 'start re-enabled after stop');
assert.match(locationDocument.getElementById('locTrackingScope').textContent, /No continuous location watch/);
startNode.handlers.click();
const navTarget = { dataset: { page: 'overview' } };
locationEvents.click({ target: { closest: () => navTarget } });
assert.ok(clearedWatches.filter(id => id === 41).length >= 2, 'leaving the location page automatically stops the watch');
assert.match(locationDocument.getElementById('locStatusMessage').textContent, /stopped because you left/);
assert.match(html, /The web Geolocation API does not reveal/);
assert.match(geoJs, /pagehide/);
console.log('Device location precision/privacy checks: 19 assertions passed');


// v35: 3D engine launch recovery + official Russian public meteorological imagery viewer
assert.match(html, /id="locMapLayerSelect"/);
assert.match(html, /id="locSatelliteDate"/);
assert.match(html, /id="locJmaFeed"/);
assert.match(html, /data-src="https:\/\/ds\.data\.jma\.go\.jp\/mscweb\/data\/himawari\/sat_img\.php\?area=se1"/);
assert.match(geoJs, /function ensureLeaflet\(/);
assert.match(geoJs, /function enter\(/);
assert.match(geoJs, /TERRAVEX_LOCATION/);
assert.match(geoJs, /MODIS_Terra_CorrectedReflectance_TrueColor/);
assert.match(geoJs, /esriLayer\.addTo\(map\)/);
assert.match(geoJs, /TERRAVEX_MAP_SUPPORT/);
assert.match(hazard, /rscMapNasa/);
assert.match(hazard, /NASA MODIS TILES RECEIVED/);
assert.match(hazard, /rscFetchDistricts/);
assert.match(hazard, /rscStartJma/);
assert.match(app, /TERRAVEX_LOCATION\?\.enter/);
assert.match(sw, /terravex-apex-shell-v44/);
console.log('v37 inherited 3D launch + Russian public weather imagery integration checks: 15 assertions passed.');

// v35 regression guards: visible launch controls, independent Cesium startup, CDN fallback, and public Russian weather imagery.
assert.match(html, /id="rscLaunchExperience"/);
assert.match(html, /id="rscLaunch3d"/);
assert.match(html, /id="rscRetryGlobe"/);
assert.match(html, /id="openRsc3DOverview"/);
assert.match(html, /id="rscLaunchRussianFeed"/);
assert.match(html, /id="rscRussianFeedFrame"/);
assert.match(html, /https:\/\/electro\.ntsomz\.ru\/en\//);
assert.match(html, /https:\/\/electro\.ntsomz\.ru\/en\//);
assert.match(hazard, /function rscEnsureCesium\(/);
assert.match(hazard, /cdn\.jsdelivr\.net\/npm\/cesium@1\.146\.0/);
assert.match(hazard, /function rscFallbackGlobeImagery\(/);
assert.match(hazard, /function rscProbeGlobeTile\(/);
assert.match(hazard, /globeImageryReady=true/);
assert.match(hazard, /globeInitPromise/);
assert.match(hazard, /async function rscCreateGlobe\(/);
assert.match(hazard, /async function rscInitGlobe\(/);
assert.match(hazard, /function rscLaunchExperience\(/);
assert.match(hazard, /rscInitGlobe\(\);rscStartJma\(\)/);
assert.match(hazard, /rscStartRussianFeed/);
assert.match(hazard, /rscAttachGeoJSONToGlobe/);
assert.match(hazard, /IFRAME PAGE LOAD EVENT · VERIFY IMAGE/);
assert.match(html + hazard, /not a direct spacecraft command link/i);
const safetyPanel = html.slice(html.indexOf('id="page-radiologicalsafety"'), html.indexOf('id="page-radiologicalsafety"') + 30000);
assert.doesNotMatch(safetyPanel, /gptl\.ru|Roscosmos Geoportal/i, 'civilian safety panel exposes public weather imagery only');
assert.match(hazard, /rscEnter\(\)\{RSC\.entered=true;rscInit\(\);rscInitMap\(\);rscInitGlobe\(\);/);
assert.match(sw, /terravex-apex-shell-v44/);
console.log('v37 inherited launch + Cesium decoupling + imagery tile verification + Russian public weather checks: 25 assertions passed.');



// v37: same-globe aggregated civil mobility layers and provider provenance guards
for (const id of [
  'tveActivityConsole','tveLayerAirDensity','tveLayerRoadDensity','tveLayerMarineDensity','tveLayerDroneDensity',
  'tveAirActivityState','tveRoadActivityState','tveMarineActivityState','tveDroneActivityState',
  'tveRoadAggregateUrl','tveDroneAggregateUrl','tveMarineSummary',
  'tveLoadRoadActivity','tveLoadMarineSafety','tveLoadDroneActivity','tveLoadAllActivity','tveRefreshAirDensity'
]) assert.match(html, new RegExp('id="' + id + '"'), 'missing same-globe traffic layer control: ' + id);
assert.match(html, /One Earth · shared camera · aggregated regional cells only/);
assert.match(app, /function renderAirDensity\(/);
assert.match(app, /function validateAggregateGeoJSON\(/);
assert.match(app, /metadata\.dataType/);
assert.match(app, /spatialResolutionKm/);
assert.match(app, /count<10/);
assert.match(app, /radius<10/);
assert.match(app, /aggregationLevel/);
assert.match(app, /Raw object identifiers are not accepted/);
assert.match(app, /tve-activity-/);
assert.match(app, /renderAirDensity\(S\.aircraft,snap\|\|\{\}\)/);
assert.match(sw, /terravex-apex-shell-v44/);
assert.match(adv, /terravex-apex-shell-v44/);
assert.match(app, /function loadAllConfiguredActivities\(/);
assert.match(html, /No vessel identities, positions or routes are plotted/);
assert.match(app, /marine-api\.open-meteo\.com\/v1\/marine/);
assert.match(app, /function paintMarineSafety\(/);
assert.match(app, /function loadMarineConditions\(/);
assert.match(html, /open-meteo\.com\/en\/docs\/marine-weather-api/);
assert.match(app, /loadMarineConditions\(\);/);
console.log('v38 same-globe civil activity and Bay of Bengal marine-safety layer integration checks passed.');

// Runtime schema checks for provider aggregate payloads; reject identities even when nested.
const validationStart = app.indexOf('  function validateAggregateGeoJSON(');
const validationEnd = app.indexOf('\n  async function loadAggregateLayer', validationStart);
assert.ok(validationStart >= 0 && validationEnd > validationStart, 'aggregate validator function can be isolated for runtime tests');
const validationContext = vm.createContext({ Date });
vm.runInContext(app.slice(validationStart, validationEnd), validationContext);
const aggregateBase = {
  type: 'FeatureCollection',
  metadata: { dataType: 'aggregated', spatialResolutionKm: 25, generatedAt: new Date().toISOString(), source: 'Test aggregate provider' },
  features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [90.4, 23.7] }, properties: { count: 25, radiusKm: 25, aggregationLevel: 'district', congestionIndex: 42 } }]
};
assert.equal(validationContext.validateAggregateGeoJSON(aggregateBase, 'road').cells.length, 1, 'coarse road aggregate passes');
assert.throws(() => validationContext.validateAggregateGeoJSON({ ...aggregateBase, features: [{ ...aggregateBase.features[0], id: 'vehicle-123' }] }, 'road'), /Raw object identifiers/);
assert.throws(() => validationContext.validateAggregateGeoJSON({ ...aggregateBase, features: [{ ...aggregateBase.features[0], properties: { ...aggregateBase.features[0].properties, metadata: { nested: { mmsi: '123456789' } } } }] }, 'marine'), /Raw object identifiers/);
assert.throws(() => validationContext.validateAggregateGeoJSON({ ...aggregateBase, features: [{ ...aggregateBase.features[0], properties: { ...aggregateBase.features[0].properties, track: [[90,23],[91,24]] } }] }, 'marine'), /Raw object identifiers/);
console.log('v38 aggregate payload runtime validation: 4 assertions passed (valid coarse cell accepted; feature ID, nested ID and raw track rejected).');
const marineBuilderStart = app.indexOf('  const MARINE_GRID=');
const marineBuilderEnd = app.indexOf('  function waveColor(', marineBuilderStart);
assert.ok(marineBuilderStart >= 0 && marineBuilderEnd > marineBuilderStart, 'marine request builder can be isolated');
const marineContext = vm.createContext({ URLSearchParams });
vm.runInContext(app.slice(marineBuilderStart, marineBuilderEnd) + '\nthis.buildUrl = marineQueryUrl;', marineContext);
const marineUrl = new URL(marineContext.buildUrl());
assert.equal(marineUrl.hostname, 'marine-api.open-meteo.com');
assert.equal(marineUrl.searchParams.get('cell_selection'), 'sea');
assert.equal(marineUrl.searchParams.get('latitude').split(',').length, 16);
assert.equal(marineUrl.searchParams.get('longitude').split(',').length, 16);
assert.match(marineUrl.searchParams.get('current'), /wave_height/);
assert.match(marineUrl.searchParams.get('current'), /ocean_current_velocity/);
console.log('v38 Bay of Bengal marine model request: 6 deterministic assertions PASS.');


// v39: five civil environmental panels must stay in the original single-globe workspace.
const civilIds = [
  'tvxCivilSystems', 'tvxFloodPanel', 'tvxHumanitarianPanel', 'tvxForestPanel',
  'tvxOceanPanel', 'tvxArchivePanel', 'tvxFloodRefresh', 'tvxHumanRefresh',
  'tvxForestRefresh', 'tvxOceanRefresh', 'tvxArchiveSearch', 'tvxArchiveShowImage'
];
for (const id of civilIds) assert.match(html, new RegExp(`id="${id}"`), `missing v39 panel element ${id}`);
assert.equal((html.match(/id="tveCesium"/g) || []).length, 1, 'v39 must retain exactly one existing Cesium globe');
assert.match(app, /function loadFloodRiverModel\(/);
assert.match(app, /function loadHumanitarianSummary\(/);
assert.match(app, /function loadBiodiversitySummary\(/);
assert.match(app, /function searchEarthObservationArchive\(/);
assert.match(app, /function updateCivilOceanPanel\(/);
assert.match(app, /S\.viewer\.entities\.add/, 'civil map layers reuse the existing viewer entities');
assert.match(app, /earth-search\.aws\.element84\.com\/v1\/search/);
assert.match(app, /gibs\.earthdata\.nasa\.gov\/wmts/);
assert.match(app, /flood-api\.open-meteo\.com\/v1\/flood/);
assert.match(app, /api\.gbif\.org\/v1\/occurrence\/search/);
assert.match(html, /individual site locations are not shown/i);
assert.match(html, /not animal counts or live sightings/);
assert.match(html, /tide-gauge replacement/);
assert.match(sw, /terravex-apex-shell-v44/);
console.log('v39 civil environmental panels: 27 same-globe/source/disclosure assertions PASS');
// v40: direct launch paths make the civil panels discoverable at the top of the existing command page.
for (const id of ['openCivilPanelsTop','openCivilPanelsOverview']) assert.match(html,new RegExp(`id="${id}"[^>]*data-civil-target="tvxCivilSystems"`),`missing visible v40 civil launcher ${id}`);
for (const id of ['tvxFloodPanel','tvxHumanitarianPanel','tvxForestPanel','tvxOceanPanel','tvxArchivePanel']) assert.match(html,new RegExp(`data-civil-target="${id}"`),`missing quick-jump button for ${id}`);
assert.match(html,/tvx-civil-entrybar/);
assert.match(app,/function navigate\(name,civilTarget=''/);
assert.match(app,/civilPanelTargets=\{all:'tvxCivilSystems',flood:'tvxFloodPanel',humanitarian:'tvxHumanitarianPanel',forest:'tvxForestPanel',ocean:'tvxOceanPanel',archive:'tvxArchivePanel',globe:'tveCesium'\}/);
console.log('v40 civil panel visibility/navigation: 9 direct-launch and deep-link assertions PASS');
