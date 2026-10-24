# TERRAVEX APEX — Space Communications Guide (v16)

The current implementation and setup instructions are in [`SPACE-COMMS-REAL-VOICE-MAIL.md`](SPACE-COMMS-REAL-VOICE-MAIL.md), with relay implementation details in [`relay-server/README.md`](relay-server/README.md).

The app supports browser-to-browser WebRTC voice/text after pairing, and an end-to-end encrypted temporary internet voice mailbox after the relay is publicly deployed. The included local launcher only serves the same computer; `127.0.0.1` is not reachable from a second device.

Neither path transmits directly to a spacecraft or creates a Russian satellite provider connection. Real satellite service requires a provider arrangement, compatible terminal, authorised radio use and valid credentials. ARISS astronaut contacts are scheduled through its official contact pathway. Do not use this prototype for critical emergency messages.
