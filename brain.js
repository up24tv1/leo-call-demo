// Leo's rule-based brain: intents -> varied replies (never the same one twice in a row) + showcase topic.
const INTENTS=[
 {id:'hello',topic:'services',k:['hello','hi','hey','good morning','good afternoon','good evening','bonjour','yo'],r:[
  "Hey there! I'm Leo with Austin AI Marketing. What are you working on?",
  "Hi! Great to see you. I'm Leo, the virtual assistant for Austin AI Marketing. How can I help?",
  "Hello and welcome! I'm Leo. Tell me about your business and I'll point you to the right thing."]},
 {id:'howareyou',topic:'services',k:['how are you',"how's it going",'how you doing','how is it going'],r:[
  "I'm doing great, thanks for asking! How's business on your end?",
  "Fantastic. The studio lights are on and I'm ready. What can I do for you?",
  "Couldn't be better. What brings you in today?"]},
 {id:'who',topic:'contact',k:['your name','who are you','what are you','are you real','are you human','are you a robot','are you ai'],r:[
  "I'm Leo, a demo virtual assistant for Austin AI Marketing. I run right here in your browser.",
  "I'm a virtual assistant, not a person. I'm Leo, built to show what Austin AI Marketing can do.",
  "Leo's the name. I'm a browser-based demo assistant. For the real team, visit austinaimarketingco.com."]},
 {id:'price',topic:'booking',k:['price','cost','how much','pricing','rate','charge','budget','afford'],r:[
  "Booking and landing pages start at four hundred ninety-seven dollars. Reels, content packages and reply bots are quoted to fit your needs.",
  "Pages start at four ninety-seven. For reels and AI reply bots we put together a quote based on what you need.",
  "The entry point is a four-hundred-ninety-seven-dollar booking or landing page. Want to hear what's included?"]},
 {id:'pages',topic:'booking',k:['landing page','booking page','website','web site','site','page'],r:[
  "Our booking and landing pages start at four ninety-seven. They're fast, mobile-first, and built to turn visitors into bookings.",
  "A booking page from us gives customers one clear way to book or call you, live on mobile. Pricing starts at four ninety-seven.",
  "We design landing pages that load fast and push visitors to act: call, book, or request a quote."]},
 {id:'reels',topic:'reels',k:['reel','video','content','tiktok','instagram','short','social media','posts'],r:[
  "We make short-form reels and monthly content packages: scroll-stopping edits, captions, ready to post.",
  "Reels are our bread and butter. Punchy edits, captions in English or French, sized for every platform.",
  "Need content every week? Our content packages keep your feed busy without eating your time."]},
 {id:'bots',topic:'bots',k:['bot','chatbot','reply','respond','customer service','support','inbox','messages','dm'],r:[
  "Our AI reply bots answer customer messages and booking requests in minutes, so nobody gets left on read.",
  "A reply bot covers your inbox around the clock: answering common questions, capturing leads, and flagging the urgent stuff.",
  "Slow replies lose customers. Our AI reply bots answer fast and hand the tricky ones to you."]},
 {id:'examples',topic:'examples',k:['example','portfolio','work','demo','show me','samples','case'],r:[
  "Here's a peek at the kind of things we build: booking pages, reels, reply bots, and demos like this call.",
  "You're looking at one of our demos right now! The panel behind me shows a few more.",
  "Check the wall behind me. Those are the kinds of projects we build for businesses."]},
 {id:'services',topic:'services',k:['service','what do you do','offer','help with','what can you'],r:[
  "Austin AI Marketing does three things: booking and landing pages, reels and content packages, and AI reply bots.",
  "We help businesses get found and booked: pages from four ninety-seven, short-form content, and AI reply bots.",
  "Three services: a page that converts, content that gets seen, and a bot that answers for you."]},
 {id:'contact',topic:'contact',k:['contact','reach','email','phone','call you','talk to someone','mathieu','get started','sign up','hire'],r:[
  "The best way to get started is austinaimarketingco.com. A real person will follow up.",
  "Head to austinaimarketingco.com and send a message. The team will get back to you.",
  "You can reach the team at austinaimarketingco.com. It's on the screen behind me."]},
 {id:'time',topic:null,k:['what time','the time','time is it'],r:[d=>"It's "+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+" where you are.",d=>"Right now it's "+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+"."]},
 {id:'date',topic:null,k:['date','what day','today'],r:[d=>"Today is "+d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'})+".",d=>"It's "+d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})+"."]},
 {id:'joke',topic:null,k:['joke','funny','make me laugh'],r:["Why did the marketer bring a ladder? To reach a higher conversion rate.","I'd tell you a joke about landing pages, but it wouldn't convert.","My favorite exercise? Scrolling. Just kidding, I make the reels you scroll."]},
 {id:'thanks',topic:null,k:['thank','thanks','appreciate'],r:["Anytime! Anything else?","My pleasure. What else can I help with?","You got it. Anything else on your mind?"]},
 {id:'bye',topic:'contact',end:true,k:['bye','goodbye','see you','hang up','end call','that is all',"that's all"],r:["Great talking with you. Have a good one!","Thanks for stopping by the studio. Take care!","Talk soon, and remember: austinaimarketingco.com."]}];
const FALLBACK=["Good question. I'm a simple demo, so I'm best on our services, pricing, and getting in touch. Want to hear about pages, reels, or reply bots?",
 "I didn't quite catch that. Try asking about booking pages, reels, or AI reply bots.",
 "Hmm, that's outside my demo script. Ask me about pricing, examples, or how to reach the team."];
const last={};
function pick(id,arr,date){let i,n=arr.length;do{i=Math.floor(Math.random()*n)}while(n>1&&i===last[id]);last[id]=i;const v=arr[i];return typeof v==='function'?v(date):v}
function match(s,k){k=k.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('\\b'+k+"(s|es|ing|d)?\\b").test(s)}
function reply(text,date=new Date()){const s=String(text).toLowerCase().replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
 for(const it of INTENTS)if(it.k.some(k=>match(s,k)))return{text:pick(it.id,it.r,date),end:!!it.end,topic:it.topic,intent:it.id};
 return{text:pick('fallback',FALLBACK,date),end:false,topic:null,intent:'fallback'}}
if(typeof module!=='undefined')module.exports={reply};
