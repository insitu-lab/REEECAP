/* REEECAP 5 — required tutorial, large centered modal, full-screen backdrop.
 * No storage of user data; completion exists only in this page session.
 * Real screenshots are packaged at deployment; never masquerade a diagram as a screenshot. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const labels={pt:{title:'Veja como baixar seus dados',number:'PASSO',next:'Próximo passo',done:'Entendi, continuar',back:'Voltar',source:'Abrir página oficial',hint:'Imagem de referência. Os menus podem variar de acordo com a versão do aplicativo.',drawing:'Guia visual (ilustrativo)',image:'Captura real do aplicativo',warning:'Para continuar, veja os três passos do tutorial.',replay:'Rever tutorial completo'},en:{title:'How to export your data',number:'STEP',next:'Next step',done:'I understand, continue',back:'Back',source:'Open official settings',hint:'Reference image. App menus may differ by version.',drawing:'Visual guide (illustration)',image:'Real application screenshot',warning:'View all three tutorial steps before continuing.',replay:'Review full tutorial'},es:{title:'Cómo exportar tus datos',number:'PASO',next:'Siguiente paso',done:'Entendido, continuar',back:'Atrás',source:'Abrir ajustes oficiales',hint:'Imagen de referencia. Los menús pueden variar.',drawing:'Guía visual (ilustración)',image:'Captura real de la aplicación',warning:'Revisa los tres pasos antes de continuar.',replay:'Ver tutorial de nuevo'}};
const configs={
 instagram:{name:'Instagram',url:'https://accountscenter.instagram.com/info_and_permissions/',steps:[['Perfil → ☰','Abra o Instagram, entre no seu perfil e toque no menu.'],['Central de Contas','Entre em Suas informações e permissões → Exportar suas informações.'],['JSON + atividades','Escolha somente as atividades para a retrospectiva, selecione JSON e baixe o ZIP.']]},
 tiktok:{name:'TikTok',url:'https://www.tiktok.com/setting/download-your-data',steps:[['Perfil → ☰','Abra Configurações e privacidade → Conta.'],['Baixar seus dados','Escolha a opção de exportar os dados da sua conta.'],['JSON + histórico','Selecione JSON e as atividades disponíveis; solicite o download e importe o ZIP.']]},
 youtube:{name:'YouTube',url:'https://takeout.google.com/',steps:[['Google Takeout','Abra o Takeout e desmarque todos os serviços.'],['Selecione YouTube','Marque YouTube e, se disponível, Minha atividade → YouTube.'],['Exportação','Escolha o histórico e JSON quando disponível; faça o download do ZIP.']]},
 reddit:{name:'Reddit',url:'https://www.reddit.com/settings/data-request',steps:[['Solicitar dados','Entre em reddit.com/settings/data-request com sua conta.'],['Período','Escolha o intervalo de datas disponível e solicite o arquivo.'],['Baixar ZIP','Baixe o ZIP enviado pelo Reddit; os CSVs ficam dentro dele.']]},
 facebook:{name:'Facebook',url:'https://accountscenter.facebook.com/info_and_permissions/',steps:[['Menu → Configurações','Abra as configurações do Facebook no celular.'],['Central de Contas','Acesse Suas informações e permissões → Exportar suas informações.'],['JSON + atividades','Selecione publicações, comentários e reações. Exclua mensagens e baixe o ZIP.']]},
 spotify:{name:'Spotify',url:'https://www.spotify.com/account/privacy/',steps:[['Conta Spotify','Abra a página Privacidade da conta no navegador.'],['Baixar seus dados','Solicite o histórico de reprodução ampliado, se disponível.'],['JSON / ZIP','Aguarde o e-mail do Spotify e importe o histórico de streaming recebido.']]}
};
const sources={instagram:[['https://images.wondershare.com/drfone/article/2026/05/how-to-find-deleted-instagram-post-10.jpg','https://drfone.wondershare.com/app-recovery/how-to-find-deleted-instagram-post.html'],['https://www.multcloud.com/screenshot/en/others-1/instagram/choose-all-available-information.png','https://www.multcloud.com/explore/what-is-included-in-instagram-data-download-0121-ac.html']],tiktok:[['https://storage.ghost.io/c/fb/a8/fba8736e-797b-43bb-bcba-040fb8dcfebb/content/images/size/w600/2025/01/TikTok-Account-Settings.png','https://www.kapwing.com/resources/how-to-download-all-tiktok-videos-and-data-in-one-individually/'],['https://storage.ghost.io/c/fb/a8/fba8736e-797b-43bb-bcba-040fb8dcfebb/content/images/size/w1600/2025/01/TikTok-Data-Request-Configuration.png','https://www.kapwing.com/resources/how-to-download-all-tiktok-videos-and-data-in-one-individually/']],youtube:[['https://resource.gbyte.com/20250821/large/google-takeout-exporte-video-youtube.webp','https://www.gbyte.com/fr/blog/recuperer-videos-youtube']],facebook:[]};
let dialog,platform='instagram',step=0,approved=new Set(),gateOn=false;
const lang=()=>{let l=document.documentElement.lang.slice(0,2);return labels[l]?l:'pt'};
const tr=()=>labels[lang()];
function make(){dialog=document.createElement('dialog');dialog.id='reeecapTutorial';dialog.className='reeecap-tutorial';dialog.setAttribute('aria-labelledby','tutorialTitle');
 dialog.innerHTML='<div class="tutorial-frame"><header class="tutorial-top"><div class="tutorial-brand">REEECAP <span>GUIDE</span></div></header><div class="tutorial-head"><p id="tutorialEyebrow"></p><h2 id="tutorialTitle"></h2><p id="tutorialDescription"></p></div><div class="tutorial-visual" id="tutorialVisual"></div><div class="tutorial-bottom"><div class="tutorial-progress" id="tutorialProgress" aria-label="Progresso dos passos"></div><div class="tutorial-actions"><button type="button" id="tutorialBack" class="tutorial-secondary"></button><button type="button" id="tutorialNext" class="tutorial-primary"></button></div></div></div>';
 document.body.append(dialog);
 $('#tutorialNext').addEventListener('click',()=>{approved.add(step);if(step<2){step++;paint();}else{gateOn=false;dialog.close();document.body.classList.remove('tutorial-open');document.dispatchEvent(new CustomEvent('reeecap:tutorial-complete',{detail:{platform}}));const f=$('.step-card[data-step="2"]');f?.click();}});
 $('#tutorialBack').addEventListener('click',()=>{if(step>0){step--;paint();}else{dialog.close();document.body.classList.remove('tutorial-open');}});
 dialog.addEventListener('cancel',()=>{document.body.classList.remove('tutorial-open');});
 dialog.addEventListener('close',()=>{document.body.classList.remove('tutorial-open');});
}
function paint(){const info=configs[platform]||configs.instagram,stepInfo=info.steps[step],t=tr(),panel=$('#tutorialVisual');
$('#tutorialEyebrow').textContent=t.number+' '+String(step+1).padStart(2,'0')+' · '+info.name;
 $('#tutorialTitle').textContent=stepInfo[0];$('#tutorialDescription').textContent=stepInfo[1];
 $('#tutorialNext').textContent=step===2?t.done:t.next;$('#tutorialBack').textContent=t.back;
 $('#tutorialProgress').innerHTML=[0,1,2].map(i=>'<span class="'+(i<=step?'is-active':'')+'"></span>').join('');
 panel.replaceChildren();panel.setAttribute('aria-busy','true');const path=`./assets/media/tutorials/${platform}-${step+1}.png`;
 const visual=document.createElement('img');visual.className='tutorial-image';visual.src=path;visual.alt=t.image+' — '+info.name+' '+(step+1);visual.decoding='async';
 const fallback=document.createElement('div');fallback.className='tutorial-diagram';fallback.innerHTML='<div class="diagram-app"><div class="diagram-header"><span>‹</span><strong></strong><span>⋯</span></div><div class="diagram-body"><span class="diagram-line"></span><div class="diagram-highlight"><strong></strong><span>›</span></div><div class="diagram-line"></div><div class="diagram-line short"></div></div><div class="diagram-foot"><span></span><span></span><span></span><span></span></div></div>';
 fallback.querySelector('.diagram-header strong').textContent=info.name;fallback.querySelector('.diagram-highlight strong').textContent=stepInfo[0];
 const pill=document.createElement('span');pill.className='tutorial-photo-label';pill.textContent=t.image;
 const stage=document.createElement('div');stage.className='tutorial-stage';stage.append(fallback,visual);panel.append(stage,pill);pill.textContent=t.drawing;
 const source=sources[platform]?.[step];
 visual.referrerPolicy='no-referrer';
 visual.addEventListener('load',()=>{panel.setAttribute('aria-busy','false');fallback.hidden=true;pill.textContent=tr().image+(visual.dataset.external==='1'?' · fonte externa':'');},{once:true});
 visual.addEventListener('error',()=>{
  if(!panel.contains(visual))return;
  if(source&&visual.dataset.external!=='1'){
   // When media was not yet installed at deployment, automatically try a genuine
   // source screenshot. The user never has to press an image-loading button.
   visual.dataset.external='1';visual.src=source[0];pill.textContent=tr().drawing;
   return;
  }
  visual.remove();pill.textContent=tr().drawing;panel.setAttribute('aria-busy','false');
 });

 const note=document.createElement('div');note.className='tutorial-under';const p=document.createElement('p');p.textContent=t.hint;
 const a=document.createElement('a');a.href=source?.[1]||info.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=t.source;
 note.append(p,a);panel.append(note);
}
function start(name){if(!configs[name])return;platform=name;gateOn=true;step=0;approved.clear();if(!dialog)make();for(let i=1;i<=3;i++){const img=new Image();img.src=`./assets/media/tutorials/${platform}-${i}.png`;}for(const s of sources[platform]||[]){if(s?.[0]){const img=new Image();img.referrerPolicy='no-referrer';img.src=s[0];}}paint();if(!dialog.open)dialog.showModal();document.body.classList.add('tutorial-open');}
function init(){if(!dialog)make();
 $$('.platform-card[data-platform]').forEach(button=>button.addEventListener('click',()=>{start(button.dataset.platform)}));
 // Only block bypass after a platform has been selected and guide is unfinished.
 document.addEventListener('click',event=>{if(!gateOn)return;const target=event.target.closest('[data-step="2"],[data-step="3"],[data-next-step],#selectFiles,#focusUpload,#demoInline');if(target&&!dialog.contains(target)){event.preventDefault();event.stopImmediatePropagation();if(!dialog.open){step=0;paint();dialog.showModal();}document.body.classList.add('tutorial-open');}},true);
 const studio=$('#stepPane1');if(studio){const replay=document.createElement('button');replay.type='button';replay.className='tutorial-replay';replay.textContent=tr().replay;replay.addEventListener('click',()=>start($('.platform-card.active')?.dataset.platform||'instagram'));studio.insertBefore(replay,studio.firstChild);document.addEventListener('reeecap:locale',()=>replay.textContent=tr().replay);}
 window.REEECAP_TUTORIAL={open:start,get openNow(){return !!dialog?.open},get completed(){return !gateOn},get platform(){return platform}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
