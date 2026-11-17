# Clipes reais no REEECAP

Os clipes de fundo são **vídeos reais, previamente gravados**, publicados no Mixkit sob a licença *Mixkit Stock Video Free License*. Não são Reels da conta analisada, nem métricas, nem vídeos gerados por IA.

A aplicação faz streaming dos clipes de demonstração somente quando uma cena de vídeo é exibida. O navegador solicita os arquivos a `assets.mixkit.co`; por isso o IP do usuário pode ser visto pelo servidor da mídia. Arquivos exportados de redes sociais permanecem locais.

Fontes individuais e licença:
- https://mixkit.co/free-stock-video/girl-in-neon-sign-1232/
- https://mixkit.co/free-stock-video/man-dancing-under-changing-lights-1240/
- https://mixkit.co/free-stock-video/mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764/
- https://mixkit.co/free-stock-video/influencers-dancing-in-a-recording-a-tik-tok-video-42315/
- https://mixkit.co/license/modal/videoFree/

A licença permite editar e usar os clipes em projetos comerciais. Não vende nem apresenta os clipes isoladamente como biblioteca de stock. Se os clipes não carregarem com permissão CORS para canvas, **a exportação que precise do rolo de vídeo é bloqueada** para não gerar vídeo falso/mudo. Vídeos locais podem ser usados como alternativa.

**Limitação da versão:** o ambiente de construção não conseguiu baixar os MP4s externos; o pacote inclui URLs de streaming, não os arquivos. Disponibilidade e CORS externos não foram verificados no dispositivo do usuário.


## REEECAP 5
O deploy preferido agora roda `.github/workflows/publish.yml`: o script `scripts/install_media.py --strict` baixa, verifica e otimiza 4 clips, hospedando-os no mesmo domínio do REEECAP. Se não conseguir obter todos, o deploy falha. Nesta cópia de código os arquivos de terceiros não estão embutidos.
