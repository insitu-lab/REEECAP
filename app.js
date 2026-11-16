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
 reddit:{label:'Reddit',color:'#ff5c2b',url:'https://www.reddit.com/settings/data-request',
  steps:['Entre em reddit.com/settings/data-request pelo navegador e solicite uma cópia dos dados da sua conta.', 'Escolha o intervalo de datas desejado, se estiver disponível. O Reddit pode enviar um ZIP com vários arquivos CSV.', 'Quando receber o link pela caixa de entrada do Reddit, baixe o ZIP e importe aqui. Não é preciso enviar mensagens privadas.'],
  wanted:['Publicações e comentários','Votos positivos e negativos','Posts e comentários salvos'],optional:['Comunidades seguidas'],no:'Mensagens privadas, bate-papos, informações de login, IP e localização. O REEECAP ignora essas categorias.'}
};
let overlayHistoryOpen=false;
const resultsByPlatform=new Map();
let platform='instagram',current=null,year=null,stories=[],index=0,playing=false,tickId=null,elapsed=0,stepMs=7200,warning=[],backdropReady=false,backdropLayer=0,backdropTimer=null;
const metricInfo={likes:['♥','Curtidas','Interações registradas'],saved:['▣','Salvos / favoritos','Itens salvos registrados'],watched:['▷','Vídeos assistidos','Registros de visualização (não vídeos únicos)'],shares:['↗','Compartilhamentos','Ações de compartilhamento registradas'],comments:['✎','Comentários','Comentários registrados'],posts:['▧','Posts no feed','Posts identificados no feed'],reels:['◉','Reels publicados','Reels identificados'],storyPosts:['◎','Stories publicados','Stories publicados identificados'],stories:['◎','Interações em Stories','Interações identificadas'],following:['＋','Contas seguidas','Registros de seguir'],followers:['◎','Novos seguidores','Registros de seguidores'],searches:['⌕','Pesquisas','Buscas registradas'],downvotes:['−','Votos negativos','Votos negativos encontrados']};
function selectPlatform(next){
 if(!opts[next])return;
 const changed=platform!==next;platform=next;
 if(changed){
  current=resultsByPlatform.get(next)||null;year=null;
  if(current){const ys=[...new Set(current.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].sort((a,b)=>b-a);year=ys[0]||new Date().getUTCFullYear();
   $('yearSelect').innerHTML=(ys.length?ys:[year]).map(y=>'<option value="'+y+'">'+y+'</option>').join('');$('yearSelect').value=String(year);}
  document.getElementById('errorBox')?.classList.add('hidden');
 }
 updateResume();

 document.querySelectorAll('[data-platform]').forEach(el=>{el.classList.toggle('active',el.dataset.platform===next);el.setAttribute('aria-pressed',String(el.dataset.platform===next));});
 const o=opts[next];
 const steps=document.querySelectorAll('.step-card p');steps.forEach((el,i)=>el.textContent=o.steps[i]);
 $('exportPlatform').textContent=o.label;
 $('wantedList').innerHTML=o.wanted.map(x=>'<span>'+html(x)+'</span>').join('');
 $('optionalList').innerHTML=o.optional.map(x=>'<span>'+html(x)+'</span>').join('');
 $('notExport').textContent=o.no;
 $('formatAdvice').textContent=next==='reddit'?'Use o ZIP original com arquivos CSV. Escolha o período disponível.':'Formato: JSON, período: todo o período.';
 $('exportLink').href=o.url;
 $('exportLink').textContent='Abrir exportação do '+o.label;
 $('importPlatform').textContent=o.label;
 $('dropzone').setAttribute('aria-label','Importe seus dados de '+o.label);
 $('errorBox').classList.add('hidden');
}
function updateResume(){const btn=$('resumeRecap');if(btn)btn.hidden=!resultsByPlatform.has(platform);}
function countForYear(type){return current.events.filter(e=>e.type===type&&new Date(e.time).getUTCFullYear()===Number(year)).length;}
function filteredEvents(){return current.events.filter(e=>e.time&&new Date(e.time).getUTCFullYear()===Number(year));}
function buildStats(){
 const events=filteredEvents();const counts={};for(const k of Object.keys(metricInfo))counts[k]=0;
 const months=Array(12).fill(0),hours=Array(24).fill(0),leaders=new Map();let ms=0,activeDays=new Set();
 for(const e of events){counts[e.type]=(counts[e.type]||0)+1;
  const d=new Date(e.time);if(!Number.isFinite(d.getTime()))continue;
  months[d.getUTCMonth()]++;hours[d.getUTCHours()]++;activeDays.add(e.time.slice(0,10));

  if(e.label&&(['likes','saved'].includes(e.type))){const key=e.label;leaders.set(key,(leaders.get(key)||0)+1);}
 }
 const ordered=[...leaders].sort((a,b)=>b[1]-a[1]).slice(0,6);
 const busiest=months.indexOf(Math.max(...months));
 return {events,counts,months,hours,ordered,ms,activeDays:activeDays.size,busiest};
}
function activeTypes(){return Object.keys(metricInfo).filter(k=>current?.seen.includes(k));}
function platformPalette(){return {instagram:['#622cb5','#ee4c98'],tiktok:['#0d1929','#c32075'],youtube:['#8e143d','#e24544'],reddit:['#ac2808','#fa6332']}[platform]||['#622cb5','#ee4c98'];}
function buildStories(){
 const s=buildStats(),n=Number(year);const brandColors=platformPalette();stories=[{kind:'intro',eyebrow:`${opts[platform].label.toUpperCase()} / RETROSPECTIVA`,title:`O que ficou de ${year}?`,body:`Estes são os registros de ${opts[platform].label} encontrados na sua exportação.`,symbol:'',color:brandColors}];
 let sorted=activeTypes().filter(k=>s.counts[k]>0).sort((a,b)=>s.counts[b]-s.counts[a]);
 for(const key of sorted.slice(0,9)){
  const [symbol,title,description]=metricInfo[key];
  stories.push({kind:'number',eyebrow:title.toUpperCase(),value:fmt(s.counts[key]),title,body:description,symbol,color:brandColors});
 }
 if(s.events.length){stories.push({kind:'month',eyebrow:'SUA LINHA DO TEMPO',title:'O mês mais movimentado',value:new Date(Date.UTC(n,s.busiest,1)).toLocaleDateString('pt-BR',{month:'long',timeZone:'UTC'}),body:`${fmt(s.months[s.busiest])} ações registradas nesse mês.`,symbol:'◷',color:brandColors,months:s.months});
 stories.push({kind:'days',eyebrow:'VOCÊ ESTEVE POR AQUI',title:`${fmt(s.activeDays)} dias`,body:'Dias diferentes com ao menos uma atividade registrada.',symbol:'✳',color:brandColors});}
 stories.push({kind:'end',eyebrow:'FIM? SÓ DO ANO.',title:'Seu ano não cabia em um story.',body:'Compartilhe apenas as estatísticas que quiser. Seus arquivos continuam no seu aparelho.',symbol:'',color:brandColors});
}
function storyIcon(s){
 const icons={likes:'<path d="M20.8 4.6a5.6 5.6 0 0 0-7.9 0l-.9.9-.9-.9a5.6 5.6 0 0 0-7.9 7.9L12 21l8.8-8.5a5.6 5.6 0 0 0 0-7.9z"/>',watched:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',saved:'<path d="M5 3h14v18l-7-5-7 5z"/>',comments:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.2a9 9 0 0 1-.9-4.3A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/>',reels:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M8 3l4 6M16 3l4 6"/><path d="m10 12 5 3-5 3z"/>',posts:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',shares:'<path d="M4 18c0-6 4-9 13-9m-5-5 5 5-5 5"/>',searches:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'};
 const key=Object.keys(metricInfo).find(k=>metricInfo[k][1]===s.title)||'';
 const body=icons[key]||'<circle cx="12" cy="12" r="9"/>';
 return '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
}
function storyHTML(s){
 const chart=s.months?'<div class="story-chart">'+s.months.map((v,i)=>'<span class="'+(v===Math.max(...s.months)?'hot':'')+'" style="height:'+Math.max(3,100*v/(Math.max(...s.months)||1))+'%"></span>').join('')+'</div>':'';
 const shapes=s.kind==='number'?'<div class="ambient-posts" aria-hidden="true"><span></span><span></span><span></span></div>':'';
 const brandSrc=document.querySelector('.platform-card[data-platform="'+platform+'"] img')?.getAttribute('src')||'./assets/brands/'+platform+'.svg';
 const endSrc=document.querySelector('.story-logo img')?.getAttribute('src')||'./assets/reeecap-c-official.png';
 const ico=s.kind==='number'?storyIcon(s):s.kind==='intro'?'<img alt="" src="'+html(brandSrc)+'"/>':'<img alt="" src="'+html(endSrc)+'"/>';
 const coverMark=s.kind==='intro'?'<div class="story-cover-mark" aria-hidden="true"><img src="'+html(brandSrc)+'" alt=""/></div>':'';
 return '<div class="story-content kind-'+html(s.kind)+'">'+coverMark+shapes+'<div class="story-main"><div class="story-icon" aria-hidden="true">'+ico+'</div><div class="story-eyebrow">'+html(s.eyebrow)+'</div>'+(s.value?'<h2 class="story-number">'+html(s.value)+'</h2>':'')+'<h2 class="story-headline">'+html(s.title)+'</h2><p class="story-body">'+html(s.body)+'</p>'+chart+(current?.demo?'<span class="demo-label">Prévia de demonstração</span>':'')+'</div></div>';
}
function renderStory(){
 const s=stories[index];if(!s)return;
 // Camadas estáveis: o fundo precisa estar atrás do conteúdo, nunca por cima.
 // Corrige a tela magenta/roxa vazia que aparecia após o primeiro Story
 // em dispositivos móveis, especialmente durante a transição entre fundos.
 const shell=document.querySelector('.recapop-shell');
 if(shell){shell.style.zIndex='2';shell.style.backgroundColor='transparent';}
 $('storyVisual').innerHTML=storyHTML(s);
 // Símbolos do recap não devem parecer um indicador de carregamento infinito.
 const burst=$('storyVisual').querySelector('.story-burst');
 if(burst)burst.style.animation='none';
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
 $('storyCounter').textContent='Story '+(index+1)+' de '+stories.length;
 $('storyProgress').innerHTML=stories.map((_,i)=>'<span><i style="width:'+(i<index?100:i===index?0:0)+'%"></i></span>').join('');
 elapsed=0;
}
function stopClock(){clearInterval(tickId);tickId=null;}
const pauseSvg='<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
const playSvg='<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M8 4 20 12 8 20z"/></svg>';
function startClock(){stopClock();playing=true;$('pauseStory').innerHTML=pauseSvg;tickId=setInterval(()=>{elapsed+=90;const bars=$('storyProgress').querySelectorAll('span i');if(bars[index])bars[index].style.width=Math.min(100,elapsed/stepMs*100)+'%';if(elapsed>=stepMs){if(index>=stories.length-1){playing=false;stopClock();$('pauseStory').innerHTML=playSvg;}else goStory(index+1);}},90);}
function goStory(i){index=Math.min(Math.max(i,0),stories.length-1);renderStory();if(playing)startClock();}
function openRecap(){if(!current)return;clearTimeout(backdropTimer);backdropReady=false;buildStories();index=0;renderStory();$('recapopOverlay').classList.remove('hidden');document.body.style.overflow='hidden';if(!overlayHistoryOpen){history.pushState({reeecapOverlay:true},'',location.pathname+location.search+'#recap');overlayHistoryOpen=true;}startClock();}
function closeRecap(){clearTimeout(backdropTimer);stopClock();playing=false;$('recapopOverlay').classList.add('hidden');document.body.style.overflow='';if(current?.demo&&resultsByPlatform.has(platform)){current=resultsByPlatform.get(platform);const years=[...new Set(current.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].sort((a,b)=>b-a);year=years[0]||new Date().getUTCFullYear();}updateResume();if(overlayHistoryOpen){overlayHistoryOpen=false;if(history.state?.reeecapOverlay)history.back();}}
function makeCharts(s){
 const max=Math.max(1,...s.months);const names=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
 $('monthChart').innerHTML=s.months.map((v,i)=>'<div class="month-col"><strong>'+fmt(v)+'</strong><div class="month-bar" style="height:'+Math.max(2,v/max*170)+'px"></div><span>'+names[i]+'</span></div>').join('');
 const hmax=Math.max(1,...s.hours);$('hourChart').innerHTML=s.hours.map((v,i)=>'<div class="hour-cell" style="background:rgba(215,255,88,'+(0.08+0.86*v/hmax)+');color:'+(v/hmax>.45?'#180a25':'#ddd')+'" title="'+i+'h: '+v+' registros">'+i+'h</div>').join('');
 $('topAccounts').innerHTML=s.ordered.length?s.ordered.map(([name,v])=>'<div class="account-row"><span>'+html(name)+'</span><strong>'+fmt(v)+'</strong></div>').join(''):'<p class="coverage-note">Este arquivo não trouxe nomes ou artistas identificáveis para um ranking.</p>';
}

let visibleComments=50;
function getComments(){
 if(!current)return [];
 return current.events.filter(e=>e.type==='comments'&&e.time&&new Date(e.time).getUTCFullYear()===Number(year)&&e.label?.trim()).sort((a,b)=>String(b.time).localeCompare(String(a.time)));
}
function renderComments(){
 const panel=$('commentsPanel');if(!panel)return;
 const all=getComments();panel.hidden=!all.length;
 if(!all.length)return;
 const term=$('commentsSearch').value.toLocaleLowerCase('pt-BR').trim();
 const match=term?all.filter(e=>e.label.toLocaleLowerCase('pt-BR').includes(term)):all;
 $('commentsTotal').textContent=fmt(match.length)+' de '+fmt(all.length);
 $('commentsList').innerHTML=match.slice(0,visibleComments).map(e=>'<div class="comment-record"><time>'+html(new Date(e.time).toLocaleDateString('pt-BR',{timeZone:'UTC'}))+'</time><p>'+html(e.label)+'</p></div>').join('')||'<p>Nenhum comentário corresponde à pesquisa.</p>';
 $('moreComments').hidden=visibleComments>=match.length;
}
function downloadComments(){
 const rows=getComments();if(!rows.length)return;
 const text=rows.map(e=>new Date(e.time).toLocaleDateString('pt-BR',{timeZone:'UTC'})+' | '+e.label.replace(/\s+/g,' ')).join('\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='reeecap-comentarios-'+platform+'-'+year+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}

function renderDashboard(){
 const s=buildStats();
 $('dashboardYearLabel').textContent=year;
 const undated=current.undatedCounts||{};const undatedText=Object.entries(undated).filter(([,n])=>n>0).map(([k,n])=>(metricInfo[k]?.[1]||k)+': '+fmt(n)).join(' · ');
 $('coverageNote').textContent=`${current.demo?'DEMONSTRAÇÃO COM DADOS FICTÍCIOS. ':''}${fmt(s.events.length)} atividades com data em ${year} · ${opts[platform].label}. ${undatedText?'Registros SEM data, não atribuídos a '+year+': '+undatedText+'. ':''}Dados ausentes não são considerados zero. Horários em UTC. ${current.parseErrors?'Alguns arquivos não puderam ser interpretados.':''}`;
 const keys=activeTypes();
 $('dashboardMetrics').innerHTML=keys.length?keys.map(key=>{const [ico,name,desc]=metricInfo[key];const value=s.counts[key];const untimed=undated[key]||0;return '<article class="metric-tile"><div class="metric-icon">'+ico+'</div><div class="metric-value">'+(untimed&&!value?'—':fmt(value))+'</div><div class="metric-name">'+html(name)+'</div><div class="metric-desc">'+(untimed?'Sem data: '+fmt(untimed)+' registros. ':'')+html(desc)+'</div></article>';}).join(''):'<p>Nenhuma categoria compatível encontrada.</p>';
 $('dataCoverage').innerHTML=Object.keys(metricInfo).map(key=>'<div class="coverage-row"><span>'+html(metricInfo[key][1])+'</span>'+(current.seen.includes(key)?'<strong>Encontrado</strong>':'<em>Não encontrado no arquivo</em>')+'</div>').join('')+'<p class="coverage-note">Arquivos JSON analisados: '+current.scanned+' · Entradas ignoradas: '+current.skipped+' · Erros: '+current.parseErrors+'. Compartilhamentos em mensagens privadas não são lidos.</p>';
 makeCharts(s);
 renderComments();
}
function openDashboard(){if(!current)return;closeRecap();renderDashboard();$('dashboardOverlay').classList.remove('hidden');document.body.style.overflow='hidden';}
function closeDashboard(){$('dashboardOverlay').classList.add('hidden');document.body.style.overflow='';}
function loadResult(data){
 if(!data||data.platform!==platform){error('O arquivo analisado não corresponde à rede selecionada.');return;}
 current=data;if(!data.demo)resultsByPlatform.set(platform,data);updateResume();const years=[...new Set(data.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].filter(y=>y>=2005&&y<=2100).sort((a,b)=>b-a);
 if(!years.length){year=new Date().getUTCFullYear();$('yearSelect').innerHTML='<option>'+year+'</option>';$('processing').classList.add('hidden');$('errorBox').classList.add('hidden');openDashboard();return;}
 year=years.includes(new Date().getUTCFullYear())?new Date().getUTCFullYear():years[0];
 $('yearSelect').innerHTML=years.map(y=>'<option value="'+y+'">'+y+'</option>').join('');$('yearSelect').value=String(year);
 $('processing').classList.add('hidden');$('errorBox').classList.add('hidden');openRecap();
}
function error(message){$('processing').classList.add('hidden');$('errorBox').textContent=message;$('errorBox').classList.remove('hidden');}
function analyzeFiles(files){
 if(!files?.length)return;
 if(!window.Worker){error('Seu navegador não suporta processamento de arquivos em segundo plano.');return;}
 const requestedPlatform=platform;const w=new Worker('./worker.js');let completed=false;
 $('errorBox').classList.add('hidden');$('processing').classList.remove('hidden');$('processingFill').style.width='1%';$('processingTitle').textContent='Lendo seus dados de '+opts[platform].label+'...';$('processingDetail').textContent='Os arquivos estão sendo analisados neste aparelho.';
 w.onmessage=e=>{const v=e.data;
 if(v.kind==='progress'){$('processingFill').style.width=Math.round(4+95*v.current/Math.max(1,v.total))+'%';$('processingDetail').textContent=`Arquivo ${v.current+1} de ${v.total}: ${v.name.split('/').pop()}`;}
 if(v.kind==='warning')warning.push(v.message);
 if(v.kind==='error'){completed=true;error(v.message);w.terminate();}
 if(v.kind==='result'){completed=true;w.terminate();$('processingFill').style.width='100%';if(requestedPlatform!==platform){resultsByPlatform.set(requestedPlatform,v.data);error('A análise da outra rede terminou. Selecione '+opts[requestedPlatform].label+' para ver seus dados.');}else loadResult(v.data);}
 };
 w.onerror=ev=>{if(!completed){error('Erro ao processar o arquivo. Tente exportar somente as categorias de atividade.');w.terminate();}};
 w.postMessage({action:'analyze',platform,files:[...files]});
}
function demo(){
 const displayPlatform=document.body.dataset.theme;
 if(opts[displayPlatform]&&displayPlatform!==platform)selectPlatform(displayPlatform);
 const types=platform==='reddit'?['posts','comments','likes','saved','downvotes']:platform==='youtube'?['watched','searches']:platform==='tiktok'?['watched','likes','saved','shares','comments']:['likes','saved','comments','stories','following','posts'];
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
function newAnalysis(){closeDashboard();resultsByPlatform.delete(platform);current=null;year=null;updateResume();$('fileInput').value='';document.getElementById('importar')?.scrollIntoView({behavior:'smooth'});}

function setupStoryHold(){
 let holdTimer=null,wasPlaying=false,isHeld=false;
 for(const id of ['prevStory','nextStory']){
  const btn=$(id);if(!btn)continue;
  btn.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse')return;
   wasPlaying=playing;isHeld=false;
   holdTimer=setTimeout(()=>{isHeld=true;if(playing)stopClock();},190);
  });
  for(const type of ['pointerup','pointercancel','pointerleave'])btn.addEventListener(type,()=>{
   clearTimeout(holdTimer);
   if(isHeld){btn.dataset.preventTap='1';if(wasPlaying&&playing)startClock();isHeld=false;}
  });
  btn.addEventListener('click',e=>{if(btn.dataset.preventTap==='1'){e.stopImmediatePropagation();btn.dataset.preventTap='';}},true);
 }
}

function init(){
 window.addEventListener('popstate',()=>{if(overlayHistoryOpen){overlayHistoryOpen=false;closeRecap();}});
 document.querySelectorAll('[data-platform]').forEach(el=>el.addEventListener('click',()=>selectPlatform(el.dataset.platform)));
 selectPlatform('instagram');
 $('resumeRecap')?.addEventListener('click',()=>{current=resultsByPlatform.get(platform)||null;if(!current)return;const yrs=[...new Set(current.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].sort((a,b)=>b-a);year=yrs[0]||new Date().getUTCFullYear();$('yearSelect').innerHTML=(yrs.length?yrs:[year]).map(y=>'<option value="'+y+'">'+y+'</option>').join('');if(yrs.length)openRecap();else openDashboard();});
 $('selectFiles').addEventListener('click',()=>$('fileInput').click());$('fileInput').addEventListener('change',e=>analyzeFiles(e.target.files));
 const zone=$('dropzone');zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');analyzeFiles(e.dataTransfer.files);});
 $('demoHero').addEventListener('click',demo);$('demoInline').addEventListener('click',demo);
 $('backStory').addEventListener('click',()=>{ if(index>0)goStory(index-1); else closeRecap(); });
 $('closeStory').addEventListener('click',closeRecap);$('nextStory').addEventListener('click',()=>goStory(index+1));$('prevStory').addEventListener('click',()=>goStory(index-1));
 $('pauseStory').addEventListener('click',()=>{if(playing){playing=false;stopClock();$('pauseStory').innerHTML=playSvg;}else startClock();});
 setupStoryHold();
 $('openDashboard').addEventListener('click',openDashboard);$('closeDashboard').addEventListener('click',closeDashboard);
 $('commentsSearch')?.addEventListener('input',()=>{visibleComments=50;renderComments();});
 $('moreComments')?.addEventListener('click',()=>{visibleComments+=50;renderComments();});
 $('downloadComments')?.addEventListener('click',downloadComments);
 $('yearSelect').addEventListener('change',e=>{year=Number(e.target.value);visibleComments=50;renderDashboard();});$('recapopAgain').addEventListener('click',()=>{closeDashboard();openRecap();});
 $('downloadCard').addEventListener('click',cardPNG);$('downloadSummary').addEventListener('click',exportSummary);$('newAnalysis').addEventListener('click',newAnalysis);
 $('pixButton').addEventListener('click',()=>{const cfg=window.REEECAP_CONFIG||{};if(!cfg.pixKey){$('pixHint').textContent='A chave Pix ainda não foi cadastrada pelo criador do site.';return;}$('pixKeyText').textContent=cfg.pixKey;$('pixModal').classList.remove('hidden');});
 $('copyPix').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.REEECAP_CONFIG?.pixKey||'');$('copyPix').textContent='Copiado ✓';}catch{ $('copyPix').textContent='Selecione a chave acima para copiar';}});
 $('closePix').addEventListener('click',()=>$('pixModal').classList.add('hidden'));$('pixModal').addEventListener('click',e=>{if(e.target.id==='pixModal')$('pixModal').classList.add('hidden');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeRecap();closeDashboard();$('pixModal').classList.add('hidden');}if(!$('recapopOverlay').classList.contains('hidden')){if(e.key==='ArrowRight')goStory(index+1);if(e.key==='ArrowLeft')goStory(index-1);}});
 let sx=null;const shell=$('storyVisual');shell.addEventListener('touchstart',e=>{sx=e.touches[0]?.clientX??null;},{passive:true});shell.addEventListener('touchend',e=>{if(sx===null)return;const dx=(e.changedTouches[0]?.clientX??sx)-sx;if(Math.abs(dx)>65)goStory(index+(dx>0?-1:1));sx=null;},{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
