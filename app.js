import * as Voice from './voice.js';
const $ = (id) => document.getElementById(id);
const MIC_SVG = $('muteBtn').innerHTML, MUTED_SVG = '<svg viewBox="0 0 24 24"><path d="M19 11h-2a5 5 0 0 1-.7 2.5l1.5 1.5A7 7 0 0 0 19 11zM15 11V5a3 3 0 0 0-5.9-.8L15 10.1V11zM4.3 3 3 4.3l6 6V11a3 3 0 0 0 4.4 2.6l1.6 1.6A5 5 0 0 1 7 11H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 3.5-1.3l3.2 3.2L21 18.5z"/></svg>';
let inCall = false, muted = false, busy = false, t0 = 0, timerI = null, ringT = null, rec = null, listening = false, lastHeard = {t: '', at: 0};
let blink = 0, nextBlink = 0;
function show(id) { ['start', 'ring', 'ended'].forEach((s) => $(s).classList.toggle('on', s === id)); $('call').classList.toggle('on', id === 'call'); }
function cap(who, text) { const d = document.createElement('div'); const b = document.createElement('b'); b.textContent = who === 'you' ? 'You' : 'Leo'; d.className = 'cap ' + who; d.append(b, text); const w = document.createElement('div'); w.append(d); $('caps').append(w); while ($('caps').children.length > 2) $('caps').firstChild.remove(); }
// Animation state shared with the studio (mouth from real audio amplitude)
function tick(ts) { requestAnimationFrame(tick);
  if (ts > nextBlink) { blink = 1; nextBlink = ts + 2600 + Math.random() * 3200; } blink = Math.max(0, blink - 0.12);
  const amp = Voice.amplitude(); const st = window.leoState || {mouth: 0}; const mouth = st.mouth + (amp - st.mouth) * 0.45;
  window.leoState = {mouth, blink, speaking: Voice.state.speaking};
  if (document.body.classList.contains('lite')) $('liteTalk').style.opacity = Voice.state.speaking ? 1 : 0;
}
requestAnimationFrame(tick);
// ---- Speech recognition: off while Leo speaks; dedupe; ignore empty ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function startListen() {
  if (!SR || muted || !inCall || listening || busy || Voice.state.speaking) return;
  rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.continuous = false; rec.maxAlternatives = 1;
  rec.onresult = (e) => { const r = e.results[e.results.length - 1]; if (r.isFinal) handle(r[0].transcript, 'voice'); };
  rec.onend = () => { listening = false; if (inCall && !busy) setTimeout(startListen, 250); };
  rec.onerror = (e) => { listening = false; if (e.error === 'not-allowed') { $('status').textContent = 'Microphone blocked. Type to Leo instead.'; muted = true; } };
  try { rec.start(); listening = true; $('status').textContent = '🎙 Listening…'; } catch (e) { listening = false; }
}
function stopListen() { if (rec) { rec.onend = null; rec.onresult = null; try { rec.abort(); } catch (e) {} rec = null; } listening = false; $('status').textContent = ''; }
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
async function say(text, topic) {
  busy = true; stopListen(); cap('leo', text);
  if (topic && window.leoStudio) window.leoStudio.setTopic(topic); else if (topic) setLitePanel(topic);
  await Voice.speak(text);
  busy = false; if (inCall) setTimeout(startListen, 350);
}
async function handle(text, src) {
  const n = norm(text); if (!inCall || n.length < 2) return;
  if (busy || Voice.state.speaking) return;                                   // never answer while talking
  if (n === lastHeard.t && Date.now() - lastHeard.at < 6000) return;          // duplicate transcript
  lastHeard = {t: n, at: Date.now()}; cap('you', text.trim());
  const r = window.reply(text); await say(r.text, r.topic); if (r.end) setTimeout(end, 500);
}
window.leoTest = {handle, get busy() { return busy; }};
$('typeRow').onsubmit = (e) => { e.preventDefault(); const v = $('typed').value; $('typed').value = ''; handle(v, 'text'); };
// ---- Lite mode panel ----
function setLitePanel(t) { const v = $('litePanel'); const src = (window.leoMediaMap || {})[`slide-${t}.mp4`]; if (src && v.src !== src) { v.src = src; v.play().catch(() => {}); } }
// ---- Voice loading ----
function loadVoice() {
  if (/novoice=1/.test(location.search)) { $('voicePill').style.display = 'none'; return; } // testing / low-memory: system voice only
  $('voicePill').style.display = 'flex';
  Voice.load((p) => { $('voiceBar').style.width = Math.round(p * 100) + '%'; $('voiceTxt').textContent = 'Loading Leo\u2019s voice ' + Math.round(p * 100) + '%'; })
    .then((ok) => { $('voiceTxt').textContent = ok ? 'Natural voice on (Kokoro)' : 'Using system voice'; $('voiceBar').style.width = '100%'; setTimeout(() => ($('voicePill').style.display = 'none'), 2500); });
}
// ---- Call flow ----
function call() {
  Voice.unlock(); loadVoice(); show('ring'); $('ringTxt').textContent = 'Calling…';
  ringT = setTimeout(() => { $('ringTxt').textContent = 'Connecting…'; ringT = setTimeout(connect, 900); }, 1700);
}
function connect() {
  show('call'); inCall = true; muted = false; t0 = Date.now(); $('caps').innerHTML = '';
  timerI = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('timer').textContent = String((s / 60) | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500);
  ['ticker', 'liteIdle', 'liteTalk'].forEach((id) => $(id).play().catch(() => {})); setLitePanel('services');
  setTimeout(() => { $('lt').currentTime = 0; $('lt').play().catch(() => {}); }, 1200);
  say("Good evening, and welcome to the studio. I'm Leo, the virtual assistant for Austin AI Marketing. I'm a demo running in your browser. What can I help you with?", 'services');
}
function end() {
  const d = $('timer').textContent; inCall = false; busy = false; clearTimeout(ringT); clearInterval(timerI); stopListen(); Voice.stop();
  $('endTxt').textContent = 'Duration ' + d; $('timer').textContent = '00:00'; show('ended');
}
$('callBtn').onclick = call; $('againBtn').onclick = call; $('cancelBtn').onclick = end; $('endBtn').onclick = end;
$('muteBtn').onclick = () => { muted = !muted; $('muteBtn').classList.toggle('off', muted); $('muteBtn').innerHTML = muted ? MUTED_SVG : MIC_SVG; muted ? stopListen() : startListen(); };
if (!SR) $('status').textContent = 'Voice input isn\u2019t supported in this browser. Type to Leo below.';
