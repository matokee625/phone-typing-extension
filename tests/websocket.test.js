'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const {once} = require('node:events');
const {acceptWebSocket, OPEN} = require('../server/websocket');

test('local WebSocket relay accepts fragmented TCP packets and round-trips messages', async () => {
  const server = http.createServer();
  server.on('upgrade', (req,sock,head) => {
    const peer = acceptWebSocket(req,sock,head);
    peer.on('message', data => peer.send(data.toString()));
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const client = new WebSocket(`ws://127.0.0.1:${server.address().port}`);
  try {
    await new Promise((resolve,reject) => {client.addEventListener('open',resolve,{once:true});client.addEventListener('error',reject,{once:true});});
    assert.equal(client.readyState,OPEN);
    const result = new Promise(resolve => client.addEventListener('message',ev=>resolve(ev.data),{once:true}));
    client.send('Hello 🦊');
    assert.equal(await result,'Hello 🦊');
  } finally {client.close(); await new Promise(resolve => server.close(resolve));}
});
