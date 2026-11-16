/* REEECAP — interface sem backend, cookies, contas ou analytics. MIT */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const fmt = v => new Intl.NumberFormat(document.documentElement.lang || 'pt-BR').format(v);
const html = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const opts = {
 instagram:{label:'Instagram',color:'#ff6b9e',url:'https://accountscenter.instagram.com/info_and_permissions/',
  steps:['No Instagram, abra Perfil → ☰ → Central de Contas → Suas informações e permissões → Exportar suas informações.', 'Escolha apenas curtidas, comentários, salvos, interações, seguidores/seguindo e publicações (se quiser). Evite mensagens, contatos, localização e fotos/vídeos.', 'Escolha JSON e todo o período. Baixe o ZIP quando o Instagram terminar de preparar a exportação.'],
  wanted:['Curtidas','Salvos','Comentários','Seguidores / seguindo','Interações em Stories'],optional:['Publicações e Reels','Histórico de vídeos (se oferecido)','Reposts e compartilhamentos (se oferecidos)','Pesquisas'],no:'Mensagens, contatos, informações de segurança, localização e mídias completas.'},
 tiktok:{label:'TikTok',color:'#85ffeb',url:'https://www.tiktok.com/setting/download-your-data',
  steps:['No TikTok, acesse Perfil → ☰ → Configurações e privacidade → Conta → Baixar seus dados.', 'Escolha as informações de atividade, incluindo histórico de visualizações, curtidas, favoritos, compartilhamentos e comentários, se disponíveis.', 'Selecione o formato JSON, solicite o arquivo e depois importe o ZIP pronto aqui.'],
  wanted:['Histórico de vídeos','Curtidas','Favoritos','Compartilhamentos'],optional:['Comentários','Publicações','Pesquisas'],no:'Conversas, compras, contatos, localização, dispositivos e outras configurações pessoais.'},
 youtube:{label:'YouTube',color:'#ff4d69',url:'https://takeout.google.com/',
  steps:['Abra o Google Takeout e desmarque todos os produtos.', 'Marque somente YouTube e YouTube Music ou Minha atividade → YouTube, se o histórico estiver nessa seção. Inclua histórico de vídeos e escolha JSON quando oferecido.', 'Crie a exportação e importe o ZIP. O REEECAP lê arquivos JSON de histórico de visualização e pesquisa.'],
  wanted:['Histórico de vídeos assistidos'],optional:['Histórico de pesquisas'],no:'Gmail, Google Fotos, contatos, localização e arquivos de vídeo.'},
 spotify:{label:'Spotify',color:'#a4f580',url:'https://www.spotify.com/account/privacy/',
  steps:['No site do Spotify, abra sua conta e vá em Privacidade → Baixar seus dados.', 'Solicite seu histórico de reprodução. Para todos os anos, prefira Histórico de streaming ampliado (Extended streaming history).', 'Quando receber os dados, importe o ZIP ou os JSONs. O site não precisa da sua senha nem de conectar a conta.'],
  wanted:['Histórico de streaming ampliado'],optional:['Histórico de streaming do último ano'],no:'Informações de pagamento, endereço, dados de suporte e registros técnicos.'}
};
let platform='instagram',current=null,year=null,stories=[],index=0,playing=false,tickId=null,elapsed=0,stepMs=7200,warning=[],backdropReady=false,backdropLayer=0,backdropTimer=null;
const metricInfo={likes:['♥','Curtidas','Interações registradas'],saved:['▣','Salvos / favoritos','Itens salvos registrados'],watched:['▷','Vídeos assistidos','Registros de visualização (não vídeos únicos)'],shares:['↗','Compartilhamentos','Ações de compartilhamento registradas'],comments:['✎','Comentários','Comentários registrados'],posts:['▧','Publicações','Publicações identificadas'],reels:['◉','Reels publicados','Reels identificados'],stories:['◌','Interações em Stories','Interações identificadas'],following:['＋','Contas seguidas','Registros de seguir'],followers:['◎','Novos seguidores','Registros de seguidores'],searches:['⌕','Pesquisas','Buscas registradas'],listens:['♫','Reproduções','Faixas ou episódios reproduzidos']};
function selectPlatform(next){
 if(!opts[next])return;platform=next;
 document.querySelectorAll('[data-platform]').forEach(el=>{el.classList.toggle('active',el.dataset.platform===next);el.setAttribute('aria-pressed',String(el.dataset.platform===next));});
 const o=opts[next];
 const steps=document.querySelectorAll('.step-card p');steps.forEach((el,i)=>el.textContent=o.steps[i]);
 $('exportPlatform').textContent=o.label;
 $('wantedList').innerHTML=o.wanted.map(x=>'<span>'+html(x)+'</span>').join('');
 $('optionalList').innerHTML=o.optional.map(x=>'<span>'+html(x)+'</span>').join('');
 $('notExport').textContent=o.no;
 $('exportLink').href=o.url;
 $('exportLink').textContent='Abrir exportação do '+o.label+' ↗';
 $('importPlatform').textContent=o.label;
 $('dropzone').setAttribute('aria-label','Importe seus dados de '+o.label);
 $('errorBox').classList.add('hidden');
}
function countForYear(type){return current.events.filter(e=>e.type===type&&new Date(e.time).getUTCFullYear()===Number(year)).length;}
function filteredEvents(){return current.events.filter(e=>e.time&&new Date(e.time).getUTCFullYear()===Number(year));}
function buildStats(){
 const events=filteredEvents();const counts={};for(const k of Object.keys(metricInfo))counts[k]=0;
 const months=Array(12).fill(0),hours=Array(24).fill(0),leaders=new Map();let ms=0,activeDays=new Set();
 for(const e of events){counts[e.type]=(counts[e.type]||0)+1;
  const d=new Date(e.time);if(!Number.isFinite(d.getTime()))continue;
  months[d.getUTCMonth()]++;hours[d.getUTCHours()]++;activeDays.add(e.time.slice(0,10));
  if(e.type==='listens')ms+=e.duration;
  if(e.label&&(['likes','saved','listens'].includes(e.type))){const key=e.type==='listens'?(e.meta||e.label):e.label;leaders.set(key,(leaders.get(key)||0)+1);}
 }
 const ordered=[...leaders].sort((a,b)=>b[1]-a[1]).slice(0,6);
 const busiest=months.indexOf(Math.max(...months));
 return {events,counts,months,hours,ordered,ms,activeDays:activeDays.size,busiest};
}
function activeTypes(){return Object.keys(metricInfo).filter(k=>current?.seen.includes(k));}
function buildStories(){
 const s=buildStats(),n=Number(year);stories=[{kind:'intro',eyebrow:'O SEU ANO EM RETROSPECTIVA',title:`${year}. Você viveu tudo isso.`,body:`Sua história digital no ${opts[platform].label}, contada pelas atividades encontradas no seu arquivo.`,symbol:'↶',color:['#422bcb','#d251b7']}];
 let sorted=activeTypes().filter(k=>s.counts[k]>0).sort((a,b)=>s.counts[b]-s.counts[a]);
 for(const key of sorted.slice(0,9)){
  const [symbol,title,description]=metricInfo[key];
  stories.push({kind:'number',eyebrow:title.toUpperCase(),value:fmt(s.counts[key]),title,body:description,symbol,color:key==='likes'?['#ff4f7b','#b225bc']:key==='watched'?['#f94b5f','#7f3bea']:key==='listens'?['#157a53','#6ac37b']:['#462fb1','#b442a7']});
 }
 if(s.events.length){stories.push({kind:'month',eyebrow:'SUA LINHA DO TEMPO',title:'O mês mais movimentado',value:new Date(Date.UTC(n,s.busiest,1)).toLocaleDateString('pt-BR',{month:'long',timeZone:'UTC'}),body:`${fmt(s.months[s.busiest])} ações registradas nesse mês.`,symbol:'◷',color:['#6d37cf','#d26183'],months:s.months});
 stories.push({kind:'days',eyebrow:'VOCÊ ESTEVE POR AQUI',title:`${fmt(s.activeDays)} dias`,body:'Dias diferentes com ao menos uma atividade registrada.',symbol:'✳',color:['#304d98','#ad5a8d']});}
 if(platform==='spotify'&&s.ms>0)stories.push({kind:'number',eyebrow:'TEMPO DE REPRODUÇÃO',title:'Você apertou o play.',value:fmt(Math.round(s.ms/3600000))+' h',body:'Horas somadas a partir dos tempos de reprodução disponibilizados no histórico.',symbol:'♫',color:['#236e51','#38996b']});
 stories.push({kind:'end',eyebrow:'FIM? SÓ DO ANO.',title:'Seu ano não cabia em um story.',body:'Compartilhe apenas as estatísticas que quiser. Seus arquivos continuam no seu aparelho.',symbol:'↶',color:['#462ba9','#ca327e']});
}
function storyHTML(s){
 const chart=s.months?'<div class="story-chart">'+s.months.map((v,i)=>'<span class="'+(v===Math.max(...s.months)?'hot':'')+'" style="height:'+Math.max(3,100*v/(Math.max(...s.months)||1))+'%"></span>').join('')+'</div>':'';
 return '<div class="story-content"><span class="story-burst" aria-hidden="true">'+html(s.symbol)+'</span><div class="story-eyebrow">'+html(s.eyebrow)+'</div>'+(s.value?'<h2 class="story-number">'+html(s.value)+'</h2>':'')+'<h2 class="story-headline">'+html(s.title)+'</h2><p class="story-body">'+html(s.body)+'</p>'+chart+'<span class="story-tag">'+(current?.demo?'DEMONSTRAÇÃO FICTÍCIA · ':'')+'REEECAP · '+html(year)+' · '+html(opts[platform].label)+'</span></div>';
}
function renderStory(){
 const s=stories[index];if(!s)return;
 $('storyVisual').innerHTML=storyHTML(s);
 const gradient=`radial-gradient(circle at 70% 21%, ${s.color[1]} 0%, transparent 58%),linear-gradient(143deg,${s.color[0]},${s.color[1]})`;
 const first=$('storyBackdrop'),second=$('storyBackdropNext');
 if(!backdropReady){first.style.background=gradient;first.style.opacity='1';second.style.opacity='0';backdropReady=true;backdropLayer=0;}
 else{
  const incoming=backdropLayer===0?second:first,outgoing=backdropLayer===0?first:second;
  clearTimeout(backdropTimer);incoming.style.transition='none';incoming.style.opacity='0';incoming.style.background=gradient;
  incoming.style.zIndex='1';outgoing.style.zIndex='0';void incoming.offsetWidth;incoming.style.transition='';
  requestAnimationFrame(()=>{incoming.style.opacity='1';});
  backdropTimer=setTimeout(()=>{outgoing.style.opacity='0';},730);backdropLayer=1-backdropLayer;
 }
 $('storyYear').textContent=year;
 $('storyCounter').textContent=String(index+1).padStart(2,'0')+' / '+String(stories.length).padStart(2,'0');
 $('storyProgress').innerHTML=stories.map((_,i)=>'<span><i style="width:'+(i<index?100:i===index?0:0)+'%"></i></span>').join('');
 elapsed=0;
}
function stopClock(){clearInterval(tickId);tickId=null;}
function startClock(){stopClock();playing=true;$('pauseStory').textContent='Ⅱ';tickId=setInterval(()=>{elapsed+=90;const bars=$('storyProgress').querySelectorAll('span i');if(bars[index])bars[index].style.width=Math.min(100,elapsed/stepMs*100)+'%';if(elapsed>=stepMs){if(index>=stories.length-1){playing=false;stopClock();$('pauseStory').textContent='▷';}else goStory(index+1);}},90);}
function goStory(i){index=Math.min(Math.max(i,0),stories.length-1);renderStory();if(playing)startClock();}
function openRecap(){if(!current)return;clearTimeout(backdropTimer);backdropReady=false;buildStories();index=0;renderStory();$('recapopOverlay').classList.remove('hidden');document.body.style.overflow='hidden';startClock();}
function closeRecap(){clearTimeout(backdropTimer);stopClock();playing=false;$('recapopOverlay').classList.add('hidden');document.body.style.overflow='';}
function makeCharts(s){
 const max=Math.max(1,...s.months);const names=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
 $('monthChart').innerHTML=s.months.map((v,i)=>'<div class="month-col"><strong>'+fmt(v)+'</strong><div class="month-bar" style="height:'+Math.max(2,v/max*170)+'px"></div><span>'+names[i]+'</span></div>').join('');
 const hmax=Math.max(1,...s.hours);$('hourChart').innerHTML=s.hours.map((v,i)=>'<div class="hour-cell" style="background:rgba(215,255,88,'+(0.08+0.86*v/hmax)+');color:'+(v/hmax>.45?'#180a25':'#ddd')+'" title="'+i+'h: '+v+' registros">'+i+'h</div>').join('');
 $('topAccounts').innerHTML=s.ordered.length?s.ordered.map(([name,v])=>'<div class="account-row"><span>'+html(name)+'</span><strong>'+fmt(v)+'</strong></div>').join(''):'<p class="coverage-note">Este arquivo não trouxe nomes ou artistas identificáveis para um ranking.</p>';
}
function renderDashboard(){
 const s=buildStats();
 $('dashboardYearLabel').textContent=year;
 $('coverageNote').textContent=`${current.demo?'DEMONSTRAÇÃO COM DADOS FICTÍCIOS. ':''}${fmt(s.events.length)} atividades datadas analisadas em ${year} · ${opts[platform].label}. Dados ausentes não são considerados zero. Horários exibidos em UTC. ${current.parseErrors?'Alguns arquivos não puderam ser interpretados.':''}`;
 const keys=activeTypes();
 $('dashboardMetrics').innerHTML=keys.length?keys.map(key=>{const [ico,name,desc]=metricInfo[key];const value=s.counts[key];return '<article class="metric-tile"><div class="metric-icon">'+ico+'</div><div class="metric-value">'+fmt(value)+'</div><div class="metric-name">'+html(name)+'</div><div class="metric-desc">'+html(desc)+'</div></article>';}).join(''):'<p>Nenhuma categoria compatível encontrada.</p>';
 $('dataCoverage').innerHTML=Object.keys(metricInfo).map(key=>'<div class="coverage-row"><span>'+html(metricInfo[key][1])+'</span>'+(current.seen.includes(key)?'<strong>Encontrado</strong>':'<em>Não encontrado no arquivo</em>')+'</div>').join('')+'<p class="coverage-note">Arquivos JSON analisados: '+current.scanned+' · Entradas ignoradas: '+current.skipped+' · Erros: '+current.parseErrors+'. Compartilhamentos em mensagens privadas não são lidos.</p>';
 makeCharts(s);
}
function openDashboard(){if(!current)return;closeRecap();renderDashboard();$('dashboardOverlay').classList.remove('hidden');document.body.style.overflow='hidden';}
function closeDashboard(){$('dashboardOverlay').classList.add('hidden');document.body.style.overflow='';}
function loadResult(data){
 current=data;const years=[...new Set(data.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].filter(y=>y>=2005&&y<=2100).sort((a,b)=>b-a);
 if(!years.length){error('Os registros encontrados não têm datas válidas para criar uma retrospectiva por ano.');return;}
 year=years.includes(new Date().getUTCFullYear())?new Date().getUTCFullYear():years[0];
 $('yearSelect').innerHTML=years.map(y=>'<option value="'+y+'">'+y+'</option>').join('');$('yearSelect').value=String(year);
 $('processing').classList.add('hidden');$('errorBox').classList.add('hidden');openRecap();
}
function error(message){$('processing').classList.add('hidden');$('errorBox').textContent=message;$('errorBox').classList.remove('hidden');}
function analyzeFiles(files){
 if(!files?.length)return;
 if(!window.Worker){error('Seu navegador não suporta processamento de arquivos em segundo plano.');return;}
 const w=new Worker('./worker.js');let completed=false;
 $('errorBox').classList.add('hidden');$('processing').classList.remove('hidden');$('processingFill').style.width='1%';$('processingTitle').textContent='Lendo seus dados de '+opts[platform].label+'...';$('processingDetail').textContent='Os arquivos estão sendo analisados neste aparelho.';
 w.onmessage=e=>{const v=e.data;
 if(v.kind==='progress'){$('processingFill').style.width=Math.round(4+95*v.current/Math.max(1,v.total))+'%';$('processingDetail').textContent=`Arquivo ${v.current+1} de ${v.total}: ${v.name.split('/').pop()}`;}
 if(v.kind==='warning')warning.push(v.message);
 if(v.kind==='error'){completed=true;error(v.message);w.terminate();}
 if(v.kind==='result'){completed=true;w.terminate();$('processingFill').style.width='100%';loadResult(v.data);}
 };
 w.onerror=ev=>{if(!completed){error('Erro ao processar o arquivo. Tente exportar somente as categorias de atividade.');w.terminate();}};
 w.postMessage({action:'analyze',platform,files:[...files]});
}
function demo(){
 const types=platform==='spotify'?['listens']:platform==='youtube'?['watched','searches']:platform==='tiktok'?['watched','likes','saved','shares','comments']:['likes','saved','comments','stories','following','posts'];
 const events=[],n=new Date().getUTCFullYear();for(let i=0;i<950;i++){
 const t=types[Math.floor(Math.abs(Math.sin(i*3.18)*types.length))%types.length];const day=1+i%27,month=i%12,hr=i%24;
 events.push({type:t,time:new Date(Date.UTC(n,month,day,hr,0,0)).toISOString(),label:t==='listens'?['Exemplo de artista','Outro artista'][i%2]:'',meta:'',duration:t==='listens'?200000:0});
 }
 loadResult({events,seen:types,scanned:0,skipped:0,parseErrors:0,platform,demo:true});
}
function cardPNG(){
 const data=stories[index],canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');
 const g=ctx.createLinearGradient(0,0,1080,1920);g.addColorStop(0,data.color[0]);g.addColorStop(1,data.color[1]);ctx.fillStyle=g;ctx.fillRect(0,0,1080,1920);
 ctx.strokeStyle='#ffffff38';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(300,510,460,680,-.35,0,Math.PI*2);ctx.stroke();
 const officialLogo=document.querySelector('.brand-logo');
 if(officialLogo?.complete && officialLogo.naturalWidth){ctx.drawImage(officialLogo,70,70,480,110);}
 else{ctx.save();ctx.fillStyle='#ffffff';ctx.font='900 70px Arial';ctx.fillText('REEECAP',75,145);ctx.restore();}
 if(current?.demo){ctx.save();ctx.fillStyle='#ffffff';ctx.font='bold 29px Arial';ctx.textAlign='right';ctx.fillText('DEMONSTRAÇÃO FICTÍCIA',1000,145);ctx.restore();}
 ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 65px Arial';ctx.fillText(data.eyebrow,540,660);
 ctx.font='bold 160px Arial';const chunks=String(data.value||'').match(/.{1,13}/g)||[];chunks.forEach((ch,i)=>ctx.fillText(ch,540,880+170*i));
 ctx.font='bold 72px Arial';const lines=wrapText(ctx,data.title,875);lines.forEach((line,i)=>ctx.fillText(line,540,1050+i*85));
 ctx.font='40px Arial';const desc=wrapText(ctx,data.body,890);desc.forEach((line,i)=>ctx.fillText(line,540,1360+i*57));
 ctx.font='bold 38px Arial';ctx.fillText(opts[platform].label+' · '+year,540,1765);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='reeecap-'+platform+'-'+year+'-'+(index+1)+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);},'image/png');
}
function wrapText(ctx,text,max){const words=String(text).split(/\s+/),out=[];let line='';for(const word of words){if(ctx.measureText((line+' '+word).trim()).width>max&&line){out.push(line);line=word;}else line=(line+' '+word).trim();}if(line)out.push(line);return out.slice(0,4);}
function exportSummary(){
 const s=buildStats(),lines=[`REEECAP — ${opts[platform].label} — ${year}`,'DADOS EXTRAÍDOS LOCALMENTE','',...activeTypes().map(k=>`${metricInfo[k][1]}: ${s.counts[k]}`),'',`${s.activeDays} dias com atividade registrada.`,'Categorias não encontradas não equivalem a zero.'];
 const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`reeecap-${platform}-${year}-resumo.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function newAnalysis(){closeDashboard();current=null;year=null;$('fileInput').value='';$('importar').scrollIntoView({behavior:'smooth'});}
function init(){
 document.querySelectorAll('[data-platform]').forEach(el=>el.addEventListener('click',()=>selectPlatform(el.dataset.platform)));
 selectPlatform('instagram');
 $('selectFiles').addEventListener('click',()=>$('fileInput').click());$('fileInput').addEventListener('change',e=>analyzeFiles(e.target.files));
 const zone=$('dropzone');zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');analyzeFiles(e.dataTransfer.files);});
 $('demoHero').addEventListener('click',demo);$('demoInline').addEventListener('click',demo);
 $('closeStory').addEventListener('click',closeRecap);$('nextStory').addEventListener('click',()=>goStory(index+1));$('prevStory').addEventListener('click',()=>goStory(index-1));
 $('pauseStory').addEventListener('click',()=>{if(playing){playing=false;stopClock();$('pauseStory').textContent='▷';}else startClock();});
 $('openDashboard').addEventListener('click',openDashboard);$('closeDashboard').addEventListener('click',closeDashboard);
 $('yearSelect').addEventListener('change',e=>{year=Number(e.target.value);renderDashboard();});$('recapopAgain').addEventListener('click',()=>{closeDashboard();openRecap();});
 $('downloadCard').addEventListener('click',cardPNG);$('downloadSummary').addEventListener('click',exportSummary);$('newAnalysis').addEventListener('click',newAnalysis);
 $('pixButton').addEventListener('click',()=>{const cfg=window.REEECAP_CONFIG||{};if(!cfg.pixKey){$('pixHint').textContent='A chave Pix ainda não foi cadastrada pelo criador do site.';return;}$('pixKeyText').textContent=cfg.pixKey;$('pixModal').classList.remove('hidden');});
 $('copyPix').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.REEECAP_CONFIG?.pixKey||'');$('copyPix').textContent='Copiado ✓';}catch{ $('copyPix').textContent='Selecione a chave acima para copiar';}});
 $('closePix').addEventListener('click',()=>$('pixModal').classList.add('hidden'));$('pixModal').addEventListener('click',e=>{if(e.target.id==='pixModal')$('pixModal').classList.add('hidden');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeRecap();closeDashboard();$('pixModal').classList.add('hidden');}if(!$('recapopOverlay').classList.contains('hidden')){if(e.key==='ArrowRight')goStory(index+1);if(e.key==='ArrowLeft')goStory(index-1);}});
 let sx=null;const shell=$('storyVisual');shell.addEventListener('touchstart',e=>{sx=e.touches[0]?.clientX??null;},{passive:true});shell.addEventListener('touchend',e=>{if(sx===null)return;const dx=(e.changedTouches[0]?.clientX??sx)-sx;if(Math.abs(dx)>65)goStory(index+(dx>0?-1:1));sx=null;},{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
