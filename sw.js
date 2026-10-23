/* EarthCommand shell cache. External APIs are deliberately network-only. */
const CACHE='igers-earthcommand-shell-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./assets/css/earth-command.css','./assets/icons/earthcommand.svg','./assets/js/app.js','./assets/js/live-data.js','./assets/js/ops-console.js','./assets/js/igers-energy.js','./assets/js/earth-globe.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(path=>c.add(path)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('igers-earthcommand-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const req=event.request;const url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req).then(cached=>cached||Response.error())));});
