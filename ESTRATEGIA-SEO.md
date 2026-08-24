# Estrategia de posicionamiento orgánico y en asistentes de IA — AduanaFácil Andorra

**Objetivo:** captar el máximo de clientes con tráfico orgánico (Google/Bing) y
con menciones/citas en asistentes de IA (ChatGPT, Claude, Gemini, Perplexity),
sin inversión en publicidad.

**Fecha:** agosto 2026 · **Site:** landing transaccional en 5 idiomas (ES/CA/EN/FR/RU).

---

## 1. Resumen ejecutivo

Vendemos un servicio ultra-nicho ("documentación aduanera para enviar muebles
usados de Andorra a España sin factura") con volumen de búsqueda pequeño pero
intención de compra altísima y competencia orgánica casi nula. La estrategia
correcta no es pelear keywords genéricas de logística, sino:

1. **Dominar el nicho exacto** con SEO técnico impecable (hecho en este commit)
   y contenido que responda todas las preguntas del proceso.
2. **Convertirnos en LA fuente citable** sobre "aduana Andorra–España para
   particulares": los asistentes de IA responden estas preguntas hoy sin tener
   una buena fuente; el que la publique primero se lleva las citas.
3. **Capturar la demanda lateral** (mudanzas Andorra–España, IVA de importación,
   Farga de Moles, comprar muebles en Andorra) con un cluster de guías que
   deriven al servicio.

Con ~10 páginas de contenido bien hechas y las bases técnicas ya aplicadas, es
realista aspirar a la posición 1–3 en casi todas las búsquedas del nicho en
2–4 meses, y a aparecer en respuestas de IA en un plazo similar.

---

## 2. Punto de partida: auditoría del site

### Lo que ya estaba bien
- Contenido claro, orientado a conversión, con H1 único y jerarquía correcta.
- `<title>` y `meta description` bien redactados en los 5 idiomas.
- FAQ con `<details>/<summary>` (contenido indexable y "citable").
- Páginas de gracias con `noindex`. Site estático y rápido (sin frameworks).
- `preconnect` a Google Fonts, formulario accesible con labels.

### Lo que faltaba (CORREGIDO en este commit)
| Problema | Impacto | Solución aplicada |
|---|---|---|
| Sin `rel=canonical` | Riesgo de contenido duplicado (`/` vs `/index.html`) | Canonical absoluto en las 15 páginas indexables |
| Sin `hreflang` | Google no entiende la relación entre los 5 idiomas; canibalizaciones | Cluster hreflang completo + `x-default` en cada página y en el sitemap |
| Sin `robots.txt` ni `sitemap.xml` | Indexación lenta e incompleta | Creados; sitemap con alternates por idioma |
| Sin datos estructurados | Sin rich results ni señales para IA | JSON-LD `Organization` + `WebSite` + `Service` (precio 49 €) + `FAQPage` (5 preguntas) por idioma |
| Sin Open Graph / Twitter Card | Compartir en WhatsApp/redes sin imagen ni título | OG + Twitter completos + imagen `assets/img/og-cover.png` (1200×630) |
| `landingaduanamuebles.html` accesible | Duplicado exacto de la home indexable | Bloqueado en `robots.txt` |
| Nada pensado para crawlers de IA | Invisible para GPTBot/ClaudeBot | `llms.txt` con resumen citable del servicio; robots.txt da la bienvenida explícita a los bots de IA |

### ✅ Dominio fijado
El dominio definitivo es **https://www.aduanafacilandorra.com** (aplicado con
`tools/set-domain.sh` en agosto 2026). Si cambiara, ejecutar de nuevo:

```bash
./tools/set-domain.sh https://www.tudominio.com
git add -A && git commit -m "Fija el dominio definitivo" && git push
```

**Recomendación de dominio:** comprar un dominio propio (p. ej.
`aduanafacilandorra.com`) en lugar de usar `*.vercel.app`. Un dominio propio es
imprescindible para la credibilidad, los enlaces y las citas en IA. Decidir
desde el día 1 la versión canónica (con o sin `www`) y redirigir 301 la otra.

### Pendiente técnico (no automatizable desde el repo)
1. **Google Search Console**: verificar propiedad, enviar `sitemap.xml`,
   solicitar indexación de la home en los 5 idiomas.
2. **Bing Webmaster Tools**: igual de importante que GSC para IA — *ChatGPT usa
   el índice de Bing para navegar*. Importa la propiedad desde GSC en 2 clics.
3. **Analítica**: instalar [Plausible](https://plausible.io) o GA4 (Plausible:
   1 línea, sin banner de cookies, recomendado para esta landing).
4. Configurar `STRIPE_PAYMENT_LINK` y `FORM_ENDPOINT` (sin esto el tráfico no
   convierte: es la prioridad cero real del negocio).

---

## 3. A quién atacamos: búsquedas e intención

**Cliente tipo:** particular (residente en Andorra o comprador español) que
tiene que pasar muebles usados por la Farga de Moles y descubre —normalmente
con el transportista ya contratado— que necesita "papeles de aduana" que no
sabe hacer. Urgencia alta, disposición a pagar, cero fidelidad de marca:
**gana quien aparezca en el momento de pánico**.

### Keywords objetivo (español — mercado principal)

**Transaccionales (la home debe rankear para estas):**
- documentación aduana Andorra España muebles
- pasar muebles por la aduana de Andorra
- enviar muebles de Andorra a España
- declaración jurada aduana muebles usados
- papeles aduana mudanza Andorra España
- factura proforma aduana Andorra

**Informacionales (las capturan las guías del cluster, ver §4):**
- qué documentos pide la aduana de la Farga de Moles
- IVA importación muebles usados Andorra
- cuánto cuesta pasar la aduana de Andorra a España
- enviar paquete de Andorra a España aduana
- mudanza de Andorra a España requisitos / trámites
- sacar muebles de Andorra sin factura
- DUA exportación Andorra particulares
- comprar muebles en Andorra y llevarlos a España

**Catalán:** documentació duana Andorra Espanya, passar mobles per la duana,
mudança Andorra Espanya. (Competencia aún menor; público de La Seu, Lleida y
Barcelona muy relevante.)

**Inglés/Francés/Ruso:** "shipping furniture from Andorra to Spain customs",
"moving from Andorra to Spain paperwork", "déménagement Andorre Espagne
douane", "documents douane Andorre", "перевезти мебель из Андорры в Испанию".
Expatriados y residentes extranjeros en Andorra: menos volumen, ticket igual,
competencia nula.

---

## 4. Estrategia de contenidos: el cluster de guías (LA palanca principal)

Una landing sola no puede rankear para 30 búsquedas informacionales. La
solución estándar y la que mejor funciona para AEO es un **cluster de
contenido**: guías largas y honestas que respondan la pregunta completa
(aunque el lector pudiera hacerlo solo) y ofrezcan el servicio como atajo.
La generosidad del contenido es exactamente lo que los buscadores y las IA
premian con posiciones y citas.

**Crear `/guias/` (y `/ca/guies/` en catalán; EN/FR/RU pueden esperar) con:**

| # | Guía (URL propuesta) | Keyword principal | Prioridad |
|---|---|---|---|
| 1 | `/guias/enviar-muebles-andorra-espana/` — Guía completa 2026: enviar muebles usados de Andorra a España | enviar muebles Andorra España | ★★★ |
| 2 | `/guias/documentos-aduana-farga-de-moles/` — Qué documentos pide la aduana de la Farga de Moles (con checklist descargable) | aduana Farga de Moles documentos | ★★★ |
| 3 | `/guias/declaracion-jurada-muebles-sin-factura/` — La declaración jurada: cómo enviar muebles sin factura de compra (con ejemplo/modelo) | declaración jurada aduana sin factura | ★★★ |
| 4 | `/guias/iva-importacion-muebles-usados/` — Cuánto pagarás de IVA al importar muebles usados de Andorra (con ejemplos numéricos) | IVA importación Andorra España | ★★☆ |
| 5 | `/guias/mudanza-andorra-espana/` — Mudanza de Andorra a España: trámites, plazos y costes | mudanza Andorra España | ★★☆ |
| 6 | `/guias/factura-proforma-aduana/` — Qué es la factura proforma que pide la aduana y cómo se hace | factura proforma aduana | ★☆☆ |
| 7 | `/guias/transportistas-andorra-espana/` — Cómo elegir transportista para cruzar la frontera (y qué te va a pedir) | transporte muebles Andorra España | ★☆☆ |
| 8 | `/guias/comprar-muebles-en-andorra/` — Comprar muebles o enseres en Andorra y llevarlos a España: lo que nadie te cuenta | comprar muebles en Andorra | ★☆☆ |

**Formato de cada guía (pensado para SEO clásico *y* para citas de IA):**
- 1.200–2.000 palabras. Respuesta directa a la pregunta **en el primer
  párrafo** (40–60 palabras citables — es lo que extraen los LLMs y los
  featured snippets), y después el desarrollo.
- H2/H3 en forma de pregunta, listas y tablas (costes, plazos, documentos).
- Datos concretos y verificables: importes de IVA con ejemplos, horario y
  ubicación de la Farga de Moles, qué es un DUA, normativa de la unión
  aduanera UE–Andorra. La especificidad es lo que genera citas.
- Bloque FAQ propio al final + JSON-LD `FAQPage` y `Article` (+ `HowTo` donde
  aplique, p. ej. guía 3).
- Fecha de publicación y de última revisión visibles ("Actualizado agosto
  2026") — las IA y Google favorecen contenido fresco y fechado.
- Autoría visible ("Escrito por el equipo de AduanaFácil Andorra, que prepara
  expedientes aduaneros Andorra–España cada semana") — señal E-E-A-T.
- CTA no invasivo hacia la home ("¿Prefieres que te lo preparemos nosotros?
  49 €, listo en 24 h") + enlaces internos entre guías y hacia/desde la home.
- Añadir cada guía al `sitemap.xml` y a `llms.txt`.

**Ritmo recomendado:** 2 guías/semana → cluster completo en un mes. Las tres
★★★ la primera semana: son las que más convierten.

**Además, en la home (ES ya tiene 5 FAQs):** ampliar a 8–10 FAQs añadiendo las
preguntas de mayor búsqueda: "¿Cuánto cuesta pasar muebles por la aduana de
Andorra?", "¿Qué es la aduana de la Farga de Moles?", "¿Sirve también para una
mudanza completa?", "¿Puedo hacerlo yo mismo gratis?" (responder que sí con
honestidad y explicar qué resolvemos nosotros: esta honestidad rankea y
convierte). Replicar después en los otros idiomas y regenerar el JSON-LD.

---

## 5. AEO/GEO: aparecer en ChatGPT, Claude, Gemini y Perplexity

Cuando alguien pregunta a ChatGPT "¿qué papeles necesito para pasar muebles de
Andorra a España?", hoy recibe una respuesta genérica sin proveedor. Ese hueco
es la mayor oportunidad de este negocio. Cómo se gana:

1. **Ser rastreable** *(hecho)*: robots.txt permite GPTBot, ClaudeBot,
   Google-Extended, PerplexityBot; `llms.txt` publicado con el resumen del
   servicio, precio y garantía.
2. **Estar en el índice de Bing** — ChatGPT navega con Bing. Alta en Bing
   Webmaster Tools la misma semana que el dominio (§2).
3. **Contenido con formato de respuesta** *(en marcha)*: FAQs con schema,
   párrafos-respuesta al inicio de cada guía, datos concretos con cifras. Los
   LLMs citan a quien les da la respuesta ya redactada.
4. **Consistencia de entidad**: mismo nombre ("AduanaFácil Andorra"), misma
   descripción y mismo dominio en el site, schema.org, directorios y perfiles.
   Las IA construyen su "conocimiento" de una marca por triangulación de
   fuentes: cuantas más fuentes independientes digan lo mismo, antes existes.
5. **Estar donde las IA leen**: las respuestas de LLM sobre nichos salen de
   Reddit, foros y prensa local. Acciones concretas y legítimas:
   - Responder (como marca, con transparencia) hilos reales sobre mudanzas
     Andorra–España en r/andorra, ForoAndorra, grupos de Facebook de
     expatriados ("Expats in Andorra") y foros de mudanzas. Aportar la
     respuesta completa y enlazar la guía, no la home.
   - 1–2 apariciones en medios locales (Diari d'Andorra, Bondia, Altaveu):
     una nota tipo "el trámite que atasca a los particulares en la Farga de
     Moles" funciona como fuente citable durante años.
   - Ficha en directorios: Google Business Profile (§6), Páginas Amarillas
     Andorra, directorios de empresas andorranas.
6. **Medir**: preguntar mensualmente a ChatGPT/Claude/Gemini/Perplexity las
   5–6 preguntas clave del nicho y anotar si aparecemos y con qué enlace.
   En analítica, segmentar el tráfico con referer de chatgpt.com, gemini.google.com,
   perplexity.ai y claude.ai para ver la conversión de ese canal.

---

## 6. Autoridad: enlaces, local y reseñas

El nicho necesita pocos enlaces para dominar — pero necesita algunos:

- **Google Business Profile** (categoría "Servicio de gestión documental",
  dirección en Andorra): imprescindible para "aduana Andorra" en Maps y para
  que Gemini nos conozca. Pedir reseña a **cada** cliente tras la entrega del
  expediente (email de gracias con enlace directo). 10 reseñas de 5★ en un
  nicho vacío son una barrera de entrada brutal.
- **Partnerships con transportistas y empresas de mudanzas** Andorra–España
  (La Seu d'Urgell, Lleida, Barcelona, Andorra la Vella): les quitamos un
  problema (clientes sin papeles). Proponer: ellos nos enlazan/recomiendan,
  nosotros les mandamos los clientes que "todavía buscan transportista"
  (¡el formulario ya captura ese dato en la Casilla 13!). Es el canal de
  referidos + enlaces más natural del negocio.
- **Prensa local andorrana** (ver §5.5) y blogs de expatriados (guest post
  honesto: "moving out of Andorra: the customs paperwork nobody warns you
  about").
- Inmobiliarias y gestorías andorranas que atienden a gente que se marcha:
  una recomendación suya vale oro.

Evitar: comprar enlaces, granjas de directorios, spam de foros. Con 10–15
enlaces reales y locales es suficiente para este nicho.

---

## 7. Medición y KPIs

| KPI | Herramienta | Objetivo 90 días |
|---|---|---|
| Páginas indexadas | GSC (cobertura) | 15 actuales + guías |
| Posición media keywords transaccionales | GSC (rendimiento) | Top 3 |
| Clics orgánicos/mes | GSC | 300–500 |
| Tráfico desde IA (referers chatgpt/perplexity/gemini) | Plausible/GA4 | Primeras visitas ≤ día 60 |
| Citas en respuestas de IA (test manual mensual) | Hoja de cálculo | Citados en ≥2 de 4 asistentes |
| Pedidos orgánicos/mes | Stripe + referer | 10–20 (≈500–1.000 €/mes) |
| Reseñas Google | GBP | ≥10 con 5★ |

Revisión quincenal: qué keywords suben, qué guía atrae, qué pregunta hacen los
clientes por email que aún no responde ninguna guía (cada pregunta repetida =
próxima guía o FAQ).

---

## 8. Roadmap de 90 días

**Semana 1 — Fundamentos (bloqueantes):**
- [ ] Comprar dominio definitivo y ejecutar `tools/set-domain.sh`.
- [ ] Configurar Stripe Payment Link y FORM_ENDPOINT (sin esto no hay negocio).
- [ ] Alta y verificación en Google Search Console + enviar sitemap.
- [ ] Alta en Bing Webmaster Tools (importar desde GSC).
- [ ] Instalar Plausible o GA4.
- [ ] Crear Google Business Profile.

**Semanas 2–5 — Contenido core:**
- [x] Guías 1, 2 y 3 (★★★) en español, con schema Article+FAQPage (+HowTo en
      la guía 3), publicadas en `/guias/` con hub, enlaces desde la home y
      presencia en sitemap.xml y llms.txt.
- [ ] Ampliar FAQs de la home ES a 8–10 y regenerar JSON-LD.
- [ ] Guías 4 y 5. Traducir guías 1–3 al catalán.
- [ ] Añadir todo a sitemap.xml y llms.txt; pedir indexación en GSC.

**Semanas 6–9 — Autoridad y AEO:**
- [ ] Guías 6–8. FAQs ampliadas en CA/EN/FR/RU.
- [ ] Contactar 5 transportistas/mudanzas para partnership de referidos.
- [ ] 3–5 respuestas útiles en Reddit/foros/grupos de Facebook enlazando guías.
- [ ] Contactar prensa local andorrana con la historia del trámite.
- [ ] Activar email post-entrega pidiendo reseña en Google.

**Semanas 10–13 — Medir y ajustar:**
- [ ] Primer test mensual de citas en ChatGPT/Claude/Gemini/Perplexity.
- [ ] Revisar GSC: reforzar las guías que rankean 4–10 (ampliar contenido,
      enlaces internos).
- [ ] Traducir al inglés las 2 guías con más tráfico.
- [ ] Decidir si abrir el nicho hermano: España → Andorra (mismo dolor, mismo
      expediente, segunda landing).

---

## 9. Ideas de expansión (cuando el nicho base esté dominado)

- **Sentido inverso** España → Andorra (mudanzas de nuevos residentes: nicho
  creciente y con más dinero).
- **Otros bienes**: vehículos, electrodomésticos, obras de arte, efectos de
  herencias (búsquedas hermanas con el mismo expediente base).
- **Calculadora online de IVA de importación** (herramienta gratuita =imán de
  enlaces y de citas de IA por excelencia).
- **Modelo de declaración jurada descargable gratis** a cambio de email
  (captura leads que hoy se van; muchos vuelven al ver el trabajo que da).
