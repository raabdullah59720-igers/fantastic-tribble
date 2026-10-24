/* TERRAVEX APEX installation UX. Browser owns the native install prompt. */
(() => {
  'use strict';
  let deferredPrompt = null;
  const $ = id => document.getElementById(id);
  const standalone = () => !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

  function setBadge(text, kind) {
    const node = $('pwaStatus');
    if (node) { node.textContent = text; node.className = 'badge' + (kind ? ' ' + kind : ''); }
  }
  function setMessage(text) { const node = $('pwaMessage'); if (node) node.textContent = text; }
  function showHelp(message) {
    setMessage(message);
    setBadge(window.isSecureContext ? 'BROWSER MENU INSTALL' : 'SECURE ORIGIN REQUIRED', 'warn');
    const healthNav = document.querySelector('.nav button[data-page="health"]');
    if (healthNav && !document.getElementById('page-health')?.classList.contains('active')) healthNav.click();
    setTimeout(() => $('pwaInstallHelp')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 160);
  }
  function browserInstallHint() {
    if (!window.isSecureContext) return 'Installability is unavailable on this origin. Extract the ZIP and run START-TERRAVEX-WEB-APP.bat, or deploy the folder to GitHub Pages HTTPS. Do not open index.html as file://.';
    const ua = navigator.userAgent || '';
    if (/Edg\//.test(ua)) return 'No native install prompt was exposed. In Edge use ⋯ → Apps → Install this site as an app. The desktop shortcut fallback is available in the extracted package.';
    if (/Chrome\//.test(ua)) return 'No native install prompt was exposed. In Chrome use ⋮ → Cast, save and share → Install page as app. If unavailable, use INSTALL-TERRAVEX-DESKTOP.bat in the extracted package to create a desktop shortcut that opens an app-style window.';
    return 'This browser did not provide the install prompt. Use the browser menu to install the site if supported, or use the Windows desktop shortcut installer included in the ZIP.';
  }
  async function install() {
    if (standalone()) { setBadge('APP INSTALLED', 'live'); setMessage('TERRAVEX APEX is already running in its own app window.'); return; }
    if (deferredPrompt) {
      const prompt = deferredPrompt; deferredPrompt = null;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice?.outcome === 'accepted') { setBadge('INSTALL ACCEPTED', 'live'); setMessage('Chrome/Edge accepted the installation request. Complete the browser dialog to finish installing.'); }
        else showHelp('Installation was dismissed. You can retry from the browser menu. ' + browserInstallHint());
      } catch (error) { showHelp('The browser could not open the install dialog: ' + String(error?.message || error) + '. ' + browserInstallHint()); }
      return;
    }
    showHelp(browserInstallHint());
  }
  function updateInstallReady() {
    if (standalone()) { setBadge('APP INSTALLED', 'live'); setMessage('TERRAVEX APEX is running in standalone app mode.'); }
    else if (deferredPrompt) { setBadge('INSTALL AVAILABLE', 'live'); setMessage('Browser confirms that native installation is available. Use either Install button.'); if ($('pwaInstall')) $('pwaInstall').textContent = 'Install TERRAVEX APEX'; if ($('globalInstallApp')) $('globalInstallApp').textContent = '⇩ Install App'; }
  }
  function bind() {
    ['pwaInstall', 'globalInstallApp'].forEach(id => $(id)?.addEventListener('click', event => { event.preventDefault(); void install(); }));
    const requestedPage = new URL(location.href).searchParams.get('page');
    if (requestedPage && /^[a-z][a-z0-9-]*$/i.test(requestedPage)) { const nav = document.querySelector('.nav button[data-page="' + requestedPage + '"]'); if (nav) setTimeout(() => nav.click(), 0); }
    updateInstallReady();
  }
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; updateInstallReady(); window.dispatchEvent(new CustomEvent('terravex:pwa-install-available')); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; setBadge('APP INSTALLED', 'live'); if ($('globalInstallApp')) { $('globalInstallApp').textContent = '✓ Installed'; $('globalInstallApp').title = 'TERRAVEX APEX is already installed as an app'; } if ($('pwaInstall')) $('pwaInstall').textContent = 'Installed'; setMessage('Browser confirmed that TERRAVEX APEX was installed.'); window.dispatchEvent(new CustomEvent('terravex:pwa-installed')); });
  window.TERRAVEX_PWA_INSTALL = { install, isInstalled: standalone, hasPrompt: () => !!deferredPrompt };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true }); else bind();
  if (window.matchMedia) { const media = window.matchMedia('(display-mode: standalone)'); media.addEventListener?.('change', updateInstallReady); }
})();
