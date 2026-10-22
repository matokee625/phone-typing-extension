'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('selecting an ordinary input and then a password field clears the target', () => {
  const events = {};
  const sent = [];
  class Element {
    constructor(type) {this.type = type;this.autocomplete = '';this.isConnected = true;}
    closest() {return this;}
    matches() {return false;}
  }
  class HTMLInputElement extends Element {}
  class HTMLTextAreaElement extends Element {}
  const context = {
    Element,HTMLInputElement,HTMLTextAreaElement,
    document:{addEventListener:(name,fn)=>{events[name]=fn;}},
    chrome:{runtime:{onMessage:{addListener:()=>{}},sendMessage:msg=>sent.push(msg)}},
    PhoneTypingUtils:{},
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../extension/content.js'),'utf8'),context);
  events.focusin({target:new HTMLInputElement('text'),type:'focusin'});
  assert.equal(sent.at(-1).type,'TARGET_SELECTED');
  events.pointerdown({target:new HTMLInputElement('password'),type:'pointerdown'});
  assert.equal(sent.at(-1).type,'TARGET_LOST');
});
