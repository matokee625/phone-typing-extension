'use strict';
const { spawn } = require('node:child_process');
const path = require('node:path');

function validateMode(value) {
  if (value === undefined || value === 'web') return 'web';
  if (value === 'desktop') return 'desktop';
  throw new Error('Unknown typing mode.');
}

class DesktopRunner {
  constructor({platform=process.platform,spawnImpl=spawn,scriptPath=path.join(__dirname,'desktop-typing.ps1')}={}) {
    this.platform=platform;
    this.spawnImpl=spawnImpl;
    this.scriptPath=scriptPath;
    this.active=null;
  }
  get available() { return this.platform === 'win32'; }
  start({id,text,speed,onUpdate}) {
    if (!this.available) throw new Error('Desktop keyboard mode requires Windows.');
    if (this.active) throw new Error('Another desktop typing job is already running.');
    const child=this.spawnImpl('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',this.scriptPath],{
      windowsHide:true,stdio:['pipe','pipe','pipe']
    });
    const job={id,child,onUpdate,closed:false,stdout:'',stderr:''};
    this.active=job;
    const update=(status,message,progress) => onUpdate({id,status,message,...(progress === undefined ? {} : {progress})});
    const complete=(status,message,progress) => {
      if (job.closed) return;
      job.closed=true;
      if (this.active===job) this.active=null;
      update(status,message,progress);
    };
    const handleLine = line => {
      if (job.closed) return;
      if (line==='STARTED') update('started','Typing into the focused Chrome editor…',0);
      else if (/^PROGRESS:\d{1,3}$/.test(line)) {
        update('started','Typing…',Math.min(100,Number(line.slice('PROGRESS:'.length))));
      } else if (line==='DONE') complete('done','Finished typing.',100);
      else if (line.startsWith('ERROR:')) complete('error',line.slice(6).trim().slice(0,150));
    };
    child.stdout.on('data',chunk=>{
      job.stdout+=String(chunk);
      while(job.stdout.includes('\n')){
        const cut=job.stdout.indexOf('\n');
        const line=job.stdout.slice(0,cut).trim();
        job.stdout=job.stdout.slice(cut+1);
        handleLine(line);
      }
      if (job.stdout.length>2048) job.stdout='';
    });
    child.stderr.on('data',chunk=>{job.stderr=(job.stderr+String(chunk)).slice(-800);});
    child.on('error',e=>complete('error','Could not start Windows keyboard input: '+e.message));
    child.on('close',code=>{
      if (job.stdout.trim()) handleLine(job.stdout.trim());
      complete('error',(job.stderr.trim() || `Desktop typing process ended (code ${code}).`).slice(0,150));
    });
    try {child.stdin.end(JSON.stringify({textBase64:Buffer.from(text,'utf16le').toString('base64'),speed})+'\n');}
    catch(e) {complete('error','Could not send text to Windows: '+e.message);child.kill();}
  }
  stop(id) {
    const job=this.active;
    if (!job || job.id!==id || job.closed) return false;
    job.closed=true;
    this.active=null;
    job.onUpdate({id,status:'stopped',message:'Typing stopped.'});
    job.child.kill();
    return true;
  }
}
module.exports={DesktopRunner,validateMode};
