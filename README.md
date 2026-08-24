# AduanaFácil Andorra · Site

Site estático 100% funcional para el servicio de preparación de documentación
aduanera para envíos de muebles usados de Andorra a España entre particulares.

## Documentación de guía

- **`landingaduanamuebles.html`** (raíz del repositorio): HTML original que sirve
  como **documentación de referencia** de la estructura, el diseño y los textos
  del site. No forma parte del site publicado; el site se genera a partir de él.

## Estructura del site

```
index.html              Landing principal en español (hero, qué recibes, cómo
                        funciona, formulario de pedido en 4 pasos y FAQ)
gracias.html            Confirmación de pedido (muestra referencia y resumen)
aviso-legal.html        Aviso legal y condiciones de contratación
privacidad.html         Política de privacidad
guias/                  Cluster de contenidos SEO en español: índice más las
                        guías "enviar muebles Andorra→España", "documentos de
                        la Farga de Moles" y "declaración jurada sin factura"
ca/                     Versión en catalán (mismas 4 páginas)
en/                     Versión en inglés (mismas 4 páginas)
fr/                     Versión en francés (mismas 4 páginas)
ru/                     Versión en ruso (mismas 4 páginas)
assets/css/styles.css   Hoja de estilos compartida
assets/js/config.js     Configuración (Stripe y endpoint de formulario)
assets/js/app.js        Lógica del formulario multi-paso
landingaduanamuebles.html  Documentación de guía (HTML original)
```

## Idiomas

El site está disponible en español (raíz), catalán (`/ca/`), inglés (`/en/`),
francés (`/fr/`) y ruso (`/ru/`). Cada página incluye un selector de idioma en
la barra superior que enlaza a la página equivalente en el resto de idiomas.
Los textos del resumen del pedido y del botón de pago se localizan mediante el
objeto `window.I18N` que cada página define antes de cargar `assets/js/app.js`
(sin definir, `app.js` usa los textos en español). Los nombres de fichero y los
`name` de los campos del formulario son idénticos en todos los idiomas, de modo
que los pedidos llegan con el mismo esquema de datos independientemente del
idioma.

## Funcionamiento del formulario

1. **4 pasos** con validación por paso (Remitente → Destinatario → Envío → Pago)
   y barra de progreso. La tecla Enter avanza de paso, no envía el pedido.
2. Al confirmar, se genera una **referencia única** (`AF-XXXXXX`), los datos se
   guardan en `localStorage` y, si hay endpoint configurado, se envían por POST.
3. **Con Stripe configurado**: redirige al Payment Link con
   `client_reference_id` y el email prellenado.
   **Sin Stripe (fase de valoración, modo actual)**: no se cobra nada. El
   pedido queda registrado en la base de datos vía `/api/pedidos` y el cliente
   pasa directamente a `gracias.html?ref=...` sin ningún paso visible más (no
   se abre el gestor de correo). Los pedidos se gestionan desde el backoffice
   `/admin`. Los textos del paso 4, del bloque «Cómo funciona» y de la página
   de gracias avisan en los 5 idiomas de que el pago (49 €) se coordina
   después por email.

## Configuración (`assets/js/config.js`)

```js
window.SITE_CONFIG = {
  STRIPE_PAYMENT_LINK: "", // URL del Payment Link de 49 € (Stripe → Productos → Payment Links)
  FORM_ENDPOINT: "/api/pedidos", // Función serverless que persiste cada pedido en Neon
  PRECIO: "49,00 €"
};
```

- **Stripe**: crea un Payment Link de 49 € y pega la URL. Recomendado: configura
  en el Payment Link la redirección tras el pago a `https://www.aduanafacilandorra.com/gracias.html`.
- **Formulario**: crea un formulario en [Formspree](https://formspree.io) o
  Getform y pega la URL del endpoint para recibir cada pedido por email.

## Backoffice y persistencia (Vercel + Neon)

El proyecto incluye una pequeña API serverless y un backoffice para gestionar
los pedidos:

```
api/pedidos.js          POST público (guarda el pedido del formulario),
                        GET y PATCH de administración (listar / cambiar estado)
api/stripe-webhook.js   Webhook de Stripe: marca el pedido como "pagado" al
                        completarse el checkout (client_reference_id = AF-XXXXXX)
api/_lib/               Cliente de base de datos, autenticación y verificación
                        de firma de Stripe
admin.html              Backoffice en /admin: listado con filtros por estado,
                        búsqueda, detalle de cada pedido y cambio de estado
vercel.json             Rewrite de /admin → /admin.html
```

Los estados de un pedido son: `pendiente` → `pagado` → `en_preparacion` →
`entregado` (y `cancelado`). El formulario guarda el pedido como `pendiente`
antes de redirigir al pago; el webhook de Stripe lo pasa a `pagado`; el resto
se gestiona desde el backoffice.

### Puesta en marcha

1. **Base de datos**: en el dashboard de Vercel, *Storage → Create Database →
   Neon* y vincúlala al proyecto. Vercel inyecta `DATABASE_URL`
   automáticamente. La tabla `pedidos` se crea sola en el primer uso.
2. **Token del backoffice**: en *Settings → Environment Variables* crea
   `ADMIN_TOKEN` con un valor largo y aleatorio. Es lo que se introduce en
   `/admin` para entrar.
3. **Webhook de Stripe** (cuando actives el pago): en el dashboard de Stripe,
   *Developers → Webhooks → Add endpoint* apuntando a
   `https://www.aduanafacilandorra.com/api/stripe-webhook` con el evento
   `checkout.session.completed`, y guarda el signing secret en la variable
   `STRIPE_WEBHOOK_SECRET` de Vercel.

Sin base de datos configurada, el site sigue funcionando: el envío del
formulario ignora el error de la API y continúa hacia la confirmación o el
pago.

## Analítica

Todas las páginas públicas cargan `assets/js/analytics.js` (con `defer`), que
inyecta **Plausible** (analítica sin cookies, no requiere banner de
consentimiento) para el dominio `www.aduanafacilandorra.com`. Para que
empiece a registrar datos hay que **crear la cuenta en
[plausible.io](https://plausible.io) y dar de alta el dominio**; hasta
entonces el script es inocuo. El fichero admite también Google Analytics 4:
basta rellenar la constante `GA4_ID` (formato `G-XXXXXXXXXX`). En local
(`localhost`/`file:`) no se envía nada. Las guías nuevas del blog automático
incluyen el script por plantilla (ver `BLOG-AUTOMATICO.md`).

## Publicación

Es un site 100% estático: funciona en GitHub Pages, Netlify, Vercel o cualquier
hosting. Para GitHub Pages: *Settings → Pages → Deploy from branch → `main` → `/ (root)`*.

Para probarlo en local basta con abrir `index.html` en el navegador o servir la
carpeta:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## SEO y posicionamiento

La estrategia completa de tráfico orgánico y posicionamiento en asistentes de
IA está en **[`ESTRATEGIA-SEO.md`](ESTRATEGIA-SEO.md)**. Infraestructura ya
incluida en el site:

- `rel=canonical` y cluster `hreflang` (es/ca/en/fr/ru + `x-default`) en las
  15 páginas indexables.
- Open Graph y Twitter Card con imagen `assets/img/og-cover.png` (1200×630).
- JSON-LD en cada portada: `Organization`, `WebSite`, `Service` (49 €) y
  `FAQPage` con las preguntas frecuentes de cada idioma.
- `robots.txt` (bloquea `gracias` y el HTML de guía; da la bienvenida a los
  crawlers de IA), `sitemap.xml` con alternates por idioma y `llms.txt` con el
  resumen citable del servicio.

**Dominio:** las URLs absolutas apuntan a
`https://www.aduanafacilandorra.com` (fijado con `tools/set-domain.sh`).
Si el dominio cambiara algún día, el mismo script lo reemplaza de nuevo:

```bash
./tools/set-domain.sh https://www.tudominio.com
```

## Pendiente de completar

- `STRIPE_PAYMENT_LINK` en `assets/js/config.js` para activar el pago online
  cuando termine la fase de valoración (mientras tanto los pedidos quedan
  registrados en la base de datos y se gestionan desde `/admin`).
- Alta en Google Search Console y Bing Webmaster Tools + envío del sitemap
  (ver `ESTRATEGIA-SEO.md`).
