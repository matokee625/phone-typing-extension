'use strict';
// Small, dependency-free RFC 6455 server for local, trusted-network usage.
// Browser clients send masked text frames; messages are limited to 16 KB.
const crypto = require('node:crypto');
const {EventEmitter} = require('node:events');
const OPEN = 1;
const CLOSED = 3;
const MAX_PAYLOAD = 16384;
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
class LocalWebSocket extends EventEmitter {
  constructor(socket, head) {
    super();this.socket = socket;this.readyState = OPEN;this.buffer = Buffer.alloc(0);
    socket.on('data', data => this.consume(data));
    socket.on('error', () => this.terminate());
    socket.on('close', () => {
      this.readyState = CLOSED;this.emit('close');
    });
    if (head && head.length) this.consume(head);
  }
  frame(payload, opcode = 1) {
    if (this.readyState !== OPEN) return;
    const value = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    let header;
    if (value.length < 126) header = Buffer.from([0x80 | opcode,value.length]);
    else if (value.length < 65536) {
      header = Buffer.alloc(4);header[0] = 0x80 | opcode;header[1] = 126;header.writeUInt16BE(value.length,2);
    } else return this.terminate();
    this.socket.write(Buffer.concat([header,value]));
  }
  send(text) {this.frame(Buffer.from(String(text),'utf8'),1);}
  close(code=1000, reason='') {
    if (this.readyState !== OPEN) return;
    const safeReason = Buffer.from(String(reason),'utf8').subarray(0,123);
    const data = Buffer.alloc(2+safeReason.length);data.writeUInt16BE(code,0);safeReason.copy(data,2);
    this.frame(data,8);this.socket.end();
  }
  terminate() {if (!this.socket.destroyed) this.socket.destroy();}
  consume(data) {
    this.buffer = Buffer.concat([this.buffer,data]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0], second = this.buffer[1];
      const fin = !!(first & 0x80), op = first & 0x0f, masked = !!(second & 0x80);
      if (!fin || (first & 0x70) || !masked || ![1,8,9,10].includes(op)) return this.terminate();
      let len = second & 0x7f;
      let offset = 2;
      if (len === 126) {
        if (this.buffer.length < 4) return;
        len = this.buffer.readUInt16BE(2);offset=4;
      } else if (len === 127) return this.terminate();
      if (len > MAX_PAYLOAD || (op >= 8 && len > 125)) return this.terminate();
      if (this.buffer.length < offset + 4 + len) return;
      const mask = this.buffer.subarray(offset,offset+4);
      const payload = Buffer.from(this.buffer.subarray(offset+4,offset+4+len));
      this.buffer = this.buffer.subarray(offset+4+len);
      for (let i=0;i<len;i++) payload[i] ^= mask[i%4];
      if (op === 1) {
        try {new TextDecoder('utf-8',{fatal:true}).decode(payload);} catch {return this.terminate();}
        this.emit('message',payload);
      } else if (op === 8) {this.close();return;}
      else if (op === 9) this.frame(payload,10);
    }
  }
}
function acceptWebSocket(req,socket,head=Buffer.alloc(0)) {
  const key = req.headers['sec-websocket-key'];
  const protocol = req.headers['sec-websocket-version'];
  if (req.headers.upgrade?.toLowerCase() !== 'websocket' || protocol !== '13' || typeof key !== 'string' || !/^[A-Za-z0-9+/]{22}==$/.test(key)) {
    socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');socket.destroy();return null;
  }
  const accept = crypto.createHash('sha1').update(key+GUID).digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  return new LocalWebSocket(socket,head);
}
module.exports = {acceptWebSocket,OPEN};
