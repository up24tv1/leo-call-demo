const $=id=>document.getElementById(id);
let stream=null,rec=null,muted=false,inCall=false,t0=0,timerI=null,speaking=false,mouthTarget=0,mouth=0,blink=0,nextBlink=0,llm=null,listening=false;
function show(id){['start','ring','ended'].forEach(s=>$(s).classList.toggle('on',s===id));$('call').classList.toggle('on',id==='call')}
function cap(who,text){const d=document.createElement('div');d.className='cap '+who;d.textContent=(who==='you'?'You: ':'Leo: ')+text;$('caps').appendChild(d);while($("caps").children.length>2)$('caps').firstChild.remove()}
// ---- Avatar (canvas) ----
const cv=$('leo'),ctx=cv.getContext('2d');
function draw(ts){requestAnimationFrame(draw);if(!inCall)return;
 if(window.LEO3D_ON){if(ts>nextBlink){blink=1;nextBlink=ts+2500+Math.random()*3000}blink=Math.max(0,blink-0.12);
  mouthTarget=speaking?Math.min(1,0.25+0.75*Math.abs(Math.sin(ts/85))*Math.random()*0.5+mouthTarget*0.5):0;mouth+=(mouthTarget-mouth)*0.35;
  window.leoState={mouth,blink,speaking};return}
 const W=cv.width=innerWidth*devicePixelRatio,H=cv.height=innerHeight*devicePixelRatio,s=Math.min(W,H)/700,cx=W/2,cy=H*0.46+Math.sin(ts/900)*4*s;
 const g=ctx.createRadialGradient(cx,cy,50,cx,cy,Math.max(W,H));g.addColorStop(0,'#2b4a73');g.addColorStop(1,'#070b14');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const br=1+Math.sin(ts/900)*0.012;ctx.save();ctx.translate(cx,cy);ctx.scale(s*br,s*br);
 ctx.fillStyle='#1f2937';ctx.beginPath();ctx.ellipse(0,330,230,140,0,Math.PI,0);ctx.fill();          // shoulders
 ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.moveTo(-50,200);ctx.lineTo(0,260);ctx.lineTo(50,200);ctx.fill(); // collar
 ctx.fillStyle='#c68a5e';ctx.fillRect(-38,140,76,80);                                              // neck
 ctx.fillStyle='#d9a074';ctx.beginPath();ctx.ellipse(0,0,135,170,0,0,7);ctx.fill();               // face
 ctx.fillStyle='#2a1a10';ctx.beginPath();ctx.ellipse(0,-110,145,85,0,Math.PI,0);ctx.fill();ctx.fillRect(-145,-115,22,90);ctx.fillRect(123,-115,22,90); // hair
 if(ts>nextBlink){blink=1;nextBlink=ts+2500+Math.random()*3000}blink=Math.max(0,blink-0.12);
 const eh=12*(1-Math.min(1,blink*2)*(blink>0?1:0))+1,lookX=Math.sin(ts/2300)*4;
 for(const x of[-50,50]){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x,-20,22,eh,0,0,7);ctx.fill();ctx.fillStyle='#3b2416';ctx.beginPath();ctx.ellipse(x+lookX,-20,9,Math.min(9,eh),0,0,7);ctx.fill();
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-26,-52-(speaking?mouth*6:0));ctx.lineTo(x+26,-56-(speaking?mouth*6:0));ctx.stroke()}
 ctx.strokeStyle='#b07a52';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(-10,40);ctx.lineTo(8,42);ctx.stroke();  // nose
 mouthTarget=speaking?(0.25+0.75*Math.abs(Math.sin(ts/85))*Math.random()*0.5+mouthTarget*0.5):0;mouth+=(Math.min(1,mouthTarget)-mouth)*0.35;
 ctx.fillStyle='#5b1e1e';ctx.beginPath();ctx.ellipse(0,90,42,4+mouth*26,0,0,7);ctx.fill();
 if(mouth>0.3){ctx.fillStyle='#fff';ctx.fillRect(-28,80-mouth*12,56,8)}
 ctx.restore()}
requestAnimationFrame(draw);
// ---- Speech out ----
let voice=null;function pickVoice(){const v=speechSynthesis.getVoices();voice=v.find(x=>/en-US/.test(x.lang)&&/male|David|Guy|Daniel|Google US/i.test(x.name))||v.find(x=>/^en/.test(x.lang))||null}
if('speechSynthesis'in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(text,cb){cap('leo',text);if(!('speechSynthesis'in window)){speaking=true;setTimeout(()=>{speaking=false;cb&&cb()},text.length*60);return}
 stopListen();const u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;u.rate=1.02;
 u.onstart=()=>speaking=true;u.onboundary=()=>{mouthTarget=1};u.onend=u.onerror=()=>{speaking=false;cb&&cb();startListen()};speechSynthesis.speak(u)}
// ---- Speech in ----
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function startListen(){if(!SR||muted||!inCall||listening||speaking)return;rec=new SR();rec.lang='en-US';rec.interimResults=false;rec.continuous=false;
 rec.onresult=e=>handle(e.results[0][0].transcript);rec.onend=()=>{listening=false;setTimeout(startListen,300)};rec.onerror=e=>{$('status').textContent=e.error==='not-allowed'?'Mic blocked: type below instead.':'';};
 try{rec.start();listening=true;$('status').textContent='🎧 Listening…'}catch(e){}}
function stopListen(){if(rec){rec.onend=null;try{rec.abort()}catch(e){}}listening=false;$('status').textContent=''}
if(!SR)setTimeout(()=>$('status').textContent='Voice input not supported in this browser. Type below.',0);
// ---- Brain ----
async function think(text){if(llm){try{const r=await llm.chat.completions.create({messages:[{role:'system',content:"You are Leo, a friendly demo assistant for Austin AI Marketing (austinaimarketingco.com). Services: booking and landing pages from $497, reels and content packages, AI reply bots. Answer in 1-2 short spoken sentences. Never invent prices, clients or stats."},{role:'user',content:text}],max_tokens:80});return{text:r.choices[0].message.content,end:/\b(bye|goodbye)\b/i.test(text)}}catch(e){}}
 return reply(text)}
async function handle(text){text=text.trim();if(!text||!inCall)return;cap('you',text);stopListen();const r=await think(text);say(r.text,()=>{if(r.end)setTimeout(end,600)})}
$('typeRow').onsubmit=e=>{e.preventDefault();handle($('typed').value);$('typed').value=''};
$('llmToggle').onchange=async e=>{if(!e.target.checked){llm=null;return}
 if(!navigator.gpu){$('status').textContent='WebGPU not available. Staying on built-in replies.';e.target.checked=false;return}
 $('status').textContent='Loading WebLLM model…';try{const w=await import('https://esm.run/@mlc-ai/web-llm');
 llm=await w.CreateMLCEngine('Qwen2.5-0.5B-Instruct-q4f16_1-MLC',{initProgressCallback:p=>$('status').textContent='Model: '+Math.round((p.progress||0)*100)+'%'});$('status').textContent='Smarter replies on'}
 catch(err){$('status').textContent='Could not load WebLLM. Using built-in replies.';e.target.checked=false;llm=null}};
// ---- Call flow ----
let ringT;
async function call(){show('ring');$('ringTxt').textContent='Calling…';
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:true});$('me').srcObject=stream}catch(e){$('ringTxt').textContent='No camera or mic access. Continuing with text.'}
 ringT=setTimeout(()=>{$('ringTxt').textContent='Connecting…';ringT=setTimeout(connect,900)},1800)}
function connect(){show('call');inCall=true;muted=false;t0=Date.now();$('caps').innerHTML='';timerI=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);$('timer').textContent=String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},500);
 say("Hey, it's Leo from Austin AI Marketing. Just so you know, I'm a demo assistant running in your browser. What can I help you with?")}
function end(){const d=$('timer').textContent;inCall=false;clearTimeout(ringT);clearInterval(timerI);stopListen();if('speechSynthesis'in window)speechSynthesis.cancel();speaking=false;
 if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;$('endTxt').textContent='Duration '+d;$('timer').textContent='00:00';show('ended')}
$('callBtn').onclick=call;$('againBtn').onclick=call;$('cancelBtn').onclick=end;$('endBtn').onclick=end;
$('muteBtn').onclick=()=>{muted=!muted;$('muteBtn').classList.toggle('off',muted);$('muteBtn').textContent=muted?'🔇':'🎙️';if(stream)stream.getAudioTracks().forEach(t=>t.enabled=!muted);muted?stopListen():startListen()};
$('camBtn').onclick=()=>{if(!stream)return;const v=stream.getVideoTracks()[0];if(!v)return;v.enabled=!v.enabled;$('camBtn').classList.toggle('off',!v.enabled);$('me').style.opacity=v.enabled?1:.25};
