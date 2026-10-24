/* TERRAVEX APEX device-level password gate.
   Stores only a PBKDF2-SHA-256 verifier + random salt, never the plaintext password.
   This is a local UI lock, NOT server-side authorization for a public static website. */
(() => {
  'use strict';
  const STORE_KEY = 'terravex.apex.device-lock.v1';
  const ITERATIONS = 310000;
  const $ = id => document.getElementById(id);
  let failures = 0;
  let blockedUntil = 0;
  let busy = false;

  function b64(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }
  function fromB64(value) {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
  }
  async function derive(password, salt, iterations) {
    if (!crypto?.subtle) throw new Error('Secure Web Crypto is unavailable. Open this app from HTTPS or http://127.0.0.1.');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, 256);
    return new Uint8Array(result);
  }
  function equalBytes(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }
  function readRecord() {
    try {
      const value = localStorage.getItem(STORE_KEY);
      if (!value) return null;
      const record = JSON.parse(value);
      if (record?.version === 1 && record.salt && record.hash && Number.isInteger(record.iterations)) return record;
    } catch (_) { /* Treat corrupted local state as unavailable, never unlock on parse failure. */ }
    return null;
  }
  function setMessage(message, error = false) {
    const node = $('tvxGateMessage');
    if (node) { node.textContent = message; node.classList.toggle('error', error); }
  }
  function setBusy(value) {
    busy = value;
    const btn = $('tvxGateSubmit');
    if (btn) { btn.disabled = value; btn.textContent = value ? 'Please wait…' : (readRecord() ? 'Unlock app' : 'Create password & open app'); }
  }
  function renderMode() {
    const record = readRecord();
    const setup = !record;
    $('tvxGateTitle').textContent = setup ? 'Create your app password' : 'Unlock TERRAVEX APEX';
    $('tvxGateSubtitle').textContent = setup
      ? 'Create a password for this browser/device. You will need it next time this app opens.'
      : 'Enter the password saved on this browser/device to open the application.';
    $('tvxGateConfirmWrap').hidden = !setup;
    $('tvxGateSubmit').textContent = setup ? 'Create password & open app' : 'Unlock app';
    $('tvxGatePassword').autocomplete = setup ? 'new-password' : 'current-password';
    $('tvxGatePassword').value = '';
    $('tvxGateConfirm').value = '';
    setMessage(setup ? 'Use at least 10 characters. Your password itself will not be stored.' : 'Password is required each time the app opens.');
  }
  function openGate() {
    document.documentElement.classList.add('tvx-lock-pending');
    document.documentElement.classList.remove('tvx-app-unlocked');
    document.documentElement.style.overflow = 'hidden';
    const gate = $('tvxPasswordGate');
    if (gate) gate.hidden = false;
    renderMode();
    setTimeout(() => $('tvxGatePassword')?.focus(), 40);
  }
  function unlock() {
    document.documentElement.classList.remove('tvx-lock-pending');
    document.documentElement.classList.add('tvx-app-unlocked');
    document.documentElement.style.overflow = '';
    const gate = $('tvxPasswordGate');
    if (gate) gate.hidden = true;
    $('tvxGatePassword').value = '';
    $('tvxGateConfirm').value = '';
    window.dispatchEvent(new CustomEvent('terravex:app-unlocked'));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    if (Date.now() < blockedUntil) {
      setMessage('Too many failed attempts. Wait ' + Math.ceil((blockedUntil - Date.now()) / 1000) + ' seconds, then try again.', true);
      return;
    }
    const password = $('tvxGatePassword').value;
    if (password.length < 10 || password.length > 128) {
      setMessage('Use a password between 10 and 128 characters.', true);
      $('tvxGatePassword').focus();
      return;
    }
    setBusy(true);
    try {
      const existing = readRecord();
      if (!existing) {
        if (password !== $('tvxGateConfirm').value) {
          setMessage('The two passwords do not match. Try again.', true);
          $('tvxGateConfirm').focus();
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hash = await derive(password, salt, ITERATIONS);
        localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1, algorithm: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: b64(salt), hash: b64(hash), createdAt: new Date().toISOString() }));
        unlock();
        return;
      }
      const candidate = await derive(password, fromB64(existing.salt), existing.iterations);
      if (equalBytes(candidate, fromB64(existing.hash))) {
        failures = 0;
        unlock();
      } else {
        failures++;
        if (failures >= 5) { blockedUntil = Date.now() + 30000; failures = 0; }
        setMessage(blockedUntil > Date.now() ? 'Too many failed attempts. Wait 30 seconds.' : 'Incorrect password. Please try again.', true);
        $('tvxGatePassword').select();
      }
    } catch (error) {
      setMessage('Password operation failed safely: ' + String(error?.message || error) + ' No password was saved in plaintext.', true);
    } finally { setBusy(false); }
  }
  function init() {
    const form = $('tvxGateForm');
    if (!form || !$('tvxPasswordGate')) return;
    form.addEventListener('submit', handleSubmit);
    $('tvxGateShowPassword')?.addEventListener('change', event => {
      const type = event.target.checked ? 'text' : 'password';
      $('tvxGatePassword').type = type;
      $('tvxGateConfirm').type = type;
    });
    $('appLockBtn')?.addEventListener('click', openGate);
    $('tvxGateClearForm')?.addEventListener('click', () => {
      $('tvxGatePassword').value = '';
      $('tvxGateConfirm').value = '';
      setMessage('Fields cleared. The saved local password was not changed.');
      $('tvxGatePassword').focus();
    });
    renderMode();
    openGate();
  }
  window.TERRAVEX_APP_LOCK = { lock: openGate, isUnlocked: () => document.documentElement.classList.contains('tvx-app-unlocked') };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
