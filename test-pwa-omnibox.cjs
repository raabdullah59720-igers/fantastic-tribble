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
assert.match(sw, /terravex-apex-shell-v34/);
assert.match(adv, /terravex-apex-shell-v34/);
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


// v34: Location map visibility recovery + public environmental satellite imagery wiring
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
assert.match(sw, /terravex-apex-shell-v34/);
console.log('v34 map + public satellite imagery integration checks: 15 assertions passed.');
