/* REEECAP 6.3 / EDITORIAL MOTION OPENING
   New original art direction, inspired by the pace and craft of high-end recaps.
   One time-based canvas composition is used by both player and export. */
(()=>{'use strict';
const W=720,H=1280;
const P={cream:'#fff2dd',paper:'#faf2e8',ink:'#141222',purple:'#5024bd',night:'#110d23',coral:'#fc493c',pink:'#f74c9b',lime:'#daff68',cyan:'#4af2e8',blue:'#3048f6'};
const limits=[0,1.38,2.8,4.18,5.65,7.05,8.35,10];
let raf=0,session=0,live=null;
const posters=Array.from({length:8},(_,i)=>{const im=new Image();im.src=`./assets/videos/posters/reel_${String([1,2,3,4,7,8,11,12][i]).padStart(2,'0')}.webp`;return im;});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const sm=v=>{v=clamp(v);return v*v*(3-2*v)};
const out=v=>1-Math.pow(1-clamp(v),3);
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function txt(c,s,x,y,size,color,opts={}){c.save();c.fillStyle=color;c.textBaseline='alphabetic';c.textAlign=opts.align||'left';c.font=`${opts.weight||900} ${size}px ${opts.serif?'Georgia,serif':'Inter Display,Inter,Arial,sans-serif'}`;c.letterSpacing=(opts.track??-3)+'px';let ww=c.measureText(String(s)).width;let max=opts.max||W+350;if(ww>max){c.translate(x,y);c.scale(max/ww,1);c.fillText(s,0,0)}else c.fillText(s,x,y);c.restore()}
function dot(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fillStyle=color;c.fill()}
function line(c,x1,y1,x2,y2,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function frame(c,x,y,w,h,idx,t,mode){c.save();c.translate(x,y);c.beginPath();c.rect(0,0,w,h);c.clip();rect(c,0,0,w,h,['#38315b','#d35b78','#74a5a0','#292a3e'][idx%4]);
 const ready=window.REEECAP_MOTION?.clips?.filter(v=>v.readyState>=2&&v.videoWidth>0)||[];const v=ready[idx%Math.max(1,ready.length)];const poster=posters[idx%posters.length];let media=v||((poster?.complete&&poster.naturalWidth)?poster:null);
 if(media){let vw=media.videoWidth||media.naturalWidth,vh=media.videoHeight||media.naturalHeight;if(vw&&vh){let z=Math.max(w/vw,h/vh)*1.075;let drift=Math.sin(t*.35+idx)*w*.035;try{c.drawImage(media,(w-vw*z)/2+drift,(h-vh*z)/2,vw*z,vh*z)}catch{}}}
 rect(c,0,0,w,h,mode==='tik'?'#0b131520':'#290c2720');c.restore()}
function stamp(c,word,x,y,fill,ink,angle=-.12){c.save();c.translate(x,y);c.rotate(angle);rect(c,-12,-45,word.length*25+41,63,fill);txt(c,word,0,0,32,ink,{track:-1});c.restore()}
function corners(c,color){c.save();c.strokeStyle=color;c.lineWidth=3;[[25,30,1,1],[695,30,-1,1],[25,1250,1,-1],[695,1250,-1,-1]].forEach(([x,y,sx,sy])=>{c.beginPath();c.moveTo(x+sx*26,y);c.lineTo(x,y);c.lineTo(x,y+sy*26);c.stroke()});c.restore()}
function label(c,name,i,color){txt(c,'REEECAP  /  '+name.toUpperCase(),35,83,21,color,{weight:800,track:2});txt(c,String(i+1).padStart(2,'0')+' / 07',685,83,19,color,{align:'right',weight:700,track:1})}
function lines(c,color,t){c.save();c.strokeStyle=color;c.lineWidth=1.5;for(let i=0;i<12;i++){let y=220+i*65+(t*7)%65;c.beginPath();c.moveTo(-20,y);c.lineTo(740,y-28);c.stroke()}c.restore()}
function instagram(c,i,p,t,year){switch(i){
 case 0:{rect(c,0,0,W,H,P.cream);label(c,'Instagram',i,P.ink);rect(c,0,920,720,360,P.coral);c.save();c.translate(475,550);c.rotate(-.2);c.strokeStyle=P.pink;c.lineWidth=46;c.beginPath();c.arc(0,0,270,Math.PI*.12,Math.PI*1.89);c.stroke();c.restore();
 txt(c,'NÃO',-15,480,270,P.ink,{max:755,track:-16});txt(c,'PISCA.',18,705,194,P.ink,{max:680,track:-13});txt(c,'SEU ANO VAI PASSAR DE NOVO.',34,1038,41,P.cream,{max:660,weight:900,track:-2});
 const b=1-out(p/.37);rect(c,0,0,720,1280,`rgba(255,242,221,${b})`);break;}
 case 1:{rect(c,0,0,W,H,P.coral);label(c,'Instagram',i,'#fff6df');c.save();c.translate(-170+p*90,120);c.rotate(-.12);for(let j=0;j<5;j++){rect(c,j*194-70,0,32,1140,P.cream)}c.restore();
 txt(c,String(year),-55,740,348,P.cream,{max:860,track:-22});rect(c,28,787,665,20,P.ink);
 txt(c,'NÃO FOI SÓ UM NÚMERO.',30,884,40,P.ink,{max:670,track:-1});txt(c,'FOI O SEU ANO.',30,958,67,P.cream,{max:667,track:-3});break;}
 case 2:{rect(c,0,0,W,H,P.night);label(c,'Instagram',i,'#ffffff');
 const k=out(p/.42);frame(c,-60,250+(1-k)*650,310,600,0,t,'inst');frame(c,230,165+(1-k)*500,310,650,2,t,'inst');frame(c,515,240+(1-k)*780,310,590,5,t,'inst');
 rect(c,0,901,720,379,P.night);txt(c,'CADA',21,1020,110,P.cream,{max:660});txt(c,'SEGUNDO',19,1147,126,P.cream,{max:690});stamp(c,'CONTA.',435,1200,P.pink,P.night,-.14);break;}
 case 3:{rect(c,0,0,W,H,P.cream);label(c,'Instagram',i,P.ink);lines(c,'#f24c5730',t);
 let a=out(p/.38),dy=(1-a)*160;
 txt(c,'VOCÊ',30,359+dy,154,P.ink,{max:650});rect(c,0,400+dy,720,18,P.coral);
 txt(c,'VIVEU.',-16,642+dy,171,P.coral,{max:757});txt(c,'CURTIU.',33,824+dy,139,P.purple,{max:690});
 txt(c,'GUARDOU.',-22,1005+dy,136,P.ink,{max:750});stamp(c,'TUDO ISSO.',250,1110,P.lime,P.ink,-.08);break;}
 case 4:{rect(c,0,0,W,H,P.purple);label(c,'Instagram',i,P.cream);c.save();c.translate(350,600);c.rotate(-.22);for(let k=0;k<9;k++){rect(c,-900+k*138+Math.sin(t*.5)*16,-800,49,2000,k%2?P.pink:P.coral)}c.restore();
 rect(c,0,385,720,460,'#16082be8');txt(c,'TODOS ESSES',24,520,84,P.cream,{max:670});txt(c,'MOMENTOS',-12,656,120,P.cream,{max:751});txt(c,'MERECEM MAIS.',23,748,56,P.lime,{max:676});break;}
 case 5:{rect(c,0,0,W,H,P.lime);label(c,'Instagram',i,P.ink);
 for(let j=0;j<7;j++){c.save();c.translate(-280+j*180+((p*160)%130),295+j*109);c.rotate(-.18);txt(c,String(year),0,0,134,j%2?P.purple:P.ink,{max:350,track:-9});c.restore()}
 rect(c,0,820,720,460,P.ink);txt(c,'AGORA',28,971,142,P.cream,{max:650});txt(c,'É SUA VEZ.',26,1101,102,P.lime,{max:665});break;}
 case 6:{rect(c,0,0,W,H,P.night);label(c,'Instagram',i,P.cream);c.save();c.globalAlpha=.25;for(let j=0;j<26;j++){let x=(j*111.78+Math.sin(t*.21+j)*52)%760,y=(j*177.7+Math.cos(t*.37+j)*71)%1320;dot(c,x,y,j%4+1,P.pink)}c.restore();
 const q=out(p/.32);c.save();c.translate((1-q)*850,0);rect(c,33,302,654,13,P.coral);txt(c,'O SEU',30,490,135,P.cream,{max:660});txt(c,'ANO.',30,649,188,P.cream,{max:670});txt(c,'EM MOVIMENTO.',22,788,72,P.pink,{max:670});rect(c,34,838,650,12,P.lime);c.restore();
 txt(c,'INSTAGRAM  ×  REEECAP',35,1190,26,P.cream,{weight:800,track:4,max:650});break;}}
}
function tiktok(c,i,p,t,year){switch(i){
 case 0:{rect(c,0,0,W,H,P.night);label(c,'TikTok',i,P.cream);c.save();c.rotate(-.14);for(let j=0;j<8;j++){rect(c,-270+j*130,-100,18,1600,j%2?P.cyan:P.pink)}c.restore();
 rect(c,0,315,720,620,P.night);txt(c,'HEY.',-7,575,288,P.cyan,{max:735});txt(c,'OLHA ISSO.',20,727,105,P.cream,{max:678});stamp(c,'APERTE O PLAY.',175,980,P.pink,P.ink,.09);break;}
 case 1:{rect(c,0,0,W,H,P.cyan);label(c,'TikTok',i,P.ink);
 txt(c,'20',-65,600,443,P.ink,{max:820,track:-26});txt(c,String(year).slice(-2),220,957,434,P.pink,{max:690,track:-24});rect(c,0,976,720,30,P.ink);txt(c,'ISSO FOI VOCÊ.',35,1104,71,P.ink,{max:660});break;}
 case 2:{rect(c,0,0,W,H,P.ink);label(c,'TikTok',i,P.cream);
 const k=out(p/.32);frame(c,20+(1-k)*800,205,320,502,7,t,'tik');frame(c,368-(1-k)*800,205,335,502,4,t,'tik');frame(c,80,732+(1-k)*750,560,304,1,t,'tik');
 rect(c,0,1040,720,240,P.pink);txt(c,'NADA PAROU.',12,1171,104,P.ink,{max:694});break;}
 case 3:{rect(c,0,0,W,H,P.paper);label(c,'TikTok',i,P.ink);
 c.save();c.translate(352,590);c.rotate(.12);rect(c,-395,-300,800,520,P.blue);c.restore();txt(c,'UM',-18,370,239,P.ink,{max:760});txt(c,'ANO',40,625,257,P.cream,{max:650});txt(c,'INTEIRO.',-10,842,158,P.ink,{max:745});
 txt(c,'EM CADA TOQUE.',35,1111,54,P.blue,{max:658});break;}
 case 4:{rect(c,0,0,W,H,P.pink);label(c,'TikTok',i,P.ink);
 for(let j=0;j<7;j++){let px=j%2?80:-190;txt(c,'REPLAY',px-((p*130)%90),260+j*145,161,j%2?P.cream:P.ink,{track:-10,max:940})}
 rect(c,0,515,720,275,P.cyan);txt(c,'NÃO É',32,627,127,P.ink,{max:658});txt(c,'SÓ REPLAY.',16,737,93,P.ink,{max:690});break;}
 case 5:{rect(c,0,0,W,H,P.ink);label(c,'TikTok',i,P.cream);
 for(let j=0;j<8;j++){let x=-120+j*125,y=170+((j*23+(p*45))%130);rect(c,x,y,77,900,j%3===0?P.pink:P.cyan)}
 rect(c,0,600,720,365,P.ink);txt(c,'É A SUA',28,755,124,P.cream,{max:660});txt(c,'HISTÓRIA.',12,899,145,P.cyan,{max:700});break;}
 case 6:{rect(c,0,0,W,H,P.cream);label(c,'TikTok',i,P.ink);
 c.save();c.translate(620,320);c.rotate(.19);rect(c,-250,-150,440,350,P.cyan);rect(c,-285,-185,440,350,P.pink);rect(c,-320,-220,440,350,P.ink);c.restore();
 const q=out(p/.38);c.save();c.translate(0,(1-q)*420);txt(c,'SEU ANO.',24,667,157,P.ink,{max:665});txt(c,'SEU RITMO.',18,825,113,P.ink,{max:680});rect(c,34,870,650,15,P.pink);c.restore();
 txt(c,'TIKTOK × REEECAP',35,1187,28,P.ink,{weight:800,track:4,max:650});break;}}
}
function scene(c,i,p,t,network,year){c.save();const op=network==='tiktok'?tiktok:instagram;op(c,i,p,t,year);c.restore()}
function draw(ctx,slide,timeMs,network,year){if(!ctx)return;let t=clamp((Number(timeMs)||0)/1000,0,9.999),net=String(network||slide?.platform||'instagram').toLowerCase()==='tiktok'?'tiktok':'instagram';let yy=year||slide?.year||new Date().getFullYear();
 ctx.save();const scale=Math.min(ctx.canvas.width/W,ctx.canvas.height/H);ctx.setTransform(scale,0,0,scale,(ctx.canvas.width-W*scale)/2,(ctx.canvas.height-H*scale)/2);
 ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();let i=limits.findIndex((v,j)=>j<limits.length-1&&t>=v&&t<limits[j+1]);i=Math.max(0,i);let t0=limits[i],t1=limits[i+1],p=(t-t0)/(t1-t0);scene(ctx,i,p,t,net,yy);
 // Transition is an animated diagonal editorial cut, not a simple cross-fade.
 if(i<6){const duration=net==='tiktok'?.23:.29, edge=t1-duration;if(t>edge){let u=out((t-edge)/duration),d=110+u*1350;ctx.save();ctx.beginPath();ctx.moveTo(-220,-140);ctx.lineTo(d-630,-140);ctx.lineTo(d+75,1420);ctx.lineTo(-220,1420);ctx.closePath();ctx.clip();scene(ctx,i+1,0,t,net,yy);ctx.restore();}}
 // Transition straight into the first measured Story, with no full-screen hold.
 if(t>9.72){rect(ctx,0,0,W,H,`rgba(14,10,29,${sm((t-9.72)/.28)})`)}ctx.restore();}
function stop(){session++;if(raf)cancelAnimationFrame(raf);raf=0;live=null;}
function attach(canvas,slide,elapsed,net,year){stop();if(!canvas)return;let s=session;live=canvas;const ctx=canvas.getContext('2d',{alpha:false});void window.REEECAP_MOTION?.ensure?.().catch(()=>{});let last=0;
 const run=(now=0)=>{if(s!==session||!canvas.isConnected||!live)return;if(!last||now-last>=30){draw(ctx,slide,elapsed(),net,year);last=now}raf=requestAnimationFrame(run)};run()}
window.REEECAP_INTRO={draw,attach,stop,duration:10000,version:'6.3-motion-editorial'};
})();
