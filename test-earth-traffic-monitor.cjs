const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = process.cwd();
const html = fs.readFileSync(root + '/index.html', 'utf8');
const css = fs.readFileSync(root + '/earth-traffic-monitor.css', 'utf8');
const js = fs.readFileSync(root + '/earth-traffic-monitor.js', 'utf8');
const sw = fs.readFileSync(root + '/sw.js', 'utf8');
const app = fs.readFileSync(root + '/app.js', 'utf8');
const manifest = JSON.parse(fs.readFileSync(root + '/manifest.webmanifest', 'utf8'));

assert.match(html, /id="page-earthtraffic"/);
assert.match(html, /data-page="earthtraffic"/);
assert.match(html, /id="etGlobeStage"/);
assert.match(html, /id="etRefreshAircraft"/);
assert.match(html, /earth-traffic-monitor\.css/);
assert.match(html, /earth-traffic-monitor\.js/);
assert.match(html, /three@0\.160\.0/);
assert.match(app, /earthtraffic:'Earth Traffic 3D Monitor'/);
assert.ok(manifest.shortcuts.some(x => x.url === './?page=earthtraffic'));
assert.match(sw, /terravex-apex-shell-v17/);
assert.match(sw, /\.\/earth-traffic-monitor\.js/);
assert.match(sw, /\.\/earth-traffic-monitor\.css/);
assert.match(js, /Satellite\.js did not load/);
assert.match(js, /opensky-network\.org\/api\/states\/all/);
assert.match(js, /SGP4\/SDP4/);
assert.match(js, /does not insert dummy aircraft/);
assert.match(js, /72\*3600000/);
assert.match(css, /\.et-globe-stage/);

// Evaluate the module without booting the DOM, then exercise pure location/aircraft helpers.
const listeners = {};
const fakeDocument = {
  readyState: 'loading',
  getElementById: () => null,
  addEventListener: (name, fn) => { listeners[name] = fn; },
  querySelectorAll: () => []
};
const fakeWindow = {};
const sandbox = {
  document: fakeDocument,
  window: fakeWindow,
  navigator: {},
  console,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  Set,
  Map,
  Promise,
  AbortController,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  localStorage: { getItem: () => null, setItem: () => {} },
  fetch: async () => { throw new Error('fetch not expected in pure helper test'); }
};
vm.runInNewContext(js, sandbox, { filename: 'earth-traffic-monitor.js' });
const h = fakeWindow.TERRAVEX_EARTH_TRAFFIC.helpers;
assert.ok(h, 'test helpers exported');
const eq = (a,b,tol=1e-8) => assert.ok(Math.abs(a-b) <= tol, `${a} not near ${b}`);
let v = h.geoVector(0, 0, 1);
eq(v[0], 1); eq(v[1], 0); eq(v[2], 0);
v = h.geoVector(0, 90, 1); eq(v[0], 0); eq(v[1], 0); eq(v[2], -1);
v = h.geoVector(90, 0, 1); eq(v[0], 0); eq(v[1], 1); eq(v[2], 0);
assert.ok(h.displayRadius(400, false) > 1);
assert.ok(h.displayRadius(35786, false) > h.displayRadius(400, false));
assert.ok(h.displayRadius(10000, true) > 1);
assert.equal(h.ageText(61000), '61 s');

const liveState = ['abc123','BGD123','Bangladesh',1700000000,1700000002,90.4125,23.8103,10000,false,205,180,1.2,null,10500,'1234',false,0,0];
const groundState = ['def456','GRD456','Bangladesh',1700000000,1700000002,90.1,23.1,0,true,0,null,null,null,0,null,false,0,0];
const unknownGroundState = ['fedcba','UNK456','Bangladesh',1700000000,1700000002,90.2,23.2,null,null,0,null,null,null,null,null,false,0,0];
const invalidCoordinate = ['invalid','BAD456','Bangladesh',1700000000,1700000002,null,null,10000,false,200,180,0,null,10500,null,false,0,0];
const parsed = h.extractAircraft({ time: 1700000005, states: [liveState, groundState, unknownGroundState, invalidCoordinate] });
assert.equal(parsed.length, 1, 'default airborne filter excludes ground, unknown ground state and invalid coordinates');
assert.equal(parsed[0].icao24, 'abc123');
assert.equal(parsed[0].baroAltitudeM, 10000);
assert.equal(parsed[0].lat, 23.8103);
assert.equal(parsed[0].sourceEpoch, 1700000005);

// Mock the Satellite.js public interface and verify the ECI -> geodetic step is applied.
const lib = {
  json2satrec: () => ({ error: 0 }),
  propagate: () => ({ position: { x: 1, y: 2, z: 3 } }),
  gstime: () => 0.5,
  eciToGeodetic: () => ({ latitude: 0.4, longitude: 1.2, height: 420 }),
  degreesLat: x => x * 180 / Math.PI,
  degreesLong: x => x * 180 / Math.PI
};
fakeWindow.satellite = lib;
const geodetic = h.currentGeo({ id: 'test', satrec: { error: 0 }, propagationError: null }, new Date('2026-10-25T00:00:00Z'));
assert.ok(geodetic);
eq(geodetic.lat, 0.4 * 180 / Math.PI); eq(geodetic.lon, 1.2 * 180 / Math.PI); eq(geodetic.altKm, 420);

console.log('Earth Traffic 3D monitor tests: 25 assertions PASS');
