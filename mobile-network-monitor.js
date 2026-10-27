/* Bangladesh Mobile Network Monitor: read-only telemetry only. No RF transmitter API or tower-control commands. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ids = ['mnmPower','mnmPowerText','mnmTopline','mnmEngineState','mnmEngineSub','mnmTick','mnmSourceBadge','mnmSourceState','mnmSourceAge','mnmEndpoint','mnmConnectFeed','mnmDemoMode','mnmFeedMessage','mnmNetworkRows','mnmLog','mnmLogCount','mnmClearLog','mnmFlowPath','mnmFlowBadge','mnmRefreshOnce'];
  const els = Object.fromEntries(ids.map(id => [id, $(id)]));
  if (!els.mnmPower || !els.mnmNetworkRows) return;
  const BTRC_TOWER_SNAPSHOT = {
    publishedMonth: 'April 2026',
    total: 46286,
    rows: [
      {name:'Grameenphone (GP)', count:11788, kind:'Mobile network operator'},
      {name:'Robi', count:2191, kind:'Mobile network operator'},
      {name:'Banglalink', count:3915, kind:'Mobile network operator'},
      {name:'Teletalk', count:3457, kind:'Mobile network operator'},
      {name:'edotco', count:16941, kind:'Tower-sharing operator'},
      {name:'Summit', count:5432, kind:'Tower-sharing operator'},
      {name:'Kirtonkhola', count:1110, kind:'Tower-sharing operator'},
      {name:'Frontier', count:939, kind:'Tower-sharing operator'},
      {name:'BTCL', count:514, kind:'BTCL (BTRC table category)'}
    ]
  };
  const state = { on:false, source:'demo', endpoint:'', timer:null, controller:null, busy:false, tick:0, links:[], updatedAt:null, sourceTimestamp:null, sourceName:'No feed configured', lastError:'', log:[] };
  const fmt = (n,d=1) => Number.isFinite(n) ? n.toLocaleString(undefined,{maximumFractionDigits:d}) : '—';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localTime = ms => ms ? new Date(ms).toLocaleTimeString('en-GB',{timeZone:'Asia/Dhaka'}) : '—';
  function addLog(message){state.log.unshift({at:Date.now(),message});state.log=state.log.slice(0,80);renderLog();}
  function renderLog(){els.mnmLog.innerHTML=state.log.map(item=>`<div class="mnm-log-item"><time>${esc(localTime(item.at))}</time><span>${esc(item.message)}</span></div>`).join('');els.mnmLogCount.textContent=`${state.log.length} records`;}
  function setMessage(message,kind=''){els.mnmFeedMessage.className=`mnm-message ${kind}`;els.mnmFeedMessage.textContent=message;}
  function demoLinks(){return [
    {operator:'Grameenphone', status:'SIMULATED', rssiDbm:-69.4, rsrpDbm:-96.3, sinrDb:18.1, latencyMs:32, availabilityPct:99.4, synthetic:true},
    {operator:'Robi', status:'SIMULATED', rssiDbm:-74.2, rsrpDbm:-101.8, sinrDb:13.7, latencyMs:39, availabilityPct:98.9, synthetic:true},
    {operator:'Banglalink', status:'SIMULATED', rssiDbm:-79.1, rsrpDbm:-106.5, sinrDb:9.6, latencyMs:47, availabilityPct:98.1, synthetic:true},
    {operator:'Teletalk', status:'SIMULATED', rssiDbm:-83.7, rsrpDbm:-111.2, sinrDb:6.2, latencyMs:56, availabilityPct:96.8, synthetic:true}
  ];}
  function validMetric(v,min,max){return v===undefined||v===null||v===''?null:(Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max?Number(v):null);}
  function normalizeFeed(data){
    if(!data||!Array.isArray(data.networks))throw new Error('Expected JSON with a networks[] array.');
    const links=data.networks.map(row=>{
      if(!row||typeof row.operator!=='string'||row.operator.trim().length<1||row.operator.length>80)throw new Error('Each network record needs an operator name.');
      const rssiDbm=validMetric(row.rssiDbm,-160,20),rsrpDbm=validMetric(row.rsrpDbm,-160,20),sinrDb=validMetric(row.sinrDb,-100,100),latencyMs=validMetric(row.latencyMs,0,600000),availabilityPct=validMetric(row.availabilityPct,0,100),towerCount=validMetric(row.towerCount,0,1000000);
      return {operator:row.operator.trim(),status:typeof row.status==='string'?row.status.slice(0,40):'REPORTED',rssiDbm,rsrpDbm,sinrDb,latencyMs,availabilityPct,towerCount,synthetic:false};
    }).slice(0,100);
    if(!links.length)throw new Error('Provider returned an empty networks[] array.');
    const parsed=Date.parse(data.timestamp||'');
    return {links,sourceName:typeof data.sourceName==='string'?data.sourceName.slice(0,80):'Authorized provider feed',sourceTimestamp:Number.isFinite(parsed)?parsed:null};
  }
  function renderNetworks(){
    const labels = state.source==='demo' ? 'SIMULATION' : state.lastError ? 'STALE / ERROR' : 'PROVIDER FEED';
    els.mnmNetworkRows.innerHTML=state.links.length?state.links.map(n=>`<div class="mnm-network-row"><div><b>${esc(n.operator)}</b><small>${esc(n.status)} · <span class="mnm-source ${n.synthetic?'':'live'}">${n.synthetic?'SIMULATED':'SOURCE-FED'}</span></small></div><div><span class="mnm-label">RSRP</span><span class="mnm-value">${n.rsrpDbm===null?'—':fmt(n.rsrpDbm,1)+' dBm'}</span></div><div><span class="mnm-label">SINR</span><span class="mnm-value">${n.sinrDb===null?'—':fmt(n.sinrDb,1)+' dB'}</span></div><div><span class="mnm-label">LATENCY</span><span class="mnm-value">${n.latencyMs===null?'—':fmt(n.latencyMs,0)+' ms'}</span></div></div>`).join(''):'<div class="mnm-message">No signal-quality measurements available. A provider-authorized feed is required. Network inventory does not imply live signal telemetry.</div>';
    els.mnmSourceBadge.textContent=labels;
  }
  function render(){
    els.mnmPower.classList.toggle('is-on',state.on);els.mnmPower.setAttribute('aria-checked',String(state.on));els.mnmPowerText.textContent=state.on?'ON':'OFF';els.mnmTopline.classList.toggle('is-on',state.on);
    els.mnmEngineState.textContent=state.on?'MONITOR ENGINE ON':'MONITOR ENGINE OFF';els.mnmEngineSub.textContent=state.on?'1 Hz local processing · read-only feed polling only':'Heartbeat and provider polling stopped';
    els.mnmTick.textContent=state.on?`Tick #${state.tick} · ${localTime(Date.now())}`:`Stopped at tick #${state.tick}`;
    els.mnmSourceState.textContent=state.source==='demo'?'SIMULATION':state.lastError?'FEED ERROR':'SOURCE FED';
    const timestamp=state.sourceTimestamp||state.updatedAt;els.mnmSourceAge.textContent=state.source==='demo'?'Synthetic sample metrics only · not measured':timestamp?`Last report ${localTime(timestamp)}${Date.now()-timestamp>60000?' · STALE':''}`:'Waiting for first provider report';
    els.mnmFlowPath.classList.toggle('live',state.on);els.mnmFlowBadge.textContent=state.on?(state.source==='demo'?'ILLUSTRATIVE FLOW':'MONITOR ACTIVE'):'FLOW PAUSED';
    renderNetworks();
  }
  function safeEndpoint(raw){let url;try{url=new URL(raw.trim())}catch(_){throw new Error('Enter a valid HTTPS endpoint URL.')}if(url.protocol!=='https:')throw new Error('Only HTTPS endpoints are accepted.');if(url.username||url.password||url.search||url.hash)throw new Error('Do not place credentials, API keys, query tokens or fragments in this URL.');const host=url.hostname.toLowerCase();if(!host||host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal')||/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host))throw new Error('Private/local hosts are not accepted by this browser adapter.');if(url.port&&url.port!=='443')throw new Error('Use standard HTTPS port 443.');return url.href;}
  async function poll(){if(!state.on||state.source!=='live'||!state.endpoint||state.busy)return;state.busy=true;const controller=new AbortController();state.controller=controller;const timeout=setTimeout(()=>controller.abort(),7000);try{const response=await fetch(state.endpoint,{method:'GET',headers:{Accept:'application/json'},cache:'no-store',mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});if(!response.ok)throw new Error(`Provider returned HTTP ${response.status}.`);const data=await response.json();const feed=normalizeFeed(data);state.links=feed.links;state.sourceName=feed.sourceName;state.sourceTimestamp=feed.sourceTimestamp;state.updatedAt=Date.now();state.lastError='';setMessage(`Read-only feed received from ${feed.sourceName}. ${feed.links.length} network row(s). Provider must supply fresh, timestamped measurements. No RF transmit command is available in this panel.`,'good');addLog(`Read-only provider response received: ${feed.links.length} network records.`);}catch(error){if(!state.on)return;state.lastError=error?.name==='AbortError'?'Request timed out/cancelled':String(error?.message||error);setMessage(`No new provider data: ${state.lastError}. Check provider approval, HTTPS, CORS and schema. No simulated values have replaced a failed live feed.`,'bad');addLog(`Feed read failed: ${state.lastError}`);}finally{clearTimeout(timeout);state.controller=null;state.busy=false;render();}}
  function step(){if(!state.on)return;state.tick++;if(state.source==='demo'){state.links=demoLinks();state.updatedAt=Date.now();}else if(state.tick%10===0)poll();if(state.tick===1||state.tick%10===0)addLog(state.source==='demo'?'1 Hz monitor tick: synthetic sample refresh; RF output remains disabled.':'1 Hz monitor tick: last authorized measurements evaluated; read-only mode.');render();}
  function start(){if(state.timer)clearInterval(state.timer);state.timer=setInterval(step,1000);addLog(state.source==='demo'?'Monitor ON in labelled simulation mode; no tower connection or RF transmission.':'Monitor ON; read-only telemetry polling started.');render();if(state.source==='live')poll();}
  function stop(){if(state.timer)clearInterval(state.timer);state.timer=null;state.controller?.abort();state.controller=null;state.busy=false;addLog('Monitor OFF: local processing and provider polling stopped. No command was sent to any tower.');render();}
  els.mnmPower.addEventListener('click',()=>{state.on=!state.on;if(state.on)start();else stop();});
  els.mnmConnectFeed.addEventListener('click',()=>{let url;try{url=safeEndpoint(els.mnmEndpoint.value)}catch(error){setMessage(error.message,'bad');return;}state.endpoint=url;state.source='live';state.links=[];state.updatedAt=null;state.sourceTimestamp=null;state.sourceName='Approved provider feed';state.lastError='';setMessage(state.on?'Endpoint format accepted. Requesting read-only provider data. The endpoint must permit CORS and return networks[] JSON.':'Endpoint format accepted. Turn Monitor ON to begin polling. No request is sent while the monitor is OFF.','good');addLog('Configured a read-only HTTPS endpoint. No credentials stored by the app.');render();if(state.on)poll();});
  els.mnmDemoMode.addEventListener('click',()=>{state.controller?.abort();state.endpoint='';els.mnmEndpoint.value='';state.source='demo';state.links=state.on?demoLinks():[];state.updatedAt=Date.now();state.sourceTimestamp=null;state.sourceName='Local synthetic demo';state.lastError='';setMessage('Simulation mode enabled. Sample RSRP/SINR/latency values are synthetic and are not measurements from Bangladesh mobile towers. BTRC tower counts below are a separate published inventory snapshot.','');addLog('Returned to clearly labelled simulation mode.');render();});
  els.mnmRefreshOnce.addEventListener('click',()=>{if(!state.on){setMessage('Monitor is OFF. Turn it ON before refreshing provider telemetry.','bad');return;}if(state.source==='live')poll();else{state.links=demoLinks();state.updatedAt=Date.now();addLog('Synthetic demo measurements refreshed; not live carrier data.');render();}});
  els.mnmClearLog.addEventListener('click',()=>{state.log=[];renderLog();});
  window.TERRAVEX_MOBILE_NETWORK_MONITOR={getSnapshot:()=>({on:state.on,source:state.source,endpointConfigured:!!state.endpoint,tick:state.tick,networkRows:state.links.length,rfTransmitting:false,towerInventoryMonth:BTRC_TOWER_SNAPSHOT.publishedMonth,totalTowersReported:BTRC_TOWER_SNAPSHOT.total}),turnOff:()=>{if(state.on){state.on=false;stop();}}};
  state.links=demoLinks();state.updatedAt=Date.now();addLog('Panel ready. Demo sample readings are synthetic; real carrier telemetry is not configured. RF transmit capability is absent.');setMessage('Simulation mode: example readings only, not live tower measurements. Real data requires an authorized operator/aggregator read-only feed.','');render();
})();


/* ============================================================
   TERRAVEX APEX · Public Welfare Space Data Hub module
   Bundled after the mobile monitor in the same existing app-shell script.
   ============================================================ */
/* TERRAVEX APEX · Public Welfare Space Data Hub
 * One local, read-only aggregation layer for public orbital/catalogue and welfare feeds.
 * It does not open spacecraft command links, access private payloads, or transmit RF.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORE = {
    observations: 'terravex-pwh-satnogs-observations-v1',
    seenQuakes: 'terravex-pwh-seen-usgs-v1',
    seenSolar: 'terravex-pwh-seen-donki-v1',
    seenOrbitAlerts: 'terravex-pwh-orbit-alert-count-v1'
  };
  const SATNOGS_TTL = 15 * 60 * 1000;
  const ORBIT_TTL = 2 * 60 * 60 * 1000;
  const HEARTBEAT_MS = 1000;
  const SYNC_RECHECK_MS = 60 * 1000;
  const state = {
    initialized:false, active:false, running:false, busy:false, timer:null, heartbeat:null,
    canvasFrame:0, lastSyncAt:0, lastHeartbeatAt:0, lastOrbitAttemptAt:0,
    observations:[], observationsFetchedAt:0, observationError:'', primed:{quakes:false,solar:false,orbit:false},
    events:[], notificationsEnabled:false, lastResult:'', syncCount:0
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (n, d=0) => Number.isFinite(Number(n)) ? Number(n).toLocaleString(undefined,{maximumFractionDigits:d}) : '—';
  const stamp = n => Number.isFinite(Number(n)) && Number(n)>0 ? new Date(Number(n)).toLocaleString() : 'Not supplied';
  const shortStamp = n => Number.isFinite(Number(n)) && Number(n)>0 ? new Date(Number(n)).toLocaleTimeString('en-GB',{hour12:false}) : '—';
  const age = n => { const ms=Date.now()-Number(n); if(!Number.isFinite(ms)||ms<0)return 'unknown'; if(ms<60000)return Math.round(ms/1000)+' s'; if(ms<3600000)return Math.floor(ms/60000)+' min'; if(ms<86400000)return (ms/3600000).toFixed(1)+' h'; return (ms/86400000).toFixed(1)+' d'; };
  const numFromText = s => { const x=String(s||'').replace(/,/g,'').match(/\d+/); return x ? Number(x[0]) : null; };
  function safePublicUrl(value){try{const u=new URL(String(value||''),window.location?.href||'https://terravex.invalid/');return u.protocol==='https:'?u.href:'';}catch{return '';}}
  const inPage = () => !!$('page-publichub')?.classList.contains('active');
  function text(id, value){ const e=$(id); if(e) e.textContent=String(value ?? '—'); }
  function badge(id, value, kind=''){ const e=$(id); if(e){e.textContent=String(value);e.className='badge'+(kind?' '+kind:'');} }
  function sourcePill(id, value, kind=''){const e=$(id);if(e){e.textContent=String(value);e.className='pwh-state-pill'+(kind?' '+kind:'');}}
  function uiState(id, stateName, label){const e=$(id);if(e){e.dataset.state=stateName;text(e.id,label);}}
  function safeParseJSON(s, fallback){try{return JSON.parse(s)}catch{return fallback}}
  function storageGet(key, fallback=null){try{const v=localStorage.getItem(key);return v===null?fallback:safeParseJSON(v,fallback)}catch{return fallback}}
  function storageSet(key, value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
  function timeoutFetch(url, ms=12000){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);return fetch(url,{signal:c.signal,cache:'no-store',headers:{Accept:'application/json'}}).finally(()=>clearTimeout(t));}
  function orbitState(){try{return window.TERRAVEX_ORBIT_SENTINEL?.getState?.()||null}catch{return null}}
  function trafficState(){try{return window.TERRAVEX_EARTH_TRAFFIC?.getState?.()||null}catch{return null}}
  function spaceState(){try{return window.TERRAVEX_SPACE_ENVIRONMENT?.getState?.()||null}catch{return null}}
  function earthState(){try{return window.TERRAVEX_CORE_PUBLIC_FEEDS?.getState?.()||null}catch{return null}}

  function parseObservation(o){
    if(!o||typeof o!=='object')return null;
    const id=o.id??o.observation_id??o.uuid??'';
    const sat=o.satellite??o.satellite_name??o.sat_name??o.norad_cat_id??'Satellite observation';
    const start=o.start??o.start_time??o.created??o.updated??'';
    const status=o.status??o.observation_status??'public record';
    const detail=x=>typeof x==='object'&&x!==null?(x.name??x.value??x.norad_cat_id??'public record'):x;
    return {id:String(id||[detail(sat),start,status].join('|')),satellite:String(detail(sat)),start:String(start),status:String(detail(status)),link:String(o.url||o.observation_url||''),createdAt:Date.parse(start)||Date.parse(o.created||o.updated||'')||0};
  }
  function loadObservationCache(){
    const c=storageGet(STORE.observations,null);
    if(c&&Array.isArray(c.rows)&&Number.isFinite(Number(c.fetchedAt))){state.observations=c.rows;state.observationsFetchedAt=Number(c.fetchedAt);state.observationError='';return true;}return false;
  }
  async function refreshObservations(force=false){
    if(!force&&state.observationsFetchedAt&&Date.now()-state.observationsFetchedAt<SATNOGS_TTL)return {ok:true,cached:true,count:state.observations.length};
    // Cache first; avoid repeated requests to the public community service.
    const cached=storageGet(STORE.observations,null);
    if(!force&&cached&&Array.isArray(cached.rows)&&Date.now()-Number(cached.fetchedAt||0)<SATNOGS_TTL){state.observations=cached.rows;state.observationsFetchedAt=Number(cached.fetchedAt);state.observationError='';return {ok:true,cached:true,count:state.observations.length};}
    try{
      const res=await timeoutFetch('https://network.satnogs.org/api/observations/?limit=12&ordering=-start',14000);
      if(!res.ok)throw new Error('SatNOGS HTTP '+res.status);
      const raw=await res.json();const rows=Array.isArray(raw)?raw:(Array.isArray(raw?.results)?raw.results:null);
      if(!rows)throw new Error('Unexpected public observation response schema');
      const previous=new Set(state.observations.map(r=>String(r.id)));
      state.observations=rows.map(parseObservation).filter(Boolean);
      state.observationsFetchedAt=Date.now();state.observationError='';
      storageSet(STORE.observations,{rows:state.observations,fetchedAt:state.observationsFetchedAt});
      addEvent('OBSERVATION','SatNOGS public observation list updated',state.observations.length+' record(s) returned. This is crowdsourced observation metadata, not an open command link to satellites.','https://network.satnogs.org/');
      if(state.running&&state.notificationsEnabled&&state.primed.obs){const fresh=state.observations.find(r=>!previous.has(String(r.id)));if(fresh)notify('New public satellite observation',fresh.satellite+' · '+(fresh.start||'observation time not supplied'));}
      state.primed.obs=true;
      return {ok:true,cached:false,count:state.observations.length};
    }catch(e){state.observationError=String(e?.message||e);return {ok:false,error:state.observationError,count:state.observations.length};}
  }
  function addEvent(kind,title,detail,url=''){
    const key=[kind,title,detail].join('|');if(state.events.some(e=>e.key===key))return;
    state.events.unshift({key,kind,title,detail,url,time:Date.now()});state.events=state.events.slice(0,80);
  }
  function eventFromSource(kind,title,detail,url,time){
    return {key:[kind,title,detail,time].join('|'),kind,title,detail,url,time:Number(time)||0};
  }
  function buildEvents(){
    const rows=[];
    for(const o of state.observations.slice(0,6)) rows.push(eventFromSource('SATNOGS',o.satellite,'Public observation · '+(o.status||'status not supplied'),o.link||'https://network.satnogs.org/',o.createdAt));
    const sp=spaceState();
    for(const e of (sp?.solar?.events||[]).slice(0,6)) rows.push(eventFromSource('DONKI',e.label||e.type||'NASA space-weather event','Event time: '+(e.time||'not supplied'),e.link||'https://ccmc.gsfc.nasa.gov/tools/DONKI/',Date.parse(e.time)||e.fetchedAt||0));
    const core=earthState();
    for(const q of (core?.quakes||[]).slice(0,6)) rows.push(eventFromSource('USGS','M'+fmt(q.mag,1)+' · '+(q.place||'Earthquake event'),'Reported '+stamp(q.time),q.url||'https://earthquake.usgs.gov/earthquakes/feed/v1.0/',q.time));
    for(const n of (sp?.neo?.objects||[]).slice(0,3)) rows.push(eventFromSource('NEO',n.name||'Near-Earth object','NASA/JPL catalogue record · '+(n.date||sp.neo.sourceDate||'date not supplied'),n.nasaUrl||'https://cneos.jpl.nasa.gov/',Date.parse(n.date)||sp.neo.fetchedAt||0));
    return rows.sort((a,b)=>(b.time||0)-(a.time||0)).slice(0,18);
  }
  function currentSnapshot(){
    const orbit=orbitState(), traffic=trafficState(), spaces=spaceState(), earth=earthState();
    const orbitCount=Number(orbit?.objectCount)||Number(traffic?.satellites)||0;
    const satcat=numFromText($('osSatcatCount')?.textContent);
    const observationAvailable=state.observationsFetchedAt>0;
    const observationOk=observationAvailable&&!state.observationError&&Date.now()-state.observationsFetchedAt<SATNOGS_TTL;
    const solarOk=Number(spaces?.solar?.successes)>0;
    const neoOk=Number(spaces?.neo?.fetchedAt)>0&&!spaces?.neo?.error;
    const quakeAge=Number(earth?.quakeUpdated)?Date.now()-Number(earth.quakeUpdated):Infinity;
    const weatherAge=Number(earth?.weatherUpdated)?Date.now()-Number(earth.weatherUpdated):Infinity;
    const earthOk=quakeAge<15*60*1000&&weatherAge<45*60*1000;
    const earthStale=(Number(earth?.quakeUpdated)>0||Number(earth?.weatherUpdated)>0)&&!earthOk;
    const statuses={orbit:orbitCount>0,observations:observationOk,solar:solarOk,neo:neoOk,earth:earthOk};
    const okCount=Object.values(statuses).filter(Boolean).length;
    return {orbit,traffic,spaces,earth,orbitCount,satcat,observationAvailable,observationOk,solarOk,neoOk,earthOk,earthStale,statuses,okCount};
  }
  function updateFlow(id, good, warning, label){
    const el=$(id);if(!el)return;el.dataset.state=good?'good':warning?'warn':'waiting';const lab=el.querySelector('label');if(lab)lab.textContent=label;
  }
  function renderSources(){
    const s=currentSnapshot();
    text('pwhOrbitCount',s.orbitCount?fmt(s.orbitCount):'—');
    text('pwhSatcatCount',s.satcat?fmt(s.satcat):'—');
    text('pwhObservationCount',s.observationAvailable?fmt(state.observations.length):'—');
    text('pwhObservationStamp',s.observationOk?'Fetched '+shortStamp(state.observationsFetchedAt)+' · age '+age(state.observationsFetchedAt):s.observationAvailable?'STALE SNAPSHOT · last success '+shortStamp(state.observationsFetchedAt)+' · age '+age(state.observationsFetchedAt):state.observationError?'Unavailable · no new records substituted':'SatNOGS · not yet fetched');
    text('pwhOrbitStamp',s.orbit?.sourceFetchedAt?'Orbital elements fetched '+shortStamp(s.orbit.sourceFetchedAt)+' · age '+age(s.orbit.sourceFetchedAt):s.orbitCount?'Public positions loaded · timestamp unknown':'Waiting for orbital catalogue');
    text('pwhFeedCount',s.okCount+' / 5');
    text('pwhSyncStamp',state.lastSyncAt?'Last sync '+shortStamp(state.lastSyncAt):'No successful hub sync this session');
    text('pwhLastSync',state.lastSyncAt?stamp(state.lastSyncAt):'Not synchronized');
    text('pwhLastHeartbeat',state.running?shortStamp(state.lastHeartbeatAt)+' · ON':'Stopped');
    text('pwhOrbitDetail',s.orbit?.sourceFetchedAt?'Last retrieval '+stamp(s.orbit.sourceFetchedAt)+' · '+fmt(s.orbit.objectCount)+' object(s) propagated':s.orbitCount?'Orbital catalogue loaded · source time not known':'Public orbital catalogue not loaded');
    sourcePill('pwhOrbitHealth',s.orbitCount?(s.orbit?.sourceError?'PARTIAL':'AVAILABLE'):'WAITING',s.orbitCount?(s.orbit?.sourceError?'warn':'good'):'');
    sourcePill('pwhSatnogsHealth',s.observationOk?'AVAILABLE':s.observationAvailable?'STALE':state.observationError?'UNAVAILABLE':'WAITING',s.observationOk?'good':s.observationAvailable||state.observationError?'warn':'' );
    text('pwhSatnogsDetail',s.observationOk?'Fetched '+stamp(state.observationsFetchedAt)+' · '+state.observations.length+' public record(s)':s.observationAvailable?'Retained '+state.observations.length+' last-known record(s) · age '+age(state.observationsFetchedAt)+(state.observationError?' · '+state.observationError:''):state.observationError?'Last attempt failed: '+state.observationError:'Crowdsourced public observation metadata');
    sourcePill('pwhSolarHealth',s.solarOk?'AVAILABLE':'WAITING',s.solarOk?'good':'');text('pwhSolarDetail',s.solarOk?'NASA DONKI · '+fmt(s.spaces.solar.events.length)+' event(s) · fetched '+stamp(s.spaces.solar.fetchedAt):$('swxFeedState')?.textContent||'Flares, CMEs and geomagnetic-storm records');
    sourcePill('pwhNeoHealth',s.neoOk?'AVAILABLE':'WAITING',s.neoOk?'good':'');text('pwhNeoDetail',s.neoOk?'NASA/JPL NeoWs · '+fmt(s.spaces.neo.objects.length)+' record(s) · fetched '+stamp(s.spaces.neo.fetchedAt):$('neoFeedState')?.textContent||'Daily close-approach catalogue');
    sourcePill('pwhEarthHealth',s.earthOk?'AVAILABLE':s.earthStale?'STALE':'WAITING',s.earthOk?'good':s.earthStale?'warn':'');text('pwhEarthDetail','USGS '+(s.earth?.quakeUpdated?'updated '+shortStamp(s.earth.quakeUpdated)+' · age '+age(s.earth.quakeUpdated):'waiting')+' · Open-Meteo '+(s.earth?.weatherUpdated?'updated '+shortStamp(s.earth.weatherUpdated)+' · age '+age(s.earth.weatherUpdated):'waiting'));
    updateFlow('pwhFlowOrbit',s.orbitCount>0,Boolean(s.orbit?.sourceError),s.orbitCount?'CATALOGUE LOADED':'WAITING');
    updateFlow('pwhFlowSatnogs',s.observationOk,s.observationAvailable||Boolean(state.observationError),s.observationOk?'PUBLIC RECORDS':s.observationAvailable?'STALE SNAPSHOT':'WAITING');
    text('pwhBusState',state.busy?'VALIDATING / MERGING':state.lastSyncAt?'LOCAL CACHE READY':'IDLE');
    updateFlow('pwhFlowWelfare',s.earthOk||s.solarOk||s.neoOk,false,(s.earthOk||s.solarOk||s.neoOk)?'SOURCE FEEDS READY':'WAITING');
    text('pwhEventCount',state.events.length+' records');
    const overall=s.okCount===5?'MULTI-SOURCE READY':s.okCount>0?'PARTIAL SOURCE DATA':'HUB IDLE · SOURCES UNVERIFIED';
    badge('pwhOverallBadge',overall,s.okCount===5?'live':s.okCount?'warn':'');
    badge('pwhSourceHealth',s.okCount===5?'5/5 AVAILABLE':s.okCount+'/5 AVAILABLE',s.okCount===5?'live':s.okCount?'warn':'');
    badge('pwhCacheBadge',state.running?'SYNC ENGINE ON':'CACHE / READ-ONLY',state.running?'live':'');
    return s;
  }
  function renderEventList(){
    const el=$('pwhEventList');if(!el)return;
    const rows=buildEvents();
    if(!rows.length){el.innerHTML='<div class="pwh-empty">No source-verified records in the local hub yet. Sync the public feeds. Source failure is not equivalent to “no event”.</div>';return;}
    el.innerHTML=rows.map(e=>'<article class="pwh-event"><span class="pwh-event-kind">'+esc(e.kind)+'</span><div class="pwh-event-main"><b>'+esc(e.title)+'</b><small>'+esc(e.detail)+' · '+esc(e.time?stamp(e.time):'source timestamp not supplied')+'</small></div>'+(safePublicUrl(e.url)?'<a href="'+esc(safePublicUrl(e.url))+'" target="_blank" rel="noopener noreferrer">SOURCE ↗</a>':'')+'</article>').join('');
    state.events=rows;
  }
  function notify(title,body){if(!state.running||!state.notificationsEnabled||!('Notification'in window)||Notification.permission!=='granted')return;try{new Notification(title,{body:String(body).slice(0,180),icon:'icon-192.png',tag:'terravex-public-welfare'});}catch{}}
  async function enableNotifications(){
    if(!('Notification'in window)){badge('pwhOverallBadge','BROWSER NOTIFICATIONS UNSUPPORTED','warn');return false;}
    let permission=Notification.permission;if(permission==='default')permission=await Notification.requestPermission();
    state.notificationsEnabled=permission==='granted';
    const b=$('pwhNotify');if(b)b.textContent=state.notificationsEnabled?'✓ Browser notifications enabled':'♢ Enable notifications';
    addEvent('SYSTEM','Notification preference updated',state.notificationsEnabled?'Browser notifications are permitted for selected public-feed updates.':'Notification permission was not granted. In-panel data remains available.');
    renderSources();return state.notificationsEnabled;
  }
  function processWelfareNotifications(snapshot){
    if(!state.running||!state.notificationsEnabled)return;
    const core=snapshot.earth;const solar=snapshot.spaces?.solar;
    const oldQuakes=storageGet(STORE.seenQuakes,null);
    const currentQuakes=(core?.quakes||[]).map(q=>String(q.id));
    if(Array.isArray(oldQuakes)){
      const old=new Set(oldQuakes);
      const fresh=(core?.quakes||[]).filter(q=>!old.has(String(q.id))&&Number(q.mag)>=5.5);
      fresh.slice(0,2).forEach(q=>notify('USGS significant earthquake record','M'+fmt(q.mag,1)+' · '+q.place+' · reported '+stamp(q.time)+'. Verify the source and follow official advice.'));
    }
    if(currentQuakes.length)storageSet(STORE.seenQuakes,currentQuakes.slice(0,250));
    const oldSolar=storageGet(STORE.seenSolar,null);const solarRows=(solar?.events||[]).map(e=>String(e.id));
    if(Array.isArray(oldSolar)){
      const old=new Set(oldSolar);const fresh=(solar?.events||[]).filter(e=>!old.has(String(e.id)));
      fresh.slice(0,1).forEach(e=>notify('New NASA DONKI space-weather record',(e.label||e.type||'Event')+' · '+(e.time||'time not supplied')+'. This is an informational catalogue update, not an impact warning.'));
    }
    if(solarRows.length)storageSet(STORE.seenSolar,solarRows.slice(0,300));
    const orbitAlerts=Number(snapshot.orbit?.alertCount)||0;const prior=Number(storageGet(STORE.seenOrbitAlerts,0))||0;
    if(state.primed.orbit&&orbitAlerts>prior)notify('New orbital catalogue review item',String(orbitAlerts-prior)+' new review item(s) in Earth Orbit Sentinel. A catalogue flag is not a confirmed threat.');
    storageSet(STORE.seenOrbitAlerts,orbitAlerts);
    state.primed.orbit=true;
  }
  async function runSync(reason='manual'){
    if(state.busy)return false;
    state.busy=true;text('pwhEngineStatus','Sync in progress · checking local cache and permitted public feeds');badge('pwhOverallBadge','SYNC IN PROGRESS','warn');
    const btn=$('pwhSyncNow');if(btn){btn.disabled=true;btn.textContent='↻ Syncing permitted feeds…';}
    const before=Date.now();
    try{
      // Orbit/SATCAT refresh delegate keeps its own two-hour catalogue policy and cache.
      const orb=orbitState();const orbitLast=Number(orb?.lastAttemptAt||orb?.sourceFetchedAt)||0;
      const orbitDue=!orb?.objectCount || (Date.now()-orbitLast>=ORBIT_TTL);
      if(orbitDue&&Date.now()-state.lastOrbitAttemptAt>=15*60*1000&&window.TERRAVEX_ORBIT_SENTINEL?.loadCatalog){
        state.lastOrbitAttemptAt=Date.now();await Promise.race([window.TERRAVEX_ORBIT_SENTINEL.loadCatalog(),new Promise(resolve=>setTimeout(()=>resolve(false),45000))]);
      }
      const actions=[];
      actions.push(refreshObservations(false));
      if(window.TERRAVEX_SPACE_ENVIRONMENT?.refreshSolar)actions.push(window.TERRAVEX_SPACE_ENVIRONMENT.refreshSolar());
      if(window.TERRAVEX_SPACE_ENVIRONMENT?.refreshNeos)actions.push(window.TERRAVEX_SPACE_ENVIRONMENT.refreshNeos());
      if(window.TERRAVEX_CORE_PUBLIC_FEEDS?.refreshIfDue)actions.push(window.TERRAVEX_CORE_PUBLIC_FEEDS.refreshIfDue());
      await Promise.allSettled(actions);
      state.lastSyncAt=Date.now();state.syncCount++;
      const snapshot=currentSnapshot();processWelfareNotifications(snapshot);
      state.lastResult=snapshot.okCount+' of 5 feed groups report data';
      addEvent('HUB','Public data sync completed',state.lastResult+' · local app cache updated. '+(reason==='automatic'?'Automatic cadence check.':'User/session sync.'),'');
      text('pwhEngineStatus',state.running?'Sync complete · local monitor ON':'One-time sync complete · monitor OFF');
      text('pwhLastSync',stamp(state.lastSyncAt));
      renderSources();renderEventList();
      return snapshot.okCount>0;
    }catch(e){state.lastResult=String(e?.message||e);addEvent('SYSTEM','Sync incomplete',state.lastResult);text('pwhEngineStatus','Partial or failed sync · inspect source health');renderSources();renderEventList();return false;}
    finally{state.busy=false;if(btn){btn.disabled=false;btn.textContent='↻ Sync permitted feeds';}if(state.running)text('pwhEngineStatus','Hub monitor ON · '+(state.lastResult||'waiting for source response'));}
  }
  function heartbeat(){
    const now=Date.now();state.lastHeartbeatAt=now;
    text('pwhClock',new Date(now).toLocaleTimeString('en-GB',{timeZone:'Asia/Dhaka',hour12:false})+' BST · '+new Date(now).toLocaleTimeString('en-GB',{timeZone:'UTC',hour12:false})+' UTC');
    if(state.running){text('pwhLastHeartbeat',shortStamp(now)+' · ON');text('pwhEngineStatus',state.busy?'Sync in progress · local hub alive':'Hub monitor ON · source freshness checked');}
    // This is local status refresh only. Network requests are gated by source-specific cache policies.
    if(state.active)renderSources();
  }
  function setRunning(on){
    state.running=Boolean(on);const b=$('pwhToggle');if(b){b.setAttribute('aria-pressed',String(state.running));b.textContent=state.running?'⏻ Stop welfare sync':'⏻ Start welfare sync';}
    if(state.timer){clearInterval(state.timer);state.timer=null;}
    if(state.running){text('pwhEngineStatus','Hub monitor ON · syncing public sources within their cache limits');addEvent('SYSTEM','Welfare sync enabled','Local monitor and scheduled public-data checks are active; RF and spacecraft command paths remain disabled.');runSync('start');state.timer=setInterval(()=>{if(state.running&&!document.hidden)runSync('automatic');},SYNC_RECHECK_MS);}
    else{text('pwhEngineStatus','Engine stopped · last source snapshot retained');addEvent('SYSTEM','Welfare sync stopped','Automatic public feed polling paused. Last successful source records remain visible.');}
    renderSources();
  }
  function exportSnapshot(){
    const s=currentSnapshot();const data={schema:'terravex.public-welfare-space-hub.v1',exportedAt:new Date().toISOString(),mode:'read-only public data aggregation; no spacecraft command or RF transmission',sourceSummary:{orbitObjects:s.orbitCount,satcatEarthOrbitRecords:s.satcat,publicObservationCount:state.observations.length,satnogsFetchedAt:state.observationsFetchedAt,solarEvents:s.spaces?.solar?.events?.length??null,solarFetchedAt:s.spaces?.solar?.fetchedAt??null,nearEarthObjects:s.spaces?.neo?.objects?.length??null,neoFetchedAt:s.spaces?.neo?.fetchedAt??null,earthquakeCount:s.earth?.quakes?.length??null,quakeFetchedAt:s.earth?.quakeUpdated??null,weatherFetchedAt:s.earth?.weatherUpdated??null},publicObservations:state.observations,events:buildEvents().map(e=>({kind:e.kind,title:e.title,detail:e.detail,time:e.time,url:e.url})),disclaimer:'Public catalogues and crowdsourced observations do not imply a live command/telemetry connection to every satellite. Feed errors do not mean there are no events. Notifications are informational and not official emergency dispatch.'};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='TERRAVEX-public-welfare-hub-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);addEvent('EXPORT','Hub snapshot exported','JSON source summary saved on this device.');renderSources();
  }

  function drawNetwork(){
    const c=$('pwhNetworkCanvas');if(!c)return;const box=c.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,1.75);const w=Math.max(300,box.width||760),h=Math.max(220,box.height||280);
    if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);}const ctx=c.getContext('2d');if(!ctx)return;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
    const s=currentSnapshot();const leftX=w*.16,hubX=w*.5,rightX=w*.84,centerY=h*.53;
    const srcY=[h*.22,h*.42,h*.62,h*.82];const outY=[h*.28,h*.48,h*.68];
    function line(x1,y1,x2,y2,good){ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(w*.33,y1,w*.36,centerY,hubX,centerY);ctx.strokeStyle=good?'rgba(84,233,202,.34)':'rgba(105,151,183,.22)';ctx.lineWidth=good?1.35:1;ctx.stroke();}
    srcY.forEach((y,i)=>{line(leftX,y,hubX,centerY,[s.statuses.orbit,s.statuses.observations,s.statuses.solar,s.statuses.neo][i]);ctx.beginPath();ctx.arc(leftX,y,3.5,0,Math.PI*2);ctx.fillStyle=[s.statuses.orbit,s.statuses.observations,s.statuses.solar,s.statuses.neo][i]?'#62f0b5':'#698aa0';ctx.fill();});
    outY.forEach((y,i)=>{ctx.beginPath();ctx.moveTo(hubX,centerY);ctx.bezierCurveTo(w*.64,centerY,w*.68,y,rightX,y);ctx.strokeStyle=s.statuses.earth?'rgba(84,233,202,.34)':'rgba(105,151,183,.22)';ctx.lineWidth=s.statuses.earth?1.35:1;ctx.stroke();ctx.beginPath();ctx.arc(rightX,y,3.5,0,Math.PI*2);ctx.fillStyle=s.statuses.earth?'#62f0b5':'#698aa0';ctx.fill();});
    // moving packets illustrate internal data flow, not a radio-wave path.
    const t=performance.now()/1000;for(let i=0;i<11;i++){const a=(t*.12+i/11)%1;const y=srcY[i%srcY.length];const x=leftX+(hubX-leftX)*a;const yy=y+(centerY-y)*a;ctx.beginPath();ctx.arc(x,yy,1.4+(i%3)*.45,0,Math.PI*2);ctx.fillStyle=i%2?'#52e7f3':'#62f0b5';ctx.globalAlpha=.45+.45*Math.sin(t*2+i);ctx.fill();ctx.globalAlpha=1;}
    const r=27+Math.sin(t*1.4)*1.8;const grad=ctx.createRadialGradient(hubX,centerY,3,hubX,centerY,r*1.9);grad.addColorStop(0,'rgba(77,239,223,.20)');grad.addColorStop(1,'rgba(77,239,223,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(hubX,centerY,r*1.9,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(hubX,centerY,r,0,Math.PI*2);ctx.fillStyle='#0b2838';ctx.fill();ctx.strokeStyle='#52e7f3';ctx.lineWidth=1.6;ctx.stroke();ctx.beginPath();ctx.arc(hubX,centerY,r*.66,0,Math.PI*2);ctx.strokeStyle='#52e7f355';ctx.stroke();ctx.fillStyle='#bffafa';ctx.font='700 9px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('TVX',hubX,centerY+3);
    if(state.canvasFrame)state.canvasFrame=requestAnimationFrame(drawNetwork);
  }
  function enter(){state.active=true;if(!state.initialized)init();if(!state.lastSyncAt&&!state.busy)runSync('panel-open');renderSources();}
  function leave(){state.active=false;}
  function init(){
    if(state.initialized||!$('page-publichub'))return;state.initialized=true;loadObservationCache();
    $('pwhToggle')?.addEventListener('click',()=>setRunning(!state.running));$('pwhSyncNow')?.addEventListener('click',()=>runSync('manual'));
    $('pwhNotify')?.addEventListener('click',enableNotifications);$('pwhExport')?.addEventListener('click',exportSnapshot);
    document.querySelectorAll('button[data-page="publichub"],[data-goto="publichub"]').forEach(b=>b.addEventListener('click',()=>setTimeout(enter,0)));
    document.querySelectorAll('button[data-page]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='publichub')setTimeout(enter,0);else leave();}));
    document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.goto!=='publichub')leave();}));
    window.addEventListener('resize',()=>{if(state.canvasFrame){cancelAnimationFrame(state.canvasFrame);state.canvasFrame=0;}if(state.active){state.canvasFrame=1;drawNetwork();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.timer){clearInterval(state.timer);state.timer=null;}}else if(state.running&&!state.timer)state.timer=setInterval(()=>{if(state.running&&!document.hidden)runSync('automatic');},SYNC_RECHECK_MS);});
    state.heartbeat=setInterval(heartbeat,HEARTBEAT_MS);state.active=inPage();state.canvasFrame=1;drawNetwork();renderSources();renderEventList();
    if(state.active)enter();
  }
  window.TERRAVEX_PUBLIC_WELFARE_HUB={getState:()=>({active:state.active,running:state.running,lastSyncAt:state.lastSyncAt,syncCount:state.syncCount,observations:state.observations.length,observationsFetchedAt:state.observationsFetchedAt,observationError:state.observationError,lastResult:state.lastResult}),helpers:{parseObservation,age,numFromText,stamp,safePublicUrl},refresh:()=>runSync('external'),enter,stop:()=>setRunning(false),enableNotifications};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
