// Leo's voice: Kokoro-82M (kokoro-js, in-browser) with speechSynthesis fallback.
// One utterance at a time, sentence prebuffering, real-amplitude lip-sync via AnalyserNode.
const KOKORO_URL = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js';
const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE = 'am_michael', SPEED = 0.97, GAP_MS = 170;
let tts = null, loading = null, ctx = null, analyser = null, buf = null, token = 0, current = null, simAmp = 0;
export const state = {engine: 'speechSynthesis', ready: false, speaking: false};
function audio() {
  if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.connect(ctx.destination); buf = new Float32Array(analyser.fftSize); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export function unlock() { try { audio(); } catch (e) {} }
export function amplitude() {
  if (!state.speaking) return 0;
  if (state.engine === 'kokoro' && analyser) { analyser.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; return Math.min(1, Math.sqrt(s / buf.length) * 5.5); }
  simAmp *= 0.86; return simAmp; // speechSynthesis: boundary-driven estimate
}
export function load(onProgress = () => {}) {
  if (loading) return loading;
  loading = (async () => {
    const {KokoroTTS} = await import(KOKORO_URL);
    const tries = navigator.gpu ? [['webgpu', 'fp32'], ['wasm', 'q8']] : [['wasm', 'q8']];
    for (const [device, dtype] of tries) {
      try {
        const files = {};
        tts = await KokoroTTS.from_pretrained(MODEL, {dtype, device, progress_callback: (p) => {
          if (p.status === 'progress' && p.total) { files[p.file] = [p.loaded, p.total]; const v = Object.values(files); onProgress(v.reduce((a, b) => a + b[0], 0) / v.reduce((a, b) => a + b[1], 0)); }
        }});
        await tts.generate('Hi.', {voice: VOICE, speed: SPEED}); // warm up
        state.engine = 'kokoro'; state.ready = true; state.device = device; onProgress(1); return true;
      } catch (e) { console.warn('Kokoro', device, 'failed', e); tts = null; }
    }
    throw new Error('Kokoro unavailable');
  })().catch((e) => { console.warn(e); state.engine = 'speechSynthesis'; return false; });
  return loading;
}
export function splitSentences(text) {
  return (String(text).match(/[^.!?]+[.!?]*/g) || []).map((s) => s.trim()).filter(Boolean);
}
export function stop() {
  token++; state.speaking = false;
  if (current) { try { current.stop(); } catch (e) {} current = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function synth(s) { const a = await tts.generate(s, {voice: VOICE, speed: SPEED}); const b = audio().createBuffer(1, a.audio.length, a.sampling_rate); b.copyToChannel(a.audio, 0); return b; }
function playBuffer(b, my) {
  return new Promise((res) => { if (my !== token) return res(); const src = ctx.createBufferSource(); src.buffer = b; src.connect(analyser); current = src; src.onended = () => { current = null; res(); }; src.start(); });
}
function sayNative(s, my) {
  return new Promise((res) => {
    if (!('speechSynthesis' in window) || my !== token) return setTimeout(res, s.length * 55);
    const u = new SpeechSynthesisUtterance(s); const v = speechSynthesis.getVoices();
    u.voice = v.find((x) => /en-US/.test(x.lang) && /Guy|David|Daniel|Google US English|Andrew|Christopher/i.test(x.name)) || v.find((x) => /^en/.test(x.lang)) || null;
    u.rate = 1.0; u.onboundary = () => { simAmp = 1; };
    const iv = setInterval(() => { simAmp = Math.max(simAmp, 0.35 + Math.random() * 0.4); }, 90);
    u.onend = u.onerror = () => { clearInterval(iv); res(); }; speechSynthesis.speak(u);
  });
}
// Speak text; resolves when finished or interrupted. Only one call is ever active.
export async function speak(text) {
  stop(); const my = ++token; const parts = splitSentences(text); if (!parts.length) return;
  state.speaking = true;
  try {
    if (state.engine === 'kokoro' && tts) {
      let next = synth(parts[0]);
      for (let i = 0; i < parts.length; i++) {
        const b = await next; if (my !== token) return;
        next = i + 1 < parts.length ? synth(parts[i + 1]) : null; // prebuffer the next sentence while this one plays
        await playBuffer(b, my); if (my !== token) return;
        if (next) await sleep(GAP_MS);
      }
    } else {
      for (const p of parts) { await sayNative(p, my); if (my !== token) return; await sleep(GAP_MS); }
    }
  } finally { if (my === token) state.speaking = false; }
}
