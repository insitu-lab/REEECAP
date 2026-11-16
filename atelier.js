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
    $$('[data-view-link]').forEach(link => {
      const selected = link.dataset.viewLink === view && (view !== 'about' || link.getAttribute('href') === '#privacidade');
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
    spotify: {
      detail: 'Solicite seus dados diretamente nas configurações de privacidade da conta Spotify.',
      screens: [
        ['Sua conta', 'Privacidade', 'Abra as configurações de privacidade da conta Spotify pelo navegador'],
        ['Baixar dados', 'Histórico de streaming ampliado', 'Selecione o histórico ampliado para incluir mais anos'],
        ['Solicitação', 'Confirmar pedido', 'Confirme e aguarde o link para baixar os arquivos JSON']
      ],
      source: 'https://support.spotify.com/article/understanding-your-data/'
    }
  };
  function updateExportGuide() {
    const active = $('.platform-card.active')?.dataset.platform || 'instagram';
    const info = visualGuides[active] || visualGuides.instagram;
    const guide = $('#stepOneLine');
    if (guide) guide.textContent = info.detail;
    const label = $('#exportPlatform')?.textContent || 'Instagram';
    const link = $('#guideExportLink');
    const source = $('#exportLink');
    if (link && source) { link.href = source.href; link.textContent = 'Abrir configurações'; }
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
        const chip=document.createElement('div');chip.className='guide-screen-highlight';chip.textContent=item[1];
        const tip=document.createElement('p');tip.textContent=item[2];
        screen.append(head,chip,tip);pages.append(screen);
      });
      const caption=document.createElement('p');caption.className='guide-screens-caption';caption.textContent='Esquemas ilustrativos dos menus. Os nomes podem variar por versão do aplicativo.';
      const official=document.createElement('a');official.href=info.source;official.target='_blank';official.rel='noopener noreferrer';official.className='guide-source';official.textContent='Consultar a ajuda oficial de '+label;
      root.append(pages,caption,official);
    }
  }
  function buildMobileDock() {
    const nav = document.createElement('nav');
    nav.className = 'mobile-dock';
    nav.setAttribute('aria-label', 'Menu principal');
    nav.innerHTML = `
      <a href="#inicio" data-view-link="home" class="is-active" aria-label="Explorar plataformas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-8 9 8v10H3z"/><path d="M9 21v-7h6v7"/></svg>Explorar</a>
      <a href="#como-funciona" data-view-link="studio" aria-label="Criar retrospectiva"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>Criar recap</a>
      <a href="#privacidade" data-view-link="about" aria-label="Conhecer o projeto e privacidade"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>Sobre</a>`;
    $('.site-header')?.after(nav);
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
    setStep(1);
    const hash = location.hash;
    if (hash === '#como-funciona' || hash === '#importar') showView('studio', null, false);
    else if (hash === '#privacidade' || hash === '#apoie') showView('about',null,false);
    else showView('home',null,false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
