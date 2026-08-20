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

   3. ORDER_EMAIL (fase de valoración, sin pasarela de pago):
      Mientras STRIPE_PAYMENT_LINK esté vacío, al confirmar el pedido
      se abre el correo del cliente con la solicitud completa dirigida
      a esta dirección (y la página de gracias ofrece reenviarla).
      Cámbiala por el email donde quieras recibir las solicitudes.
      Cuando actives Stripe, el flujo de pago vuelve a tener prioridad.
=========================================================== */
window.SITE_CONFIG = {
  STRIPE_PAYMENT_LINK: "", // ej: "https://buy.stripe.com/xxxxxxxx"
  FORM_ENDPOINT: "",       // ej: "https://formspree.io/f/xxxxxxx"
  ORDER_EMAIL: "rmoral81@gmail.com", // recibe las solicitudes mientras no hay pago online
  PRECIO: "49,00 €"
};
