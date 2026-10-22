'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const os=require('node:os');
const path=require('node:path');
const {getPhoneUrls}=require('../server/lan');
async function reservePort() {
  const free=net.createServer();
  await new Promise((resolve,reject)=>free.once('error',reject).listen(0,'127.0.0.1',resolve));
  const port=free.address().port;
  await new Promise(resolve=>free.close(resolve));
  return port;
}
async function ready(child) {
  await new Promise((resolve,reject)=>{
    let output='';
    const deadline=setTimeout(()=>reject(new Error('Server did not start: '+output)),5000);
    child.stdout.on('data',buf=>{output+=buf; if(output.includes('Keep this terminal open')) {clearTimeout(deadline);resolve();}});
    child.once('error',error=>{clearTimeout(deadline);reject(error);});
    child.once('exit',code=>{clearTimeout(deadline);reject(new Error('Server exited: '+code+' '+output));});
  });
}
test('scan page and QR endpoint expose the same LAN URL, without exposing pairing code',async()=>{
  const port=await reservePort();
  const child=spawn(process.execPath,['server/server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
  try {
    await ready(child);
    const base=`http://127.0.0.1:${port}`;
    const page=await fetch(base+'/connect');
    assert.equal(page.status,200);
    assert.match(page.headers.get('content-type'),/text\/html/);
    const html=await page.text();
    assert.match(html,/Scan to/);
    assert.match(html,/qr\.svg/);
    const infoRes=await fetch(base+'/phone-link.json');
    assert.equal(infoRes.status,200);
    const info=await infoRes.json();
    const options=getPhoneUrls(os.networkInterfaces(),port);
    assert.match(info.url, new RegExp('^' + options[0]?.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?code=\\d{8}$'));
    if(options.length) {
      const qrRes=await fetch(base+'/qr.svg');
      assert.equal(qrRes.status,200);
      assert.match(qrRes.headers.get('content-type'),/image\/svg\+xml/);
      const svg=await qrRes.text();
      assert.match(svg,/viewBox="0 0 37 37"/);
      assert.doesNotMatch(svg,/\d{8}.*pairing/i);
    }
    assert.equal((await fetch(base+'/qr.svg?ip=127.0.0.1')).status,400);
  } finally {
    child.kill();
  }
});
