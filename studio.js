// Leo's broadcast news studio (three.js r160). Original design: deep navy, white, one gold accent.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const NAVY = 0x0a1630, GOLD = 0xe0a526;
const TOPICS = ['services', 'booking', 'reels', 'bots', 'examples', 'contact'];
const lite = /lite=1/.test(location.search) || (navigator.hardwareConcurrency || 4) <= 2;
let M = {};
function vid(name, loop = true) { const v = document.createElement('video'); v.src = M[name.replace('media/', '')]; v.muted = true; v.loop = loop; v.playsInline = true; v.crossOrigin = 'anonymous'; v.preload = 'auto'; return v; }
function vtex(v) { const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace; return t; }

try {
  if (lite) throw 'lite mode';
  M = await window.leoMedia;
  const host = document.getElementById('studio');
  const R = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
  R.setPixelRatio(Math.min(devicePixelRatio, 1.5)); R.setSize(innerWidth, innerHeight);
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.95;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; host.appendChild(R.domElement);
  const S = new THREE.Scene(); S.background = new THREE.Color(0x040812); S.fog = new THREE.Fog(0x040812, 9, 22);
  const pmrem = new THREE.PMREMGenerator(R); S.environment = pmrem.fromScene(new RoomEnvironment(R), 0.04).texture; S.environmentIntensity = 0.25;
  const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 60);

  // --- Lighting: key / fill / back ---
  S.add(new THREE.HemisphereLight(0xbfd2ff, 0x0a0c14, 0.12));
  const key = new THREE.SpotLight(0xfff1e0, 42, 14, 0.45, 0.85, 1.6); key.position.set(2.6, 4.2, 4.5); key.target.position.set(0, 1.3, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0004; S.add(key, key.target);
  const fill = new THREE.SpotLight(0xcfe0ff, 18, 14, 0.7, 1, 1.6); fill.position.set(-3.5, 2.8, 4); fill.target.position.set(0, 1.3, 0); S.add(fill, fill.target);
  const back = new THREE.SpotLight(0xdfe8ff, 35, 10, 0.5, 0.7, 1.6); back.position.set(0, 4.6, -2.2); back.target.position.set(0, 1.6, 0.2); S.add(back, back.target);

  // --- Floor: reflective glossy navy ---
  const mirror = new Reflector(new THREE.CircleGeometry(14, 64), {textureWidth: 1024, textureHeight: 1024, color: 0x2a303c}); mirror.rotation.x = -Math.PI / 2; S.add(mirror);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshPhysicalMaterial({color: 0x050a16, roughness: 0.45, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.08, transparent: true, opacity: 0.9}));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.003; floor.receiveShadow = true; S.add(floor);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.15, 3.19, 128), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.18})); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.006; S.add(ring);

  // --- Curved LED video wall (showcase panel) with crossfading video textures ---
  const slides = Object.fromEntries(TOPICS.map((t) => [t, vid(`media/slide-${t}.mp4`)]));
  const wallMat = new THREE.ShaderMaterial({
    uniforms: {a: {value: vtex(slides.services)}, b: {value: vtex(slides.services)}, mixv: {value: 0}, gain: {value: 0.95}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D a,b; uniform float mixv,gain; varying vec2 vUv;
      void main(){ vec2 uv=vec2(1.0-vUv.x,vUv.y); vec3 c=mix(texture2D(a,uv).rgb,texture2D(b,uv).rgb,smoothstep(0.,1.,mixv));
      c=pow(c,vec3(1.3)); gl_FragColor=vec4(c*gain,1.0);
#include <colorspace_fragment>
}`,
    side: THREE.BackSide, toneMapped: false});
  const arc = 1.25, rad = 7.0; // radians and radius
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, rad * arc / 3, 96, 1, true, Math.PI - arc / 2, arc), wallMat);
  wall.position.set(0, 2.15, 3.4); S.add(wall);
  const bezelMat = new THREE.MeshPhysicalMaterial({color: 0x1a2236, metalness: 0.9, roughness: 0.35});
  for (const y of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(rad - 0.02, rad - 0.02, 0.06, 96, 1, true, Math.PI - arc / 2, arc), bezelMat); b.material.side = THREE.DoubleSide; b.position.set(0, 2.3 + y * (rad * arc / 6 + 0.03), 3.4); S.add(b); }
  // Back architecture: dark paneled set walls with thin white light lines
  const setMat = new THREE.MeshPhysicalMaterial({color: 0x0c1730, roughness: 0.6, metalness: 0.2});
  const backWall = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 6, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), setMat); backWall.material.side = THREE.BackSide; backWall.position.set(0, 3, 3.4); S.add(backWall);
  for (const x of [-4.6, 4.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 4.2, 0.03), new THREE.MeshBasicMaterial({color: 0xdfe8ff})); l.position.set(x, 2.1, -3.4); S.add(l); }

  // --- Side monitors ---
  const monVids = [vid('media/slide-contact.mp4'), vid('media/slide-reels.mp4')];
  monVids.forEach((v, i) => {
    const s = i ? 1 : -1; const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.72, 0.06), bezelMat); g.add(frame);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 0.62), new THREE.MeshBasicMaterial({map: vtex(v), toneMapped: false})); scr.position.z = 0.032; g.add(scr);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 16), bezelMat); pole.position.y = -1.15; g.add(pole);
    g.position.set(3.3 * s, 1.95, -0.6); g.rotation.y = -0.55 * s; S.add(g);
  });

  // --- Anchor desk ---
  const band = (r0, r1, a0, a1) => { const sh = new THREE.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true); return sh; };
  const C = -2.7, A0 = Math.PI / 2 - 0.52, A1 = Math.PI / 2 + 0.52; // desk arc centre (z) and angles; arc faces the camera
  const topGeo = new THREE.ExtrudeGeometry(band(2.75, 3.5, A0, A1), {depth: 0.06, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3, curveSegments: 64});
  const deskTop = new THREE.Mesh(topGeo, new THREE.MeshPhysicalMaterial({color: 0x8e96a6, roughness: 0.35, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.1}));
  deskTop.rotation.x = Math.PI / 2; deskTop.position.set(0, 1.0, C); deskTop.castShadow = deskTop.receiveShadow = true;
  const front = new THREE.Mesh(new THREE.CylinderGeometry(3.42, 3.42, 0.94, 96, 1, true, -0.5, 1.0), new THREE.MeshPhysicalMaterial({color: NAVY, roughness: 0.3, metalness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.2}));
  front.position.set(0, 0.5, C); front.castShadow = true;
  const strip = new THREE.Mesh(new THREE.CylinderGeometry(3.43, 3.43, 0.02, 96, 1, true, -0.5, 1.0), new THREE.MeshBasicMaterial({color: GOLD}));
  strip.position.set(0, 0.84, C);
  const desk = new THREE.Group(); desk.add(deskTop, front, strip); S.add(desk);
  // Desk-front logo plate (canvas texture, clean type)
  const lc = document.createElement('canvas'); lc.width = 1024; lc.height = 128; const lx = lc.getContext('2d');
  lx.fillStyle = '#f5f7fb'; lx.font = '600 54px Inter, system-ui, sans-serif'; lx.textAlign = 'center'; lx.textBaseline = 'middle'; lx.fillText('AUSTIN AI MARKETING', 512, 66);
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.16), new THREE.MeshBasicMaterial({map: lt, transparent: true, toneMapped: false})); plate.position.set(0, 0.6, C + 3.435); S.add(plate);

  // --- Leo: photoreal video loops (idle <-> talking crossfade) on a feathered plane behind the desk ---
  const idleV = vid('media/leo-idle.mp4'), talkV = vid('media/leo-talk.mp4');
  const leoMat = new THREE.ShaderMaterial({
    uniforms: {idle: {value: vtex(idleV)}, talk: {value: vtex(talkV)}, k: {value: 0}, amp: {value: 0}, mouth: {value: new THREE.Vector2(0.52, 0.665)}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    // Videos are side-by-side: colour on the left half, alpha matte (rembg) on the right half.
    fragmentShader: `uniform sampler2D idle,talk; uniform float k,amp; uniform vec2 mouth; varying vec2 vUv;
      void main(){ vec2 cu=vec2(vUv.x*0.5,vUv.y), au=vec2(0.5+vUv.x*0.5,vUv.y);
      vec3 c=mix(texture2D(idle,cu).rgb,texture2D(talk,cu).rgb,k);
      float a=mix(texture2D(idle,au).r,texture2D(talk,au).r,k);
      float m=1.0-smoothstep(0.0,0.045,length((vUv-mouth)*vec2(1.33,1.0))); c*=1.0+m*amp*0.05;
      c=pow(c,vec3(1.04))*0.96;
      gl_FragColor=vec4(c,smoothstep(0.1,0.9,a));
#include <colorspace_fragment>
}`,
    transparent: true, depthWrite: false, toneMapped: false});
  const leoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 1.02), leoMat); leoPlane.position.set(0, 1.47, 0.12); leoPlane.renderOrder = 1; S.add(leoPlane);
  let videoLeo = true;
  const useBust = () => { if (!videoLeo) return; videoLeo = false; leoPlane.visible = false; buildBust(); };
  idleV.addEventListener('error', useBust); talkV.addEventListener('error', useBust);
  setTimeout(() => { if (idleV.readyState < 2) useBust(); }, 9000);

  // --- Fallback 3D bust (only if the video loops can't load) ---
  let bust = null;
  function buildBust() {
    const skin = new THREE.MeshPhysicalMaterial({color: 0xc98c63, roughness: 0.5, sheen: 0.3});
    const g = new THREE.Group(); g.position.set(0, 0, -0.1);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.5, 8, 24), new THREE.MeshPhysicalMaterial({color: 0x15203a, roughness: 0.55})); torso.scale.set(1.25, 1, 0.7); torso.position.y = 1.2; torso.castShadow = true; g.add(torso);
    const head = new THREE.Group(); head.position.y = 2.05; g.add(head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 48, 48), skin); skull.scale.set(0.92, 1.12, 0.98); skull.castShadow = true; head.add(skull);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.31, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshPhysicalMaterial({color: 0x1d130c, roughness: 0.7})); hair.position.y = 0.06; hair.rotation.x = -0.25; head.add(hair);
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), new THREE.MeshStandardMaterial({color: 0x4a1515})); mouth.position.set(0, -0.14, 0.255); mouth.scale.set(1, 0.12, 0.4); head.add(mouth);
    const lids = [];
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 24), new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.15})); w.position.set(0.1 * s, 0.05, 0.26); head.add(w);
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), new THREE.MeshStandardMaterial({color: 0x24160d})); p.position.z = 0.033; w.add(p);
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.049, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), skin); lid.position.copy(w.position); lid.scale.y = 0.05; head.add(lid); lids.push(lid); }
    S.add(g); bust = {g, head, mouth, lids, torso};
  }

  // --- Post: subtle bloom, then vignette + film grain ---
  const comp = new EffectComposer(R); comp.addPass(new RenderPass(S, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.22, 0.5, 0.88));
  comp.addPass(new OutputPass());
  const grade = new ShaderPass({uniforms: {tDiffuse: {value: null}, t: {value: 0}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float t; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 c=texture2D(tDiffuse,vUv); float v=smoothstep(0.95,0.35,length(vUv-0.5)); c.rgb*=mix(0.72,1.0,v);
      c.rgb+=(h(vUv*vec2(1920.,1080.)+t)-0.5)*0.035; gl_FragColor=c; }`});
  comp.addPass(grade);

  // --- Camera: eased shot changes per topic + slow push-in ---
  const SHOTS = {
    wide: {p: [0, 1.85, 7.2], l: [0, 1.75, 0], fov: 34},
    medium: {p: [0, 1.55, 3.9], l: [0, 1.6, 0], fov: 32},
    close: {p: [0.1, 1.55, 2.75], l: [0, 1.58, 0.1], fov: 28},
    left: {p: [-1.9, 1.6, 3.9], l: [0.2, 1.62, 0], fov: 32},
    right: {p: [1.9, 1.6, 3.9], l: [-0.2, 1.62, 0], fov: 32},
  };
  const TOPIC_SHOT = {services: 'medium', booking: 'right', reels: 'left', bots: 'close', examples: 'wide', contact: 'medium'};
  let shot = SHOTS.medium, from = SHOTS.wide, shotT0 = 0, moveDur = 1.8, camTime = 0;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  let curP = SHOTS.wide.p.slice(), curL = SHOTS.wide.l.slice(), curF = 34;
  function setShot(name) { const n = SHOTS[name]; if (n === shot) return; from = {p: curP.slice(), l: curL.slice(), fov: curF}; shot = n; shotT0 = camTime; }

  // --- Topic -> wall content crossfade ---
  let topic = 'services', fade = 1, fadeT0 = 0;
  function setTopic(t) {
    if (!TOPICS.includes(t) || t === topic) return; topic = t;
    const v = slides[t]; v.currentTime = 0; v.play().catch(() => {});
    wallMat.uniforms.a.value = wallMat.uniforms.b.value; wallMat.uniforms.b.value = vtex(v); fade = 0; fadeT0 = performance.now(); wallMat.uniforms.mixv.value = 0;
    setShot(TOPIC_SHOT[t]);
  }
  window.leoStudio = {setTopic, setShot, get topic() { return topic; }, get videoLeo() { return videoLeo; }};

  let started = false;
  function startMedia() { if (started) return; started = true; [idleV, talkV, ...Object.values(slides), ...monVids].forEach((v) => v.play().catch(() => {}));  }

  addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); comp.setSize(innerWidth, innerHeight); });
  const clock = new THREE.Clock(); let talkK = 0, camTime0 = null;
  R.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!document.getElementById('call').classList.contains('on')) { started = false; camTime0 = null; return; }
    startMedia(); camTime += Math.min(clock.elapsedTime - (camTime0 ?? clock.elapsedTime), 0.25); camTime0 = clock.elapsedTime;
    const st = window.leoState || {mouth: 0, blink: 0, speaking: false};
    // camera ease + push-in
    const k = ease(Math.min(1, (camTime - shotT0) / moveDur)); const push = Math.min(1, (camTime - shotT0) / 14);
    curP = lerp3(from.p, shot.p, k); curL = lerp3(from.l, shot.l, k); curF = from.fov + (shot.fov - from.fov) * k;
    const dir = new THREE.Vector3(...curL).sub(new THREE.Vector3(...curP)).normalize();
    cam.position.set(...curP).addScaledVector(dir, ease(push) * 0.35); cam.position.y += Math.sin(camTime * 0.4) * 0.008;
    cam.fov = curF; cam.updateProjectionMatrix(); cam.lookAt(...curL);
    // wall crossfade
    if (fade < 1) { fade = Math.min(1, (performance.now() - fadeT0) / 900); wallMat.uniforms.mixv.value = fade; }
    // Leo: crossfade idle <-> talking, subtle amplitude pulse
    talkK += ((st.speaking ? 1 : 0) - talkK) * Math.min(1, dt * 6); leoMat.uniforms.k.value = talkK; leoMat.uniforms.amp.value = st.mouth || 0;
    if (bust) { bust.mouth.scale.y = 0.12 + (st.mouth || 0) * 0.6; const b = Math.min(1, (st.blink || 0) * 2); bust.lids.forEach((l) => (l.scale.y = 0.05 + b)); bust.head.rotation.y = Math.sin(camTime * 0.5) * 0.06; bust.torso.scale.y = 1 + Math.sin(camTime * 1.6) * 0.01; }
    grade.uniforms.t.value = camTime * 60 % 1000;
    comp.render();
  });
  window.LEO3D_ON = true; document.body.classList.add('three');
} catch (e) { console.warn('3D studio off, using lite mode:', e); document.body.classList.add('lite'); }
