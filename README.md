# REEECAP — Recap Everything

Projeto independente e **open source** do Insitu Lab. Um site estático, com uma retrospectiva baseada apenas nos dados que o usuário exporta das plataformas.

## Suporte desta edição (revisão do vídeo 02)

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
4. Explore os Stories e as métricas. O botão “Continuar minha retrospectiva” reabre a análise **enquanto a aba permanecer aberta**.
5. No painel, pesquise comentários que vieram no arquivo e, se quiser, exporte seus próprios textos em `.txt`. Isso não é enviado a servidor.

## Limitações importantes

- O formato das exportações muda com o tempo. Ainda falta testar amostras reais grandes (como ZIPs de aproximadamente 400 MB). Importações de alto volume podem exceder a memória do celular.
- O total de visualizações é o número de **registros no histórico**, não necessariamente vídeos únicos.
- Não há contagem de reproduções de Reels se a exportação não trouxer histórico correspondente.
- Não dá para identificar o **comentário mais curtido** sem que a exportação traga as curtidas recebidas por comentário.
- Algumas atividades do Reddit (salvos e votos) podem vir sem data; **não** são atribuídas a um ano por suposição.
- A visualização não insere fotos ou vídeos pessoais sem consentimento; para fundos, o aplicativo usa somente elementos visuais próprios.
- Nada é salvo entre recarregamentos. O cache de resultados é apenas da **memória da aba atual** para reabrir a retrospectiva sem importar novamente.
- A demonstração utiliza dados **fictícios e identificados**; nunca confundi-los com análise real.

## Código e licenças

- `app.js`: navegação dos Stories, métricas, busca em comentários, exportação PNG/TXT.
- `worker.js`: leitor local ZIP/JSON/CSV, com `pako 0.2.9` (MIT) incorporado para descompressão.
- `atelier.js`: navegação e tutorial de exportação por plataforma.
- `edition-04.css`: design e ajustes de responsividade desta revisão.
- `config.js`: chave Pix opcional. Nunca publique dados privados nessa configuração.
- `assets/brands`: Font Awesome Free, SVGs de marcas sob CC BY 4.0; veja `ATTRIBUTION.md`.
- `PRIVACIDADE.md`: políticas e orientações.

Licença do código: MIT. Marcas pertencem aos respectivos titulares. O REEECAP não é afiliado à Meta, ByteDance, Google ou Reddit.

## Próximas prioridades

1. Validar contagem de posts/Reels com exportações reais anonimizadas, inclusive deduplicação.
2. Testar ZIPs grandes em dispositivos lentos.
3. Completar os guias com capturas de telas reais e atuais, com permissões adequadas.
4. Preparar traduções para inglês e espanhol.
