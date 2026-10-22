'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const path=require('node:path');
const net=require('node:net');

async function port() {
  const sock=net.createServer();
  await new Promise(resolve=>sock.listen(0,'127.0.0.1',resolve));
  const p=sock.address().port;
  await new Promise(resolve=>sock.close(resolve));
  return p;
}
test('local server reports desktop capability and rejects unsupported mode on non-Windows', {skip:process.platform === 'win32'}, async () => {
  const p=await port();
  const child=spawn(process.execPath,[path.resolve(__dirname,'../server/server.js')],{env:{...process.env,PORT:String(p)},stdio:['ignore','pipe','pipe']});
  let output='';
  try {
    const code=await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Server did not start')) ,3000);
      child.stdout.on('data',data=>{
        output+=String(data);
        const match=output.match(/Pairing code:\s*(\d{8})/);
        if(match){clearTimeout(timeout);resolve(match[1]);}
      });
      child.once('error',reject);
    });
    const status=await fetch(`http://127.0.0.1:${p}/api/status`,{headers:{'X-Pairing-Code':code}});
    assert.equal(status.status,200);
    assert.equal((await status.json()).desktopAvailable,false);
    const attempt=await fetch(`http://127.0.0.1:${p}/api/start`,{
      method:'POST',headers:{'X-Pairing-Code':code,'Content-Type':'application/json'},
      body:JSON.stringify({text:'Hello docs',speed:'normal',mode:'desktop'})
    });
    assert.equal(attempt.status,501);
    assert.match((await attempt.json()).error,/Windows/i);
  } finally {
    child.kill();
    await Promise.race([once(child,'exit').catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1000))]);
  }
});
