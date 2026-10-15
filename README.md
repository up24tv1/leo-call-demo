# Call Leo: video call demo

A one-on-one, FaceTime-style video call with **Leo**, a demo virtual assistant for Austin AI Marketing that runs entirely in your browser.

- **Your side:** your webcam is shown in a picture-in-picture tile, with buttons for mute, camera on/off and end call.
- **Leo's side, a 3D studio (three.js r160, free CDN):** a broadcast/creator set with a warm key spotlight, magenta and cyan rim lights, neon LED strips, an ON AIR sign, soft additive light cones, a reflective floor (Reflector), floating dust particles, bloom, and a shallow depth-of-field (BokehPass) for a bokeh feel. The camera drifts slowly and follows your mouse for parallax. Leo's 3D bust breathes, blinks, sways his head while talking, and his mouth syncs to speech.
- **Lightweight fallback:** devices with 2 or fewer CPU cores, WebGL failures, or `?lite=1` use a 2D canvas avatar that also breathes, blinks and lip-syncs.
- **Conversation:** your speech is recognized with the Web Speech API (Chrome or Edge), or you can type in the text box. Leo answers out loud with speechSynthesis, and live captions show both sides.
- **Brain:** rule-based answers in `brain.js` cover services, pricing (pages from $497), the website, time and date, and small talk, with a fallback. There is an optional **WebLLM** toggle (Qwen2.5-0.5B, about 1 GB, needs WebGPU), loaded free from a CDN. It is off by default.
- **Call flow:** calling and connecting screens, a call timer and a call-ended screen.

No API keys and no servers. Nothing is recorded or sent anywhere, except that Chrome's speech recognition uses Google's own free service.

## Run it
Camera and mic need HTTPS. Turn on GitHub Pages under Settings → Pages → Deploy from a branch → `main` / root, then open `https://up24tv1.github.io/leo-call-demo/`.

## Connecting a real phone line (not included)
A real "Leo" phone number needs paid telephony, for example:
1. **Twilio Voice:** buy a number (about $1–2 a month plus per-minute charges) and use the Twilio Voice JS SDK (WebRTC) in this page so the browser can place or receive calls. A small server (for example a Vercel function) has to issue Access Tokens and serve TwiML.
2. Pipe call audio to speech-to-text, the brain, and text-to-speech (Twilio `<Gather>`/`<Say>` or Media Streams), or hand off to a human.
3. Alternatives: Vonage, Telnyx, or SignalWire with similar WebRTC SDKs.

Demo by Austin AI Marketing, austinaimarketingco.com
