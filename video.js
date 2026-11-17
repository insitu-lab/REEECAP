/* REEECAP — client-side story video export, original soundtrack. No uploaded files leave the browser. */
(()=>{'use strict';
const el=id=>document.getElementById(id);
const status=(msg)=>{let n=el('videoStatus');if(n)n.textContent=msg;};
function wrapped(ctx,str,maxWidth,maxLines=3){
 const words=String(str||'').split(/\s+/);const lines=[];let row='';
 for(const word of words){let test=row?row+' '+word:word;if(ctx.measureText(test).width>maxWidth && row){lines.push(row);row=word;}else row=test;}
 if(row)lines.push(row);return lines.slice(0,maxLines);
}
function drawFrame(ctx,data,slide,pct,logo){
 const w=ctx.canvas.width,h=ctx.canvas.height,g=ctx.createLinearGradient(0,0,w,h);
 const colors=slide.color||['#512aa1','#ce5b88'];g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 // Subtle original motion: arcs and a dimensional soft spotlight, never fake social media footage.
 let light=ctx.createRadialGradient(w*.88,h*.23,8,w*.7,h*.24,w*.89);
 light.addColorStop(0,'#ffffff30');light.addColorStop(1,'#ffffff00');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.strokeStyle='#ffffff16';ctx.lineWidth=5;
 for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(w*(.75+Math.sin(pct*5+i)*.07),h*(.42+i*.14),w*.53,h*.25,-.2,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
 ctx.fillStyle='#ffffff65';ctx.fillRect(52,52,w-104,5);ctx.fillStyle='#ffffff';ctx.fillRect(52,52,(w-104)*pct,5);
 if(logo?.complete&&logo.naturalWidth){const scale=260/logo.naturalWidth;ctx.drawImage(logo,52,97,260,logo.naturalHeight*scale);}
 else{ctx.font='900 53px system-ui,sans-serif';ctx.fillStyle='#ffffff';ctx.fillText('REEECAP',52,153);}
 ctx.fillStyle='#ffffffbf';ctx.font='600 23px system-ui,sans-serif';ctx.fillText(`${data.platform.toUpperCase()} • ${data.year}`,52,210);
 const ease=Math.min(1,Math.max(0,pct*4)),dy=(1-ease)*55;
 ctx.save();ctx.translate(0,dy);ctx.globalAlpha=Math.min(1,pct*5+.2);
 ctx.fillStyle='#ffffffdf';ctx.font='700 28px system-ui,sans-serif';let ey=wrapped(ctx,slide.eyebrow,620,2);ey.forEach((v,i)=>ctx.fillText(v,62,430+i*35));
 let v=String(slide.value||'');ctx.fillStyle='#ffffff';ctx.font=`900 ${v.length>11?74:v.length>7?96:133}px system-ui,sans-serif`;
 if(v){wrapped(ctx,v,610,2).forEach((r,i)=>ctx.fillText(r,62,600+i*110));}
 ctx.font='850 66px system-ui,sans-serif';const heading=wrapped(ctx,slide.title,600,3);let yy=v?740:615;heading.forEach((r,i)=>ctx.fillText(r,62,yy+i*76));
 ctx.font='500 29px system-ui,sans-serif';ctx.fillStyle='#ffffffeb';let py=yy+heading.length*76+39;
 wrapped(ctx,slide.body,590,4).forEach((r,i)=>ctx.fillText(r,62,py+i*43));
 ctx.restore();
 ctx.fillStyle='#ffffffb0';ctx.font='600 22px system-ui,sans-serif';ctx.fillText(data.demo?'DEMONSTRAÇÃO · dados fictícios':'Criado no REEECAP · dados analisados no navegador',52,h-76);
}
async function renderVideo(){
 const button=el('downloadVideo');if(!button)return;
 const snapshot=window.REEECAP_VIDEO_SNAPSHOT?.();if(!snapshot?.stories?.length){status('Abra uma retrospectiva para gerar um vídeo.');return;}
 if(typeof MediaRecorder==='undefined'||typeof HTMLCanvasElement.prototype.captureStream!=='function'){
  status('Este navegador não permite exportar vídeo. Experimente Chrome no computador ou Android.');return;
 }
 const types=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
 const mime=types.find(t=>MediaRecorder.isTypeSupported(t));
 if(!mime){status('A exportação WebM não é suportada neste navegador.');return;}
 button.disabled=true;button.textContent='Preparando vídeo…';status('Preparando os Stories. O arquivo ficará apenas no seu aparelho.');
 const cvs=document.createElement('canvas');cvs.width=720;cvs.height=1280;const ctx=cvs.getContext('2d',{alpha:false});
 const fps=24,msPerSlide=2400,n=Math.min(20,snapshot.stories.length),total=msPerSlide*n;
 const logo=new Image();logo.src='./assets/reeecap-logo-3.png';try{await Promise.race([logo.decode().catch(()=>{}),new Promise(r=>setTimeout(r,750))]);}catch{}
 const stream=cvs.captureStream(fps);let audio=null,actx=null,source=null;
 try{
  actx=new (window.AudioContext||window.webkitAudioContext)();
  audio=new Audio('./assets/reeecap-original-loop.mp3');audio.loop=true;audio.volume=.9;audio.preload='auto';
  const media=actx.createMediaElementSource(audio);const dest=actx.createMediaStreamDestination();media.connect(dest);
  for(const track of dest.stream.getAudioTracks())stream.addTrack(track);
  await Promise.race([actx.resume(),new Promise(r=>setTimeout(r,750))]);
  await Promise.race([audio.play().catch(()=>{}),new Promise(r=>setTimeout(r,1000))]);
 }catch(err){ // Video-only remains possible if the device denies audio.
  status('Gravando sem áudio: este navegador bloqueou a trilha sonora.');
  if(audio)audio.pause();
 }
 let recorder,finished=false,timer=null,parts=[];
 const stop=()=>{if(finished)return;finished=true;clearInterval(timer);try{recorder?.stop();}catch{}if(audio)audio.pause();};
 try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2300000});}
 catch(err){status('Não foi possível iniciar a gravação de vídeo.');button.disabled=false;button.textContent='Vídeo';if(actx)actx.close().catch(()=>{});return;}
 recorder.ondataavailable=e=>{if(e.data?.size)parts.push(e.data);};
 recorder.onerror=()=>{status('Falha na gravação do vídeo.');stop();};
 recorder.onstop=()=>{
  stream.getTracks().forEach(t=>t.stop());if(actx)actx.close().catch(()=>{});
  button.disabled=false;button.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3"/></svg> Vídeo';
  if(!parts.length){status('Não foi possível salvar o vídeo.');return;}
  const blob=new Blob(parts,{type:mime});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`REEECAP-${snapshot.platform}-${snapshot.year}.webm`;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);status('Vídeo WebM salvo. Você pode converter para MP4 depois, se precisar.');
 };
 const started=performance.now();
 drawFrame(ctx,snapshot,snapshot.stories[0],0,logo);
 recorder.start(300);
 timer=setInterval(()=>{
  const passed=performance.now()-started,idx=Math.min(n-1,Math.floor(passed/msPerSlide));
  const pct=Math.min(1,(passed-idx*msPerSlide)/msPerSlide);
  drawFrame(ctx,snapshot,snapshot.stories[idx],pct,logo);
  status(`Gravando vídeo · ${Math.min(100,Math.floor(passed/total*100))}%`);
  if(passed>=total)stop();
 },1000/fps);
}
window.REEECAP_RECORD_VIDEO=()=>{renderVideo().catch(err=>{const b=el('downloadVideo');if(b){b.disabled=false;b.textContent='Vídeo';}status('Não foi possível gerar o vídeo: '+(err?.message||'erro desconhecido'));});};
})();
