# REEECAP — Vídeos reais integrados (v6)

## O que entrou neste pacote

- **12 arquivos MP4 H.264 reais**, 540 × 960, sem áudio, aproximadamente seis segundos cada, fornecidos no ZIP `REEECAP-clipes-prontos.zip`.
- Todos os 12 estão fisicamente em `assets/videos/`, inclusive manifest e créditos.
- Recurso automático de filmstrip usa até **quatro elementos de vídeo simultâneos**, com troca de clipes ao terminar, para reduzir o custo no celular. O usuário **não importa vídeos** para usar o rolo de filme.
- O mesmo desenho do rolo de filme é usado nos Stories e na exportação, via `REEECAP_MOTION.draw`.
- Consulte `videos-e-creditos.html` para prévia offline e links originais de autoria/licenças.

## Licenças

Os autores e links vieram do `manifest.json` enviado junto com os clipes. As etiquetas de licença são declarações desse pacote e não foram verificadas independentemente nesta etapa. Cada arquivo deve ser conferido individualmente antes de lançamento público definitivo, especialmente as obras CC BY.

**ATENÇÃO PARA O USUÁRIO QUE PUBLICAR O VÍDEO:** gravações com licença CC BY exigem crédito ao autor e indicação de modificações (aqui foram recortadas/convertidas para 9:16). O site oferece lista de créditos. Antes de lançar globalmente, considere usar só clipes CC0 na exportação pública para não gerar postagens sem atribuição.

## O que este pacote não inclui

- Música: o ZIP enviado contém somente 12 MP4 sem áudio e os créditos, **nenhum MP3**. A rotina de publicação anterior continua buscando faixas licenciadas do Mixkit, mas sem conectividade não foi possível incorporá-las e testar as faixas na presente versão.
- Prints autênticos para todos os passos de tutorial: ainda incompletos na base herdada.
- Cobrança Premium: ainda depende de provedor e autenticação externa.

## Testes

`tests/test_v6_embedded.py` valida reprodução real dos clipes, catálogo local e renderização do Canvas em um servidor local. Testes de integração sintéticos herdados podem ser executados separadamente.
