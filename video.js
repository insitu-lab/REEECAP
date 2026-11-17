/* REEECAP 2.0 · vertical video composer; all rendering and audio remain local. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=t=>String(t??'');
let dialog=null,busy=false,abortCurrent=null,shareFile=null;
const getLanguage=()=>window.REEECAP_LANGUAGE?.()||'pt';
const copy={pt:{title:'Seu recap em vídeo.',desc:'Um vídeo vertical 9:16 pronto para compartilhar. Apenas os dados que você escolher ficam no arquivo.',resolution:'Qualidade do vídeo',speed:'Ritmo dos Stories',track:'Incluir trilha original',go:'Gerar vídeo',share:'Compartilhar vídeo',close:'Fechar',wait:'Preparando…',progress:'Gravando',done:'Exportação concluída',unsupported:'Este navegador não consegue gravar vídeo. Use um navegador atualizado.',fallback:'Seu navegador não oferece MP4 direto; o resultado será WebM.',cancel:'Cancelar gravação',saved:'Arquivo salvo no dispositivo.'},en:{title:'Your recap, on video.',desc:'A vertical 9:16 video designed for sharing. Only the selected data appears in the export.',resolution:'Video quality',speed:'Story pacing',track:'Include original soundtrack',go:'Create video',share:'Share video',close:'Close',wait:'Preparing…',progress:'Recording',done:'Export complete',unsupported:'This browser cannot record video. Try an updated browser.',fallback:'Direct MP4 is not supported here. Video will be saved as WebM.',cancel:'Cancel recording',saved:'File saved on device.'},es:{title:'Tu recap en vídeo.',desc:'Vídeo vertical 9:16 para compartir, sin subir datos a ningún servidor.',resolution:'Calidad de vídeo',speed:'Duración de cada historia',track:'Incluir música original',go:'Crear vídeo',share:'Compartir vídeo',close:'Cerrar',wait:'Preparando…',progress:'Grabando',done:'Exportación finalizada',unsupported:'Este navegador no puede grabar vídeo. Prueba un navegador actualizado.',fallback:'Este navegador no permite MP4 directo. Se guardará un WebM.',cancel:'Cancelar grabación',saved:'Archivo guardado en tu dispositivo.'}};
function tr(){return copy[getLanguage()]||copy.pt;}
function mimeChoice(){const types=['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return typeof MediaRecorder==='undefined'?null:types.find(x=>MediaRecorder.isTypeSupported(x))||null;}
function textLines(ctx,str,maxW,maxLines=3){let lines=[],line='';for(const word of esc(str).split(/\s+/)){let candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>maxW&&line){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);return lines.slice(0,maxLines);}
function drawText(ctx,str,x,y,maxW,lineH,maxLines=3){const lines=textLines(ctx,str,maxW,maxLines);lines.forEach((t,i)=>ctx.fillText(t,x,y+i*lineH));return lines.length;}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function frame(ctx,data,slide,pct,idx,total,logo,ms){
 const w=ctx.canvas.width,h=ctx.canvas.height,s=w/720,sw=w/s,sh=h/s;
 ctx.setTransform(s,0,0,s,0,0);ctx.clearRect(0,0,sw,sh);
 const colors=Array.isArray(slide.color)?slide.color:['#2e143e','#7c3b91'];let gradient=ctx.createLinearGradient(0,0,sw,sh);gradient.addColorStop(0,colors[0]||'#38183e');gradient.addColorStop(.6,colors[1]||'#a1538e');gradient.addColorStop(1,'#151023');ctx.fillStyle=gradient;ctx.fillRect(0,0,sw,sh);
 const vx=(ms/1000)*.20;
 ctx.save();ctx.translate(0,0);
 for(let i=0;i<3;i++){let x=500+Math.sin(vx+i*1.9)*75,y=200+i*340+Math.cos(vx*.67+i)*34,r=285+i*24;let glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,i===1?'#faafcd1a':'#ffffff23');glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(0,0,sw,sh);}
 ctx.strokeStyle='#ffffff16';ctx.lineWidth=3;
 for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(640+Math.sin(vx+i)*20,760+Math.sin(vx*.6+i)*42,190+i*55,450+i*58,-.20,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
 const margin=48;
 ctx.fillStyle='#ffffff3d';rounded(ctx,margin,55,624,5,3);ctx.fill();ctx.fillStyle='#fff';rounded(ctx,margin,55,624*(idx+pct)/total,5,3);ctx.fill();
 ctx.fillStyle='#ffffffdd';ctx.font='750 24px system-ui,sans-serif';ctx.textAlign='right';ctx.fillText(String(idx+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),670,108);ctx.textAlign='left';
 if(logo?.complete&&logo.naturalWidth){let width=238;ctx.drawImage(logo,margin,99,width,logo.naturalHeight/logo.naturalWidth*width);}else{ctx.fillStyle='#fff';ctx.font='900 44px system-ui,sans-serif';ctx.fillText('REEECAP',margin,145);}
 ctx.fillStyle='#ffffffe0';ctx.font='700 24px system-ui,sans-serif';ctx.fillText(esc(data.platform).toUpperCase()+'  •  '+esc(data.year),margin,213);
 ctx.save();const ease=1-Math.pow(1-Math.min(1,pct*4),3);ctx.translate(0,(1-ease)*90);ctx.globalAlpha=Math.min(1,pct*5+.08);
 ctx.fillStyle='#ffffffca';ctx.font='750 24px system-ui,sans-serif';drawText(ctx,esc(slide.eyebrow).toUpperCase(),margin,388,620,33,2);
 let val=esc(slide.value);const digits=val.length;let size=digits>12?83:digits>8?106:digits>5?134:172;
 if(val){ctx.font=`900 ${size}px system-ui,sans-serif`;ctx.fillStyle='#fff';drawText(ctx,val,margin,565,620,size+10,2);}
 const headlineY=val?780:630;ctx.font='850 67px system-ui,sans-serif';ctx.fillStyle='#fff';let lines=drawText(ctx,slide.title,margin,headlineY,616,76,3);
 ctx.font='500 29px system-ui,sans-serif';ctx.fillStyle='#f8eefe';drawText(ctx,slide.body,margin,headlineY+76*lines+37,606,43,4);
 ctx.restore();
 ctx.fillStyle='#ffffff33';ctx.fillRect(margin,1157,624,1);
 ctx.fillStyle='#ffffffe8';ctx.font='700 22px system-ui,sans-serif';ctx.fillText('REEECAP · RECAP EVERYTHING',margin,1198);
 ctx.fillStyle='#ffffffa9';ctx.font='500 18px system-ui,sans-serif';ctx.fillText(data.demo?'DEMO · DADOS FICTÍCIOS':'Dados exportados pelo usuário · Processamento local',margin,1235);
}
function ensureDialog(){if(dialog)return dialog;
 dialog=document.createElement('dialog');dialog.id='videoComposer';dialog.className='video-dialog';
 dialog.innerHTML='<div class="dialog-content"><button class="dialog-close" id="videoDialogClose" type="button" aria-label="Fechar">✕</button><div class="premium-mark">REEECAP <span>VIDEO STUDIO</span></div><h2 id="videoComposerTitle"></h2><p id="videoComposerDesc"></p><div class="video-field"><label id="videoQualityLabel" for="videoQuality"></label><select id="videoQuality"><option value="720">HD · 720 × 1280 (mais leve)</option><option value="1080">Full HD · 1080 × 1920</option></select></div><div class="video-field"><label id="videoSpeedLabel" for="videoSpeed"></label><select id="videoSpeed"><option value="2400">Dinâmico · 2,4 s</option><option value="3400">Cinematográfico · 3,4 s</option></select></div><div class="video-field"><label class="video-check" for="videoAudio"><input id="videoAudio" type="checkbox" checked><span id="videoAudioLabel"></span></label></div><button type="button" class="video-start" id="videoStart"></button><div class="video-progress" role="progressbar" aria-label="Progresso" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><span id="videoProgressFill"></span></div><p class="video-msg" id="videoComposerMsg" aria-live="polite"></p><button type="button" class="video-share" id="videoShare"></button><p class="video-subtle">Privacidade: o arquivo permanece no seu aparelho. A trilha é original do projeto.</p></div>';
 document.body.append(dialog);
 $('videoDialogClose').addEventListener('click',()=>{if(busy){abortCurrent?.();}else dialog.close();});
 $('videoStart').addEventListener('click',()=>{if(busy){abortCurrent?.();return;}record().catch(err=>{message(err?.message||'Falha ao gerar vídeo.');finish();});});
 $('videoShare').addEventListener('click',async()=>{if(shareFile&&navigator.share){try{await navigator.share({files:[shareFile],title:'REEECAP'});}catch(err){if(err?.name!=='AbortError')message(err?.message||'Não foi possível compartilhar.');}}});
 return dialog;
}
function message(msg){const item=$('videoComposerMsg');if(item)item.textContent=msg;const other=$('videoStatus');if(other)other.textContent=msg;}
function progress(p){p=Math.max(0,Math.min(100,Math.floor(p)));if($('videoProgressFill'))$('videoProgressFill').style.width=p+'%';const bar=dialog?.querySelector('.video-progress');if(bar)bar.setAttribute('aria-valuenow',String(p));}
function finish(){busy=false;abortCurrent=null;const b=$('videoStart');if(b){b.disabled=false;b.textContent=tr().go;}const old=$('downloadVideo');if(old)old.disabled=false;}
function show(){if(!window.REEECAP_VIDEO_SNAPSHOT?.()?.stories?.length){const el=$('videoStatus');if(el)el.textContent='Abra uma retrospectiva primeiro.';return;}ensureDialog();
 const t=tr();$('videoComposerTitle').textContent=t.title;$('videoComposerDesc').textContent=t.desc;$('videoQualityLabel').textContent=t.resolution;$('videoSpeedLabel').textContent=t.speed;$('videoAudioLabel').textContent=t.track;$('videoStart').textContent=t.go;$('videoShare').textContent=t.share;$('videoDialogClose').setAttribute('aria-label',t.close);
 shareFile=null;$('videoShare').classList.remove('available');progress(0);
 message(mimeChoice()?.includes('webm')?t.fallback:'');dialog.showModal();
}
async function record(){const snapshot=window.REEECAP_VIDEO_SNAPSHOT?.();if(!snapshot?.stories?.length)return;
 const type=mimeChoice();if(!type||!HTMLCanvasElement.prototype.captureStream){message(tr().unsupported);return;}
 busy=true;const button=$('videoStart');button.textContent=tr().cancel;const original=$('downloadVideo');if(original)original.disabled=true;
 const width=Number($('videoQuality').value)||720,quality=width===1080?1080:720,msPerSlide=Number($('videoSpeed').value)||2400,n=Math.min(20,snapshot.stories.length),duration=msPerSlide*n;
 const canvas=document.createElement('canvas');canvas.width=quality;canvas.height=Math.round(quality*16/9);
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){message('Canvas indisponível.');finish();return;}
 const logo=new Image();logo.src='./assets/reeecap-logo-3.png';try{await Promise.race([logo.decode().catch(()=>{}),new Promise(r=>setTimeout(r,900))]);}catch{}
 const stream=canvas.captureStream(30);let audio=null,actx=null,cleaned=false,shouldSave=true,recorder=null,interval=null;
 function clean(){if(cleaned)return;cleaned=true;clearInterval(interval);audio?.pause();stream.getTracks().forEach(t=>t.stop());actx?.close().catch(()=>{});finish();}
 abortCurrent=()=>{shouldSave=false;try{if(recorder?.state==='recording')recorder.stop();else clean();}catch{clean();}message('Gravação cancelada.');};
 if($('videoAudio').checked){try{
  actx=new (window.AudioContext||window.webkitAudioContext)();audio=new Audio('./assets/reeecap-original-loop.mp3');audio.loop=true;audio.preload='auto';const from=actx.createMediaElementSource(audio),dest=actx.createMediaStreamDestination();from.connect(dest);from.connect(actx.destination);for(const track of dest.stream.getAudioTracks())stream.addTrack(track);
  await actx.resume();await audio.play();
 }catch{message('A gravação seguirá sem música neste navegador.');audio?.pause();for(const track of stream.getAudioTracks()){stream.removeTrack(track);track.stop();}}}
 const segments=[];
 try{recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:quality===1080?5300000:2600000});}catch(err){clean();throw err;}
 recorder.ondataavailable=e=>{if(e.data?.size)segments.push(e.data);};
 recorder.onerror=()=>{shouldSave=false;message('A gravação falhou neste dispositivo.');try{recorder.stop();}catch{clean();}};
 recorder.onstop=()=>{
  clean();if(!shouldSave)return;
  if(!segments.length){message('Nenhum dado de vídeo foi gerado.');return;}
  const mime=type.includes('mp4')?'video/mp4':'video/webm',ext=mime.includes('mp4')?'mp4':'webm';const blob=new Blob(segments,{type:mime});const file=new File([blob],`REEECAP-${snapshot.platform}-${snapshot.year}.${ext}`,{type:mime});shareFile=file;
  const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),45000);
  progress(100);message(`${tr().saved} ${ext.toUpperCase()} · ${(blob.size/1024/1024).toFixed(1)} MB`);
  if(navigator.canShare?.({files:[file]}))$('videoShare').classList.add('available');
 };
 const start=performance.now();frame(ctx,snapshot,snapshot.stories[0],0,0,n,logo,0);
 try{recorder.start(500);}catch(err){clean();throw err;}
 interval=setInterval(()=>{
  if(!recorder||recorder.state==='inactive')return;
  const passed=performance.now()-start,idx=Math.min(n-1,Math.floor(passed/msPerSlide));const pct=Math.min(1,(passed-idx*msPerSlide)/msPerSlide);
  frame(ctx,snapshot,snapshot.stories[idx],pct,idx,n,logo,passed);const percentage=Math.min(100,passed/duration*100);progress(percentage);
  if(Math.floor(percentage)%5===0)message(`${tr().progress} · ${Math.floor(percentage)}%`);
  if(passed>=duration){clearInterval(interval);try{recorder.stop();}catch{clean();}}
 },1000/30);
}
window.REEECAP_RECORD_VIDEO=show;
})();
