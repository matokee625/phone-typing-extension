'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { DesktopRunner, validateMode } = require('../server/desktop');

class FakeChild extends EventEmitter {
  constructor() {
    super();
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.input = '';
    this.stdin = { end: content => { this.input += content; } };
    this.killed = false;
  }
  kill() { this.killed = true;this.emit('close',null); }
}

function fixture() {
  const processes = [];
  const calls = [];
  const runner = new DesktopRunner({
    platform:'win32', scriptPath:'C:/test/desktop-typing.ps1',
    spawnImpl:(command,args,options) => {
      calls.push({command,args,options});
      const c = new FakeChild(); processes.push(c); return c;
    }
  });
  return {runner,processes,calls};
}

test('mode validation defaults to web and rejects unknown types', () => {
  assert.equal(validateMode(), 'web');
  assert.equal(validateMode('desktop'),'desktop');
  assert.throws(() => validateMode('anything'), /mode/i);
});

test('desktop runner is only available on Windows', () => {
  const runner = new DesktopRunner({platform:'linux'});
  assert.equal(runner.available,false);
  assert.throws(()=>runner.start({id:'x',text:'abc',speed:'normal',onUpdate:()=>{}}), /Windows/i);
});

test('starting a desktop job sends text to a PowerShell child and reports progress and completion', () => {
  const {runner,processes,calls} = fixture();
  const updates = [];
  runner.start({id:'abc',text:'Hello 👋',speed:'normal',onUpdate:update=>updates.push(update)});
  assert.equal(calls[0].command,'powershell.exe');
  const payload=JSON.parse(processes[0].input.trim());
  assert.equal(Buffer.from(payload.textBase64,'base64').toString('utf16le'),'Hello 👋');
  assert.equal(payload.speed,'normal');
  processes[0].stdout.emit('data',Buffer.from('STARTED\nPROG'));
  processes[0].stdout.emit('data',Buffer.from('RESS:50\nDONE\n'));
  processes[0].emit('close',0);
  assert.deepEqual(updates.map(x=>x.status),['started','started','done']);
  assert.equal(updates[1].progress,50);
  assert.equal(runner.active,null);
});

test('stopping a desktop job terminates input immediately and reports stopped once', () => {
  const {runner,processes} = fixture();
  const updates = [];
  runner.start({id:'abc',text:'ABC',speed:'slow',onUpdate:update=>updates.push(update)});
  runner.stop('abc');
  assert.equal(processes[0].killed,true);
  assert.deepEqual(updates.map(x=>x.status),['stopped']);
  assert.equal(runner.active,null);
});

test('unexpected agent exit marks the job as failed', () => {
  const {runner,processes} = fixture();
  const updates=[];
  runner.start({id:'abc',text:'ABC',speed:'normal',onUpdate:update=>updates.push(update)});
  processes[0].stderr.emit('data',Buffer.from('could not type'));
  processes[0].emit('close',1);
  assert.equal(updates.at(-1).status,'error');
  assert.match(updates.at(-1).message,/could not type/i);
});

test('desktop runner rejects a second job while one is active', () => {
  const {runner} = fixture();
  runner.start({id:'abc',text:'ABC',speed:'normal',onUpdate:()=>{}});
  assert.throws(()=>runner.start({id:'def',text:'DEF',speed:'normal',onUpdate:()=>{}}), /already/i);
});
