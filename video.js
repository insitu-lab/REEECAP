/* REEECAP 2.0 · vertical video composer; all rendering and audio remain local. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=t=>String(t??'');
let dialog=null,busy=false,abortCurrent=null,shareFile=null,previewLogo=null;
const getLanguage=()=>window.REEECAP_LANGUAGE?.()||'pt';
const copy={pt:{title:'Seu recap em vídeo.',desc:'Um vídeo vertical 9:16 pronto para compartilhar. Apenas os dados que você escolher ficam no arquivo.',resolution:'Qualidade do vídeo',speed:'Ritmo dos Stories',track:'Incluir música escolhida',go:'Gerar vídeo',share:'Compartilhar vídeo',close:'Fechar',wait:'Preparando…',progress:'Gravando',done:'Exportação concluída',unsupported:'Este navegador não consegue gravar vídeo. Use um navegador atualizado.',fallback:'Seu navegador não oferece MP4 direto; o resultado será WebM.',cancel:'Cancelar gravação',saved:'Arquivo salvo no dispositivo.',select:'Escolha os Stories',selectAll:'Marcar todos',selectNone:'Desmarcar todos',chosen:'selecionados',ownTrack:'Usar música do meu aparelho',ownNote:'Arquivo de áudio local (máx. 25 MB). Não é enviado ao REEECAP.',preview:'Prévia do primeiro Story',needOne:'Escolha pelo menos um Story.',volume:'Volume da trilha'},en:{title:'Your recap, on video.',desc:'A vertical 9:16 video designed for sharing. Only the selected data appears in the export.',resolution:'Video quality',speed:'Story pacing',track:'Include selected soundtrack',go:'Create video',share:'Share video',close:'Close',wait:'Preparing…',progress:'Recording',done:'Export complete',unsupported:'This browser cannot record video. Try an updated browser.',fallback:'Direct MP4 is not supported here. Video will be saved as WebM.',cancel:'Cancel recording',saved:'File saved on device.',select:'Choose your Stories',selectAll:'Select all',selectNone:'Clear',chosen:'selected',ownTrack:'Use audio from my device',ownNote:'Local audio only (max. 25 MB). Never uploaded.',preview:'Preview of the first Story',needOne:'Choose at least one Story.',volume:'Soundtrack volume'},es:{title:'Tu recap en vídeo.',desc:'Vídeo vertical 9:16 para compartir, sin subir datos a ningún servidor.',resolution:'Calidad de vídeo',speed:'Duración de cada historia',track:'Incluir música selecionada',go:'Crear vídeo',share:'Compartir vídeo',close:'Cerrar',wait:'Preparando…',progress:'Grabando',done:'Exportación finalizada',unsupported:'Este navegador no puede grabar vídeo. Prueba un navegador actualizado.',fallback:'Este navegador no permite MP4 directo. Se guardará un WebM.',cancel:'Cancelar grabación',saved:'Archivo guardado en tu dispositivo.',select:'Elige tus historias',selectAll:'Seleccionar todas',selectNone:'Desmarcar',chosen:'seleccionadas',ownTrack:'Usar música de mi dispositivo',ownNote:'Audio local (máx. 25 MB). No se sube.',preview:'Vista previa de la primera historia',needOne:'Elige al menos una historia.',volume:'Volumen de música'}};
function tr(){return copy[getLanguage()]||copy.pt;}
function mimeChoice(hasAudio=false){const types=hasAudio?['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4;codecs="avc1.42E01E,mp4a.40.5"','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']:['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];return typeof MediaRecorder==='undefined'?null:types.find(x=>MediaRecorder.isTypeSupported(x))||null;}
function textLines(ctx,str,maxW,maxLines=3){let lines=[],line='';for(const word of esc(str).split(/\s+/)){let candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>maxW&&line){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);return lines.slice(0,maxLines);}
function drawText(ctx,str,x,y,maxW,lineH,maxLines=3){
 const lines=textLines(ctx,str,maxW,maxLines);lines.forEach((t,i)=>{
  // Prevent very long usernames, titles and numbers from escaping the 9:16 safe area.
  const width=ctx.measureText(t).width;if(width>maxW){ctx.save();ctx.translate(x,y+i*lineH);ctx.scale(Math.max(.36,maxW/width),1);ctx.fillText(t,0,0);ctx.restore();}
  else ctx.fillText(t,x,y+i*lineH);
 });return lines.length;
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function ornaments(ctx,slide,ms,ink="#fff"){
 // Genre-specific motion language: no fake videos, user identities or fabricated metrics.
 const kind=slide.metricKey||slide.kind, t=ms/1000;
 ctx.save();ctx.globalAlpha=.20;ctx.lineWidth=4;ctx.strokeStyle=ink;ctx.fillStyle=ink;
 if(kind==='likes'){
  for(let i=0;i<9;i++){const x=110+(i%3)*200+Math.sin(t*.9+i)*25,y=1050+((i*103)%720)-((t*24+i*31)%400);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(i+t)*.18);ctx.beginPath();ctx.moveTo(0,13);ctx.bezierCurveTo(-60,-18,-20,-54,0,-28);ctx.bezierCurveTo(20,-54,60,-18,0,13);ctx.stroke();ctx.restore();}
 }else if(kind==='shares'){
  for(let i=0;i<7;i++){const x=90+(i%3)*240+Math.sin(t*.7+i)*25,y=1180-((t*45+i*120)%310);ctx.save();ctx.translate(x,y);ctx.rotate(-.28);ctx.beginPath();ctx.moveTo(-40,0);ctx.lineTo(43,-28);ctx.lineTo(5,40);ctx.lineTo(-3,7);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(-3,7);ctx.lineTo(43,-28);ctx.stroke();ctx.restore();}
 }else if(['watched','reels','posts'].includes(kind)){
  for(let i=0;i<4;i++){const x=40+i*180,y=1000+Math.sin(t*.7+i)*30;ctx.strokeRect(x,y,138,240);for(let j=0;j<4;j++){ctx.fillRect(x-10,y+18+j*51,6,20);ctx.fillRect(x+142,y+18+j*51,6,20);}}
 }else if(kind==='comments'){
  for(let i=0;i<5;i++){const y=895+i*65-((t*16)%56),x=50+(i%2)*160;rounded(ctx,x,y,400-(i%3)*40,45,19);ctx.stroke();ctx.fillRect(x+18,y+19,170+(i%3)*35,5);}
 }else if(['stories','storyPosts','followers','following'].includes(kind)){
  // Instagram-style profile rings, not invented profile pictures.
  for(let i=0;i<6;i++){const x=145+(i%3)*200,y=1010+Math.floor(i/3)*155+Math.sin(t*.6+i)*12;ctx.beginPath();ctx.arc(x,y,55,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x,y,44,0,Math.PI*2);ctx.stroke();}
 }else if(kind==='downvotes'){
  // Reddit votes: visible down-arrows instead of miscellaneous abstract decoration.
  for(let i=0;i<9;i++){const x=80+(i%4)*165,y=865+Math.floor(i/4)*128+Math.sin(t*.7+i)*9;ctx.beginPath();ctx.moveTo(x+25,y);ctx.lineTo(x+25,y+47);ctx.moveTo(x,y+30);ctx.lineTo(x+25,y+57);ctx.lineTo(x+50,y+30);ctx.stroke();}
 }else if(kind==='saved'){
  // Outline bookmarks, drawn directly on the export canvas.
  for(let i=0;i<7;i++){const x=85+(i%3)*210,y=890+(i%3)*90+Math.sin(t*.5+i)*14;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+68,y);ctx.lineTo(x+68,y+102);ctx.lineTo(x+34,y+76);ctx.lineTo(x,y+102);ctx.closePath();ctx.stroke();}
 }else if(kind==='searches'){
  for(let i=0;i<6;i++){const x=125+(i%3)*225,y=960+Math.floor(i/3)*150+Math.sin(t*.4+i)*12;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.moveTo(x+24,y+24);ctx.lineTo(x+64,y+64);ctx.stroke();}
 }else if(kind==='activeDays'){
  for(let row=0;row<4;row++)for(let col=0;col<7;col++){const x=80+col*78,y=870+row*78;ctx.globalAlpha=((col+row*7)%4===0?.40:.14);rounded(ctx,x,y,48,48,10);ctx.fill();}
 }
 ctx.restore();
}
function frame(ctx,data,slide,pct,idx,total,logo,ms){
 const w=ctx.canvas.width,h=ctx.canvas.height,s=w/720,sw=w/s,sh=h/s;
 ctx.setTransform(s,0,0,s,0,0);ctx.clearRect(0,0,sw,sh);
 const theme=data.theme||'neon', accent=/^#[0-9a-fA-F]{6}$/.test(data.accent||'')?data.accent:'#fd347b';
 const ink=theme==='paper'?'#181521':'#ffffff';const colors=Array.isArray(slide.color)?slide.color:['#2e143e','#7c3b91'];
 if(theme==='paper'){
  ctx.fillStyle='#f7f3ea';ctx.fillRect(0,0,sw,sh);
  ctx.fillStyle=accent;ctx.fillRect(0,0,18,sh);ctx.fillRect(0,sh-112,sw,112);
  ctx.strokeStyle='#d3cfc6';ctx.lineWidth=2;
  for(let y=260;y<1140;y+=38){ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(680,y);ctx.stroke();}
  ctx.save();ctx.translate(592,925);ctx.rotate(-.24);ctx.fillStyle='#1815210a';ctx.fillRect(-122,-370,245,540);ctx.restore();
 }else if(theme==='noir'){
  ctx.fillStyle='#0a0b10';ctx.fillRect(0,0,sw,sh);
  const rg=ctx.createRadialGradient(540,420,10,540,420,770);rg.addColorStop(0,accent+'3a');rg.addColorStop(1,'#0a0b1000');ctx.fillStyle=rg;ctx.fillRect(0,0,sw,sh);
  ctx.strokeStyle=accent;ctx.lineWidth=3;
  for(let i=0;i<5;i++){ctx.globalAlpha=.11+i*.025;ctx.beginPath();ctx.arc(610,770,160+i*75,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
 }else{
  let gradient=ctx.createLinearGradient(0,0,sw,sh);gradient.addColorStop(0,colors[0]||'#38183e');gradient.addColorStop(.55,accent);gradient.addColorStop(1,'#151023');ctx.fillStyle=gradient;ctx.fillRect(0,0,sw,sh);
 }

 const vx=(ms/1000)*.20;
 ctx.save();ctx.translate(0,0);
 if(theme==='neon')for(let i=0;i<3;i++){let x=500+Math.sin(vx+i*1.9)*75,y=200+i*340+Math.cos(vx*.67+i)*34,r=285+i*24;let glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,i===1?'#faafcd1a':'#ffffff23');glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(0,0,sw,sh);}
 // A clean gradient is intentional. Category-specific marks are drawn by ornaments().
 ctx.restore();
 if(!window.REEECAP_MOTION)ornaments(ctx,slide,ms,ink);
 else if(!['likes','watched','reels','shares','comments','stories','storyPosts','days'].includes(slide.metricKey||slide.kind))ornaments(ctx,slide,ms,ink);
 window.REEECAP_MOTION?.draw(ctx,slide,ms);
 const margin=48;
 ctx.fillStyle=theme==='paper'?'#18152133':'#ffffff3d';rounded(ctx,margin,55,624,5,3);ctx.fill();ctx.fillStyle=theme==='paper'?'#181521':accent;rounded(ctx,margin,55,624*(idx+pct)/total,5,3);ctx.fill();
 ctx.fillStyle=theme==='paper'?'#181521':'#ffffffdd';ctx.font='750 24px system-ui,sans-serif';ctx.textAlign='right';ctx.fillText(String(idx+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),670,108);ctx.textAlign='left';
 if(logo?.complete&&logo.naturalWidth){let width=238;ctx.drawImage(logo,margin,99,width,logo.naturalHeight/logo.naturalWidth*width);}else{ctx.fillStyle=ink;ctx.font='900 44px system-ui,sans-serif';ctx.fillText('REEECAP',margin,145);}
 ctx.fillStyle=theme==='paper'?'#382d3b':'#ffffffe0';ctx.font='700 24px system-ui,sans-serif';ctx.fillText(esc(data.platform).toUpperCase()+'  •  '+esc(data.year),margin,213);
 ctx.save();const ease=1-Math.pow(1-Math.min(1,pct*4),3);ctx.translate(0,(1-ease)*90);ctx.globalAlpha=Math.min(1,pct*5+.08);
 ctx.fillStyle=theme==='paper'?'#493c49':'#ffffffca';ctx.font='750 24px system-ui,sans-serif';drawText(ctx,esc(slide.eyebrow).toUpperCase(),margin,388,620,33,2);
 let val=esc(slide.value);const digits=val.length;let size=digits>12?83:digits>8?106:digits>5?134:172;
 if(val){ctx.font=`900 ${size}px system-ui,sans-serif`;ctx.fillStyle=ink;drawText(ctx,val,margin,565,620,size+10,2);}
 const headlineY=val?780:630;ctx.font='850 67px system-ui,sans-serif';ctx.fillStyle=ink;const reveal=slide.kind!=='days'||pct>.77;let lines=reveal?drawText(ctx,slide.title,margin,headlineY,616,76,3):1;
 ctx.font='500 29px system-ui,sans-serif';ctx.fillStyle=theme==='paper'?'#413a43':'#f8eefe';drawText(ctx,slide.body,margin,headlineY+76*lines+37,606,43,4);
 ctx.restore();
 ctx.fillStyle=theme==='paper'?'#00000030':'#ffffff33';ctx.fillRect(margin,1157,624,1);
 ctx.fillStyle=theme==='paper'?'#16131a':'#ffffffe8';ctx.font='700 22px system-ui,sans-serif';ctx.fillText('REEECAP · RECAP EVERYTHING',margin,1198);
 ctx.fillStyle=theme==='paper'?'#423a42':'#ffffffa9';ctx.font='500 18px system-ui,sans-serif';ctx.fillText(data.demo?({pt:'DEMO · DADOS FICTÍCIOS',en:'DEMO · FICTIONAL DATA',es:'DEMO · DATOS FICTICIOS'}[getLanguage()]):({pt:'Dados exportados pelo usuário · Processamento local',en:'User-exported data · Local processing',es:'Datos exportados por el usuario · Análisis local'}[getLanguage()]),margin,1235);
 if(idx<total-1&&pct>.86){ctx.fillStyle=theme==='paper'?'#f7f3ea':'#0a0910';ctx.globalAlpha=Math.min(1,(pct-.86)/.14);ctx.fillRect(0,0,sw,sh);ctx.globalAlpha=1;}
}

function ensureDialog(){if(dialog)return dialog;
 dialog=document.createElement('dialog');dialog.id='videoComposer';dialog.className='video-dialog';
 dialog.innerHTML='<div class="dialog-content"><button class="dialog-close" id="videoDialogClose" type="button" aria-label="Fechar">✕</button><div class="premium-mark">REEECAP <span>VIDEO STUDIO</span></div><h2 id="videoComposerTitle"></h2><p id="videoComposerDesc"></p><div class="video-layout"><div class="video-options"><div class="video-field"><label for="videoTheme" id="videoThemeLabel">Estilo visual</label><select id="videoTheme"><option value="neon">Neon Motion · Luzes e formas</option><option value="noir">Noir Editorial · Preto e tipografia</option><option value="paper">Paper Cut · Colagem e papel</option></select></div><div class="video-field"><label for="videoAccent" id="videoAccentLabel">Cor de destaque</label><input id="videoAccent" type="color" value="#fd347b" aria-label="Cor de destaque"></div><div class="video-field"><label id="videoQualityLabel" for="videoQuality"></label><select id="videoQuality"><option value="720">HD · 720 × 1280 (mais leve)</option><option value="1080">Full HD · 1080 × 1920</option></select></div><div class="video-field"><label id="videoSpeedLabel" for="videoSpeed"></label><select id="videoSpeed"><option value="2400">Dinâmico · 2,4 s</option><option value="3400">Cinematográfico · 3,4 s</option><option value="4800">Contemplativo · 4,8 s</option></select></div><div class="video-field"><label class="video-check" for="videoAudio"><input id="videoAudio" type="checkbox" checked><span id="videoAudioLabel"></span></label></div><div class="video-field custom-track"><label class="video-check" for="videoCustomEnabled"><input id="videoCustomEnabled" type="checkbox"><span id="videoCustomLabel"></span></label><input id="videoCustomFile" type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" ><small id="videoCustomNote"></small></div><div class="video-field"><label for="videoReelFiles">Vídeos reais de fundo · alterar (opcional)</label><input id="videoReelFiles" type="file" accept="video/*,.mp4,.mov,.webm,.m4v" multiple><small id="videoReelsStatus">Clipes licenciados aparecem automaticamente; seus vídeos têm prioridade quando selecionados.</small><small><a href="./videos-e-creditos.html" target="_blank" rel="noopener noreferrer">Ver autores, licenças e créditos dos 12 vídeos reais</a> · inclua os créditos ao publicar vídeos com material CC BY.</small></div><div class="video-field"><label id="videoVolumeLabel" for="videoVolume"></label><input id="videoVolume" type="range" min="0" max="100" value="35" step="5"></div></div><aside class="video-preview-panel"><span id="videoPreviewLabel"></span><canvas id="videoPreviewCanvas" width="360" height="640" aria-label="Prévia vertical"></canvas></aside></div><div class="video-slides-header"><strong id="videoChooseLabel"></strong><span id="videoSlideCount"></span></div><div class="video-selection-actions"><button id="videoAll" type="button"></button><button id="videoNone" type="button"></button></div><div class="video-story-select" id="videoStorySelect" role="group" aria-label="Escolha os Stories do vídeo"></div><button type="button" class="video-start" id="videoStart"></button><div class="video-progress" role="progressbar" aria-label="Progresso" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><span id="videoProgressFill"></span></div><p class="video-msg" id="videoComposerMsg" aria-live="polite"></p><button type="button" class="video-share" id="videoShare"></button><div class="reeecap-music-library"><strong>Escolha a trilha · músicas licenciadas</strong><p>Trilhas por streaming até os arquivos MP3 serem integrados à hospedagem.</p><div class="reeecap-music-options"><label><input name="reeecapSoundtrack" type="radio" value="cat" checked> Cat Walk · Arulo (House)</label><label><input name="reeecapSoundtrack" type="radio" value="forest"> Rising Forest · Diego Nava (Eletrônica)</label><label><input name="reeecapSoundtrack" type="radio" value="fest"> Techno Fest Vibes · Alejandro Magaña (EDM)</label></div><button id="reeecapPreviewSoundtrack" type="button">Ouvir trecho</button><small>Trilhas licenciadas por Mixkit para vídeos em redes sociais.</small></div><p class="video-subtle">Privacidade: o arquivo permanece no seu aparelho. Para músicas externas, inclua os créditos do artista na postagem.</p></div>';
 document.body.append(dialog);
 $('videoCustomFile').disabled=true; $('videoCustomEnabled').addEventListener('change',()=>{$('videoCustomFile').disabled=!$('videoCustomEnabled').checked;});
 $('videoAudio').addEventListener('change',()=>{const choice=mimeChoice($('videoAudio').checked);message(choice?.includes('webm')?tr().fallback:'');});
 $('videoReelFiles').addEventListener('change',async e=>{try{const n=await window.REEECAP_MOTION.load(e.target.files);$('videoReelsStatus').textContent=n+' vídeo(s) locais adicionados. Nenhum arquivo enviado ao servidor.';updateSelection();}catch(err){message(err.message||'Falha ao carregar vídeos.');}});
 $('videoCustomFile').addEventListener('change',()=>{if($('videoCustomFile').files?.length){$('videoAudio').checked=true;$('videoCustomEnabled').checked=true;message('Trilha selecionada: '+$('videoCustomFile').files[0].name);}});
 const previewAudio=new Audio();previewAudio.preload='none';previewAudio.volume=.48;
 $('reeecapPreviewSoundtrack').addEventListener('click',async()=>{const b=$('reeecapPreviewSoundtrack');if(!previewAudio.paused){previewAudio.pause();b.textContent='Ouvir trecho';return;}previewAudio.src=window.REEECAP_MUSIC5?.src(dialog.querySelector('input[name=reeecapSoundtrack]:checked')?.value)||'';try{await previewAudio.play();b.textContent='Pausar';}catch{message('Esta trilha não está disponível neste navegador.');}});
 dialog.addEventListener('close',()=>{previewAudio.pause();});
 dialog.querySelectorAll('input[name=reeecapSoundtrack]').forEach(r=>r.addEventListener('change',()=>{window.REEECAP_MUSIC5?.choose(r.value);previewAudio.pause();$('reeecapPreviewSoundtrack').textContent='Ouvir trecho';}));
 $('videoStorySelect').addEventListener('change',updateSelection);
 $('videoTheme').addEventListener('change',updateSelection);$('videoAccent').addEventListener('input',updateSelection);document.addEventListener('reeecap:clips',()=>{if(dialog?.open)updateSelection();});
 $('videoAll').addEventListener('click',()=>{dialog.querySelectorAll('.video-story-select input').forEach(x=>x.checked=true);updateSelection();});
 $('videoNone').addEventListener('click',()=>{dialog.querySelectorAll('.video-story-select input').forEach(x=>x.checked=false);updateSelection();});
 $('videoDialogClose').addEventListener('click',()=>{if(busy){abortCurrent?.();}else dialog.close();});
 $('videoStart').addEventListener('click',()=>{if(busy){abortCurrent?.();return;}record().catch(err=>{message(err?.message||'Falha ao gerar vídeo.');finish();});});
 $('videoShare').addEventListener('click',async()=>{if(shareFile&&navigator.share){try{await navigator.share({files:[shareFile],title:'REEECAP'});}catch(err){if(err?.name!=='AbortError')message(err?.message||'Não foi possível compartilhar.');}}});
 return dialog;
}
function message(msg){const item=$('videoComposerMsg');if(item)item.textContent=msg;const other=$('videoStatus');if(other)other.textContent=msg;}
function progress(p){p=Math.max(0,Math.min(100,Math.floor(p)));if($('videoProgressFill'))$('videoProgressFill').style.width=p+'%';const bar=dialog?.querySelector('.video-progress');if(bar)bar.setAttribute('aria-valuenow',String(p));}
function finish(){busy=false;abortCurrent=null;const b=$('videoStart');if(b){b.disabled=false;b.textContent=tr().go;}const old=$('downloadVideo');if(old)old.disabled=false;}
function chosenSlides(){const snapshot=window.REEECAP_VIDEO_SNAPSHOT?.();return (snapshot?.stories||[]).filter((_,i)=>$('videoStorySelect')?.querySelector(`input[data-index="${i}"]`)?.checked);}
function updateSelection(){const chosen=chosenSlides(),t=tr();$('videoSlideCount').textContent=`${chosen.length} / ${$('videoStorySelect').querySelectorAll('input').length} ${t.chosen}`;
 $('videoStart').disabled=!chosen.length||busy;
 const d=window.REEECAP_VIDEO_SNAPSHOT?.();if(!d?.stories?.length)return;
 const c=$('videoPreviewCanvas'),ctx=c.getContext('2d');if(ctx){const first=chosen[0]||d.stories[0];d.theme=$('videoTheme').value;d.accent=$('videoAccent').value;frame(ctx,d,first,.55,0,chosen.length||1,previewLogo,750);}
}
function show(){if(!window.REEECAP_VIDEO_SNAPSHOT?.()?.stories?.length){const el=$('videoStatus');if(el)el.textContent='Abra uma retrospectiva primeiro.';return;}ensureDialog();
 const t=tr();$('videoComposerTitle').textContent=t.title;$('videoComposerDesc').textContent=t.desc;$('videoQualityLabel').textContent=t.resolution;$('videoSpeedLabel').textContent=t.speed;$('videoAudioLabel').textContent=t.track;$('videoStart').textContent=t.go;$('videoShare').textContent=t.share;
 $('videoChooseLabel').textContent=t.select;$('videoAll').textContent=t.selectAll;$('videoNone').textContent=t.selectNone;
 $('videoCustomLabel').textContent=t.ownTrack;$('videoCustomNote').textContent=t.ownNote;$('videoVolumeLabel').textContent=t.volume;$('videoPreviewLabel').textContent=t.preview;
 $('videoThemeLabel').textContent=({pt:'Estilo visual',en:'Visual style',es:'Estilo visual'})[getLanguage()];$('videoAccentLabel').textContent=({pt:'Cor de destaque',en:'Accent color',es:'Color de acento'})[getLanguage()];
 const snap=window.REEECAP_VIDEO_SNAPSHOT();
 $('videoStorySelect').innerHTML=snap.stories.map((s,i)=>`<label class="video-story-option"><input type="checkbox" data-index="${i}" checked><span class="video-slide-no">${String(i+1).padStart(2,'0')}</span><span class="video-slide-name">${String(s.title||s.eyebrow||'Story').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}</span></label>`).join('');
 if(!previewLogo){previewLogo=new Image();previewLogo.src='./assets/reeecap-logo-3.png';previewLogo.onload=updateSelection;}
 updateSelection();if(window.REEECAP_MUSIC_FILE){$('videoAudio').checked=true;$('videoCustomEnabled').checked=true;$('videoCustomNote').textContent='Trilha escolhida no Story: '+window.REEECAP_MUSIC_FILE.name;}
 $('videoReelsStatus').textContent='12 clipes reais já incluídos no site. Nenhum upload necessário. Créditos: Vídeos e créditos.';$('videoDialogClose').setAttribute('aria-label',t.close);
 shareFile=null;$('videoShare').classList.remove('available');progress(0);
 message(mimeChoice($('videoAudio').checked)?.includes('webm')?t.fallback:'');dialog.showModal();
}
async function record(){const snapshot=window.REEECAP_VIDEO_SNAPSHOT?.();if(!snapshot?.stories?.length)return;
 snapshot.stories=chosenSlides();snapshot.theme=$('videoTheme').value;snapshot.accent=$('videoAccent').value;if(!snapshot.stories.length){message(tr().needOne);return;}
 if(snapshot.stories.some(s=>['likes','watched','reels'].includes(s.metricKey))){message('Carregando clipes reais do rolo de filme…');const clips=await window.REEECAP_MOTION.ensure();if(!clips){message('Os vídeos do pacote não puderam ser carregados. Confira se assets/videos foi publicado corretamente. Nenhum vídeo falso será exportado.');return;}}
 const type=mimeChoice($('videoAudio').checked);if(!type||!HTMLCanvasElement.prototype.captureStream){message(tr().unsupported);return;}
 busy=true;const button=$('videoStart');button.textContent=tr().cancel;const original=$('downloadVideo');if(original)original.disabled=true;
 const width=Number($('videoQuality').value)||720,quality=width===1080?1080:720,msPerSlide=Number($('videoSpeed').value)||2400,n=snapshot.stories.length;
 const times=snapshot.stories.map(s=>Math.round(msPerSlide*(s.kind==='days'?2.7:s.metricKey==='comments'?3.2:1)));
 const edges=[0];for(const time of times)edges.push(edges[edges.length-1]+time);const duration=edges[n];
 const canvas=document.createElement('canvas');canvas.width=quality;canvas.height=Math.round(quality*16/9);
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){message('Canvas indisponível.');finish();return;}
 const logo=new Image();logo.src='./assets/reeecap-logo-3.png';try{await Promise.race([logo.decode().catch(()=>{}),new Promise(r=>setTimeout(r,900))]);}catch{}
 // Do not silently export a muted video when the user explicitly selected their own soundtrack.
 const customEnabled=$('videoAudio').checked;
 const selectedAudio=customEnabled&&$('videoCustomEnabled').checked?($('videoCustomFile').files?.[0]||window.REEECAP_MUSIC_FILE):null;
 const builtInSrc=window.REEECAP_MUSIC5?.src(dialog.querySelector('input[name=reeecapSoundtrack]:checked')?.value)||'./assets/reeecap-original-loop.mp3';
 if(customEnabled&&!selectedAudio&&!builtInSrc){message('Trilha selecionada indisponível.');finish();return;}
 if(selectedAudio?.size>25*1024*1024){message(tr().trackTooLarge||'O áudio deve ter no máximo 25 MB.');finish();return;}
 const stream=canvas.captureStream(30);let audio=null,actx=null,cleaned=false,shouldSave=true,recorder=null,interval=null;
 function clean(){if(cleaned)return;cleaned=true;clearInterval(interval);audio?.pause();if(audio?.dataset.localUrl)URL.revokeObjectURL(audio.dataset.localUrl);stream.getTracks().forEach(t=>t.stop());actx?.close().catch(()=>{});finish();}
 abortCurrent=()=>{shouldSave=false;try{if(recorder?.state==='recording')recorder.stop();else clean();}catch{clean();}message('Gravação cancelada.');};
 if($('videoAudio').checked){try{
  actx=new (window.AudioContext||window.webkitAudioContext)();
  const custom=selectedAudio;
  const customUrl=custom?URL.createObjectURL(custom):null;
  audio=new Audio();audio.crossOrigin=customUrl?'':'anonymous';audio.src=customUrl||builtInSrc;audio.loop=true;audio.preload='auto';
  audio.volume=1;
  const from=actx.createMediaElementSource(audio),dest=actx.createMediaStreamDestination(),gain=actx.createGain();gain.gain.value=Math.max(0,Math.min(1,Number($('videoVolume').value)/100));
  from.connect(gain);gain.connect(dest);for(const track of dest.stream.getAudioTracks())stream.addTrack(track);
  audio.dataset.localUrl=customUrl||'';
  await actx.resume();await audio.play();
 }catch{message(getLanguage()==='en'?'Audio playback failed; no video was saved.':getLanguage()==='es'?'El audio no pudo reproducirse; no se guardó ningún vídeo.':'Não foi possível reproduzir a música. Nenhum vídeo foi salvo.');clean();return;}}
 const segments=[];
 try{recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:quality===1080?5300000:2600000});}catch(err){clean();throw err;}
 recorder.ondataavailable=e=>{if(e.data?.size)segments.push(e.data);};
 recorder.onerror=()=>{shouldSave=false;message('A gravação falhou neste dispositivo.');try{recorder.stop();}catch{clean();}};
 recorder.onstop=()=>{
  clean();if(!shouldSave)return;
  if(!segments.length){message('Nenhum dado de vídeo foi gerado.');return;}
  const mime=type.includes('mp4')?'video/mp4':'video/webm',ext=mime.includes('mp4')?'mp4':'webm';const blob=new Blob(segments,{type:mime});const file=new File([blob],`REEECAP-${snapshot.platform}-${snapshot.year}-${n}stories.${ext}`,{type:mime});shareFile=file;
  const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),45000);
  progress(100);message(`${tr().saved} ${ext.toUpperCase()} · ${(blob.size/1024/1024).toFixed(1)} MB`);
  if(navigator.canShare?.({files:[file]}))$('videoShare').classList.add('available');
 };
 const start=performance.now();frame(ctx,snapshot,snapshot.stories[0],0,0,n,logo,0);
 try{recorder.start(500);}catch(err){clean();throw err;}
 interval=setInterval(()=>{
  if(!recorder||recorder.state==='inactive')return;
  const passed=performance.now()-start;let idx=edges.findIndex((end,i)=>i>0&&passed<end)-1;if(idx<0)idx=n-1;const localMs=Math.max(0,passed-edges[idx]);const pct=Math.min(1,localMs/times[idx]);
  frame(ctx,snapshot,snapshot.stories[idx],pct,idx,n,logo,localMs);const percentage=Math.min(100,passed/duration*100);progress(percentage);
  if(Math.floor(percentage)%5===0)message(`${tr().progress} · ${Math.floor(percentage)}%`);
  if(passed>=duration){clearInterval(interval);try{recorder.stop();}catch{clean();}}
 },1000/30);
}
window.REEECAP_DRAW_STORY_FRAME=frame;
window.REEECAP_RECORD_VIDEO=show;
})();
