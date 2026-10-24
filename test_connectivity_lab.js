// DOM-free smoke test for the connectivity calculator. No network or real RF equipment.
const assert = require('node:assert/strict');
const defaults = {
  clFrequency: '14000', clRange: '38000', clTxPower: '10', clTxGain: '42',
  clRxGain: '40', clLosses: '8', clSensitivity: '-110'
};
const nodes = new Map();
function node(id) {
  if (!nodes.has(id)) nodes.set(id, {
    id, value: defaults[id] ?? '', textContent: '', className: '', disabled: false,
    style: {}, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; },
    querySelector() { return node(id + '-led'); }
  });
  return nodes.get(id);
}
node('page-connectivitylab');
globalThis.document = {
  getElementById: node,
  addEventListener() {},
};
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
globalThis.window = { addEventListener() {} };
require('./connectivity-lab.js');
assert.equal(node('clFspl').textContent, '206.97 dB');
assert.equal(node('clEirp').textContent, '52.00 dBW');
assert.equal(node('clRxPower').textContent, '-92.97 dBm');
assert.equal(node('clMargin').textContent, '+17.03 dB');
assert.equal(node('clVisualState').textContent, 'SIMULATED PATH');
// Invalid frequencies must not produce Infinity/NaN in outputs.
node('clFrequency').value = '0';
node('clFrequency').listeners.input();
assert.equal(node('clMargin').textContent, 'INVALID');
assert.equal(node('clMarginBar').style.width, '0%');
console.log('Connectivity lab reference checks: 6 assertions passed');
