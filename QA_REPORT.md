# TERRAVEX APEX — Space Communications & Encrypted Voice Mail Upgrade QA

Build: **TERRAVEX APEX v16 cache / encrypted internet voice-mail relay update**  
Verification date: **24 October 2026**  
Scope: Existing TERRAVEX APEX space, atmosphere, geospatial, hazards, satellite tracker, VPN bridge, PWA, RF simulation, and new encrypted internet voice mailbox + dependency-free WebSocket signalling relay.

## Deliverable inventory

- **88 files** in the ready-to-upload project folder after removing temporary patch scripts and Python bytecode/cache artifacts; this remains below the 98-file limit.
- The package ZIP contains the same 88 project files at its root, including `index.html`, `manifest.webmanifest`, PWA icons, all retained panels, `relay-server/`, launchers, and test scripts.

## Verified checks

- HTML parsed: **695 IDs, 0 duplicate IDs**.
- Local HTML/asset references: **0 missing**.
- PWA manifest: valid JSON; `standalone` display; 192px and 512px icons; **10 shortcut targets checked, 0 invalid**.
- Service-worker cache: `terravex-apex-shell-v16`; **39 required app-shell resources, 0 missing**.
- PWA diagnostics/cache version parity: **PASS**.
- JavaScript syntax: **19 files checked, 0 errors**.
- CSS parser: **16 stylesheets checked, 0 errors**.
- Python syntax: **4 files checked, 0 errors**.
- Windows launcher files: required files present; Windows execution was not available in this environment.
- ZIP CRC/integrity: **PASS**.

## Functional and integration tests

- Space communications math/UI binding tests: **16 assertions passed**.
- Voice-mail/service static checks: **PASS** (AES-GCM encrypt/decrypt hooks, key shape validation, mailbox UI IDs, API routes, exact-origin CORS, TTL and no npm runtime dependencies).
- Dependency-free relay integration: **14 check groups passed**. This starts a local test server and checks health, mailbox send/list/read/ack with ciphertext, origin rejection, WebSocket handshake, room join and signalling messages. It does not make an external internet call or send media to a satellite.
- PWA omnibox regression: **9/9 PASS**.
- RF interference simulation: **5/5 PASS**.
- Space environment data/math checks: **11 assertions passed**.
- Connectivity/link budget reference calculations: **6 assertions passed**.
- VPN bridge isolated tests: **11/11 PASS**, using a fake CLI; no real VPN was toggled by these tests.
- Static QA suite: **0 errors**.

## Voice-mail architecture and limitations

- Browser records a local audio memo with explicit microphone permission.
- For live peer audio/text, the app uses WebRTC; signalling relays offer/answer/ICE only. Without TURN, some networks cannot establish a peer path.
- For asynchronous internet voice mail, the sender encrypts audio and metadata in the browser using AES-GCM before upload. The service stores ciphertext in in-process memory for up to 24 hours, supports up to 8 messages per inbox and 64 MiB aggregate ciphertext, and drops messages on restart/deployment. It is a prototype, not guaranteed storage or emergency-grade delivery.
- Mailbox keys are random `mailboxId.secret` capabilities. The random mailbox address identifies the inbox; the 256-bit secret remains client-side and is not sent to the relay. Share the complete key privately only with the intended correspondent. Anyone with the complete key can decrypt messages. A person with only the address can still list/delete ciphertext, so treat the full key as sensitive.
- The local one-run launcher binds app and relay to `127.0.0.1`, so it works on the same computer only. For separate devices over the internet, deploy `relay-server/` through `render.yaml`, set `ALLOWED_ORIGINS` to the exact published HTTPS app origin, and set the app's relay field to the deployed `wss://` URL. Configure a trusted TURN service if peer audio fails on restrictive networks.
- This is **internet app-to-app voice mail**, not a Russian-satellite or spacecraft uplink. No Russian satellite account, modem, terminal, carrier subscription, spacecraft inbox, or authorised RF path is included. Public satellite observations (e.g. SatNOGS) are read-only catalogue records, not communications access.

## Not verified in this environment

- Final public deployment on GitHub Pages or Render.
- Real public SatNOGS feed delivery from the user's browser.
- A two-device WebRTC audio session across the public internet, or a deployed public mailbox request.
- Production persistence/delivery reliability; current mailbox is volatile process memory.
- Actual Windows desktop/PWA installation flow or real Tailscale/WireGuard state.
- Any radio transmission, satellite carrier link, astronaut contact, or spacecraft uplink.

## Reproduce tests

```bash
node --check relay-server/server.js
node tests/test-space-comms-relay.cjs
node tests/test-voice-mail-service-v16.cjs
node tests/test-relay-server.cjs
node tests/test-pwa-omnibox.cjs
node tests/test-rf-interference-intelligence.cjs
node tests/test-space-environment.cjs
node test_connectivity_lab.js
python test_vpn_bridge.py
python run-static-qa.py
python run-space-env-tests.py
```

Passing local tests establishes software/package behaviour only. It does not establish live satellite connectivity, public hosting availability, message delivery guarantees or any emergency service integration.
