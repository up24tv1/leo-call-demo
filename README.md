# Call Leo: virtual on-air assistant (demo)

**Live:** https://up24tv1.github.io/leo-call-demo/ · **Spec for humans & AI agents:** [SPEC.md](SPEC.md)

A FaceTime-style call with **Leo**, a photoreal virtual news anchor for Austin AI Marketing, live from a broadcast news studio rendered in your browser.

- **Leo:** photoreal video loops (idle and talking) generated from a portrait and animated with LivePortrait. They crossfade while he speaks. A 3D bust and a lite mode are the fallbacks.
- **Voice:** a natural neural voice (Kokoro-82M, `am_michael`) running in the browser with WebGPU or WASM, with a lip-sync pulse driven by the real audio amplitude. If it can't load, it falls back to the system voice.
- **Studio:** three.js with PBR materials, a curved LED wall that changes with the topic (Remotion-rendered motion graphics), side monitors, an anchor desk, key/fill/back lighting, a reflective floor, eased camera moves, a lower third and a ticker.
- **Talk:** speech recognition (Chrome or Edge) or typing. Leo never hears himself, ignores duplicates, and doesn't repeat himself.
- **Privacy:** **no camera access** in this build. The microphone is only used during the call for speech recognition.

Free and open source, with no API keys and no servers. Hosted on GitHub Pages. `?lite=1` gives a lightweight version.

## Phone line (not included)
A real Leo phone number needs telephony: a SIP number into Asterisk or Pipecat (open source), or Twilio Voice with its WebRTC client (paid per minute) plus a small token server. See SPEC.md §11.

Demo by Austin AI Marketing, austinaimarketingco.com
