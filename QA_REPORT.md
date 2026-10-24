# TERRAVEX APEX QA Report — One-use Pairing + Emergency RF Link Budget Lab

Build: `TERRAVEX-APEX-PAIRING-LINK-LAB` · PWA shell cache `terravex-apex-shell-v9`

## Checks performed

- Static QA script completed with **0 errors**.
- Main HTML parsed: **568 IDs, 0 duplicate IDs**; all local script/style/image links exist.
- Manifest JSON passes; standalone display, start URL/scope, 192×192 and 512×512 icon declarations are present. **4 manifest shortcuts** point to existing app pages.
- Service worker uses `terravex-apex-shell-v9`. All **33 required shell assets** exist, and PWA diagnostics in `advanced-workbench.js` expect the same v9 cache.
- JavaScript syntax: **16 files**, 0 syntax errors.
- CSS parser: **13 stylesheets**, 0 parse errors.
- Python syntax: bridge, unit tests, and static-QA script parse successfully.
- Local HTTP smoke test: `/`, `/manifest.webmanifest`, `/sw.js`, and `/connectivity-lab.js` returned HTTP 200 from a loopback test server.
- Local fake-client VPN bridge tests: **11/11 pass**. Tests include fixed ON/OFF/status commands, refusal of arbitrary actions, exact-origin allow-list, one-use token exchange, token expiry, invalid-token retry, session-only authorization, expired-session rejection and pair schema.
- RF link-budget calculator fake-DOM smoke test: **6 assertions pass**. Reference values: FSPL `206.97 dB`, EIRP `52.00 dBW`, receive power `-92.97 dBm`, margin `+17.03 dB`; invalid zero-frequency input rejected.
- Final ZIP includes **62 file entries** (no folders listed as entries, no `.pyc`/`__pycache__`, and no generated `vpn-bridge-config.json`). `ZipFile.testzip` returned no error.

## Not tested / capability boundaries

- No actual Tailscale/WireGuard tunnel was switched on this runtime; tests use an isolated fake CLI.
- No Russian satellite provider token, terminal, carrier session, private VPN credentials, subscription, or physical satellite link is supplied or generated. The one-run token is generated locally by the bridge process at startup, valid for 10 minutes, and consumed once; it cannot be prepared in advance for the user's computer.
- Native Chrome/Edge installation prompt and Windows shortcut scripts were not executed on a Windows desktop in this build environment. PWA manifest, icons, local resource references, loopback HTTP server smoke test, and service-worker cache were checked. A PWA must open from HTTPS or localhost/loopback; `file://` from a ZIP is not a registered PWA origin. Chrome may suppress `beforeinstallprompt`; use the browser menu if needed.
- A public HTTPS website contacting `127.0.0.1` can trigger Chrome's Local Network Access / loopback permission. Allow it only for a trusted app you operate.
- External satellite-carrier availability, public API availability and GitHub Pages deployment were not verified.
- The session token remains in the current tab's `sessionStorage` until expiry/clear/tab end; a compromised same-origin script could expose it. This is not a replacement for server-side authentication.

## Link budget warning

The Emergency Link Budget Lab is an illustrative RF calculator. A positive margin is not proof of an actual carrier connection. Real link engineering must include authorized frequencies, terminal/provider parameters, noise, fade, pointing, polarization, bandwidth, coding/modulation, regulatory compliance and field measurements.


## RF Spectrum & Interference Intelligence module

- Added `page-rfintel` as a separate Operations panel and mapped it to the command palette/nav registry.
- Added `rf-interference-intelligence.js` and `.css` to the service-worker required shell; cache version advanced to v10 and diagnostics/QA parity updated.
- Added an install shortcut for the RF Monitor panel.
- Static validation: no inline radio transmit/JAM command in the new module; expected UI IDs are present; source references are present.
- CSV import is local/read-only, capped at 2 MiB and 5,000 data samples, and requires `frequency_mhz,power_dbm`. It does not upload the file.
- Scenarios, peak detection and quality score are illustrative heuristics, not proof of an intentional jammer or certified RF measurements.
- No real RF hardware, SDR, satellite transponder, or public network is contacted by the module.


## Focused RF panel test results

Executed `node tests/test-rf-interference-intelligence.cjs`: 5/5 pass. The tests cover the expected clean-channel SNR, modeled SNR degradation as simulated interference increases, pause/reset controls, local CSV import plus one candidate peak, and invalid bandwidth rejection. This harness uses a mocked DOM/canvas and a local mock CSV; it does not represent a real receiver, transmitter, satellite link, or browser installation test.
