/* TERRAVEX APEX v54 · shared, on-demand external engine loader
 * Version-pinned library loading is isolated from app boot. A map/3D/orbit engine
 * is downloaded only when its dependent panel is opened or the user runs Probe.
 * CDN library status, WebGL capability and data-provider reachability are separate.
 */
(()=>{'use strict';
  const VERSION=Object.freeze({leaflet:'1.9.4',cesium:'1.147.0',satellite:'7.1.0',three:'0.187.0'});
  const state=Object.fromEntries(Object.keys(VERSION).map(k=>[k,{status:'NOT LOADED',source:'',actualVersion:'',error:'',warning:'',promise:null,loadedAt:null}]));
  const cssPromises=new Map();
  const timeoutMs=12000;
  const engineGlobal={leaflet:'L',cesium:'Cesium',satellite:'satellite',three:'THREE'};
  const apiReady={
    leaflet:()=>!!(window.L?.map&&window.L?.tileLayer),
    cesium:()=>!!window.Cesium?.Viewer,
    satellite:()=>!!(window.satellite?.json2satrec&&window.satellite?.propagate&&window.satellite?.eciToGeodetic&&window.satellite?.gstime),
    three:()=>!!(window.THREE?.WebGLRenderer&&window.THREE?.Scene&&window.THREE?.Vector3)
  };
  const set=(key,status,source='',error='',warning='',actualVersion='')=>{
    Object.assign(state[key],{status,source,error,warning,actualVersion:actualVersion||state[key].actualVersion,loadedAt:status==='READY'?new Date().toISOString():state[key].loadedAt});
    render();
  };
  function withTimeout(promise,label,ms=timeoutMs){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label+' timed out after '+ms+' ms')),ms)})]).finally(()=>clearTimeout(timer));}
  function addCss(href,key){
    if(cssPromises.has(key))return cssPromises.get(key);
    const existing=document.querySelector('link[data-tvx-engine-css="'+key+'"]');
    if(existing?.dataset?.tvxCssStatus==='loaded')return Promise.resolve(true);
    if(existing)existing.remove();
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.tvxEngineCss=key;
    const promise=new Promise(resolve=>{
      let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);link.dataset.tvxCssStatus=ok?'loaded':'failed';if(!ok)link.remove();if(!ok)cssPromises.delete(key);resolve(ok)};
      const timer=setTimeout(()=>finish(false),timeoutMs);
      link.onload=()=>finish(true);link.onerror=()=>finish(false);document.head.appendChild(link);
    });
    cssPromises.set(key,promise);return promise;
  }
  async function addCssFallback(primary,secondary,key){if(await addCss(primary,key))return true;return addCss(secondary,key);}
  function script(src,check){return new Promise((resolve,reject)=>{
    if(check())return resolve(true);
    const safe=window.CSS?.escape?CSS.escape(src):src.replace(/["\\]/g,'\\$&');
    const existing=document.querySelector('script[data-tvx-engine-src="'+safe+'"]');
    if(existing){let elapsed=0;const poll=setInterval(()=>{if(check()){clearInterval(poll);clearTimeout(timer);resolve(true)}else if((elapsed+=100)>=timeoutMs){clearInterval(poll);clearTimeout(timer);reject(new Error('Timed out waiting for '+src))}},100);const timer=setTimeout(()=>{clearInterval(poll);reject(new Error('Timed out waiting for '+src))},timeoutMs);return;}
    const el=document.createElement('script');el.src=src;el.async=true;el.crossOrigin='anonymous';el.dataset.tvxEngineSrc=src;
    let settled=false;const finish=err=>{if(settled)return;settled=true;clearTimeout(timer);el.onload=el.onerror=null;if(err){el.remove();reject(err)}else resolve(true)};
    const timer=setTimeout(()=>finish(new Error('Script timeout: '+src)),timeoutMs);
    el.onload=()=>check()?finish():finish(new Error('Script loaded but expected API was not exposed: '+src));
    el.onerror=()=>finish(new Error('Script network/CSP failure: '+src));document.head.appendChild(el);
  });}
  async function sequential(candidates,check){let last;for(const src of candidates){try{await script(src,check);if(check())return src}catch(e){last=e}}throw last||new Error('No compatible script source succeeded')}
  function shared(key,work){if(state[key].promise)return state[key].promise;state[key].status='LOADING';state[key].error='';state[key].warning='';render();state[key].promise=(async()=>{try{const result=await work();const source=typeof result==='string'?result:result?.source||'already present';const warning=typeof result==='object'&&result?.warning?result.warning:'';const actualVersion=typeof result==='object'&&result?.version?result.version:VERSION[key];set(key,'READY',source,'',warning,actualVersion);return window[engineGlobal[key]]}catch(e){set(key,'UNAVAILABLE','',String(e?.message||e));throw e}finally{state[key].promise=null}})();return state[key].promise}
  function normalizeSatellite(mod){const x=mod?.default&&typeof mod.default==='object'?Object.assign({},mod.default,mod):mod;const names=['json2satrec','propagate','gstime','eciToGeodetic','eciToEcf','ecfToLookAngles','degreesLat','degreesLong','degreesToRadians'];for(const n of names)if(typeof x?.[n]!=='function'&&typeof mod?.[n]==='function')x[n]=mod[n];return x}
  async function loadLeaflet(){if(apiReady.leaflet()){if(state.leaflet.status!=='READY')set('leaflet','READY','pre-existing browser API');return window.L}return shared('leaflet',async()=>{const cssOK=await addCssFallback('https://cdn.jsdelivr.net/npm/leaflet@'+VERSION.leaflet+'/dist/leaflet.css','https://unpkg.com/leaflet@'+VERSION.leaflet+'/dist/leaflet.css','leaflet');const source=await sequential(['https://cdn.jsdelivr.net/npm/leaflet@'+VERSION.leaflet+'/dist/leaflet.js','https://unpkg.com/leaflet@'+VERSION.leaflet+'/dist/leaflet.js'],apiReady.leaflet);return {source,warning:cssOK?'':'Leaflet JavaScript ready; stylesheet could not be fetched'}})}
  async function loadCesium(){if(apiReady.cesium()){if(state.cesium.status!=='READY')set('cesium','READY','pre-existing browser API','','','unknown pre-existing version');return window.Cesium}return shared('cesium',async()=>{const candidates=[
      {version:'1.147.0',base:'https://cdnjs.cloudflare.com/ajax/libs/cesium/1.147.0/'},
      {version:'1.146.0',base:'https://cdn.jsdelivr.net/npm/cesium@1.146.0/Build/Cesium/'},
      {version:'1.146.0',base:'https://unpkg.com/cesium@1.146.0/Build/Cesium/'}
    ];let last;for(const item of candidates){const base=item.base;window.CESIUM_BASE_URL=base;const cssOK=await addCss(base+'Widgets/widgets.css','cesium-'+item.version);try{const source=await sequential([base+'Cesium.js'],apiReady.cesium);return {source,version:item.version,warning:(cssOK?'':'CesiumJS ready; widget stylesheet could not be fetched')+(item.version!==VERSION.cesium?' · compatibility fallback '+item.version:'')}}catch(e){last=e}}throw last||new Error('CesiumJS Viewer API unavailable')})}
  async function importFirst(urls,validate){let last;for(const url of urls){try{const mod=await withTimeout(import(url),'Module import '+url);const value=validate(mod);if(value)return {value,source:url};throw new Error('Module loaded but required API is missing: '+url)}catch(e){last=e}}throw last||new Error('No ESM source succeeded')}
  async function loadSatellite(){if(apiReady.satellite()){if(state.satellite.status!=='READY')set('satellite','READY','pre-existing browser API');return window.satellite}return shared('satellite',async()=>{try{const r=await importFirst(['https://cdn.jsdelivr.net/npm/satellite.js@'+VERSION.satellite+'/+esm','https://esm.sh/satellite.js@'+VERSION.satellite],mod=>{const x=normalizeSatellite(mod);return x?.json2satrec&&x?.propagate&&x?.eciToGeodetic&&x?.gstime?x:null});window.satellite=r.value;return r.source}catch(esmError){try{const source=await sequential(['https://cdn.jsdelivr.net/npm/satellite.js@6.0.2/dist/satellite.min.js','https://unpkg.com/satellite.js@6.0.2/dist/satellite.min.js'],apiReady.satellite);return {source,warning:'Using satellite.js 6.0.2 compatibility build after 7.1.0 ESM failed'}}catch(umdError){throw new Error('satellite.js ESM and compatibility fallback failed. ESM: '+esmError.message+'; fallback: '+umdError.message)}}})}
  async function loadThree(){if(apiReady.three()){if(state.three.status!=='READY')set('three','READY','pre-existing browser API');return window.THREE}return shared('three',async()=>{try{const r=await importFirst(['https://cdn.jsdelivr.net/npm/three@'+VERSION.three+'/build/three.module.js','https://esm.sh/three@'+VERSION.three],mod=>{const x=mod?.default?.WebGLRenderer?mod.default:mod;return x?.WebGLRenderer&&x?.Scene&&x?.Vector3?x:null});window.THREE=r.value;return r.source}catch(esmError){try{const source=await sequential(['https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js','https://unpkg.com/three@0.160.0/build/three.min.js'],apiReady.three);return {source,warning:'Using Three.js r160 global compatibility build after r187 ESM failed'}}catch(umdError){throw new Error('Three.js ESM and legacy global fallback failed. ESM: '+esmError.message+'; fallback: '+umdError.message)}}})}
  function webglState(){try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');return g?'AVAILABLE':'UNAVAILABLE'}catch{return'UNAVAILABLE'}}
  function render(){const badge=document.getElementById('engineLibraryBadge'),host=document.getElementById('engineLibraryResults');if(!badge||!host)return;const values=Object.values(state),ready=values.filter(x=>x.status==='READY').length,failed=values.filter(x=>x.status==='UNAVAILABLE').length;badge.textContent=failed?'DEGRADED · '+ready+'/4 READY':ready?ready+'/4 READY':'ON-DEMAND';badge.className='badge '+(failed?'warn':ready===4?'live':'sim');host.replaceChildren();for(const [key,s] of Object.entries(state)){const row=document.createElement('div');row.className='tvx-engine-result';const left=document.createElement('div'),title=document.createElement('b'),meta=document.createElement('small'),right=document.createElement('span');title.textContent=key+' · '+(s.actualVersion||VERSION[key]);meta.textContent=s.status==='READY'?[s.source,s.warning].filter(Boolean).join(' · '):(s.error||'Not loaded');right.textContent=s.status==='READY'?'READY':s.status;right.className='badge '+(s.status==='READY'?'live':s.status==='UNAVAILABLE'?'warn':'sim');left.append(title,meta);row.append(left,right);host.append(row)}const webgl=document.createElement('p');webgl.className='tvx-engine-webgl';webgl.textContent='Browser WebGL: '+webglState()+'. Map tiles, imagery services, satellite feeds and CORS are separate network dependencies.';host.append(webgl)}
  async function probeAll(){const b=document.getElementById('engineLibraryProbe');if(b){b.disabled=true;b.textContent='Checking engine libraries…'}const tasks=[loadLeaflet,loadCesium,loadSatellite,loadThree];await Promise.allSettled(tasks.map(fn=>fn()));render();if(b){b.disabled=false;b.textContent='Recheck external engine libraries'}return getState()}
  function getState(){return Object.fromEntries(Object.entries(state).map(([k,v])=>[k,{version:VERSION[k],actualVersion:v.actualVersion||null,status:v.status,source:v.source,error:v.error,warning:v.warning,loadedAt:v.loadedAt}]))}
  window.TERRAVEX_LIBRARIES={versions:VERSION,loadLeaflet,loadCesium,loadSatellite,loadThree,probeAll,getState};
  function bind(){const b=document.getElementById('engineLibraryProbe');if(b&&!b.dataset.tvxBound){b.dataset.tvxBound='1';b.addEventListener('click',()=>probeAll())}render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
