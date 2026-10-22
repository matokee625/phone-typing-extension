'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createQrSvg, createQrMatrix} = require('../server/qr');
const {getPhoneUrls} = require('../server/lan');

test('QR for phone controller has correct geometry, quiet zone, and safe SVG', () => {
  const url = 'http://192.168.150.218:8765/';
  const qr = createQrMatrix(url);
  assert.equal(qr.length, 29);
  assert.ok(qr.every(row => row.length === 29));
  assert.deepEqual(qr.slice(0, 7).map(row => row.slice(0,7)), [
    [1,1,1,1,1,1,1], [1,0,0,0,0,0,1], [1,0,1,1,1,0,1], [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1], [1,0,0,0,0,0,1], [1,1,1,1,1,1,1]
  ]);
  const svg = createQrSvg(url);
  assert.match(svg, /viewBox="0 0 37 37"/);
  assert.match(svg, /fill="#fff"/);
  assert.match(svg, /<path d="M/);
  assert.doesNotMatch(svg, /<script|<foreignObject/i);
});

test('Wi-Fi is selected ahead of VirtualBox and vEthernet IPs', () => {
  const ifaces = {
    'VirtualBox Host-Only Network': [{family:'IPv4', internal:false, address:'192.168.56.1'}],
    'vEthernet (Default Switch)': [{family:'IPv4', internal:false, address:'172.23.12.1'}],
    'Wi-Fi': [{family:'IPv4', internal:false, address:'192.168.150.218'}],
  };
  assert.deepEqual(getPhoneUrls(ifaces,8765).map(x => x.url), [
    'http://192.168.150.218:8765/',
    'http://172.23.12.1:8765/',
    'http://192.168.56.1:8765/'
  ]);
});

test('LAN urls reject loopback, public internet, link-local, and malformed addresses', () => {
  const ifaces = {WiFi: [
    {family:'IPv4',internal:true,address:'127.0.0.1'},
    {family:'IPv4',internal:false,address:'169.254.5.1'},
    {family:'IPv4',internal:false,address:'8.8.8.8'},
    {family:'IPv4',internal:false,address:'192.168.1.77'},
    {family:'IPv6',internal:false,address:'fe80::1234'},
  ]};
  assert.deepEqual(getPhoneUrls(ifaces,8765).map(x=>x.url), ['http://192.168.1.77:8765/']);
});

test('different phone IP URLs produce different QR patterns', () => {
  assert.notDeepEqual(createQrMatrix('http://192.168.150.218:8765/'), createQrMatrix('http://192.168.56.1:8765/'));
});
