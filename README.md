# REEECAP 2.1 — versão de desenvolvimento (não é um lançamento final)

REEECAP é uma retrospectiva visual criada a partir de **arquivos exportados pelo próprio usuário**. Esta edição é um site estático que roda o processamento de ZIP/JSON/CSV no navegador, por Web Worker. O código da área Premium não está incluído neste diretório.

## Plataformas e dados

| Plataforma | Suporte local | Limites | 
| --- | --- | --- |
| Instagram | JSON: curtidas, salvos, comentários, posts/Reels/Stories, interações e relacionamentos quando reconhecidos | A exportação pode omitir atividades; não há acesso à conta nem como medir popularidade de comentários sem os dados correspondentes |
| TikTok | JSON: histórico de vídeos, curtidas, favoritos, comentários e outras categorias reconhecidas | Os nomes/estruturas variam conforme o formato exportado |
| YouTube | JSON Google Takeout: histórico de visualização e pesquisas | Cada registro não representa necessariamente um vídeo único |
| Reddit | CSV: posts, comentários, votos, salvos conforme categorias reconhecidas | Atividades sem data não entram artificialmente nas estatísticas anuais |

Não há integração com Spotify nesta versão. A demonstração de cada rede tem dados fictícios e não mistura plataformas. O usuário deve selecionar na plataforma de origem apenas informações de atividade, evitando mensagens privadas, contatos, localização e credenciais.

## Recursos implementados e testados

- Navegação por plataforma, guias de importação, relatório anual, Stories, painel de métricas e exportação de imagem/arquivo-resumo.
- Tradução do site e relatórios em português, inglês e espanhol, com alteração durante a retrospectiva.
- Tema escuro/claro, ajustes de espaçamento e responsividade (testes de largura em Chromium entre 320 e 1920 px).
- Camadas decorativas contextualizadas (corações, avião de compartilhamento, rolos de vídeo, comentários em movimento, anéis de Stories). Sem fingir vídeos da conta do usuário.
- Compositor de vídeo 9:16 com cenas selecionáveis, durações e tamanhos configuráveis; trilha original incluída ou música escolhida pelo usuário. Sem senha nem upload.
- MP4/H.264 quando suportado pelo navegador, WebM VP9/Opus como alternativa. **Não há garantia de MP4 com som em todos os navegadores**.
- JSON de métricas **agregadas**, intencionalmente sem comentários, para importar no Studio privado (`reeecap-studio-v1`).
- Reconhecimento de categorias e reparação de casos típicos de caracteres UTF-8 mal codificados em textos exportados.

## Arquivos principais

- `index.html`, `style.css`, `atelier.css`, `edition-02.css` até `edition-06.css`: interface e revisões visuais.
- `app.js`, `atelier.js`: fluxo da retrospectiva, importação, telas e relatórios.
- `worker.js`: processamento local dos arquivos (inclui pako MIT para ZIP).
- `locale-full.js`, `experience.js`, `experience.css`: traduções, tema e controles de acesso ao Studio (apenas link).
- `video.js`: compositor de vídeo no navegador e exportação local.
- `config.js`: link do Premium desativado até configuração do domínio protegido; não coloque segredos neste arquivo.
- `CAPTURAS_E_FONTES.md`, `HISTORICO_REEECAP_2_0.md`, `ESTADO_DE_VALIDACAO.md`: fontes, decisões e pendências de lançamento.

## Rodar localmente

Execute `python -m http.server 8000` na raiz deste diretório e abra `http://localhost:8000`. Não abra via `file://`, porque o Worker precisa de um servidor local. Para publicar o site gratuito no GitHub Pages, envie o **conteúdo** desta pasta (com `index.html` na raiz) e ative Pages no ramo `main`. O código Premium deve ser publicado **separadamente e protegido por autenticação**.

## Testes executáveis

Na máquina que contém Chromium, Playwright, Python e ffprobe:

```sh
python tests/test_real_browser.py
python tests/test_locale.py
python tests/test_audio_public.py
python tests/test_story_art.py
python tests/test_responsive.py
python tests/test_big_zip.py
python tests/test_png_parity.py
```

Esses testes usam dados **sintéticos**, não são evidência de compatibilidade com toda e qualquer exportação real. O teste de ZIP grande verifica o processamento artificial de um arquivo de 400 MB no ambiente de desenvolvimento, e **não** a memória de um aparelho físico.

## Limitações críticas para um lançamento

1. Capturas *reais* e recentes dos tutoriais das quatro plataformas ainda não foram fornecidas ou licenciadas; os cartões atuais são identificados como diagramas, não prints. Ver `CAPTURAS_E_FONTES.md`.
2. Precisam ser validadas exportações genuínas e anonimizadas de Instagram, TikTok, YouTube e Reddit, com formatos e idiomas diferentes.
3. A exportação MP4 com áudio depende de codecs de cada navegador; no Chromium Linux testado, áudio+vídeo foi gerado como WebM. Postagem direta no Instagram e aparelhos Android/iOS reais ainda não foram testados.
4. O Premium está em outro pacote; não há cobrança real nem autenticação sem Cloudflare Access configurado pelo proprietário. **Não publique ou venda acesso antes disso.**

Nada é salvo automaticamente no servidor. Preferências visuais podem usar armazenamento local; arquivos originais e resultados pessoais ficam na memória da aba, até ela ser fechada. Ver `PRIVACIDADE.md`.

## Licenças

Código MIT. Componentes de terceiros e marcas em `ATTRIBUTION.md`; Instagram, TikTok, YouTube e Reddit pertencem aos respectivos titulares. REEECAP não é afiliado a essas empresas.
