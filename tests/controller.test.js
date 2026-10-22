'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function makeController({onRequest, missingElements = []}) {
  const elements = {};
  const timers = [];
  const storage = new Map([['phone-typing-code', '12345678']]);
  function get(id) {
    if (missingElements.includes(id)) return null;
    if (!elements[id]) {
      const listeners = {};
      elements[id] = {
        value: id === 'words' ? 'Hello test' : id === 'speed' ? 'normal' : '',
        disabled: id === 'start' || id === 'stop',
        textContent: '',
        listeners,
        classList: {add() {}, remove() {}, toggle() {}},
        addEventListener(name, handler) {listeners[name] = handler;},
      };
    }
    return elements[id];
  }
  const context = {
    document: { getElementById: get },
    sessionStorage: {
      getItem: key => storage.get(key),
      setItem: (key,val) => storage.set(key,val),
      removeItem: key => storage.delete(key),
    },
    fetch: async (url, options) => {
      const {status, body} = await onRequest(url, options);
      return {ok:status >= 200 && status < 300, json: async () => body};
    },
    setInterval(callback) {timers.push(callback);},
    alert() {},
    console,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../server/public/app.js'), 'utf8'), context);
  return {
    get,
    refresh: () => timers[0](),
    click: id => get(id).listeners.click(),
    flush: async () => {for (let i=0; i<12; i++) await new Promise(resolve => setImmediate(resolve));},
  };
}

test('when a queued job is lost, Start becomes available again with a selected textbox', async () => {
  const c = makeController({onRequest: async url => {
    if (url === '/api/status') return {status:200,body:{connected:true,targetReady:true}};
    if (url === '/api/start') return {status:200,body:{id:'job-id'}};
    if (url === '/api/jobs/job-id') return {status:404,body:{error:'Not found'}};
    throw new Error('Unexpected URL ' + url);
  }});
  await c.flush();
  assert.equal(c.get('start').disabled,false);
  await c.click('start');
  await c.flush();
  assert.equal(c.get('start').disabled,true);
  await c.refresh();
  await c.flush();
  assert.equal(c.get('start').disabled,false);
  assert.equal(c.get('stop').disabled,true);
  assert.match(c.get('result').textContent, /previous|not found|no longer/i);
});

test('connected and selected textbox shows a clear reason to Start when there is no text', async () => {
  const c = makeController({onRequest:async url => {
    if (url === '/api/status') return {status:200,body:{connected:true,targetReady:true}};
    throw new Error('Unexpected URL ' + url);
  }});
  c.get('words').value = '';
  await c.flush();
  c.get('words').listeners.input();
  assert.equal(c.get('start').disabled,true);
  assert.match(c.get('readiness').textContent, /enter.*text/i);
  c.get('words').value = 'Hello test';
  c.get('words').listeners.input();
  assert.equal(c.get('start').disabled,false);
  assert.match(c.get('readiness').textContent, /ready/i);
});


test('controller still enables Start when an older cached HTML page lacks the readiness element', async () => {
  const c = makeController({missingElements:['readiness'], onRequest: async url => {
    if (url === '/api/status') return {status:200,body:{connected:true,targetReady:true}};
    throw new Error('Unexpected URL ' + url);
  }});
  await c.flush();
  assert.equal(c.get('target').textContent, '✓ Textbox selected in Chrome');
  assert.equal(c.get('start').disabled, false);
});

test('Windows desktop mode enables Start for Google Docs without a DOM textbox selection', async () => {
  const c = makeController({onRequest:async url => {
    if (url === '/api/status') return {status:200,body:{connected:true,targetReady:false,desktopAvailable:true}};
    if (url === '/api/start') return {status:200,body:{id:'job1'}};
    throw new Error('Unexpected URL '+url);
  }});
  c.get('mode').value='desktop';
  c.get('mode').listeners.change();
  await c.refresh();
  await c.flush();
  assert.equal(c.get('start').disabled,false);
  assert.match(c.get('readiness').textContent,/google docs/i);
  assert.match(c.get('status').textContent,/Windows keyboard/i);
});

test('desktop mode remains disabled with helpful message on non-Windows computers', async () => {
  const c = makeController({onRequest:async url => {
    if (url === '/api/status') return {status:200,body:{connected:true,targetReady:true,desktopAvailable:false}};
    throw new Error('Unexpected URL '+url);
  }});
  c.get('mode').value='desktop';
  c.get('mode').listeners.change();
  await c.refresh();
  await c.flush();
  assert.equal(c.get('start').disabled,true);
  assert.match(c.get('readiness').textContent,/Windows/i);
});
