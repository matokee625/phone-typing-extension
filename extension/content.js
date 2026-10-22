'use strict';
(() => {
  let selected = null;
  let running = null;
  const editableInputTypes = new Set(['text','search','email','tel','url','number']);
  function editableFrom(node) {
    if (!(node instanceof Element)) return null;
    const el = node.closest('input, textarea, [contenteditable]');
    if (!el || el.matches(':disabled, [readonly]')) return null;
    if (el instanceof HTMLInputElement) {
      if (!editableInputTypes.has(el.type)) return null;
      if (/^(?:cc-|one-time-code|current-password|new-password)/.test(el.autocomplete || '')) return null;
      return el;
    }
    if (el instanceof HTMLTextAreaElement) return el;
    if (el.isContentEditable) return el;
    return null;
  }
  function report(status, message, progress) {
    if (running) chrome.runtime.sendMessage({type:'JOB_STATUS',id:running.id,status,message,progress});
  }
  function selectField(event) {
    const found = editableFrom(event.target);
    if (!found) {
      if (selected) {
        if (running) running.abort.abort();
        selected = null;
        chrome.runtime.sendMessage({type:'TARGET_LOST'});
      }
      return;
    }
    if (running && selected !== found) running.abort.abort();
    selected = found;
    chrome.runtime.sendMessage({type:'TARGET_SELECTED'});
  }
  document.addEventListener('focusin', selectField, true);
  document.addEventListener('pointerdown', selectField, true);

  function insertInput(el, char) {
    // Use the native setter + input event for compatibility with reactive forms.
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto,'value').set;
    const before = el.value;
    let start = before.length, end = before.length;
    try {
      if (typeof el.selectionStart === 'number') start = el.selectionStart;
      if (typeof el.selectionEnd === 'number') end = el.selectionEnd;
    } catch {} // e.g. input[type=number] does not expose a selection range
    setter.call(el, before.slice(0,start) + char + before.slice(end));
    try {el.setSelectionRange(start+char.length,start+char.length);} catch {}
    el.dispatchEvent(new InputEvent('input', {bubbles:true,composed:true,inputType:'insertText',data:char}));
  }
  function insertEditable(el, char) {
    const worked = document.execCommand('insertText',false,char);
    if (worked) return;
    const selection = document.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : document.createRange();
    if (!selection?.rangeCount || !el.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(el);range.collapse(false);
    }
    range.deleteContents();
    const textNode = document.createTextNode(char);
    range.insertNode(textNode);range.setStartAfter(textNode);range.collapse(true);
    selection.removeAllRanges();selection.addRange(range);
    el.dispatchEvent(new InputEvent('input', {bubbles:true,composed:true,inputType:'insertText',data:char}));
  }
  function delay(ms, signal) {
    return new Promise(resolve => {
      if (signal.aborted) return resolve();
      const t = setTimeout(() => {signal.removeEventListener('abort',cancel);resolve();},ms);
      function cancel() {clearTimeout(t);resolve();}
      signal.addEventListener('abort',cancel,{once:true});
    });
  }
  async function typeText(job, el, text, speed) {
    const chars = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text), item => item.segment)
      : Array.from(text);
    let written = 0;
    try {
      el.focus();
      for (let i = 0;i < chars.length;i++) {
        if (job.abort.signal.aborted) break;
        if (!el.isConnected) throw new Error('Textbox was removed from the page.');
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) insertInput(el,chars[i]);
        else insertEditable(el,chars[i]);
        written = i + 1;
        if (written % 20 === 0) report('started','Typing…',100*written/chars.length);
        if (i < chars.length - 1) await delay(PhoneTypingUtils.timingDelay(chars[i],speed),job.abort.signal);
      }
      report(job.abort.signal.aborted ? 'stopped' : 'done',job.abort.signal.aborted ? 'Typing stopped.' : 'Finished typing.',100*written/chars.length);
    } catch (err) {report('error',err.message || 'Typing failed.');}
    finally {running = null;}
  }
  chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (msg?.type === 'STOP_TEXT') {
      if (running && running.id === msg.id) running.abort.abort();
      respond({accepted:true});return;
    }
    if (msg?.type !== 'TYPE_TEXT') return;
    if (running) {respond({accepted:false,error:'Typing is already in progress.'});return;}
    if (!selected || !selected.isConnected) {respond({accepted:false,error:'Click a textbox again.'});return;}
    try {PhoneTypingUtils.validateRequest(msg);} catch(err) {respond({accepted:false,error:err.message});return;}
    const job = {id:msg.id,abort:new AbortController()};
    running = job;
    respond({accepted:true});
    typeText(job,selected,msg.text,msg.speed);
  });
})();
