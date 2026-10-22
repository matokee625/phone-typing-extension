'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {acceptWebSocket, OPEN} = require('./websocket');
const {validateRequest, safeEqual} = require('./lib');
const {DesktopRunner, validateMode} = require('./desktop');
const {getPhoneUrls} = require('./lan');
const {createQrSvg} = require('./qr');

const PORT = Number(process.env.PORT || 8765);
const CODE = String(crypto.randomInt(10000000, 100000000)); // new on each run
const PUBLIC = path.join(__dirname, 'public');
const jobs = new Map();
const desktop = new DesktopRunner();
const badAttempts = new Map();
let extension = null;
let targetReady = false;
let targetName = 'No textbox selected';

function json(res, status, body) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(body));
}
function tooManyAttempts(req) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = badAttempts.get(ip);
  if (!entry || now - entry.since > 60_000) {badAttempts.set(ip, {since: now, count: 0}); return false;}
  return entry.count >= 12;
}
function authorized(req) {
  if (tooManyAttempts(req)) return false;
  if (safeEqual(req.headers['x-pairing-code'], CODE)) return true;
  const ip = req.socket.remoteAddress || 'unknown';
  badAttempts.get(ip).count++;
  return false;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 16_000) {reject(new Error('Payload too large'));req.destroy();}
    });
    req.on('end', () => {
      try {resolve(JSON.parse(body));} catch {reject(new Error('Invalid JSON'));}
    });
    req.on('error', reject);
  });
}
function sendExtension(message) {
  if (!extension || extension.readyState !== OPEN) return false;
  extension.send(JSON.stringify(message));
  return true;
}
const MIME = {'.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8'};
const htmlSafe = value => String(value).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function phoneUrls() {return getPhoneUrls(os.networkInterfaces(), PORT, CODE);}
function phoneLink(requestedIp) {
  const options = phoneUrls();
  if (!requestedIp) return {options, selected: options[0]};
  return {options, selected: options.find(x=>x.address===requestedIp)};
}
function serveQr(res, selected) {
  if (!selected) return json(res,503,{error:'No private network IP detected. Connect your computer to Wi-Fi.'});
  res.writeHead(200, {'Content-Type':'image/svg+xml; charset=utf-8', 'Cache-Control':'no-store',
    'Content-Security-Policy':"default-src 'none'; sandbox",'X-Content-Type-Options':'nosniff'});
  res.end(createQrSvg(selected.url));
}
function serveConnect(res, {options, selected}) {
  const entries = options.map(item=>`<li><a href="/connect?ip=${encodeURIComponent(item.address)}">${htmlSafe(item.name)} — ${htmlSafe(item.url)}</a></li>`).join('');
  const main = selected ? `<div class="qr-frame"><img src="/qr.svg?ip=${encodeURIComponent(selected.address)}" width="296" height="296" alt="QR code for ${htmlSafe(selected.url)}"></div><p class="scan-url">${htmlSafe(selected.url)}</p><p>Scan with your phone camera to open the typing controller directly.</p>`
    : '<p>No private-network address detected. Connect your computer to your home Wi-Fi, then restart the server.</p>';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Scan to connect — Phone Type Remote</title><link rel="stylesheet" href="/style.css"></head><body><main class="scan-page"><div class="tag">PHONE TYPE REMOTE · PAIR PHONE</div><h1>Scan to <span>connect</span></h1><p class="intro">On your computer, display this page. On your phone, scan the QR with your camera to open typing directly.</p><section class="card scan-card">${main}</section><p class="footer">Both devices must be on the same trusted Wi-Fi. The QR code automatically pairs your phone.</p>${options.length>1 ? `<details><summary>Other network addresses</summary><ul class="other-addresses">${entries}</ul></details>`:''}<p><a href="/">Open phone controller on this computer</a></p></main></body></html>`;
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store',
    'Content-Security-Policy':"default-src 'self'; img-src 'self'; style-src 'self'; script-src 'none'; object-src 'none'; frame-ancestors 'none'",
    'X-Frame-Options':'DENY', 'X-Content-Type-Options':'nosniff'});
  res.end(html);
}

function serveStatic(res, pathname) {
  const allowed = new Map([['/','index.html'], ['/index.html','index.html'], ['/app.js','app.js'], ['/style.css','style.css']]);
  const name = allowed.get(pathname);
  if (!name) return json(res, 404, {error:'Not found'});
  try {
    const file = path.join(PUBLIC, name);
    res.writeHead(200, {
      'Content-Type':MIME[path.extname(name)],
      'Cache-Control':'no-store',
      'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'",
      'X-Frame-Options':'DENY', 'X-Content-Type-Options':'nosniff'
    });
    fs.createReadStream(file).pipe(res);
  } catch {json(res, 500, {error:'Could not load interface'});}
}
const server = http.createServer(async (req, res) => {
  let pathname;
  try {pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;}
  catch {return json(res, 400, {error:'Invalid URL'});}
  if (pathname==='/connect' || pathname==='/qr.svg' || pathname==='/phone-link.json') {
    if (req.method !== 'GET') return json(res,405,{error:'Method not allowed'});
    const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const ip = parsed.searchParams.get('ip');
    const {options,selected}=phoneLink(ip);
    if (ip && !selected) return json(res,400,{error:'This is not a detected local-network address.'});
    if (pathname==='/connect') return serveConnect(res,{options,selected});
    if (pathname==='/qr.svg') return serveQr(res,selected);
    return json(res,200,{url:selected?.url || null, options:options.map(x=>({name:x.name,url:x.url}))});
  }
  if (!pathname.startsWith('/api/')) {
    if (req.method !== 'GET') return json(res, 405, {error:'Method not allowed'});
    return serveStatic(res, pathname);
  }
  if (!authorized(req)) return json(res, 401, {error:'Wrong pairing code or too many attempts'});
  if (req.method === 'GET' && pathname === '/api/status') {
    return json(res, 200, {connected: !!extension && extension.readyState === OPEN, targetReady, targetName, desktopAvailable: desktop.available});
  }
  if (req.method === 'GET' && /^\/api\/jobs\/[a-f0-9-]+$/.test(pathname)) {
    const job = jobs.get(pathname.split('/').pop());
    return json(res, job ? 200 : 404, job ? {status:job.status, message:job.message, progress:job.progress} : {error:'Not found'});
  }
  if (req.method === 'POST' && pathname === '/api/start') {
    let request, mode;
    try {
      const body = await readBody(req);
      request = validateRequest(body);
      mode = validateMode(body.mode);
    } catch (err) {return json(res, 400, {error:err.message});}
    if (mode === 'web') {
      if (!extension || extension.readyState !== OPEN) return json(res, 503, {error:'Connect the Chrome extension first.'});
      if (!targetReady) return json(res, 409, {error:'Click a textbox in Chrome first.'});
    } else {
      if (!desktop.available) return json(res, 501, {error:'Desktop keyboard mode requires Windows.'});
      if (desktop.active) return json(res, 409, {error:'Another desktop typing job is already running.'});
    }
    const id = crypto.randomUUID();
    jobs.set(id, {status:'queued', mode, message: mode === 'desktop' ? 'Preparing Windows keyboard input' : 'Sending to Chrome',progress:0});
    if (mode === 'desktop') {
      try {
        desktop.start({id, ...request, onUpdate:({status,message,progress}) => {
          const job = jobs.get(id);
          if (!job) return;
          job.status=status;
          job.message=String(message || status).slice(0,150);
          if (Number.isFinite(progress)) job.progress=Math.max(0,Math.min(100,Math.round(progress)));
        }});
      } catch(err) {jobs.delete(id);return json(res,503,{error:err.message});}
    } else sendExtension({type:'type',id,...request});
    return json(res,200,{id});
  }
  if (req.method === 'POST' && pathname === '/api/stop') {
    let body;
    try {body = await readBody(req);} catch {return json(res, 400, {error:'Invalid request'});}
    const id = body && body.id;
    const job = jobs.get(id);
    if (!job) return json(res, 404, {error:'Job not found'});
    if (job.status === 'started' || job.status === 'queued') {
      job.status = 'stopping';job.message = 'Stopping typing';
      if (job.mode === 'desktop') desktop.stop(id);
      else sendExtension({type:'stop', id});
    }
    return json(res, 200, {status:job.status});
  }
  json(res, 404, {error:'Unknown API route'});
});

server.on('upgrade', (req, socket, head) => {
  let parsed;
  try {parsed = new URL(req.url, 'http://localhost');} catch {socket.destroy();return;}
  // Only Chrome extension background pages may open a command channel.
  const origin = req.headers.origin || '';
  const goodOrigin = /^chrome-extension:\/\/[a-p]{32}$/.test(origin);
  if (parsed.pathname !== '/extension' || !goodOrigin || !safeEqual(parsed.searchParams.get('code'), CODE)) {
    socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); socket.destroy();return;
  }
  const ws = acceptWebSocket(req,socket,head);
  if (!ws) return;
  setupExtension(ws);
});
function setupExtension(ws) {
  if (extension && extension !== ws) extension.close(1000, 'A new extension connected');
  extension = ws; targetReady = false; targetName = 'Click a textbox in Chrome';
  ws.on('message', raw => {
    let msg;
    try {msg = JSON.parse(String(raw));} catch {return;}
    if (msg.type === 'ping') {ws.send(JSON.stringify({type:'pong'}));return;}
    if (msg.type === 'target') {
      targetReady = msg.ready === true;
      targetName = targetReady ? 'Textbox selected' : 'Click a textbox in Chrome';
    }
    if (msg.type === 'job' && typeof msg.id === 'string') {
      const job = jobs.get(msg.id);
      if (!job || !['started','done','stopped','error'].includes(msg.status)) return;
      job.status = msg.status;
      job.message = typeof msg.message === 'string' ? msg.message.slice(0,120) : msg.status;
      if (Number.isFinite(msg.progress)) job.progress = Math.max(0, Math.min(100,Math.round(msg.progress)));
    }
  });
  ws.on('close', () => {
    if (extension !== ws) return;
    extension = null; targetReady = false;
    for (const job of jobs.values()) {
      if (['queued','started','stopping'].includes(job.status)) {job.status='error';job.message='Chrome connection lost';}
    }
  });
}

setInterval(() => {
  if (jobs.size > 200) {
    for (const key of [...jobs.keys()].slice(0, jobs.size - 100)) jobs.delete(key);
  }
  for (const [ip, entry] of badAttempts) if (Date.now() - entry.since > 60_000) badAttempts.delete(ip);
},60_000).unref();

server.listen(PORT, '0.0.0.0', () => {
  console.log('\nPhone Typing Extension — local Wi-Fi mode');
  console.log('Pairing code:', CODE);
  console.log('Extension connects to: ws://127.0.0.1:' + PORT);
  console.log('Windows keyboard mode: '+(desktop.available ? 'available for focused Chrome editors' : 'unavailable on this operating system'));
  console.log('Open the following address on your PHONE (same Wi-Fi):');
  const urls=phoneUrls();
  if (urls.length) for (const option of urls) console.log('  ' + option.url + ' (' + option.name + ')');
  else console.log('  No private Wi-Fi IPv4 address detected.');
  console.log('\nTo show a large QR code ON THIS COMPUTER: http://localhost:' + PORT + '/connect');
  console.log('Scan the QR from your phone camera; enter the pairing code on the phone.');
  console.log('\nKeep this terminal open while you use the extension. Ctrl+C to stop.\n');
});
