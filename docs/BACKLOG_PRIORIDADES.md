# Backlog de correções e critérios de aceitação

Legenda: **Confirmado no código** = foi visto no pacote local; **reportado** = feedback do criador; **pendente** = não validado em produção. Não atribuir status 'feito' somente pelo histórico de mensagens.

| ID | Pri. | Trabalho | Critério de aceitação | Situação ao iniciar Codex |
|---|---|---|---|---|
| M01 | P0 | Substituir motion das aberturas 6.3 Instagram/TikTok | Intro 10s, movimento contínuo real, sem planos estáticos repetidos; MP4 com áudio e aprovação visual | Reprovado pelo usuário |
| M02 | P0 | Story Likes com filmagens locais | Rolo de filme duplo alinhado, vídeos reais no fundo e exportação sem diferença da prévia | Implementação inicial, polimento pendente |
| M03 | P0 | Comentários estilo Instagram | Feed central de até ~20 comentários reais, legível sem retângulos genéricos, emoji/acentos preservados | Parcial e reportado com defeitos |
| M04 | P0 | Compartilhamentos e calendário | Aviões planam horizontalmente com trajetórias variadas; calendário tocável e automático no export | Parcial |
| E01 | P0 | Fluxo completo Instagram real | ZIP oficial → análise local → Story → vídeo vertical com áudio e sem falsos números | Não validado em arquivo real completo |
| E02 | P0 | Exportação robusta em mobile | Vídeo e som corretos, MP4/AAC quando possível, fallback explícito, qualidade legível, sem travamento | Parcial/browser-dependent |
| T01 | P0 | Tutorial obrigatório real | Modal grande 3+ prints verdadeiros/corretos, carregamento instantâneo e estável, inclui último passo | Estrutura feita; capturas faltam |
| C01 | P0 | Codificação de comentários | Emojis + diacríticos de dados legítimos permanecem; recuperação mojibake limitada e testada | Parcial/reclamação persistente |
| U01 | P1 | Polimento desktop e mobile | Sem título sobre card; menos margens; mínimo texto acessível; cards inteiros | Vários patches, repetir testes |
| U02 | P1 | Rodapé/dock | Dock líquido com 1 ativo, não cobre conteúdo; rodapé ao final e não fixo | Parcial, regressões anteriores |
| U03 | P1 | Temas/detalhes visuais | SVG sol/lua confiável, cores intencionais, sem glow barato, INSITU LAB invertido | Patches aplicados, revalidar |
| D01 | P1 | Transparência relevante | Instagram mostra só seus próprios campos e fontes; não mostrar métricas Reddit/Spotify | Patch 6.1, revalidar |
| P01 | P1 | Seis importadores com dados reais | Instagram/TikTok/Spotify/YouTube/Reddit/Facebook fixtures autênticos sanitizados | Atualmente testes sintéticos |
| X01 | P1 | Internacionalização | 100% fluxos PT/EN/ES, sem texto misto nem clipping | Testes parciais |
| S01 | P1 | UX acessível e leve | Menor carga em aparelhos fracos, reduced-motion, memory budget, navegação teclado/screenreader | Não homologado |
| B01 | P1 | PWA offline | Instalação, cache inicial, funções suportadas sem rede, atualização de versão | Parcial |
| L01 | P1 | Licenças músicas e filmagens | Direitos de distribuição confirmados, créditos completos | Verificação documental pendente |
| A01 | P2 | Studio Premium + direito de dev | Acesso autorizado backend, sem bypass client, benefícios concretos | Código privado separado, sem produção |
| A02 | P2 | Checkout e assinatura | Checkout real, webhook validado, renovação/cancelamento/refund, recibos e acesso | Não implementado em produção |
| A03 | P2 | Apoiar Pix/PayPal | Link externo seguro, sem Pix em fonte, marca no checkout, testes dados exibidos | Config vazio |
| R01 | P2 | README e distribuição | Screenshot real, link download existente, instruções claras; repo sem dados privados | README atual, rever release |
| I01 | P2 | Estratégia de proteção | Discutir MIT vs proprietário, público vs privado; proteção honesta | Decisão aberta |

**Entrega sequencial sugerida:** reproduzir problema → escolher 1 fluxo real → criar timeline de alta qualidade → testar export → lapidar visual com aprovação → aplicar padrão a outros Stories → completar UX/importadores → serviços Premium.
