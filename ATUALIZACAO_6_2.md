# REEECAP 6.2 — aberturas musicais (patch incremental)

**Base:** repositório REEECAP 6.0 + patch 6.1 já aplicado.

O ZIP contém apenas arquivos novos ou alterados. Extraia na raiz do repositório, mantendo a estrutura de pastas.

## Entregas

- Aberturas cinematográficas em canvas de **10 segundos** para Instagram e TikTok, com composições visuais distintas. O mesmo renderizador é usado na prévia e na exportação.
- `Instagrrr.mp3` (Instagram, 3:19) e `Tektirr.mp3` (TikTok, 3:07) incluídos como assets locais, sem pedir upload aos visitantes.
- Player tenta iniciar a trilha ao abrir a retrospectiva; navegadores que bloqueiam reprodução automática permitem ativar pelo botão de música.
- Exportador recebe abertura de 10 segundos e trilhas locais. A duração das demais cenas continua configurável.
- Service Worker versão 6.2, com cache dos MP3s para uso offline após instalação e primeira visita bem-sucedida.

## Atenção

- Os MP3s foram fornecidos pelo criador. **Antes de tornar público**, confirme no Suno que os arquivos foram gerados em um plano que oferece direitos para distribuição comercial. Não há como verificar a licença a partir do próprio arquivo.
- MP4 com áudio depende do navegador. Alguns dispositivos geram WebM com áudio, como antes. Não rotule WebM como MP4.
- Este patch **não** altera o sistema de pagamentos nem a autenticação Premium.
