# REEECAP — recap everything.

Uma retrospectiva independente e gratuita das suas atividades digitais, feita **no navegador**, sem upload, login ou backend.

## Versão de design (edição 02)

A interface inclui vitrine compacta de plataformas, prévia interativa clicável, fluxo guiado por etapas e visualização em tela cheia. A prévia mostra dados **fictícios e identificados**; o motor de análise continua em beta. A folha `edition-02.css` contém os ajustes visuais desta edição.

## Situação deste protótipo

- **Instagram (beta):** curtidas, salvos, comentários, Stories, contas seguidas, seguidores, publicações, Reels e outras categorias, conforme o JSON exportado.
- **TikTok (beta):** vídeos assistidos, curtidos, salvos, compartilhamentos, comentários e pesquisas conforme a estrutura da exportação.
- **YouTube (beta):** histórico de visualização e de pesquisa em JSON do Google Takeout.
- **Spotify (beta):** histórico básico ou ampliado de reprodução, incluindo tempo reproduzido, artista e faixa quando constarem do arquivo.
- **Reddit:** planejado; ainda não lê o CSV exportado.

**Importante:** formatos de exportação variam. O REEECAP **não inventa estatísticas**, não deduz tempo de tela pelo total de vídeos nem estima compartilhamentos via Direct. Um campo não exportado é mostrado como *não encontrado*, não como zero. Os números de compartilhamentos abrangem apenas eventos que a plataforma disponibiliza separadamente. Datas/horas são tratadas em UTC neste protótipo.

## Como usar

1. Abra o site e escolha a plataforma.
2. Siga o passo a passo para exportar somente as atividades relevantes em JSON. **Não inclua mensagens, contatos, fotos, senhas, arquivos pessoais ou localização.**
3. Após o download da plataforma, importe o arquivo `.zip` **sem extrair** (ou `.json` individual).
4. Selecione o ano, percorra os cards e abra o painel de métricas. Você pode baixar um card PNG ou um resumo TXT.

## Rodar localmente

Este site é estático. Para testar o processamento com *Web Workers*, abra por HTTP (não via `file://`):

```bash
cd insta-recap
python3 -m http.server 8000
# acesse http://localhost:8000
```

Para publicar em GitHub Pages, envie a pasta inteira para a raiz do repositório e habilite Pages em **Settings → Pages → Deploy from a branch**.

## Privacidade e segurança

- Não há login, servidor de análise, cookies, pixels de rastreamento, analytics ou transmissão de ZIP/JSON. O CSP bloqueia conexões (`connect-src 'none'`).
- O processamento de ZIP/JSON usa um Web Worker do próprio site. Apenas JSONs de atividades reconhecidas entram no leitor; categorias e mídias privadas são ignoradas.
- O arquivo não é armazenado no aparelho pelo site. Os dados carregados ficam na memória até fechar/recarregar a página.
- Arquivos ZIP podem ocupar centenas de MB. O leitor descarta entradas de mídia e limita cada JSON a 260 MB descompactados, mas aparelhos com pouca memória ainda podem não concluir grandes análises. Não há garantia de suporte a todo ZIP de 400 MB; exportar apenas atividades é preferível.
- Evite compartilhar o ZIP com terceiros. Para colaborar com um formato de exportação, crie exemplos **fictícios e anonimizados**.
- A chave Pix em `config.js` é opcional. Adicione apenas chave pública apropriada para divulgação — **nunca** credenciais privadas.
- Leia [PRIVACIDADE.md](PRIVACIDADE.md) para mais detalhes.

## Arquivos

- `index.html` / `style.css`: interface e experiência narrativa;
- `app.js`: story player, painel, gráficos, resumo e PNG;
- `worker.js`: leitura de ZIP e normalização de atividades;
- `vendor/pako_inflate.min.js`: descompressão DEFLATE incluída localmente (pako 0.2.9, licença MIT);
- `config.js`: Pix opcional.

## Localização / idiomas

Interface inicial em português do Brasil. Tradução completa para inglês e espanhol está planejada; as exportações podem trazer campos em outros idiomas e serão ampliadas a partir de amostras fictícias.

## Licença

MIT. Não afiliado à Meta, TikTok, Google/YouTube, Spotify ou Reddit. As marcas pertencem aos respectivos titulares.
