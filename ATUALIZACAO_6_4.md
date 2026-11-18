# REEECAP 6.4 — revisão das aberturas e continuidade

Base: `insitu-lab/REEECAP`, branch `main`, commit `023eca22dfa4f899308cd051c55b816efec718f0`.
Desenvolvimento local na branch `fix/6.4-continuous-openings`. Revisão visual ainda depende do criador.

## Mudanças

- O relógio da prévia passa de incrementos de 90 ms para tempo real de `requestAnimationFrame`, com pausa e retomada.
- Aberturas de 10 s em PT/EN/ES, mantendo o ano selecionado. Instagram usa uma abertura fotográfica que se desdobra e preenche os algarismos; TikTok transforma recortes verticais em três faixas horizontais e recompõe o ano.
- A linguagem de revisitar os registros substitui os slogans anteriores. Os ataques musicais foram medidos nas trilhas fornecidas e usados para impulsos espaciais discretos.
- Os últimos 600 ms revelam o primeiro Story real. Ele continua desse mesmo tempo, sem tela preta intermediária.
- As cenas numéricas de Instagram/TikTok no estilo padrão usam a mesma composição na prévia e no vídeo, com a paleta da abertura. Os estilos Noir/Paper e o calendário existente são preservados. Comentários reais, aviões e as duas faixas de filmes continuam usando os dados/movimentos existentes.
- A prévia do Studio agora anima. O ritmo padrão de exportação passa a 7,2 s, igual ao player; as opções anteriores continuam disponíveis.
- O exportador mede o custo de desenho para escolher alvo de 60 ou 30 fps. O FPS efetivo continua dependendo do aparelho e do codificador; os relatórios medem os arquivos, sem inferir fluidez dos metadados.
- A trilha é contínua entre Stories. Foram removidos os saltos automáticos para múltiplos de 10 s. O áudio de exportação usa uma fonte Web Audio preparada antes da gravação, evitando silêncio de carregamento.
- O cache PWA foi versionado para `reeecap-shell-v6.4`.

## Verificação reproduzível

Requisitos: Python, Playwright com um Chromium instalado, FFmpeg/ffprobe, NumPy e Pillow. Os testes legados também usam BeautifulSoup. O navegador do teste é isolado do perfil pessoal.

```powershell
python tests/test_openings_64.py --out D:/Projetos/REEECAP-evidencias-6.4 --baseline
python tests/test_openings_64.py --out D:/Projetos/REEECAP-evidencias-6.4 --ui --export
python tests/test_openings_64.py --out D:/Projetos/REEECAP-evidencias-6.4 --verify
python scripts/run_legacy_tests.py --out D:/Projetos/REEECAP-evidencias-6.4/legacy
python scripts/analyze_openings.py --out D:/Projetos/REEECAP-evidencias-6.4
```

`--baseline` serve os quatro arquivos originais diretamente do commit-base para reproduzir a 6.3. O teste usa HTTP, Worker, decodificadores e MediaRecorder reais. A comparação usa a mesma demonstração e duração de Stories nas duas versões. Os números DEMO são fictícios e identificados.

`--verify` compara pixels da prévia e exportação em 0,5 / 2,5 / 5 / 8,5 / 9,5 / 9,9 / 10 s, com as filmagens pausadas para isolar o renderizador. Também compara o final da intro com o primeiro Story no mesmo tempo. Isso valida o renderizador; a captura comprimida por MediaRecorder sofre perdas e variações de desempenho.

Para um ZIP pessoal, use `--real-zip CAMINHO_LOCAL`. Esse teste bloqueia destinos externos e salva resultado e relatório privados fora do repositório. Nunca inclua esses artefatos no patch público.

## Aplicação do patch

Sobre a base indicada, copie os arquivos do ZIP incremental mantendo os caminhos. Não há exclusões. O pacote não inclui ZIP social, referências privadas, vídeos de evidência, Studio Premium nem novas cópias das músicas e filmagens.

O diff completo, o manifesto de SHA-256 e os vídeos de comparação são entregues separadamente. Confira `docs/VALIDACAO_6_4.md` para os resultados e limites do ambiente testado.

## Limites

Não houve publicação no GitHub/Pages. Safari/iOS e Android físicos não foram homologados. A decodificação da trilha usa memória adicional, registrada nas métricas do exportador; falta medir essa carga em celulares. As licenças e a aprovação estética continuam pendentes. Este patch não conclui o restante do backlog.
