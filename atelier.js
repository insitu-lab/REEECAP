/* REEECAP Atelier — client-only, accessible views and compact step-by-step studio. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  let activeView = 'home';
  let activeStep = 1;
  const views = {home:'#inicio', studio:'#como-funciona', about:'#privacidade'};
  function showView(view, target, scroll = true) {
    if (!views[view]) view = 'home';
    activeView = view;
    document.body.dataset.view = view;
    // Only one destination may be active inside each navigation. The old code
    // activated both 'Explore' and 'Create' because they shared data-view-link=home.
    const destination = view === 'studio' ? '#plataformas' : view === 'about' ? '#privacidade' : (target === '#plataformas' ? '#plataformas' : '#inicio');
    $$('[data-view-link]').forEach(link => {
      const selected = link.getAttribute('href') === destination &&
        (view === 'studio' ? link.dataset.viewLink === 'home' : link.dataset.viewLink === view);
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (scroll) {
      const to = target && document.querySelector(target);
      window.scrollTo({top: 0, behavior:'instant'});
      if (view === 'about' && to) requestAnimationFrame(() => to.scrollIntoView({behavior:'smooth',block:'start'}));
    }
  }
  function setStep(n) {
    activeStep = Math.max(1, Math.min(3, Number(n) || 1));
    const area = $('.studio-layout');
    if (!area) return;
    area.dataset.step = String(activeStep);
    $$('[data-step]').forEach(button => {
      const chosen = Number(button.dataset.step) === activeStep;
      button.classList.toggle('active',chosen);
      button.setAttribute('aria-selected',String(chosen));
      button.tabIndex = chosen ? 0 : -1;
    });
    for (let i=1;i<=3;i++) {
      const pane = $(`#stepPane${i}`);
      if (pane) {pane.hidden = i!==activeStep;pane.setAttribute('aria-hidden',String(i!==activeStep));}
    }
    const drop = $('#dropzone');
    drop?.classList.toggle('ready-stage',activeStep===3);
  }
  const visualGuides = {
    instagram: {
      detail: 'Abra o Instagram no celular e siga o caminho abaixo.',
      screens: [
        ['Instagram', 'Perfil', 'Toque no seu perfil e abra o menu ☰'],
        ['Central de Contas', 'Suas informações e permissões', 'Abra a Central de Contas e localize esta opção'],
        ['Exportação', 'Exportar suas informações', 'Escolha o perfil, selecione só o necessário e exporte em JSON']
      ],
      source: 'https://help.instagram.com/181231772500920'
    },
    tiktok: {
      detail: 'No aplicativo TikTok, abra as configurações da sua conta.',
      screens: [
        ['TikTok', 'Perfil → ☰', 'Abra Configurações e privacidade'],
        ['Conta', 'Baixar seus dados', 'Entre em Conta e toque em Baixar seus dados'],
        ['Solicitar dados', 'Atividade · JSON', 'Selecione Atividade, escolha JSON e solicite o arquivo']
      ],
      source: 'https://support.tiktok.com/en/account-and-privacy/personalized-ads-and-data/requesting-your-data'
    },
    youtube: {
      detail: 'A exportação do YouTube é feita pelo Google Takeout.',
      screens: [
        ['Google Takeout', 'Desmarcar tudo', 'Abra o Takeout e desmarque os produtos selecionados'],
        ['Selecionar produto', 'YouTube e YouTube Music', 'Marque o YouTube e, dentro dele, escolha apenas o histórico'],
        ['Exportação', 'Criar exportação', 'Selecione JSON para o histórico quando disponível e crie o ZIP']
      ],
      source: 'https://support.google.com/accounts/answer/3024190'
    },
    reddit: {
      detail: 'O Reddit prepara uma cópia dos seus dados por solicitação; o download pode levar até 30 dias.',
      screens: [
        ['Reddit', 'Configurações → dados', 'No navegador, acesse reddit.com/settings/data-request e entre na conta'],
        ['Solicitação', 'Escolha o período', 'Solicite o histórico para o intervalo desejado, quando houver essa opção'],
        ['Caixa de entrada', 'Baixe o ZIP', 'O Reddit enviará uma mensagem com o link quando o arquivo estiver pronto']
      ],
      source: 'https://support.reddithelp.com/hc/en-us/articles/360043048352-How-do-I-request-a-copy-of-my-Reddit-data-and-information'
    }
  };
  visualGuides.spotify={
   detail:'Spotify → Conta → Privacidade → Baixar seus dados. Peça o histórico de streaming ampliado para cobrir mais anos.',
   screens:[['Spotify','Conta · Privacidade','Acesse a seção de privacidade da sua conta Spotify'],['Seus dados','Histórico de streaming ampliado','Selecione Extended Streaming History, se disponível'],['Arquivo JSON','ZIP ou Streaming_History','Importe os arquivos JSON de reprodução, sem dados bancários']],
   source:'https://support.spotify.com/article/understanding-your-data/'
  };
  visualGuides.facebook={
   detail:'Facebook → Central de Contas → Suas informações e permissões → Exportar suas informações.',
   screens:[['Facebook','Configurações','Abra a Central de Contas'],['Informações','Exportar suas informações','Selecione posts, comentários e reações'],['Exportar para dispositivo','JSON · período desejado','Baixe o ZIP oficial quando estiver pronto']],
   source:'https://about.fb.com/news/2023/10/manage-your-information-across-apps/'
  };
  // Accurate navigation text in each language; diagrams remain clearly labelled.
  const localizedGuides = {
    en: {
      instagram:{detail:'Open Instagram on your phone and follow these steps.',screens:[
        ['Instagram','Profile','Open your profile and tap the ☰ menu'],
        ['Accounts Center','Your information and permissions','Open Accounts Center and find this option'],
        ['Export','Export your information','Choose your profile, select only the relevant categories and request JSON'] ]},
      tiktok:{detail:'Open your TikTok account settings in the app.',screens:[
        ['TikTok','Profile → ☰','Open Settings and privacy'],
        ['Account','Download your data','Select Account, then Download your data'],
        ['Request data','Activity · JSON','Choose activity data and JSON, then request the file']]},
      youtube:{detail:'Export YouTube activity through Google Takeout.',screens:[
        ['Google Takeout','Deselect all','Start by deselecting the other products'],
        ['Choose product','YouTube and YouTube Music','Select the product and include your watch history'],
        ['Export','Create export','Choose JSON for history where available and download the ZIP']]},
      reddit:{detail:'Reddit prepares your archive after a data request. This can take up to 30 days.',screens:[
        ['Reddit','Settings → Data','Sign in to reddit.com/settings/data-request'],
        ['Request','Choose a date range','Select the date range when that option is available'],
        ['Inbox','Download ZIP','Follow the link Reddit sends when the export is ready']]}
    },
    es: {
      instagram:{detail:'Abre Instagram en tu móvil y sigue estos pasos.',screens:[
        ['Instagram','Perfil','Abre tu perfil y el menú ☰'],
        ['Centro de cuentas','Tu información y permisos','Busca esta opción en el Centro de cuentas'],
        ['Exportar','Exportar tu información','Elige tu perfil, solo los datos necesarios y solicita JSON']]},
      tiktok:{detail:'Abre la configuración de tu cuenta de TikTok.',screens:[
        ['TikTok','Perfil → ☰','Abre Ajustes y privacidad'],
        ['Cuenta','Descargar tus datos','Entra en Cuenta y selecciona Descargar tus datos'],
        ['Solicitar datos','Actividad · JSON','Selecciona actividad, formato JSON y solicita el archivo']]},
      youtube:{detail:'Exporta la actividad de YouTube desde Google Takeout.',screens:[
        ['Google Takeout','Desmarcar todo','Empieza desmarcando los demás productos'],
        ['Elegir producto','YouTube y YouTube Music','Selecciona YouTube e incluye el historial de visualizaciones'],
        ['Exportar','Crear exportación','Elige JSON para el historial si aparece la opción y descarga el ZIP']]},
      reddit:{detail:'Reddit prepara tu archivo después de solicitar los datos. Puede tardar hasta 30 días.',screens:[
        ['Reddit','Ajustes → datos','Inicia sesión en reddit.com/settings/data-request'],
        ['Solicitud','Elige las fechas','Selecciona un intervalo si la opción está disponible'],
        ['Bandeja de entrada','Descarga el ZIP','Reddit enviará un enlace cuando esté preparado']]}
    }
  };
  Object.assign(localizedGuides.en,{
    spotify:{detail:'Spotify → Account → Privacy → Download your data.',screens:[['Spotify','Account · Privacy','Open account privacy settings'],['Your data','Extended Streaming History','Choose the expanded history for more years'],['JSON files','ZIP or Streaming_History','Import the files without payment data']]},
    facebook:{detail:'Facebook → Accounts Center → Your information and permissions → Export.',screens:[['Facebook','Settings','Go to Accounts Center'],['Your information','Export your information','Include posts, comments and reactions'],['Export to device','JSON and date range','Import the ZIP after Meta prepares it']]}
  });
  Object.assign(localizedGuides.es,{
    spotify:{detail:'Spotify → Cuenta → Privacidad → Descargar tus datos.',screens:[['Spotify','Cuenta · Privacidad','Entra en privacidad de la cuenta'],['Tus datos','Historial ampliado','Elige el historial ampliado para más años'],['Archivos JSON','ZIP o Streaming_History','Importa el historial sin datos bancarios']]},
    facebook:{detail:'Facebook → Centro de cuentas → Tu información y permisos → Exportar.',screens:[['Facebook','Configuración','Entra en el Centro de cuentas'],['Tu información','Exportar tu información','Incluye publicaciones, comentarios y reacciones'],['Exportar al dispositivo','JSON y fechas','Importa el ZIP preparado por Meta']]}
  });
  const externalExamples={"instagram": [{"url": "https://images.wondershare.com/drfone/article/2026/05/how-to-find-deleted-instagram-post-10.jpg", "source": "https://drfone.wondershare.com/app-recovery/how-to-find-deleted-instagram-post.html", "label": "Central de Contas e exportação (Wondershare, 2026)", "step": 1}, {"url": "https://www.multcloud.com/screenshot/en/others-1/instagram/choose-all-available-information.png", "source": "https://www.multcloud.com/explore/what-is-included-in-instagram-data-download-0121-ac.html", "label": "Seleção das informações (MultCloud)", "step": 2}], "tiktok": [{"url": "https://storage.ghost.io/c/fb/a8/fba8736e-797b-43bb-bcba-040fb8dcfebb/content/images/size/w600/2025/01/TikTok-Account-Settings.png", "source": "https://www.kapwing.com/resources/how-to-download-all-tiktok-videos-and-data-in-one-individually/", "label": "Configurações de exportação (Kapwing)", "step": 0}, {"url": "https://storage.ghost.io/c/fb/a8/fba8736e-797b-43bb-bcba-040fb8dcfebb/content/images/size/w1600/2025/01/TikTok-Data-Request-Configuration.png", "source": "https://www.kapwing.com/resources/how-to-download-all-tiktok-videos-and-data-in-one-individually/", "label": "Categorias e JSON (Kapwing)", "step": 2}], "youtube": [{"url": "https://resource.gbyte.com/20250821/large/google-takeout-exporte-video-youtube.webp", "source": "https://www.gbyte.com/fr/blog/recuperer-videos-youtube", "label": "YouTube no Google Takeout (Gbyte)", "step": 1}], "reddit": [{"url": "https://www.expressvpn.com/wp-ws-cache/uploads-expressvpn/2025/10/2-8.png", "source": "https://www.expressvpn.com/blog/delete-reddit-account/", "label": "Formulário real do Reddit (ExpressVPN)", "step": 1}]};
  // A screenshot is loaded only after explicit click. These are publisher images, not recreations.
  externalExamples.spotify=[{
   url:'https://support.trackify.am/images/import_one.png',
   source:'https://support.trackify.am/import/guide',
   label:'Spotify · seleção do histórico ampliado (Trackify)',step:1
  }];
  externalExamples.facebook=[{
   url:'https://images.wondershare.com/drfone/article/2026/05/how-to-find-deleted-instagram-post-10.jpg',
   source:'https://drfone.wondershare.com/app-recovery/how-to-find-deleted-instagram-post.html',
   label:'Central de Contas da Meta · compartilhada por Instagram/Facebook',step:0
  }];
  // This former Reddit illustration described account deletion, not data export.
  // Remove it rather than mislead visitors with an unrelated screenshot.
  externalExamples.reddit=[];
  const guideUi={
    pt:{open:'Abrir configurações',disclaimer:'Capturas externas reais quando disponíveis; os demais cartões são esquemas. Imagens e menus podem mudar.',source:'Consultar a ajuda oficial de '},
    en:{open:'Open settings',disclaimer:'Real third-party screenshots where available; other cards are diagrams. Menus and images may change.',source:'See official help for '},
    es:{open:'Abrir configuración',disclaimer:'Capturas reales de terceros cuando existen; las otras tarjetas son esquemas. Los menús pueden cambiar.',source:'Consultar ayuda oficial de '}
  };
  function updateExportGuide() {
    const active = $('.platform-card.active')?.dataset.platform || 'instagram';
    const lang=window.REEECAP_LANGUAGE?.()||'pt';
    const info = localizedGuides[lang]?.[active] ? {...visualGuides[active],...localizedGuides[lang][active]} : (visualGuides[active] || visualGuides.instagram);
    const ui=guideUi[lang]||guideUi.pt;
    const guide = $('#stepOneLine');
    if (guide) guide.textContent = info.detail;
    const label = $('#exportPlatform')?.textContent || 'Instagram';
    const link = $('#guideExportLink');
    const source = $('#exportLink');
    if (link && source) { link.href = source.href; link.textContent = ui.open; }
    const root = $('#platformWalkthrough');
    if(root){
      root.replaceChildren();
      const pages = document.createElement('div'); pages.className='guide-screens';
      info.screens.forEach((item,i)=>{
        const screen=document.createElement('div');screen.className='guide-screen';
        const head=document.createElement('div');head.className='guide-screen-head';
        const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');
        const brand=document.createElement('strong');brand.textContent=item[0];
        head.append(num,brand);
        const ref=(externalExamples[active]||[]).find(entry=>entry.step===i);
        if(ref){
          // No third-party requests are made unless the visitor explicitly opts in.
          const visual=document.createElement('div');visual.className='guide-example-wrapper';
          const load=document.createElement('button');load.type='button';load.className='guide-load-button';
          const isPt=lang==='pt',isEs=lang==='es';
          load.textContent=isPt?'Ver captura real':isEs?'Ver captura real':'Load real screenshot';
          const credit=document.createElement('a');credit.className='guide-example-credit';credit.href=ref.source;credit.target='_blank';credit.rel='noopener noreferrer';
          credit.textContent=(isPt?'Fonte: ':isEs?'Fuente: ':'Source: ')+ref.label;
          const caution=document.createElement('small');caution.className='guide-external-warning';
          caution.textContent=isPt?'A imagem só será carregada após seu toque, diretamente do site da fonte.':isEs?'La imagen se carga desde la fuente solo cuando pulses el botón.':'Only loads from the publisher after you tap.';
          load.addEventListener('click',()=>{
            load.disabled=true;load.textContent=isPt?'Carregando captura…':isEs?'Cargando captura…':'Loading screenshot…';
            const photo=document.createElement('img');photo.className='guide-example-image';photo.loading='eager';photo.decoding='async';photo.referrerPolicy='no-referrer';photo.alt=ref.label;
            photo.addEventListener('load',()=>{load.remove();visual.classList.add('loaded')},{once:true});
            photo.addEventListener('error',()=>{photo.remove();load.disabled=false;load.textContent=isPt?'Imagem indisponível — abrir fonte abaixo':isEs?'Imagen no disponible — abre la fuente':'Screenshot unavailable — open source';},{once:true});
            visual.prepend(photo);photo.src=ref.url;
          });
          visual.append(load,caution,credit);screen.append(visual);
        }
        const chip=document.createElement('div');chip.className='guide-screen-highlight';chip.textContent=item[1];
        const tip=document.createElement('p');tip.textContent=item[2];
        screen.append(head,chip,tip);pages.append(screen);
      });
      const caption=document.createElement('p');caption.className='guide-screens-caption';caption.textContent=ui.disclaimer;
      const official=document.createElement('a');official.href=info.source;official.target='_blank';official.rel='noopener noreferrer';official.className='guide-source';official.textContent=ui.source+label;
      root.append(pages,caption,official);
    }
  }
  function buildMobileDock() {
    const nav = document.createElement('nav');
    nav.className = 'mobile-dock';
    nav.setAttribute('aria-label', 'Menu principal');
    nav.innerHTML = `
      <a href="#inicio" data-view-link="home" class="is-active" aria-label="Explorar plataformas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-8 9 8v10H3z"/><path d="M9 21v-7h6v7"/></svg>Explorar</a>
      <a href="#plataformas" data-view-link="home" aria-label="Escolher aplicativo para a retrospectiva"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>Criar recap</a>
      <a href="#privacidade" data-view-link="about" aria-label="Conhecer o projeto e privacidade"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>Sobre</a>`;
    // The navigation is mounted outside main, visually frosted and fixed;
    // enough bottom padding prevents it from covering the last content.
    $('.site-footer')?.before(nav);
  }
  function setup() {
    buildMobileDock();
    $$('.site-header [data-view-link], .mobile-dock [data-view-link], .hero-actions [data-view-link]').forEach(el => {
      el.addEventListener('click', event => {
        event.preventDefault();
        const v = el.dataset.viewLink;
        const target = el.getAttribute('href');
        showView(v,target);
        if (v === 'studio') {setStep(1);updateExportGuide();}
        if (v === 'home' && target === '#plataformas') requestAnimationFrame(() => $('#plataformas')?.scrollIntoView({behavior:'smooth',block:'start'}));
        if (target) history.replaceState(null, '', target);
      });
    });
    $$('[data-platform]').forEach(el => el.addEventListener('click', () => {
      updateExportGuide();
      setStep(1);
      showView('studio');
      history.replaceState(null, '', '#como-funciona');
    }));
    $$('#studioBack').forEach(el => el.addEventListener('click',() => {
      showView('home');
      history.replaceState(null, '', '#plataformas');
      requestAnimationFrame(() => $('#plataformas')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }));
    $$('[data-step]').forEach(el => {
      el.addEventListener('click',() => setStep(el.dataset.step));
      el.addEventListener('keydown',event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const n = Math.max(1, Math.min(3, Number(el.dataset.step)+(event.key==='ArrowRight'?1:-1)));
        setStep(n);$(`[data-step="${n}"]`)?.focus();
      });
    });
    $$('[data-next-step]').forEach(el => el.addEventListener('click',() => setStep(el.dataset.nextStep)));
    $('#focusUpload')?.addEventListener('click', () => $('#fileInput')?.click());
    $('#previewStage')?.addEventListener('click', () => $('#demoHero')?.click());
    $('#newAnalysis')?.addEventListener('click',() => {showView('studio');setStep(3);});
    updateExportGuide();
    document.addEventListener('reeecap:locale',updateExportGuide);
    setStep(1);
    const hash = location.hash;
    if (hash === '#como-funciona' || hash === '#importar') showView('studio', null, false);
    else if (hash === '#privacidade' || hash === '#apoie') showView('about',null,false);
    else showView('home',null,false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
