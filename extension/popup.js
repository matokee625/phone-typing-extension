'use strict';
const code = document.getElementById('code');
const status = document.getElementById('status');
chrome.storage.local.get('pairingCode', result => {code.value = result.pairingCode || '';});
function refresh() {
  chrome.runtime.sendMessage({type:'GET_CONNECTION'}, state => {
    if (chrome.runtime.lastError || !state) {status.textContent='Extension is starting…';return;}
    status.textContent = !state.enabled ? 'Disconnected' : state.connected
      ? 'Connected ✓ ' + (state.targetReady ? '• Textbox selected' : '• Click a textbox')
      : 'Trying to reach local server…';
  });
}
document.getElementById('connect').addEventListener('click', () => {
  chrome.runtime.sendMessage({type:'SET_CONNECTION',code:code.value.trim()}, result => {
    status.textContent = result?.error || 'Connecting…';setTimeout(refresh,600);
  });
});
document.getElementById('disconnect').addEventListener('click', () => {
  chrome.runtime.sendMessage({type:'DISCONNECT'}, () => refresh());
});
refresh();setInterval(refresh,1000);

async function loadPhoneQr() {
  const status = document.getElementById('qrStatus');
  const qr = document.getElementById('phoneQr');
  try {
    const infoResponse = await fetch('http://127.0.0.1:8765/phone-link.json', {cache:'no-store'});
    if (!infoResponse.ok) throw new Error('Local server unavailable');
    const info = await infoResponse.json();
    if (!info.url) throw new Error('No Wi-Fi address detected');
    const imageResponse = await fetch('http://127.0.0.1:8765/qr.svg', {cache:'no-store'});
    if (!imageResponse.ok) throw new Error('QR unavailable');
    const svg = await imageResponse.text();
    qr.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    qr.hidden = false;
    document.getElementById('phoneUrl').textContent = info.url;
    status.textContent = '';
  } catch (err) {
    qr.hidden = true;
    status.textContent = 'Start node server/server.js to show the QR code.';
  }
}
document.getElementById('largeQr').addEventListener('click', () => {
  chrome.tabs.create({url:'http://127.0.0.1:8765/connect'});
});
loadPhoneQr();
