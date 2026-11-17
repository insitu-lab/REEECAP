/* REEECAP 6.2 — cinematic intros, shared live/recorded canvas renderer.
   No personal metrics or fabricated content in opening sequence. */
(()=>{'use strict';
let raf=0,activeCanvas=null,seq=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const bump=(t,a,b,c,d)=>ease((t-a)/(b-a))*(1-ease((t-c)/(d-c)));
const rgb=(c,a)=>c+Math.max(0,Math.min(255,Math.round(a*255))).toString(16).padStart(2,'0');
// Audio envelopes measured from the first 10 seconds of the supplied MP3s.
const amplitudes={
 instagram:[.17,.23,.21,.22,.20,.22,.25,.26,.30,.24,.47,.34,.36,.35,.43,.40,.47,.47,.60,.54,.45,.48,.52,.52,.45,.48,.50,.60,.43,.49,.49,.44,.48,.60,.74,.84,1,.78,.92,.88],
 tiktok:[.03,.06,.08,.15,.18,.23,.23,.25,.26,.30,.29,.32,.38,.36,.31,.31,.35,.32,.37,.38,.48,.49,.49,.46,.52,.50,.50,.55,.54,.51,1,.66,.63,.60,.58,.59,.58,.59,.57,.59]
};
function energy(network,t){const arr=amplitudes[network];const x=clamp(t*4,0,arr.length-1),i=Math.floor(x);return arr[i]*(1-(x-i))+arr[Math.min(i+1,arr.length-1)]*(x-i);}

function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function glow(ctx,x,y,r,color,alpha){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgb(color,alpha));g.addColorStop(1,rgb(color,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function line(ctx,txt,x,y,size,weight,spacing=0,font='system-ui, sans-serif'){
 ctx.save();ctx.font=`${weight} ${size}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.letterSpacing=spacing+'px';
 const w=ctx.measureText(txt).width;if(w>650){ctx.translate(x,y);ctx.scale(650/w,1);ctx.fillText(txt,0,0)}else ctx.fillText(txt,x,y);ctx.restore();
}
function strip(ctx,y,t,flip=1,opacity=.7){
 ctx.save();ctx.translate(0,y);ctx.rotate(flip*.075);ctx.globalAlpha=opacity;
 const v=((t*38)%180);let lg=ctx.createLinearGradient(0,0,720,0);lg.addColorStop(0,'#fb4d9a');lg.addColorStop(.5,'#8c57eb');lg.addColorStop(1,'#ff9a73');
 ctx.fillStyle=lg;rrect(ctx,-95-v,-35,970,78,32);ctx.fill();
 ctx.strokeStyle='#ffe9f6';ctx.globalAlpha*=.48;ctx.lineWidth=2;
 for(let i=0;i<15;i++){ctx.beginPath();const px=i*86-v-100;ctx.moveTo(px,-29);ctx.lineTo(px+48,36);ctx.stroke();}
 ctx.restore();
}
function fadeOut(ctx,t){if(t<9.42)return;ctx.fillStyle=`rgba(9,8,17,${ease((t-9.42)/.58)})`;ctx.fillRect(0,0,720,1280);}
function footage(ctx,t,network){
 // Real, bundled licensed footage. Never a fake user's Reel.
 const clips=window.REEECAP_MOTION?.clips?.filter(v=>v.readyState>=2&&v.videoWidth>0)||[];
 if(!clips.length||t>5.8)return;
 const opacity=bump(t,.5,1.1,4.0,5.8),spin=network==='tiktok'?.14:-.08;
 const positions=network==='tiktok'?[[38,290,-.13],[285,360,.12],[527,310,-.11]]:[[30,300,-.10],[282,260,.06],[540,340,-.07]];
 ctx.save();ctx.globalAlpha=opacity*.50;
 for(let i=0;i<3;i++){
  const v=clips[i%clips.length],vw=v.videoWidth,vh=v.videoHeight;
  const [x,y,a]=positions[i];ctx.save();ctx.translate(x,y+Math.sin(t*.7+i)*21);ctx.rotate(a+spin*.10);
  const w=215,h=370;ctx.shadowColor='rgba(3,1,13,.55)';ctx.shadowBlur=22;ctx.shadowOffsetY=17;
  ctx.fillStyle=network==='tiktok'?'#1ef5e7':'#ffdeec';rrect(ctx,-w/2-7,-h/2-7,w+14,h+14,18);ctx.fill();ctx.shadowBlur=0;
  rrect(ctx,-w/2,-h/2,w,h,13);ctx.clip();const ratio=Math.max(w/vw,h/vh);
  try{ctx.drawImage(v,-vw*ratio/2,-vh*ratio/2,vw*ratio,vh*ratio)}catch{}
  ctx.restore();
 }
 ctx.restore();
}

function instagram(ctx,t,year){
 const g=ctx.createLinearGradient(-50,-60,880,1300);g.addColorStop(0,'#1c0c35');g.addColorStop(.47,'#7b1d82');g.addColorStop(1,'#ee3f81');ctx.fillStyle=g;ctx.fillRect(0,0,720,1280);
 const beat=energy('instagram',t);glow(ctx,575,280,510+beat*95,'#ff7ab5',.33+beat*.10);glow(ctx,105,995,490,'#876ef0',.42);glow(ctx,430,980,270+beat*110,'#ffb17a',.19+beat*.09);
 // Slow parallax orbits: abstract memories, not fabricated Instagram videos.
 for(let i=0;i<32;i++){
  const px=(i*137.51+Math.sin(i*.77+t*.14)*34+720)%720,py=(i*271.1+Math.cos(i*.61+t*.23)*31+1280)%1280;
  ctx.beginPath();ctx.arc(px,py,(i%4===0?2.8:1.2),0,Math.PI*2);ctx.fillStyle=`rgba(255,236,249,${.10+(i%5)*.035})`;ctx.fill();
 }
 if(t<5.8){strip(ctx,330+t*6,t,-1,.21);strip(ctx,1020-t*5,t,1,.17);footage(ctx,t,'instagram');}
 let a=bump(t,.15,.75,3.4,4.2);
 ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#fff1ec';ctx.letterSpacing='2px';line(ctx,'TANTOS MOMENTOS',360,480,31,600,5);ctx.restore();
 a=bump(t,1.0,1.9,4.6,5.35);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#fff8f2';line(ctx,'UMA HISTÓRIA',360,586,75,900,-4);ctx.restore();
 a=bump(t,3.0,4.05,6.65,7.2);ctx.save();ctx.globalAlpha=a;
 const scale=.87+.13*ease((t-3.0)/1.7);ctx.translate(360,665);ctx.scale(scale,scale);
 ctx.fillStyle='#fff7ea';line(ctx,String(year),0,0,215,500,-12,'Georgia, serif');ctx.restore();
 a=ease((t-6.3)/.85);ctx.save();ctx.globalAlpha=a;
 // A sharp editorial transition from atmosphere to title.
 ctx.fillStyle='#fff4e8';line(ctx,'SEU ANO',360,542,56,780,5);ctx.fillStyle='#ffffff';line(ctx,'EM REPLAY.',360,665,107,930,-6);
 ctx.fillStyle='#ffe3f2';line(ctx,'INSTAGRAM  /  REEECAP',360,752,21,700,5);
 ctx.restore();
 if(t>7.4){let q=ease((t-7.4)/1.7);ctx.save();ctx.globalAlpha=.3*q;ctx.strokeStyle='#fff0f4';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(360,660,260+q*180,185+q*130,-.24,0,Math.PI*2);ctx.stroke();ctx.restore();}
 fadeOut(ctx,t);
}
function tiktok(ctx,t,year){
 ctx.fillStyle='#080e15';ctx.fillRect(0,0,720,1280);
 const beat=energy('tiktok',t);glow(ctx,590,350,430+beat*125,'#17e8e4',.14+beat*.13);glow(ctx,60,970,490,'#fe286b',.16+beat*.12);
 ctx.save();ctx.globalAlpha=.20;ctx.strokeStyle='#a8f9f7';ctx.lineWidth=1;
 for(let x=-460;x<1120;x+=70){ctx.beginPath();ctx.moveTo(x+t*18,-20);ctx.lineTo(x-250+t*18,1300);ctx.stroke();}ctx.restore();
 // Rhythm strips snap rather than spin in generic circles.
 footage(ctx,t,'tiktok');
 for(let i=0;i<6;i++){
  const beat=ease((t-(i*.52+.75))/.14)*(1-ease((t-(i*.52+1.03))/.22));
  if(beat<.003)continue;ctx.save();ctx.globalAlpha=beat*.7;ctx.fillStyle=i%2?'#f53880':'#45faf1';
  const y=210+(i%4)*206;ctx.translate(360,y);ctx.rotate((i%2?1:-1)*.12);ctx.fillRect(-430,-10,860,16);ctx.restore();
 }
 let a=bump(t,.1,.42,2.15,2.55);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#56f6ec';line(ctx,'VOCÊ VIVEU',360,565,69,900,-3);ctx.fillStyle='#fff';line(ctx,'MUITA COISA.',360,664,69,900,-4);ctx.restore();
 a=bump(t,2.35,2.8,5.6,6.15);ctx.save();ctx.globalAlpha=a;
 ctx.fillStyle='#ff337d';line(ctx,String(year),368,654,226,1000,-11);
 ctx.fillStyle='#5ffaf0';line(ctx,String(year),350,634,226,1000,-11);
 ctx.fillStyle='#fff';line(ctx,String(year),360,643,222,1000,-10);ctx.restore();
 a=ease((t-5.95)/.42);ctx.save();ctx.globalAlpha=a;
 const yy=595-Math.min(1,(t-6)*.35)*23;ctx.fillStyle='#fff';line(ctx,'SEU ANO.',360,yy,92,900,-6);
 ctx.fillStyle='#53f8ef';line(ctx,'SEU RITMO.',360,yy+119,87,900,-4);
 ctx.fillStyle='#fff';line(ctx,'EM REPLAY',360,yy+240,75,850,-4);
 ctx.fillStyle='#ff6eaa';line(ctx,'TIKTOK  ×  REEECAP',360,yy+322,22,850,4);ctx.restore();
 if(t>7.1){ctx.save();ctx.globalAlpha=.22*ease((t-7.1)/1.1);ctx.strokeStyle='#44f8eb';ctx.lineWidth=5;for(let i=0;i<3;i++){const y=420+i*185;ctx.strokeRect(32,y,656,2);}ctx.restore();}
 fadeOut(ctx,t);
}
function draw(ctx,slide,timeMs,plat,year){if(!ctx)return;
 const ratio=ctx.canvas.width/720,t=clamp((Number(timeMs)||0)/1000,0,10);
 ctx.save();ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,720,1280);
 const isTik=String(plat||slide?.platform||'').toLowerCase()==='tiktok';
 if(isTik)tiktok(ctx,t,year||slide?.year||new Date().getFullYear());else instagram(ctx,t,year||slide?.year||new Date().getFullYear());
 ctx.restore();
}
function stop(){seq++;if(raf)cancelAnimationFrame(raf);raf=0;activeCanvas=null;}
function attach(canvas,slide,elapsed,plat,year){stop();if(!canvas)return;
 activeCanvas=canvas;const id=seq;const ctx=canvas.getContext('2d',{alpha:false});
 void window.REEECAP_MOTION?.ensure?.().catch(()=>{});
 let last=0;const loop=(now=0)=>{if(id!==seq||!canvas.isConnected||!activeCanvas)return;
  if(!last||now-last>=32){last=now;draw(ctx,slide,elapsed(),plat,year)}raf=requestAnimationFrame(loop);};loop();
}
window.REEECAP_INTRO={draw,attach,stop,duration:10000};
})();
