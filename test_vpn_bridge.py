"""TERRAVEX VPN bridge tests. Uses an isolated fake Tailscale CLI; never toggles a real VPN."""
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import time
import urllib.error
import urllib.request
import unittest

ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("terravex_vpn_bridge", ROOT / "vpn-bridge.py")
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)
ORIGIN = "https://raabdullah59720-igers.github.io"

class LocalBridgeBackendTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.state = self.root / "state.txt"
        self.cli = self.root / "fake_tailscale"
        script = f'''#!/usr/bin/env python3
import json, pathlib, sys
state_path = pathlib.Path({str(self.state)!r})
args = sys.argv[1:]
if args == ["status", "--json"]:
    running = state_path.exists() and state_path.read_text().strip() == "on"
    print(json.dumps({{"BackendState": "Running" if running else "Stopped", "Self": {{"Online": running}}}}))
elif args == ["up"]:
    state_path.write_text("on")
elif args == ["down"]:
    state_path.write_text("off")
else:
    print("unexpected args", file=sys.stderr); sys.exit(3)
'''
        self.cli.write_text(script, encoding="utf-8")
        self.cli.chmod(0o755)
        self.backend = mod.VPNBackend({"backend": "tailscale", "tailscale_path": str(self.cli)})

    def tearDown(self):
        self.tmp.cleanup()

    def test_status_on_off_with_fake_cli(self):
        self.assertEqual(self.backend.status()["state"], "DISCONNECTED")
        self.assertEqual(self.backend.action("on")["result"]["state"], "CONNECTED")
        self.assertEqual(self.backend.action("off")["result"]["state"], "DISCONNECTED")

    def test_rejects_unknown_action(self):
        with self.assertRaises(mod.BridgeError):
            self.backend.action("run arbitrary shell")

    def test_config_requires_exact_origins(self):
        path = self.root / "config.json"
        path.write_text(json.dumps({"allowed_origins": ["https://example.org/path"], "backend": "tailscale", "port": 8765}))
        with self.assertRaises(SystemExit):
            mod.load_config(path)

class LocalBridgeHttpTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.state = self.root / "state.txt"
        self.cli = self.root / "fake_tailscale"
        script = f'''#!/usr/bin/env python3
import json, pathlib, sys
state_path = pathlib.Path({str(self.state)!r})
args = sys.argv[1:]
if args == ["status", "--json"]:
    running = state_path.exists() and state_path.read_text().strip() == "on"
    print(json.dumps({{"BackendState": "Running" if running else "Stopped", "Self": {{"Online": running}}}}))
elif args == ["up"]: state_path.write_text("on")
elif args == ["down"]: state_path.write_text("off")
else: sys.exit(3)
'''
        self.cli.write_text(script, encoding="utf-8")
        self.cli.chmod(0o755)
        cfg = {"allowed_origins": [ORIGIN, "http://127.0.0.1:8000", "http://localhost:8000"], "backend": "tailscale", "tailscale_path": str(self.cli), "port": 8765}
        self.pairing_token = "test-pairing-token-not-a-real-secret"
        self.server = mod.BridgeServer((mod.HOST, mod.PORT), mod.Handler, cfg, self.pairing_token)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.05}, daemon=True)
        self.thread.start()
        time.sleep(0.05)
        self.session_token = ""

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=1); self.tmp.cleanup()

    def call(self, path, method="GET", body=None, token=None, origin=ORIGIN):
        headers = {"Origin": origin, "Host": "127.0.0.1:8765"}
        if token: headers["Authorization"] = "Bearer " + token
        data = None
        if body is not None:
            data = json.dumps(body).encode(); headers["Content-Type"] = "application/json"
        req = urllib.request.Request("http://127.0.0.1:8765" + path, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as r: return r.status, json.loads(r.read().decode()), dict(r.headers)
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode()), dict(e.headers)

    def pair(self, token=None, origin=ORIGIN):
        code, body, headers = self.call("/api/pair", "POST", {"mode": "pair"}, token or self.pairing_token, origin)
        if code == 200:
            self.session_token = body["session_token"]
        return code, body, headers

    def test_status_requires_session_token(self):
        code, body, _ = self.call("/api/status")
        self.assertEqual(code, 401); self.assertFalse(body["ok"])
        # A pairing token alone must not authorize privileged/status routes.
        code, body, _ = self.call("/api/status", token=self.pairing_token)
        self.assertEqual(code, 401); self.assertFalse(body["ok"])

    def test_one_run_pairing_token_is_consumed_once(self):
        code, body, _ = self.pair()
        self.assertEqual(code, 200)
        self.assertTrue(body["pairing_token_consumed"])
        self.assertEqual(body["expires_in"], mod.SESSION_TOKEN_TTL_SECONDS)
        self.assertNotEqual(body["session_token"], self.pairing_token)
        code2, body2, _ = self.pair()
        self.assertEqual(code2, 409); self.assertFalse(body2["ok"])
        code3, status, _ = self.call("/api/status", token=self.session_token)
        self.assertEqual(code3, 200); self.assertEqual(status["state"], "DISCONNECTED")

    def test_origin_allowlist_before_pair(self):
        code, body, _ = self.pair(origin="https://evil.example")
        self.assertEqual(code, 403); self.assertFalse(body["ok"])
        # A rejected origin must not consume a valid token.
        code, body, _ = self.pair(origin=ORIGIN)
        self.assertEqual(code, 200)

    def test_invalid_pairing_token_does_not_consume_valid_token(self):
        code, body, _ = self.pair(token="incorrect-token")
        self.assertEqual(code, 401); self.assertFalse(body["ok"])
        code, body, _ = self.pair()
        self.assertEqual(code, 200); self.assertTrue(body["pairing_token_consumed"])

    def test_expired_session_rejected(self):
        code, body, _ = self.pair()
        self.assertEqual(code, 200)
        with self.server.session_lock:
            self.server.sessions[self.session_token] = time.monotonic() - 1
        code, body, _ = self.call("/api/status", token=self.session_token)
        self.assertEqual(code, 401); self.assertFalse(body["ok"])

    def test_expired_pairing_token_rejected(self):
        self.server.pairing_deadline = time.monotonic() - 1
        code, body, _ = self.pair()
        self.assertEqual(code, 410); self.assertFalse(body["ok"])

    def test_on_off_only_api_after_pairing(self):
        self.assertEqual(self.pair()[0], 200)
        code, body, headers = self.call("/api/status", token=self.session_token)
        self.assertEqual(code, 200); self.assertEqual(body["state"], "DISCONNECTED")
        self.assertEqual(headers.get("Access-Control-Allow-Origin"), ORIGIN)
        code, body, _ = self.call("/api/vpn", "POST", {"action": "on"}, self.session_token)
        self.assertEqual(code, 200); self.assertEqual(body["result"]["state"], "CONNECTED")
        code, body, _ = self.call("/api/vpn", "POST", {"action": "off"}, self.session_token)
        self.assertEqual(code, 200); self.assertEqual(body["result"]["state"], "DISCONNECTED")
        code, body, _ = self.call("/api/vpn", "POST", {"action": "exec", "cmd": "whoami"}, self.session_token)
        self.assertEqual(code, 400); self.assertFalse(body["ok"])

    def test_pair_requires_fixed_body(self):
        code, body, _ = self.call("/api/pair", "POST", {"mode": "pair", "extra": "no"}, self.pairing_token)
        self.assertEqual(code, 400); self.assertFalse(body["ok"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
