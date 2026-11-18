/* REEECAP 6.4. Continuous ten-second openings, shared by player/PNG/export.
   Kept at the existing path so installed projects do not need a new entry point.
   Footage is decorative stock from the existing credited library, never user posts. */
(()=>{'use strict';
const W=720,H=1280,clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,p)=>a+(b-a)*p;
const between=(t,a,b)=>smooth((t-a)/(b-a));
const visible=(t,a,b)=>between(t,a,a+.65)*(1-between(t,b-.45,b));
let raf=0,session=0;
const glyphLayer=document.createElement('canvas');glyphLayer.width=W;glyphLayer.height=H;
const metricLayer=document.createElement('canvas');metricLayer.width=W;metricLayer.height=H;
const posters=[2,4,12,9].map(i=>{const im=new Image();im.crossOrigin='anonymous';im.src=`./assets/videos/posters/reel_${String(i).padStart(2,'0')}.webp`;return im});
const words={
 pt:{year:'REGISTROS DE UM ANO SEU.',demo:'DEMO · DADOS FICTÍCIOS',stock:'FILMAGENS ILUSTRATIVAS'},
 en:{year:'A YEAR OF YOUR RECORDS.',demo:'DEMO · FICTIONAL DATA',stock:'ILLUSTRATIVE FOOTAGE'},
 es:{year:'REGISTROS DE UN AÑO TUYO.',demo:'DEMO · DATOS FICTICIOS',stock:'VÍDEOS ILUSTRATIVOS'}
};
// Opening attack markers measured locally from the supplied tracks (40-500Hz
// log-energy flux). Accents are spatial impulses, never full-screen flashes.
const attacks={instagram:[.4,.93,2.04,2.57,4.22,4.76,5.44,6.94,7.71,8.16,8.83,9.28],tiktok:[.2,1.13,1.83,2.3,2.76,3.23,3.93,5.33,5.79,6.37,8.59,9.51]};
const impulse=(t,net)=>Math.max(0,...attacks[net].map(at=>t>=at?Math.exp(-(t-at)*12):0));
function narrative(year){const lang=window.REEECAP_LANGUAGE?.()||'pt';return {
 pt:{start:['Volta a',String(year)+'.'],middle:['Do feed aos','seus registros.'],end:'Rever. Reencontrar. REEECAP.'},
 en:{start:['Back to',String(year)+'.'],middle:['From your feed','to your records.'],end:'Revisit. Rediscover. REEECAP.'},
 es:{start:['Vuelve a',String(year)+'.'],middle:['De tu feed a','tus registros.'],end:'Revisita. Reencuentra. REEECAP.'}
}[lang]||{start:['Back to',String(year)+'.'],middle:['From your feed','to your records.'],end:'Revisit. Rediscover. REEECAP.'}}
function copy(){return words[window.REEECAP_LANGUAGE?.()]||words.pt}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function color(a,b,p){return '#'+[0,1,2].map(i=>Math.round(mix(parseInt(a.slice(1+i*2,3+i*2),16),parseInt(b.slice(1+i*2,3+i*2),16),p)).toString(16).padStart(2,'0')).join('')}
function type(c,text,x,y,size,ink,{serif=false,weight=600,max=620,spacing=0,align='left'}={}){
 c.save();c.fillStyle=ink;c.textAlign=align;c.textBaseline='alphabetic';
 c.font=`${serif?'italic ':''}${weight} ${size}px ${serif?'Georgia,serif':'Inter,Arial,sans-serif'}`;
 c.letterSpacing=spacing+'px';
 // Fit by reducing font size, preserving the letterforms' proportions.
 const measured=c.measureText(String(text)).width;
 if(measured>max)c.font=`${serif?'italic ':''}${weight} ${size*max/measured}px ${serif?'Georgia,serif':'Inter,Arial,sans-serif'}`;
 c.fillText(String(text),x,y);c.restore();
}
function footage(c,idx,box,t){
 const [x,y,w,h,angle,alpha]=box;if(alpha<=0||w<=0||h<=0)return;
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);
 c.beginPath();c.roundRect(-w/2,-h/2,w,h,Math.min(5,w*.02));c.clip();rect(c,-w/2,-h/2,w,h,'#423943');
 const clips=window.REEECAP_MOTION?.clips||[],v=clips[idx%Math.max(1,clips.length)],p=posters[idx%posters.length];
 const media=v?.readyState>=2&&v.videoWidth?v:p?.complete&&p.naturalWidth?p:null;
 if(media){const mw=media.videoWidth||media.naturalWidth,mh=media.videoHeight||media.naturalHeight;
  const z=Math.max(w/mw,h/mh)*(1.06+.025*Math.sin(t*.34+idx));
  c.drawImage(media,-mw*z/2+Math.sin(t*.27+idx)*w*.018,-mh*z/2,mw*z,mh*z);
 }
 rect(c,-w/2,-h/2,w,h,'#150c1614');c.restore();
}
function instagramKinetic(c,t,year){
 const cp=copy(),story=narrative(year),hit=impulse(t,'instagram'),dark=between(t,4.25,6.0),ink=dark<.85?'#272028':'#fff4e8';
 rect(c,0,0,W,H,color('#f4eee4','#27131f',dark));
 const open=between(t,.15,2.85),fold=between(t,2.5,4.4),leave=between(t,7.2,9.5);
 // A single photographic iris opens, unfolds into three panels, then becomes
 // the counterforms of the year. It is one material changing shape, not slides.
 c.save();
 const radius=mix(112,850,open)+hit*7;
 c.beginPath();c.arc(360,640,radius,0,Math.PI*2);c.clip();
 for(let i=0;i<3;i++){
  const x=mix(360,(i-1)*270+360,fold)+(i-1)*leave*370;
  const y=640+Math.sin(t*.65+i)*34+(i-1)*fold*90;
  footage(c,i,[x,y,mix(710,246,fold),mix(1200,770,fold),(i-1)*fold*.14+Math.sin(t*.3)*.016,1-leave*.85],t);
 }
 c.restore();
 rect(c,0,0,W,H,'#27131f'+Math.round(between(t,4.15,5.3)*.93*255).toString(16).padStart(2,'0'));
 // Advancing paper shutters carve the aperture; their edges carry the type.
 const top=mix(427,180,open),bottom=mix(853,1120,open);
 c.save();c.globalAlpha=1-dark*.85;rect(c,0,0,W,top,'#f4eee4');rect(c,0,bottom,W,H-bottom,'#f4eee4');c.restore();
 const intro=visible(t,0,2.8);c.save();c.globalAlpha=intro;
 type(c,story.start[0],50,mix(400,351,open),90,'#272028',{weight:500});
 type(c,story.start[1],670,mix(1001,1060,open),100,'#272028',{serif:true,weight:400,align:'right'});c.restore();
 const caption=visible(t,2.7,4.8);c.save();c.globalAlpha=caption;
 rect(c,35,548,650,182,'#27131fe8');
 type(c,story.middle[0],61,623,67,'#fff4e8',{weight:500});
 type(c,story.middle[1],61,696,70,'#fff4e8',{serif:true,weight:400});c.restore();
 const yearAlpha=visible(t,4.35,7.8);c.save();c.globalAlpha=yearAlpha;
 // Video lives inside the four glyphs. Explicit source-atop compositing is
 // isolated on a scratch canvas, so the preview and exported pixels agree.
 const layer=glyphLayer,lc=layer.getContext('2d');lc.setTransform(1,0,0,1,0,0);lc.clearRect(0,0,W,H);lc.globalCompositeOperation='source-over';
 lc.save();lc.beginPath();lc.rect(45,415,630,370);lc.clip();
 [...String(year)].slice(0,4).forEach((digit,j)=>{
  const u=between(t,4.35+j*.12,5.5+j*.12),exit=between(t,7.1,7.9);
  type(lc,digit,150+j*140,730+(1-u)*420-exit*130,265,'#fff4e8',{weight:700,max:145,spacing:-3,align:'center'});
 });lc.restore();
 lc.globalCompositeOperation='source-atop';footage(lc,0,[360,640,820,1300,0,.86],t);
 c.drawImage(layer,0,0);type(c,cp.year,360,837,21,'#fff4e8',{weight:600,spacing:2,max:610,align:'center'});c.restore();
 const brand=between(t,7.1,8.4);c.save();c.globalAlpha=brand;
 const name='REEECAP',font=88,adv=85;
 [...name].forEach((letter,i)=>{
  const u=between(t,7.1+i*.065,8.05+i*.065);
  type(c,letter,105+i*adv,650+(1-u)*230-(t-8.5)*10,font,'#fff4e8',{weight:600,max:90,align:'center'});
 });
 type(c,story.end,360,747,27,'#e8b3bc',{weight:400,align:'center'});
 rect(c,50,825,620*between(t,7.6,9.35),2,'#d87c83');c.restore();
 type(c,'INSTAGRAM',50,169,22,ink,{spacing:3});
}
function tiktokKinetic(c,t,year){
 const story=narrative(year),hit=impulse(t,'tiktok'),unfold=between(t,1.7,4.1),returning=between(t,5.7,7.65),exit=between(t,7.15,8.4);
 rect(c,0,0,W,H,'#0b1114');
 // REEECAP's three E-bars act as a transport: images sweep backwards through
 // the same crop, unfold into a wide ribbon and return as the year's glyphs.
 c.save();c.translate(360,640);const zoom=1+Math.sin(t*.7)*.035+hit*.009;c.scale(zoom,zoom);c.translate(-360,-640);
 for(let i=0;i<3;i++){
  const turn=between(t,1.8+i*.15,4+i*.15),back=between(t,5.8+i*.08,7.6+i*.08);
  const x=mix(110+i*250,360,turn)+Math.sin(t*.5+i)*22-(i-1)*back*510;
  const y=mix(640,360+i*275,turn);
  footage(c,i,[x,y,mix(195,900,turn),mix(1150,225,turn),mix((i-1)*.05,0,turn),.92*(1-exit)],t);
 }
 c.restore();
 const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#0b1114ee');shade.addColorStop(.5,'#0b111400');shade.addColorStop(1,'#0b1114ee');c.fillStyle=shade;c.fillRect(0,0,W,H);
 const a=visible(t,.08,2.8);c.save();c.globalAlpha=a;
 type(c,story.start[0],50,430,92,'#f3f5ed',{weight:600});
 type(c,story.start[1],670,985,143,'#9df1df',{weight:700,align:'right'});c.restore();
 const middle=visible(t,2.7,4.9);c.save();c.globalAlpha=middle;
 rect(c,0,543,720,207,'#0b1114ef');
 type(c,story.middle[0],48,624,66,'#f3f5ed',{weight:600});
 type(c,story.middle[1],48,704,70,'#9df1df',{weight:600});c.restore();
 c.save();c.globalAlpha=visible(t,4.5,7.7);
 c.beginPath();c.rect(45,420,630,375);c.clip();
 [...String(year)].slice(0,4).forEach((digit,j)=>{
  const u=between(t,4.45+j*.12,5.7+j*.12),back=between(t,6.4,7.75);
  const x=150+j*140+(j%2?-1:1)*(1-u)*740;
  type(c,digit,x,720-back*90,260,j===1||j===2?'#9df1df':'#f3f5ed',{weight:700,max:146,align:'center'});
 });c.restore();
 // A deliberate visual breath precedes the identity reveal.
 const brand=between(t,7.5,8.55);c.save();c.globalAlpha=brand;
 c.translate(0,(1-brand)*70-(t-8.5)*13);
 type(c,'REEECAP',360,640,100,'#f3f5ed',{weight:700,max:620,spacing:-4,align:'center'});
 type(c,story.end,360,731,27,'#9df1df',{weight:400,align:'center'});
 // Three strokes of the E converge; the final edge opens onto the real metric.
 for(let i=0;i<3;i++)rect(c,50,818+i*13,620*between(t,7.6+i*.08,9.35),2,'#9df1df');c.restore();
 type(c,'TIKTOK',50,169,22,'#c8e7df',{spacing:3});
}
function draw(ctx,slide,timeMs,network,year){
 if(!ctx)return;const t=Math.max(0,Math.min(10,(Number(timeMs)||0)/1000)),net=network||slide?.platform||'instagram';
 ctx.save();const s=ctx.canvas.width/W;ctx.setTransform(s,0,0,s,0,0);ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
 (net==='tiktok'?tiktokKinetic:instagramKinetic)(ctx,t,year??slide?.year??new Date().getFullYear());
 type(ctx,copy().stock,50,1145,17,net==='tiktok'||t>5.6?'#d4c9cc':'#342932',{weight:500,spacing:1});
 if(slide?.demo)type(ctx,copy().demo,50,1180,18,net==='tiktok'||t>5.6?'#f6ede6':'#342932',{weight:600,spacing:1});
 ctx.restore();
}
// Incoming artwork is the real next Story, drawn by the existing renderer.
// At 10s it covers the complete frame and continues from 600ms in the player/export.
function transition(ctx,timeMs,incoming){
 const p=between(timeMs,9400,10000);if(!p||!incoming)return;
 if(p===1){incoming();return;}
 ctx.save();ctx.setTransform(1,0,0,1,0,0);const w=ctx.canvas.width,h=ctx.canvas.height;
 ctx.beginPath();ctx.ellipse(w/2,h/2,p*Math.hypot(w,h)/2,p*Math.hypot(w,h)/2,0,0,Math.PI*2);ctx.clip();incoming();ctx.restore();
}
function stop(){session++;if(raf)cancelAnimationFrame(raf);raf=0}
function attach(canvas,slide,elapsed,net,year,incoming){
 stop();if(!canvas)return;const token=session,ctx=canvas.getContext('2d',{alpha:false});let last=-1;
 if(!window.REEECAP_MOTION?.count)void window.REEECAP_MOTION?.ensure?.().catch(()=>{});
 const run=()=>{if(token!==session||!canvas.isConnected)return;const t=elapsed();
  // Paused frames stay still, including footage. The clock supplies full-resolution time.
  if(t!==last){window.REEECAP_INTRO.draw(ctx,slide,t,net,year);transition(ctx,t,incoming?()=>incoming(ctx,t-9400):null);last=t;}
  raf=requestAnimationFrame(run);
 };run();
}
function measured(target,data,slide,ms,pct){
 const ctx=metricLayer.getContext('2d');
 const tik=data.platform==='tiktok',t=Math.max(0,ms/1000),s=ctx.canvas.width/W,cp=copy();
 const bg=tik?'#0b1114':'#27131f',ink=tik?'#f3f5ed':'#fff4e8',accent=/^#[0-9a-f]{6}$/i.test(data.accent||'')?data.accent:tik?'#9df1df':'#e8b3bc';
 ctx.save();ctx.setTransform(s,0,0,s,0,0);rect(ctx,0,0,W,H,bg);
 const film=['likes','watched','reels'].includes(slide.metricKey);
 if(film){
  // The two real film strips leave an unobstructed field for the actual number.
  [310,1064].forEach((y,row)=>{for(let j=-1;j<4;j++){
   const x=j*238+((t*32*(row?-1:1))%238);
   footage(ctx,(j+9+row)%4,[x,y,214,166,row?-.025:.025,.88],t);
  }});
 }else if(slide.metricKey==='comments'&&slide.comments?.length){
  window.REEECAP_MOTION?.draw?.(ctx,slide,ms);
  rect(ctx,0,0,W,H,bg+'b0');
 }else if(slide.metricKey==='shares'){
  window.REEECAP_MOTION?.draw?.(ctx,slide,ms);
 }else{
  // A single moving crop connects this page to the opening's image material.
  footage(ctx,1,[tik?636:84,650,136,790,tik?.035:-.045,.6],t);
 }
 type(ctx,data.platform.toUpperCase(),50,166,22,ink,{spacing:3});
 type(ctx,data.year,670,166,22,ink,{align:'right',spacing:1});
 rect(ctx,50,207,620,1,tik?'#c4e2d532':'#29212825');
 let value=String(slide.value||'');const reveal=between(t,0,.9);
 if(['following','followers'].includes(slide.metricKey)&&/^[\d.,\s]+$/.test(value)){
  const target=Number(value.replace(/\D/g,''));value=new Intl.NumberFormat(window.REEECAP_LANGUAGE?.()||'pt').format(Math.round(target*(1-Math.pow(1-clamp(ms/1550),4))));
 }
 ctx.save();ctx.beginPath();ctx.rect(42,425,636,330);ctx.clip();ctx.translate(0,(1-reveal)*200);
 type(ctx,value,360,680,250,ink,{weight:tik?700:500,max:610,spacing:-7,align:'center'});ctx.restore();
 // Only source-provided copy. No fabricated rankings, names or reactions.
 const title=String(slide.title||slide.eyebrow||''),words=title.split(/\s+/);let lines=[''];
 ctx.font='600 55px Arial,sans-serif';
 for(const word of words){const i=lines.length-1,test=lines[i]?lines[i]+' '+word:word;
  if(ctx.measureText(test).width>600&&lines[i])lines.push(word);else lines[i]=test;
 }
 lines.slice(0,3).forEach((line,i)=>type(ctx,line,50,812+i*66,55,accent,{weight:600,max:610}));
 const body=String(slide.body||'');
 ctx.font='400 25px Arial,sans-serif';let bodyLines=[''];
 for(const word of body.split(/\s+/)){const i=bodyLines.length-1,test=bodyLines[i]?bodyLines[i]+' '+word:word;
  if(ctx.measureText(test).width>590&&bodyLines[i])bodyLines.push(word);else bodyLines[i]=test;
 }
 bodyLines.slice(0,2).forEach((line,i)=>type(ctx,line,50,812+lines.slice(0,3).length*66+38+i*32,25,ink,{weight:400,max:610}));
 rect(ctx,50,1112,620*clamp(pct),2,accent);
 type(ctx,'REEECAP',50,1177,27,ink,{weight:700,spacing:-1});
 type(ctx,data.demo?cp.demo:({pt:'SEUS REGISTROS · LEITURA LOCAL',en:'YOUR RECORDS · LOCAL PROCESSING',es:'TUS REGISTROS · ANÁLISIS LOCAL'}[window.REEECAP_LANGUAGE?.()||'pt']),50,1220,17,ink,{weight:500,spacing:1});
 ctx.restore();
 target.save();target.setTransform(1,0,0,1,0,0);target.drawImage(metricLayer,0,0,target.canvas.width,target.canvas.height);target.restore();
}
window.REEECAP_INTRO={draw,measured,transition,attach,stop,duration:10000,version:'6.4-continuous'};
})();
