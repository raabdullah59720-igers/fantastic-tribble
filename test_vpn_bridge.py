"""Repeatable local tests for the TERRAVEX VPN bridge; uses a fake CLI, never a real VPN."""
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("terravex_vpn_bridge", ROOT / "vpn-bridge.py")
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)

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
        self.cli.write_text(script, encoding='utf-8')
        self.cli.chmod(0o755)
        self.backend = mod.VPNBackend({"backend": "tailscale", "tailscale_path": str(self.cli)})

    def tearDown(self):
        self.tmp.cleanup()

    def test_status_on_off_with_fake_cli(self):
        self.assertEqual(self.backend.status()["state"], "DISCONNECTED")
        result = self.backend.action("on")
        self.assertEqual(result["result"]["state"], "CONNECTED")
        self.assertTrue(result["result"]["control_enabled"])
        result = self.backend.action("off")
        self.assertEqual(result["result"]["state"], "DISCONNECTED")

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
        self.cli.write_text(script, encoding='utf-8')
        self.cli.chmod(0o755)
        cfg = {"allowed_origins": ["https://raabdullah59720-igers.github.io"], "backend": "tailscale", "tailscale_path": str(self.cli), "port": 8765}
        self.token = "test-token-not-a-real-secret"
        self.server = mod.BridgeServer((mod.HOST, mod.PORT), mod.Handler, cfg, self.token)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.05}, daemon=True)
        self.thread.start()
        time.sleep(0.05)

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=1); self.tmp.cleanup()

    def call(self, path, method="GET", body=None, token=None, origin="https://raabdullah59720-igers.github.io"):
        headers = {"Origin": origin, "Host": "127.0.0.1:8765"}
        if token: headers["Authorization"] = "Bearer " + token
        data = None
        if body is not None:
            data = json.dumps(body).encode(); headers["Content-Type"] = "application/json"
        req = urllib.request.Request("http://127.0.0.1:8765"+path, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as r: return r.status, json.loads(r.read().decode()), dict(r.headers)
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode()), dict(e.headers)

    def test_status_requires_token(self):
        code, body, _ = self.call("/api/status")
        self.assertEqual(code, 401); self.assertFalse(body["ok"])

    def test_origin_allowlist(self):
        code, body, _ = self.call("/api/status", token=self.token, origin="https://evil.example")
        self.assertEqual(code, 403); self.assertFalse(body["ok"])

    def test_on_off_only_api(self):
        code, body, headers = self.call("/api/status", token=self.token)
        self.assertEqual(code, 200); self.assertEqual(body["state"], "DISCONNECTED")
        self.assertEqual(headers.get("Access-Control-Allow-Origin"), "https://raabdullah59720-igers.github.io")
        code, body, _ = self.call("/api/vpn", "POST", {"action": "on"}, self.token)
        self.assertEqual(code, 200); self.assertEqual(body["result"]["state"], "CONNECTED")
        code, body, _ = self.call("/api/vpn", "POST", {"action": "off"}, self.token)
        self.assertEqual(code, 200); self.assertEqual(body["result"]["state"], "DISCONNECTED")
        code, body, _ = self.call("/api/vpn", "POST", {"action": "exec", "cmd": "whoami"}, self.token)
        self.assertEqual(code, 400); self.assertFalse(body["ok"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
