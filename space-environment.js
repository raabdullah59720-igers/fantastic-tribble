/* TERRAVEX APEX Space Environment panels.
 * Source-observed events and calculated/schematic graphics are kept separate.
 */
(function (root) {
  'use strict';
  const MONTH = 60 * 1000;
  const seen = { solar: new Set(), solarPrimed: false };
  let solarCache = null, neoCache = null, solarPending = null, neoPending = null;
  let raf = 0, started = false;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (n, digits = 1) => Number.isFinite(Number(n)) ? Number(n).toLocaleString(undefined, {maximumFractionDigits:digits}) : '—';
  const safeDate = value => { const d = new Date(value); return Number.isFinite(d.getTime()) ? d.toLocaleString() : 'Time not supplied'; };
  const utcDay = d => d.toISOString().slice(0,10);
  const daysAgo = n => { const d = new Date(); d.setUTCDate(d.getUTCDate()-n); return utcDay(d); };
  const timeoutFetch = async (url, ms=12000) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), ms);
    try { const res = await fetch(url, {signal:controller.signal, cache:'no-store', headers:{'Accept':'application/json'}}); if (!res.ok) throw new Error('HTTP '+res.status); return await res.json(); }
    finally { clearTimeout(timer); }
  };

  function dobsonThicknessMm(du) {
    const n = Number(du);
    if (!Number.isFinite(n) || n < 50 || n > 800) return NaN;
    return n * 0.01;
  }
  function normalizeNeoFeed(feed) {
    const groups = feed && feed.near_earth_objects;
    if (!groups || typeof groups !== 'object') return [];
    const objects = Object.values(groups).flat().filter(Boolean).map(o => {
      const ca = Array.isArray(o.close_approach_data) ? o.close_approach_data[0] : null;
      const missKm = Number(ca?.miss_distance?.kilometers);
      const velKmh = Number(ca?.relative_velocity?.kilometers_per_hour);
      const minD = Number(o.estimated_diameter?.meters?.estimated_diameter_min);
      const maxD = Number(o.estimated_diameter?.meters?.estimated_diameter_max);
      return {
        id:String(o.id ?? o.neo_reference_id ?? o.name ?? 'unknown'), name:String(o.name ?? 'Unnamed object'),
        date:String(ca?.close_approach_date_full ?? ca?.close_approach_date ?? 'Date not supplied'),
        missKm:Number.isFinite(missKm)?missKm:NaN, velocityKmh:Number.isFinite(velKmh)?velKmh:NaN,
        diameterMinM:Number.isFinite(minD)?minD:NaN, diameterMaxM:Number.isFinite(maxD)?maxD:NaN,
        hazardous:o.is_potentially_hazardous_asteroid===true, nasaUrl:o.nasa_jpl_url||''
      };
    });
    return objects.sort((a,b)=>(Number.isFinite(a.missKm)?a.missKm:Infinity)-(Number.isFinite(b.missKm)?b.missKm:Infinity));
  }
  const api = Object.freeze({dobsonThicknessMm, normalizeNeoFeed});
  if (root) root.TERRAVEXSpaceMath = api;

  function ctxFor(id) { const c=$(id); if (!c) return null; const ctx=c.getContext('2d'); return ctx?{c,ctx,w:c.width,h:c.height}:null; }
  function gradient(ctx,x0,y0,x1,y1,stops){const g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
  function starfield(ctx,w,h,phase,count=95){
    for(let i=0;i<count;i++){
      const x=((i*137.507 + (i%7)*19) % w), y=((i*71.17 + (i%11)*23)%h), r=(i%4===0?1.5:.6), pulse=.25+.45*(.5+.5*Math.sin(phase*.8+i));
      ctx.globalAlpha=pulse;ctx.fillStyle=i%7===0?'#9beaff':'#b0c7f7';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }ctx.globalAlpha=1;
  }
  function label(ctx,txt,x,y,size=12,color='#a7c7dc',weight=600){ctx.save();ctx.font=weight+' '+size+'px ui-monospace, SFMono-Regular, Consolas, monospace';ctx.fillStyle=color;ctx.shadowColor='rgba(40,205,255,.2)';ctx.shadowBlur=7;ctx.fillText(txt,x,y);ctx.restore();}
  function drawOzone(phase){
    const v=ctxFor('ozoneCanvas');if(!v)return;const {ctx,w,h}=v;ctx.clearRect(0,0,w,h);
    ctx.fillStyle=gradient(ctx,0,0,w,h,[[0,'#061a2f'],[.5,'#050d20'],[1,'#120d2a']]);ctx.fillRect(0,0,w,h);starfield(ctx,w,h,phase,140);
    const cx=365,cy=365,r=205;
    const atm=ctx.createRadialGradient(cx,cy,r*.78,cx,cy,r*1.42);atm.addColorStop(0,'rgba(53,130,255,0)');atm.addColorStop(.58,'rgba(61,158,255,.16)');atm.addColorStop(.76,'rgba(109,107,255,.25)');atm.addColorStop(.9,'rgba(83,234,255,.12)');atm.addColorStop(1,'rgba(39,185,244,0)');ctx.fillStyle=atm;ctx.beginPath();ctx.arc(cx,cy,r*1.42,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.shadowColor='#2a8cff';ctx.shadowBlur=26;ctx.strokeStyle='rgba(73,213,255,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r*1.08,0,Math.PI*2);ctx.stroke();ctx.restore();
    ctx.save();ctx.shadowColor='#8a7eff';ctx.shadowBlur=24;ctx.strokeStyle='rgba(147,130,255,.85)';ctx.lineWidth=12;ctx.beginPath();ctx.arc(cx,cy,r*1.18,0,Math.PI*2);ctx.stroke();ctx.restore();
    const earth=ctx.createRadialGradient(cx-70,cy-85,12,cx,cy,r);earth.addColorStop(0,'#2b7a9e');earth.addColorStop(.42,'#14518a');earth.addColorStop(.78,'#082748');earth.addColorStop(1,'#031121');ctx.fillStyle=earth;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r-1,0,Math.PI*2);ctx.clip();
    ctx.fillStyle='rgba(54,182,166,.22)';ctx.beginPath();ctx.moveTo(cx-180,cy-70);ctx.lineTo(cx-100,cy-150);ctx.lineTo(cx-15,cy-130);ctx.lineTo(cx+15,cy-30);ctx.lineTo(cx-60,cy+45);ctx.lineTo(cx-25,cy+130);ctx.lineTo(cx-145,cy+85);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(57,165,145,.24)';ctx.beginPath();ctx.moveTo(cx+15,cy-176);ctx.lineTo(cx+140,cy-140);ctx.lineTo(cx+176,cy-35);ctx.lineTo(cx+100,cy+3);ctx.lineTo(cx+58,cy+110);ctx.lineTo(cx-4,cy+32);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(128,220,255,.18)';ctx.lineWidth=1;for(let yy=-160;yy<=160;yy+=40){ctx.beginPath();ctx.ellipse(cx,cy+yy*.23,r*.88,18,0,0,Math.PI*2);ctx.stroke()}for(let ang=-1.2;ang<=1.3;ang+=.45){ctx.beginPath();ctx.ellipse(cx,cy,r*Math.max(.15,Math.cos(ang)),r,ang*.18,0,Math.PI*2);ctx.stroke()};ctx.restore();
    // Solar UV rays are schematic and slow animated.
    const sx=880, sy=126;const sun=ctx.createRadialGradient(sx,sy,2,sx,sy,90);sun.addColorStop(0,'#fff4cf');sun.addColorStop(.17,'#ffdb8b');sun.addColorStop(.46,'rgba(255,153,76,.55)');sun.addColorStop(1,'rgba(255,135,55,0)');ctx.fillStyle=sun;ctx.beginPath();ctx.arc(sx,sy,90,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0b1';ctx.beginPath();ctx.arc(sx,sy,24+Math.sin(phase)*2,0,Math.PI*2);ctx.fill();
    for(let i=0;i<6;i++){let y=182+i*40;ctx.beginPath();ctx.moveTo(sx-25,y);ctx.bezierCurveTo(730,y+Math.sin(phase+i)*18,630,y-15,570,y+12);ctx.strokeStyle='rgba(255,194,113,.48)';ctx.lineWidth=1.2;ctx.setLineDash([5,9]);ctx.lineDashOffset=-phase*18-i*7;ctx.stroke();}ctx.setLineDash([]);
    for(let i=0;i<22;i++){const a=phase*.24+i*2.399;const rr=r*(1.105+(i%4)*.022);const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.95;ctx.fillStyle=i%3===0?'#c3a9ff':'#8defff';ctx.globalAlpha=.45+.4*(.5+.5*Math.sin(phase+i));ctx.beginPath();ctx.arc(x,y,1.6+(i%3)*.3,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
    label(ctx,'STRATOSPHERIC O₃',612,425,14,'#c5c0ff',800);label(ctx,'UV-B ABSORPTION',614,449,10,'#a0b9d4',500);label(ctx,'SCHEMATIC / NOT A CURRENT OZONE MAP',28,h-24,10,'#7da7c5',600);
  }
  function drawOzoneProfile(){
    const v=ctxFor('ozoneProfileCanvas');if(!v)return;const {ctx,w,h}=v;ctx.clearRect(0,0,w,h);ctx.fillStyle='#050e1b';ctx.fillRect(0,0,w,h);const L=75,R=w-25,T=35,B=h-55;
    ctx.strokeStyle='rgba(112,158,190,.19)';ctx.lineWidth=1;for(let i=0;i<=5;i++){const y=T+(B-T)*i/5;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke()}for(let i=0;i<=4;i++){const x=L+(R-L)*i/4;ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.stroke()}
    const alt=[0,5,10,15,20,25,30,35,40,45,50,60,70,80,90,100];const abundance=[.08,.1,.15,.25,.48,.78,.96,1,.91,.73,.48,.23,.12,.08,.05,.03];ctx.beginPath();alt.forEach((a,i)=>{const x=L+abundance[i]*(R-L)*.92,y=B-a/100*(B-T);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.lineTo(L,B);ctx.closePath();ctx.fillStyle=gradient(ctx,L,T,R,B,[[0,'rgba(130,112,255,.52)'],[.55,'rgba(49,216,240,.18)'],[1,'rgba(49,216,240,.02)']]);ctx.fill();ctx.beginPath();alt.forEach((a,i)=>{const x=L+abundance[i]*(R-L)*.92,y=B-a/100*(B-T);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle='#7cecff';ctx.lineWidth=3;ctx.shadowColor='#39d8ff';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
    const y1=B-12/100*(B-T),y2=B-50/100*(B-T);ctx.fillStyle='rgba(147,124,255,.09)';ctx.fillRect(L,y2,R-L,y1-y2);label(ctx,'ALTITUDE (km)',10,20,10,'#9dbbd2');label(ctx,'OZONE LAYER: STRATOSPHERE',L+10,T+18,10,'#c4b9ff');label(ctx,'RELATIVE ABUNDANCE (ILLUSTRATIVE)',L,B+35,9,'#8caec5');[0,20,40,60,80,100].forEach(a=>label(ctx,String(a),L-32,B-a/100*(B-T)+4,10,'#89a9be'));
  }
  function drawMagnetosphere(phase){
    const v=ctxFor('swxMagCanvas');if(!v)return;const {ctx,w,h}=v;ctx.clearRect(0,0,w,h);ctx.fillStyle=gradient(ctx,0,0,w,h,[[0,'#07172b'],[.6,'#061021'],[1,'#090c22']]);ctx.fillRect(0,0,w,h);starfield(ctx,w,h,phase,125);
    const sx=145,sy=315;const sg=ctx.createRadialGradient(sx,sy,6,sx,sy,140);sg.addColorStop(0,'#fff4ce');sg.addColorStop(.12,'#ffce80');sg.addColorStop(.38,'rgba(255,136,69,.38)');sg.addColorStop(1,'rgba(255,105,45,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,140,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffdf98';ctx.beginPath();ctx.arc(sx,sy,33+Math.sin(phase*.7)*2,0,Math.PI*2);ctx.fill();
    const ex=785,ey=315,er=86;ctx.save();ctx.strokeStyle='rgba(77,207,255,.6)';ctx.lineWidth=1.7;ctx.shadowColor='#45dfff';ctx.shadowBlur=10;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(ex-er,ey+i*15);ctx.bezierCurveTo(ex-80,ey-190+i*20,ex+220,ey-165+i*24,ex+305,ey+i*14);ctx.stroke();ctx.beginPath();ctx.moveTo(ex-er,ey+i*15);ctx.bezierCurveTo(ex-70,ey+190+i*20,ex+220,ey+165+i*24,ex+305,ey+i*14);ctx.stroke()}ctx.restore();
    const eg=ctx.createRadialGradient(ex-30,ey-35,4,ex,ey,er);eg.addColorStop(0,'#409db7');eg.addColorStop(.55,'#14558b');eg.addColorStop(1,'#071d3b');ctx.fillStyle=eg;ctx.beginPath();ctx.arc(ex,ey,er,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(108,226,255,.72)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ex,ey,er+5,0,Math.PI*2);ctx.stroke();
    // Conceptual auroral arcs.
    for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(ex,ey,er*.92,er*.34,0,Math.PI*1.08,Math.PI*1.92);ctx.strokeStyle=i?'rgba(167,123,255,.65)':'rgba(87,255,199,.72)';ctx.lineWidth=4;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=12;ctx.stroke()}ctx.shadowBlur=0;
    for(let i=0;i<54;i++){const px=(240+((i*73+phase*48)%440)),py=160+((i*97)%315);ctx.fillStyle=i%5===0?'#ffe1a4':'#e2aa67';ctx.globalAlpha=.15+.65*(.5+.5*Math.sin(phase*1.7+i));ctx.beginPath();ctx.arc(px,py,1.4+(i%3)*.45,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
    label(ctx,'SOLAR SOURCE',80,430,11,'#ffd49a',700);label(ctx,'MAGNETOSPHERE',720,445,11,'#8deeff',700);label(ctx,'SCHEMATIC / DO NOT INFER EARTH IMPACT',28,h-24,10,'#7da7c5',600);
  }
  function drawNeo(phase, objects){
    const v=ctxFor('neoOrbitCanvas');if(!v)return;const {ctx,w,h}=v;ctx.clearRect(0,0,w,h);ctx.fillStyle=gradient(ctx,0,0,w,h,[[0,'#06152b'],[.5,'#040a19'],[1,'#100d27']]);ctx.fillRect(0,0,w,h);starfield(ctx,w,h,phase,155);
    const cx=420,cy=312;const sun=ctx.createRadialGradient(cx,cy,3,cx,cy,118);sun.addColorStop(0,'#fff6cf');sun.addColorStop(.15,'#ffe0a0');sun.addColorStop(.35,'rgba(255,160,74,.48)');sun.addColorStop(1,'rgba(255,120,58,0)');ctx.fillStyle=sun;ctx.beginPath();ctx.arc(cx,cy,118,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe9ac';ctx.beginPath();ctx.arc(cx,cy,27,0,Math.PI*2);ctx.fill();
    const radii=[150,222,305];radii.forEach((r,i)=>{ctx.beginPath();ctx.ellipse(cx,cy,r,r*(.56+i*.035),-0.12,0,Math.PI*2);ctx.strokeStyle=['rgba(84,154,255,.32)','rgba(93,219,255,.55)','rgba(157,129,255,.42)'][i];ctx.lineWidth=i===1?1.6:1;ctx.setLineDash(i===2?[6,7]:[]);ctx.stroke();ctx.setLineDash([])});
    const earthA=phase*.10;const erx=cx+222*Math.cos(earthA),ery=cy+222*.595*Math.sin(earthA);ctx.fillStyle='#43d8ef';ctx.shadowColor='#43d8ef';ctx.shadowBlur=13;ctx.beginPath();ctx.arc(erx,ery,10,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;label(ctx,'EARTH',erx+13,ery-5,10,'#8df2ff',700);
    const count=Math.max(objects?.length||0,4);for(let i=0;i<count;i++){const a=phase*.045+i*6.283185/count;const r=150+(i%3)*47;const x=cx+r*Math.cos(a),y=cy+r*(.59+(i%3)*.02)*Math.sin(a);ctx.fillStyle=i%4===0?'#ffa8c9':'#b9a6ff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(x,y,2.5+(i%3)*.55,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    if(objects?.length){const closest=objects[0];const mx=765,my=122;ctx.fillStyle='rgba(10,27,46,.92)';ctx.strokeStyle='rgba(255,133,189,.45)';ctx.beginPath();ctx.roundRect(mx,my,300,120,12);ctx.fill();ctx.stroke();label(ctx,'CLOSEST REPORTED PASS',mx+15,my+25,10,'#ffb5d0',700);ctx.fillStyle='#f0f8ff';ctx.font='700 16px system-ui';ctx.fillText(closest.name.length>24?closest.name.slice(0,22)+'…':closest.name,mx+15,my+52);label(ctx,Number.isFinite(closest.missKm)?fmt(closest.missKm/384400,2)+' lunar distances':'Distance unavailable',mx+15,my+78,11,'#91d8ea',600);label(ctx,closest.date.slice(0,24),mx+15,my+100,9,'#96adc1',500);}
    label(ctx,'SUN',cx-15,cy+50,10,'#ffe4aa',700);label(ctx,'ORBIT PATHS / ILLUSTRATIVE GEOMETRY',28,h-24,10,'#7da7c5',600);
  }
  function renderDobson(){const field=$('ozoneDu');if(!field)return;let n=Number(field.value);if(!Number.isFinite(n)||n<50||n>800){$('ozoneMm').textContent='Invalid input';return;}const mm=dobsonThicknessMm(n);$('ozoneMm').textContent=mm.toFixed(2)+' mm';const range=$('ozoneDuRange');if(range&&Number(range.value)!==n&&n>=Number(range.min)&&n<=Number(range.max))range.value=String(n);}

  async function loadSolar(force=false){
    if(solarPending)return solarPending;
    if(solarCache&&!force&&Date.now()-solarCache.fetchedAt<10*60*1000){renderSolar(solarCache,true);return solarCache;}
    const state=$('swxFeedState');if(state){state.dataset.state='warn';state.textContent='Requesting NASA DONKI event records…';}
    const start=daysAgo(6),end=utcDay(new Date());
    solarPending=(async()=>{
      const types=[['FLR','Solar flare'],['CME','Coronal mass ejection'],['GST','Geomagnetic storm']];
      const results=await Promise.allSettled(types.map(([type])=>timeoutFetch('https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/'+type+'?startDate='+start+'&endDate='+end)));
      const events=[];let successes=0;let failures=[];
      results.forEach((result,i)=>{
        const [type,labelText]=types[i];
        if(result.status!=='fulfilled'){failures.push(type+': '+String(result.reason?.message||result.reason));return;}
        successes++;const data=Array.isArray(result.value)?result.value:(Array.isArray(result.value?.data)?result.value.data:[]);
        data.forEach(e=>{
          const time=e.beginTime||e.startTime||e.peakTime||e.eventTime||e.submissionTime||'';
          const ident=e.flareID||e.activityID||e.gstID||e.id||[type,time,e.classType||''].join('-');
          events.push({id:String(ident),type:labelText,typeCode:type,label:labelText,time:String(time),classType:e.classType||e.type||'',sourceLocation:e.sourceLocation||'',speed:e.cmeAnalyses?.[0]?.speed||null,link:e.link||'https://ccmc.gsfc.nasa.gov/tools/DONKI/',raw:e});
        });
      });
      events.sort((a,b)=>new Date(b.time)-new Date(a.time));
      const record={events,fetchedAt:Date.now(),successes,failures};solarCache=record;renderSolar(record,false);return record;
    })().finally(()=>{solarPending=null;});
    return solarPending;
  }
  function renderSolar(record,fromCache){
    if(!$('swxFeedState'))return;
    $('swxFlareCount').textContent=record.successes>0?record.events.filter(e=>e.type==='Solar flare').length:'—';$('swxCmeCount').textContent=record.successes>0?record.events.filter(e=>e.type==='Coronal mass ejection').length:'—';$('swxGstCount').textContent=record.successes>0?record.events.filter(e=>e.type==='Geomagnetic storm').length:'—';$('swxUpdated').textContent=record.fetchedAt?new Date(record.fetchedAt).toLocaleTimeString():'—';$('swxEventCount').textContent=record.events.length+' events';
    const state=$('swxFeedState');state.dataset.state=record.successes===3?'live':record.successes?'warn':'bad';
    state.textContent=record.successes===3?`NASA DONKI responded for all three event classes · records from ${daysAgo(6)} to ${utcDay(new Date())}${fromCache?' · memory cache':''}. These are event catalogues, not a locally calibrated impact forecast.`:record.successes?`Partial source availability: ${record.successes}/3 data feeds answered. Missing feeds: ${record.failures.join('; ')}.`:`All NASA DONKI requests failed. No synthetic events substituted. Open the official dashboard or retry. ${record.failures.join('; ')}`;
    const list=$('swxEvents');
    if(!record.events.length){list.innerHTML='<div class="muted">'+(record.successes?'No records returned in the requested window.':'No source-verified records available.')+'</div>';return;}
    list.innerHTML=record.events.slice(0,30).map(e=>`<article class="se-event"><span class="se-event-tag ${e.type==='Geomagnetic storm'?'warn':''}">${e.type==='Solar flare'?'FLR':e.type==='Coronal mass ejection'?'CME':'GST'}</span><div class="se-event-main"><b>${esc(e.label)}${e.classType?' · '+esc(e.classType):''}</b><small>${esc(safeDate(e.time))}${e.sourceLocation?' · '+esc(e.sourceLocation):''}${e.speed?' · analysis speed '+esc(fmt(e.speed,0))+' km/s':''}</small><a href="${esc(e.link)}" target="_blank" rel="noopener">Source record ↗</a></div></article>`).join('');
    if(seen.solarPrimed&&$('swxNotifications')?.checked&&'Notification'in window&&Notification.permission==='granted'){
      const fresh=record.events.filter(e=>!seen.solar.has(e.id));if(fresh.length){const e=fresh[0];try{new Notification('TERRAVEX · New NASA DONKI event',{body:e.label+(e.classType?' · '+e.classType:'')+' · '+safeDate(e.time),icon:'icon-192.png'});}catch(_){}}
    }
    record.events.forEach(e=>seen.solar.add(e.id));seen.solarPrimed=true;
  }
  async function loadNeos(force=false){
    if(neoPending)return neoPending;
    if(neoCache&&!force&&Date.now()-neoCache.fetchedAt<30*60*1000){renderNeos(neoCache,true);return neoCache;}
    const state=$('neoFeedState');if(state){state.dataset.state='warn';state.textContent='Requesting NASA NeoWs current UTC-day close-approach records…';}
    const day=utcDay(new Date());
    neoPending=(async()=>{
      try{
        const url='https://api.nasa.gov/neo/rest/v1/feed?start_date='+day+'&end_date='+day+'&api_key=DEMO_KEY';
        const feed=await timeoutFetch(url,15000);const objects=normalizeNeoFeed(feed);const rec={objects,fetchedAt:Date.now(),sourceDate:day,total:feed.element_count??objects.length};neoCache=rec;renderNeos(rec,false);return rec;
      }catch(error){const rec={objects:[],fetchedAt:null,sourceDate:day,total:0,error:String(error?.message||error)};renderNeos(rec,false);return rec;}
    })().finally(()=>{neoPending=null;});
    return neoPending;
  }
  function renderNeos(record,fromCache){
    if(!$('neoFeedState'))return;const good=Boolean(record.fetchedAt)&&!record.error;
    $('neoStatus').textContent=good?'NASA FEED RECEIVED':'SOURCE UNAVAILABLE';$('neoStatus').className='badge '+(good?'live':'warn');$('neoCount').textContent=good?record.objects.length:'—';$('neoHazardCount').textContent=good?record.objects.filter(o=>o.hazardous).length:'—';const closest=record.objects.find(o=>Number.isFinite(o.missKm));$('neoClosest').textContent=closest?fmt(closest.missKm/384400,2)+' LD':'—';$('neoUpdated').textContent=good?(record.sourceDate+' · '+new Date(record.fetchedAt).toLocaleTimeString()):'—';$('neoTableCount').textContent=good?record.objects.length+' objects':'0 objects';
    const fs=$('neoFeedState');fs.dataset.state=good?'live':'bad';fs.textContent=good?`NASA/JPL NeoWs data for UTC ${record.sourceDate} · ${record.total} reported records · fetched ${new Date(record.fetchedAt).toLocaleString()}${fromCache?' · memory cache':''}.`:`NASA NeoWs is unavailable or throttled (${record.error||'No successful response'}). No fabricated close-approach rows substituted. Try later or open CNEOS.`;
    const list=$('neoEvents');if(!good||!record.objects.length){list.innerHTML='<div class="muted">'+(good?'No close-approach records were returned for this UTC date.':'No source-verified object data available.')+'</div>';return;}
    list.innerHTML=record.objects.slice(0,25).map(o=>{const diameter=Number.isFinite(o.diameterMaxM)?fmt(o.diameterMaxM,1)+' m max':'diameter unavailable';const miss=Number.isFinite(o.missKm)?fmt(o.missKm,0)+' km':'distance unavailable';const vel=Number.isFinite(o.velocityKmh)?fmt(o.velocityKmh,0)+' km/h':'speed unavailable';return `<article class="se-event"><span class="se-event-tag ${o.hazardous?'warn':''}">${o.hazardous?'PHA':'NEO'}</span><div class="se-event-main"><b>${esc(o.name)}</b><small>${esc(o.date)} · miss distance ${esc(miss)} (${Number.isFinite(o.missKm)?fmt(o.missKm/384400,2)+' LD':'—'})</small><small>Estimated diameter: ${esc(diameter)} · relative speed: ${esc(vel)}</small>${o.nasaUrl?`<a href="${esc(o.nasaUrl)}" target="_blank" rel="noopener">NASA/JPL object record ↗</a>`:''}</div></article>`;}).join('');
  }
  function panelOpen(name){const p=$('page-'+name);return !!p&&p.classList.contains('active');}
  function activate(name){if(name==='spaceweather')loadSolar(false);if(name==='spaceobjects')loadNeos(false);}
  function animationTick(){if(document.hidden){raf=setTimeout(()=>requestAnimationFrame(animationTick),900);return;}const active=panelOpen('ozone')||panelOpen('spaceweather')||panelOpen('spaceobjects');if(!active){raf=setTimeout(()=>requestAnimationFrame(animationTick),700);return;}const t=performance.now()/1000;drawOzone(t);drawMagnetosphere(t);drawNeo(t,neoCache?.objects||[]);raf=requestAnimationFrame(animationTick);}
  function drawOzoneProfileSafe(){drawOzoneProfile();}
  function init(){if(started||!$('page-ozone'))return;started=true;renderDobson();drawOzone(0);drawOzoneProfile();drawMagnetosphere(0);drawNeo(0,[]);
    $('ozoneDu')?.addEventListener('input',renderDobson);$('ozoneDuRange')?.addEventListener('input',()=>{if($('ozoneDu'))$('ozoneDu').value=$('ozoneDuRange').value;renderDobson();});$('ozoneOfficialEmbed')?.addEventListener('toggle',e=>{if(e.target.open){const frame=e.target.querySelector('iframe[data-src]');if(frame&&!frame.src)frame.src=frame.dataset.src;}});
    $('swxRefresh')?.addEventListener('click',()=>loadSolar(true));$('neoRefresh')?.addEventListener('click',()=>loadNeos(true));
    $('swxNotifications')?.addEventListener('change',async e=>{if(!e.target.checked)return;if(!('Notification'in window)){e.target.checked=false;$('swxFeedState').textContent='This browser does not support notifications.';return;}let p=Notification.permission;if(p==='default')p=await Notification.requestPermission();if(p!=='granted'){e.target.checked=false;$('swxFeedState').textContent='Notification permission was not granted. Panel data can still be viewed.';}});
    document.querySelectorAll('button[data-page]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.page)));
    document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>{const target=b.getAttribute('data-goto');setTimeout(()=>activate(target),0);}));
    const startPage=new URL(location.href).searchParams.get('page');if(startPage)activate(startPage);
    raf=requestAnimationFrame(animationTick);
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
})(typeof window!=='undefined'?window:null);
