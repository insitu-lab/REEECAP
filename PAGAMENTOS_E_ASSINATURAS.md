# Pagamentos — desenho seguro para REEECAP

## Doações voluntárias via Pix
- O botão **Apoiar via Pix** já existe, mas não deve prometer recebimento sem uma chave configurada.
- Não usar conta Binance como substituto de uma chave Pix de instituição apta ao recebimento.
- Quando houver uma conta habilitada, configurar `pixKey` e `pixName` no `config.js`. Prefira chave aleatória e avalie o nome do recebedor exibido aos pagadores.
- A contribuição **não concede** Premium nem substitui a assinatura.
- Não adicionar senhas bancárias, tokens, chaves privadas ou documentos no JavaScript público.

## Assinaturas Premium
- Escolher provedor de pagamento que ofereça cobrança recorrente (ex.: Mercado Pago ou Asaas no Brasil) em conta comercial apta. A elegibilidade, contrato, regras fiscais e idade do titular devem ser verificados com um responsável legal.
- Checkout no domínio do provedor; **o site público não recebe cartão**.
- Backend HTTPS protegido cria sessão de checkout e vincula pedido a usuário autenticado sem dados pessoais expostos no browser.
- Webhook com assinatura/autenticidade verificada, recebimento idempotente e consulta ao provedor antes de ativar plano.
- Banco armazena apenas customer id, entitlement, status, vencimento e identificadores de pagamento necessários.
- Login do Studio autentica-se no servidor; não confiar em localStorage, segredo no frontend ou botão 'Já paguei'.
- Permitir gerenciamento de cobrança, cancelamento, reembolso quando aplicável, logs mínimos e política de privacidade.
- Acesso de desenvolvedor: usuário com e-mail autorizado por servidor (Cloudflare Access + regra server-side), nunca chave exposta no repositório.
- Pagamentos em países fora do Brasil exigem avaliar provedor, regras fiscais e moedas separadamente.

## Estado desta entrega
UI visual e navegação: corrigidas e testadas. **Integração de cobrança NÃO ativada**, pois faltam conta comercial aprovada, credenciais de produção, backend e domínio de implantação. Não mostrar preços nem cobrança falsos.

Fontes oficiais consultadas em 17/11/2026: https://www.mercadopago.com.br/blog/configurar-pagamento-recorrente-mercado-pago ; https://docs.asaas.com/docs/assinaturas ; https://central.ajuda.asaas.com/hc/pt-br/articles/41909130716187-Como-funciona-o-Pix-Autom%C3%A1tico-para-cobran%C3%A7as
