# Segurança, pagamentos, direitos e privacidade

## Privacidade
- Não compartilhar o ZIP da conta social nem comentários com terceiros. Nunca enviar dados do usuário para servidor, analytics ou IA sem opt-in específico; preferir processamento local com Web Worker.
- Sem senhas de rede social; orientar exportação de dados mínima. Filtrar chats, endereços, dispositivos, contatos e informações de segurança.
- Arquivos usados nos testes devem ser de demonstração ou anonimizados; screenshots reais dos usuários são **referências privadas**, não material público.

## Pix e apoios
O criador compartilhou uma chave Pix aleatória em chat anterior. **Não copiar, repetir, armazenar ou inserir esta chave em nenhum código, prompt público, README ou docs.** Decidiu que nome do titular pode aparecer no aplicativo bancário no momento do pagamento, mas não como destaque inicial.
Usar páginas de checkout HTTPS gerenciadas pelo provedor ou um backend próprio que cria cobranças; site público mostra apenas URLs públicas apropriadas, jamais credenciais. A página de apoio pode ter valores sugeridos e opção flexível, depois de integrações reais com o processador.

## Premium
Quatro planos foram solicitados. O usuário mencionou descontos e exemplos de R$ 9→5 e R$ 14→10; números dos demais planos não foram aprovados. Não inventar preços/promessas. Resolver catálogo definitivo com criador antes do checkout. Assinaturas exigem cobrança real, webhooks verificados, estado de assinatura no servidor, cancelamento, renovação e área Premium protegida.
Conta de desenvolvimento deve ser liberada apenas por allowlist no backend/auth provider, não por CPF, username, chave mestra no front-end ou código embutido. Responsável legal/financeiro deve gerenciar a conta de pagamentos conforme exigência do provedor.

## Licenças e mídias
- 12 vídeos reais locais provenientes de lote com manifestos de atribuição; conferir licença específica de cada arquivo antes de comercializar.
- Músicas Instagram e TikTok enviadas pelo criador; verificar plano Suno/direitos comerciais e termos de distribuição antes de publicar. MP3 por si só não comprova licença.
- Referências Wrapped de terceiros para análise criativa, **não distribuir ou reusar clipes protegidos dentro do projeto público**.
- Repositório original inclui licença MIT. MIT concede direitos de cópia conforme termos e versões já distribuídas sob essa licença não podem simplesmente ser tornadas 'incopiáveis'. Uma aplicação PWA/offline entrega código ao cliente. Proteção técnica pode atrasar cópia casual, não impedir engenharia reversa. Discutir licença futura e separação backend/segredos antes de mudanças.
