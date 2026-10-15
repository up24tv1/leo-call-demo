// Leo's rule-based brain. Runs entirely in the browser (and in node for tests).
const INTENTS=[
 {k:['hello','hi ','hey','good morning','good afternoon','good evening','bonjour'],r:()=>"Hey! I'm Leo, the demo assistant for Austin AI Marketing. What are you working on?"},
 {k:['how are you',"how's it going",'how you doing'],r:()=>"Doing great, thanks for asking! How can I help your business today?"},
 {k:['your name','who are you','what are you'],r:()=>"I'm Leo, a demo virtual assistant for Austin AI Marketing. I run right here in your browser."},
 {k:['price','cost','how much','pricing','rate','charge'],r:()=>"Booking and landing pages start at four hundred ninety-seven dollars. Reels, content packages and AI reply bots are quoted to fit what you need. Want me to walk you through one?"},
 {k:['landing page','booking page','website','web site','site'],r:()=>"We build booking and landing pages from four hundred ninety-seven dollars. They're fast, mobile-first, and designed to turn visitors into calls or bookings."},
 {k:['reel','video','content','tiktok','instagram','short'],r:()=>"We make short-form reels and monthly content packages: scroll-stopping edits, captions, and posting-ready formats."},
 {k:['bot','chatbot','reply','respond','customer service','support','inbox'],r:()=>"Our AI reply bots answer customer messages and booking requests in minutes, so nobody gets left on read."},
 {k:['service','what do you do','offer','help with'],r:()=>"Austin AI Marketing does three things: booking and landing pages from four ninety-seven, reels and content packages, and AI reply bots."},
 {k:['contact','reach','email','phone','call you','talk to someone','human','mathieu'],r:()=>"The best way to reach the team is through austinaimarketingco.com. A real person will follow up."},
 {k:['website address','url','where can i','link'],r:()=>"You'll find everything at austinaimarketingco.com."},
 {k:['what time','the time','time is it'],r:(d)=>"It's "+d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+" where you are."},
 {k:['date','what day','today'],r:(d)=>"Today is "+d.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric',year:'numeric'})+"."},
 {k:['joke','funny'],r:()=>"Why did the marketer bring a ladder? To reach a higher conversion rate."},
 {k:['thank','thanks','appreciate'],r:()=>"Anytime! Anything else I can help with?"},
 {k:['bye','goodbye','see you','hang up','end call'],r:()=>"Great talking with you. Have a good one!",end:true},
 {k:['real','human','ai','robot'],r:()=>"I'm a demo assistant running in your browser, not a person. For the real team, visit austinaimarketingco.com."}];
function reply(text,date=new Date()){const s=' '+String(text).toLowerCase().replace(/[^a-z0-9' ]/g,' ')+' ';
 for(const it of INTENTS)if(it.k.some(k=>s.includes(k.trim().length<3?' '+k.trim()+' ':k)))return{text:it.r(date),end:!!it.end};
 return{text:"Good question. I'm a simple demo, so I'm best on Austin AI Marketing's services, pricing, and getting in touch. Want to hear about booking pages, reels, or reply bots?",end:false}}
if(typeof module!=='undefined')module.exports={reply};
