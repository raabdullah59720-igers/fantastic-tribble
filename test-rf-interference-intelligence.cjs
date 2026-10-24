const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ids={};
class El{constructor(id){this.id=id;this.value='';this.textContent='';this.className='';this.disabled=false;this.files=[];this.listeners={};this.style={};this.classList={contains:(x)=>id==='page-rfintel'&&x==='active'};this.width=1200;this.height=440;}
 addEventListener(n,f){(this.listeners[n] ||= []).push(f)} dispatch(n,e={}){for(const f of (this.listeners[n]||[]))f({target:this,...e})}
 getBoundingClientRect(){return {width:1000,height:366}}
 getContext(){return ctx}
}
const grad={addColorStop(){}};const ctx={clearRect(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},closePath(){},fillText(){},setLineDash(){},createLinearGradient(){return grad},measureText(s){return {width:String(s).length*6}}};
const defaults={rfiScenario:'clean',rfiBand:'2400',rfiSignal:'-70',rfiNoise:'-100',rfiBandwidth:'20000',rfiThreshold:'12',rfiSeverity:'35',rfiPause:'',rfiReset:'',rfiRunSim:'',rfiExport:'',rfiCsvFile:'',rfiUseSynthetic:'',rfiLogIncident:'',rfiStatus:'',rfiImportReadout:'',rfiSpectrumCanvas:'',rfiSignalMetric:'',rfiNoiseMetric:'',rfiSnrMetric:'',rfiSnrBig:'',rfiCapacity:'',rfiHealthScore:'',rfiScoreRing:'',rfiPeakCount:'',rfiChannelState:'',rfiDataState:'',rfiChartLabel:'',rfiTraceTime:''};
Object.keys(defaults).forEach(k=>{ids[k]=new El(k);ids[k].value=defaults[k]});
const listeners={};const document={visibilityState:'visible',getElementById:id=>ids[id]||(ids[id]=new El(id)),querySelector(sel){return new El('nav-rf')},addEventListener(n,f){(listeners[n] ||= []).push(f)}};
const window={devicePixelRatio:1,addEventListener(){}};const context={document,window,console,Math,Number,String,Date,JSON,Array,Object,Promise,Blob,URL:{createObjectURL(){return 'blob:test'},revokeObjectURL(){}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},Notification:undefined,sessionStorage:{getItem(){return '[]'},setItem(){}},FileReader:class{readAsText(){this.result='frequency_mhz,power_dbm\n2390,-101\n2400,-100\n2410,-80\n2420,-99';this.onload()}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','rf-interference-intelligence.js'),'utf8'),context);
assert.equal(ids.rfiSnrMetric.textContent,'30 dB','clean scenario SNR should be 30 dB');console.log('PASS 1: clean-channel model SNR is 30 dB');
ids.rfiScenario.value='broadband';ids.rfiSeverity.value='90';ids.rfiRunSim.dispatch('click');assert(Number.parseFloat(ids.rfiSnrMetric.textContent)<0,'severe broadband simulated interference should reduce SNR below 0 dB');console.log('PASS 2: stronger virtual broadband interference reduces modeled SNR');
ids.rfiPause.dispatch('click');assert.equal(ids.rfiPause.textContent,'Resume animation');ids.rfiReset.dispatch('click');assert.equal(ids.rfiSnrMetric.textContent,'30 dB','reset restores default model');console.log('PASS 3: pause and reset controls work');
ids.rfiCsvFile.files=[{size:100,name:'sample.csv'}];ids.rfiCsvFile.dispatch('change');assert.equal(ids.rfiDataState.textContent,'IMPORTED DATA');assert(ids.rfiImportReadout.textContent.includes('Measured CSV: 4 samples'));assert.equal(ids.rfiPeakCount.textContent,'1','single peak is detected in a four-sample CSV');console.log('PASS 4: local CSV import and peak candidate count work');
ids.rfiScenario.value='clean';ids.rfiBandwidth.value='0';ids.rfiRunSim.dispatch('click');assert(ids.rfiStatus.textContent.includes('Invalid bandwidth'));console.log('PASS 5: invalid bandwidth is blocked');
console.log('RF PANEL FUNCTIONAL TESTS: 5/5 PASS');
