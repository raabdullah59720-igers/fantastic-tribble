/* TERRAVEX APEX — Atmospheric Entry & Exit Watch
 * Public-catalogue watcher only. This is not a radar receiver or guaranteed real-time alert service.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const SOURCE = 'https://celestrak.org/satcat/decayed-with-last.php';
  const SOURCE_PAGE = 'https://celestrak.org/satcat/decayed-with-last.php';
  const REFRESH_MS = 60 * 60 * 1000;
  const STORE_KEY = 'tvx-atmoswatch-seen-v1';
  const state = { records: [], loaded: false, monitoring: false, timer: null, fetchedAt: null, newCount: 0, seen: loadSeen(), frame: 0 };

  function loadSeen() {
    try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); return new Set(Array.isArray(v) ? v : []); }
    catch (_) { return new Set(); }
  }
  function saveSeen() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...state.seen].slice(-1000))); } catch (_) { /* storage is optional */ }
  }
  function utcDateInput(v) {
    if (typeof v !== 'string') return v;
    // CelesTrak's Last Data timestamp is UTC but is commonly supplied without a trailing Z.
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/.test(v)) return v.replace(' ', 'T') + 'Z';
    return v;
  }
  function fmtDate(v) {
    if (!v) return 'Not supplied';
    const d = new Date(utcDateInput(v));
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
  }
  function dateValue(v) { if (!v) return null; const d = new Date(utcDateInput(v)); return Number.isNaN(d.getTime()) ? null : d.getTime(); }
  function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function setBadge(label, kind) {
    const el = $('atwFeedBadge'); if (!el) return;
    el.textContent = label; el.className = 'badge ' + (kind || '');
  }
  function fetchTime() {
    const d = new Date();
    if ($('atwUtcClock')) $('atwUtcClock').textContent = d.toISOString().slice(11, 19);
  }
  function recordArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) {
      if (Array.isArray(payload.fields) && payload.data.length && Array.isArray(payload.data[0])) {
        return payload.data.map(row => Object.fromEntries(payload.fields.map((f, i) => [f, row[i]])));
      }
      return payload.data;
    }
    for (const key of ['objects', 'records', 'decayed', 'satellites']) if (payload && Array.isArray(payload[key])) return payload[key];
    return [];
  }
  function normalize(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const pick = (...keys) => { for (const k of keys) if (raw[k] !== undefined && raw[k] !== null && raw[k] !== '') return raw[k]; return null; };
    const name = pick('OBJECT_NAME', 'object_name', 'name', 'SATNAME', 'satname') || 'Unknown catalogued object';
    const norad = pick('NORAD_CAT_ID', 'norad_cat_id', 'NORAD_ID', 'norad_id', 'CATNR', 'catalogNumber');
    const intl = pick('OBJECT_ID', 'object_id', 'INTLDES', 'intlDes', 'international_designator') || 'Not supplied';
    const decay = pick('DECAY_DATE', 'decay_date', 'DECAY', 'decayDate');
    const epoch = pick('EPOCH', 'epoch', 'LAST_DATA', 'last_data', 'LAST_EPOCH', 'lastEpoch');
    if (!decay) return null;
    const key = String(norad || intl || name) + '|' + String(decay);
    const dt = dateValue(decay), et = dateValue(epoch);
    const gapDays = dt !== null && et !== null ? (dt - et) / 86400000 : null;
    return { key, name: String(name), norad: norad == null ? 'Not supplied' : String(norad), intl: String(intl), decay: String(decay), epoch: epoch == null ? null : String(epoch), gapDays };
  }
  function recordQuality(r) {
    if (r.gapDays === null) return { label: 'EPOCH NOT SUPPLIED', cls: '' };
    const signed = (r.gapDays > 0 ? '+' : '') + r.gapDays.toFixed(2) + ' d';
    return { label: 'DECAY − LAST EPOCH: ' + signed, cls: '' };
  }
  function render() {
    $('atwDecayCount').textContent = state.records.length.toLocaleString();
    $('atwNewCount').textContent = state.newCount.toLocaleString();
    $('atwEventCount').textContent = state.records.length + ' RECORDS';
    $('atwFetchedAt').textContent = state.fetchedAt ? state.fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
    $('atwSourceAge').textContent = state.fetchedAt ? 'Retrieved from public catalogue · ' + state.fetchedAt.toLocaleDateString() : 'No source response in this session';
    $('atwEntryState').textContent = state.loaded ? state.records.length + ' catalogue records received; source timestamps retained.' : 'Waiting for CelesTrak catalogue fetch.';
    $('atwListFoot').textContent = state.fetchedAt ? 'Last retrieval: ' + state.fetchedAt.toISOString() + ' · Provider catalogue window: 60 days' : 'Source: CelesTrak · recently decayed objects';
    if (!state.records.length) {
      $('atwEventList').innerHTML = '<div class="atw-empty"><b>' + (state.loaded ? 'No records returned by this response' : 'Waiting for source data') + '</b><span>' + (state.loaded ? 'The public endpoint returned no usable decay records. This is not proof that no atmospheric event occurred.' : 'Press Refresh catalogue. No synthetic events are generated when the source is unavailable.') + '</span></div>';
      return;
    }
    $('atwEventList').innerHTML = state.records.slice(0, 100).map(r => {
      const q = recordQuality(r);
      const gap = r.gapDays === null ? 'Decay / epoch offset: unknown' : 'Decay date − last epoch: ' + (r.gapDays > 0 ? '+' : '') + r.gapDays.toFixed(2) + ' d';
      return '<article class="atw-event"><div class="atw-event-icon" aria-hidden="true">↘</div><div class="atw-event-main"><b>' + esc(r.name) + '</b><small>NORAD ' + esc(r.norad) + ' · ' + esc(r.intl) + '<br>Catalogue decay date: ' + esc(fmtDate(r.decay)) + '<br>Last element epoch: ' + esc(fmtDate(r.epoch)) + '</small></div><div class="atw-event-meta"><b>' + esc(gap) + '</b><span class="atw-quality ' + q.cls + '">' + q.label + '</span></div></article>';
    }).join('');
  }
  function notifyNew(records) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    records.slice(0, 3).forEach(r => {
      try {
        const n = new Notification('TERRAVEX · New decay catalogue record', { body: r.name + ' · NORAD ' + r.norad + ' · ' + fmtDate(r.decay), tag: 'tvx-atw-' + r.key, icon: './icon-192.png' });
        n.onclick = () => { window.focus(); n.close(); };
      } catch (_) { /* Browser may suppress notifications */ }
    });
  }
  async function refresh() {
    const btn = $('atwRefresh');
    if (btn) { btn.disabled = true; btn.textContent = '◌ Loading catalogue…'; }
    setBadge('FETCHING CATALOGUE', 'sim');
    $('atwMonitorState').textContent = 'Requesting the CelesTrak recently-decayed HTML catalogue over HTTPS…';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response;
      try { response = await fetch(SOURCE, { method: 'GET', cache: 'no-store', headers: { 'Accept': 'text/html,application/json' }, signal: controller.signal }); }
      finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error('CelesTrak returned HTTP ' + response.status);
      const contentType = response.headers.get('content-type') || '';
      let payload = null;
      let rows = [];
      if (contentType.includes('json')) {
        payload = await response.json();
        const signature = payload && payload.signature;
        if (signature && signature.version && !String(signature.version).trim()) throw new Error('Unexpected catalogue signature');
        rows = recordArray(payload).map(normalize).filter(Boolean);
      } else {
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const table = [...doc.querySelectorAll('table')].find(t => /International Designator/i.test(t.innerText || '') && /Decay Date/i.test(t.innerText || '') && /Last Data/i.test(t.innerText || ''));
        if (!table) throw new Error('Could not identify the provider decay table in its HTML response.');
        const parsed = [...table.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th,td')].map(td => (td.innerText || td.textContent || '').trim().replace(/\s+/g, ' ')))
          .filter(c => c.length >= 8 && /^\d{4}-\d{3}[A-Z0-9]{1,3}$/i.test(c[0]) && /^\d{4}-\d{2}-\d{2}$/.test(c[6]));
        rows = parsed.map(c => ({ OBJECT_ID:c[0], NORAD_CAT_ID:c[1], OBJECT_NAME:c[2], OWNER:c[3], LAUNCH_DATE:c[4], LAUNCH_SITE:c[5], DECAY_DATE:c[6], EPOCH:c[7] })).map(normalize).filter(Boolean);
      }
      if (!rows.length && !(payload && (payload.count === 0 || payload.data?.length === 0))) throw new Error('No usable decay records found in the provider response. No simulated events were inserted.');
      rows.sort((a, b) => (dateValue(b.decay) || 0) - (dateValue(a.decay) || 0));
      const seenBefore = state.seen.size > 0;
      const added = seenBefore ? rows.filter(r => !state.seen.has(r.key)) : [];
      rows.forEach(r => state.seen.add(r.key));
      saveSeen();
      state.records = rows;
      state.loaded = true;
      state.fetchedAt = new Date();
      state.newCount += added.length;
      render();
      setBadge('CATALOGUE CONNECTED', 'live');
      $('atwMonitorState').textContent = added.length ? added.length + ' new catalogue record(s) detected since the previous baseline. See the event list; this is not a real-time sensor alert.' : 'Catalogue retrieved successfully. No new record relative to the saved catalogue baseline.';
      if (added.length) notifyNew(added);
    } catch (err) {
      setBadge('SOURCE DEGRADED', 'warn');
      $('atwMonitorState').textContent = 'Catalogue request failed: ' + String(err.message || err) + '. The app may be blocked by network, CORS, or provider availability. Open the source page directly; no cached data is labelled live.';
      if (!state.loaded) $('atwEventList').innerHTML = '<div class="atw-feed-error">' + esc(String(err.message || err)) + '<br><br>Open the provider catalogue directly: <a href="' + SOURCE_PAGE + '" target="_blank" rel="noopener">CelesTrak Recently Decayed Objects ↗</a></div>';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '↻ Refresh catalogue'; }
    }
  }
  function setMonitoring(on) {
    state.monitoring = on;
    const b = $('atwMonitor');
    b.textContent = on ? '⏻ Monitor ON' : '⏻ Monitor OFF';
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('primary', on);
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    if (on) {
      if (!state.loaded) refresh();
      state.timer = setInterval(() => {
        const page = $('page-atmoswatch');
        if (page && page.classList.contains('active') && document.visibilityState === 'visible') refresh();
      }, REFRESH_MS);
      $('atwMonitorState').textContent = 'Monitoring ON · hourly source refresh while this app remains open and the panel is active.';
    } else {
      $('atwMonitorState').textContent = 'Monitor is off. Manual refresh remains available.';
    }
  }
  async function enableNotifications() {
    if (!('Notification' in window)) { $('atwMonitorState').textContent = 'This browser does not support desktop notifications. The on-screen event log remains available.'; return; }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        $('atwNotify').textContent = '✓ Browser alerts enabled';
        $('atwMonitorState').textContent = 'Browser alerts enabled. Alerts are issued only for new CelesTrak catalogue records detected after the baseline.';
      } else {
        $('atwMonitorState').textContent = 'Browser notification permission was not granted. On-screen monitoring still works while the app is open.';
      }
    } catch (e) { $('atwMonitorState').textContent = 'Notification permission unavailable: ' + String(e.message || e); }
  }
  function exportCSV() {
    if (!state.records.length) { $('atwMonitorState').textContent = 'No catalogue records are available to export.'; return; }
    const cols = ['name','norad','intl','decay','epoch','epoch_gap_days'];
    const quote = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [cols.join(',')].concat(state.records.map(r => [r.name,r.norad,r.intl,r.decay,r.epoch,r.gapDays == null ? '' : r.gapDays.toFixed(3)].map(quote).join(',')));
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'terravex-atmospheric-decay-catalogue-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function drawScene() {
    const canvas = $('atwEarthCanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = canvas.width, h = canvas.height, t = state.frame++ * .008;
    ctx.clearRect(0,0,w,h);
    const bg = ctx.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#081522'); bg.addColorStop(1,'#0b2034'); ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    for (let i=0;i<115;i++) { const x=(i*197.31)%w, y=(i*79.71)%h; const a=.15+.2*(.5+.5*Math.sin(t*2+i)); ctx.fillStyle='rgba(177,222,255,'+a+')'; ctx.fillRect(x,y,(i%9===0?2:1),(i%9===0?2:1)); }
    const cx=w*.51, cy=h*.91, r=Math.min(w*.33,h*.68);
    const atmosphere=[{rr:1.27,c:'#b986ff',a:.07},{rr:1.19,c:'#71c8ff',a:.07},{rr:1.12,c:'#42d4ed',a:.09},{rr:1.055,c:'#55e1b6',a:.13}];
    atmosphere.forEach((v,i)=>{ctx.beginPath();ctx.arc(cx,cy,r*v.rr,Math.PI,Math.PI*2);ctx.strokeStyle=v.c;ctx.globalAlpha=.3+v.a;ctx.lineWidth=3+i;ctx.shadowColor=v.c;ctx.shadowBlur=17;ctx.stroke();});ctx.globalAlpha=1;ctx.shadowBlur=0;
    const earth=ctx.createRadialGradient(cx-r*.22,cy-r*.1,r*.03,cx,cy,r*1.08);earth.addColorStop(0,'#2b7895');earth.addColorStop(.5,'#174769');earth.addColorStop(1,'#06192b');ctx.fillStyle=earth;ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r*.99,Math.PI,Math.PI*2);ctx.clip();
    ctx.strokeStyle='rgba(107,205,225,.24)';ctx.lineWidth=1;for(let j=0;j<7;j++){ctx.beginPath();ctx.ellipse(cx,cy-r*.18,r*(.28+j*.12),r*(.08+j*.075),0,Math.PI,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='rgba(74,181,157,.24)';for(let j=0;j<5;j++){const x=cx-r*.65+j*r*.3;ctx.beginPath();ctx.ellipse(x,cy-r*.45,r*.1,r*.18,j*.5,0,Math.PI*2);ctx.fill();}ctx.restore();
    // A rotating, expressly conceptual orbit and a boundary marker.
    const orbitR=r*1.47, angle=t+0.3;ctx.beginPath();ctx.ellipse(cx,cy-r*.07,orbitR,orbitR*.32,-.08,Math.PI*1.08,Math.PI*1.92);ctx.strokeStyle='rgba(95,227,204,.58)';ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.stroke();ctx.setLineDash([]);
    const ox=cx+Math.cos(angle)*orbitR, oy=cy-r*.07+Math.sin(angle)*orbitR*.32;ctx.shadowColor='#74ffe0';ctx.shadowBlur=18;ctx.fillStyle='#a0ffe9';ctx.beginPath();ctx.arc(ox,oy,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    const labelX=Math.max(20,Math.min(w-210,cx-r*1.28));ctx.fillStyle='#8bb3cb';ctx.font='15px ui-monospace,monospace';ctx.fillText('~100 KM · KÁRMÁN LINE CONVENTION',labelX,Math.max(25,cy-r*1.14));ctx.font='12px ui-monospace,monospace';ctx.fillStyle='#67d8f0';ctx.fillText('STRATOSPHERIC O₃ REGION · ~12–50 KM',labelX,Math.max(45,cy-r*.94));
    ctx.fillStyle='#b5d1e2';ctx.font='12px ui-monospace,monospace';ctx.fillText('SCHEMATIC ONLY · NO LIVE TRACK COORDINATES',20,h-17);
    if ($('page-atmoswatch')?.classList.contains('active')) requestAnimationFrame(drawScene);
  }
  function enter() {
    drawScene();
    if (!state.loaded) refresh();
    fetchTime();
  }
  function init() {
    if (!$('atwEventList')) return;
    $('atwRefresh').addEventListener('click', refresh);
    $('atwMonitor').addEventListener('click', () => setMonitoring(!state.monitoring));
    $('atwNotify').addEventListener('click', enableNotifications);
    $('atwExport').addEventListener('click', exportCSV);
    setInterval(fetchTime, 1000);
    drawScene();
    if (document.querySelector('#page-atmoswatch.active')) enter();
  }
  window.TERRAVEX_ATMOSPHERIC_WATCH = { enter, refresh, stop: () => setMonitoring(false) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
