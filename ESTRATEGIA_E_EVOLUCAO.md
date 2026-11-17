# REEECAP 3.0 — avaliação competitiva e decisões de engenharia

Análise realizada em 17/11/2026. Recursos dos concorrentes foram verificados em páginas públicas, não em sessões autenticadas. **Anúncio do concorrente não equivale a teste de funcionamento**.

| Produto | Observação verificável | Lacuna/oportunidade para o REEECAP |
|---|---|---|
| [Unwrapped](https://myunwrapped.com/) | Publica suporte para Instagram, TikTok, X, Facebook, LinkedIn, Threads, WhatsApp, Telegram, Spotify; promete análise no navegador, múltiplas ferramentas | Uma retrospectiva **cinematográfica** dedicada, editor consistente e exportação de cenas em vídeo |
| [Wrapped for TikTok](https://wrapped.vantezzen.io/) | Narrativas, contagens de vídeos, horários e perfis; experiência local anunciada | Histórias impactantes *sem percentis ou personalidades inventados*. Não inferir tempo de vídeo a partir da quantidade de acessos |
| [Postel Creator Wrapped](https://www.postel.app/wrapped) | Cartões de carreira de criadores, posts e engajamento | Linguagem visual editorial e narrativa da trajetória, indicando período e origem de cada dado |
| [SpawnMetrics Wrapped](https://spawnmetrics.com/wrapped/index.html) | Upload TikTok/YouTube, processamento local e imagens exportáveis | Editor multimodal e vídeo 9:16, temas variados, exportação preservando prévia |

## Ordem estratégica

**P0: Importação verificável → dados reais → vídeo:** preservar os parsers locais; aceitar ZIP/JSON/CSV conforme exportação; distinguir registros sem data; não equiparar ausência de dados a zero; permitir prévia, card PNG e vídeo. Adicionados Spotify e Facebook como parsers conservadores, e identificação automática quando inequívoca. **Ainda requer exportações reais voluntárias/anonimizadas para ampliar a cobertura.**

**P1: Experiência visual:** a mesma função `frame` do `video.js` desenha prévia e exportação; temas Neon Motion (gradientes dinâmicos), Noir Editorial (preto, círculos e tipografia) e Paper Cut (papel, linhas e colagem). O usuário escolhe cor, cenas, duração e trilha. Faltam timeline musical e efeitos avançados com otimização de GPU.

**P2: Compatibilidade de exportação:** exportação por `MediaRecorder` em 720p/1080p quando o aparelho comportar; MP4/H.264 sem áudio nos testes Chromium, WebM/Opus quando o navegador não permite AAC/MP4 com áudio. **Não mascarar WebM como MP4**. Uma futura pipeline WebCodecs + muxer ou conversão opcional só deve ser lançada após testes em iOS, Android e desktops reais.

**P3: Tutoriais oficiais:** caminhos específicos por plataforma e capturas reais com fonte, carregadas voluntariamente para não quebrar privacidade. Spotify/Meta usam seu fluxo oficial de portabilidade; TikTok JSON, YouTube Takeout, Reddit CSV. Não usar imagem de uma tela irrelevante nem prometer que versões de app não mudarão.

**P4: Premium:** Studio separado do código público, projeto JSON local, edição de cenas e exportação. Proprietário pode ser autorizado **sem cobrança** via Cloudflare Access + allowlist de e-mail e código temporário; a proteção deve cobrir o domínio e todos os arquivos. **Não está implantado**. Cobrança recorrente requer backend, webhooks validados e revogação. Nunca confiar numa flag JavaScript de Premium.

## Restrições de privacidade

Nenhum ZIP bruto passa por backend. O `worker.js` lê arquivos ZIP/JSON/CSV no dispositivo e ignora nomes de arquivos de mensagens, logins, localização, cartões e compras. A análise guarda registros apenas na memória da aba. Saídas para Studio contêm estatísticas agregadas; nunca comentários ou DMs. Capturas externas exigem um toque do usuário.

## Limites honestos desta revisão

- Testes com seis *fixtures sintéticas* baseadas em formatos documentados; não comprovam todas as variantes reais.
- Spotify diferencia eventos de reprodução de duração somada em ms; reproduções parciais ainda contam como eventos.
- Facebook suporta só manifestos e campos explicitamente reconhecidos; alcance e impressões **não são inferidos**.
- MP4 com áudio não universal; tests do navegador Linux salvam WebM/Opus.
- Fonte musical Scott Buckley CC BY 4.0 exige atribuição. O compositor disponibiliza downloads na página oficial, mas MP3s externos não estão no pacote.
- A segurança real e as assinaturas do Studio ainda não estão implantadas.

## Referências oficiais

- Meta Central de Contas: https://about.fb.com/news/2023/10/manage-your-information-across-apps/
- Spotify formatos: https://support.spotify.com/article/understanding-your-data/
- TikTok Portability API (OAuth, autorização e requisitos próprios): https://developers.tiktok.com/docs/en/data-portability-api-download
- Google Takeout: https://support.google.com/accounts/answer/3024190
- Reddit exportação: https://support.reddithelp.com/hc/en-us/articles/360043048352-How-do-I-request-a-copy-of-my-Reddit-data-and-information
- Scott Buckley / CC BY 4.0: https://www.scottbuckley.com.au/library/using-this-music/
