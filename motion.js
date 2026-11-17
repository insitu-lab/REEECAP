/* REEECAP Motion 04: shared 9:16 context artwork for live Story and export.
   Uses real licensed stock footage by default, with optional user media override.
   Stock footage is NOT attributed to the user's Instagram account.
   Bundled real videos are loaded on demand from this site, without third-party requests.
   Comments are ONLY parsed actual records; no fabricated accounts/messages. */
(()=>{'use strict';
// Real clips, each with its publisher's free commercial-use stock license.
// See CLIPES_REAIS_E_LICENCAS.md. No copyrighted Instagram video is scraped.
const STOCK=Array.from({length:12},(_,i)=>({src:`./assets/videos/reel_${String(i+1).padStart(2,'0')}.mp4`,poster:`./assets/videos/posters/reel_${String(i+1).padStart(2,'0')}.webp`,page:'./videos-e-creditos.html'}));
// First four are deliberately varied: sunset, eclipse, aerial woods and rainy city.
const FEATURED=[1,3,11,8,0,5,6,10,2,4,7,9];
let playlistOffset=4;
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
 if(media.kind==='embedded'&&readyCount())return readyCount();
 if(media.loading)return media.loading;
 media.kind='embedded';media.lastError='';clearClips();playlistOffset=4;
 // Four decoding streams maximum, suitable for low-memory mobile devices.
 const videos=FEATURED.slice(0,4).map((id)=>{
  const v=createVideo(STOCK[id].src,false);
  v.dataset.clipIndex=String(id);v.loop=false;v.preload='auto';
  v.addEventListener('ended',()=>{
   if(media.kind!=='embedded'||!media.clips.includes(v))return;
   const next=FEATURED[playlistOffset++%FEATURED.length];
   v.dataset.clipIndex=String(next);v.src=STOCK[next].src;
   v.load();v.play().catch(()=>{});
  });
  return v;
 });
 media.clips=videos;
 media.loading=(async()=>{
  const checks=await Promise.all(videos.map(v=>awaitClip(v,7200)));
  if(media.kind!=='embedded')return readyCount();
  if(!checks.some(Boolean)){
   media.lastError='Vídeos locais indisponíveis. Confirme que a pasta assets/videos está incluída na publicação.';
   notify();return 0;
  }
  for(const v of videos){if(playable(v))v.play().catch(()=>{});}
  notify();return readyCount();
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
function pause(){for(const v of media.clips)try{v.pause();}catch{}}
function resume(){for(const v of media.clips)if(playable(v))v.play().catch(()=>{});}
async function ensure(){
 if(media.kind==='local'&&readyCount())return readyCount();
 if(media.kind==='embedded'&&readyCount()){resume();return readyCount();}
 return loadStock();
}
function clipAt(i){const clips=media.clips.filter(playable);return clips.length?clips[i%clips.length]:null;}
function rrect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function safeLine(c,t,x,y,max){const s=String(t||'').replace(/\s+/g,' ').slice(0,66);if(!s)return;let v=s;while(v.length>2&&c.measureText(v).width>max)v=v.slice(0,-2);c.fillText(v!==s?v+'…':s,x,y);}
function film(c,t){
 // Two continuous horizontal celluloid strips, not disjoint rectangular cards.
 // Actual videos are drawn from bundled footage and mirrored in video exports.
 if(!readyCount())return;
 const bands=[{y:260,angle:-.07,phase:0},{y:987,angle:.06,phase:173}];
 c.save();c.globalAlpha=.83;
 bands.forEach((band,row)=>{
  c.save();c.translate(-78,band.y);c.rotate(band.angle);
  const cell=146,frames=8,width=cell*frames,offset=((t*21+band.phase)%(cell*3));
  c.shadowColor='rgba(10,5,15,.42)';c.shadowBlur=16;
  c.fillStyle='#16121d';rrect(c,-80,-31,width+180,252,11);c.fill();c.shadowBlur=0;
  // Film perforations are small, subordinate and visually continuous.
  for(let j=-1;j<frames+1;j++){
   const x=j*cell-offset;
   c.fillStyle='#d1bdc9';c.globalAlpha=.53;
   rrect(c,x+6,-22,17,10,2);c.fill();rrect(c,x+6,206,17,10,2);c.fill();
   c.globalAlpha=1;
  }
  for(let i=-1;i<frames+1;i++){
   const x=i*cell-offset,video=clipAt((i+30+row*3)%6);
   c.save();rrect(c,x+3,-2,cell-6,200,2);c.clip();
   c.fillStyle='#322438';c.fillRect(x+3,-2,cell-6,200);
   if(video){const vw=video.videoWidth,vh=video.videoHeight;const z=Math.max((cell-6)/vw,200/vh);
    try{c.drawImage(video,x+3+(cell-6-vw*z)/2,-2+(200-vh*z)/2,vw*z,vh*z)}catch{}
   }
   c.restore();c.strokeStyle='rgba(238,231,241,.18)';c.lineWidth=1.5;c.strokeRect(x+3,-2,cell-6,200);
  }
  c.restore();
 });
 c.restore();
}
function paperPlane(c,x,y,r,scale=1){c.save();c.translate(x,y);c.rotate(r);c.scale(scale,scale);c.lineWidth=3;c.lineJoin='round';c.strokeStyle='rgba(255,255,255,.62)';c.beginPath();c.moveTo(-48,0);c.lineTo(58,-30);c.lineTo(8,37);c.lineTo(-6,11);c.closePath();c.moveTo(-6,11);c.lineTo(58,-30);c.stroke();c.restore();}
function planes(c,t){
 c.save();
 const routes=[
  {y:288,speed:19,phase:60,scale:.83},
  {y:507,speed:15,phase:490,scale:.67},
  {y:815,speed:21,phase:260,scale:1},
  {y:1050,speed:17,phase:670,scale:.76}
 ];
 for(let i=0;i<routes.length;i++){
  const r=routes[i],x=-110+(t*r.speed+r.phase)%990;
  const y=r.y+Math.sin(t*.39+i*1.7)*28+Math.cos(t*.21+i)*13;
  const tilt=Math.sin(t*.42+i*2.2)*.20-(i%2)*.07;
  const tail=73+(i%2)*24;
  c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=2.0;c.setLineDash([15,13]);c.lineCap='round';
  c.beginPath();c.moveTo(x-tail*r.scale,y+12);c.bezierCurveTo(x-tail*.65,y-12,x-32,y+5,x-5,y);c.stroke();c.setLineDash([]);
  paperPlane(c,x,y,tilt,r.scale);
 }
 c.restore();
}
function storyRings(c,t){
 // Three understated story previews inspired by the visual rhythm of a feed,
 // without using a fake user profile or invented personal images.
 c.save();
 const cards=[{x:400,y:350,w:178,h:310,r:-.12},{x:476,y:437,w:178,h:310,r:.08},{x:375,y:530,w:180,h:320,r:-.05}];
 for(let i=0;i<cards.length;i++){
  const card=cards[i];c.save();c.translate(card.x,card.y+Math.sin(t*.4+i)*7);c.rotate(card.r);
  c.globalAlpha=.30+i*.07;c.fillStyle='#24172d';rrect(c,0,0,card.w,card.h,22);c.fill();
  c.strokeStyle='#ffffff';c.lineWidth=3;c.globalAlpha=.55;c.stroke();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=4;c.beginPath();c.arc(card.w/2,card.h/2,37,0,Math.PI*2);c.stroke();
  c.globalAlpha=.32;c.fillStyle='#ffffff';rrect(c,18,22,card.w-36,4,2);c.fill();
  c.restore();
 }
 c.restore();
}
function comments(c,s,t){
 const arr=Array.isArray(s.comments)?s.comments.filter(x=>typeof x==='string'&&x.trim()).slice(0,22):[];
 if(!arr.length)return; // No invented comments; ever.
 c.save();
 // Instagram-style continuous comment list, not floating rectangle cards.
 // First entries descend gently and pause when the final 20 are introduced.
 const upTo=Math.min(arr.length,Math.max(1,Math.floor(Math.min(t,9.7)*2.15)+1));
 const viewport={x:245,y:280,w:445,h:805};c.beginPath();c.rect(viewport.x,viewport.y,viewport.w,viewport.h);c.clip();
 const offset=Math.min(t,9.7)*42;const max=upTo;
 for(let i=0;i<max;i++){
  const x=290,y=viewport.y+100+i*78-offset;
  if(y<viewport.y-90||y>viewport.y+viewport.h+65)continue;
  const text=arr[i];
  c.globalAlpha=.27;c.fillStyle='#fff';c.beginPath();c.arc(x-12,y-10,19,0,2*Math.PI);c.fill();
  c.globalAlpha=.49;c.font='700 18px system-ui,sans-serif';c.fillText('você',x+16,y-23);
  c.globalAlpha=.32;c.font='400 18px system-ui,sans-serif';safeLine(c,text,x+16,y+3,viewport.w-77);
  c.globalAlpha=.16;c.font='15px system-ui,sans-serif';c.fillText('♡',x+viewport.w-76,y+1);
 }
 c.restore();
}
function calendar(c,s,t){
 const total=Math.max(0,Number(s.activeDays)||0),timed=Math.min(1,Math.max(0,t/9));
 // In the interactive Story, each tap reveals progressively more days.
 // During export, elapsed time automatically completes the reveal.
 const p=s.peelSteps>0?Math.max(Math.min(1,s.manualProgress||0),timed*.4):timed;
 const eased=p*p*(3-2*p),elapsed=Math.min(total,Math.round(eased*total));
 const x=196,y=358,w=328,h=358;
 c.save();c.shadowColor='rgba(9,3,20,.30)';c.shadowBlur=20;c.shadowOffsetY=10;
 c.fillStyle='#fbf9f5';rrect(c,x+5,y+5,w,h,13);c.fill();
 c.shadowBlur=0;c.shadowOffsetY=0;
 c.fillStyle='#fffefa';rrect(c,x,y,w,h,13);c.fill();
 c.fillStyle='#a12e90';rrect(c,x,y,w,75,13);c.fill();c.fillRect(x,y+30,w,45);
 for(let i=0;i<2;i++){c.strokeStyle='#f8dafa';c.lineWidth=7;c.beginPath();c.moveTo(x+77+i*172,y-16);c.lineTo(x+77+i*172,y+12);c.stroke();}
 c.textAlign='center';c.fillStyle='#231a31';c.font='900 125px system-ui,sans-serif';c.fillText(String(elapsed),x+w/2,y+243);
 c.font='730 27px system-ui,sans-serif';c.fillText('DIAS',x+w/2,y+302);
 const leaves=Math.min(13,Math.round((p*p)*22));
 for(let i=0;i<leaves;i++){
  const progress=((t*1.65+i*2)%7)/7;
  const px=x+w/2+Math.sin(i*2.2+t*.8)*140,py=y+30-progress*440;
  c.save();c.translate(px,py);c.rotate(.12*Math.sin(i+t));c.globalAlpha=.38*(1-progress);
  c.fillStyle='#fffdfa';rrect(c,-139,-90,278,180,7);c.fill();c.restore();
 }
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
function stop(){if(task)cancelAnimationFrame(task);task=0;last=null;}
function attach(canvas,slide,msGetter){
 stop();last=canvas;
 const ctx=canvas?.getContext('2d',{alpha:true});if(!ctx)return;
 const paint=()=>{if(!canvas.isConnected)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height){task=requestAnimationFrame(paint);return;}
  ctx.clearRect(0,0,720,1280);draw(ctx,slide,msGetter());task=requestAnimationFrame(paint);};
 task=requestAnimationFrame(paint);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(media.kind==='embedded')resume();});
window.REEECAP_MOTION={draw,attach,load,ensure,revoke,pause,resume,
 stop,get clips(){return media.clips;},get count(){return readyCount();},
 get source(){return media.kind;},get error(){return media.lastError;},get libraryCount(){return STOCK.length;},stock:STOCK.map(s=>s.page)};
})();
