# TERRAVEX Signalling + Encrypted Voice-Mail Service

Node.js 18+ service using built-in modules only. No external npm dependency or `npm install` is required to run it locally. It provides:

- WebSocket signaling for a two-browser WebRTC audio/data session; signaling messages include only offer/answer/ICE metadata.
- A separate HTTPS/HTTP JSON API for asynchronous voice mail. Voice and message details are AES-GCM encrypted in the sender's browser before upload; this service only sees ciphertext.
- A 24-hour maximum in-memory message TTL, 8 MiB per audio message, 8 messages per mailbox, 64 MiB total ciphertext capacity, exact-origin CORS allow-list and request rate cap.

## Local start

```bash
HOST=127.0.0.1 PORT=8787 ALLOWED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000 node server.js
```

Health: `http://127.0.0.1:8787/healthz`

On Windows, `START-TERRAVEX-COMMS-ONE-RUN.bat` starts the local service and app in separate windows. Node.js 18+ is required for this connection layer; the static application and local recording/playback can still open without it.

## Hosted deployment

Use the root `render.yaml` Blueprint or create a Node service with root directory `relay-server`, build command `node --check server.js`, start command `npm start`, health path `/healthz`. Set `ALLOWED_ORIGINS` to the exact web-app origin, e.g. `https://account.github.io` (no path or trailing slash). Once deployed, use the service's `wss://` URL in TERRAVEX; the mailbox API is then called over `https://` on the same host. Check `/healthz` before using it.

## Limits and privacy

- This is temporary, in-memory storage. A process restart, deployment or instance replacement can lose messages before the 24-hour expiry. There is no database/backup/guaranteed delivery.
- The mailbox address is a random 128-bit identifier and the secret is a random 256-bit AES key. A complete inbox key is a capability: only share it with the intended participant, because they can decrypt messages in that mailbox.
- The server stores only encrypted audio/metadata, not plaintext content. It does see mailbox address, message size and timestamps.
- Signaling rooms accept two peers, use exact Origin allow-lists, bounded frames, short join windows, rate limits and idle expiry. This service does not relay WebRTC audio and does not provide TURN; restrictive NAT/firewall combinations require a TURN service you control.
- This service does not connect to a Russian satellite, ISS, astronaut, emergency agency or spacecraft. Satellite service requires an operator, compatible terminal, subscription and regulatory authorisation. Do not rely on this prototype for emergency dispatch.
