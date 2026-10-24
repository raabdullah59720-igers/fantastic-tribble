# TERRAVEX APEX QA Report — Chrome Address-Bar Install Fix

Build: `TERRAVEX-APEX-OMNIBOX-INSTALL-FIX` · PWA shell cache `terravex-apex-shell-v11`

## Main bug fixed

The previous `pwa-install.js` called `event.preventDefault()` inside the `beforeinstallprompt` listener. That suppresses Chrome/Edge's default browser install UI, including its native address-bar Install affordance, unless the site manually invokes the retained prompt. The install UX is now intentionally non-intercepting: the handler records that installation is available but does not cancel the browser event. The in-app Install buttons now guide users to the browser's native address-bar icon or menu. The website cannot force the browser chrome icon to appear; browser eligibility, profile state, and policy still decide visibility.

## Static and focused checks

- `python run-static-qa.py`: **0 errors**.
- HTML parsed: **600 IDs, 0 duplicate IDs**; all local script/style/image references exist.
- Manifest: valid JSON; stable relative `id`, `start_url`, and `scope`; `display=standalone`; 192×192 and 512×512 PNG icons declared.
- Service worker: `terravex-apex-shell-v11`; **35 required app-shell assets**, missing **0**; runtime diagnostics expect v11.
- Manifest shortcuts: **5 checked**, all target existing page IDs.
- JavaScript syntax: **17 root JS files**, 0 errors.
- CSS parse: **14 stylesheets**, 0 errors.
- Python syntax: bridge, bridge test and static QA script parse.
- PWA omnibox regression test: `node tests/test-pwa-omnibox.cjs`, **9/9 PASS**. Confirms `beforeinstallprompt` listener exists, the listener itself does not call `preventDefault`, manifest and icons are present, and service-worker cache version matches diagnostics.
- RF panel focused functional tests: `node tests/test-rf-interference-intelligence.cjs`, **5/5 PASS**.
- Local VPN bridge tests: `python test_vpn_bridge.py`, **11/11 PASS**, using a fake VPN CLI.
- ZIP archive integrity: checked with `ZipFile.testzip`; no corrupt entry reported.

## Not tested / limits

- Browser automation/native Chrome address-bar icon was not executed in this environment. The hosted/installed result must be verified in the user's Chrome profile.
- GitHub Pages deployment and production external APIs were not tested.
- No actual Tailscale/WireGuard tunnel, SDR or satellite link was operated. VPN tests use a fake CLI; RF module is receive-only and virtual.
- A PWA must open from HTTPS or `http://localhost` / `http://127.0.0.1`, not from a sandbox download URL or `file://`. After uploading this build, hard reload the site and allow the v11 service worker to activate.

## Browser install troubleshooting

1. Upload every file and `assets/` to the repository root; do not upload the ZIP itself as the website.
2. Open the actual HTTPS GitHub Pages URL in Chrome, not the sandbox download link.
3. Check DevTools → Application → Manifest and Service Workers; confirm the manifest and icons load with HTTP 200 and the v11 service worker activates.
4. If an older copy was cached, use Source Health & PWA → Refresh cached app shell, reload, or clear only this origin's site data and reopen it.
5. Check whether the app is already installed in that Chrome profile and whether browser/organization policy disables installs.
6. If the address-bar icon still does not appear, use Chrome's **⋮ → Cast, save and share → Install page as app** menu when available. A webpage cannot force Chrome's own UI to display an icon.
