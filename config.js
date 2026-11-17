/* Chave Pix opcional. Não armazene credenciais, senhas ou dados de visitantes. */
window.REEECAP_CONFIG = Object.freeze({
  // Pagamentos ficam com intermediador externo; nenhuma chave Pix no app.
  supportUrls: {pix:'', paypal:''},
  premiumUrl: '', // HTTPS address of a separate Studio app protected by Cloudflare Access.
  checkoutUrls: { starter:'', creator:'', pro:'', studio:'' }, // somente URLs públicas de checkout; nenhuma chave Pix ou token
});
