# Direção criativa e critérios para motion design

**Briefing do criador:** “não quero slides genéricos”; “quero nível Spotify Wrapped”; “cada intro 10 segundos”; filmagens verticais reais; animações suaves e intencionais; não usar decoração aleatória só por usar.

## Princípios
- Movimento expressa história. Em uma cena, use no máximo um gesto principal, uma resposta secundária e uma tipografia legível; efeitos não competem com números.
- Texto não pode ser cortado nem saltar de lugar. Fontes de peso/personalidade consistente, bom espaçamento e hierarquia. Contraste explícito e fundos variados mas coerentes.
- Reaproveitar imagens decorativas locais e métricas reais, sem sugerir que vídeo stock foi postado pela pessoa.
- Evitar borda neon em todo card, caixas aleatórias, microtextos, asterisco de tema e inúmeras dicas de uso.
- Se transição precisar de física/cinética complexa, implementar por timeline determinística com easing (GSAP/WAAPI/canvas/WebGL conforme viabilidade), não por setTimeout que dependa da velocidade do dispositivo.

## Intro Instagram — intenção de 10 segundos, revisar com a música real
0–2s: começa íntima com movimentos sutis e tipo editorial, fazendo aparecer fragmentos de memórias.
2–4s: escala/transformação das formas cria colagem de cenas reais, em contraste com elementos da interface social.
4–6s: transição elegante entre linguagens gráficas, revelar o **ano real selecionado** sem inventar estatísticas.
6–8s: enquadramento acelera no crescimento musical, composição passa de claro a escuro com continuidade espacial.
8–10s: clímax/revelação de REEECAP e preparação para a próxima cena de estatística, **sem ficar travado exibindo logo estático**.

## Intro TikTok — intenção de 10 segundos, outra linguagem (não só cores)
0–2s: ritmo digital marcado e recortes dinâmicos; sem strobes nocivos.
2–5s: composição tipográfica com cortes e mudanças de câmera suaves; microinterações com batida.
5–8s: aumento de energia, tipografia e vídeos recortados se reconfiguram no espaço.
8–10s: identidade REEECAP revelada e transição orgânica para 1º dado da pessoa.

## Transições entre cenas
- Do último frame da intro ao primeiro do Story: objeto, textura ou fonte compartilhada; nunca corte seco aleatório sem motivação musical.
- Áudio com pontos de corte reais detectados/selecionados, sem silêncio ou estalo entre Story 1 e Story 2.
- Exportação usa um *tempo global* `t` independente de velocidade do dispositivo; previews podem ser adaptativos mas render final tem fps alvo, timing idêntico e motion contínuo.

## Animações específicas dos Stories
1. Likes: filme real em duas faixas horizontais com bordas/quadros consistentes, posicionadas acima/abaixo, mantendo centro para número. Atenção a não ativar 12 vídeos em paralelo em celulares fracos; usar poucos decoders e poster fallback.
2. Stories: composições de arcos/perfis/grafismos coerentes com Stories, não 9 círculos/relógios voando; é uma cena de narrativa, não ícones estampados.
3. Compartilhamentos: aviões de papel com alturas/velocidades/posições/tamanhos variados, deriva suave e trilhas distintas; vetor esquerda→direita; legibilidade do número preservada.
4. Comentários: layout realmente inspirado na **estrutura** dos comentários do Instagram (avatar genérico, nome/tempo, texto, reações apenas se existirem nos dados), coluna central atrás das estatísticas, baixa opacidade, 20 entradas reais no máximo durante a sequência, descendo lentamente e parando. Sem nomes ou textos inventados, e sem mostrar comentários privados se não houver consentimento.
5. Seguindo/seguidores: transição de contagem desde 0 até número REAL com easing e forte legibilidade, sem enganar precisão.
6. Dias ativos: calendário central, páginas voando para cima; toque acelera fator de dias revelados, manter controle acessível e também versão automática para exportação. Descoberta sem instrução visual excessiva; respeitar prefers-reduced-motion.
7. Final: composição com resumo e CTA de compartilhar, sem inventar estatísticas de personalidade ou comparações com outros usuários.

## Critério de aprovação visual
Comparar um vídeo gravado da tela e o arquivo final do REEECAP. Rejeitar se houver congelamentos percebidos, tipografia cortada, repetições massivas, mismatch prévia/saída, transição que ignora música ou importações simuladas. O criador é responsável pela avaliação estética final; testes objetivos evitam regressão, mas não substituem essa aprovação.
