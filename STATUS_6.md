# REEECAP 6 — integração dos vídeos reais fornecidos

## Confirmado por testes automatizados
- 12 MP4 H.264, 540x960, aproximadamente 6 segundos cada, cópias íntegras do ZIP enviado pelo desenvolvedor.
- Reproduções do rolo de filme usando vídeos de verdade da própria pasta `assets/videos`, sem chamadas a servidores de vídeo terceiros. Quatro decoders ativos por vez para não abrir os doze simultaneamente.
- Renderização do Canvas testada em Chromium para 390 e 1280 pixels de largura, com fontes de vídeo reais.
- Exportação MP4 H.264 720x1280 testada com os clipes reais alimentando o Canvas em ambiente isolado (com URLs Blob equivalentes aos arquivos reais).
- Importação sintética das seis redes e exportação MP4 sem trilha passaram na regressão herdada.
- Crédito e licença de cada clipe incluídos em `videos-e-creditos.html` e `assets/videos/CREDITOS_E_LICENCAS.md`.

## Ainda pendente / não confirmado
- Arquivos MP3: o ZIP recebido tinha vídeos sem áudio, **nenhuma música**. A rotina de build anterior continua como opção para baixar músicas licenciadas no GitHub; não deve ser anunciada como instalada nesta cópia.
- Testes com exportações reais completas das seis plataformas e iPhone/Android físicos; os fixtures de teste são sintéticos.
- Capturas reais dos passos dos tutoriais para todas as plataformas.
- Pagamentos, conta Premium autenticada, implantação e operações em produção.
- Licenças: as etiquetas vieram do manifesto enviado. É responsabilidade do publicador conferi-las nas páginas originais. Conteúdo CC BY precisa de atribuição ao compartilhar.

## Publicação
Extraia o ZIP público mantendo todas as pastas e publique `index.html` junto de `assets/videos`. Não suba somente index.html. O GitHub Actions do repositório completo ainda usa `scripts/install_media.py --strict` para buscar trilhas, e falhará se não obtiver os MP3s necessários.
