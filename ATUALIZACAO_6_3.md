# REEECAP 6.3 — revisão da direção de arte das aberturas

**Base exata:** REEECAP 6.0 com os patches 6.1 e 6.2 aplicados, nesta ordem.

Este ZIP contém **somente três arquivos**, com os caminhos originais. Extraia na raiz do repositório GitHub substituindo os existentes. Não apague os MP3s nem os 12 vídeos já instalados.

## Mudanças feitas

- Aberturas do Instagram e TikTok reconstruídas no renderizador `intro-6.2.js`. O nome do arquivo foi mantido para preservar a integração com `app.js`, `video.js` e `index.html`.
- Sete composições gráficas por abertura, com trocas de cena, tipografia animada, cores contrastantes, recortes e colagens dos vídeos locais, em aproximadamente dez segundos.
- Abertura do Instagram: creme/coral/lilás profundo/verde limão, letras editoriais e narrativa de memória.
- Abertura do TikTok: preto/ciano/rosa/papel, cortes rápidos e narrativa de ritmo.
- Um único `draw()` alimenta a prévia e a exportação. Nenhuma métrica, comentário ou postagem é inventada na introdução.
- Cache do PWA atualizado para v6.3, para não exibir a versão anterior após publicar.

## Verificação

- Sintaxe de JS validada; quadros renderizados com Chromium para os dois perfis.
- Gerados dois MP4s de prévia com as músicas originais enviadas pelo criador.
- Previews usam os pôsteres reais dos vídeos existentes no pacote 6.0; no app, os vídeos tocando são priorizados quando carregados.
- Testar também a reprodução/exportação em celulares reais antes de considerar lançamento estável.

## Licença musical

Os MP3s de Instagram e TikTok já estão no patch 6.2 e não foram reenviados. Antes de distribuir comercialmente, confirme que a geração no Suno concede os direitos necessários.
