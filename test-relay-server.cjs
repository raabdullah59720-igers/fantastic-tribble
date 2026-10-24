const assert = require('node:assert/strict');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const path = require('node:path');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
    s.on('error', reject);
  });
}
function clientFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  const mask = crypto.randomBytes(4);
  let header;
  if (payload.length < 126) header = Buffer.from([0x81, 0x80 | payload.length]);
  else { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2); }
  const out = Buffer.from(payload); for (let i=0;i<out.length;i++) out[i] ^= mask[i&3];
  return Buffer.concat([header, mask, out]);
}
class TestWs {
  constructor(socket, buffer = Buffer.alloc(0)) { this.socket=socket; this.buffer=buffer; this.waiters=[]; this.messages=[]; socket.on('data',b=>{this.buffer=Buffer.concat([this.buffer,b]);this.parse();}); socket.on('close',()=>{this.closed=true;this.parse();}); }
  parse(){ while(this.buffer.length>=2){let n=this.buffer[1]&0x7f,off=2;if(n===126){if(this.buffer.length<4)return;n=this.buffer.readUInt16BE(2);off=4;}else if(n===127){if(this.buffer.length<10)return;n=Number(this.buffer.readBigUInt64BE(2));off=10;}if(this.buffer.length<off+n)return;const opcode=this.buffer[0]&15,body=this.buffer.subarray(off,off+n);this.buffer=this.buffer.subarray(off+n);if(opcode===1){let msg;try{msg=JSON.parse(body.toString('utf8'));}catch{msg=body.toString('utf8');}const w=this.waiters.shift();if(w)w(msg);else this.messages.push(msg);} if(opcode===8){this.closed=true;}} }
  send(o){this.socket.write(clientFrame(JSON.stringify(o)));}
  next(timeout=1800){if(this.messages.length)return Promise.resolve(this.messages.shift());return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{const i=this.waiters.indexOf(done);if(i>=0)this.waiters.splice(i,1);reject(new Error('Timed out waiting for WebSocket message'));},timeout);const done=m=>{clearTimeout(timer);resolve(m);};this.waiters.push(done);});}
  close(){try{this.socket.write(Buffer.from([0x88,0x80,0,0,0,0]));}catch{} this.socket.end();}
}
async function connectWs(port, origin='http://127.0.0.1:8000') {
  const socket=net.connect(port,'127.0.0.1');
  await new Promise((resolve,reject)=>{socket.once('connect',resolve);socket.once('error',reject);});
  const key=crypto.randomBytes(16).toString('base64');
  socket.write(`GET / HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\nOrigin: ${origin}\r\n\r\n`);
  let buffer=Buffer.alloc(0);
  const response=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('WebSocket handshake timeout')),2000);
    const onData=b=>{buffer=Buffer.concat([buffer,b]);const i=buffer.indexOf('\r\n\r\n');if(i<0)return;clearTimeout(timer);socket.off('data',onData);resolve({head:buffer.subarray(0,i+4).toString('utf8'),tail:buffer.subarray(i+4)});};
    socket.on('data',onData);socket.once('error',e=>{clearTimeout(timer);reject(e);});
  });
  if(!response.head.includes('101 Switching Protocols')){socket.destroy();return {rejected:true,status:response.head.split('\r\n')[0]};}
  return {rejected:false,ws:new TestWs(socket,response.tail)};
}
async function main(){
  const port=await getFreePort();
  const root=path.join(__dirname,'..');
  const proc=spawn(process.execPath,[path.join(root,'relay-server','server.js')],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),ALLOWED_ORIGINS:'http://127.0.0.1:8000',ROOM_TTL_SECONDS:'60'},stdio:['ignore','pipe','pipe']});
  let output='';proc.stdout.on('data',b=>output+=b);proc.stderr.on('data',b=>output+=b);
  const waitHealth=async()=>{for(let i=0;i<40;i++){try{const r=await fetch(`http://127.0.0.1:${port}/healthz`);if(r.ok)return await r.json();}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error('Relay health endpoint did not start: '+output);};
  let host,guest,checks=0;
  try{
    const health=await waitHealth(); assert.equal(health.ok,true);checks++;
    assert.equal(health.audioRelay,false);assert.equal(health.satelliteUplink,false);assert.equal(health.voiceMailbox,'encrypted-temporary-memory-24h');checks++;
    const mailboxId=crypto.randomBytes(16).toString('base64url');
    const audioCiphertext=Buffer.alloc(1040,7).toString('base64'),metaCiphertext=Buffer.alloc(64,8).toString('base64');
    const iv=Buffer.alloc(12,9).toString('base64');
    const post=async(action,body,origin='http://127.0.0.1:8000')=>fetch(`http://127.0.0.1:${port}/api/voice-mail/${action}`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const noCors=await post('list',{mailboxId},'https://blocked.example');assert.equal(noCors.status,403);checks++;
    const sent=await post('send',{mailboxId,audioIv:iv,audioCiphertext,metaIv:iv,metaCiphertext});assert.equal(sent.status,201);const sentJson=await sent.json();assert.equal(sentJson.ok,true);assert.equal(sentJson.message.encrypted,true);assert.equal('subject' in sentJson.message,false);checks++;
    const listed=await post('list',{mailboxId});const listJson=await listed.json();assert.equal(listJson.messages.length,1);assert.equal(listJson.messages[0].sizeBytes,1024);checks++;
    const read=await post('read',{mailboxId,id:listJson.messages[0].id});const readJson=await read.json();assert.equal(readJson.audioCiphertext,audioCiphertext);assert.equal(readJson.metaCiphertext,metaCiphertext);checks++;
    const ack=await post('ack',{mailboxId,id:listJson.messages[0].id});assert.equal((await ack.json()).removed,true);const after=await post('list',{mailboxId});assert.equal((await after.json()).messages.length,0);checks++;
    const bad=await connectWs(port,'https://not-allowed.example');assert.equal(bad.rejected,true);assert.match(bad.status,/403/);checks++;
    const h=await connectWs(port);assert.equal(h.rejected,false);host=h.ws;
    const room='ABCD2345EF';host.send({type:'join',room,role:'host'});const hj=await host.next();assert.equal(hj.type,'joined');assert.equal(hj.role,'host');checks++;
    const g=await connectWs(port);assert.equal(g.rejected,false);guest=g.ws;guest.send({type:'join',room,role:'guest'});const gj=await guest.next();assert.equal(gj.type,'joined');assert.equal(gj.peerPresent,true);const pj=await host.next();assert.equal(pj.type,'peer-joined');checks++;
    host.send({type:'offer',payload:{type:'offer',sdp:'test-sdp'}});const offer=await guest.next();assert.equal(offer.type,'peer-signal');assert.equal(offer.signalType,'offer');assert.equal(offer.payload.sdp,'test-sdp');checks++;
    guest.send({type:'answer',payload:{type:'answer',sdp:'answer-sdp'}});const answer=await host.next();assert.equal(answer.signalType,'answer');assert.equal(answer.payload.sdp,'answer-sdp');checks++;
    host.send({type:'hangup'});const hangup=await guest.next();assert.equal(hangup.signalType,'hangup');checks++;
    const duplicate=await connectWs(port);const d=duplicate.ws;d.send({type:'join',room,role:'host'});const dupMsg=await d.next();assert.equal(dupMsg.type,'error');assert.equal(dupMsg.code,'room-exists');checks++;
    console.log(`Dependency-free signalling + encrypted mailbox integration: ${checks} check groups passed.`);
  } finally {host?.close();guest?.close();proc.kill('SIGTERM');await new Promise(r=>{const t=setTimeout(r,1500);proc.once('exit',()=>{clearTimeout(t);r();});});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
