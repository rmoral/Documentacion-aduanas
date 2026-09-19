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
3. El modo del site lo decide el **servidor** (variable `STRIPE_PAYMENT_LINK`
   en Vercel). El front consulta `GET /api/pedidos?config=1` al cargar y los
   textos del paso 4 cambian solos en los 5 idiomas (clases
   `.solo-valoracion` / `.solo-pago` conmutadas por `html.pago-online`).
   **Con pago online activo**: el POST a `/api/pedidos` devuelve la URL de
   Stripe con la referencia ya asociada y el cliente es redirigido a pagar;
   el webhook marca el pedido como pagado. Al volver de Stripe,
   `gracias.html` recupera la referencia desde `localStorage`
   (`ultimo_pedido`) aunque la URL no la traiga.
   **Sin configurar (fase de valoración)**: no se cobra nada; el pedido queda
   registrado como `pendiente` y el cliente pasa directamente a
   `gracias.html?ref=...`. Los pedidos se gestionan desde `/admin`.

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
4. **Activar el pago online**: guarda la URL del Payment Link en la variable
   de entorno `STRIPE_PAYMENT_LINK` de Vercel (es el único interruptor: activa
   la redirección al pago del formulario web, las respuestas de la API y del
   MCP con la URL de pago, y los textos de pago del paso 4). En el Payment
   Link de Stripe, configura la redirección tras el pago a
   `https://www.aduanafacilandorra.com/gracias.html`. El
   `STRIPE_PAYMENT_LINK` de `assets/js/config.js` queda solo como respaldo si
   la API no responde.
5. **Notificaciones de pedidos por email (Resend)**: crea una cuenta en
   [resend.com](https://resend.com), genera una API key y guárdala en la
   variable `RESEND_API_KEY` de Vercel. Con eso, cada pedido nuevo y cada
   pago confirmado envían un aviso a `NOTIFY_EMAIL` (por defecto
   rmoral81@gmail.com). El remitente por defecto es `onboarding@resend.dev`
   (solo entrega al email de la cuenta Resend); para enviar desde
   `pedidos@aduanafacilandorra.com`, verifica el dominio en Resend y define
   `RESEND_FROM`. El envío nunca bloquea el pedido: si falla, el pedido se
   registra igualmente.

Sin base de datos configurada, el site sigue funcionando: el envío del
formulario ignora el error de la API y continúa hacia la confirmación o el
pago.

## Compra por agentes de IA (agentic commerce)

El site permite que un agente de IA compre el servicio en nombre de su usuario:

- **Servidor MCP** en `api/mcp.js` (endpoint `https://www.aduanafacilandorra.com/api/mcp`,
  streamable HTTP sin estado, construido con `mcp-handler`). Herramientas:
  `consultar_servicio`, `crear_pedido` (devuelve referencia + bloque `pago`) y
  `estado_pedido` (referencia + email del remitente). Un agente lo añade como
  servidor MCP remoto sin autenticación.
- **API REST** documentada en `openapi.json` (raíz del site): `POST
  /api/pedidos` para crear el pedido y `GET /api/pedidos?ref=...&email=...`
  para el seguimiento sin token (exige que referencia y email coincidan).
- **Descubrimiento**: `llms.txt` incluye la sección «Para agentes de IA» con
  los endpoints y el flujo de pago; `robots.txt` da la bienvenida a los
  crawlers de IA; las portadas tienen la sección visible «¿Eres un agente de
  IA?» en los 5 idiomas; CORS abierto en `/api/mcp`, `/api/pedidos`,
  `/openapi.json` y `/llms.txt` (vercel.json).
- **Pago**: con `STRIPE_PAYMENT_LINK` configurada, la respuesta de creación
  incluye la URL de Stripe con `client_reference_id`; el webhook marca el
  pedido como pagado. Sin configurar, el bloque `pago` indica
  `coordinacion_email` (fase de valoración, sin pago inmediato).

### Descubrimiento para agentes

- **`/.well-known/mcp-server`**: documento JSON que anuncia el servidor MCP
  (endpoint, transporte, herramientas). Sigue la dirección del borrador IETF
  *draft-serra-mcp-discovery-uri*; revisar el formato cuando el estándar se
  publique. El borrador define además un registro **DNS TXT** de
  descubrimiento: cuando se estabilice, añadir en el DNS del dominio un TXT
  (host sugerido `_mcp`) apuntando a
  `https://www.aduanafacilandorra.com/api/mcp`.
- **`server.json`** (raíz del repo): manifiesto del servidor en el **MCP
  Registry oficial**. **Ya publicado** (2026-09-19) como
  `com.aduanafacilandorra.www/mcp` v1.0.0, verificado por HTTP contra
  `www.aduanafacilandorra.com` (el apex redirige con 308 y el registro no
  sigue redirecciones, de ahí el `.www` del namespace). La clave pública de
  verificación vive en `/.well-known/mcp-registry-auth`; la privada la
  custodia el propietario. Para publicar nuevas versiones: subir `version`
  en server.json y ejecutar
  `mcp-publisher login http --domain www.aduanafacilandorra.com --private-key <hex>`
  y `mcp-publisher publish`. Si la clave privada se pierde, generar otro par,
  reemplazar el fichero well-known y redesplegar. Pendiente: listar también
  el servidor en directorios usados por los clientes (Smithery, PulseMCP).
- **JSON-LD**: el nodo `Service` de las 5 portadas incluye `potentialAction`
  (`OrderAction` → EntryPoint `POST /api/pedidos`), señalando a los crawlers
  que el servicio es comprable de forma programática.
- **`/.well-known/security.txt`** (RFC 9116): contacto de seguridad; caduca
  anualmente (campo `Expires`), renovar la fecha cada año.

Conectores externos que se configuran a nivel de cuenta (no de código) cuando
se quiera ir más allá del enlace de pago:

- **ACP (Agentic Commerce Protocol)** — estándar abierto de Stripe, OpenAI y
  Meta que usan ChatGPT y otros asistentes para el checkout integrado
  («Instant Checkout»). Se solicita desde el dashboard de Stripe con la
  *Agentic Commerce Suite*; al activarla, la suite cubre también **UCP**
  (Universal Commerce Protocol, de Google) sin integración adicional.
- **MPP (Machine Payments Protocol)** — estándar de Stripe/Tempo sobre HTTP
  402 para pagos autónomos máquina-a-máquina. Nuestra API ya devuelve las
  instrucciones de pago en JSON, por lo que adoptar MPP sería añadir la
  cabecera 402 al flujo cuando Stripe lo active en la cuenta.

## Analítica

Todas las páginas públicas cargan `assets/js/analytics.js` (con `defer`), que
gestiona **Google Analytics 4** (`GA4_ID = "G-R90F53PYSP"`) con un **banner de
consentimiento** en el idioma de cada página: GA4 y sus cookies solo se cargan
si el visitante acepta, la elección se guarda en `localStorage`
(`cookie_consent_v1`) y la política de privacidad lo refleja en los 5 idiomas.
El fichero también admite **Plausible** (analítica sin cookies, se carga sin
consentimiento) rellenando `PLAUSIBLE_DOMAIN`. En local (`localhost`/`file:`)
no se envía nada ni se muestra el banner. Las guías nuevas del blog automático
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
