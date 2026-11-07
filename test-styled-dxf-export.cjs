'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const style={id:'ARCH_ROMAN',label:'Architectural Roman',canvasFamily:'Georgia, serif',cssFamily:'Georgia, serif',cadFont:'romans.shx'};
const window={TERRAVEX_ARCHITECTURE_FORM:{getTypography:()=>style}};
const document={readyState:'loading',getElementById:()=>null,addEventListener:()=>{}};
const sandbox={window,document,console,Math,Number,String,Array,Object,JSON,Date,Set,Map,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw new Error('not used');}};
const adv=fs.readFileSync(new URL('./advanced-workbench.js',`file://${__filename}`),'utf8');
vm.runInNewContext(adv,sandbox,{filename:'advanced-workbench.js'});
const studio=window.TERRAVEX_ENGINEERING_STUDIO;
assert.ok(studio&&typeof studio.buildPlanDxf==='function'&&typeof studio.buildDxf==='function');
const model=studio.calculateScenario({shape:'octagon',lengthUnit:'m',areaUnit:'m2',dimA:30,dimB:0,floors:8,floorHeight:3.2,coverage:42,farLimit:'',coverageLimit:'',heightLimit:'',glazingRatio:30,waste:7,buildingUse:'residential',projectTitle:'TERRAVEX TEST',layoutStyle:'central-core',latitude:'',longitude:''});
const plan=studio.buildPlanDxf(model),mass=studio.buildDxf(model);
for(const d of [plan,mass]){assert.match(d,/\nAC1009\n/);assert.match(d,/\nARCH_ROMAN\n/);assert.match(d,/\nromans\.shx\n/);assert.match(d,/\n7\nARCH_ROMAN\n/);}
fs.writeFileSync('/tmp/TERRAVEX-v48-plan.dxf',plan);
fs.writeFileSync('/tmp/TERRAVEX-v48-massing.dxf',mass);

const eng=fs.readFileSync(new URL('./engineering-depth-system.js',`file://${__filename}`),'utf8');
vm.runInNewContext(eng,sandbox,{filename:'engineering-depth-system.js'});
const civil=window.TERRAVEX_CIVIL_ENGINEERING;
assert.ok(civil&&typeof civil.analyze==='function'&&typeof civil.buildSheetDxf==='function');
const inp={floors:2,floorAreaM2:100,deadLoadKNm2:4,liveLoadKNm2:2,deadFactor:1.2,liveFactor:1.6,gridX:6,gridY:6,slabAreaM2:100,slabThicknessM:.15,beamLengthM:20,beamWidthM:.25,beamDepthM:.45,columnCount:4,columnWidthM:.3,columnDepthM:.3,columnStoreys:2,columnStoreyHeightM:3,footingCount:4,footingLengthM:1.5,footingWidthM:1.5,footingThicknessM:.4,pileCount:0,pileDiameterM:.6,pileLengthM:18,dryFactor:1.54,cementRatio:1,sandRatio:1.5,aggregateRatio:3,cementDensity:1440,bagMassKg:50,waterCementRatio:.5,wallLengthM:10,wallHeightM:3,wallThicknessM:.115,openingsAreaM2:1,brickLengthM:.24,brickHeightM:.07,brickWidthM:.115,mortarJointM:.01,allowableBearingKPa:'',pileCapacityKN:'',bars:[]};
const result=civil.analyze(inp),sheet=civil.buildSheetDxf(result);
assert.match(sheet,/\nAC1009\n/);assert.match(sheet,/\nARCH_ROMAN\n/);assert.match(sheet,/\nromans\.shx\n/);assert.match(sheet,/\n7\nARCH_ROMAN\n/);
fs.writeFileSync('/tmp/TERRAVEX-v48-summary.dxf',sheet);
console.log('TERRAVEX v48 R12 CAD typography: 20 assertions PASS; plan, massing and A3 summary written for parser validation');
