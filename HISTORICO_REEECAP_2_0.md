# REEECAP 2.0 — histórico consolidado e decisões

Consolidação de decisões expressas na conversa de 16–17/11/2026, das transcrições `VID 20261116 194708.txt` / `VID 20261116 195224.txt` e das notas `REVISAO_VIDEO_01/02/03.md` da v6. **Não é um registro literal de todos os chats; é um resumo de requisitos e problemas identificados.**

## Identidade
- REEECAP é uma retrospectiva pessoal de atividade digital, inspirada na experiência de compartilhamento do Spotify Wrapped, mas sem copiar sua interface ou afirmar afiliação.
- Logo: letras brancas `REEECAP`, letra C como seta de retorno, com cores que remetem a plataformas sociais; a última solicitação sobre a seta era de inversão vertical.
- Visual premium, mobile-first, aproveitando melhor a largura do desktop. Sem decoração aleatória, fontes pequenas estranhas, ícones genéricos ou cartões parecendo feitos automaticamente.
- Alternância de temas ligados às plataformas, com modo claro/escuro. Idiomas previstos: PT/EN/ES.

## Gravação 194708 (16/11)
- Hero: título sobrepunha o card na direita; dar mais margem e melhorar a legibilidade dos elementos.
- Cards das plataformas muito próximos e defeito na borda do Instagram; aumentar espaçamento; mais altura e menos aparência comprimida.
- CTA **Criar meu recap** deve levar à seleção de aplicativo, não abrir automaticamente o Reddit.
- Fonte pequena e rótulos dos passos parecem genéricos; remover pílulas/setas decorativas sem finalidade.
- Guias: mostrar prints reais de cada aplicativo; o usuário não pode fornecer prints de todas as plataformas (ex.: Reddit).
- A seção **O que exportar** era pequena, apertada e tinha indicadores verdes incoerentes com o tema da plataforma. Tornar legível, consistente e ampla.

## Gravação 195224 (16/11)
- Na importação, botão preto só clareava no hover e existiam dois botões redundantes; manter só a ação do painel de upload.
- Demo precisa respeitar a plataforma escolhida; havia demo Reddit quando o usuário estava no Instagram.
- Houve erro ao importar um ZIP de Instagram, sendo necessário escolher Instagram novamente. Testar com exportações reais, sem publicar dados pessoais.
- Espaço acionava elemento errado em vez de pausar. O histórico de navegação do player precisava ser corrigido.
- Depois de importar, exibir uma **tela de recap pronta**, com opção central de reassistir, acessar detalhes e trocar de arquivo, sem voltar ao início do tutorial.
- Exportar vídeo com todas as estatísticas e música, preferivelmente para redes sociais.
- Nos Stories: trocar formas retangulares aleatórias por algo visualmente coerente; experimentar *filmstrips* ou movimento com conteúdo autorizado. Ícones de Stories, seguir e compartilhar deveriam ser próximos à linguagem das plataformas; comentários poderiam rolar ao fundo sem deixar os dados pessoais circularem pela internet.
- Painel de detalhes estava sobrecarregado. Comentários com acentos apareciam corrompidos; reconhecer mojibake de UTF-8.

## Decisões posteriores / 2.0
- Plataformas escolhidas: **Instagram, TikTok, YouTube e Reddit**. Spotify fora do escopo de integração atual. Facebook pode compor a inspiração de cores da marca, mas não é integração prometida.
- Core gratuito e aberto. Premium Studio separado e protegido no Cloudflare, para editor avançado/personalização; Premium não implica enviar ZIPs a um servidor.
- O proprietário testa o Premium como desenvolvedor via e-mail explicitamente autorizado / Cloudflare Access (PIN por e-mail). Isso não é um cupom público nem um bypass visível no HTML.
- **Não foram fixados preços ou processador de pagamentos.** A ativação de clientes pagantes dependerá de controle de elegibilidade no servidor, além de autenticação.
- Vídeos verticais 9:16, música original ou devidamente licenciada, exportação compartilhável e guias com prints reais conferidos. Não usar imagens ou músicas aleatórias sem direito de redistribuir.
- PT/EN/ES e claro/escuro foram pedidos; tradução de todas as estatísticas e passos ainda requer trabalho.

## Situação atual (revisão 2.0 beta)
- Preservado o processador local da v6, sua separação de plataforma, pesquisa de comentários, navegação dos Stories e reapresentação de recap.
- Corrigido overflow horizontal no celular causado pelo hero; verificação com Chromium por renderização offline.
- Modo claro/escuro, seletor PT/EN/ES **para a interface principal** e indicação honesta do Studio protegido (sem login simulado).
- Vídeo: compositor vertical com HD / Full HD, ritmo, trilha original opcional, MP4 nativo quando o navegador permitir, WebM como alternativa. Testado arquivo MP4 real de 720×1280 em Chromium.
- Nova exportação JSON de métricas **agregadas** para o editor privado, sem textos de comentários nem exportações brutas.
- Studio privado em pacote distinto, com importação JSON, editor de texto/cor/layout, exportação PNG e vídeo; **proteção Cloudflare ainda não provisionada**.

## Pendências que não devem ser consideradas resolvidas
- Prints reais de menus, com licenças/permissões adequadas e atualização por plataforma; ainda são esquemas no site público.
- Traduções completas de etapas, métricas e Stories; só a estrutura principal tem seleção de idioma.
- ZIP real de ~400 MB, validação dos contadores Instagram (posts vs Reels, duplicações), performance em celulares modestos.
- Premium na internet, identidade do desenvolvedor configurada, checkout, verificação de assinatura e autorização de pagantes; dependem da infraestrutura Cloudflare e decisões futuras.
- Verificações em celulares reais, Instagram nativo e Safari de exportação e compartilhamento de arquivos.
