# REEECAP — Recap Everything

Projeto independente e **open source** do Insitu Lab. Um site estático, com uma retrospectiva baseada apenas nos dados que o usuário exporta das plataformas.

## Suporte desta edição (revisão dos vídeos 03 e 04)

- **Instagram (beta):** curtidas, salvos, comentários (inclusive texto quando exportado), posts, Reels, Stories e outras interações reconhecidas pelos arquivos JSON.
- **TikTok (beta):** histórico de vídeos, curtidas, favoritos, compartilhamentos e outras atividades quando aparecem nos JSONs reconhecidos.
- **YouTube (beta):** histórico de vídeos assistidos e pesquisas, conforme arquivos JSON do Google Takeout.
- **Reddit (beta):** posts, comentários, votos positivos e negativos e salvos, conforme arquivos CSV exportados. Quando não há data, mostra o total como *sem data*, **não** como estatística do ano.

**Não existe conexão às contas.** A pessoa baixa os dados diretamente da rede social. O REEECAP funciona localmente no navegador, por Web Worker. O código não tem servidor de coleta, analytics ou cookies, e a política de segurança bloqueia requisições de rede feitas pelo aplicativo.

## Instalação / publicação

Envie **o conteúdo da pasta** para a raiz do repositório GitHub (não envie o ZIP inteiro como único arquivo) e configure Settings → Pages → Deploy from a branch → main → /(root). O arquivo `index.html` precisa estar na raiz, junto de `app.js`, `worker.js`, folhas CSS e a pasta `assets`.

Em computador, pode executar `python3 -m http.server 8000` nesta pasta e abrir `http://localhost:8000`. Para Web Workers, não abra diretamente `file://`.

## Como usar

1. Escolha Instagram, TikTok, YouTube ou Reddit.
2. Siga o guia por aplicativo. Exporte **apenas dados de atividade**, evitando conversas, localização, contatos, IPs e arquivos de segurança.
3. Selecione o arquivo ZIP, JSON ou CSV pelo botão da página.
4. Explore os Stories e as métricas. Ao fechar, surge uma tela de retrospectiva pronta, com ações para assistir novamente, ver os dados ou importar outro arquivo **enquanto a aba permanecer aberta**.
5. No painel, pesquise comentários que vieram no arquivo e, se quiser, exporte seus próprios textos em `.txt`. Isso não é enviado a servidor.

## Limitações importantes

- O formato das exportações muda com o tempo. Ainda falta testar amostras reais grandes (como ZIPs de aproximadamente 400 MB). Importações de alto volume podem exceder a memória do celular.
- O total de visualizações é o número de **registros no histórico**, não necessariamente vídeos únicos.
- Não há contagem de reproduções de Reels se a exportação não trouxer histórico correspondente.
- Não dá para identificar o **comentário mais curtido** sem que a exportação traga as curtidas recebidas por comentário.
- Algumas atividades do Reddit (salvos e votos) podem vir sem data; **não** são atribuídas a um ano por suposição.
- A visualização não insere fotos ou vídeos pessoais sem consentimento; para fundos, o aplicativo usa somente elementos visuais próprios. Os textos de comentários podem aparecer apenas na sua retrospectiva local, sem integrar a exportação de imagem/vídeo.
- Exportação opcional de vídeo vertical em **WebM**, com trilha original feita para este projeto (sem músicas comerciais). MediaRecorder não é compatível com todos os navegadores; em alguns, o áudio pode ser bloqueado. O vídeo é composto de cards gerados localmente e não inventa cenas de vídeos assistidos.
- Corrige padrões reconhecíveis de texto UTF-8 interpretado como Latin-1 (ex.: “JÃ¡”); ainda é possível que existam codificações incomuns não corrigidas.
- Nada é salvo entre recarregamentos. O cache de resultados é apenas da **memória da aba atual** para reabrir a retrospectiva sem importar novamente.
- A demonstração utiliza dados **fictícios e identificados**; nunca confundi-los com análise real.

## Código e licenças

- `app.js`: navegação dos Stories, métricas, busca em comentários, exportação PNG/TXT.
- `worker.js`: leitor local ZIP/JSON/CSV, com `pako 0.2.9` (MIT) incorporado para descompressão.
- `atelier.js`: navegação e tutorial de exportação por plataforma.
- `edition-04.css`: base visual da revisão anterior.
- `edition-05.css`: novo refinamento de tipografia, espaço, cartões e tela de recap pronta.
- `video.js`: exportação local da retrospectiva em WebM.
- `assets/reeecap-original-loop.mp3`: faixa instrumental original do projeto. Música opcional no player.
- `config.js`: chave Pix opcional. Nunca publique dados privados nessa configuração.
- `assets/brands`: Font Awesome Free, SVGs de marcas sob CC BY 4.0; veja `ATTRIBUTION.md`.
- `PRIVACIDADE.md`: políticas e orientações.

Licença do código: MIT. Marcas pertencem aos respectivos titulares. O REEECAP não é afiliado à Meta, ByteDance, Google ou Reddit.

## Próximas prioridades

1. Validar contagem de posts/Reels com exportações reais anonimizadas, inclusive deduplicação.
2. Testar ZIPs grandes em dispositivos lentos.
3. Completar os guias com capturas de telas reais e atuais, com permissões adequadas.
4. Preparar traduções para inglês e espanhol.

## Revisão do vídeo 03 / 04

Veja `REVISAO_VIDEO_03.md`. Testes feitos com ZIPs sintéticos e sessão simulada no Chromium (desktop e mobile). O arquivo pessoal de aproximadamente 400 MB ainda não foi testado.

---

## REEECAP 2.0 beta — continuação da v6

Arquivos adicionados nesta continuação:

- `experience.css` / `experience.js`: navegação e controles de idioma PT/EN/ES **parciais**, modo claro/escuro e atalho para o Studio independente. Preferências visuais são armazenadas localmente; ZIPs e resultados não são persistidos.
- `video.js`: compositor de vídeo 9:16 em 720×1280 ou 1080×1920, duração por Story e música original opcionais. Tenta criar **MP4 se o navegador suportar MediaRecorder MP4**, e usa **WebM** caso contrário.
- `app.js`: exporta **somente métricas agregadas** em JSON para abrir no Studio privado. Não inclui comentários ou dados privados brutos nesse formato.
- `HISTORICO_REEECAP_2_0.md`: feedback das gravações e decisões de produto.
- `CAPTURAS_E_FONTES.md`: fontes de ajuda e plano para prints reais.

**Importante:** o Studio Premium é um projeto separado, entregue em outro ZIP. Não adicione seus arquivos ao repositório público do GitHub. O campo `premiumUrl` em `config.js` deve ficar vazio até a autenticação real estar habilitada em um domínio HTTPS protegido.

### Testes realizados nesta entrega

- Python 3.13.5, Node 22.16 e npm 10.9 funcionando; ZIP original com integridade válida.
- `node --check` nos JS editados e suíte de navegação desktop/mobile com Chromium em modo offline. O ambiente de testes bloqueou navegação HTTP direta para localhost: os scripts e CSS foram injetados na página de testes, sem testar deploy real.
- Reprodução de demo, seleção de idiomas, modo claro/escuro, abertura e fechamento de diálogos, exportação PNG privada e exportação **MP4 real** 720×1280, codec H.264, duração ~2,37 s (um Story simulado).
- Teste do Studio separado com JSON sintético e MP4 1080×1920, H.264, duração ~4,82 s.

**Não testado:** ZIP pessoal grande, autenticação Cloudflare real, postagem direta no Instagram e exportação no navegador nativo de aparelhos Android/iOS.
