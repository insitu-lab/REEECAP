# REEECAP 6.1 — atualização incremental (sobre a 6.0)

Esta atualização contém **somente os arquivos alterados e adicionados** em relação à versão `REEECAP-6.0-site-publico-Videos-Reais.zip`. Não substitui as 12 filmagens; mantenha intacta a pasta `assets/videos` já existente.

## Alterações implementadas

- Alternador de tema por SVG estável, no lugar de glifo de fonte sujeito a aparecer como `*` no computador.
- Dock mobile novamente flutuante com efeito discreto de vidro e só um destino ativo; espaçamento inferior evita cobrir o fim da página.
- Tutorial centrado com dimensões constantes, tentativa automática de imagens reais e fallback visível sem cartão vazio; remoção da contagem `1 / 03` repetida.
- Ajuste dos limites do popup, inclusive em 320 px; botão redundante de exportação removido do fluxo visível.
- Cards de passos e seções Sobre com bordas neutras; fundo com mais profundidade sem invadir os cards.
- Nova animação de faixas contínuas com **vídeos reais da versão 6.0**, comentários em colunas próximas à linguagem do Instagram, aviões com trajetórias independentes e rastros, Stories sem relógios repetidos, calendário central com interação oculta à vista e contagem animada de seguidores/seguindo.
- Renderizador de exportação continua compartilhando essas animações com o Story.
- Painel de transparência mostra apenas categorias pertinentes à rede importada. Não inventa métricas nem emojis perdidos.
- Logo oficial do INSITU LAB anexada pelo autor: preta no modo claro e branca no escuro.
- Seleção real de quatro planos promocionais no popup; checkout **não ativado** enquanto não houver URLs oficiais (responsável legal e intermediador necessários).
- Apoio Pix e PayPal preparado para URLs externas. Nenhuma chave Pix ou senha nos arquivos públicos.
- PWA: shell de páginas e JavaScript disponível offline após a primeira visita; vídeos já vistos podem entrar no cache local. O PWA não promete blindagem contra cópia e não armazena o ZIP social.
- Composições Suno originais preparadas como **pontos de integração**, mas ainda **sem arquivos de música**. Consulte `TRILHAS_SUNO_REEECAP.md`.

## Pendências externas, sem simulação de conclusão

1. **Prints autênticos**: o pacote da versão 6.0 não inclui 3 imagens reais de cada fluxo. O tutorial ainda utiliza fallback ilustrativo quando a fonte externa falha. Precisamos das imagens autorizadas para `assets/media/tutorials/{instagram,tiktok,youtube,reddit,spotify,facebook}-{1,2,3}.png`. Capturas não devem ser falsificadas nem apresentadas como screenshots verdadeiros se forem diagramas.
2. **Trilha sonora**: os MP3s originais precisam ser produzidos e enviados com direitos comerciais de distribuição. Os pontos de corte devem ser refinados ouvindo a música.
3. **Pagamentos Premium**: quatro preços mostrados como prévia; a cobrança, assinatura, autenticação e acesso de desenvolvedor continuam sem habilitação por falta de contas e links de produção.
4. **iPhone e Samsung físicos**: testes ainda necessários; não há garantia de MP4 com áudio AAC no Safari/Chromium. A compatibilidade depende das APIs de gravação dos navegadores.
5. **Código e cópias**: o REEECAP atual contém uma licença MIT herdada. Essa licença permite cópia e modificação conforme seus termos. É impossível garantir que uma aplicação executada offline seja incopiável. Para futuras versões proprietárias, rever licença e política de publicação do repositório.

## Instalação

1. Extraia o ZIP incremental na raiz da versão 6.0, preservando a estrutura das pastas e substituindo os arquivos existentes.
2. Não apague `assets/videos` ou arquivos de dados da versão anterior. Certifique-se de publicar o novo `sw.js` e `pwa.js`.
3. No GitHub Pages, aguarde o deploy e atualize o site; se houver cache antigo, recarregue a página ou reinstale o PWA.
4. Apenas quando tiver URLs HTTPS de checkout produzidas no intermediador, preencha os campos `checkoutUrls` e `supportUrls` em `config.js`. **Não coloque chave Pix, chaves de API ou tokens nesse arquivo público.**
5. No diretório raiz do repositório da versão 6.0, preserve os outros arquivos não incluídos neste patch.
