# Estado de validação — REEECAP 2.1 (17 de novembro de 2026)

Este documento descreve testes concretos, sem marcar como concluído o que depende de serviços, dados ou dispositivos não disponíveis. O projeto permanece em **desenvolvimento**.

| Área | Evidência local | Status para lançamento |
|---|---|---|
| Importação Instagram, TikTok, YouTube, Reddit | Chromium com ZIPs/arquivos sintéticos de cada formato | **Parcial**: faltam exportações reais anonimizadas |
| ZIP de 400 MB | Teste com arquivo sintético de estresse | **Parcial**: falta celular real |
| Reparação de acentos | Casos sintéticos com texto português | **Parcial**: codificações reais podem diferir |
| Idiomas PT/EN/ES | Guia, Stories, métricas e interface em testes automatizados | **Parcial**: revisão linguística humana ainda recomendada |
| Responsividade | Larguras Chromium 320, 360, 390, 412, 768, 1024, 1280, 1920 px | **Parcial**: falta aparelho real |
| PNG e vídeo sem áudio | PNG e MP4 H.264 reais gerados nos testes | **Parcial**: falta integração Instagram |
| Vídeo com música | WebM com VP9/Opus gerado e inspecionado com ffprobe | **Não concluído**: MP4 universal com AAC ainda não funciona |
| Studio: editor e reordenação | Testes no Chromium com número real de cenas | **Parcial**: falta autenticação real |
| Studio: salvar/abrir JSON | Round-trip em arquivo local; JSON inválido bloqueado | **Parcial**: falta validação de uso real |
| Tutoriais com capturas reais | Apenas fontes e diagramas identificados | **Não concluído**: falta material autêntico/licenciado |
| Premium do proprietário | Plano escrito de proteção Cloudflare e PIN por e-mail | **Não concluído**: implantação externa não realizada |
| Assinaturas pagas | Nenhum provedor nem backend selecionado/implantado | **Não concluído**: não vender |

## Motivos para não publicar como versão definitiva

1. Prints de tutoriais ainda não são capturas reais.
2. Não foram feitas importações de arquivos reais de usuários, nem testes de aparelhos físicos.
3. O MP4 vertical com áudio não é gerado universalmente, e a postagem direta no Instagram não foi validada.
4. O acesso Premium requer Cloudflare configurado; a cobrança de assinaturas e seu backend não existem.

Os dados sintéticos não substituem a autorização do titular para exportar informações pessoais reais. Mesmo quando o usuário compartilhar arquivos reais para teste, reduzir/anonymizar informações privadas e nunca incluir os arquivos num repositório público.
