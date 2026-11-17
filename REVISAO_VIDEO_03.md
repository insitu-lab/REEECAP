# REEECAP — revisão das gravações de 16/11/2026

Foram usadas as duas transcrições `VID 20261116 194708.txt` e `VID 20261116 195224.txt`, além da inspeção visual dos vídeos `11488.mp4` e `11489.mp4`. As observações foram alinhadas por momentos aproximados, não por legendas palavra a palavra com timestamps.

## Revisões entregues

- CTA principal **Criar meu recap** e navegação **Criar recap** levam à vitrine de redes, sem entrar automaticamente no Reddit.
- Demonstração do estúdio é sempre da plataforma selecionada (não da paleta de cores da página).
- Removida a duplicação de botões na etapa de importação; o botão real está dentro do quadro de upload. Corrigido seu contraste.
- Após importar, uma tela de **retrospectiva pronta** substitui as etapas, com assistir novamente, ver métricas e importar outro arquivo; resultado mantido na memória desta aba.
- Tecla **Espaço** controla pausa/continuação sem ativar o botão focalizado; setas esquerda/direita avançam ou voltam.
- Ícones dos Stories de compartilhar, Stories e seguir redesenhados em SVG; fundos foram ajustados para evitar cartões aleatórios.
- Comentários existentes do próprio arquivo podem rolar ao fundo do Story de comentários, apenas localmente. O vídeo exportado não inclui textos de comentários individualizados.
- `worker.js` corrige o padrão comum de acentos UTF-8 incorretamente interpretados como Latin-1, preservando os textos que já estão corretos.
- Cartões detalhados passam a usar SVGs em vez de letras/símbolos Unicode.
- Fontes pequenas normalizadas; margens, espaçamento de cartões e etiquetas de recomendação ampliados. Cores dos indicadores seguem o tema da visita.
- Novo **exportador de vídeo em WebM** baseado em Canvas + MediaRecorder, com trilha original opcional; imagens PNG permanecem disponíveis.

## O que ainda exige testes ou trabalho extra

1. Os **prints reais dos menus** de cada aplicativo não foram incluídos — os guias continuam sendo esquemas. Os menus das plataformas mudam com frequência.
2. Não foi validada a análise de um ZIP real de 400 MB nem a contagem exata de posts/Reels dessa conta.
3. O exportador WebM não grava a interface pixel a pixel nem vídeos privados: cria cenas gráficas com as estatísticas.
4. Alguns celulares ou navegadores não suportam MediaRecorder, áudio no arquivo ou performance de vídeo com alta resolução.
5. O reconhecimento de codificações corrompidas cobre os padrões comuns, não todas as possíveis fontes de corrupção de texto.
6. Verificar num dispositivo real o comportamento do histórico do navegador no GitHub Pages (a sessão simulada não reproduz todo o histórico do Chrome).

## Testes executados nesta revisão

- `node --check`: app.js, worker.js, atelier.js, video.js sem erros de sintaxe.
- Worker com ZIPs sintéticos de Instagram e Reddit: contagens processadas sem erro.
- Comentários sintéticos com “JÃ¡ gostei, coraÃ§Ã£o e nÃ£o!”: resultado “Já gostei, coração e não!”.
- Interface com DOM/CSS no Chromium, viewport 1440×900 e 390×844, fluxo de seleção, importação simulada, fechamento, retomada e painel.
- `MediaRecorder` gerou vídeo de teste WebM com trilhas VP9 e Opus.

**Privacidade:** os testes usaram arquivos simulados; nenhuma exportação pessoal foi incluída no pacote.
