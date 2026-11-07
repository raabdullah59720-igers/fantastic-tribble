'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(new URL('./architecture-form-studio.js',`file://${__filename}`),'utf8');
const sandbox={window:{TERRAVEX_CIVIL_ENGINEERING:{getState:()=>({result:{loads:{totalServiceKN:12345,totalUltimateKN:18000,serviceInteriorColumnKN:245},concrete:{totalWetM3:420},reinforcement:{totalKg:12500}}})},TERRAVEX_ENGINEERING_STUDIO:{getSatelliteContext:()=>({status:'SITE CONTEXT AVAILABLE'})}},Math,Number,String,Array,JSON,Error};
vm.runInNewContext(source,sandbox,{filename:'architecture-form-studio.js'});
const api=sandbox.window.TERRAVEX_ARCHITECTURE_FORM;
assert.ok(api && typeof api.analyze==='function');
const model={
  plotArea:10000,footprint:4200,coverage:42,height:25.2,floors:8,shape:'rectangle',
  profile:{aspect:1.3,label:'Residential building'},buildingUse:'residential'
};
const balanced=api.analyze(model,6,'balanced');
assert.equal(balanced.candidates.length,6);
assert.equal(balanced.structuralSafety,'NOT ASSESSED');
assert.equal(balanced.engineeringContext.serviceGravityKN,12345);
assert.equal(balanced.engineeringContext.factoredScenarioKN,18000);
assert.equal(balanced.engineeringContext.concreteWetM3,420);
assert.equal(balanced.engineeringContext.rebarKg,12500);
assert.equal(balanced.siteEvidence.status,'SITE CONTEXT AVAILABLE');
assert.ok(balanced.assumptions.some(a=>a.includes('does not become a member-level structural response')));
assert.ok(Math.abs(balanced.candidates.reduce((s,c)=>s+c.area,0)/6-10000)<1e-8);
assert.ok(balanced.candidates.every(c=>Number.isFinite(c.score)&&c.score>=0&&c.score<=100));
assert.ok(balanced.candidates.every(c=>c.perimeter>0&&c.facadeArea>0&&c.compactness>0&&c.compactness<=100));
assert.ok(Math.abs(balanced.candidates.find(c=>c.id==='circle').compactness-100)<1e-8);
assert.ok(balanced.candidates.find(c=>c.id==='square').compactness<100);
for(const c of balanced.candidates){assert.ok(Math.abs(c.weights.compact+c.weights.grid+c.weights.simple+c.weights.symmetry-1)<1e-10);}
const zeroGrid=api.analyze(model,0,'grid');
assert.ok(zeroGrid.candidates.every(c=>Math.abs(c.gridFit-100)<1e-9));
const exactGrid=api.analyze({...model,plotArea:3600},6,'grid');
assert.ok(exactGrid.candidates.find(c=>c.id==='square').gridFit>99.9);
const compact=api.analyze(model,6,'compact');
assert.equal(compact.priority,'compact');
assert.notDeepEqual(balanced.weights,compact.weights);
const facade=api.analyze(model,6,'facade');
assert.equal(facade.priority,'facade');
assert.throws(()=>api.analyze({...model,plotArea:0},6,'balanced'),/valid latest Design Studio model/);
assert.throws(()=>api.analyze(model,-1,'balanced'),/Grid module/);
assert.equal(api.shapes.length,6);
assert.deepEqual(['technical','architectural','standard','monospaced'],Object.keys(api.styles));
assert.equal(api.styles.technical.cadFont,'simplex.shx');
assert.equal(api.styles.architectural.cadFont,'romans.shx');
assert.equal(api.styles.standard.cadFont,'txt.shx');
assert.equal(api.styles.monospaced.cadFont,'txt.shx');
console.log('TERRAVEX v48 Architecture & Typography: 38 assertions PASS');
