/*
 * TERRAVEX APEX: BTCL Satellite Signal Hub
 * Read-only telemetry adapter. No SDR, RF transmitter, satellite command or frequency-control API.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const els = {
    power: $('bshPower'), powerText: $('bshPowerText'), engineState: $('bshEngineState'), engineSub: $('bshEngineSub'),
    topline: document.querySelector('.bsh-topline'), pulse: $('bshPulse'), heartbeat: $('bshHeartbeat'), tick: $('bshTick'),
    sourceBadge: $('bshSourceBadge'), sourceState: $('bshSourceState'), sourceAge: $('bshSourceAge'), bestLink: $('bshBestLink'),
    bestQuality: $('bshBestQuality'), frequency: $('bshFrequency'), flowBadge: $('bshFlowBadge'), flowSvg: document.querySelector('.bsh-flow-svg'),
    linkList: $('bshLinkList'), qualityBadge: $('bshQualityBadge'), log: $('bshLog'), logCount: $('bshLogCount'),
    clearLog: $('bshClearLog'), endpoint: $('bshEndpoint'), connectFeed: $('bshConnectFeed'), demoMode: $('bshDemoMode'), feedMessage: $('bshFeedMessage')
  };
  if (Object.values(els).some(el => !el)) return;

  const state = {
    on: true, source: 'demo', endpoint: '', links: [], sourceTimestamp: null, sourceName: 'Local synthetic model',
    tick: 0, timer: null, controller: null, busy: false, pollEveryTicks: 10, log: [], lastFeedFailure: '',
    lastDemo: [], updatedAt: null
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const time = value => new Date(value).toLocaleTimeString('en-GB', {hour12:false});
  const num = (value, digits=1) => Number.isFinite(Number(value)) ? Number(value).toLocaleString(undefined,{maximumFractionDigits:digits}) : '—';
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function addLog(message) {
    state.log.unshift({at: Date.now(), message: String(message)});
    state.log = state.log.slice(0, 24);
    els.log.innerHTML = state.log.map(item => `<div><time>${time(item.at)}</time><span>${esc(item.message)}</span></div>`).join('');
    els.logCount.textContent = `${state.log.length} record${state.log.length === 1 ? '' : 's'}`;
  }

  function demoSnapshot() {
    // Values deliberately synthetic. These are UI test signals, not samples from any carrier.
    const now = Date.now();
    const samples = [
      {id:'demo-a', name:'Illustrative link A', area:'Demo area · not a real BTCL site', band:'Ku (illustrative)', status:'DEMO', rssiDbm:-61.5, snrDb:14.4, latencyMs:398, availabilityPct:99.1},
      {id:'demo-b', name:'Illustrative link B', area:'Demo area · not a real BTCL site', band:'C (illustrative)', status:'DEMO', rssiDbm:-68.2, snrDb:10.3, latencyMs:452, availabilityPct:98.8},
      {id:'demo-c', name:'Illustrative link C', area:'Demo area · not a real BTCL site', band:'Ku (illustrative)', status:'DEMO', rssiDbm:-73.1, snrDb:7.8, latencyMs:510, availabilityPct:97.5}
    ];
    return samples.map((link, i) => ({...link, rssiDbm: +(link.rssiDbm + (Math.sin(now/3900+i)*.35)).toFixed(2), snrDb:+(link.snrDb+(Math.cos(now/3100+i)*.22)).toFixed(2), latencyMs:Math.round(link.latencyMs + Math.sin(now/1900+i)*4), frequencyMHz:null, receivedAt:now, synthetic:true}));
  }

  function normalizeFeed(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.links)) throw new Error('Response must be JSON with a links[] array.');
    if (data.links.length > 100) throw new Error('Feed returned more than 100 links; rejected for safety.');
    const links = data.links.map((raw, i) => {
      if (!raw || typeof raw !== 'object') return null;
      const id = String(raw.id ?? `link-${i+1}`).slice(0,80);
      const name = String(raw.name ?? id).slice(0,120);
      const statusRaw = String(raw.status ?? 'UNKNOWN').toUpperCase();
      const status = ['UP','CONNECTED','OK','ACTIVE'].includes(statusRaw) ? 'UP' : ['DOWN','OFFLINE','FAILED'].includes(statusRaw) ? 'DOWN' : 'DEGRADED';
      const optional = (key, min, max) => {
        if (raw[key] === null || raw[key] === undefined || raw[key] === '') return null;
        const v = Number(raw[key]);
        return Number.isFinite(v) && v >= min && v <= max ? v : null;
      };
      return {
        id, name, area: String(raw.area ?? raw.location ?? 'Area not supplied').slice(0,120),
        status, band: String(raw.band ?? 'Not reported').slice(0,40), frequencyMHz: optional('frequencyMHz', 0.000001, 1000000),
        rssiDbm: optional('rssiDbm', -180, 0), snrDb: optional('snrDb', -50, 100),
        latencyMs: optional('latencyMs', 0, 600000), availabilityPct: optional('availabilityPct', 0, 100),
        receivedAt: Date.now(), synthetic: false
      };
    }).filter(Boolean);
    let sourceTimestamp = null;
    if (data.timestamp) {
      const parsed = Date.parse(data.timestamp);
      if (Number.isFinite(parsed)) sourceTimestamp = parsed;
    }
    return {links, sourceTimestamp, sourceName: String(data.source ?? 'Authorized provider feed').slice(0,120)};
  }

  function score(link) {
    // Relative ranking index for display only, not an ITU/provider acceptance standard.
    const rssi = link.rssiDbm === null || link.rssiDbm === undefined ? null : clamp((link.rssiDbm + 120) / 70, 0, 1);
    const snr = link.snrDb === null || link.snrDb === undefined ? null : clamp((link.snrDb + 5) / 35, 0, 1);
    const latency = link.latencyMs === null || link.latencyMs === undefined ? null : 1-clamp(link.latencyMs/1000,0,1);
    const avail = link.availabilityPct === null || link.availabilityPct === undefined ? null : clamp(link.availabilityPct/100,0,1);
    const parts = [[rssi,.30],[snr,.40],[latency,.20],[avail,.10]].filter(([v]) => v !== null);
    if (!parts.length) return null;
    return Math.round(100 * parts.reduce((sum, [v, w]) => sum + v*w, 0) / parts.reduce((sum, [,w]) => sum+w,0));
  }

  function rankedLinks() {
    return [...state.links].map(link => ({...link, score:score(link)})).sort((a,b) => {
      if (a.status === 'DOWN' && b.status !== 'DOWN') return 1;
      if (b.status === 'DOWN' && a.status !== 'DOWN') return -1;
      return (b.score ?? -1) - (a.score ?? -1);
    });
  }

  function ageText() {
    const stamp = state.sourceTimestamp ?? state.updatedAt;
    if (!stamp) return 'No provider measurements';
    const seconds = Math.max(0, Math.floor((Date.now()-stamp)/1000));
    return seconds < 2 ? 'Updated just now' : `Source age ${seconds}s`;
  }

  function setFeedMessage(message, kind='') {
    els.feedMessage.className = `bsh-feed-message${kind ? ` is-${kind}` : ''}`;
    els.feedMessage.textContent = message;
  }

  function renderLinks(links) {
    if (!links.length) {
      els.linkList.innerHTML = '<div class="bsh-empty"><b>No signal measurements available</b><span>The provider feed has not supplied valid link telemetry. No demo values are substituted into live mode.</span></div>';
      els.qualityBadge.textContent = 'NO MEASUREMENTS';
      return;
    }
    els.linkList.innerHTML = links.slice(0,12).map(link => {
      const scoreValue = link.score;
      const statusClass = link.status === 'DOWN' ? 'down' : link.status === 'UP' ? '' : 'degraded';
      const statusLabel = link.synthetic ? 'SIMULATION' : link.status;
      const freq = Number.isFinite(link.frequencyMHz) && link.frequencyMHz > 0 ? `${num(link.frequencyMHz,4)} MHz` : 'Carrier not reported';
      return `<div class="bsh-link-row"><div class="bsh-link-heading"><b>${esc(link.name)}</b><span class="${statusClass}">${esc(statusLabel)}</span></div><div class="bsh-link-meta"><span>${esc(link.area)} · ${esc(link.band)}</span><span>${scoreValue === null ? 'Score unavailable' : `Relative score ${scoreValue}/100`}</span></div><div class="bsh-meter" aria-label="Relative link quality"><i style="width:${scoreValue ?? 0}%"></i></div><div class="bsh-link-meta"><span>RSSI ${link.rssiDbm === null ? '—' : `${num(link.rssiDbm,1)} dBm`} · SNR ${link.snrDb === null ? '—' : `${num(link.snrDb,1)} dB`}</span><span>${link.latencyMs === null ? 'Latency —' : `${num(link.latencyMs,0)} ms`} · ${esc(freq)}</span></div></div>`;
    }).join('');
    els.qualityBadge.textContent = links.some(link => link.synthetic) ? 'SIMULATION' : `${links.length} REPORTED LINKS`;
  }

  function render() {
    const links = rankedLinks();
    els.power.classList.toggle('is-on', state.on);
    els.power.setAttribute('aria-checked', String(state.on));
    els.powerText.textContent = state.on ? 'ON' : 'OFF';
    els.engineState.textContent = state.on ? (state.source === 'demo' ? 'LOCAL ENGINE ON' : 'TELEMETRY ENGINE ON') : 'ENGINE OFF';
    els.engineSub.textContent = state.on ? (state.source === 'demo' ? 'Demo model only · no radio hardware control' : 'Read-only telemetry processing · no RF control') : 'Heartbeat and polling stopped';
    els.topline.classList.toggle('is-off', !state.on);
    els.heartbeat.textContent = state.on ? '1 Hz' : 'PAUSED';
    els.tick.textContent = state.on ? `Tick #${state.tick} · ${time(Date.now())}` : `Stopped at tick #${state.tick}`;
    els.pulse.style.opacity = state.on ? '1' : '.28';
    els.flowSvg.classList.toggle('bsh-flow-active', state.on);
    els.flowSvg.classList.toggle('bsh-flow-paused', !state.on);
    els.flowBadge.textContent = state.source === 'demo' ? (state.on ? 'DEMO FLOW' : 'FLOW PAUSED') : (state.on ? 'PROVIDER FEED' : 'ENGINE PAUSED');
    const providerTimestamp = state.sourceTimestamp ?? state.updatedAt;
    const reportStale = state.source === 'live' && providerTimestamp !== null && providerTimestamp !== undefined && (Date.now() - providerTimestamp) > 60000;
    const providerDegraded = !!state.lastFeedFailure || reportStale;
    els.sourceBadge.textContent = state.source === 'demo' ? 'SIMULATION · NO PROVIDER FEED' : providerDegraded ? 'PROVIDER FEED · DEGRADED / STALE' : 'AUTHORIZED FEED MODE';
    els.sourceBadge.className = `badge ${state.source === 'demo' ? 'warn' : providerDegraded ? 'warn' : 'live'}`;
    els.sourceState.textContent = state.source === 'demo' ? 'DEMO' : providerDegraded ? 'STALE / DEGRADED' : 'FEED MODE';
    els.sourceAge.textContent = state.source === 'demo' ? 'Synthetic values · not measured' : ageText();
    els.bestLink.textContent = links.length ? (links[0].name.length > 20 ? links[0].name.slice(0,18)+'…' : links[0].name) : '—';
    els.bestQuality.textContent = links.length && links[0].score !== null ? `${links[0].score}/100 relative rank${state.source==='demo'?' · simulation':''}` : 'No provider measurements';
    const validFrequency = links.find(link => Number.isFinite(link.frequencyMHz) && link.frequencyMHz > 0);
    els.frequency.textContent = validFrequency ? `${num(validFrequency.frequencyMHz,3)} MHz` : 'NOT ASSIGNED';
    if (state.source === 'demo') renderLinks(links);
    else if (state.lastFeedFailure && !links.length) renderLinks([]);
    else renderLinks(links);
  }

  function step() {
    if (!state.on) return;
    state.tick += 1;
    if (state.source === 'demo') {
      state.links = demoSnapshot();
      state.updatedAt = Date.now();
    } else if (state.tick % state.pollEveryTicks === 0) {
      pollFeed();
    }
    if (state.tick === 1 || state.tick % 10 === 0) addLog(state.source === 'demo' ? `1 Hz engine tick ${state.tick}: synthetic telemetry refreshed; RF is not transmitted.` : `1 Hz calculation tick ${state.tick}: ranking last provider report; no satellite command sent.`);
    render();
  }

  function startEngine() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(step, 1000);
    if (state.source === 'demo') state.links = demoSnapshot();
    addLog(state.source === 'demo' ? 'Local demo engine turned ON.' : 'Read-only telemetry engine turned ON.');
    render();
    if (state.source === 'live' && state.endpoint) pollFeed();
  }

  function stopEngine() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    if (state.controller) state.controller.abort();
    state.controller = null;
    state.busy = false;
    addLog('Engine turned OFF by local switch. No command was sent to a satellite or provider network.');
    render();
  }

  function safeEndpoint(raw) {
    let url;
    try { url = new URL(raw.trim()); } catch (_) { throw new Error('Enter a valid provider endpoint URL.'); }
    if (url.protocol !== 'https:') throw new Error('Only HTTPS endpoints are accepted.');
    if (url.username || url.password || url.search || url.hash) throw new Error('Do not include credentials, query tokens or fragments in the URL.');
    const host = url.hostname.toLowerCase();
    if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Local/private hostnames are not accepted in this browser adapter.');
    if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) throw new Error('Private or link-local IP addresses are not accepted.');
    if (url.port && url.port !== '443') throw new Error('Use the standard HTTPS port 443.');
    return url.href;
  }

  async function pollFeed() {
    if (!state.on || state.source !== 'live' || !state.endpoint || state.busy) return;
    state.busy = true;
    state.controller = new AbortController();
    const timeout = setTimeout(() => state.controller?.abort(), 6000);
    try {
      const response = await fetch(state.endpoint, {method:'GET', headers:{'Accept':'application/json'}, cache:'no-store', mode:'cors', credentials:'omit', referrerPolicy:'no-referrer', signal:state.controller.signal});
      if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}.`);
      const data = await response.json();
      const result = normalizeFeed(data);
      state.links = result.links;
      state.sourceTimestamp = result.sourceTimestamp || Date.now();
      state.updatedAt = Date.now();
      state.sourceName = result.sourceName;
      state.lastFeedFailure = '';
      setFeedMessage(`Read-only feed received from ${result.sourceName}. ${result.links.length} link record(s). Timestamp: ${result.sourceTimestamp ? new Date(result.sourceTimestamp).toISOString() : 'not supplied; local receipt time shown'}. The app has not transmitted RF or sent a satellite command.`, 'good');
      addLog(`Authorized read-only endpoint returned ${result.links.length} link record(s).`);
    } catch (error) {
      if (!state.on) return;
      if (error && error.name === 'AbortError') state.lastFeedFailure = 'Request timed out or was cancelled.';
      else state.lastFeedFailure = String(error?.message || error);
      setFeedMessage(`No fresh provider data received: ${state.lastFeedFailure} Check HTTPS, CORS, endpoint authorization and response schema. Live mode will not be replaced with simulated values.`, 'bad');
      addLog(`Provider feed read failed: ${state.lastFeedFailure}`);
    } finally {
      clearTimeout(timeout);
      state.busy = false;
      state.controller = null;
      render();
    }
  }

  els.power.addEventListener('click', () => {
    state.on = !state.on;
    if (state.on) startEngine(); else stopEngine();
  });
  els.connectFeed.addEventListener('click', () => {
    let endpoint;
    try { endpoint = safeEndpoint(els.endpoint.value); }
    catch (error) { setFeedMessage(error.message, 'bad'); return; }
    state.endpoint = endpoint;
    state.source = 'live';
    state.links = [];
    state.sourceTimestamp = null;
    state.updatedAt = null;
    state.sourceName = 'Approved provider feed';
    state.lastFeedFailure = '';
    addLog('Switched to provider feed mode. Existing demo values were discarded.');
    setFeedMessage(state.on ? 'Endpoint format accepted. Attempting a read-only HTTPS request now. The provider must allow CORS and return timestamped links[] JSON.' : 'Endpoint format accepted. Turn the local engine ON to begin read-only polling. No provider request is being sent while the engine is OFF.', 'good');
    render();
    if (state.on) pollFeed();
  });
  els.demoMode.addEventListener('click', () => {
    if (state.controller) state.controller.abort();
    state.endpoint = '';
    els.endpoint.value = '';
    state.source = 'demo';
    state.links = state.on ? demoSnapshot() : [];
    state.sourceTimestamp = null;
    state.updatedAt = Date.now();
    state.sourceName = 'Local synthetic model';
    state.lastFeedFailure = '';
    setFeedMessage('Local demonstration mode enabled. All changing link values are synthetic, not measured, and do not represent live BTCL/BSCL service.', '');
    addLog('Returned to labelled synthetic demo mode.');
    render();
  });
  els.clearLog.addEventListener('click', () => { state.log = []; els.log.innerHTML = ''; els.logCount.textContent = '0 records'; });

  state.links = demoSnapshot();
  state.updatedAt = Date.now();
  state.sourceTimestamp = null;
  els.feedMessage.textContent = 'No provider endpoint supplied. Demo mode is clearly separated from real carrier data.';
  els.flowSvg.classList.add('bsh-flow-active');
  addLog('Panel ready. Default mode is simulation; no BTCL/BSCL endpoint or RF device connected.');
  startEngine();

  window.TERRAVEX_BTCL_SIGNAL_HUB = {
    getSnapshot: () => ({on:state.on, source:state.source, tick:state.tick, linkCount:state.links.length, liveEndpointConfigured:!!state.endpoint, rfTransmitting:false}),
    turnOff: () => { if (state.on) { state.on=false; stopEngine(); } }
  };
})();
