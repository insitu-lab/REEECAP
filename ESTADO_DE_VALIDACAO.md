# Estado de validação — REEECAP 3.0 (17/11/2026)

**Release de desenvolvimento testável — NÃO homologado para produção.** A bateria é sintética e local, e os resultados não equivalem a validação de compatibilidade com dados de contas reais.

| Recurso | Evidência | Limite para lançamento |
|---|---|---|
| Instagram, TikTok, YouTube e Reddit | Fluxo completo navegador Chromium + importação ZIP sintético, 2026 | Dados reais não testados |
| Spotify | Extended + Basic JSON simulados; soma de ms_played, artistas, episódios, priorização do ampliado | Faltam ZIPs autênticos e histórico de conta com formatos variáveis |
| Facebook | Manifestos JSON sintéticos de posts, comentários e reações | Suporte **experimental**; faltam exportações autênticas |
| Identificação automática de rede | ZIP do Spotify importado estando em Instagram, autodetecção correta | Só nos nomes inequívocos; não promete todas as variantes |
| Privacidade | Worker local; pula pastas privadas; nenhum envio de ZIP pelo site | Audit externo ainda necessário |
| Idiomas | PT/EN/ES em 4 plataformas antigas, novos guias e métricas traduzidos | Revisão humana nas telas dinâmicas novas |
| Mobile | Playwright em 320–1920 px; 1280 reportou diferença de 1 px em scrollWidth causada por arte visual | Testes em Android/iOS físicos ainda faltam |
| Exportação vídeo vertical | MP4 H.264 720×1280 sem áudio gerado de tema Paper e validado por ffprobe | MP4 + AAC não suportado no Chromium de teste |
| Música | Loop original no pacote; escolha de arquivo local e links a 3 trilhas CC BY 4.0 | MP3 de terceiros não incluídos; atribuição obrigatória |
| Studio Premium | Editor separado preservado; testes anteriores com projetos JSON | Deploy autenticado/pagamentos não realizados |
| Prints | Telas de referência de terceiros linkadas com crédito; exigem toque | Capturas não cobrem todas as etapas nem todas as versões de app |

## Testes reproduzíveis

Com Python, playwright, Chromium e ffprobe disponíveis:

```sh
python tests/build_fixtures.py
python tests/test_real_browser.py
python tests/test_v3_integration.py
python tests/test_autodetect.py
python tests/test_locale.py
python tests/test_responsive.py
```

O teste `test_v3_integration.py` cria fixtures sintéticas deliberadamente, incluindo tentativa de inclusão de mensagens privadas para provar que elas são ignoradas. Nunca publique dados exportados por contas reais no repositório.
