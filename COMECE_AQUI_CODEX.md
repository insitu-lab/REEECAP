# Comece aqui: transferência REEECAP → Codex

Este **pacote incremental de documentação** contém arquivos novos para colocar na raiz do repositório (somente `AGENTS.md`, `docs/*`, este guia e o prompt de início). **Não substitui o código nem inclui vídeos/músicas pessoais.**

## Como usar
1. No Codex, abra/conecte o **repositório real REEECAP** (o GitHub Pages foi mostrado como `insitu-lab.github.io/REEECAP/`; confirme no GitHub qual é o repositório correto e a branch).
2. Certifique-se de que a base **6.0 → patches 6.1 → 6.2 → 6.3** está aplicada, ou peça ao Codex para conferir a versão e aplicar as diferenças sem sobrescrever alterações atuais.
3. Extraia o ZIP deste handoff na **raiz do repositório**, mantendo `docs/` e `AGENTS.md`, e faça commit. O ZIP só tem arquivos novos de documentação; não contém vídeos originais, músicas, chave Pix ou Studio privado.
4. Cole no Codex o texto de `PROMPT_INICIAL_CODEX.txt`. Dê acesso à base atual e, para revisão visual, disponibilize separadamente as **referências privadas**. Não publique capturas de dados pessoais ou o vídeo Wrapped de referência no GitHub público.
5. Solicite o primeiro PR com diagnóstico **mais correções funcionando**, testes e um MP4 de comparação. Não aceite somente um plano, um GIF estático ou screenshot de um único quadro.

## Situação resumida
- Base pública: REEECAP 6.0, 12 clipes reais verticais locais.
- Patches 6.1: UX/mobile, tutorial, renderizações; 6.2: músicas e abertura 10s; 6.3: revisão das aberturas. **6.3 visualmente reprovada pelo criador**.
- Alguns testes anteriores usaram dados sintéticos e Chromium. Não são prova de importação em seis exportações reais nem de compatibilidade total no Safari/Android.
- Studio Premium separado de desenvolvimento, sem cobrança/autenticação plena em produção.
- A primeira meta é **uma retrospectiva Instagram real** desde ZIP autêntico até MP4 com música e intro com qualidade, sem dados inventados. TikTok em seguida.

## Artefatos que o Codex deve produzir
- Diff/PR no repositório, notas de versão e lista exata de arquivos alterados.
- Testes automatizados/fixtures sanitizados sem dados pessoais.
- Vídeos de evidência de **10s de intro + Story + transição** e relatório de codec/fps/resolução/áudio.
- Relatório honesto sobre Safari iOS, Android, licenças e pagamentos ainda não configurados.

## Nota importante de código aberto
O README e `LICENSE` existentes indicam MIT. Uma aplicação pública licenciada sob MIT não se torna retroativamente incopiável por obfuscação. Resolver com decisão de distribuição/arquitetura/licença junto ao proprietário; não aplicar truques de bloqueio que quebrem o produto.
