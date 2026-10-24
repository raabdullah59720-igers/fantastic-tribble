/* TERRAVEX APEX PWA install UX.
   Important: do NOT preventDefault() on beforeinstallprompt. Leaving it unhandled
   preserves Chrome's native omnibox Install icon/menu. The in-app button is a guide/fallback. */
(() => {
  'use strict';
  let installEventSeen = false;
  const $ = id => document.getElementById(id);
  const standalone = () => !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  const isChrome = () => /Chrome\//.test(navigator.userAgent || '') && !/Edg\//.test(navigator.userAgent || '');
  const isEdge = () => /Edg\//.test(navigator.userAgent || '');

  function setBadge(text, kind) {
    const node = $('pwaStatus');
    if (node) { node.textContent = text; node.className = 'badge' + (kind ? ' ' + kind : ''); }
  }
  function setMessage(text) { const node = $('pwaMessage'); if (node) node.textContent = text; }
  function menuInstructions() {
    if (!window.isSecureContext) return 'Not install-ready on this address. Use the HTTPS GitHub Pages URL, or the included START-TERRAVEX-WEB-APP.bat on Windows at http://127.0.0.1:8000. Do not open index.html with file://.';
    if (isEdge()) return 'Use the Install icon at the right of the address bar if shown. Otherwise open ⋯ → Apps → Install this site as an app.';
    if (isChrome()) return 'Use Chrome’s Install icon at the right of the address bar if shown. Otherwise open ⋮ → Cast, save and share → Install page as app. The browser controls this UI; the website cannot force it to appear.';
    return 'Use your browser’s Install/Add to desktop or Add to Home Screen menu if available. Browser support and labels vary.';
  }
  function showHelp(message) {
    setMessage(message || menuInstructions());
    setBadge(standalone() ? 'APP INSTALLED' : (window.isSecureContext ? (installEventSeen ? 'INSTALL AVAILABLE' : 'CHECK BROWSER INSTALL MENU') : 'SECURE ORIGIN REQUIRED'), standalone() ? 'live' : 'warn');
    const healthNav = document.querySelector('.nav button[data-page="health"]');
    if (healthNav && !document.getElementById('page-health')?.classList.contains('active')) healthNav.click();
    setTimeout(() => $('pwaInstallHelp')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 160);
  }
  async function install() {
    if (standalone()) {
      setBadge('APP INSTALLED', 'live');
      setMessage('TERRAVEX APEX is already running as an installed app.');
      return;
    }
    // Keep Chrome/Edge's own address-bar icon available. Calling event.prompt() here
    // would require suppressing the browser UI with preventDefault(), which was the bug.
    showHelp(installEventSeen
      ? 'Your browser has identified the app as installable. The native Install control is enabled by the browser near the address bar. Click that icon to install. ' + menuInstructions()
      : menuInstructions());
  }
  function updateState() {
    if (standalone()) {
      setBadge('APP INSTALLED', 'live');
      setMessage('TERRAVEX APEX is running in standalone app mode.');
      const b = $('globalInstallApp'); if (b) { b.textContent = '✓ Installed'; b.title = 'TERRAVEX APEX is already installed as an app'; }
      const p = $('pwaInstall'); if (p) p.textContent = 'Installed';
    } else if (installEventSeen) {
      setBadge('INSTALL AVAILABLE', 'live');
      setMessage('Chrome/Edge has recognized this app for installation. Use the browser Install icon beside the address bar, or click below for instructions.');
      const b = $('globalInstallApp'); if (b) b.textContent = '⇩ Install App';
      const p = $('pwaInstall'); if (p) p.textContent = 'Show install options';
    } else if (!window.isSecureContext) {
      setBadge('SECURE ORIGIN REQUIRED', 'warn');
      setMessage('Open the HTTPS GitHub Pages site or the included local launcher at http://127.0.0.1:8000. ZIP preview and file:// do not create a PWA install origin.');
    } else {
      setBadge('CHECKING INSTALLABILITY', 'sim');
      setMessage('Checking manifest and service worker. The browser’s install icon appears only when its install conditions are met.');
    }
  }
  function registerServiceWorkerEarly() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    const base = new URL('./', document.baseURI);
    navigator.serviceWorker.register(new URL('./sw.js', document.baseURI), {
      scope: base.pathname,
      updateViaCache: 'none'
    }).then(() => {
      window.dispatchEvent(new CustomEvent('terravex:pwa-sw-registration-requested'));
    }).catch(error => {
      console.warn('TERRAVEX PWA service worker registration failed:', error);
      setBadge('SERVICE WORKER UNAVAILABLE', 'warn');
      setMessage('The app is open, but offline shell registration failed: ' + String(error?.message || error) + '. Confirm sw.js and all app assets are deployed to the same root.');
    });
  }
  function bind() {
    ['pwaInstall', 'globalInstallApp'].forEach(id => $(id)?.addEventListener('click', event => { event.preventDefault(); void install(); }));
    const requestedPage = new URL(location.href).searchParams.get('page');
    if (requestedPage && /^[a-z][a-z0-9-]*$/i.test(requestedPage)) {
      const nav = document.querySelector('.nav button[data-page="' + requestedPage + '"]');
      if (nav) setTimeout(() => nav.click(), 0);
    }
    updateState();
  }
  // Do not call preventDefault: preserve Chrome/Edge's native address-bar install control.
  window.addEventListener('beforeinstallprompt', () => {
    installEventSeen = true;
    updateState();
    window.dispatchEvent(new CustomEvent('terravex:pwa-install-available'));
  });
  window.addEventListener('appinstalled', () => {
    installEventSeen = false;
    updateState();
    setMessage('Browser confirmed that TERRAVEX APEX was installed. Launch it from the desktop/start menu.');
    window.dispatchEvent(new CustomEvent('terravex:pwa-installed'));
  });
  window.TERRAVEX_PWA_INSTALL = { install, isInstalled: standalone, hasPrompt: () => installEventSeen, menuInstructions };
  registerServiceWorkerEarly();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true }); else bind();
  if (window.matchMedia) {
    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener?.('change', updateState);
  }
})();
