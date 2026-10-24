'use strict';
/*
 * TERRAVEX dependency-free WebSocket signalling relay.
 * WebSocket endpoint exchanges WebRTC offer/answer/ICE metadata only.
 * The separate HTTP voice-mail API stores browser-encrypted ciphertext in
 * volatile process memory with a 24-hour TTL; it never receives plaintext keys.
 * No spacecraft commands, satellite uplink, or RF transmission are provided.
 * Compatible with Node.js 18+; no npm runtime packages are required.
 */
const http = require('node:http');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const ROOM_TTL_MS = Math.max(60_000, Number(process.env.ROOM_TTL_SECONDS || 900) * 1000);
const ALLOWED_ORIGINS = new Set((process.env.ALLOWED_ORIGINS || 'http://127.0.0.1:8000,http://localhost:8000').split(',').map(s => s.trim()).filter(Boolean));
const MAX_JOIN_PER_MINUTE = 20;
const MAX_FRAME_BYTES = 64 * 1024;
const rooms = new Map();
const ipJoinAttempts = new Map();

function sendJson(res, code, value) {
  const body = JSON.stringify(value);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body), 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(body);
}

class TinyWebSocket extends EventEmitter {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  constructor(socket, head = Buffer.alloc(0)) {
    super();
    this.socket = socket;
    this.readyState = TinyWebSocket.OPEN;
    this.roomCode = null; this.role = null; this.joined = false;
    this.buffer = Buffer.alloc(0);
    this.fragmentOpcode = 0; this.fragmentParts = []; this.fragmentBytes = 0;
    socket.setNoDelay(true);
    socket.on('data', chunk => this.consume(chunk));
    socket.on('error', err => { this.emit('error', err); this.finishClose(); });
    socket.on('close', () => this.finishClose());
    if (head.length) this.consume(head);
  }
  send(value) {
    if (this.readyState !== TinyWebSocket.OPEN) throw new Error('WebSocket is not open');
    const payload = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
    this.writeFrame(0x1, payload);
  }
  close(code = 1000, reason = '') {
    if (this.readyState !== TinyWebSocket.OPEN) return;
    this.readyState = TinyWebSocket.CLOSING;
    const text = Buffer.from(String(reason).slice(0, 100), 'utf8');
    const payload = Buffer.alloc(2 + text.length);
    payload.writeUInt16BE(code, 0); text.copy(payload, 2);
    try { this.writeFrame(0x8, payload); } catch (_) {}
    this.socket.end();
    const timer = setTimeout(() => this.socket.destroy(), 1500); timer.unref?.();
  }
  terminate() { this.readyState = TinyWebSocket.CLOSING; this.socket.destroy(); }
  writeFrame(opcode, payload) {
    const n = payload.length;
    let header;
    if (n < 126) { header = Buffer.from([0x80 | opcode, n]); }
    else if (n <= 0xffff) { header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 126; header.writeUInt16BE(n, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x80 | opcode; header[1] = 127; header.writeBigUInt64BE(BigInt(n), 2); }
    this.socket.write(Buffer.concat([header, payload]));
  }
  protocolClose(code, reason) { try { this.close(code, reason); } catch (_) { this.terminate(); } }
  consume(chunk) {
    if (this.readyState === TinyWebSocket.CLOSED) return;
    this.buffer = this.buffer.length ? Buffer.concat([this.buffer, chunk]) : chunk;
    while (this.buffer.length >= 2) {
      const b0 = this.buffer[0], b1 = this.buffer[1];
      const fin = (b0 & 0x80) !== 0, rsv = b0 & 0x70, opcode = b0 & 0x0f, masked = (b1 & 0x80) !== 0;
      let length = b1 & 0x7f, offset = 2;
      if (rsv || !masked) return this.protocolClose(1002, 'Invalid client frame');
      if (length === 126) { if (this.buffer.length < 4) return; length = this.buffer.readUInt16BE(2); offset = 4; }
      else if (length === 127) { if (this.buffer.length < 10) return; const big = this.buffer.readBigUInt64BE(2); if (big > BigInt(MAX_FRAME_BYTES)) return this.protocolClose(1009, 'Frame too large'); length = Number(big); offset = 10; }
      if (length > MAX_FRAME_BYTES) return this.protocolClose(1009, 'Frame too large');
      const isControl = opcode >= 0x8;
      if (isControl && (!fin || length > 125)) return this.protocolClose(1002, 'Invalid control frame');
      if (this.buffer.length < offset + 4 + length) return;
      const mask = this.buffer.subarray(offset, offset + 4); offset += 4;
      const payload = Buffer.from(this.buffer.subarray(offset, offset + length));
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      this.buffer = this.buffer.subarray(offset + length);

      if (opcode === 0x8) {
        if (this.readyState === TinyWebSocket.OPEN) {
          this.readyState = TinyWebSocket.CLOSING;
          try { this.writeFrame(0x8, payload); } catch (_) {}
          this.socket.end();
        }
        this.finishClose(); return;
      }
      if (opcode === 0x9) { this.writeFrame(0xA, payload); continue; }
      if (opcode === 0xA) { this.emit('pong'); continue; }
      if (opcode === 0x1 || opcode === 0x2) {
        if (this.fragmentOpcode) return this.protocolClose(1002, 'Nested fragments are invalid');
        if (fin) {
          if (opcode !== 0x1) { this.protocolClose(1003, 'Text JSON only'); return; }
          this.emit('message', payload, false);
        } else { this.fragmentOpcode = opcode; this.fragmentParts = [payload]; this.fragmentBytes = payload.length; }
        continue;
      }
      if (opcode === 0x0) {
        if (!this.fragmentOpcode) return this.protocolClose(1002, 'Unexpected continuation');
        this.fragmentParts.push(payload); this.fragmentBytes += payload.length;
        if (this.fragmentBytes > MAX_FRAME_BYTES) return this.protocolClose(1009, 'Message too large');
        if (fin) {
          const originalOpcode = this.fragmentOpcode; const assembled = Buffer.concat(this.fragmentParts, this.fragmentBytes);
          this.fragmentOpcode = 0; this.fragmentParts = []; this.fragmentBytes = 0;
          if (originalOpcode !== 0x1) { this.protocolClose(1003, 'Text JSON only'); return; }
          this.emit('message', assembled, false);
        }
        continue;
      }
      return this.protocolClose(1002, 'Unsupported opcode');
    }
  }
  finishClose() {
    if (this.readyState === TinyWebSocket.CLOSED) return;
    this.readyState = TinyWebSocket.CLOSED;
    this.emit('close');
  }
}

function send(ws, payload) {
  if (ws && ws.readyState === TinyWebSocket.OPEN) {
    try { ws.send(JSON.stringify(payload)); } catch (_) {}
  }
}
function clientIp(req) {
  // Soft rate-limit signal only. On hosted deployments, use the platform's trusted proxy configuration.
  return String(req.socket.remoteAddress || 'unknown').slice(0, 100);
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of ipJoinAttempts) {
    const recent = times.filter(t => now - t < 60_000);
    if (recent.length) ipJoinAttempts.set(ip, recent); else ipJoinAttempts.delete(ip);
  }
}, 5 * 60_000).unref?.();
function rateLimitJoin(ip) {
  const now = Date.now();
  const recent = (ipJoinAttempts.get(ip) || []).filter(t => now - t < 60_000);
  if (recent.length >= MAX_JOIN_PER_MINUTE) return false;
  recent.push(now); ipJoinAttempts.set(ip, recent); return true;
}
function clearRoom(roomCode, reason = 'room-closed') {
  const room = rooms.get(roomCode);
  if (!room) return;
  clearTimeout(room.expiryTimer);
  for (const member of [room.host, room.guest]) {
    if (member && member.readyState === TinyWebSocket.OPEN) {
      send(member, { type: reason, room: roomCode });
      member.roomCode = null; member.role = null;
      try { member.close(1000, 'Room closed'); } catch (_) {}
    }
  }
  rooms.delete(roomCode);
}
function touchRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  clearTimeout(room.expiryTimer);
  room.expiryTimer = setTimeout(() => clearRoom(code, 'room-expired'), ROOM_TTL_MS);
  room.expiryTimer.unref?.();
}
function detach(ws) {
  const code = ws.roomCode, role = ws.role;
  ws.roomCode = null; ws.role = null;
  if (!code || !role) return;
  const room = rooms.get(code);
  if (!room) return;
  if (room[role] === ws) room[role] = null;
  if (role === 'host') { clearRoom(code, 'room-closed'); return; }
  send(room.host, { type: 'peer-left', room: code });
  if (!room.host && !room.guest) { clearTimeout(room.expiryTimer); rooms.delete(code); }
  else touchRoom(code);
}

const MAIL_TTL_MS = 24 * 60 * 60 * 1000;
const MAIL_MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MAIL_MAX_BODY_BYTES = 12 * 1024 * 1024;
const MAIL_MAX_PER_INBOX = 8;
const MAIL_MAX_TOTAL_BYTES = 64 * 1024 * 1024;
const mailboxes = new Map();
let storedMailBytes = 0;
const apiAttempts = new Map();
function allowOrigin(origin) { return !!origin && ALLOWED_ORIGINS.has(origin); }
function addCors(res, origin) {
  if (allowOrigin(origin)) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('vary', 'Origin');
    res.setHeader('access-control-allow-methods', 'POST, OPTIONS');
    res.setHeader('access-control-allow-headers', 'Content-Type');
    res.setHeader('access-control-max-age', '600');
  }
}
function rateApi(ip) {
  const now=Date.now(), recent=(apiAttempts.get(ip)||[]).filter(t=>now-t<60_000);
  if(recent.length>=60)return false;
  recent.push(now);apiAttempts.set(ip,recent);return true;
}
function readJson(req, maxBytes) {
  return new Promise((resolve,reject)=>{
    const declared=Number(req.headers['content-length']||0);
    if(declared>maxBytes){req.resume();reject(Object.assign(new Error('Request body too large.'),{statusCode:413}));return;}
    const chunks=[];let size=0,done=false;
    req.on('data',chunk=>{
      if(done)return;size+=chunk.length;
      if(size>maxBytes){done=true;req.resume();reject(Object.assign(new Error('Request body too large.'),{statusCode:413}));return;}
      chunks.push(chunk);
    });
    req.on('end',()=>{if(done)return;try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(Object.assign(new Error('Expected valid JSON.'),{statusCode:400}));}});
    req.on('error',e=>{if(!done){done=true;reject(e);}});
  });
}
function validMailboxId(id) { return typeof id==='string' && /^[A-Za-z0-9_-]{22}$/.test(id); }
function decodeCanonicalBase64(value, maxBytes) {
  if(typeof value!=='string'||!value.length||value.length>Math.ceil(maxBytes/3)*4+8||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))return null;
  const buf=Buffer.from(value,'base64');if(buf.length>maxBytes||buf.toString('base64')!==value)return null;return buf;
}
function mailMetadata(item) { return { id:item.id, createdAt:item.createdAt, expiresAt:item.expiresAt, sizeBytes:item.audioCiphertext.length-16, encrypted:true }; }
function liveMailbox(mailboxId) {
  const now=Date.now(), items=mailboxes.get(mailboxId)||[], keep=[];
  for(const item of items){
    if(Date.parse(item.expiresAt)<=now) storedMailBytes=Math.max(0,storedMailBytes-item.totalStoredBytes);
    else keep.push(item);
  }
  if(keep.length) mailboxes.set(mailboxId,keep); else mailboxes.delete(mailboxId);
  return keep;
}
function sweepMail() {
  const now=Date.now();
  for(const mailboxId of [...mailboxes.keys()]) liveMailbox(mailboxId);
  for(const [ip,times] of apiAttempts){const fresh=times.filter(t=>now-t<60_000);if(fresh.length)apiAttempts.set(ip,fresh);else apiAttempts.delete(ip);}
}
setInterval(sweepMail,5*60_000).unref?.();
async function handleVoiceMail(req,res,pathname) {
  const origin=req.headers.origin;
  addCors(res,origin);
  if(req.method==='OPTIONS'){
    if(!allowOrigin(origin))return sendJson(res,403,{error:'origin-not-allowed'});
    res.writeHead(204,{'cache-control':'no-store'});return res.end();
  }
  if(req.method!=='POST')return sendJson(res,405,{error:'method-not-allowed'});
  if(!allowOrigin(origin))return sendJson(res,403,{error:'origin-not-allowed'});
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return sendJson(res,415,{error:'json-required'});
  if(!rateApi(clientIp(req)))return sendJson(res,429,{error:'rate-limited'});
  const maxBody=pathname.endsWith('/send')?MAIL_MAX_BODY_BYTES:32*1024;
  let body;try{body=await readJson(req,maxBody);}catch(e){return sendJson(res,e.statusCode||400,{error:e.message||'bad-request'});}
  const mailboxId=body?.mailboxId;
  if(!validMailboxId(mailboxId))return sendJson(res,400,{error:'invalid-mailbox-address'});
  const existing=liveMailbox(mailboxId);
  if(pathname==='/api/voice-mail/send'){
    const audioCiphertext=decodeCanonicalBase64(body.audioCiphertext,MAIL_MAX_AUDIO_BYTES+16);
    const metaCiphertext=decodeCanonicalBase64(body.metaCiphertext,16*1024);
    const audioIv=decodeCanonicalBase64(body.audioIv,12),metaIv=decodeCanonicalBase64(body.metaIv,12);
    if(!audioCiphertext||audioCiphertext.length<=16||!metaCiphertext||metaCiphertext.length<=16||!audioIv||audioIv.length!==12||!metaIv||metaIv.length!==12)return sendJson(res,400,{error:'invalid-encrypted-payload'});
    if(audioCiphertext.length>MAIL_MAX_AUDIO_BYTES+16)return sendJson(res,413,{error:'voice-mail-too-large'});
    if(existing.length>=MAIL_MAX_PER_INBOX)return sendJson(res,429,{error:'mailbox-full',message:'This inbox has reached its temporary message limit.'});
    const totalStoredBytes=audioCiphertext.length+metaCiphertext.length;
    if(storedMailBytes+totalStoredBytes>MAIL_MAX_TOTAL_BYTES)return sendJson(res,503,{error:'temporary-storage-full'});
    const now=Date.now();
    const item={id:crypto.randomUUID(),audioIv,audioCiphertext,metaIv,metaCiphertext,totalStoredBytes,createdAt:new Date(now).toISOString(),expiresAt:new Date(now+MAIL_TTL_MS).toISOString()};
    existing.push(item);mailboxes.set(mailboxId,existing);storedMailBytes+=totalStoredBytes;
    return sendJson(res,201,{ok:true,message:mailMetadata(item),storage:'encrypted-temporary-memory',expiresInHours:24});
  }
  if(pathname==='/api/voice-mail/list'){
    return sendJson(res,200,{ok:true,messages:existing.map(mailMetadata),storage:'encrypted-temporary-memory',expiresInHours:24});
  }
  if(pathname==='/api/voice-mail/read'){
    const id=String(body.id||'');const item=existing.find(x=>x.id===id&&Date.parse(x.expiresAt)>Date.now());
    if(!item)return sendJson(res,404,{error:'message-not-found-or-expired'});
    return sendJson(res,200,{ok:true,message:mailMetadata(item),audioIv:item.audioIv.toString('base64'),audioCiphertext:item.audioCiphertext.toString('base64'),metaIv:item.metaIv.toString('base64'),metaCiphertext:item.metaCiphertext.toString('base64'),storage:'encrypted-temporary-memory'});
  }
  if(pathname==='/api/voice-mail/ack'){
    const id=String(body.id||'');const items=existing.filter(x=>x.id!==id);const removed=items.length!==existing.length;
    if(removed){const old=existing.find(x=>x.id===id);if(old)storedMailBytes=Math.max(0,storedMailBytes-old.totalStoredBytes);if(items.length)mailboxes.set(mailboxId,items);else mailboxes.delete(mailboxId);}
    return sendJson(res,200,{ok:true,removed});
  }
  return sendJson(res,404,{error:'not-found'});
}
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = new URL(req.url, 'http://localhost').pathname; } catch { return sendJson(res, 400, { error: 'bad-url' }); }
  if(pathname.startsWith('/api/voice-mail/')){
    try{return await handleVoiceMail(req,res,pathname);}catch(e){if(!res.headersSent)return sendJson(res,500,{error:'internal-error'});try{res.end();}catch{}}
  }
  if (req.method === 'GET' && pathname === '/healthz') return sendJson(res, 200, { ok: true, service: 'terravex-voice-signaling-relay', role: 'signaling-only-plus-e2e-encrypted-voice-mail', audioRelay: false, voiceMailbox: 'encrypted-temporary-memory-24h', satelliteUplink: false, rooms: rooms.size, storedMailBytes, now: new Date().toISOString() });
  if (req.method === 'GET' && pathname === '/') return sendJson(res, 200, { service: 'TERRAVEX voice signalling and encrypted temporary voice-mail relay', note: 'WebSocket signalling only; voice-mail payloads are end-to-end encrypted in browser; no spacecraft uplink.', websocket: 'Connect using ws:// locally or wss:// behind HTTPS hosting.', health: '/healthz' });
  return sendJson(res, 404, { error: 'not-found' });
});
server.on('upgrade', (req, socket, head) => {
  let pathname;
  try { pathname = new URL(req.url, 'http://localhost').pathname; } catch { pathname = ''; }
  const origin = req.headers.origin;
  const key = req.headers['sec-websocket-key'];
  const upgrade = String(req.headers.upgrade || '').toLowerCase();
  const connection = String(req.headers.connection || '').toLowerCase().split(',').map(s => s.trim());
  const validKey = typeof key === 'string' && Buffer.from(key, 'base64').length === 16;
  if (pathname !== '/' || upgrade !== 'websocket' || !connection.includes('upgrade') || req.headers['sec-websocket-version'] !== '13' || !validKey) {
    socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); socket.destroy(); return;
  }
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); socket.destroy(); return;
  }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const ws = new TinyWebSocket(socket, head);
  ws.clientIp = clientIp(req);
  const joinTimeout = setTimeout(() => {
    if (!ws.joined) { send(ws, { type: 'error', code: 'join-timeout', message: 'Join a room within 10 seconds.' }); ws.close(1008, 'Join timeout'); }
  }, 10_000); joinTimeout.unref?.();

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString('utf8')); } catch (_) { send(ws, { type: 'error', code: 'bad-json', message: 'Expected JSON.' }); return; }
    if (!msg || typeof msg.type !== 'string') { send(ws, { type: 'error', code: 'bad-message', message: 'Invalid message.' }); return; }
    if (!ws.joined) {
      if (msg.type !== 'join') { send(ws, { type: 'error', code: 'join-required', message: 'Join a room first.' }); return; }
      const roomCode = String(msg.room || '').toUpperCase();
      const role = String(msg.role || '');
      if (!/^[A-HJ-NP-Z2-9]{8,12}$/.test(roomCode) || !['host', 'guest'].includes(role)) { send(ws, { type: 'error', code: 'invalid-room', message: 'Room codes must be 8–12 characters from the supported alphabet.' }); return; }
      if (!rateLimitJoin(ws.clientIp)) { send(ws, { type: 'error', code: 'rate-limited', message: 'Too many room attempts from this network. Retry later.' }); ws.close(1008, 'Rate limited'); return; }
      let room = rooms.get(roomCode);
      if (role === 'host') {
        if (room) { send(ws, { type: 'error', code: 'room-exists', message: 'That room code is already in use. Generate a fresh room.' }); return; }
        room = { host: ws, guest: null, createdAt: Date.now(), expiryTimer: null };
        rooms.set(roomCode, room);
      } else {
        if (!room || !room.host || room.guest) { send(ws, { type: 'error', code: 'room-unavailable', message: 'Room is unavailable, full, or expired. Ask the host to create a new room.' }); return; }
        room.guest = ws;
      }
      ws.joined = true; ws.roomCode = roomCode; ws.role = role; clearTimeout(joinTimeout); touchRoom(roomCode);
      send(ws, { type: 'joined', room: roomCode, role, peerPresent: !!(room.host && room.guest), expiresInSeconds: Math.floor(ROOM_TTL_MS / 1000) });
      if (role === 'guest' && room.host) send(room.host, { type: 'peer-joined', room: roomCode });
      return;
    }
    const room = rooms.get(ws.roomCode);
    if (!room || room[ws.role] !== ws) { send(ws, { type: 'error', code: 'room-expired', message: 'Room expired. Start a new room.' }); ws.close(1008, 'Room expired'); return; }
    touchRoom(ws.roomCode);
    if (msg.type === 'keepalive') { send(ws, { type: 'keepalive-ok', room: ws.roomCode }); return; }
    if (msg.type === 'hangup') { send(room[ws.role === 'host' ? 'guest' : 'host'], { type: 'peer-signal', room: ws.roomCode, from: ws.role, signalType: 'hangup' }); return; }
    const allowed = (ws.role === 'host' && msg.type === 'offer') || (ws.role === 'guest' && msg.type === 'answer') || msg.type === 'ice';
    if (!allowed) { send(ws, { type: 'error', code: 'signal-not-allowed', message: 'Only expected WebRTC offer/answer/ICE messages are accepted.' }); return; }
    if (!msg.payload || JSON.stringify(msg.payload).length > 60 * 1024) { send(ws, { type: 'error', code: 'payload-too-large', message: 'Signaling payload too large.' }); return; }
    const peer = room[ws.role === 'host' ? 'guest' : 'host'];
    if (!peer || peer.readyState !== TinyWebSocket.OPEN) { send(ws, { type: 'error', code: 'peer-not-present', message: 'The other peer is not connected.' }); return; }
    send(peer, { type: 'peer-signal', room: ws.roomCode, from: ws.role, signalType: msg.type, payload: msg.payload });
  });
  ws.on('close', () => { clearTimeout(joinTimeout); detach(ws); });
  ws.on('error', () => { clearTimeout(joinTimeout); detach(ws); });
});

server.listen(PORT, HOST, () => {
  console.log(`TERRAVEX signalling relay listening on ${HOST}:${PORT}`);
  console.log(`Configured origin allow-list entries: ${ALLOWED_ORIGINS.size}`);
  console.log('Dependency-free mode: Node.js only. Signalling only, no audio relay or spacecraft uplink.');
});
function shutdown() { for (const code of [...rooms.keys()]) clearRoom(code, 'room-closed'); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 5000).unref?.(); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
