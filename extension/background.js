'use strict';
const SERVER = 'ws://127.0.0.1:8765/extension?code=';
let socket = null;
let keepalive = null;
let retryTimer = null;
let enabled = false;
let pairingCode = '';
let target = null; // Set only after a real textbox is selected in Chrome.
let activeJob = null;

function send(message) {
  if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}
function sendJob(id, status, message, progress) {
  send({type:'job', id, status, message, ...(typeof progress === 'number' ? {progress} : {})});
}
function notifyTarget() {send({type:'target', ready: !!target});}
function clearTarget() {
  if (activeJob) {
    const job = activeJob;
    activeJob = null;
    chrome.tabs.sendMessage(job.tabId, {type:'STOP_TEXT',id:job.id}, {frameId:job.frameId}, () => void chrome.runtime.lastError);
    sendJob(job.id,'stopped','Stopped because you left the selected tab.');
  }
  target = null;notifyTarget();
}
function disconnect() {
  clearTimeout(retryTimer);retryTimer=null;
  if (keepalive) {clearInterval(keepalive);keepalive=null;}
  const previous = socket; socket = null;
  if (previous) previous.close();
}
function scheduleReconnect() {
  if (enabled && !retryTimer) {
    retryTimer = setTimeout(() => {retryTimer = null;connect();}, 2500);
  }
}
function connect() {
  disconnect();
  if (!enabled || !/^\d{8}$/.test(pairingCode)) return;
  const ws = new WebSocket(SERVER + encodeURIComponent(pairingCode));
  socket = ws;
  ws.onopen = () => {
    if (socket !== ws) return;
    send({type:'ping'});
    notifyTarget();
    keepalive = setInterval(() => send({type:'ping'}), 20000);
  };
  ws.onmessage = event => {
    let msg;
    try {msg = JSON.parse(event.data);} catch {return;}
    if (msg.type === 'type') handleType(msg);
    if (msg.type === 'stop') handleStop(msg);
  };
  ws.onerror = () => {}; // onclose handles reconnection
  ws.onclose = () => {
    if (socket !== ws) return;
    socket = null;
    if (keepalive) {clearInterval(keepalive);keepalive = null;}
    scheduleReconnect();
  };
}
async function handleType(msg) {
  if (!msg || !msg.id || typeof msg.text !== 'string' || !['slow','normal','fast'].includes(msg.speed)) return;
  if (!target) {sendJob(msg.id,'error','Click a textbox in Chrome first.');return;}
  if (activeJob) {sendJob(msg.id,'error','Another typing command is already running.');return;}
  const activeTabs = await chrome.tabs.query({active:true,lastFocusedWindow:true});
  if (!activeTabs.some(t => t.id === target.tabId)) {
    sendJob(msg.id,'error','Switch back to the selected Chrome tab and click the field.');
    return;
  }
  const jobTarget = {...target};
  activeJob = {id:msg.id,...jobTarget};
  sendJob(msg.id,'started','Typing…',0);
  chrome.tabs.sendMessage(jobTarget.tabId, {type:'TYPE_TEXT',id:msg.id,text:msg.text,speed:msg.speed}, {frameId:jobTarget.frameId}, result => {
    if (chrome.runtime.lastError) {
      sendJob(msg.id,'error','Textbox is no longer available; click it again.');
      activeJob = null;clearTarget();return;
    }
    if (!result || !result.accepted) {activeJob = null;sendJob(msg.id,'error',result?.error || 'Could not start typing.');return;}
  });
}
function handleStop(msg) {
  if (!activeJob || activeJob.id !== msg.id) {sendJob(msg.id,'stopped','Nothing is currently typing.');return;}
  chrome.tabs.sendMessage(activeJob.tabId, {type:'STOP_TEXT',id:msg.id}, {frameId:activeJob.frameId}, () => void chrome.runtime.lastError);
}
chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
  if (message?.type === 'TARGET_SELECTED' && sender.tab?.id != null) {
    target = {tabId:sender.tab.id, frameId:sender.frameId ?? 0};
    notifyTarget(); return;
  }
  if (message?.type === 'TARGET_LOST' && sender.tab?.id === target?.tabId && sender.frameId === target?.frameId) {
    clearTarget();return;
  }
  if (message?.type === 'JOB_STATUS' && sender.tab?.id != null) {
    const {id,status,progress,message:info} = message;
    if (typeof id === 'string' && ['started','done','stopped','error'].includes(status)) {
      sendJob(id,status,typeof info === 'string' ? info : status,progress);
      if (activeJob?.id === id && ['done','stopped','error'].includes(status)) activeJob = null;
    }
    return;
  }
  if (message?.type === 'SET_CONNECTION') {
    (async () => {
      const code = String(message.code || '').trim();
      if (!/^\d{8}$/.test(code)) return sendResponse({ok:false,error:'Enter the 8-digit code from the terminal.'});
      pairingCode = code;enabled = true;
      await chrome.storage.local.set({pairingCode,enabled});
      connect();sendResponse({ok:true});
    })();
    return true;
  }
  if (message?.type === 'DISCONNECT') {
    (async () => {
      enabled=false;pairingCode='';disconnect();clearTarget();
      await chrome.storage.local.set({pairingCode:'',enabled:false});sendResponse({ok:true});
    })();return true;
  }
  if (message?.type === 'GET_CONNECTION') {
    sendResponse({enabled, connected:socket?.readyState===WebSocket.OPEN, targetReady:!!target});
  }
});
chrome.tabs.onActivated.addListener(({tabId}) => {if (target && target.tabId !== tabId) clearTarget();});
chrome.tabs.onRemoved.addListener(tabId => {if (target?.tabId === tabId) clearTarget();});
chrome.tabs.onUpdated.addListener((tabId,changeInfo) => {if (target?.tabId === tabId && changeInfo.status === 'loading') clearTarget();});
async function restore() {
  const saved = await chrome.storage.local.get({pairingCode:'',enabled:false});
  pairingCode = saved.pairingCode;
  enabled = saved.enabled;
  if (enabled) connect();
}
restore();
chrome.runtime.onStartup.addListener(restore);
chrome.runtime.onInstalled.addListener(restore);
