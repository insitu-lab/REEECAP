/* REEECAP Motion 04: shared 9:16 context artwork for live Story and export.
   Uses real licensed stock footage by default, with optional user media override.
   Stock footage is NOT attributed to the user's Instagram account.
   Mixkit media is fetched on-demand only when viewing a relevant Story.
   Comments are ONLY parsed actual records; no fabricated accounts/messages. */
(()=>{'use strict';
// Real clips, each with its publisher's free commercial-use stock license.
// See CLIPES_REAIS_E_LICENCAS.md. No copyrighted Instagram video is scraped.
const STOCK=[
 {src:'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',page:'https://mixkit.co/free-stock-video/girl-in-neon-sign-1232/'},
 {src:'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',page:'https://mixkit.co/free-stock-video/man-dancing-under-changing-lights-1240/'},
 {src:'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',page:'https://mixkit.co/free-stock-video/mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764/'},
 {src:'https://assets.mixkit.co/videos/preview/mixkit-influencers-dancing-in-a-recording-a-tik-tok-video-42315-large.mp4',page:'https://mixkit.co/free-stock-video/influencers-dancing-in-a-recording-a-tik-tok-video-42315/'}
];
const media={clips:[],urls:[],kind:'none',loading:null,lastError:''};
function notify(){document.dispatchEvent(new CustomEvent('reeecap:clips',{detail:{count:media.clips.length,ready:readyCount(),kind:media.kind,error:media.lastError}}));}
function clearClips(){for(const v of media.clips){try{v.pause();v.removeAttribute('src');v.load();}catch{}}for(const url of media.urls)URL.revokeObjectURL(url);media.clips=[];media.urls=[];}
function revoke(){clearClips();media.kind='none';media.loading=null;media.lastError='';notify();}
function playable(v){return v&&v.readyState>=2&&v.videoWidth>0&&!v.dataset.tainted;}
function readyCount(){return media.clips.filter(playable).length;}
function createVideo(url,remote){
 const v=document.createElement('video');v.crossOrigin='anonymous';v.muted=true;v.loop=true;v.playsInline=true;
 v.preload='metadata';v.src=url;v.disablePictureInPicture=true;v.setAttribute('aria-hidden','true');v.dataset.source=remote?'stock':'local';
 return v;
}
function testSafeCanvas(v){
 // Prevent a cross-origin clip from corrupting/tainting the export canvas.
 try{const c=document.createElement('canvas');c.width=2;c.height=2;const ctx=c.getContext('2d');ctx.drawImage(v,0,0,2,2);ctx.getImageData(0,0,1,1);return true;}catch{return false;}
}
function awaitClip(v,timeout=6500){
 return new Promise(resolve=>{
  let ended=false;
  const settle=ok=>{if(ended)return;ended=true;clearTimeout(timer);v.removeEventListener('loadeddata',onReady);v.removeEventListener('error',onFail);if(ok&&!testSafeCanvas(v)){v.dataset.tainted='1';ok=false;}resolve(ok);};
  const onReady=()=>settle(true),onFail=()=>settle(false);
  const timer=setTimeout(()=>settle(false),timeout);
  v.addEventListener('loadeddata',onReady,{once:true});v.addEventListener('error',onFail,{once:true});
  if(v.readyState>=2)onReady();else v.load();
 });
}
async function loadStock(){
 if(media.kind==='local'&&readyCount())return readyCount();
 if(media.loading)return media.loading;
 media.kind='stock';media.lastError='';clearClips();
 const videos=STOCK.map(x=>createVideo(x.src,true));media.clips=videos;
 media.loading=(async()=>{
  // Start only the first two clips. Avoid large downloads on mobile connections.
  const checks=await Promise.all(videos.map((v,i)=>i<2?awaitClip(v):Promise.resolve(false)));
  if(media.kind!=='stock')return readyCount();
  if(!checks.some(Boolean)){
   // Try two additional sources if the first two were removed or inaccessible.
   await Promise.all(videos.slice(2).map(v=>awaitClip(v)));
  }
  for(const v of videos){if(playable(v))v.play().catch(()=>{});}
  const count=readyCount();
  if(!count)media.lastError='Clipes externos indisponíveis. É necessário acesso à internet e autorização de vídeo/CORS do servidor.';
  notify();return count;
 })().finally(()=>{media.loading=null;});
 return media.loading;
}
async function load(files){
 const selected=[...files].filter(f=>f.type.startsWith('video/')||/\.(mp4|mov|webm|m4v)$/i.test(f.name)).slice(0,6);
 if(!selected.length)throw new Error('Escolha vídeos MP4, MOV ou WebM.');
 if(selected.some(f=>f.size>100e6)||selected.reduce((sum,f)=>sum+f.size,0)>200e6)throw new Error('Até 100 MB por vídeo e 200 MB no total.');
 media.kind='local';media.lastError='';clearClips();
 const loaded=[];
 for(const f of selected){const url=URL.createObjectURL(f),v=createVideo(url,false);media.urls.push(url);media.clips.push(v);if(await awaitClip(v,3000))loaded.push(v);}
 if(!loaded.length){media.lastError='O navegador não conseguiu decodificar os vídeos escolhidos.';notify();throw new Error(media.lastError);}
 loaded.forEach(v=>v.play().catch(()=>{}));notify();return loaded.length;
}
async function ensure(){
 if(media.kind==='local'&&readyCount())return readyCount();
 if(media.kind==='stock'&&readyCount())return readyCount();
 return loadStock();
}
function clipAt(i){const clips=media.clips.filter(playable);return clips.length?clips[i%clips.length]:null;}
function rrect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function safeLine(c,t,x,y,max){const s=String(t||'').replace(/\s+/g,' ').slice(0,66);if(!s)return;let v=s;while(v.length>2&&c.measureText(v).width>max)v=v.slice(0,-2);c.fillText(v!==s?v+'…':s,x,y);}
function film(c,t){
 if(!readyCount()){
  c.save();c.fillStyle='rgba(255,255,255,.75)';c.font='600 20px system-ui';
  c.fillText('Carregando vídeos reais…',340,430);c.restore();return;
 }
 const strips=[{x:-150,y:310,angle:.12},{x:-190,y:1035,angle:-.10}];
 strips.forEach((strip,row)=>{c.save();c.translate(strip.x,strip.y);c.rotate(strip.angle);const offset=-((t*22+row*160)%165);
  for(let i=0;i<7;i++){const x=i*165+offset;
   c.fillStyle='rgba(17,12,30,.52)';rrect(c,x-12,-18,159,230,9);c.fill();
   for(let j=0;j<7;j++){c.fillStyle='rgba(255,255,255,.40)';c.fillRect(x-5,j*30-9,6,10);c.fillRect(x+134,j*30-9,6,10);}
   c.save();rrect(c,x+7,1,115,192,6);c.clip();c.fillStyle='rgba(27,14,39,.75)';c.fillRect(x+7,1,115,192);
   const v=clipAt(i+row);if(v){const ratio=Math.max(115/v.videoWidth,192/v.videoHeight);const dw=v.videoWidth*ratio,dh=v.videoHeight*ratio;try{c.drawImage(v,x+7+(115-dw)/2,1+(192-dh)/2,dw,dh);}catch{}}
   else{c.fillStyle='rgba(255,255,255,.7)';c.font='700 12px system-ui';c.fillText('VIDEO',x+25,95); }
   c.restore();
  }c.restore();});
 // Content is meaningful only when user supplied clips; empty slots are visibly unfilled, not fake reels.
}
function paperPlane(c,x,y,r,scale=1){c.save();c.translate(x,y);c.rotate(r);c.scale(scale,scale);c.lineWidth=3;c.lineJoin='round';c.strokeStyle='rgba(255,255,255,.62)';c.beginPath();c.moveTo(-48,0);c.lineTo(58,-30);c.lineTo(8,37);c.lineTo(-6,11);c.closePath();c.moveTo(-6,11);c.lineTo(58,-30);c.stroke();c.restore();}
function planes(c,t){for(let i=0;i<6;i++){let x=-210+((t*17+i*207)%1160);let y=250+i*142+Math.sin(t*.45+i*1.5)*22;paperPlane(c,x,y,-.06+Math.sin(t*.28+i)*.11,.75+i%3*.22);}}
function storyRings(c,t){
 const x=560,y=720,r=185;
 c.save();c.translate(x,y);c.lineWidth=15;c.strokeStyle='rgba(255,255,255,.28)';c.beginPath();c.arc(0,0,r,0,2*Math.PI);c.stroke();
 c.lineWidth=6;c.strokeStyle='rgba(255,255,255,.42)';c.beginPath();c.arc(0,0,r-30,-Math.PI/2,-Math.PI/2+Math.PI*1.8*(.16+.12*Math.sin(t*.28)));c.stroke();
 c.fillStyle='rgba(255,255,255,.14)';rrect(c,-73,-99,146,199,19);c.fill();c.fillStyle='rgba(255,255,255,.28)';rrect(c,-45,-55,90,110,9);c.fill();c.restore();
}
function comments(c,s,t){
 const arr=Array.isArray(s.comments)?s.comments.filter(Boolean).slice(0,30):[];if(!arr.length)return;
 const visible=Math.min(arr.length,Math.max(1,Math.floor(Math.min(t,10)*2.5)+1)); // 20+ over 8-10sec, then pauses
 const shown=Math.min(8,visible),start=visible-shown;
 c.save();c.textBaseline='middle';c.textAlign='left';c.font='500 20px system-ui,sans-serif';
 for(let j=0;j<shown;j++){const i=start+j;const x=325+(i%2)*16,y=340+j*98+(Math.sin(t*.7+i)*2);
  c.fillStyle='rgba(22,16,32,.24)';rrect(c,x,y,380,76,24);c.fill();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1;c.stroke();
  c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.arc(x+29,y+28,15,0,2*Math.PI);c.fill();
  c.fillStyle='rgba(255,255,255,.34)';safeLine(c,arr[i],x+60,y+29,300);
 }
 c.restore();
}
function calendar(c,s,t){
 const total=Math.max(0,Number(s.activeDays)||0), p=Math.min(1,Math.max(0,t/9)), ease=p*p*p;
 const elapsed=Math.max(1,Math.round(ease*total)), x=404,y=330,w=240,h=260;
 c.save();
 for(let i=5;i>=1;i--){c.fillStyle='rgba(29,18,46,.18)';rrect(c,x+i*4,y+i*5,w,h,14);c.fill();}
 c.shadowColor='rgba(24,8,45,.30)';c.shadowBlur=22;
 c.fillStyle='rgba(255,255,255,.80)';rrect(c,x,y,w,h,15);c.fill();c.shadowBlur=0;
 c.fillStyle='#d43a95';rrect(c,x,y,w,53,15);c.fill();c.fillRect(x,y+31,w,22);
 c.fillStyle='#2a1736';c.textAlign='center';c.font='900 93px system-ui,sans-serif';c.fillText(String(elapsed),x+w/2,y+169);
 c.font='700 22px system-ui,sans-serif';c.fillText('DIAS',x+w/2,y+210);
 // Leaves fly upward, initially slowly and then faster; deterministic with timestamp.
 const leaves=Math.min(11,Math.floor((p*p)*17));
 for(let i=0;i<leaves;i++){const flight=((t*1.7+i*1.8)%6)/6;const yy=y-40-(flight*350);
  c.save();c.translate(x+120+(i%2?16:-16)+Math.sin(t+i)*16,yy);c.rotate(Math.sin(t+i)*.18);
  c.globalAlpha=Math.max(0,.38*(1-flight));c.fillStyle='#fff';rrect(c,-110,-75,220,150,12);c.fill();c.restore();}
 c.restore();
}
function draw(c,s,ms){if(!c||!s)return;const key0=s.metricKey||s.kind;
 if(['likes','reels','watched'].includes(key0)&&media.kind==='none'&&!media.loading){void ensure();}
 const t=Math.max(0,(Number(ms)||0)/1000),key=s.metricKey||s.kind;
 c.save();c.globalAlpha=key==='likes'?.50:key==='shares'?.52:key==='comments'?.85:1;
 if(key==='likes'||key==='reels'||key==='watched')film(c,t);
 else if(key==='shares')planes(c,t);
 else if(key==='comments')comments(c,s,t);
 else if(key==='stories'||key==='storyPosts')storyRings(c,t);
 else if(s.kind==='days')calendar(c,s,t);
 c.restore();}
let task=0,last=null;
function attach(canvas,slide,msGetter){
 if(task)cancelAnimationFrame(task);last=canvas;
 const ctx=canvas?.getContext('2d',{alpha:true});if(!ctx)return;
 const paint=()=>{if(!canvas.isConnected)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height){task=requestAnimationFrame(paint);return;}
  ctx.clearRect(0,0,720,1280);draw(ctx,slide,msGetter());task=requestAnimationFrame(paint);};
 task=requestAnimationFrame(paint);
}
window.REEECAP_MOTION={draw,attach,load,ensure,revoke,
 get clips(){return media.clips;},get count(){return readyCount();},
 get source(){return media.kind;},get error(){return media.lastError;},stock:STOCK.map(s=>s.page)};
})();
