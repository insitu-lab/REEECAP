# Validação local da revisão 6.4

Data: 17/11/2026. Base Git preservada: `023eca22dfa4f899308cd051c55b816efec718f0`.
Ambiente: Windows, Edge/Chromium headless isolado, Playwright, Worker real, mídia local, Canvas e MediaRecorder reais. Destinos externos foram bloqueados nos testes novos. Não houve deploy.

## Arquivos efetivamente exportados

| Evidência nativa | Resolução | Duração | Quadros decodificados | FPS efetivo | Codecs |
|---|---:|---:|---:|---:|---|
| Instagram 6.3 DEMO | 720 × 1280 | 14,817 s | 438 | 29,560 | H.264 + AAC |
| Instagram 6.4 DEMO | 720 × 1280 | 14,847 s | 853 | 57,515 | H.264 + AAC |
| TikTok 6.3 DEMO | 720 × 1280 | 20,097 s | 592 | 29,456 | H.264 + AAC |
| TikTok 6.4 DEMO | 720 × 1280 | 20,120 s | 1179 | 58,646 | H.264 + AAC |

Ambas as versões usam a demonstração existente e a mesma seleção de três cenas: intro e dois Stories. O ritmo de 2,4 s foi selecionado nas duas versões; cenas especiais conservam seus multiplicadores. O breve intervalo de fechamento do codificador explica diferenças de centésimos na duração total. A intro usa a timeline de 10 s.

Os comparativos lado a lado têm 1080 × 1024 e foram conformados a 60 fps pelo FFmpeg. **O FPS dos comparativos não mede a fluidez nativa.** As métricas acima vieram dos MP4 originais baixados pelo aplicativo.

## Movimento, relógio e áudio

- Na amostra da prévia 6.3 houve 34 chamadas/15 tempos únicos no Instagram e 43/17 no TikTok. O relógio avançava em saltos de 90 ms. O relógio novo usa timestamps de rAF.
- Na intro TikTok 6.3 foram encontrados 62 quadros consecutivos duplicados distribuídos pela sequência, com uma repetição contínua de aproximadamente 1,154 s. Nas duas intros 6.4, a comparação de quadros decodificados não encontrou duplicatas exatas.
- **Ainda há uma lacuna inicial de captura:** máximo de 284,8 ms no Instagram e 313,4 ms no TikTok. Zero duplicatas de pixels não significa ausência de todas as pausas de apresentação. Não se afirma 60 fps constantes.
- O arquivo TikTok contém dois intervalos de timestamp não crescentes na leitura do ffprobe. O Instagram final não apresentou esse caso. Ambos decodificaram integralmente e foram reproduzidos no navegador. A cadência do MediaRecorder continua sendo uma limitação a corrigir/homologar.
- Correlação entre áudio exportado e trilha original em 0,5 / 5 / 9,5 / 10,5 / 12,5 s: deslocamento estimado de **0 ms**, resolução da busca de 0,125 ms. Correlação mínima aproximada de 0,9966 no Instagram e 0,9857 no TikTok. Esse teste verifica o conteúdo e sua continuidade; não substitui avaliação musical humana.
- O áudio foi preparado com AudioBufferSource antes da captura. Os saltos automáticos de dez em dez segundos foram removidos. Não foi criado um mapa musical completo para todos os Stories.

## Paridade e interface

- Prévia e exportação: zero canais diferentes nas amostras de 0,5 / 2,5 / 5 / 8,5 / 9,5 / 9,9 / 10 s, em ambas as redes. Filmagens pausadas durante a comparação para isolar o renderizador.
- Final da intro e primeiro Story em 600 ms: diferença média de canal igual a zero.
- Interface: 320, 360, 390, 430, 768, 1024, 1280 e 1920 px; PT/EN/ES; dois temas; sem overflow horizontal detectado nas 48 combinações. Pausa e retomada verificadas nas oito larguras.
- Reprodução real em velocidade normal dos dois MP4 nativos e dos dois comparativos, até o fim, usando o decodificador do navegador. Áudio decodificado e dimensões verificados. Não houve escuta humana nem teste de saída física de som.

## Testes existentes executados

| Teste | Resultado |
|---|---|
| `test_v6_embedded.py` | PASS, após preservar o ID do canvas e corrigir CORS das imagens |
| `test_v6_export_real.py` | PASS |
| `test_5_tutorial.py` | PASS |
| `test_locale.py` | PASS |
| `test_autodetect.py` | PASS |
| `test_responsive.py` | PASS |

O adaptador `scripts/run_legacy_tests.py` troca apenas caminhos de navegador/artefatos em memória; mantém as asserções originais. Esses testes conservam o setup antigo e fixtures sintéticos. Os testes novos usam HTTP e Worker sem substituição dessas APIs. Sintaxe JS e compilação dos scripts Python também foram verificadas.

## ZIP real e teste sob carga

Um ZIP oficial Instagram disponível localmente foi importado pelo Worker e exportado com `demo=false` para um MP4 privado com áudio. Nenhum conteúdo do ZIP, comentário ou nome pessoal entrou neste documento ou no patch. Isso prova a execução desse fluxo específico, sem constituir auditoria independente de todos os campos ou validação de seis redes com dados reais.

Com CPU artificialmente reduzida em 20 vezes, a escolha automática mudou para alvo de 30 fps nas duas redes. Os arquivos completos foram gerados, mas houve apenas cerca de quatro quadros renderizados por segundo nessa carga extrema. **Esse ensaio não comprova 30 fps sustentados em celulares.** Ele também reproduziu um encerramento antecipado, corrigido dando tempo ao último `requestFrame` antes de parar o gravador.

A decodificação da trilha ocupa aproximadamente 76,5 MB no Instagram e 71,9 MB no TikTok, além dos demais recursos. Não foi medido o pico total de memória em aparelhos físicos.

## Artefatos e limites

Evidências locais ficam em `D:/Projetos/REEECAP-evidencias-6.4/`: `REVISAR.html`, MP4 nativos DEMO, comparativos, relatórios JSON, screenshots, logs legados e vídeo privado. A página de revisão não referencia o vídeo privado. O ZIP incremental e o diff não incluem esses artefatos nem dados pessoais.

Continuam pendentes: aprovação estética em movimento; cadência inicial da captura; Safari/iOS e Android físicos; memória em mobile; acessibilidade de movimento reduzido; continuidade visual de mês/calendário/encerramento; demais itens do backlog; direitos comerciais documentados. Não houve mudança de licença, pagamentos ou acesso Premium.
