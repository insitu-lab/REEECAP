# Estratégia de testes e qualidade — REEECAP

## Ambientes e comandos iniciais
- Verificar dependências reais em `tests/` e `scripts/`; não presumir que todo teste histórico funciona no ambiente atual.
- Servir por `python -m http.server 8000` (PWA exige contexto seguro em produção); abrir `http://localhost:8000`.
- Validar `node --check` em todos os JS editados; manter lint/teste de sintaxe automático.
- Executar testes existentes como `tests/test_v6_embedded.py`, `tests/test_v6_export_real.py`, `tests/test_5_tutorial.py`, `tests/test_locale.py`, `tests/test_autodetect.py`, `tests/test_responsive.py`, com ambiente instalado e resultados reportados individualmente.

## Gate 1 — importação REAL
- Testar Instagram e TikTok com **exportações oficiais reais** de consentimento explícito, em ZIP, com múltiplos idiomas/variações de caminhos; sanitizar antes de incluir fixtures de CI.
- Spotify histórico básico e ampliado sem dupla contagem; YouTube Takeout; Reddit CSV; Facebook reconhecido sem mensagens privadas.
- Erros: arquivos corrompidos, grande volume, senha no ZIP, campo ausente, arquivo de rede errada, data inválida, emoji UTF-8, mojibake recuperável vs irrecuperável.
- Tabela deve listar somente métricas da plataforma; dados ausentes = indisponíveis, nunca zero fabricado.

## Gate 2 — interface responsiva
- Viewports 320/360/390/430/768/1024/1280/1920; temas claro/escuro; idiomas PT/EN/ES.
- Navegação uma aba ativa; dock móvel não cobre o rodapé e mantém estilo de vidro; cards inteiros; zero rolagem horizontal; tipografia legível; botão de tema SVG.
- Tutorial popup obrigatório, grande, 3+ prints autênticos por rede, imagens preload, sem encolher durante troca, imagens acessíveis, terceira imagem presente, botão continuar condicionado ao percurso completo.

## Gate 3 — playback 60 FPS ideal, não apenas metadado
- Render temporal realmente contínuo. Coletar frame timestamps de gravação e medir duração de quadros duplicados congelados, dropped frames, long tasks e memória.
- Rodar em Chrome desktop e mobile emulado; depois Android físico com menor CPU/RAM e Safari iOS real. Capturar falhas reais e adaptar qualidade.
- Som: starts/stops em gesto do usuário quando autoplay bloqueado, transições sem estalos, música não reinicia por Story sem intenção.
- Acesso offline: após instalação e cache, desativar rede e verificar recursos documentados; não afirmar que primeira instalação funciona offline.

## Gate 4 — vídeo exportado
- Validar MP4 ou WebM de verdade, codec, duração, fps, resolução 9:16, áudio e sincronismo com `ffprobe`/`ffmpeg`.
- Capturar amostras em t=0.5, 2.5, 5, 8.5, 10.1, transição Story 1→2, meio e final; comparar com preview no mesmo t (diferenças relevantes justificadas).
- Nunca renomear WebM para .mp4; se AAC/MP4 indisponível no Safari, mostrar limitação/fallback real.
- Se áudio falhar, interromper com mensagem explícita, não gerar vídeo silencioso alegando sucesso.

## Gate 5 — segurança e produto
- Sem Pix/API secret no source, arquivos zip públicos, sourcemaps, JS ou localStorage; checar `rg` e Secret Scanning.
- Sem endpoint pago baseado só em flag/role JS; webhooks assinados com idempotência e conferência de backend.
- CDN/licenças documentados, vídeos e MP3s locais testados sem chamadas a recursos bloqueados.
- PWA & cache invalidation; atualizar SW corretamente; preços reais mostrados antes de checkout.

## Gate 6 — entrega
- Cada PR/patch inclui: problemas reproduzidos, arquivos alterados, testes rodados (não apenas alegados), capturas, MP4 de evidência e riscos restantes.
- Criador pede ZIP incremental quando fora de fluxo Git: **somente arquivos novos/alterados com caminhos relativos originais**.
- Nunca escrever “perfeito”, “pronto para lançamento” ou “60fps garantidos” sem validação real correspondente.
