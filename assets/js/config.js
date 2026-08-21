/* ================= CONFIGURACIÓN DEL SITE =================
   1. STRIPE_PAYMENT_LINK:
      Crea un Payment Link de 49 € en tu dashboard de Stripe
      (Productos → Payment Links) y pega aquí la URL.
      Mientras esté vacío o con el placeholder, el site funciona en
      "modo demo": el pedido se registra y se muestra la página de
      confirmación (gracias.html) sin pasar por el pago.

   2. FORM_ENDPOINT:
      Endpoint que recibe y guarda los datos del formulario antes del pago.
      Por defecto apunta a la función serverless del propio proyecto
      ("/api/pedidos"), que persiste cada pedido en la base de datos Neon
      vinculada en Vercel. También admite un endpoint externo tipo
      Formspree/Getform si se prefiere (ej: "https://formspree.io/f/xxxxxxx").
      Si se deja vacío, los datos del pedido viajan solo en la referencia
      (client_reference_id) y quedan guardados en el navegador.
=========================================================== */
window.SITE_CONFIG = {
  STRIPE_PAYMENT_LINK: "", // ej: "https://buy.stripe.com/xxxxxxxx"
  FORM_ENDPOINT: "/api/pedidos",
  PRECIO: "49,00 €"
};
