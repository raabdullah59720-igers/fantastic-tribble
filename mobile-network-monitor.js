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
