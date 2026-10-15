// Leo's 3D studio (three.js from CDN). Falls back to the 2D canvas if WebGL or the load fails.
import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
const lite=/lite=1/.test(location.search)||(navigator.hardwareConcurrency||4)<=2;
try{ if(lite) throw 'lite';
const host=document.getElementById('studio');
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,1.75));R.setSize(innerWidth,innerHeight);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=0.8;R.shadowMap.enabled=true;host.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x05060c);S.fog=new THREE.FogExp2(0x070814,0.04);
const cam=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.1,100);cam.position.set(0,1.55,4.2);
// Lights: warm key, cool rim, colored LED fills
S.add(new THREE.HemisphereLight(0x8899ff,0x110814,0.35));
const key=new THREE.SpotLight(0xffe2c4,22,12,0.5,0.6);key.position.set(1.8,3.2,3);key.target.position.set(0,1.4,0);key.castShadow=true;S.add(key,key.target);
const rimL=new THREE.PointLight(0xff2bd6,6,6);rimL.position.set(-1.6,1.9,-0.8);const rimR=new THREE.PointLight(0x22d3ee,6,6);rimR.position.set(1.6,1.9,-0.8);S.add(rimL,rimR);
// Reflective floor
const floor=new Reflector(new THREE.PlaneGeometry(30,30),{textureWidth:innerWidth*0.5,textureHeight:innerHeight*0.5,color:0x22232b});floor.rotation.x=-Math.PI/2;S.add(floor);
const sheen=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0x0a0b12,roughness:0.35,metalness:0.6,transparent:true,opacity:0.72}));sheen.rotation.x=-Math.PI/2;sheen.position.y=0.002;sheen.receiveShadow=true;S.add(sheen);
// Back wall + LED strips
const wall=new THREE.Mesh(new THREE.PlaneGeometry(14,6),new THREE.MeshStandardMaterial({color:0x0d0f1a,roughness:0.9}));wall.position.set(0,3,-3);S.add(wall);
const strips=[];const neon=(c,w,h,x,y,z,ry=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.04),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.rotation.y=ry;S.add(m);strips.push(m);return m};
[-3.4,-1.7,1.7,3.4].forEach((x,i)=>neon(i%2?0x22d3ee:0xff2bd6,0.06,3.4,x,2.0,-2.95));
neon(0x7c5cff,8,0.05,0,0.25,-2.95);neon(0xffb020,8,0.05,0,3.9,-2.95);
neon(0xff2bd6,0.05,2.6,-3.2,1.4,0.5,0.5);neon(0x22d3ee,0.05,2.6,3.2,1.4,0.5,-0.5);
// "ON AIR" sign
const sc=document.createElement('canvas');sc.width=512;sc.height=128;const sx=sc.getContext('2d');sx.fillStyle='#ff304f';sx.font='bold 88px system-ui';sx.textAlign='center';sx.fillText('ON AIR',256,96);
const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true}));sign.position.set(2.2,3.2,-2.9);S.add(sign);
// Volumetric-style light cones (additive, soft)
const coneMat=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.03,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
[[-2.2,0xff2bd6],[0,0xfff1d6],[2.2,0x22d3ee]].forEach(([x,c])=>{const k=new THREE.Mesh(new THREE.ConeGeometry(1.1,4.5,32,1,true),coneMat(c));k.position.set(x,2.4,-1.6);S.add(k)});
// Desk
const desk=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.08,0.9),new THREE.MeshStandardMaterial({color:0x111318,roughness:0.2,metalness:0.8}));desk.position.set(0,0.95,0.55);desk.castShadow=desk.receiveShadow=true;S.add(desk);
neon(0x22d3ee,2.6,0.02,0,0.9,1.0);
const base=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.9,0.7),new THREE.MeshStandardMaterial({color:0x0b0c11,roughness:0.5,metalness:0.5}));base.position.set(0,0.45,0.5);S.add(base);
// Leo bust
const skin=new THREE.MeshStandardMaterial({color:0xc98c63,roughness:0.55});
const leo=new THREE.Group();S.add(leo);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.42,0.5,8,24),new THREE.MeshStandardMaterial({color:0x1d2433,roughness:0.6}));torso.scale.set(1.25,1,0.7);torso.position.y=1.15;torso.castShadow=true;leo.add(torso);
const collar=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.2,3),new THREE.MeshStandardMaterial({color:0xe5e7eb}));collar.rotation.x=Math.PI;collar.position.set(0,1.58,0.22);leo.add(collar);
const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.25,20),skin);neck.position.y=1.7;leo.add(neck);
const head=new THREE.Group();head.position.y=2.02;leo.add(head);
const skull=new THREE.Mesh(new THREE.SphereGeometry(0.3,48,48),skin);skull.scale.set(0.92,1.12,0.98);skull.castShadow=true;head.add(skull);
const hair=new THREE.Mesh(new THREE.SphereGeometry(0.31,48,24,0,Math.PI*2,0,Math.PI*0.5),new THREE.MeshStandardMaterial({color:0x22150d,roughness:0.8}));hair.scale.set(0.95,0.9,1.02);hair.position.y=0.06;hair.rotation.x=-0.25;head.add(hair);
[-1,1].forEach(s=>{const ear=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),skin);ear.scale.set(0.5,1,0.7);ear.position.set(0.27*s,0,0);head.add(ear)});
const eyes=[],lids=[];
[-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.SphereGeometry(0.045,24,24),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.2}));w.position.set(0.1*s,0.05,0.26);head.add(w);
 const p=new THREE.Mesh(new THREE.SphereGeometry(0.022,16,16),new THREE.MeshStandardMaterial({color:0x2a1a10,roughness:0.1}));p.position.set(0,0,0.033);w.add(p);eyes.push(p);
 const lid=new THREE.Mesh(new THREE.SphereGeometry(0.049,24,12,0,Math.PI*2,0,Math.PI/2),skin);lid.position.copy(w.position);lid.scale.y=0.05;head.add(lid);lids.push(lid);
 const brow=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.015,0.02),new THREE.MeshStandardMaterial({color:0x22150d}));brow.position.set(0.1*s,0.12,0.27);brow.rotation.z=-0.08*s;head.add(brow);lids.push(brow)});
const nose=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.09,16),skin);nose.position.set(0,-0.02,0.3);nose.rotation.x=Math.PI/2.4;head.add(nose);
const mouth=new THREE.Mesh(new THREE.SphereGeometry(0.06,24,16),new THREE.MeshStandardMaterial({color:0x4a1515,roughness:0.6}));mouth.position.set(0,-0.14,0.255);mouth.scale.set(1,0.12,0.4);head.add(mouth);
const teeth=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.015,0.01),new THREE.MeshStandardMaterial({color:0xffffff}));teeth.position.set(0,-0.125,0.28);head.add(teeth);
// Ambient particles (dust in the light)
const N=lite?0:600,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-0.5)*8;pos[i*3+1]=Math.random()*4;pos[i*3+2]=(Math.random()-0.5)*5-0.5}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffe6c8,size:0.018,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false}));S.add(dust);
// Post: bloom + shallow depth of field
const comp=new EffectComposer(R);comp.addPass(new RenderPass(S,cam));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.55,0.5,0.35));
const bokeh=new BokehPass(S,cam,{focus:2.9,aperture:0.0022,maxblur:0.008});comp.addPass(bokeh);comp.addPass(new OutputPass());
let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-0.5;my=e.clientY/innerHeight-0.5});
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);comp.setSize(innerWidth,innerHeight)});
const clock=new THREE.Clock();
function loop(){requestAnimationFrame(loop);if(!document.getElementById('call').classList.contains('on'))return;
 const t=clock.getElapsedTime(),st=window.leoState||{mouth:0,blink:0,speaking:false};
 cam.position.x=Math.sin(t*0.15)*0.25+mx*0.4;cam.position.y=2.0+Math.sin(t*0.11)*0.06-my*0.2;cam.position.z=2.9;cam.lookAt(0,1.78,0);       // drift + parallax
 const br=1+Math.sin(t*1.6)*0.012;torso.scale.y=br;head.position.y=2.02+Math.sin(t*1.6)*0.006;                          // breathing
 head.rotation.y=Math.sin(t*0.5)*0.08+(st.speaking?Math.sin(t*2.3)*0.04:0);head.rotation.x=Math.sin(t*0.7)*0.03+(st.speaking?Math.sin(t*3.1)*0.03:0);
 const m=st.mouth||0;mouth.scale.y=0.12+m*0.6;mouth.position.y=-0.14-m*0.02;teeth.visible=m>0.3;                       // lip sync
 const b=Math.min(1,(st.blink||0)*2);lids[0].scale.y=lids[2].scale.y=0.05+b*1.0;lids[1].position.y=lids[3].position.y=0.12-(b*0.01)+(st.speaking?m*0.012:0);
 eyes.forEach(e=>{e.position.x=Math.sin(t*0.43)*0.008});
 strips.forEach((s,i)=>s.material.color.offsetHSL(0,0,Math.sin(t*2+i)*0.002));rimL.intensity=5+Math.sin(t*1.3)*1.5;rimR.intensity=5+Math.cos(t*1.1)*1.5;
 dust.rotation.y=t*0.02;dust.position.y=Math.sin(t*0.2)*0.1;
 comp.render()}
loop();window.LEO3D_ON=true;document.body.classList.add('three');
}catch(e){console.warn('3D studio off, using 2D fallback:',e)}
