# Playbook del blog automático — AduanaFácil Andorra

Instrucciones para la sesión automática diaria que redacta y publica un
artículo del blog. **Sigue este documento al pie de la letra.** El objetivo es
un artículo útil y veraz al día, no rellenar por rellenar: si algo impide
publicar con calidad, es mejor no publicar y explicar el motivo.

## 1. Elegir el tema

1. Abre `TEMAS-BLOG.md` (raíz del repo).
2. Toma el **primer tema con estado `pendiente`** de la tabla de temas
   aprobados (respeta el orden: está priorizado).
3. Si no queda ningún tema `pendiente`, **no publiques nada**: añade 5–10
   propuestas nuevas y razonadas a la sección «Propuestas pendientes de
   aprobación» de `TEMAS-BLOG.md`, haz commit y push solo de eso, y termina
   explicando que el backlog aprobado está vacío.

## 2. Investigar

- Lee las guías ya publicadas en `guias/*/index.html`: son el estándar de
  tono, estructura y profundidad, y la fuente de los datos ya validados
  (unión aduanera UE–Andorra, IVA de importación 21 % sobre valor residual,
  papel de la Farga de Moles, documentos del expediente).
- Si dispones de búsqueda web, úsala para contrastar datos concretos del tema
  (normativa, plazos, importes). Cita solo lo que puedas verificar.
- **Regla de veracidad (crítica):** no inventes cifras, tarifas, horarios,
  artículos de ley ni nombres de organismos. Si un dato concreto no está
  verificado, formúlalo de manera cualitativa («consulta el horario vigente»,
  «según la tarifa del agente») en lugar de inventarlo. Este site declara que
  no presta asesoramiento aduanero ni fiscal: el artículo es información
  general.

## 3. Redactar

Crea `guias/<slug>/index.html` usando como plantilla estructural una guía
existente (por ejemplo `guias/documentos-aduana-farga-de-moles/index.html`).
Requisitos:

- **Slug**: corto, en minúsculas, con guiones, con la keyword principal.
- **Extensión**: 1.200–1.800 palabras visibles.
- **Respuesta rápida**: caja `answer-box` con la respuesta directa a la
  pregunta del título en 40–60 palabras. Es lo primero tras el byline.
- **Estructura**: H2 en forma de pregunta cuando sea natural, listas, al
  menos una tabla si el tema lo permite, ejemplos con números solo si son
  aritmética propia (p. ej. 21 % de 300 € = 63 €), no datos externos sin
  verificar.
- **Fecha visible** («Actualizado · <Mes Año>» con la fecha real de
  publicación) y byline del equipo.
- **FAQ**: exactamente 4 preguntas nuevas (no repetidas de la home ni de
  otras guías), con `<details>/<summary>` y su bloque JSON-LD `FAQPage`
  con textos idénticos a los visibles.
- **JSON-LD**: `Article` + `BreadcrumbList` + `FAQPage` (añade `HowTo` solo
  si el artículo es un procedimiento paso a paso). `datePublished` y
  `dateModified` con la fecha real.
- **Base de URLs**: copia la base del canonical de `guias/index.html` (si
  aún es el marcador `https://TU-DOMINIO`, usa el marcador; si ya hay
  dominio real, usa el dominio real). Nunca mezcles ambas.
- **Enlaces internos**: al menos 2 enlaces a otras guías existentes y el CTA
  estándar (`cta-guide`) hacia `../../index.html#pedido`. Sección «Sigue
  leyendo» con 2–3 guías relacionadas.
- **Footer** con el disclaimer estándar de las guías.
- **Idioma**: español. No crees versiones en otros idiomas.

## 4. Integrar

1. **Hub** `guias/index.html`: añade la tarjeta de la nueva guía al final de
   la rejilla `.docs` (numeración `Guía NN` correlativa) y su entrada en el
   array `hasPart` del JSON-LD.
2. **`sitemap.xml`**: añade la URL de la nueva guía (prioridad 0.8, lastmod
   con la fecha real).
3. **`llms.txt`**: añade una línea a la sección «Guías gratuitas» con el
   enlace y un resumen de una frase.
4. **No toques la home** (`index.html`): solo muestra las 3 guías destacadas.

## 5. Validar (obligatorio antes de publicar)

```bash
python3 tools/validate-guias.py
```

Debe terminar con código 0. Si falla, corrige y repite. Si no consigues que
pase, **no hagas push del artículo**: termina explicando qué falla.

## 6. Publicar

1. En `TEMAS-BLOG.md`, cambia el estado del tema a `publicado (AAAA-MM-DD)`.
2. Un único commit en la rama **`main`** con todos los cambios (artículo,
   hub, sitemap, llms.txt, TEMAS-BLOG.md). Mensaje:
   `Blog: <título de la guía>`.
3. `git push -u origin main` (con reintentos ante fallos de red). El push
   directo a `main` está autorizado por el propietario exclusivamente para
   esta automatización del blog.
4. No crees pull requests ni ramas nuevas.

## 7. Límites

- Un artículo por ejecución, nunca más.
- No modifiques nada fuera de: la nueva carpeta en `guias/`, el hub
  `guias/index.html`, `sitemap.xml`, `llms.txt` y `TEMAS-BLOG.md`.
- No cambies precios, textos comerciales, configuración ni el resto del site.
- Si el repo está en un estado inesperado (conflictos, validación rota antes
  de empezar), no publiques y repórtalo.
