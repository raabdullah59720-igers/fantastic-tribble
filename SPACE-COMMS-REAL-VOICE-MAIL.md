# TERRAVEX APEX — End-to-End Encrypted Internet Voice Mail & One-Room Voice Link (v16)

## What this upgrade really does

- **Local voice memo:** record through the browser microphone, play it back, and download audio plus message details. Requires HTTPS or localhost and microphone permission.
- **One-room live peer call:** WebRTC can connect two app users after they pair. Audio and the peer voice-mail transfer use the browser's WebRTC connection. A signaling service exchanges setup metadata only.
- **Asynchronous internet voice mailbox:** create a random `mailbox-address.encryption-secret` key, share it privately with the intended TERRAVEX recipient, and send a recorded voice message through the configured HTTPS API. The server stores only AES-GCM ciphertext in process memory for up to 24 hours; the recipient can check and decrypt it later while offline. Audio is limited to 8 MiB, 8 messages per inbox, and the server has a 64 MiB aggregate memory cap. Messages may be lost when the service restarts or deploys; this is a prototype mailbox, not guaranteed or emergency-grade delivery.
- **End-to-end encryption:** audio and metadata are encrypted in the sender's browser using AES-GCM before upload and decrypted in the recipient's browser. The server receives the random mailbox address and ciphertext, not the encryption secret or plaintext voice/notes. Anyone you share the complete inbox key with can decrypt messages in that shared inbox. The key is not automatically stored by TERRAVEX; save it safely.
- **Dependency-free signaling service:** `relay-server/server.js` uses only Node.js 18+ built-ins. Local pairing does not require `npm install` or a network package download.
- **Public satellite observation catalogue:** SatNOGS remains read-only observation metadata. It is not a spacecraft uplink or astronaut voicemail inbox.

The server does not provide persistent database storage or guaranteed uptime. Do not use this prototype to send critical emergency messages; use verified official services for emergency response.

## Local Windows quick start

1. Install Node.js 18 or newer (the static app works without Node; local signaling and internet mailbox service use built-in Node modules only, with no `npm install`).
2. Extract the entire ZIP.
3. Double-click `START-TERRAVEX-COMMS-ONE-RUN.bat`. It opens a local signaling/mailbox service in one console and launches the app at `http://127.0.0.1:8000/` in the other.
4. Wait until the relay console says it is listening on port 8787.
5. Open the Space Communications & Voice Relay panel. One browser chooses **Create one-run room**, then shares the room code privately. The other client joins the same room code.
6. Both users grant microphone permission. If ICE connects, voice and text are live. A room code connects two app users, not a spacecraft.

Local mode is suitable for a same-computer test only. Both the static web server and local relay bind to `127.0.0.1`, which is not reachable from a second computer or phone on the LAN. To connect separate devices over the internet, deploy the public relay and point both browsers to the hosted `wss://` endpoint.

## Enable asynchronous internet voice mail and connect peers over the public internet

A public HTTPS web app needs a public WSS signalling endpoint. This package includes a small Node.js service under `relay-server/` and a `render.yaml` Blueprint.

1. Push the repository (including `relay-server/` and `render.yaml`) to a GitHub repository you control.
2. In Render, create a new Blueprint from that repository and deploy `terravex-voice-signaling-relay`.
3. Set `ALLOWED_ORIGINS` to the exact **origin** of the published app, without a path or trailing slash. For example, for a GitHub Pages site it may look like `https://YOUR-ACCOUNT.github.io`. Include `http://127.0.0.1:8000,http://localhost:8000` only if you also want the local launcher to connect to this relay. The same host serves an HTTPS API for temporary encrypted voice mail; your app converts the configured WSS relay host to HTTPS automatically.
4. Wait for `/healthz` to return JSON with `ok: true`, then copy the service's `wss://...` URL into **Signaling server WSS/WS URL** in TERRAVEX.
5. The host creates a room and shares its code privately; the guest joins it.

The signalling server accepts only allowed browser origins, allows two peers per room, rate-limits room-join attempts, caps messages, and expires idle rooms. It does **not** provide TURN media relay. A few networks block direct WebRTC paths; those require a TURN server you control or a trusted hosted TURN service. Configure temporary TURN credentials in the optional ICE JSON field. Do not commit TURN secrets to GitHub or store long-lived credentials in a public web app.

## Is this a real Russian-satellite/astronaut voice mail?

**No.** A successful WebRTC call is a real browser-to-browser internet call, not a satellite uplink. A satellite is not a generic public inbox where this app can post an audio file. RSCC offers commercial communications services that require an operator arrangement and compatible ground terminal; the panel links to its official service information but cannot activate service or invent provider credentials.

For an astronaut voice contact, ARISS organises scheduled amateur-radio/telebridge contacts, typically for educational organisations and with radio operators and station equipment. It is not an instant open voicemail service. Follow the official application and local radio licensing path. Bangladesh's BTRC states that radio apparatus operation/frequency use is subject to licensing and allocation requirements.

Official sources:
- RSCC communication services: <https://eng.rscc.ru/services/>
- ARISS contact guidance: <https://www.ariss.org/about-ariss-contacts.html>
- ARISS applying for contacts: <https://www.ariss.org/>
- Bangladesh Telecommunications Regulatory Commission: <https://btrc.gov.bd/>
- WebRTC TURN guidance: <https://webrtc.org/getting-started/turn-server>

## Privacy & emergency use

- Audio and message notes stay on this device unless you explicitly download or send them to a paired browser peer.
- The signalling relay forwards WebRTC offer/answer metadata only. WebRTC audio/data goes peer-to-peer unless a TURN service is used.
- A room code is temporary rendezvous information, not a satellite access token.
- An emergency packet sent to a peer is **not** delivered to police, rescue agencies, a satellite, spacecraft or mission control. For immediate danger, use verified local emergency services; do not wait for a peer or satellite connection.
