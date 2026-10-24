const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'space-environment.js'), 'utf8');
const fakeWindow = {};
const fakeDocument = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
vm.runInNewContext(source, { window: fakeWindow, document: fakeDocument, console, Date, Math, Number, String, Object, Array, Promise, Set, Map, URL, Intl, performance: { now: () => 0 }, setTimeout, clearTimeout, requestAnimationFrame() { return 1; }, fetch() { throw new Error('Network should not run in unit test'); } }, { filename: 'space-environment.js' });
const math = fakeWindow.TERRAVEXSpaceMath;
assert.ok(math, 'Space science math helpers exported');
assert.equal(math.dobsonThicknessMm(300), 3, '300 DU equals 3 mm compressed ozone equivalent');
assert.equal(math.dobsonThicknessMm(220), 2.2, '220 DU conversion');
assert.equal(math.dobsonThicknessMm(500), 5, '500 DU conversion');
assert.ok(Number.isNaN(math.dobsonThicknessMm(-1)), 'Negative DU rejected');
assert.ok(Number.isNaN(math.dobsonThicknessMm(801)), 'Out-of-range DU rejected');
const feed = { near_earth_objects: { '2026-10-24': [
  {id:'2', name:'Object B', is_potentially_hazardous_asteroid:true, estimated_diameter:{meters:{estimated_diameter_min:10,estimated_diameter_max:20}}, close_approach_data:[{close_approach_date:'2026-10-24', miss_distance:{kilometers:'900000'}, relative_velocity:{kilometers_per_hour:'25000'}}]},
  {id:'1', name:'Object A', is_potentially_hazardous_asteroid:false, estimated_diameter:{meters:{estimated_diameter_min:2,estimated_diameter_max:4}}, close_approach_data:[{close_approach_date:'2026-10-24', miss_distance:{kilometers:'300000'}, relative_velocity:{kilometers_per_hour:'10000'}}]}
]}};
const objects = math.normalizeNeoFeed(feed);
assert.equal(objects.length, 2, 'NEO feed records normalized');
assert.equal(objects[0].name, 'Object A', 'Records sorted by miss distance');
assert.equal(objects[1].hazardous, true, 'NASA hazardous flag preserved');
assert.equal(objects[0].missKm, 300000, 'Miss distance parsed in km');
assert.equal(math.normalizeNeoFeed({}).length, 0, 'Malformed feed produces an empty list, not invented objects');
console.log('Space environment tests: 11 assertions passed.');
