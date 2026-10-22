'use strict';
const $ = id => document.getElementById(id);
let code = sessionStorage.getItem('phone-typing-code') || '';
try {
  const urlParams = new URLSearchParams(window.location.search);
  const incoming = urlParams.get('code') || urlParams.get('c');
  if (incoming && /^\d{8}$/.test(incoming)) {
    code = incoming;
    sessionStorage.setItem('phone-typing-code', code);
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
} catch {}
let currentJob = null;
let busy = false;
let connected = false;
let targetReady = false;
let desktopAvailable = false;
let refreshing = false;
const doneStates = ['done','error','stopped'];

function api(path, method = 'GET', body) {
  return fetch(path, {method, cache:'no-store', headers:{'X-Pairing-Code':code, ...(body ? {'Content-Type':'application/json'} : {})},body:body ? JSON.stringify(body) : undefined})
    .then(async r => {const data = await r.json();if (!r.ok) throw new Error(data.error || 'Request failed');return data;});
}
function updateControls() {
  const hasText = !!$('words').value.trim();
  const mode = $('mode')?.value || 'web';
  const ready = mode === 'desktop' ? desktopAvailable : (connected && targetReady);
  $('count').textContent = $('words').value.length + ' / 3000';
  $('start').disabled = !ready || busy || !hasText;
  $('stop').disabled = !busy || !currentJob;
  let reason;
  if (mode === 'desktop' && !desktopAvailable) reason = 'Desktop keyboard mode requires Windows. Use Web form mode on this computer.';
  else if (mode === 'web' && !connected) reason = 'Waiting for the Chrome extension to connect.';
  else if (mode === 'web' && !targetReady) reason = 'Click an editable textbox in Chrome on your computer.';
  else if (busy) reason = 'A typing command is in progress. Press Stop to cancel it.';
  else if (!hasText) reason = 'Enter some text above to enable Start typing.';
  else reason = mode === 'desktop' ? 'Ready: click inside the Google Docs editor, keep Chrome in front, then press Start.' : 'Ready to type into the selected textbox.';
  const readiness = $('readiness');
  if (readiness) readiness.textContent = reason;
  const hint = $('modehint');
  if (hint) hint.textContent = mode === 'desktop' ? 'Click inside the document or rich editor in Chrome. No textbox-selected indicator is needed. The focused Chrome window must stay in front.' : 'Click a standard textbox in Chrome; the extension detects your selection.';
}
function showRemote() { $('loginBox').classList.add('hidden');$('controller').classList.remove('hidden');updateControls(); }
function showLogin() {$('loginBox').classList.remove('hidden');$('controller').classList.add('hidden');$('code').value=code;}
function finish(status, message) {
  busy = false;
  currentJob = null;
  $('result').textContent = message || status;
  updateControls();
}
async function refresh() {
  if (!code || refreshing) return;
  refreshing = true;
  try {
    const st = await api('/api/status');
    connected = st.connected === true;
    targetReady = connected && st.targetReady === true;
    desktopAvailable = st.desktopAvailable === true;
    const desktopMode = $('mode')?.value === 'desktop';
    $('status').textContent = desktopMode ? (desktopAvailable ? 'Windows keyboard mode available' : 'Windows keyboard mode unavailable') : (connected ? 'Chrome extension connected' : 'Chrome extension disconnected');
    $('dot').classList.toggle('green', desktopMode ? desktopAvailable : connected);
    $('target').textContent = ($('mode')?.value === 'desktop') ? (desktopAvailable ? 'Windows keyboard ready — focus an editor in Chrome.' : 'Windows keyboard mode unavailable on this computer.') : (targetReady ? '✓ Textbox selected in Chrome' : 'Click a textbox in Chrome on your computer.');
    updateControls();
    if (currentJob) {
      let job;
      try {job = await api('/api/jobs/' + currentJob);}
      catch (err) {
        // A job can disappear if the local server restarts or its history is cleared.
        if (/not found/i.test(err.message)) {
          finish('error','Previous typing job was not found. You can try again.');
          return;
        }
        throw err;
      }
      $('result').textContent = job.message + (job.status==='started' && job.progress ? ` (${job.progress}%)` : '');
      if (doneStates.includes(job.status)) finish(job.status, job.message);
    }
  } catch (err) {
    if (/pairing code/i.test(err.message)) {
      code = '';
      sessionStorage.removeItem('phone-typing-code');
      connected = false;targetReady = false;desktopAvailable = false;
      finish('error','Your pairing code is no longer valid.');
      showLogin();
    } else {
      connected = false;targetReady = false;desktopAvailable = false;
      updateControls();
      $('result').textContent = 'Connection check failed: ' + err.message;
    }
  } finally {
    refreshing = false;
  }
}
$('pair').addEventListener('click', async () => {
  code = $('code').value.trim();
  if (!/^\d{8}$/.test(code)) {$('code').setCustomValidity('Enter all 8 digits');$('code').reportValidity();return;}
  $('code').setCustomValidity('');
  try {await api('/api/status'); sessionStorage.setItem('phone-typing-code',code);showRemote();refresh();}
  catch (err) {alert(err.message);}
});
$('code').addEventListener('input', () => $('code').setCustomValidity(''));
$('unpair').addEventListener('click', () => {
  code='';connected=false;targetReady=false;desktopAvailable=false;busy=false;currentJob=null;
  sessionStorage.removeItem('phone-typing-code');showLogin();
});
$('words').addEventListener('input', updateControls);
$('mode')?.addEventListener('change', () => {
  if ($('mode').value === 'desktop') $('target').textContent = desktopAvailable ? 'Windows keyboard ready — focus an editor in Chrome.' : 'Windows keyboard mode unavailable on this computer.';
  else $('target').textContent = targetReady ? '✓ Textbox selected in Chrome' : 'Click a textbox in Chrome on your computer.';
  $('status').textContent = $('mode').value === 'desktop' ? (desktopAvailable ? 'Windows keyboard mode available' : 'Windows keyboard mode unavailable') : (connected ? 'Chrome extension connected' : 'Chrome extension disconnected');
  $('dot').classList.toggle('green', $('mode').value === 'desktop' ? desktopAvailable : connected);
  updateControls();
});
$('start').addEventListener('click', async () => {
  const mode = $('mode')?.value || 'web';
  if (busy || !(mode === 'desktop' ? desktopAvailable : connected && targetReady) || !$('words').value.trim()) {updateControls();return;}
  busy=true;currentJob=null;updateControls();
  try {
    const res = await api('/api/start', 'POST', {text:$('words').value, speed:$('speed').value, mode});
    currentJob = res.id;
    updateControls();
    $('result').textContent='Queued for typing…';
  } catch (err) {finish('error',err.message);}
});
$('stop').addEventListener('click', async () => {
  if (!currentJob) return;
  try {await api('/api/stop','POST',{id:currentJob});$('result').textContent='Stopping…';}
  catch (err) {$('result').textContent=err.message;}
});
if (code) {showRemote();refresh();} else showLogin();
setInterval(refresh, 950);
async function syncQrInfo() {
  try {
    const res = await fetch('/phone-link.json', {cache:'no-store'});
    if (!res.ok) return;
    const data = await res.json();
    if (data.url && $('loginQrUrl')) $('loginQrUrl').textContent = data.url;
  } catch {}
}
syncQrInfo();
