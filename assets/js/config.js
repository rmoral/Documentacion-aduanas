/* ================= CONFIGURACIÓN DEL SITE =================
   1. STRIPE_PAYMENT_LINK:
      Crea un Payment Link de 49 € en tu dashboard de Stripe
      (Productos → Payment Links) y pega aquí la URL.
      Mientras esté vacío o con el placeholder, el site funciona en
      "modo demo": el pedido se registra y se muestra la página de
      confirmación (gracias.html) sin pasar por el pago.

   2. FORM_ENDPOINT:
      Endpoint que recibe los datos del formulario antes del pago.
      Opciones sin backend: Formspree (https://formspree.io) o Getform.
      Pega la URL de tu endpoint (ej: "https://formspree.io/f/xxxxxxx").
      Si lo dejas vacío, los datos del pedido viajan en la referencia
      (client_reference_id) y quedan guardados en el navegador.
=========================================================== */
window.SITE_CONFIG = {
  STRIPE_PAYMENT_LINK: "", // ej: "https://buy.stripe.com/xxxxxxxx"
  FORM_ENDPOINT: "",       // ej: "https://formspree.io/f/xxxxxxx"
  PRECIO: "49,00 €"
};
