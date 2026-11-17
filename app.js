/* REEECAP — interface sem backend, cookies, contas ou analytics. MIT */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const fmt = v => new Intl.NumberFormat(document.documentElement.lang || 'pt-BR').format(v);
const html = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const language=()=>window.REEECAP_FULL_LOCALE?.get()||'pt';
const metric=(key)=>window.REEECAP_FULL_LOCALE?.metric(key)||metricInfo[key]?.slice(1)||[key,key];
const guide=(platform)=>window.REEECAP_FULL_LOCALE?.guide(platform)||opts[platform];
const l=(key,defaultText)=>window.REEECAP_FULL_LOCALE?.dynamic(key)||defaultText;
const dateLocale=()=>({pt:'pt-BR',en:'en-US',es:'es-ES'})[language()]||'pt-BR';
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
 facebook:{label:'Facebook',color:'#1877f2',url:'https://accountscenter.facebook.com/info_and_permissions/',
  steps:['No Facebook, acesse Configurações → Central de Contas → Suas informações e permissões → Exportar suas informações.', 'Selecione publicações, comentários e curtidas/reactions disponíveis. Escolha apenas as categorias necessárias; não selecione mensagens.', 'Selecione formato JSON, o período desejado e baixe o ZIP quando a Meta disponibilizar.'],
  wanted:['Publicações com datas','Comentários feitos','Curtidas e reações registradas'],optional:['Itens salvos, se incluídos'],no:'Mensagens, contatos, senhas, localização, compras e informações de segurança não são lidas.'},
 spotify:{label:'Spotify',color:'#1ed760',url:'https://www.spotify.com/account/privacy/',
  steps:['Entre na página de privacidade da sua conta Spotify pelo navegador.', 'Em Baixar seus dados, solicite Histórico de streaming ampliado (Extended Streaming History). O histórico básico também pode funcionar, mas cobre menos tempo.', 'Quando o Spotify enviar os arquivos, importe o ZIP ou os JSONs Streaming_History / StreamingHistory.'],
  wanted:['Histórico de reproduções','Duração de reprodução em milissegundos','Nome da faixa e artista (quando disponível)'],optional:['Episódios e podcasts'],no:'Pagamentos, e-mail, endereço, dispositivos, IP e dados de conta não são necessários.'},
 reddit:{label:'Reddit',color:'#ff5c2b',url:'https://www.reddit.com/settings/data-request',
  steps:['Entre em reddit.com/settings/data-request pelo navegador e solicite uma cópia dos dados da sua conta.', 'Escolha o intervalo de datas desejado, se estiver disponível. O Reddit pode enviar um ZIP com vários arquivos CSV.', 'Quando receber o link pela caixa de entrada do Reddit, baixe o ZIP e importe aqui. Não é preciso enviar mensagens privadas.'],
  wanted:['Publicações e comentários','Votos positivos e negativos','Posts e comentários salvos'],optional:['Comunidades seguidas'],no:'Mensagens privadas, bate-papos, informações de login, IP e localização. O REEECAP ignora essas categorias.'}
};
let overlayHistoryOpen=false;
const resultsByPlatform=new Map();
let platform='instagram',current=null,year=null,stories=[],index=0,playing=false,tickId=null,elapsed=0,stepMs=7200,warning=[],backdropReady=false,backdropLayer=0,backdropTimer=null;
const metricInfo={likes:['♥','Curtidas','Interações registradas'],saved:['▣','Salvos / favoritos','Itens salvos registrados'],watched:['▷','Vídeos assistidos','Registros de visualização (não vídeos únicos)'],shares:['↗','Compartilhamentos','Ações de compartilhamento registradas'],comments:['✎','Comentários','Comentários registrados'],posts:['▧','Posts no feed','Posts identificados no feed'],reels:['◉','Reels publicados','Reels identificados'],storyPosts:['◎','Stories publicados','Stories publicados identificados'],stories:['◎','Interações em Stories','Interações identificadas'],following:['＋','Contas seguidas','Registros de seguir'],followers:['◎','Novos seguidores','Registros de seguidores'],searches:['⌕','Pesquisas','Buscas registradas'],downvotes:['−','Votos negativos','Votos negativos encontrados'],listens:['♫','Reproduções musicais','Registros de reprodução de faixas (inclui reproduções parciais)'],podcasts:['◉','Episódios reproduzidos','Registros de episódios identificados'],minutes:['◷','Minutos de reprodução','Tempo acumulado de áudio encontrado no arquivo, não tempo de tela']};
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
 const o=opts[next],translated=guide(next);
 const steps=document.querySelectorAll('.step-card p');steps.forEach((el,i)=>el.textContent=translated.steps[i]);
 $('exportPlatform').textContent=o.label;
 $('wantedList').innerHTML=translated.wanted.map(x=>'<span>'+html(x)+'</span>').join('');
 $('optionalList').innerHTML=translated.optional.map(x=>'<span>'+html(x)+'</span>').join('');
 $('notExport').textContent=translated.no;
 $('formatAdvice').textContent=next==='reddit'?l('csvAdvice','Use o ZIP original com arquivos CSV. Escolha o período disponível.'):l('jsonAdvice','Formato: JSON, período: todo o período.');
 $('exportLink').href=o.url;
 $('exportLink').textContent=l('export','Abrir exportação do ')+o.label;
 $('importPlatform').textContent=o.label;
 $('dropzone').setAttribute('aria-label',l('import','Importe seus dados de ')+o.label);
 $('errorBox').classList.add('hidden');
}
function updateResume(){
 const available=resultsByPlatform.has(platform);
 const btn=$('resumeRecap');if(btn)btn.hidden=!available;
 const ready=$('readySection');if(ready)ready.hidden=!available;
 const name=$('readyPlatform');if(name)name.textContent=(opts[platform]?.label||'Rede social')+' · '+(year||l('ready','Retrospectiva'));
 document.body.dataset.resultReady=String(available);
}
function countForYear(type){return current.events.filter(e=>e.type===type&&new Date(e.time).getUTCFullYear()===Number(year)).length;}
function filteredEvents(){return current.events.filter(e=>e.time&&new Date(e.time).getUTCFullYear()===Number(year));}
function buildStats(){
 const events=filteredEvents();const counts={};for(const k of Object.keys(metricInfo))counts[k]=0;
 const months=Array(12).fill(0),hours=Array(24).fill(0),leaders=new Map();let ms=0,activeDays=new Set();
 for(const e of events){counts[e.type]=(counts[e.type]||0)+1;
  const d=new Date(e.time);if(!Number.isFinite(d.getTime()))continue;
  months[d.getUTCMonth()]++;hours[d.getUTCHours()]++;activeDays.add(e.time.slice(0,10));

  if(e.type==='listens'||e.type==='podcasts'){ms+=Math.max(0,Number(e.duration)||0);}
  if(e.meta&&e.type==='listens'){const key=e.meta;leaders.set(key,(leaders.get(key)||0)+1);}
  if(e.label&&(['likes','saved'].includes(e.type))){const key=e.label;leaders.set(key,(leaders.get(key)||0)+1);}
 }
 counts.minutes=Math.floor(ms/60000);
 const ordered=[...leaders].sort((a,b)=>b[1]-a[1]).slice(0,6);
 const busiest=months.indexOf(Math.max(...months));
 return {events,counts,months,hours,ordered,ms,activeDays:activeDays.size,busiest};
}
function activeTypes(){return Object.keys(metricInfo).filter(k=>current?.seen.includes(k));}
function platformPalette(){return {instagram:['#622cb5','#ee4c98'],tiktok:['#0d1929','#c32075'],youtube:['#8e143d','#e24544'],reddit:['#ac2808','#fa6332'],spotify:['#063e2f','#12a466'],facebook:['#102853','#1877f2']}[platform]||['#622cb5','#ee4c98'];}
function buildStories(){
 const texts={pt:{time:'SUA LINHA DO TEMPO',month:'O mês mais movimentado',day:'VOCÊ ESTEVE POR AQUI',dayNote:'Dias diferentes com ao menos uma atividade registrada.',ending:'FIM? SÓ DO ANO.',endTitle:'Seu ano não cabia em um story.',endDesc:'Compartilhe apenas as estatísticas que quiser. Seus arquivos continuam no seu aparelho.'},en:{time:'YOUR TIMELINE',month:'Your busiest month',day:'YOU WERE HERE',dayNote:'Different days with at least one recorded activity.',ending:'THE END? ONLY OF THE YEAR.',endTitle:'Your year was bigger than one Story.',endDesc:'Share only the stats you choose. Your files stay on your device.'},es:{time:'TU CRONOLOGÍA',month:'Tu mes más activo',day:'ESTUVISTE AQUÍ',dayNote:'Días diferentes con al menos una actividad registrada.',ending:'¿EL FIN? SOLO DEL AÑO.',endTitle:'Tu año no cabía en una historia.',endDesc:'Comparte solo las estadísticas que quieras. Tus archivos permanecen en tu dispositivo.'}}[language()]||{};
 const s=buildStats(),n=Number(year);const brandColors=platformPalette();stories=[{kind:'intro',eyebrow:`${opts[platform].label.toUpperCase()} / ${language()==='en'?'RECAP':language()==='es'?'RETROSPECTIVA':'RETROSPECTIVA'}`,title:language()==='en'?`What did ${year} leave behind?`:language()==='es'?`¿Qué dejó ${year}?`:`O que ficou de ${year}?`,body:language()==='en'?`These are the ${opts[platform].label} records found in your export.`:language()==='es'?`Estos son los registros de ${opts[platform].label} encontrados en tu exportación.`:`Estes são os registros de ${opts[platform].label} encontrados na sua exportação.`,symbol:'',color:brandColors}];
 let sorted=activeTypes().filter(k=>s.counts[k]>0).sort((a,b)=>s.counts[b]-s.counts[a]);
 for(const key of sorted.slice(0,9)){
  const [symbol]=metricInfo[key], [title,description]=metric(key);
  stories.push({kind:'number',eyebrow:title.toUpperCase(),value:fmt(s.counts[key]),title,body:description,symbol,color:brandColors,metricKey:key});
 }
 if(s.events.length){stories.push({kind:'month',eyebrow:texts.time,title:texts.month,value:new Date(Date.UTC(n,s.busiest,1)).toLocaleDateString(dateLocale(),{month:'long',timeZone:'UTC'}),body:language()==='pt'?`${fmt(s.months[s.busiest])} ações registradas nesse mês.`:`${fmt(s.months[s.busiest])} ${l('month','ações registradas nesse mês.')}`,symbol:'◷',color:brandColors,months:s.months});
 stories.push({kind:'days',eyebrow:texts.day,title:`${fmt(s.activeDays)} ${l('days','dias')}`,activeDays:s.activeDays,body:texts.dayNote,symbol:'✳',color:brandColors});}
 stories.push({kind:'end',eyebrow:texts.ending,title:texts.endTitle,body:texts.endDesc,symbol:'',color:brandColors});
}
function storyIcon(s){
 const icons={likes:'<path d="M20.8 4.6a5.6 5.6 0 0 0-7.9 0l-.9.9-.9-.9a5.6 5.6 0 0 0-7.9 7.9L12 21l8.8-8.5a5.6 5.6 0 0 0 0-7.9z"/>',watched:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',saved:'<path d="M5 3h14v18l-7-5-7 5z"/>',storyPosts:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/>',stories:'<circle cx="12" cy="12" r="9"/><path d="m12 6 0 6 4 2"/>',following:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-6 11-6 11 0M18 8v8M14 12h8"/>',followers:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-6 11-6 11 0M16 7l2 2 4-4"/>',comments:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.2a9 9 0 0 1-.9-4.3A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/>',reels:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M8 3l4 6M16 3l4 6"/><path d="m10 12 5 3-5 3z"/>',posts:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',shares:'<path d="m21 3-8.2 18-3.2-7-6.6-3.3L21 3z"/><path d="m9.6 14 11.4-11"/>',searches:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'};
 const key=s.metricKey||Object.keys(metricInfo).find(k=>metricInfo[k][1]===s.title||metric(k)[0]===s.title)||'';
 const body=icons[key]||'<circle cx="12" cy="12" r="9"/>';
 return '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
}
function storyAtmosphere(s,rolling){
 if(s.kind!=='number')return '';
 if(s.metricKey==='comments'&&rolling)return rolling;
 const icons={
  likes:'<path d="M12 20.2 4.4 12.8A5.3 5.3 0 0 1 12 5.3a5.3 5.3 0 0 1 7.6 7.5Z"/>',
  shares:'<path d="m2.3 11 19.2-8.5-6.4 19.1-4.2-8.1L2.3 11Z"/><path d="M10.9 13.5 21.5 2.5"/>',
  saved:'<path d="M5 3h14v18l-7-4.7L5 21V3Z"/>',
  watched:'<rect x="2" y="4" width="20" height="16" rx="4"/><path d="m10 9 6 3-6 3V9Z"/>',
  posts:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.6" r="1"/>',
  reels:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M8 3l4 6M16 3l4 6M10 12l6 3-6 3z"/>',
  stories:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M12 8v5l3 2"/>',
  followers:'<circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-7 13-7 13 0M15.5 10l2 2 4-4"/>',
  following:'<circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-7 13-7 13 0M18 6v10M13 11h10"/>',
  searches:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  comments:'<path d="M20 11.4a8 8 0 0 1-8 8 8.1 8.1 0 0 1-4-.9L3 21l1.9-5a8 8 0 0 1-.9-4.6 8 8 0 0 1 16 0Z"/>'
 };
 const key=s.metricKey||'';const shape=icons[key];if(!shape)return '';
 const symbol='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">'+shape+'</svg>';
 return '<div class="story-atmosphere atmosphere-'+key+'" aria-hidden="true">'+Array.from({length:['watched','posts','reels'].includes(key)?5:9},(_,i)=>'<span class="drift-'+i+'">'+symbol+'</span>').join('')+'</div>';
}
function storyHTML(s){
 const chart=s.months?'<div class="story-chart">'+s.months.map((v,i)=>'<span class="'+(v===Math.max(...s.months)?'hot':'')+'" style="height:'+Math.max(3,100*v/(Math.max(...s.months)||1))+'%"></span>').join('')+'</div>':'';
 const commentSnippets=s.metricKey==='comments'?filteredEvents().filter(e=>e.type==='comments'&&e.label).slice(0,30).map(e=>e.label.slice(0,250)):[];
 if(s.metricKey==='comments')s.comments=commentSnippets;
 const rolling=commentSnippets.length?'<div class="story-comment-roll" aria-hidden="true">'+commentSnippets.map(v=>'<span>'+html(v)+'</span>').join('')+'</div>':'';
 const shapes=window.REEECAP_MOTION?'':storyAtmosphere(s,rolling);
 const brandSrc=document.querySelector('.platform-card[data-platform="'+platform+'"] img')?.getAttribute('src')||'./assets/brands/'+platform+'.svg';
 const endSrc=document.querySelector('.story-logo img')?.getAttribute('src')||'./assets/reeecap-c-official.png';
 const ico=s.kind==='number'?storyIcon(s):s.kind==='intro'?'<img alt="" src="'+html(brandSrc)+'"/>':'<img alt="" src="'+html(endSrc)+'"/>';
 const coverMark=s.kind==='intro'?'<div class="story-cover-mark" aria-hidden="true"><img src="'+html(brandSrc)+'" alt=""/></div>':'';
 return '<div class="story-content kind-'+html(s.kind)+'">'+coverMark+shapes+'<div class="story-main"><div class="story-icon" aria-hidden="true">'+ico+'</div><div class="story-eyebrow">'+html(s.eyebrow)+'</div>'+(s.value?'<h2 class="story-number">'+html(s.value)+'</h2>':'')+'<h2 class="story-headline">'+html(s.title)+'</h2><p class="story-body">'+html(s.body)+'</p>'+chart+(s.kind==='days'?'<button type="button" id="calendarPeel" aria-label="Avançar calendário" title=""></button>':'')+(current?.demo?'<span class="demo-label">'+({pt:'Prévia de demonstração',en:'Demo preview',es:'Vista previa de demostración'}[language()])+'</span>':'')+'</div></div>';
}
function renderStory(){
 const s=stories[index];if(!s)return;calendarPeelBonus=0;
 // Camadas estáveis: o fundo precisa estar atrás do conteúdo, nunca por cima.
 // Corrige a tela magenta/roxa vazia que aparecia após o primeiro Story
 // em dispositivos móveis, especialmente durante a transição entre fundos.
 const shell=document.querySelector('.recapop-shell');
 if(shell){shell.style.zIndex='2';shell.style.backgroundColor='transparent';}
 window.REEECAP_INTRO?.stop();
 if(s.kind==='intro'&&['instagram','tiktok'].includes(platform)){
  window.REEECAP_MOTION?.stop?.();
  $('storyVisual').innerHTML='<canvas class="story-intro-canvas" id="storyIntroCanvas" width="720" height="1280" aria-hidden="true"></canvas>'+storyHTML(s);
  window.REEECAP_INTRO?.attach($('storyIntroCanvas'),s,()=>elapsed,platform,year);
 }else{
  $('storyVisual').innerHTML='<canvas class="story-motion-canvas" id="storyMotionCanvas" width="720" height="1280" aria-hidden="true"></canvas>'+storyHTML(s);
  window.REEECAP_MOTION?.attach($('storyMotionCanvas'),s,()=>elapsed+calendarPeelBonus);
 }
 if(['following','followers'].includes(s.metricKey)){const number=$('storyVisual').querySelector('.story-number'),target=Number(String(s.value||'').replace(/\D/g,''));if(number&&target>0){const at=performance.now(),originalIndex=index;const animate=()=>{if(index!==originalIndex||!number.isConnected)return;const x=Math.min(1,(performance.now()-at)/1550),e=1-Math.pow(1-x,4);number.textContent=fmt(Math.round(e*target));if(x<1)requestAnimationFrame(animate);};animate();}}
 $('addReelsBtn')?.classList.remove('is-visible'); // media source editing stays in Video Studio, not over Story controls
 if(s.kind==='days'){s.peelSteps=0;s.manualProgress=0;$('calendarPeel')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();s.peelSteps++;s.manualProgress=Math.min(1,(Math.pow(2,s.peelSteps)-1)/Math.max(1,s.activeDays));calendarPeelBonus=Math.round(s.manualProgress*9000);if(s.manualProgress>=.99)$('storyVisual')?.querySelector('.kind-days')?.classList.add('is-revealed');});}
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
 if(musicOn&&window.REEECAP_MUSIC5?.installed.includes(platform)&&ambientMusic.src.includes('reeecap-'+platform+'.mp3')){try{const point=window.REEECAP_MUSIC5.cue(index);if(Number.isFinite(point)&&point<ambientMusic.duration-1){ambientMusic.volume=.12;ambientMusic.currentTime=point;setTimeout(()=>{if(musicOn)ambientMusic.volume=.30},160);}}catch{}}
 $('storyCounter').textContent=(language()==='es'?'Historia ':'Story ')+(index+1)+(language()==='en'?' of ':' de ')+stories.length;
 $('storyProgress').innerHTML=stories.map((_,i)=>'<span><i style="width:'+(i<index?100:i===index?0:0)+'%"></i></span>').join('');
 elapsed=0;
}
let calendarPeelBonus=0;
function storyDuration(slide){return slide?.kind==='intro'&&['instagram','tiktok'].includes(platform)?10000:slide?.kind==='days'?10500:slide?.metricKey==='comments'?11500:stepMs;}
function stopClock(){clearInterval(tickId);tickId=null;}
const pauseSvg='<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
const playSvg='<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M8 4 20 12 8 20z"/></svg>';
function startClock(){stopClock();playing=true;$('pauseStory').innerHTML=pauseSvg;tickId=setInterval(()=>{elapsed+=90;const bars=$('storyProgress').querySelectorAll('span i');const duration=storyDuration(stories[index]);if(bars[index])bars[index].style.width=Math.min(100,elapsed/duration*100)+'%';if(stories[index]?.kind==='days'&&elapsed+calendarPeelBonus>=7600)$('storyVisual')?.querySelector('.kind-days')?.classList.add('is-revealed');if(elapsed>=duration){if(index>=stories.length-1){playing=false;stopClock();$('pauseStory').innerHTML=playSvg;}else goStory(index+1);}},90);}
function goStory(i){index=Math.min(Math.max(i,0),stories.length-1);calendarPeelBonus=0;renderStory();if(playing)startClock();}
function openRecap(){if(!current)return;clearTimeout(backdropTimer);backdropReady=false;buildStories();index=0;calendarPeelBonus=0;renderStory();$('recapopOverlay').classList.remove('hidden');document.body.style.overflow='hidden';if(!overlayHistoryOpen){try{history.pushState({reeecapOverlay:true},'',location.pathname+location.search+'#recap');overlayHistoryOpen=true;}catch{overlayHistoryOpen=false;}}startClock();
 if(!window.REEECAP_MUSIC_FILE&&['instagram','tiktok'].includes(platform)){
  const uri=window.REEECAP_MUSIC5?.src(platform);
  if(uri){ambientMusic.src=uri;ambientMusic.currentTime=0;
   ambientMusic.play().then(()=>{musicOn=true;const btn=$('musicToggle');btn?.setAttribute('aria-pressed','true');btn?.classList.add('sound-on');}).catch(()=>{musicOn=false;const btn=$('musicToggle');btn?.setAttribute('aria-pressed','false');btn?.classList.remove('sound-on');});}
 }
}
function closeRecap(){window.REEECAP_INTRO?.stop?.();window.REEECAP_MOTION?.stop?.();window.REEECAP_MOTION?.pause?.();ambientMusic.pause();musicOn=false;const m=$('musicToggle');if(m){m.setAttribute('aria-pressed','false');m.classList.remove('sound-on');}clearTimeout(backdropTimer);stopClock();playing=false;$('recapopOverlay').classList.add('hidden');document.body.style.overflow='';if(current?.demo&&resultsByPlatform.has(platform)){current=resultsByPlatform.get(platform);const years=[...new Set(current.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].sort((a,b)=>b-a);year=years[0]||new Date().getUTCFullYear();}updateResume();if(overlayHistoryOpen){overlayHistoryOpen=false;if(history.state?.reeecapOverlay)history.back();}}
function makeCharts(s){
 const max=Math.max(1,...s.months);const names=Array.from({length:12},(_,i)=>new Date(Date.UTC(2026,i,1)).toLocaleDateString(dateLocale(),{month:'short',timeZone:'UTC'}).replace('.',''));
 $('monthChart').innerHTML=s.months.map((v,i)=>'<div class="month-col"><strong>'+fmt(v)+'</strong><div class="month-bar" style="height:'+Math.max(2,v/max*170)+'px"></div><span>'+names[i]+'</span></div>').join('');
 const hmax=Math.max(1,...s.hours);$('hourChart').innerHTML=s.hours.map((v,i)=>'<div class="hour-cell" style="background:rgba(215,255,88,'+(0.08+0.86*v/hmax)+');color:'+(v/hmax>.45?'#180a25':'#ddd')+'" title="'+i+'h: '+v+' registros">'+i+'h</div>').join('');
 $('topAccounts').innerHTML=s.ordered.length?s.ordered.map(([name,v])=>'<div class="account-row"><span>'+html(name)+'</span><strong>'+fmt(v)+'</strong></div>').join(''):'<p class="coverage-note">'+html(l('noAccounts','Este arquivo não trouxe nomes ou artistas identificáveis para um ranking.'))+'</p>';
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
 const term=$('commentsSearch').value.toLocaleLowerCase(dateLocale()).trim();
 const match=term?all.filter(e=>e.label.toLocaleLowerCase(dateLocale()).includes(term)):all;
 $('commentsTotal').textContent=fmt(match.length)+(language()==='en'?' of ':' de ')+fmt(all.length);
 $('commentsList').innerHTML=match.slice(0,visibleComments).map(e=>'<div class="comment-record"><time>'+html(new Date(e.time).toLocaleDateString(dateLocale(),{timeZone:'UTC'}))+'</time><p>'+html(e.label)+'</p></div>').join('')||'<p>'+html(l('noComments','Nenhum comentário corresponde à pesquisa.'))+'</p>';
 $('moreComments').hidden=visibleComments>=match.length;
}
function downloadComments(){
 const rows=getComments();if(!rows.length)return;
 const text=rows.map(e=>new Date(e.time).toLocaleDateString(dateLocale(),{timeZone:'UTC'})+' | '+e.label.replace(/\s+/g,' ')).join('\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='reeecap-comentarios-'+platform+'-'+year+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}

function renderDashboard(){
 const s=buildStats();
 const topHeading=$('topAccounts')?.closest('article')?.querySelector('h3');
 if(topHeading)topHeading.textContent=platform==='spotify'?({pt:'Artistas mais reproduzidos',en:'Most-played artists',es:'Artistas más escuchados'})[language()]:({pt:'Contas com que você mais interagiu',en:'Accounts you interacted with the most',es:'Cuentas con las que más interactuaste'})[language()];
 $('dashboardYearLabel').textContent=year;
 const undated=current.undatedCounts||{};const undatedText=Object.entries(undated).filter(([,n])=>n>0).map(([k,n])=>(metricInfo[k]?metric(k)[0]:k)+': '+fmt(n)).join(' · ');
 $('coverageNote').textContent=`${current.demo?l('demo','DEMONSTRAÇÃO COM DADOS FICTÍCIOS. '):''}${fmt(s.events.length)} ${l('dated','atividades com data em ')}${year} · ${opts[platform].label}. ${undatedText?l('undated','Registros SEM data, não atribuídos a ')+year+': '+undatedText+'. ':''}${l('noZero','Dados ausentes não são considerados zero. Horários em UTC.')} ${current.parseErrors?l('errors','Alguns arquivos não puderam ser interpretados.'):''}`;
 const keys=activeTypes();
 $('dashboardMetrics').innerHTML=keys.length?keys.map(key=>{const [ico]=metricInfo[key], [name,desc]=metric(key);const value=s.counts[key];const untimed=undated[key]||0;return '<article class="metric-tile"><div class="metric-icon">'+storyIcon({metricKey:key,title:name})+'</div><div class="metric-value">'+(untimed&&!value?'—':fmt(value))+'</div><div class="metric-name">'+html(name)+'</div><div class="metric-desc">'+(untimed?l('undated','Sem data')+': '+fmt(untimed)+l('count',' registros. '):'')+html(desc)+'</div></article>';}).join(''):'<p>Nenhuma categoria compatível encontrada.</p>';
 const possibleByPlatform={instagram:['likes','saved','comments','posts','reels','storyPosts','stories','following','followers','searches','shares','watched'],tiktok:['watched','likes','saved','shares','comments','posts','following','followers','searches'],youtube:['watched','searches','posts','comments','likes'],reddit:['posts','comments','likes','saved','downvotes','following'],facebook:['posts','comments','likes','saved'],spotify:['listens','podcasts','minutes']};
 $('dataCoverage').innerHTML=(possibleByPlatform[platform]||[]).map(key=>'<div class="coverage-row"><span>'+html(metric(key)[0])+'</span>'+(current.seen.includes(key)?'<strong>'+l('seen','Encontrado')+'</strong>':'<em>'+l('notSeen','Não encontrado no arquivo')+'</em>')+'</div>').join('')+'<p class="coverage-note">'+l('dataScanned','Arquivos JSON analisados: ')+current.scanned+l('ignored',' · Entradas ignoradas: ')+current.skipped+l('errorCount',' · Erros: ')+current.parseErrors+'.'+l('private',' Compartilhamentos em mensagens privadas não são lidos.')+'</p>';
 makeCharts(s);
 renderComments();
}
function openDashboard(){if(!current)return;closeRecap();renderDashboard();$('dashboardOverlay').classList.remove('hidden');document.body.style.overflow='hidden';}
function closeDashboard(){$('dashboardOverlay').classList.add('hidden');document.body.style.overflow='';}
function loadResult(data){
 if(!data||!opts[data.platform]){error(l('errorUnknown','O arquivo não pôde ser identificado.'));return;}
 if(data.platform!==platform)selectPlatform(data.platform);
 current=data;if(!data.demo)resultsByPlatform.set(platform,data);updateResume();const years=[...new Set(data.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].filter(y=>y>=2005&&y<=2100).sort((a,b)=>b-a);
 if(!years.length){year=new Date().getUTCFullYear();$('yearSelect').innerHTML='<option>'+year+'</option>';$('processing').classList.add('hidden');$('errorBox').classList.add('hidden');openDashboard();return;}
 year=years.includes(new Date().getUTCFullYear())?new Date().getUTCFullYear():years[0];
 $('yearSelect').innerHTML=years.map(y=>'<option value="'+y+'">'+y+'</option>').join('');$('yearSelect').value=String(year);
 $('processing').classList.add('hidden');$('errorBox').classList.add('hidden');updateResume();openRecap();
}
function error(message){$('processing').classList.add('hidden');$('errorBox').textContent=message;$('errorBox').classList.remove('hidden');}
function analyzeFiles(files){
 if(!files?.length)return;
 if(!window.Worker){error(l('workerUnsupported','Seu navegador não suporta processamento de arquivos em segundo plano.'));return;}
 const requestedPlatform=platform;const w=new Worker('./worker.js');let completed=false;warning=[];
 $('errorBox').classList.add('hidden');$('processing').classList.remove('hidden');$('processingFill').style.width='1%';$('processingTitle').textContent=l('read','Lendo seus dados de ')+opts[platform].label+'...';$('processingDetail').textContent=l('local','Os arquivos estão sendo analisados neste aparelho.');
 w.onmessage=e=>{const v=e.data;
 if(v.kind==='progress'){$('processingFill').style.width=Math.round(4+95*v.current/Math.max(1,v.total))+'%';$('processingDetail').textContent=`${language()==='en'?'File':language()==='es'?'Archivo':'Arquivo'} ${v.current+1} ${language()==='en'?'of':'de'} ${v.total}: ${v.name.split('/').pop()}`;}
 if(v.kind==='warning')warning.push(v.message);
 if(v.kind==='error'){completed=true;error(v.message);w.terminate();}
 if(v.kind==='result'){completed=true;w.terminate();$('processingFill').style.width='100%';if(requestedPlatform!==platform){resultsByPlatform.set(requestedPlatform,v.data);error(l('readyAnalysis','A análise da outra rede terminou. Selecione ')+opts[requestedPlatform].label+l('readyView',' para ver seus dados.'));}else loadResult(v.data);}
 };
 w.onerror=ev=>{if(!completed){error(l('processError','Erro ao processar o arquivo. Tente exportar somente as categorias de atividade.'));w.terminate();}};
 w.postMessage({action:'analyze',platform,files:[...files]});
}
function demo(fromHome=false){
 // A prévia da home acompanha a rede que ela mostra; no estúdio usa a rede escolhida.
 if(fromHome && opts[document.body.dataset.theme])selectPlatform(document.body.dataset.theme);
 const types=platform==='spotify'?['listens','podcasts']:platform==='facebook'?['posts','comments','likes','saved']:platform==='reddit'?['posts','comments','likes','saved','downvotes']:platform==='youtube'?['watched','searches']:platform==='tiktok'?['watched','likes','saved','shares','comments']:['likes','saved','comments','stories','following','posts'];
 const events=[],n=new Date().getUTCFullYear();for(let i=0;i<950;i++){
 const t=types[Math.floor(Math.abs(Math.sin(i*3.18)*types.length))%types.length];const day=1+i%27,month=i%12,hr=i%24;
 events.push({type:t,time:new Date(Date.UTC(n,month,day,hr,0,0)).toISOString(),label:t==='listens'?['Exemplo de artista','Outro artista'][i%2]:'',meta:'',duration:t==='listens'?200000:0});
 }
 loadResult({events,seen:types,scanned:0,skipped:0,parseErrors:0,platform,demo:true});
}
async function cardPNG(){
 if(!current||!stories[index])return;
 if(['likes','watched','reels'].includes(stories[index].metricKey)){
  const clips=await window.REEECAP_MOTION?.ensure();
  if(!clips){error('Os vídeos reais de fundo não carregaram. Verifique se a pasta assets/videos foi publicada junto ao site.');return;}
 }
 // One art pipeline for preview/video/PNG. Avoid divergent image exports with unstyled metrics.
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
 const ctx=canvas.getContext('2d',{alpha:false}),snap=window.REEECAP_VIDEO_SNAPSHOT?.();
 if(!ctx||!snap?.stories?.[index]||typeof window.REEECAP_DRAW_STORY_FRAME!=='function'){
  error(l('imageError','Não foi possível preparar a imagem neste navegador.'));return;
 }
 const logo=document.querySelector('.brand-logo');
 window.REEECAP_DRAW_STORY_FRAME(ctx,snap,snap.stories[index],.99,index,snap.stories.length,logo,2000);
 canvas.toBlob(blob=>{if(!blob){error(l('imageError','Não foi possível salvar a imagem.'));return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`reeecap-${platform}-${year}-${index+1}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);},'image/png');
}
function wrapText(ctx,text,max){const words=String(text).split(/\s+/),out=[];let line='';for(const word of words){if(ctx.measureText((line+' '+word).trim()).width>max&&line){out.push(line);line=word;}else line=(line+' '+word).trim();}if(line)out.push(line);return out.slice(0,4);}
function exportSummary(){
 const s=buildStats(),lines=[`REEECAP — ${opts[platform].label} — ${year}`,language()==='pt'?'DADOS EXTRAÍDOS LOCALMENTE':language()==='en'?'DATA ANALYZED LOCALLY':'DATOS ANALIZADOS LOCALMENTE','',...activeTypes().map(k=>`${metric(k)[0]}: ${s.counts[k]}`),'',`${s.activeDays} ${{pt:'dias com atividade registrada.',en:'days with recorded activity.',es:'días con actividad registrada.'}[language()]}`,language()==='pt'?'Categorias não encontradas não equivalem a zero.':language()==='en'?'Categories missing from the export do not count as zero.':'Las categorías ausentes no equivalen a cero.'];
 const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`reeecap-${platform}-${year}-resumo.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportStudioSnapshot(){
 if(!current||!Number.isFinite(Number(year)))return;
 const stats=buildStats(),out={schema:'reeecap-studio-v1',platform,year:Number(year),demo:!!current.demo,
  metrics:Object.fromEntries(activeTypes().map(key=>[key,Math.max(0,Number(stats.counts[key])||0)])),
  activeDays:stats.activeDays,months:stats.months};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
 a.download=`reeecap-studio-${platform}-${year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);
}
function newAnalysis(){
 closeDashboard();resultsByPlatform.delete(platform);current=null;year=null;updateResume();
 $('fileInput').value='';document.getElementById('importar')?.scrollIntoView({behavior:'smooth'});
}

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

window.REEECAP_VIDEO_SNAPSHOT=()=>({platform,year,stories:stories.map(s=>({kind:s.kind,metricKey:s.metricKey||null,title:s.title,value:s.value||'',body:s.body,eyebrow:s.eyebrow,color:s.color,activeDays:s.activeDays||0,comments:s.metricKey==='comments'?(s.comments||getComments().map(e=>e.label).slice(0,30)):undefined})),demo:!!current?.demo});
let musicOn=false;
const ambientMusic=new Audio();ambientMusic.loop=true;ambientMusic.volume=.30;ambientMusic.preload='none';let localTrackUrl=null;
function setLocalTrack(file){if(!file||!file.type.startsWith('audio/')&&!/\.(mp3|wav|m4a|ogg)$/i.test(file.name))return; if(localTrackUrl)URL.revokeObjectURL(localTrackUrl);localTrackUrl=URL.createObjectURL(file);ambientMusic.src=localTrackUrl;window.REEECAP_MUSIC_FILE=file;musicOn=true;const b=$('musicToggle');if(b){b.classList.add('sound-on');b.setAttribute('aria-pressed','true');b.title=file.name;}ambientMusic.play().catch(()=>{musicOn=false;b?.setAttribute('aria-pressed','false');});}
window.REEECAP_SET_BUILTIN_MUSIC=(url)=>{if(localTrackUrl){URL.revokeObjectURL(localTrackUrl);localTrackUrl=null;}ambientMusic.pause();ambientMusic.src=url;window.REEECAP_MUSIC_FILE=null;if(musicOn)ambientMusic.play().catch(()=>{});};
function toggleMusic(){musicOn=!musicOn;const b=$('musicToggle');if(b){b.setAttribute('aria-pressed',String(musicOn));b.setAttribute('aria-label',musicOn?'Desativar música':'Ativar música');b.classList.toggle('sound-on',musicOn);}if(musicOn){const uri=window.REEECAP_MUSIC_FILE?localTrackUrl:window.REEECAP_MUSIC5?.src(window.REEECAP_MUSIC5.forPlatform(platform));if(!uri){musicOn=false;if(b){b.setAttribute('aria-pressed','false');b.title='Trilha ainda não instalada';}return;}if(ambientMusic.src!==new URL(uri,document.baseURI).href)ambientMusic.src=uri;ambientMusic.play().catch(()=>{musicOn=false;if(b)b.setAttribute('aria-pressed','false');});}else ambientMusic.pause();}
function init(){
 document.addEventListener('reeecap:locale',()=>{selectPlatform(platform);if(current){const n=index;buildStories();index=Math.min(n,stories.length-1);if(!$('recapopOverlay').classList.contains('hidden'))renderStory();if(!$('dashboardOverlay').classList.contains('hidden'))renderDashboard();} });
 window.addEventListener('popstate',()=>{if(overlayHistoryOpen){overlayHistoryOpen=false;closeRecap();}});
 document.querySelectorAll('[data-platform]').forEach(el=>el.addEventListener('click',()=>selectPlatform(el.dataset.platform)));
 selectPlatform('instagram');
 $('resumeRecap')?.addEventListener('click',()=>{current=resultsByPlatform.get(platform)||null;if(!current)return;const yrs=[...new Set(current.events.filter(e=>e.time).map(e=>new Date(e.time).getUTCFullYear()))].sort((a,b)=>b-a);year=yrs[0]||new Date().getUTCFullYear();$('yearSelect').innerHTML=(yrs.length?yrs:[year]).map(y=>'<option value="'+y+'">'+y+'</option>').join('');if(yrs.length)openRecap();else openDashboard();});
 $('selectFiles').addEventListener('click',()=>$('fileInput').click());$('fileInput').addEventListener('change',e=>analyzeFiles(e.target.files));
 const zone=$('dropzone');zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');analyzeFiles(e.dataTransfer.files);});
 $('demoHero').addEventListener('click',()=>demo(true));$('demoInline').addEventListener('click',()=>demo(false));
 $('backStory').addEventListener('click',()=>{ if(index>0)goStory(index-1); else closeRecap(); });
 $('closeStory').addEventListener('click',closeRecap);$('nextStory').addEventListener('click',()=>goStory(index+1));$('prevStory').addEventListener('click',()=>goStory(index-1));
 $('musicToggle')?.addEventListener('click',toggleMusic);
 $('reeecapMusicPicker')?.addEventListener('change',e=>setLocalTrack(e.target.files?.[0]));
 $('addReelsBtn')?.addEventListener('click',()=>$('reeecapReelPicker')?.click());
 $('reeecapReelPicker')?.addEventListener('change',async e=>{try{await window.REEECAP_MOTION.load(e.target.files);$('addReelsBtn').textContent='✓ Reels adicionados';}catch(err){error(err.message||'Falha ao ler os vídeos.');}});
 $('pauseStory').addEventListener('click',()=>{if(playing){playing=false;stopClock();$('pauseStory').innerHTML=playSvg;}else startClock();});
 setupStoryHold();
 $('openDashboard').addEventListener('click',openDashboard);$('closeDashboard').addEventListener('click',closeDashboard);
 $('commentsSearch')?.addEventListener('input',()=>{visibleComments=50;renderComments();});
 $('moreComments')?.addEventListener('click',()=>{visibleComments+=50;renderComments();});
 $('downloadComments')?.addEventListener('click',downloadComments);
 $('yearSelect').addEventListener('change',e=>{year=Number(e.target.value);visibleComments=50;renderDashboard();});$('recapopAgain').addEventListener('click',()=>{closeDashboard();openRecap();});
 $('playSavedRecap')?.addEventListener('click',()=>{current=resultsByPlatform.get(platform)||null;if(current)openRecap();});
 $('readyViewStats')?.addEventListener('click',()=>{current=resultsByPlatform.get(platform)||null;if(current)openDashboard();});
 $('readyNewZip')?.addEventListener('click',newAnalysis);
 $('downloadVideo')?.addEventListener('click',()=>window.REEECAP_RECORD_VIDEO?.());
 $('exportStudioJson')?.addEventListener('click',exportStudioSnapshot);
 $('downloadCard').addEventListener('click',cardPNG);$('downloadSummary').addEventListener('click',exportSummary);$('newAnalysis').addEventListener('click',newAnalysis);
 $('pixButton').addEventListener('click',()=>{const url=window.REEECAP_CONFIG?.supportUrls?.pix; if(typeof url==='string'&&/^https:\/\//i.test(url)&&!url.includes('example.com')){window.open(url,'_blank','noopener,noreferrer');return;} $('pixHint').textContent='Apoio por Pix ainda não está ativado. Volte depois da configuração de pagamento.';});
 $('copyPix').addEventListener('click',()=>{$('copyPix').textContent='Apoio pelo intermediador de pagamento';});
 $('closePix').addEventListener('click',()=>$('pixModal').classList.add('hidden'));$('pixModal').addEventListener('click',e=>{if(e.target.id==='pixModal')$('pixModal').classList.add('hidden');});
 document.addEventListener('keydown',e=>{
 const active=!$('recapopOverlay').classList.contains('hidden');
 if(active && (e.code==='Space'||e.key===' ')){
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable)return;
  e.preventDefault();e.stopPropagation();
  if(!e.repeat){if(playing){playing=false;stopClock();$('pauseStory').innerHTML=playSvg;}else startClock();}
  return;
 }
 if(e.key==='Escape'){closeRecap();closeDashboard();$('pixModal').classList.add('hidden');}
 if(active){if(e.key==='ArrowRight'){e.preventDefault();goStory(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();goStory(index-1);}}
},true);
 document.addEventListener('keyup',e=>{if(!$('recapopOverlay').classList.contains('hidden')&&(e.code==='Space'||e.key===' ')){e.preventDefault();e.stopPropagation();}},true);

 let sx=null;const shell=$('storyVisual');shell.addEventListener('touchstart',e=>{sx=e.touches[0]?.clientX??null;},{passive:true});shell.addEventListener('touchend',e=>{if(sx===null)return;const dx=(e.changedTouches[0]?.clientX??sx)-sx;if(Math.abs(dx)>65)goStory(index+(dx>0?-1:1));sx=null;},{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
