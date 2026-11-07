'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(new URL('./engineering-depth-system.js', `file://${__filename}`), 'utf8');
const elements = {
  tvxSiteLat: { value: '23.7806' }, tvxSiteLon: { value: '90.2794' },
  tvxSiteStatus: {}, tvxSiteSourceLat: {}, tvxSiteElevation: {}, tvxSiteSentinel: {}, tvxSiteSoil: {}
};
const sandbox = {
  window: { TERRAVEX_ENGINEERING_STUDIO: { getLatest: () => ({ mock: true }), getPlanLayout: () => ({ minX: 0, minY: 0, maxX: 10, maxY: 8, plotW: 10, plotH: 8, sitePoints: [[0,0],[10,0],[10,8],[0,8]], footprintPoints: [[2,2],[8,2],[8,6],[2,6]], zones: [{ points: [[2,2],[5,2],[5,6],[2,6]] }] }) } },
  document: { readyState: 'complete', getElementById: id => elements[id] || null, addEventListener() {} },
  console, Date, Math, Number, String, Array, JSON, AbortController,
  setTimeout, clearTimeout,
  fetch: async () => { throw new Error('Mock not installed'); }
};
vm.runInNewContext(source, sandbox, { filename: 'engineering-depth-system.js' });
const api = sandbox.window.TERRAVEX_CIVIL_ENGINEERING;
assert.ok(api && typeof api.analyze === 'function');

const base = {
  floors: 8, floorAreaM2: 720, deadLoadKNm2: 5, liveLoadKNm2: 2,
  deadFactor: 1.2, liveFactor: 1.6, gridX: 6, gridY: 6,
  slabAreaM2: 100, slabThicknessM: 0.15,
  beamLengthM: 100, beamWidthM: 0.25, beamDepthM: 0.45,
  columnCount: 12, columnWidthM: 0.4, columnDepthM: 0.4,
  columnStoreys: 8, columnStoreyHeightM: 3,
  footingCount: 4, footingLengthM: 2, footingWidthM: 2, footingThicknessM: 0.5,
  pileCount: 4, pileDiameterM: 0.6, pileLengthM: 18,
  dryFactor: 1.54, cementRatio: 1, sandRatio: 1.5, aggregateRatio: 3,
  cementDensity: 1440, bagMassKg: 50, waterCementRatio: 0.5,
  wallLengthM: 10, wallHeightM: 3, wallThicknessM: 0.115, openingsAreaM2: 1,
  brickLengthM: 0.24, brickHeightM: 0.07, brickWidthM: 0.115, mortarJointM: 0.01,
  allowableBearingKPa: '', pileCapacityKN: '',
  bars: [{ mark: 'B16', dia: 16, count: 10, length: 6, shape: 'Straight' }]
};
const r = api.analyze(base);
assert.equal(r.loads.totalServiceKN, 40320);
assert.ok(Math.abs(r.loads.totalUltimateKN - 52992) < 1e-8);
assert.equal(r.loads.tributaryAreaM2, 36);
assert.equal(r.loads.serviceInteriorColumnKN, 2016);
assert.equal(r.concrete.components.slab, 15);
assert.equal(r.concrete.components.beam, 11.25);
assert.ok(Math.abs(r.concrete.components.column - 46.08) < 1e-9);
assert.equal(r.concrete.components.footing, 8);
assert.ok(Math.abs(r.concrete.components.pile - (Math.PI * 0.3 * 0.3 * 18 * 4)) < 1e-9);
assert.ok(r.concrete.totalWetM3 > 100);
assert.ok(r.concrete.waterLitres > 0 && r.concrete.waterLitres < 50000);
assert.ok(Math.abs(r.reinforcement.totalKg - (10 * 6 * 16 * 16 / 162)) < 1e-9);
assert.equal(r.foundation.allowableBearingKPa, null);
assert.equal(r.foundation.bearingStatus, 'NOT CHECKED');
assert.equal(r.foundation.pileRequiredForOneInteriorTributaryLoad, null);

// One cubic metre nominal mix arithmetic: dry volume 1.54, ratio 1:1.5:3,
// cement bulk density 1440 kg/m³, w/c = 0.50 => approximately 201.6 L.
const oneM3 = api.analyze({
  ...base, floors: 1, floorAreaM2: 1, deadLoadKNm2: 1, liveLoadKNm2: 0,
  slabAreaM2: 1, slabThicknessM: 1, beamLengthM: 0, columnCount: 0,
  columnStoreys: 0, columnStoreyHeightM: 3, footingCount: 0, pileCount: 0,
  wallLengthM: 0, bars: []
});
assert.ok(Math.abs(oneM3.concrete.cementKg - 403.2) < 1e-9);
assert.ok(Math.abs(oneM3.concrete.waterLitres - 201.6) < 1e-9);

const withGeo = api.analyze({ ...base, allowableBearingKPa: 150, pileCapacityKN: 500 });
assert.equal(withGeo.foundation.bearingDemandKPa, 504);
assert.equal(withGeo.foundation.bearingStatus, 'EXCEEDS ENTERED LIMIT');
assert.equal(withGeo.foundation.pileRequiredForOneInteriorTributaryLoad, 5);

const noFoot = api.analyze({ ...base, footingLengthM: 0, allowableBearingKPa: 150 });
assert.equal(noFoot.foundation.bearingDemandKPa, null);
assert.equal(noFoot.foundation.bearingStatus, 'NOT CHECKED - FOOTING GEOMETRY MISSING');

const noLoad = api.analyze({ ...base, deadLoadKNm2: 0, liveLoadKNm2: 0, allowableBearingKPa: 150, pileCapacityKN: 500 });
assert.equal(noLoad.foundation.bearingDemandKPa, null);
assert.equal(noLoad.foundation.pileRequiredForOneInteriorTributaryLoad, null);

assert.throws(() => api.analyze({ ...base, floors: 0 }), /Storeys/);
assert.throws(() => api.analyze({ ...base, waterCementRatio: 1.5 }), /Water-cement ratio/);
assert.throws(() => api.analyze({ ...base, cementRatio: 0, sandRatio: 0, aggregateRatio: 0 }), /mix ratio sum/);
assert.throws(() => api.analyze({ ...base, allowableBearingKPa: 0 }), /Allowable bearing pressure/);

const dxf = api.buildSheetDxf(r);
assert.ok(dxf.startsWith('0\nSECTION\n2\nHEADER'));
assert.ok(dxf.includes('1\nAC1009\n'));
assert.ok(dxf.includes('A3 LANDSCAPE / SHEET UNITS mm / MODEL-SPACE DRAWING'));
assert.ok(dxf.includes('SCHEMATIC FLOOR PLAN / AUTO-FIT TO VIEWPORT'));
assert.ok(dxf.includes('FOOTPRINT'));
assert.ok(dxf.includes('SITE'));
if (process.env.DXF_TEST_OUT) fs.writeFileSync(process.env.DXF_TEST_OUT, dxf, 'ascii');
assert.ok(dxf.includes('A3 LANDSCAPE / SHEET UNITS mm / MODEL-SPACE DRAWING'));
assert.ok(dxf.endsWith('0\nENDSEC\n0\nEOF\n'));

(async () => {
  let fetchCount = 0;
  sandbox.fetch = async (url, options = {}) => {
    fetchCount++;
    let payload;
    if (String(url).includes('api.open-meteo.com')) payload = { elevation: [13.2] };
    else if (String(url).includes('stac.dataspace.copernicus.eu')) payload = { features: [{ properties: { datetime: '2026-10-15T00:00:00Z', 'eo:cloud_cover': 10 } }] };
    else throw new Error('Unexpected mock endpoint ' + url);
    return { ok: true, status: 200, json: async () => payload };
  };
  await api.runSiteIntelligence();
  const site = api.getState();
  assert.equal(fetchCount, 2);
  assert.equal(site.site.lat, 23.7806);
  assert.equal(site.remote.elevation.value, 13.2);
  assert.equal(site.remote.sentinel.count, 1);
  assert.ok(String(site.remote.soil.status).includes('paused'));
  assert.ok(String(elements.tvxSiteStatus.textContent).includes('SOURCE CHECK COMPLETE'));
  console.log('TERRAVEX v47 Engineering Companion: 32 assertions PASS');
})().catch(e => { console.error(e); process.exitCode = 1; });
console.log(`Loads: service=${r.loads.totalServiceKN} kN; factored scenario=${r.loads.totalUltimateKN} kN; interior tributary=${r.loads.serviceInteriorColumnKN} kN`);
console.log(`Quantities: concrete=${r.concrete.totalWetM3.toFixed(3)} m3; cement-water example=${oneM3.concrete.cementKg.toFixed(1)} kg / ${oneM3.concrete.waterLitres.toFixed(1)} L; B16 mass=${r.reinforcement.totalKg.toFixed(3)} kg`);
