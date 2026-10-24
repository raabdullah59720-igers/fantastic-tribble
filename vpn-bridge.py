#!/usr/bin/env python3
"""TERRAVEX APEX local VPN bridge.

Loopback-only, origin-allowlisted, bearer-token-protected control API.
Supports configured Tailscale CLI or a pre-installed WireGuard for Windows tunnel service.
No arbitrary shell commands, profile creation, key handling, or remote binding.
"""
from __future__ import annotations
import argparse
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from typing import Any

VERSION = "1.1.0"
PAIRING_TOKEN_TTL_SECONDS = 600
SESSION_TOKEN_TTL_SECONDS = 4 * 60 * 60
HOST = "127.0.0.1"
PORT = 8765
MAX_BODY = 2048
NAME_RE = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")

DEFAULT_CONFIG = {
    "allowed_origins": [
        "https://raabdullah59720-igers.github.io",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    "backend": "tailscale",
    "tailscale_path": "",
    "wireguard_path": "",
    "wireguard_tunnel_name": "",
    "port": PORT
}

class BridgeError(Exception):
    pass

class VPNBackend:
    def __init__(self, cfg: dict[str, Any]):
        self.cfg = cfg
        backend = str(cfg.get("backend", "tailscale")).lower()
        if backend not in {"tailscale", "wireguard"}:
            raise BridgeError("Configured backend must be 'tailscale' or 'wireguard'.")
        self.backend = backend

    def _tailscale_path(self) -> str | None:
        configured = str(self.cfg.get("tailscale_path", "")).strip()
        candidates = [configured] if configured else []
        if os.name == "nt":
            candidates.extend([
                os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"), "Tailscale", "tailscale.exe"),
                os.path.join(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)"), "Tailscale", "tailscale.exe"),
            ])
        for path in candidates:
            if path and os.path.isfile(path):
                return path
        return shutil.which("tailscale")

    def _run(self, args: list[str], timeout: float = 10) -> subprocess.CompletedProcess[str]:
        try:
            return subprocess.run(args, capture_output=True, text=True, timeout=timeout,
                                  shell=False, check=False, stdin=subprocess.DEVNULL,
                                  creationflags=(getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0))
        except FileNotFoundError as exc:
            raise BridgeError("Required VPN client executable was not found. Install the client and check helper configuration.") from exc
        except subprocess.TimeoutExpired as exc:
            raise BridgeError("VPN client command timed out. Check the VPN client on this computer.") from exc

    def _wg_service(self) -> str:
        if os.name != "nt":
            raise BridgeError("WireGuard service control in this helper is currently supported on Windows only.")
        name = str(self.cfg.get("wireguard_tunnel_name", "")).strip()
        if not NAME_RE.fullmatch(name):
            raise BridgeError("Set wireguard_tunnel_name in vpn-bridge-config.json to the name of an already-installed WireGuard tunnel. Do not include the .conf suffix.")
        return "WireGuardTunnel$" + name

    def status(self) -> dict[str, Any]:
        checked = datetime.now(timezone.utc).isoformat()
        if self.backend == "tailscale":
            exe = self._tailscale_path()
            if not exe:
                return {"backend": self.backend, "state": "UNAVAILABLE", "connected": False,
                        "detail": "Tailscale CLI not found. Install Tailscale or select the configured WireGuard backend.", "control_enabled": False, "checked_at": checked}
            try:
                proc = self._run([exe, "status", "--json"], timeout=7)
                if proc.returncode != 0:
                    return {"backend": self.backend, "state": "UNVERIFIED", "connected": False,
                            "detail": "Tailscale CLI returned a non-zero status. The tunnel state could not be verified.", "control_enabled": True, "checked_at": checked}
                data = json.loads(proc.stdout or "{}")
                backend_state = str(data.get("BackendState", "Unknown"))
                if backend_state == "Running":
                    self_state = data.get("Self") or {}
                    online = self_state.get("Online") if isinstance(self_state, dict) else None
                    return {"backend": self.backend, "state": "CONNECTED" if online is not False else "RUNNING_UNVERIFIED",
                            "connected": online is not False, "detail": "Tailscale client reports BackendState=Running" + (" and Self.Online=true." if online is True else ". Peer/route reachability is not independently verified."), "control_enabled": True, "checked_at": checked}
                state = "DISCONNECTED" if backend_state in {"Stopped", "NeedsLogin", "NeedsMachineAuth", "NoState"} else "UNVERIFIED"
                return {"backend": self.backend, "state": state, "connected": False,
                        "detail": "Tailscale backend state: " + backend_state + ".", "control_enabled": True, "checked_at": checked}
            except (json.JSONDecodeError, BridgeError) as exc:
                return {"backend": self.backend, "state": "UNVERIFIED", "connected": False,
                        "detail": str(exc) if isinstance(exc, BridgeError) else "Tailscale returned malformed status JSON.", "control_enabled": True, "checked_at": checked}

        try:
            service = self._wg_service()
            proc = self._run(["sc.exe", "query", service], timeout=7)
            text = (proc.stdout or "") + "\n" + (proc.stderr or "")
            match = re.search(r"STATE\s*:\s*(\d+)\s+([A-Z_]+)", text, re.I)
            if proc.returncode != 0 or not match:
                return {"backend": self.backend, "state": "UNVERIFIED", "connected": False,
                        "detail": "WireGuard tunnel service could not be queried. Confirm the tunnel is installed and the service name is correct.", "control_enabled": False, "checked_at": checked}
            numeric, state_text = int(match.group(1)), match.group(2).upper()
            state = "CONNECTED" if numeric == 4 else "DISCONNECTED" if numeric == 1 else "TRANSITIONING"
            return {"backend": self.backend, "state": state, "connected": numeric == 4,
                    "detail": f"Windows service state: {state_text}. This verifies service state, not the exit route or remote endpoint.", "control_enabled": True, "checked_at": checked}
        except BridgeError as exc:
            return {"backend": self.backend, "state": "NOT_CONFIGURED", "connected": False,
                    "detail": str(exc), "control_enabled": False, "checked_at": checked}

    def action(self, action: str) -> dict[str, Any]:
        if action not in {"on", "off"}:
            raise BridgeError("Only the fixed actions 'on' and 'off' are accepted.")
        if self.backend == "tailscale":
            exe = self._tailscale_path()
            if not exe:
                raise BridgeError("Tailscale CLI not found. Install and authenticate Tailscale first.")
            proc = self._run([exe, "up" if action == "on" else "down"], timeout=18)
            # Do not echo raw CLI output into browser responses: it could contain local details.
            if proc.returncode != 0:
                hint = "Reconnect command failed. You may need to sign in or approve the operation in the Tailscale client." if action == "on" else "Disconnect command failed. Check Tailscale permissions and service state."
                raise BridgeError(hint)
        else:
            service = self._wg_service()
            if os.name != "nt":
                raise BridgeError("WireGuard service switching requires Windows Service Control Manager.")
            proc = self._run(["sc.exe", "start" if action == "on" else "stop", service], timeout=18)
            output = ((proc.stdout or "") + "\n" + (proc.stderr or "")).lower()
            # Windows sc.exe may report a transition as success; re-query status below.
            if proc.returncode != 0 and "already been started" not in output and "not started" not in output:
                if "access is denied" in output or "access denied" in output:
                    raise BridgeError("Windows denied service control. Close this bridge and start its launcher as Administrator only if you intend to grant VPN control.")
                raise BridgeError("WireGuard service command failed. Check tunnel name, installation, and Windows permissions.")
        time.sleep(0.45)
        return {"action": action, "result": self.status()}


def load_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        path.write_text(json.dumps(DEFAULT_CONFIG, indent=2), encoding="utf-8")
        print(f"Created {path.name}. Review allowed_origins/backend before using the bridge.")
    try:
        cfg = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise SystemExit(f"Cannot read {path}: {exc}")
    if not isinstance(cfg, dict):
        raise SystemExit("Bridge config must be a JSON object.")
    origins = cfg.get("allowed_origins")
    if not isinstance(origins, list) or not origins or not all(isinstance(o, str) for o in origins):
        raise SystemExit("allowed_origins must be a list of explicit HTTPS site origins and/or localhost origins. Wildcards are not allowed.")
    for origin in origins:
        parsed = urlsplit(origin)
        local_ok = parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1"}
        public_ok = parsed.scheme == "https" and bool(parsed.hostname)
        if not (local_ok or public_ok) or parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password or "*" in origin:
            raise SystemExit("Each allowed origin must be an exact HTTPS origin (or localhost for development), without a path, wildcard, query or fragment.")
    backend = str(cfg.get("backend", "tailscale")).lower()
    if backend not in {"tailscale", "wireguard"}:
        raise SystemExit("backend must be either 'tailscale' or 'wireguard'.")
    port = int(cfg.get("port", PORT))
    if port != PORT:
        raise SystemExit(f"This frontend is pinned to 127.0.0.1:{PORT}; keep port={PORT}.")
    return cfg

class BridgeServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    def __init__(self, server_address, handler, cfg, pairing_token):
        self.cfg = cfg
        self.pairing_token = pairing_token
        self.pairing_deadline = time.monotonic() + PAIRING_TOKEN_TTL_SECONDS
        self.pairing_used = False
        self.sessions: dict[str, float] = {}
        self.session_lock = threading.Lock()
        self.vpn = VPNBackend(cfg)
        super().__init__(server_address, handler)

    def consume_pairing_token(self, supplied: str) -> tuple[str, int]:
        """Exchange the run-scoped pairing token once for a short-lived session token."""
        with self.session_lock:
            now = time.monotonic()
            if self.pairing_used or self.pairing_token is None:
                raise BridgeError("This one-run pairing token was already used. Restart the local VPN bridge to generate a new token.")
            if now > self.pairing_deadline:
                self.pairing_token = None
                raise BridgeError("The pairing token expired after 10 minutes. Restart the local VPN bridge to generate a new token.")
            if not secrets.compare_digest(str(supplied), str(self.pairing_token)):
                raise BridgeError("Pairing token is invalid. Copy the current token from the local bridge console.")
            self.pairing_used = True
            self.pairing_token = None
            session = secrets.token_urlsafe(32)
            self.sessions[session] = now + SESSION_TOKEN_TTL_SECONDS
            return session, SESSION_TOKEN_TTL_SECONDS

    def session_valid(self, supplied: str) -> bool:
        if not supplied:
            return False
        with self.session_lock:
            now = time.monotonic()
            expired = [token for token, expiry in self.sessions.items() if expiry <= now]
            for token in expired:
                self.sessions.pop(token, None)
            expiry = self.sessions.get(supplied)
            return expiry is not None and expiry > now

class Handler(BaseHTTPRequestHandler):
    server_version = "TERRAVEXVPNBridge/" + VERSION
    sys_version = ""

    def log_message(self, fmt, *args):
        # Avoid logging user tokens, query strings, endpoint details, or command output.
        print("[bridge] " + (fmt % args))

    def _origin_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        if not origin:
            return True  # non-browser local client; still requires bearer token for control endpoints
        return origin in self.server.cfg.get("allowed_origins", [])

    def _headers(self, cors=False):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Vary", "Origin")
        origin = self.headers.get("Origin")
        if cors and origin and origin in self.server.cfg.get("allowed_origins", []):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
            self.send_header("Access-Control-Max-Age", "300")
            # Retain harmless compatibility for browsers that still send the older PNA header.
            if self.headers.get("Access-Control-Request-Private-Network", "").lower() == "true":
                self.send_header("Access-Control-Allow-Private-Network", "true")

    def _json(self, code: int, body: dict[str, Any], cors=True):
        payload = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(code)
        self._headers(cors)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _host_ok(self) -> bool:
        return self.headers.get("Host", "").lower() in {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}

    def _bearer(self) -> str:
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return ""
        return auth[7:].strip()

    def _authorized(self) -> bool:
        # The startup pairing token is never accepted by normal status/action routes.
        return self.server.session_valid(self._bearer())

    def _read_json_body(self) -> dict[str, Any] | None:
        if self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower() != "application/json":
            self._json(415, {"ok": False, "error": "Use application/json."})
            return None
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = MAX_BODY + 1
        if length < 1 or length > MAX_BODY:
            self._json(413, {"ok": False, "error": "Invalid request size."})
            return None
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            self._json(400, {"ok": False, "error": "Invalid JSON body."})
            return None
        if not isinstance(body, dict):
            self._json(400, {"ok": False, "error": "JSON body must be an object."})
            return None
        return body

    def _gate(self) -> bool:
        if not self._host_ok():
            self._json(421, {"ok": False, "error": "Invalid local Host header."}, False)
            return False
        if not self._origin_allowed():
            self._json(403, {"ok": False, "error": "This web origin is not allowed by local bridge configuration."}, False)
            return False
        if not self._authorized():
            self._json(401, {"ok": False, "error": "Session missing or expired. Pair with the current one-run token from the local bridge console."})
            return False
        return True

    def do_OPTIONS(self):
        if not self._host_ok() or not self._origin_allowed():
            self.send_error(403, "Origin not allowed")
            return
        self.send_response(204)
        self._headers(True)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            if not self._host_ok() or not self._origin_allowed():
                self._json(403, {"ok": False, "error": "Origin or Host not allowed."}, False)
                return
            pairing_left = max(0, int(self.server.pairing_deadline - time.monotonic())) if not self.server.pairing_used else 0
            self._json(200, {"service": "TERRAVEX APEX Local VPN Bridge", "version": VERSION, "status": "READY_FOR_PAIRING" if pairing_left else "PAIRING_UNAVAILABLE", "bind": "127.0.0.1", "auth_required": True, "pairing_available": bool(pairing_left and not self.server.pairing_used), "pairing_expires_in": pairing_left})
            return
        if self.path != "/api/status":
            self._json(404, {"ok": False, "error": "Not found."})
            return
        if not self._gate():
            return
        result = self.server.vpn.status()
        result["service"] = "TERRAVEX APEX Local VPN Bridge"
        result["version"] = VERSION
        self._json(200, {"ok": True, **result})

    def do_POST(self):
        if self.path == "/api/pair":
            if not self._host_ok():
                self._json(421, {"ok": False, "error": "Invalid local Host header."}, False)
                return
            if not self._origin_allowed():
                self._json(403, {"ok": False, "error": "This web origin is not allowed by local bridge configuration."}, False)
                return
            body = self._read_json_body()
            if body is None:
                return
            if body != {"mode": "pair"}:
                self._json(400, {"ok": False, "error": "Pair request must be exactly {mode: pair}."})
                return
            bearer = self._bearer()
            try:
                session_token, ttl = self.server.consume_pairing_token(bearer)
            except BridgeError as exc:
                message = str(exc)
                code = 410 if "expired" in message.lower() else 409 if "already used" in message.lower() else 401
                self._json(code, {"ok": False, "error": message})
                return
            self._json(200, {"ok": True, "token_type": "Bearer", "session_token": session_token, "expires_in": ttl, "pairing_token_consumed": True})
            return
        if self.path != "/api/vpn":
            self._json(404, {"ok": False, "error": "Not found."})
            return
        if not self._gate():
            return
        body = self._read_json_body()
        if body is None:
            return
        if set(body.keys()) != {"action"}:
            self._json(400, {"ok": False, "error": "Only {action:on|off} is accepted. Arbitrary commands and profile paths are disabled."})
            return
        action = body.get("action")
        try:
            result = self.server.vpn.action(action)
            self._json(200, {"ok": True, **result})
        except BridgeError as exc:
            self._json(409, {"ok": False, "error": str(exc), "status": self.server.vpn.status()})
        except Exception:
            self._json(500, {"ok": False, "error": "Unexpected local helper error. Check the helper console; raw system details are not sent to the webpage."})

def main():
    parser = argparse.ArgumentParser(description="TERRAVEX APEX local desktop VPN bridge")
    parser.add_argument("--config", default="vpn-bridge-config.json", help="Path to local JSON config")
    args = parser.parse_args()
    if sys.platform.startswith("emscripten"):
        raise SystemExit("Run this helper on your desktop, not in a browser.")
    cfg = load_config(Path(args.config).resolve())
    token = secrets.token_urlsafe(32)
    server = BridgeServer((HOST, PORT), Handler, cfg, token)
    print("\nTERRAVEX APEX LOCAL VPN BRIDGE")
    print("Binding: http://127.0.0.1:8765 (loopback only; not accessible from other LAN devices)")
    print("Allowed origins: " + ", ".join(cfg["allowed_origins"]))
    print("Configured VPN backend: " + str(cfg.get("backend", "tailscale")))
    print(f"ONE-RUN PAIRING TOKEN (valid for {PAIRING_TOKEN_TTL_SECONDS // 60} minutes; succeeds once):\n" + token)
    print(f"After pairing, a short-lived session token is issued for {SESSION_TOKEN_TTL_SECONDS // 3600} hours. Restarting this bridge invalidates all sessions.")
    print("Paste this token only into your own TERRAVEX app. Do not send it to anyone or commit it to GitHub.")
    print("Press Ctrl+C to stop the bridge. Loopback-only + exact origin allow-list + one-use token exchange.")
    try:
        server.serve_forever(poll_interval=0.3)
    except KeyboardInterrupt:
        print("\nStopping local VPN bridge…")
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
