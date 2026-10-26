/* TERRAVEX APEX service worker. Critical shell assets are required; artwork and docs are optional. */
const CACHE_NAME = 'terravex-apex-shell-v18';
const SCOPE_URL = self.registration.scope;
const REQUIRED_SHELL = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./earth-systems-upgrade.css",
  "./earth-systems-upgrade.js",
  "./bangladesh-observatory.css",
  "./bangladesh-observatory.js",
  "./geolocation-live.css",
  "./geolocation-live.js",
  "./lightning-nowcast-lab.css",
  "./lightning-nowcast-lab.js",
  "./thunderstorm-energy-lab.html",
  "./thunderstorm-energy-lab.css",
  "./thunderstorm-energy-lab.js",
  "./advanced-workbench.css",
  "./advanced-workbench.js",
  "./hazard-intelligence.css",
  "./hazard-intelligence.js",
  "./satellite-pass-tracker.css",
  "./satellite-pass-tracker.js",
  "./secure-satellite-vpn.css",
  "./secure-satellite-vpn.js",
  "./vpn-control.css",
  "./vpn-control.js",
  "./connectivity-lab.css",
  "./connectivity-lab.js",
  "./rf-interference-intelligence.css",
  "./rf-interference-intelligence.js",
  "./space-environment.css",
  "./space-environment.js",
  "./space-comms-relay.css",
  "./space-comms-relay.js",
  "./earth-traffic-monitor.css",
  "./earth-traffic-monitor.js",
  "./btcl-signal-hub.css",
  "./btcl-signal-hub.js",
  "./manifest.webmanifest",
  "./pwa-install.js",
  "./password-lock.js",
  "./password-lock.css",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];
const OPTIONAL_ASSETS = [
  "./assets/thunderstorm-hero.webp",
  "./assets/device-cutaway.webp",
  "./assets/magnetic-coils.webp",
  "./assets/reference-demonstrator.webp",
  "./sw.js"
];

async function cacheRequiredAsset(cache, relativePath) {
  const url = new URL(relativePath, SCOPE_URL);
  const response = await fetch(new Request(url.href, { cache: 'reload' }));
  if (!response.ok) throw new Error('Required app asset unavailable (' + response.status + '): ' + relativePath);
  await cache.put(url.href, response.clone());
}

async function cacheOptionalAsset(cache, relativePath) {
  try {
    const url = new URL(relativePath, SCOPE_URL);
    const response = await fetch(new Request(url.href, { cache: 'reload' }));
    if (response.ok) await cache.put(url.href, response.clone());
  } catch (_) { /* Optional graphics must not prevent app installation. */ }
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TVX_SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(REQUIRED_SHELL.map(path => cacheRequiredAsset(cache, path)));
    await Promise.all(OPTIONAL_ASSETS.map(path => cacheOptionalAsset(cache, path)));
    // Cache the root URL separately because browsers may navigate to it without index.html.
    await cacheOptionalAsset(cache, './');
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('terravex-apex-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Never cache public feeds as if they were live.

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        const cached = await caches.match(request, { ignoreSearch: true })
          || await caches.match(new URL('./index.html', SCOPE_URL).href);
        if (cached) return cached;
        return new Response('<!doctype html><meta charset="utf-8"><title>TERRAVEX offline</title><h1>TERRAVEX APEX</h1><p>The app shell has not been cached yet. Open the app once while online, then retry.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type !== 'opaque') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      return new Response('This TERRAVEX resource is not cached and the network is unavailable.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
