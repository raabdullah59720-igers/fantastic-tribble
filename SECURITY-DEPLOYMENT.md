# TERRAVEX APEX: Secure access and connectivity notes

## Critical distinction

The static GitHub Pages application is a frontend dashboard. It cannot create a satellite-radio link, provision a commercial satellite subscription, start an operating-system VPN, or reliably inspect whether a VPN tunnel is active. The new panel only performs explicit browser-side tests against a user-authorized HTTPS health endpoint. A successful check proves only that the endpoint responded; it does not prove traffic passed through a particular satellite or VPN.

## Do not put secrets in the repository

Never commit WireGuard private keys, VPN configuration bundles, passwords, API tokens, emergency contact lists, or personal coordinates. The panel does not store the health URL or credentials, and its exported status report omits the health URL, response body, and coordinates. Do not add secrets to client-side JavaScript: anyone receiving the files can inspect them.

## GitHub Pages is not a private console

GitHub documents that published Pages sites are publicly accessible on the internet even when the source repository is private on plans that support private repositories. A client-side PIN, hidden panel, obscured navigation item, or CSS display rule is not a security boundary.

For real restricted access, move the sensitive console behind a host-side identity/authentication layer or deploy it as a private web application. One documented pattern is Cloudflare Access in front of an application on a hostname you control, with allow policies for named identities and a validated origin. See:

- GitHub Pages visibility: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Cloudflare Access web applications: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/
- Cloudflare private web application: https://developers.cloudflare.com/cloudflare-one/setup/secure-private-apps/private-web-app/
- WireGuard quick start: https://www.wireguard.com/quickstart/

Follow the provider's current setup instructions. Do not assume this guide automatically makes an existing github.io hostname private. Test access from a logged-out browser and a network/device that should not be allowed, and verify the origin cannot be bypassed.

## Satellite communications in Bangladesh

Public CelesTrak orbital elements are tracking data, not a satellite communications endpoint. The Russian Satellite Communications Company (RSCC) publishes contracted satellite communications and VSAT offerings; the app cannot subscribe, generate terminal credentials, align an antenna, or establish a link. Contact RSCC or an authorized service provider to confirm actual service availability in Bangladesh, terminal approval, licensing, service contract, installation, and support. Check Bangladesh regulatory requirements with BTRC before deployment.

- RSCC services: https://eng.rscc.ru/services/
- RSCC communications services / VSAT: https://eng.rscc.ru/services/uslugi-svyazi/
- BTRC guidelines: https://btrc.gov.bd/pages/static-pages/6922e0e3933eb65569e290b1

## Health endpoint contract

Use a public HTTPS hostname you own or are explicitly authorized to test, standard HTTPS port 443, no URL query string, no username/password in the URL, and no secrets in the response. Prefer a minimal non-sensitive JSON response such as `{ "status": "ok" }`. Enable suitable CORS headers for your exact dashboard origin. The monitor does not send cookies or authorization headers. CORS, DNS, TLS, redirect, and network failures are reported as inconclusive rather than proof the service is down.

Monitoring starts only after the user presses Start, checks no more often than once per minute while the page is open and visible, and stops when Stop is pressed or the page is unloaded. Browser notification and VPN state are not treated as proof of an established emergency connection.

## Desktop VPN control add-on

The optional `vpn-bridge.py` helper is a separate local component. It listens only on `127.0.0.1:8765`, restricts the Origin to explicit allow-listed origins, validates Host, and requires a per-run random bearer token for status/control routes. Only fixed Tailscale `up/down/status` operations or a single configured WireGuard for Windows tunnel service can be requested. It does not accept arbitrary commands, profiles or tunnel names from the browser. Review `vpn-bridge.py` before running; the source script is not a signed binary. The pairing token is shown in the local console and should never be sent to anyone else. This helper does not establish satellite connectivity or independently validate end-to-end VPN routes.
