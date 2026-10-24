/* Early PWA install-prompt capture. beforeinstallprompt is browser-specific and not guaranteed. */
(() => {
  'use strict';
  let deferredPrompt = null;
  let initialized = false;
  const $ = id => document.getElementById(id);
  const standalone = () => !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

  function setBadge(text, kind) {
    const node = $('pwaStatus');
    if (!node) return;
    node.textContent = text;
    node.className = 'badge' + (kind ? ' ' + kind : '');
  }
  function setMessage(text) {
    const node = $('pwaMessage');
    if (node) node.textContent = text;
    const globalButton = $('globalInstallApp');
    if (globalButton && standalone()) {
      globalButton.textContent = '✓ Installed';
      globalButton.title = 'TERRAVEX APEX is already installed as an app';
    }
  }
  function browserInstallHint() {
    if (!window.isSecureContext) {
      return 'This page is not running from a secure installable origin. Do not open index.html by double-clicking it. Extract the ZIP and run START-TERRAVEX-WEB-APP.bat to open http://127.0.0.1:8000, or publish it on GitHub Pages HTTPS.';
    }
    const ua = navigator.userAgent || '';
    if (/Edg\//.test(ua)) {
      return 'Browser did not provide a one-click install prompt. In Microsoft Edge use ⋯ → More tools → Apps → Install this site as an app. After installation, check edge://apps.';
    }
    if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) {
      return 'Browser did not provide a one-click install prompt. In Chrome open ⋮ and choose the available “Install page as app” / “Install TERRAVEX APEX” menu item. Wording varies by Chrome version.';
    }
    return 'This browser did not provide a one-click PWA prompt. Use its menu option such as “Install app”, “Add to Home Screen”, or “Create shortcut”, if available. For desktop installation, Chrome or Edge is recommended.';
  }
  async function install() {
    if (standalone()) {
      setBadge('APP INSTALLED', 'live');
      setMessage('TERRAVEX APEX is already running in its installed app window.');
      return;
    }
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      deferredPrompt = null;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setBadge('INSTALL ACCEPTED', 'live');
          setMessage('The browser accepted the install request. Wait for the app window/confirmation; if it does not appear, use the browser menu installation option.');
        } else {
          setMessage('Installation was dismissed. You can try again from the browser menu at any time.');
        }
      } catch (error) {
        setMessage('The browser could not open its install dialog: ' + String(error && error.message || error) + '. ' + browserInstallHint());
      }
      return;
    }
    setMessage(browserInstallHint());
    setBadge(window.isSecureContext ? 'BROWSER MENU INSTALL' : 'SECURE ORIGIN REQUIRED', 'warn');
    const healthNav = document.querySelector('.nav button[data-page="health"]');
    if (healthNav) healthNav.click();
    setTimeout(() => $('pwaMessage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }
  function updateInstallReady() {
    if (standalone()) {
      setBadge('APP INSTALLED', 'live');
      setMessage('TERRAVEX APEX is already installed in standalone app mode.');
    } else if (deferredPrompt) {
      setBadge('INSTALL AVAILABLE', 'live');
      setMessage('The browser has confirmed that one-click installation is available. Use either Install button.');
      if ($('pwaInstall')) $('pwaInstall').textContent = 'Install TERRAVEX APEX';
      if ($('globalInstallApp')) $('globalInstallApp').textContent = '⇩ Install App';
    }
  }
  function bind() {
    if (initialized) return;
    initialized = true;
    ['pwaInstall', 'globalInstallApp'].forEach(id => $(id)?.addEventListener('click', event => {
      event.preventDefault();
      void install();
    }));
    const requestedPage = new URL(location.href).searchParams.get('page');
    if (requestedPage && /^[a-z][a-z0-9-]*$/i.test(requestedPage)) {
      const nav = document.querySelector('.nav button[data-page="' + requestedPage + '"]');
      if (nav) setTimeout(() => nav.click(), 0);
    }
    updateInstallReady();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    updateInstallReady();
    window.dispatchEvent(new CustomEvent('terravex:pwa-install-available'));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setBadge('APP INSTALLED', 'live');
    if ($('globalInstallApp')) { $('globalInstallApp').textContent = '✓ Installed'; $('globalInstallApp').title = 'TERRAVEX APEX is already installed as an app'; }
    if ($('pwaInstall')) $('pwaInstall').textContent = 'Installed';
    setMessage('Browser confirmed that TERRAVEX APEX was installed.');
    window.dispatchEvent(new CustomEvent('terravex:pwa-installed'));
  });
  window.TERRAVEX_PWA_INSTALL = { install, isInstalled: standalone, hasPrompt: () => !!deferredPrompt };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  if (window.matchMedia) {
    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener?.('change', updateInstallReady);
  }
})();
