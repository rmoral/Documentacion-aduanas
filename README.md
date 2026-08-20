# AduanaFácil Andorra · Site

Site estático 100% funcional para el servicio de preparación de documentación
aduanera para envíos de muebles usados de Andorra a España entre particulares.

## Documentación de guía

- **`landingaduanamuebles.html`** (raíz del repositorio): HTML original que sirve
  como **documentación de referencia** de la estructura, el diseño y los textos
  del site. No forma parte del site publicado; el site se genera a partir de él.

## Estructura del site

```
index.html              Landing principal (hero, qué recibes, cómo funciona,
                        formulario de pedido en 4 pasos y FAQ)
gracias.html            Confirmación de pedido (muestra referencia y resumen)
aviso-legal.html        Aviso legal y condiciones de contratación
privacidad.html         Política de privacidad
assets/css/styles.css   Hoja de estilos compartida
assets/js/config.js     Configuración (Stripe y endpoint de formulario)
assets/js/app.js        Lógica del formulario multi-paso
landingaduanamuebles.html  Documentación de guía (HTML original)
```

## Funcionamiento del formulario

1. **4 pasos** con validación por paso (Remitente → Destinatario → Envío → Pago)
   y barra de progreso. La tecla Enter avanza de paso, no envía el pedido.
2. Al confirmar, se genera una **referencia única** (`AF-XXXXXX`), los datos se
   guardan en `localStorage` y, si hay endpoint configurado, se envían por POST.
3. **Con Stripe configurado**: redirige al Payment Link con
   `client_reference_id` y el email prellenado.
   **Sin configurar (modo demo)**: redirige a `gracias.html?ref=...`, que
   muestra la confirmación con el resumen del pedido. El site es funcional de
   extremo a extremo sin ningún servicio externo.

## Configuración (`assets/js/config.js`)

```js
window.SITE_CONFIG = {
  STRIPE_PAYMENT_LINK: "", // URL del Payment Link de 49 € (Stripe → Productos → Payment Links)
  FORM_ENDPOINT: "",       // Endpoint tipo Formspree/Getform para recibir los pedidos
  PRECIO: "49,00 €"
};
```

- **Stripe**: crea un Payment Link de 49 € y pega la URL. Recomendado: configura
  en el Payment Link la redirección tras el pago a `https://TU-DOMINIO/gracias.html`.
- **Formulario**: crea un formulario en [Formspree](https://formspree.io) o
  Getform y pega la URL del endpoint para recibir cada pedido por email.

## Publicación

Es un site 100% estático: funciona en GitHub Pages, Netlify, Vercel o cualquier
hosting. Para GitHub Pages: *Settings → Pages → Deploy from branch → `main` → `/ (root)`*.

Para probarlo en local basta con abrir `index.html` en el navegador o servir la
carpeta:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Pendiente de completar

- Datos identificativos del titular en `aviso-legal.html` y `privacidad.html`
  (marcados con *[Completar con: ...]*).
- `STRIPE_PAYMENT_LINK` y `FORM_ENDPOINT` en `assets/js/config.js` para activar
  el pago real y la recepción de pedidos.
