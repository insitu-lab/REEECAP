# REEECAP — briefing de produto e histórico recuperado

**Data do handoff:** 17/11/2026. Fonte: solicitações, transcrições e capturas fornecidas pelo criador nesta conversa, mais inspeção local dos pacotes ZIP 6.0–6.3. As observações do criador são requisitos; resultados de testes anteriores são relatos históricos, não comprovação de produção.

## 1. Visão do produto
REEECAP: retrospectiva anual de atividades sociais para qualquer pessoa, não apenas criadores. Quer competir em experiência com o Spotify Wrapped, mas **sem copiar marca, composições nem assets do Spotify**. O resultado deve provocar surpresa: *“como fizeram isso?”*. Priorizar dados verificáveis, narrativa, personalização e compartilhar espontaneamente. Internacional, PT/EN/ES; primeiro mobile.

Referências de mercado estudadas: `https://myunwrapped.com/` (principal: múltiplas redes, cartões e vídeos), `https://wrapped.vantezzen.io/`, `https://www.postel.app/wrapped`, `https://spawnmetrics.com/wrapped/index.html`. Comparar recursos observados, sem afirmar que integração ou exportação funciona sem testar.

## 2. Estado do código inspecionado
Versão auditada localmente: **ZIP 6.0 + patches 6.1/6.2/6.3 sobrepostos**, 144 arquivos no diretório combinado. Aplicação estática HTML/CSS/JS com muitos estilos em camadas, JS sem framework e worker local. Arquivos-chave:
- `index.html`, `app.js`: interface, importação, Story e métricas.
- `worker.js`: extração e parsing ZIP/JSON/CSV, filtragem de dados sensíveis, deteção de rede, agregações.
- `video.js`: editor/exportação Canvas+MediaRecorder, tema, áudio e seleção de cenas.
- `intro-6.2.js`, `intro-6.2.css`: aberturas; apesar do nome, `intro-6.2.js` foi alterado pelo patch 6.3.
- `motion.js`: movimento e filmagens reais nos Stories; `assets/videos/reel_01.mp4` etc.
- `tutorial5.js`: tutorial obrigatório/modal e imagens das etapas.
- `music5.js`: biblioteca e trilhas locais/terceiros; `assets/media/music/reeecap-instagram.mp3`, `reeecap-tiktok.mp3`.
- `experience.js`, `experience.css`, `edition-*.css`, `style.css`, `atelier.js`, `atelier.css`, `locale-full.js`: interface, estilos, traduções e recursos extras.
- `sw.js`, `pwa.js`, `manifest.webmanifest`: PWA/cache/offline.
- `config.js`: URLs públicas opcionais para checkout/apoio; campo privado deve continuar vazio enquanto não existir provedor seguro.
- `.github/workflows/publish.yml`, `scripts/install_media.py`; testes em `tests/`.
- Studio Premium **não faz parte do pacote público**; há ZIP separado de desenvolvimento (não colocar em GitHub público).

O comando `node --check` passou em `app.js`, `worker.js`, `atelier.js`, `motion.js`, `music5.js`, `intro-6.2.js`, `video.js`, `tutorial5.js`, `sw.js`, `experience.js`, `locale-full.js`. **Isso não valida UX ou importadores reais.**

## 3. Funcionalidades pretendidas/implementadas parcialmente
- Seis redes hoje exibidas: Instagram, TikTok, YouTube, Reddit, Spotify, Facebook. Existe suporte conservador a arquivos exportados, de acordo com o código, mas ainda falta prova ampla com exportações reais e variantes de idioma.
- Entrada: ZIP/JSON/CSV fornecidos pelo usuário, analisados preferencialmente no navegador, sem login social. Deteção automática somente quando inequívoca. Nunca inventar estatísticas ou confundir registros com minutos assistidos sem duração.
- Outputs: Stories 9:16, PNG, vídeo MP4 quando compatível ou WebM informado corretamente; prévia e exportação devem manter paridade visual; trilha sincronizada.
- Estilos prévios: Neon Motion, Noir Editorial, Paper Cut; o criador quer temas de composição **realmente diferentes**, não só paletas.
- Local: 12 MP4 verticais 540 × 960, ~6s, pacote gerado com Wikimedia Commons e créditos. Usuário não deve ser obrigado a importar vídeos; usados como filmagens decorativas não identificadas falsamente como Reels próprios.
- Duas músicas originais enviadas: `Instagrrr.mp3` (Instagram, ~3min19s) e `Tektirr.mp3` (TikTok, ~3min07s); incluídas no patch 6.2. Licença comercial Suno **não verificada** pelo arquivo.
- Premium: Studio privado, edição de múltiplas cenas, projetos editáveis, preços promocionais e planos exibidos; cobrança real e autenticação não prontas. Creator deve ter conta de desenvolvimento autorizada, não uma senha pública.
- Apoio financeiro: Pix e PayPal via **checkout HTTPS externo**; não guardar chave Pix ou dados do titular no código público.

## 4. Reclamações recorrentes do criador — todas devem ser rastreadas
**Design público:** excesso de margens no desktop; título 'Seu ano na internet' sobrepondo card; texto micro e contraste ruim; tom pastel genérico; bordas brilhantes de IA; botões duplicados; cor azul destoante; cards mal proporcionados; aparência artificial/pequena. Manter cards das redes escuros e bonitos, dar profundidade ao fundo sem perder legibilidade. Modo claro coerente, logo REEECAP com letras pretas no claro e brancas no escuro. Alternador de tema não pode virar asterisco no PC. Logo INSITU LAB no rodapé, invertendo preto/branco conforme tema.

**Navegação móvel:** dock estilo liquid glass discreto, flutuante e só UMA aba ativa. Não cobrir conteúdo, não grudar no rodapé. Rodapé tradicional depois do conteúdo (não flutuante/fixo). Cards de plataformas devem caber inteiros no celular, sem meia caixa cortada. Scroll horizontal indevido é bug. 'Escolher outra rede' deve funcionar e ter texto legível.

**Tutoriais:** grande popup obrigatório com backdrop desfocado; prints autênticos grandes de pelo menos três passos de cada plataforma; imagens não podem ser miniaturas opcionais, não obrigar toque para revelar; eliminar contador redundante '1/03' quando o progresso já está embaixo; modal deve permanecer do mesmo tamanho durante carregamento, idealmente prefetch. Último print do Instagram faltava. Remover botão redundante 'Abrir exportação...' da etapa. Capturas atuais não comprovadamente autênticas em todos os passos — prioridade P0/P1. Guia correspondente à rede escolhida, nunca demo Reddit ao escolher Instagram.

**Dados:** comentários com acentos mojibake e emojis corrompidos; corrigir parsing/encoding real, nunca adivinhar Unicode perdido. 'Transparência do arquivo' deve listar só métricas daquela plataforma, não votos negativos Spotify no Instagram. Importação não deve exigir voltar ao início após erro de deteção. Busca e datas corretas.

**Stories:** visual de Instagram com comentários reais em feed central rolando suavemente atrás do dado principal, opacidade menor, uns 20 comentários sem caixas genéricas. Likes com dois rolos de vídeo (acima e abaixo), reais, alinhados, motion suave. Stories interações não devem ser círculos/relógios aleatórios. Compartilhamentos com aviões de papel de tamanhos e posições variados indo **da esquerda para a direita**, planando lentamente com rastros, não todos em direção idêntica. Seguidores e seguindo com números animados rápidos até valores reais. Dias ativos com **calendário central interativo**, toque acelera quantos dias a folha representa; folhas voam para cima; sem texto explicando compulsivamente a interação. Áudio e visual sincronizados, sem pausas e sem inventar métricas.

**Exportação:** 9:16 vertical para Reels/TikTok/Stories; qualidade visual da prévia igual ao arquivo, sem artefatos de quadro congelado, fps real contínuo, 60 FPS em máquinas aptas com fallback; checar duração, áudio AAC no MP4 compatível e WebM em outros casos, não renomear extensão. Fluxo grande de dados no Samsung lento e iPhone rápido em relatos — medir e otimizar.

**Música:** usuário rejeitou trilha genérica anterior. Instagram e TikTok com música original fornecida, cada Story deve cair num segmento/momento **musicalmente** pertinente, em vez de divisão cega a cada dez segundos. Abre ~10s com direção própria de cada rede. Após 6.3, criador criticou fortemente '10 fps', imagens estáticas, tipografia grosseira, poucos movimentos, resultado feio. **Não manter 6.3 como arte aprovada.**

**Premium/monetização:** 4 planos exibidos (números promocionais ainda precisam confirmação: o criador citou R$ 9→5 e R$ 14→10; não inventar demais). Ações de pagamento só quando backend real confirmar; não fabricar acesso após clique. Apoiar com marca REEECAP, titular identificado apenas no checkout/banco quando exigido. Provável responsável legal pelo recebimento; não compartilhar dados pessoais. PWA offline deve priorizar benefício prático; proteção absoluta contra cópia é inviável no cliente.

**README:** exemplos Immich, yt-dlp, grandes repositórios. Capa, screenshots reais, badges discretos, links de download existentes, instruções simples, créditos e licenças. Evitar telas fictícias apresentadas como reais.

## 5. O exemplo do Spotify Wrapped e a lição
O usuário enviou um vídeo 'Spotify Wrapped 2025 - ThisisJokyl989 (1080p, h264).mp4' **para análise privada**, não para republicação. A referência é um produto com transições coreografadas, tipografia de alta qualidade, transformação entre cenas, gráficos e narrativa progressiva. As duas aberturas 6.3 foram reprovadas como slides estáticos; o vídeo está codificado a 24 FPS, e o movimento visível parece muito menos fluido. **Não tomar fps declarado como prova de movimento fluido**: medir tempo de mudança real, congelamentos e progressão de quadros.

## 6. Prioridade real de negócios
1. Um fluxo completo **Instagram real → análise local → Story → abertura 10s → vídeo 9:16 com áudio** no mobile e desktop. Colher ZIP real sanitizado/consentido quando necessário.
2. Refazer direção visual introduções e Stories, com aprovação visual do criador por vídeo completo, não screenshots isoladas.
3. TikTok real e trilha própria; robustez de demais redes; tutoriais autênticos; UX mobile.
4. Pagamentos autenticados e benefícios Premium de verdade; escalabilidade e internacionalização.

## 7. Restrições
- Nunca copiar visual protegido do Spotify quadro a quadro ou reutilizar seu vídeo/assets na aplicação.
- Não anunciar 'integrado/testado' quando só estiver mockado.
- Toda licença de terceiros (música/vídeos) deve ser verificada antes da publicação comercial.
- Nada de enviar dados importados para analytics ou servidor sem consentimento claro.
- Corrigir código com testes; não trocar uma sobreposição por `overflow: hidden` que só oculta conteúdo.
