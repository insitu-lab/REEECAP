/* REEECAP 2.0 — experience controls. Stores only interface preferences, never social exports. */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const translations={
 pt:{navExplore:'Explorar',navCreate:'Criar recap',navAbout:'Sobre & privacidade',navSupport:'Apoiar',heroTitle:'O seu ano na internet.<br><em>Em retrospectiva.</em>',heroSub:'Veja o que você curtiu, salvou, assistiu e publicou. Importe seus dados e descubra o que ficou registrado sobre o seu ano.',heroCreate:'Criar meu recap',heroDemo:'Ver um exemplo',platformTitle:'Escolha um aplicativo.',platformSub:'Comece pelo lugar onde você mais passou tempo.',platformOther:'Outros aplicativos',platformOthersSub:'Novas redes poderão ser adicionadas ao projeto.',studioTitle:'Criar retrospectiva',studioSub:'Escolha os dados, exporte e abra sua retrospectiva.',appLabel:'A sua retrospectiva',privacyTitle:'Privacidade e código aberto',privacySub:'A análise dos arquivos acontece no seu navegador. Não usamos servidor para ler seu ZIP, não pedimos acesso à conta e não armazenamos suas atividades. Os resultados dependem dos registros presentes na exportação.',video:'Vídeo',image:'Imagem',stats:'Ver meus dados',premium:'Studio Premium',premiumSoon:'Studio protegido em preparação',premiumDesc:'A edição avançada ficará em uma área separada, com controle de acesso real. A análise gratuita continua disponível sem conta.',themeLight:'Ativar tema claro',themeDark:'Ativar tema escuro',choose:'Criar recap',about:'Sobre',play:'Assistir novamente',details:'Ver todos os dados',other:'Importar outro arquivo',openSettings:'Abrir configurações',stepsNotice:'Esquemas ilustrativos, não prints reais. Os menus podem mudar.',demo:'Ver demonstração',importHeading:'Importar arquivo',startVideo:'Exportar vídeo',langLabel:'Idioma'},
 en:{navExplore:'Explore',navCreate:'Create recap',navAbout:'About & privacy',navSupport:'Support',heroTitle:'Your year online.<br><em>In retrospect.</em>',heroSub:'See what you liked, saved, watched and published. Import your own data and revisit what your year left behind.',heroCreate:'Create my recap',heroDemo:'Watch an example',platformTitle:'Choose a platform.',platformSub:'Start with the app where you spent the most time.',platformOther:'More platforms',platformOthersSub:'More platforms may be added in the future.',studioTitle:'Create a recap',studioSub:'Select your data, export it and play your recap.',appLabel:'Your recap',privacyTitle:'Privacy & open source',privacySub:'Your export is analyzed in your browser. We do not upload ZIP files, request account access, or store your activities. Results depend on the data provided by each platform.',video:'Video',image:'Image',stats:'View my data',premium:'Premium Studio',premiumSoon:'Private Studio is coming',premiumDesc:'Advanced editing will live in a separate, access-controlled app. The free analyzer remains available without an account.',themeLight:'Turn on light mode',themeDark:'Turn on dark mode',choose:'Create recap',about:'About',play:'Watch again',details:'See all stats',other:'Import another file',openSettings:'Open settings',stepsNotice:'Illustrative diagrams, not real screenshots. Menus may change.',demo:'See demo',importHeading:'Import files',startVideo:'Export video',langLabel:'Language'},
 es:{navExplore:'Explorar',navCreate:'Crear recap',navAbout:'Acerca de y privacidad',navSupport:'Apoyar',heroTitle:'Tu año en internet.<br><em>En retrospectiva.</em>',heroSub:'Descubre lo que te gustó, guardaste, viste y publicaste. Importa tus datos para revivir el año.',heroCreate:'Crear mi recap',heroDemo:'Ver un ejemplo',platformTitle:'Elige una plataforma.',platformSub:'Empieza por la aplicación que más usaste.',platformOther:'Otras plataformas',platformOthersSub:'Podremos añadir más redes en el futuro.',studioTitle:'Crear retrospectiva',studioSub:'Elige tus datos, expórtalos y reproduce tu recap.',appLabel:'Tu retrospectiva',privacyTitle:'Privacidad y código abierto',privacySub:'Tus archivos se analizan en tu navegador. No subimos ZIP, no pedimos acceso a tus cuentas ni guardamos tu actividad. Los resultados dependen de los datos exportados.',video:'Vídeo',image:'Imagen',stats:'Ver mis datos',premium:'Studio Premium',premiumSoon:'Studio privado en preparación',premiumDesc:'La edición avanzada estará en una aplicación separada con acceso protegido. El analizador gratuito seguirá disponible sin cuenta.',themeLight:'Activar tema claro',themeDark:'Activar tema oscuro',choose:'Crear recap',about:'Acerca de',play:'Ver de nuevo',details:'Ver todos los datos',other:'Importar otro archivo',openSettings:'Abrir configuración',stepsNotice:'Diagramas ilustrativos, no capturas reales. Los menús pueden cambiar.',demo:'Ver demostración',importHeading:'Importar archivos',startVideo:'Exportar vídeo',langLabel:'Idioma'}
};
const sunSvg='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const moonSvg='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8a8.5 8.5 0 1 0 11.7 11.7Z"/></svg>';
const map={
 '.site-header .nav-link:nth-child(1)':'navExplore','.site-header .nav-link:nth-child(2)':'navCreate','.site-header .nav-link:nth-child(3)':'navAbout','.header-support':'navSupport',
 '#hero-title':'heroTitle','.hero-sub':'heroSub','.hero-actions .primary-btn':'heroCreate','#demoHero':'heroDemo','.platforms-section .section-lead h2':'platformTitle','.platforms-section .section-lead p':'platformSub','.platform-after strong':'platformOther','.platform-after span':'platformOthersSub','.studio-heading h1':'studioTitle','.studio-heading p':'studioSub','.privacy-section h2':'privacyTitle','.privacy-section > div:nth-child(2) > p':'privacySub',
 '#downloadVideo':'video','#openDashboard':'stats','#playSavedRecap':'play','#readyViewStats':'details','#readyNewZip':'other','#demoInline':'demo','.import-section h2':'importHeading','#guideExportLink':'openSettings',
 '.mobile-dock a:nth-child(1)':'navExplore','.mobile-dock a:nth-child(2)':'navCreate','.mobile-dock a:nth-child(3)':'about',
};
let lang='pt',appearance='dark';
try{lang=localStorage.getItem('reeecap-language')||'pt';appearance=localStorage.getItem('reeecap-appearance')||'dark';}catch{}
if(!translations[lang])lang='pt';if(!['dark','light'].includes(appearance))appearance='dark';
function apply(){
 const dict=translations[lang];document.documentElement.lang=lang==='pt'?'pt-BR':lang;document.body.dataset.appearance=appearance;
 for(const [selector,key] of Object.entries(map)){const el=$(selector);if(!el)continue; if(key==='heroTitle')el.innerHTML=dict[key];else if(el.childElementCount===0)el.textContent=dict[key];else if(selector==='#demoHero'){
  const span=el.querySelector('.play-disc');el.replaceChildren();if(span)el.append(span);el.append(' '+dict[key]);
 }else if(selector==='#downloadVideo'){const svg=el.querySelector('svg');if(svg){el.replaceChildren(svg,document.createTextNode(' '+dict[key]));}}
 }
 $$('.platform-cta').forEach(e=>e.textContent=dict.choose);
 const select=$('#reeecapLanguage');if(select){select.value=lang;select.setAttribute('aria-label',dict.langLabel);const label=document.querySelector('label[for="reeecapLanguage"]');if(label)label.textContent=dict.langLabel;}
 const theme=$('#reeecapTheme');if(theme){theme.setAttribute('aria-label',appearance==='dark'?dict.themeLight:dict.themeDark);theme.title=theme.getAttribute('aria-label');theme.innerHTML=appearance==='dark'?sunSvg:moonSvg;}
 const premium=$('#reeecapPremium');if(premium)premium.textContent=dict.premium;
 const caption=$('.guide-screens-caption');if(caption)caption.textContent=dict.stepsNotice;
 const label=$('#guideExportLink');if(label)label.textContent=dict.openSettings;
 try{localStorage.setItem('reeecap-language',lang);localStorage.setItem('reeecap-appearance',appearance);}catch{}
 document.dispatchEvent(new CustomEvent('reeecap:locale',{detail:{lang,appearance}}));
}
function premiumDialog(){
 const dialog=document.createElement('dialog');dialog.id='premiumInfo';dialog.className='premium-info';dialog.setAttribute('aria-label','Planos Studio Premium');
 const plans=[
  {id:'starter',name:'Starter',old:'R$ 9,90',offer:'R$ 4,90',kind:'mensal',detail:'Temas especiais + sem marca no vídeo'},
  {id:'creator',name:'Creator',old:'R$ 14,90',offer:'R$ 9,90',kind:'mensal',detail:'Editor avançado + música e múltiplos Stories'},
  {id:'pro',name:'Pro',old:'R$ 19,90',offer:'R$ 14,90',kind:'mensal',detail:'Exportações Full HD e projetos salvos'},
  {id:'studio',name:'Studio',old:'R$ 29,90',offer:'R$ 24,90',kind:'mensal',detail:'Biblioteca de temas e projetos ampliada'}
 ];
 dialog.innerHTML='<div class="premium-sheet"><button class="dialog-close" type="button" aria-label="Fechar">✕</button><div class="premium-mark">REEECAP <span>STUDIO</span></div><h2>Escolha sua experiência</h2><p>Personalize suas retrospectivas. Os valores promocionais abaixo são uma prévia; o pagamento só estará disponível depois da ativação segura do checkout.</p><div class="plans-grid">'+plans.map(p=>'<button class="premium-plan" type="button" data-plan="'+p.id+'" aria-pressed="false"><span class="plan-name">'+p.name+'</span><span class="plan-old"><s>'+p.old+'</s></span><strong>'+p.offer+'<small> / mês</small></strong><span class="plan-detail">'+p.detail+'</span></button>').join('')+'</div><p class="plan-status" id="premiumPlanStatus" role="status">Selecione um plano para ver os detalhes.</p><button id="premiumCheckout" type="button" class="primary-btn" disabled>Pagamento ainda não configurado</button><small>O acesso de desenvolvedor é controlado por login na hospedagem; nenhum desbloqueio é feito no código do navegador.</small></div>';
 document.body.append(dialog);
 const close=dialog.querySelector('.dialog-close');close.addEventListener('click',()=>dialog.close());
 let chosen=null;
 dialog.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{
  chosen=btn.dataset.plan;dialog.querySelectorAll('[data-plan]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  const plan=plans.find(p=>p.id===chosen);dialog.querySelector('#premiumPlanStatus').textContent=plan.name+' · '+plan.detail;
  const url=window.REEECAP_CONFIG?.checkoutUrls?.[chosen];const safe=typeof url==='string'&&/^https:\/\//.test(url)&&!url.includes('example.com');
  const checkout=dialog.querySelector('#premiumCheckout');checkout.disabled=!safe;checkout.textContent=safe?'Continuar com pagamento seguro':'Pagamento ainda não configurado';
 }));
 dialog.querySelector('#premiumCheckout').addEventListener('click',()=>{const url=window.REEECAP_CONFIG?.checkoutUrls?.[chosen];if(typeof url==='string'&&/^https:\/\//.test(url)&&!url.includes('example.com'))window.open(url,'_blank','noopener,noreferrer');});
 return dialog;
}
function setup(){
 const tools=document.createElement('div');tools.className='experience-tools';tools.innerHTML='<label class="visually-hidden" for="reeecapLanguage">Idioma</label><select id="reeecapLanguage" aria-label="Idioma"><option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option></select><button id="reeecapTheme" type="button" aria-label="Ativar tema claro">☀</button><button id="reeecapPremium" type="button">Studio Premium</button>';
 $('.site-header')?.append(tools);
 const dlg=premiumDialog();
 $('#reeecapPremium')?.addEventListener('click',()=>{
  dlg.showModal();
 });
 $('#reeecapLanguage')?.addEventListener('change',e=>{lang=e.target.value;apply();});
 $('#reeecapTheme')?.addEventListener('click',()=>{appearance=appearance==='dark'?'light':'dark';apply();});
 document.querySelectorAll('[data-platform]').forEach(btn=>btn.addEventListener('click',()=>queueMicrotask(apply)));
 apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
window.REEECAP_LANGUAGE=()=>lang;
})();
