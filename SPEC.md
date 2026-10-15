# Leo: Virtual On-Air Assistant · Product & Technical Spec

> Audience: humans **and** coding agents (Claude Code, Codex, Cursor, etc.). Each section is meant to be actionable. Follow the acceptance criteria and keep within the constraints.

## 1. Goal
Build **Leo**, a virtual assistant for Austin AI Marketing who **looks, sounds and acts like a real on-air personality**. A visitor "calls" Leo from a web page and has a natural, spoken one-on-one conversation. Leo sits at an anchor desk in a broadcast-grade news studio, and the video wall behind him illustrates whatever he's talking about.

**Constraints:** browser-only, free and open-source tools, no paid APIs, no API keys, hosted on GitHub Pages. Leo must always be clearly labelled as a demo or virtual assistant.

## 2. Avatar
| Layer | Status | Description |
|---|---|---|
| Photoreal video loops | **Primary** | A generated anchor portrait, animated into two seamless loops: `media/leo-idle.mp4` (blink, slight sway) and `media/leo-talk.mp4` (speaking motion). The loops crossfade (about 160 ms ease) while audio plays, with a subtle mouth-area brightness pulse driven by audio amplitude. Rendered as a feathered video plane behind the desk. |
| 3D bust | Fallback | A procedural three.js bust (PBR) with blink, breathing and an amplitude-driven jaw. Used if the video loops fail to load. |
| Lite mode | Fallback | DOM `<video>` crossfade over a slide panel, used for `?lite=1`, devices with 2 or fewer cores, or no WebGL. |

### Avatar asset pipeline (reproducible)
1. **Portrait:** a photoreal, friendly, professional male anchor, chest-up, facing camera, seated at a desk, navy suit, studio lighting matching the set. Tools, in order of preference: Codex built-in image generation (ChatGPT login; never the API fallback), or the free Z-Image-Turbo HF Space. Output: `assets/portrait.png` (1152×864). **As built:** Z-Image-Turbo HF Space, because Codex had hit its ChatGPT Plus usage limit (resets 8:33 PM CT).
2. **Motion (as built):**
   - **Idle:** LivePortrait (KwaiVGI, open source), run locally on CPU with its `d0` example driver: `python inference.py -s portrait.png -d d0.mp4 --flag_force_cpu`. The free HF Space was rejected for anonymous ZeroGPU use (requested GPU time above the free limit).
   - **Talking:** SadTalker (open source, audio-driven lip-sync) on CPU, driven by a Kokoro `am_michael` line: `inference.py --driven_audio talk.wav --source_image portrait.png --still --preprocess full --size 256 --cpu`.
   - Alternatives: Hallo or MuseTalk, Wan image-to-video. Paid video APIs (Veo/Gemini, Runway, etc.) are out of scope.
3. **Seamless loops:** make each clip 3–5 s and loop it ping-pong (forward + reverse), so the first and last frames match with no pop.
4. **Key and encode:** `tools/matte.py` runs rembg (`u2net_human_seg`) on every frame and writes a **side-by-side MP4** at 1920×720: colour on the left, alpha matte on the right. The studio shader keys Leo over the LED wall, and it works in every browser (no WebM alpha needed). The clips are H.264 at about 90–150 KB each.
5. **Publishing note:** the GitHub connector used to publish this repo commits text only, so all `media/*` files are packed into `media/bundle.json` (base64) and turned into Blob URLs at load. To rebuild it: `python3 -c` with the snippet in §9, or push the binaries with git directly.

## 3. Voice
- **Primary:** Kokoro-82M via `kokoro-js` (transformers.js). Uses WebGPU (fp32, about 330 MB) when available, otherwise WASM (q8, about 92 MB). It is lazy-loaded at call start with a progress pill, then cached by the browser.
- **Voice:** `am_michael` at speed 0.97. It was chosen from am_michael, am_adam, am_fenrir and am_puck by generating WAVs on the box with Kokoro (kokoro-onnx) and scoring them with faster-whisper: am_michael had perfect transcription with natural sentence pauses, and am_adam ran sentences together.
- **Fallback:** `speechSynthesis` (system voice), with a boundary-driven mouth estimate.
- **Rules:**
  - Split replies into short sentences, synthesize sentence *n+1* while *n* plays (prebuffer), and leave a 170 ms pause between sentences.
  - **Only one utterance at a time:** every `speak()` cancels the previous one (token check).
  - **Speech recognition is stopped while Leo speaks** and restarts about 350 ms after he finishes, so Leo never hears himself.
  - Ignore empty, under-2-character, or duplicate transcripts (same text within 6 s), and anything that arrives while Leo is busy.
- **Lip-sync:** RMS of the `AnalyserNode` time-domain data, smoothed (attack about 0.45 per frame), drives `leoState.mouth` (0–1).

## 4. Brain
- `brain.js` is a rule-based intent matcher. Each intent has **3 or more varied replies** and never repeats the last reply for that intent. Each intent maps to a showcase `topic`.
- Intents: hello, how are you, who are you, price, pages, reels, bots, examples, services, contact, time, date, joke, thanks, bye (ends the call), and a fallback.
- Facts are limited to: booking and landing pages from $497; reels and content packages; AI reply bots; austinaimarketingco.com. Never invent prices, clients, testimonials or stats.

## 5. Studio design (three.js r160)
- **Look:** a modern broadcast news set (original design, no network logos or trademarks). The palette is deep navy `#0a1630`, white `#f5f7fb` and a single gold accent `#e0a526`. Type is Inter.
- **Rendering:**
  - ACES Filmic tone mapping, sRGB output, PCFSoft shadows.
  - RoomEnvironment PMREM for reflections, and `MeshPhysicalMaterial` (clearcoat) for the desk, floor and bezels.
  - Subtle bloom (strength 0.22, threshold 0.88), then a vignette and film-grain pass.
  - No neon, scanlines or retro glow.
- **Set pieces:**
  - a curved anchor desk (white clearcoat top, navy front, gold pinstripe, desk-front wordmark)
  - a curved LED video wall (cylinder section)
  - two angled side monitors on poles
  - a curved back wall with thin white light lines
  - a reflective glossy floor with a floor ring
- **Lighting:** a warm key spotlight (soft shadows), a cool fill, and a back or rim light, plus a low hemisphere ambient.
- **Camera:** five shots (wide, medium, close, left, right). On topic change it eases to the mapped shot (cubic in-out, 1.8 s), then a slow push-in (about 0.35 m over 14 s), with a tiny float.
- **Overlays (HTML):** a LIVE bug with call timer, a "demo assistant" label, the lower third (`media/lower-third.webm`, alpha, animates in once), the ticker (`media/ticker.mp4`, seamless loop), captions, and controls.

## 6. Showcase panel (LED wall)
The wall plays a looping motion-graphics clip per topic and crossfades between them (0.9 s, smoothstep) when Leo changes subject.

```jsonc
// remotion/src/theme.ts → SLIDES  (content schema)
{
  "<topic>": {
    "kicker": "SHORT CAPS LABEL",      // e.g. "BOOKING PAGES"
    "title":  "Headline",              // e.g. "From $497"
    "items":  ["bullet 1", "bullet 2", "bullet 3"]   // 3 items, short
  }
}
// topics: services | booking | reels | bots | examples | contact
// rendered file: media/slide-<topic>.mp4  (1536×512, 6 s seamless loop)
// brain.js intent.topic must be one of the topics above (or null = keep current)
```
To add a topic: add it to `SLIDES`, add a `<Composition>` (automatic via the map), re-render, then add the topic to `TOPICS` in `studio.js`, to `TOPIC_SHOT`, and to an intent in `brain.js`.

## 7. Motion layer: Remotion
`/remotion` is a Remotion 4 project that renders the wall slides, the lower third (VP8 with alpha) and the ticker into `/media`.
```bash
cd remotion && npm i
npx remotion studio                               # preview / edit
npx remotion render src/index.ts slide-booking ../media/slide-booking.mp4 --codec=h264 --crf=28
npx remotion render src/index.ts lower-third ../media/lower-third.webm --codec=vp8 --pixel-format=yuva420p --image-format=png
npm run render:all                                # every slide + ticker (h264)
```
**License note:** Remotion is source-available under the Remotion License. It is **free for individuals, non-profits and companies with up to 3 employees**. Larger companies need a paid Company License (see remotion.dev/license). Austin AI Marketing currently fits the free tier. Re-check before scaling the team or reselling Remotion-based tooling.

## 8. Tech stack
- Static site on GitHub Pages: HTML, CSS and ES modules, with no build step for the app.
- three.js 0.160 (jsDelivr CDN, import map), kokoro-js 1.2.1 (jsDelivr), Web Speech API (`SpeechRecognition`), Web Audio API.
- Optional extras: none required. All media is pre-rendered and committed.

## 9. File structure
```
index.html      UI shell, overlays, import map
app.js          call flow, speech in, turn-taking, captions, leoState
voice.js        Kokoro TTS + fallback, sentence prebuffer, amplitude
brain.js        intents → varied replies + topic
studio.js       three.js studio, Leo video plane, wall, camera, post FX
media/bundle.json   base64 bundle of leo-idle.mp4, leo-talk.mp4 (SBS colour|alpha), leo-poster.jpg, slide-*.mp4, lower-third.webm, ticker.mp4
tools/matte.py      rembg matte → side-by-side MP4
# rebuild bundle: python3 -c "import json,base64,os;T={'mp4':'video/mp4','webm':'video/webm','jpg':'image/jpeg'};json.dump({f:{'type':T[f.split('.')[-1]],'data':base64.b64encode(open('media/'+f,'rb').read()).decode()} for f in os.listdir('media') if f!='bundle.json'},open('media/bundle.json','w'))"
remotion/       Remotion source for the motion graphics
SPEC.md         this file
```

## 10. Acceptance criteria
1. On GitHub Pages over HTTPS, pressing call shows the ringing screen, then connecting, then the call. The timer runs and Leo greets out loud.
2. The voice pill shows load progress. Kokoro is used when it loads, otherwise speechSynthesis, and the call never blocks on the download.
3. Asking about pricing switches the wall to the booking slide and changes the camera angle. Reels, bots, examples and contact behave the same way.
4. Leo never answers his own voice. Duplicate or empty transcripts are ignored, and replies never overlap.
5. The same intent asked twice in a row gets a different reply.
6. The idle-to-talking crossfade has no visible pop, and the loops are seamless.
7. `?lite=1` works without WebGL. If the video loops fail, the 3D bust appears.
8. No camera access is requested (no `getUserMedia` video). A placeholder self-tile is shown.
9. The footer reads "Demo by Austin AI Marketing", and Leo is labelled as a demo assistant.
10. There are no paid APIs and no keys anywhere in the repo.

## 11. Roadmap
- **Camera (planned, not in this build):** opt-in only, behind an explicit button. It would show the user's own video tile, and later let Leo "see" the user (gestures, reading a product held up). This ships **only after a security and privacy review** covering consent UX, on-device processing, no recording or upload by default, and clear indicators.
- **Real phone line:** a SIP number (for example a low-cost SIP trunk) into **Asterisk** or **Pipecat** (open source voice-agent framework), with streaming STT, then the brain, then Kokoro TTS server-side, plus human hand-off. Alternatively, Twilio Voice and its WebRTC client (paid, per minute).
- **Photoreal live avatar:** real-time audio-driven lip-sync (e.g. MuseTalk or LivePortrait streaming on a GPU server) instead of pre-rendered loops.
- **LLM brain:** an optional in-browser WebLLM small model (WebGPU), or a server LLM with guardrails, grounded on the facts in §4.
- **More:** multilingual (French), booking-intent handoff to a calendar link, analytics on asked topics.
