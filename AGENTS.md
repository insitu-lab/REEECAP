# Instruções para Codex — REEECAP

**Leia antes de editar:** `docs/BRIEFING_CODEX_REEECAP.md`, `docs/BACKLOG_PRIORIDADES.md`, `docs/DIRECAO_VISUAL.md`, `docs/TESTES_E_CRITERIOS.md` e `docs/SEGURANCA_PAGAMENTOS_LICENCAS.md`.

## Objetivo
Evoluir o REEECAP, plataforma de retrospectivas sociais em PT/EN/ES que usa exportações de dados das redes sociais, monta Stories cinematográficos 9:16 e exporta vídeos e imagens. O criador rejeita aparência de template/IA, animação travada, interfaces quebradas e declarações de sucesso sem testes.

## Regras de execução
1. Inspecione o repositório existente antes de alterar. Preserve parsers, recursos e fluxos que funcionam. **Não recomece do zero** sem prova técnica.
2. Confirme a versão real do repositório (`git status`, log, arquivos); os documentos desta transição foram preparados com base em **6.0 + patches 6.1, 6.2, 6.3**, mas o GitHub pode estar em outra revisão. Não presuma que os patches já foram aplicados.
3. Prioridade imediata: **refazer o motion design** das aberturas Instagram/TikTok e sua continuidade nos Stories; a 6.3 foi explicitamente rejeitada pelo usuário. Depois corrigir bugs de tutorial, layout e exportação. Não vender a 6.3 como aprovada.
4. Primeiro registrar problema reproduzido, depois corrigir, executar testes, verificar visualmente vídeo gerado e mostrar evidência. Sintaxe válida não significa design bom.
5. Prévia e exportação devem compartilhar a mesma lógica de renderização/timeline, sem quadros congelados ou salto de movimento; visuais devem ser concebidos para 60 FPS quando dispositivo permitir, com fallback comprovado.
6. Dados sociais: **nunca inventar estatísticas**. Manter leitura local preferencial; proteger mensagens privadas, e-mail, credenciais, contatos, localização e outros dados desnecessários. Casos não suportados devem informar limitação específica.
7. **Nunca incluir chave Pix, segredo, token, credenciais, conta pessoal ou regras de desbloqueio Premium no front-end.** Pagamentos/benefícios passam por backend verificando webhooks assinados e entitlement. A área Premium deve ficar protegida no servidor. Links públicos de checkout são aceitáveis.
8. Trilha Instagram e TikTok já existe em `assets/media/music/` se o patch 6.2 foi aplicado. Só distribuir comercialmente após licença de uso Suno confirmada. Vídeos locais em `assets/videos/` vieram do pacote 6.0; preservar créditos e origem.
9. O produto deve poder ser instalado como PWA e permitir funcionalidades offline após armazenamento inicial. **Não prometer proteção absoluta contra cópia de código executado no cliente.** Repositório tem `LICENSE` MIT no histórico: não substituir silenciosamente a licença; discutir impacto com o criador antes de qualquer mudança.
10. Para atualizações do GitHub, o criador prefere **patch incremental contendo somente arquivos adicionados/alterados, caminhos intactos**. Forneça lista de arquivos alterados e instruções para exclusões. Se estiver usando Git, prefira commit/PR com diff verificável em vez de publicar ZIP completo.
11. Aponte limitações reais, não construa botões falsos. Não declarar 100% pronto sem importadores reais, exportação consistente e homologação mobile.
12. Mantenha o projeto e o Studio privado separados. Nunca mova o Studio Premium privado para o repositório público sem autorização.

## Definition of Done por tarefa
- Teste reprodutível, métricas de desempenho e prova visual do resultado (capturas e, em motion, vídeo gerado completo).
- Playwright/Chromium para desktop e viewports 320/360/390/430/768/1280/1920; testar Safari/iOS e Android real quando disponível.
- Sem overflow horizontal, sem colisões, contrastes legíveis e animação com continuidade.
- Exportação real: abrir arquivo final, conferir fps, tamanho, codificação, áudio, sincronismo, duração e o começo/final de cada transição.
- Documentar itens que dependem de serviços externos / dispositivos não disponíveis.
