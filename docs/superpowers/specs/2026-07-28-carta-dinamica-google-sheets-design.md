# Carta dinámica desde Google Sheets — diseño

Fecha: 2026-07-28

## Objetivo

Sustituir el array hardcodeado `src/data/menu.ts` por una carta que se lee en
tiempo de build/revalidación desde una Google Sheet publicada como CSV, para
que el dueño del negocio pueda cambiar precios, añadir/quitar productos o
marcar algo como agotado editando la hoja, sin tocar código ni pedir un
redeploy. El diseño visual de la sección Carta (toggle Bebida/Comida,
cabeceras de subcategoría, tarjetas de producto, banners de categoría,
destacados con foto) no cambia — solo cambia de dónde vienen los datos.

## Fuente de datos

- URL del CSV publicado ya creada por el usuario:
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vQpZt5ECZBI3I-T7Bht-mO8erW2eMt0PRYSFczmXlAw7fwl01ymi9VLuq6N8NaY_P8uculUVyFYwqch/pub?gid=0&single=true&output=csv`
  (Archivo → Compartir → Publicar en la web → CSV, ya publicado).
- Se lee vía `process.env.MENU_SHEET_CSV_URL`, nunca hardcodeada.
- `.env.local` (gitignored) la tendrá para desarrollo; en Vercel se configura
  como variable de entorno del proyecto. `.env.example` documenta el nombre
  de la variable sin valor real.
- Verificado por descarga directa (28/07/2026): el CSV real tiene 43 filas de
  producto + 1 fila de cabecera (44 líneas en total), separador decimal coma (`"2,5"`, `"6,00"` no aparece
  pero `"6"` sí — Sheets omite los decimales `.00`), UTF-8 correcto con
  tildes/eñes, y `foto_url` vacío en todas las filas por ahora.

## Estructura de columnas (CSV, cabecera exacta, 9 columnas)

```
tipo | subcategoria | nombre | descripcion | precio | foto_url | disponible | destacado | orden
```

- `tipo`: `Bebida` / `Comida`, comparación insensible a mayúsculas.
- `subcategoria`: texto libre (ej. `Café`, `Tostadas`). Controla la cabecera
  de grupo y, vía slug derivado, el banner panorámico de categoría.
- `precio`: acepta coma o punto como separador decimal (la hoja real usa
  coma). Se normaliza con `replace(',', '.')` antes de `parseFloat`.
- `disponible` / `destacado`: booleano case/acento-insensible — cuentan como
  verdadero `TRUE`, `1`, `SI`, `SÍ` (y variantes en minúscula); cualquier
  otro valor (incluido vacío) cuenta como falso.
- `orden`: entero opcional; si falta, se respeta la posición de la fila
  dentro de su subcategoría.
- No hay más columnas. Se decidió explícitamente NO añadir una columna para
  el antiguo asterisco de "precio sin confirmar" — los productos de "Dulce"
  se tratan como cualquier otro; el texto "Precio pendiente de confirmar" que
  el usuario ya escribió en `descripcion` se muestra tal cual, como nota de
  producto normal.

## Ficheros

### `src/lib/menu.ts` (nuevo)

- Tipo `MenuItem`: `{ tipo: 'Bebida' | 'Comida'; subcategoria: string; nombre: string; descripcion?: string; precio: number; fotoUrl?: string; disponible: boolean; destacado: boolean; orden?: number }`.
- `getMenu()` — función async, server-only:
  - `fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 300 } })`.
    - El `300` (segundos) es el número que controla cuánto tarda un cambio en
      la hoja en reflejarse en la web — comentario explícito junto a la línea.
  - Si la respuesta no es 2xx, o el fetch lanza (timeout, red caída, URL mal
    configurada): `console.warn` y `return null`. Nunca propaga la excepción.
  - Parseo con `papaparse` (`Papa.parse(text, { header: true, skipEmptyLines: true })`).
  - Cada fila se mapea a `MenuItem` dentro de un `try/catch` individual; una
    fila mal formada se descarta con `console.warn` sin romper el resto.
  - Filtra `disponible !== true` (con la normalización booleana de arriba).
  - Agrupa por `tipo` → `subcategoria`, preservando el orden de primera
    aparición de cada subcategoría dentro de su tipo (igual que hoy).
    Ordena items dentro de cada grupo por `orden` ascendente, o por posición
    original si `orden` falta.
  - Deriva el `id` de grupo (para banners) haciendo slug de `subcategoria`:
    minúsculas, sin diacríticos, no-alfanumérico → `-`. Reproduce
    `cafe`/`tostadas`/`bagels`/`dulce`/`especialidades`/`frio`/`batidos`/`bowls`
    sin ninguna columna nueva.
  - Devuelve `{ tabs: MenuTab[]; itemCount: number } | null`.
  - Exporta también `formatPrice` (movido desde `src/data/menu.ts`, mismo
    `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`).

### `src/components/sections/Menu.tsx` (reescrito)

- Pasa de client component a **Server Component async**.
- Llama a `getMenu()`.
  - Si `null`: renderiza dentro del mismo `Section`/`Shell` un mensaje
    discreto ("Carta no disponible en este momento. Vuelve a intentarlo en
    unos minutos.") en vez de la carta interactiva. No rompe la página.
  - Si hay datos: renderiza `<MenuView tabs={...} itemCount={...} />`.

### `src/components/sections/MenuView.tsx` (nuevo)

- `"use client"`. Contiene el cuerpo interactivo actual de `Menu.tsx`
  (`MenuSwitch`, `CategoryBanner`, `MenuRow`, transiciones GSAP,
  `RunningHead`, notas al pie) recibiendo `tabs`/`itemCount` como props en
  vez de importar `menu`/`menuItemCount` de `data/menu.ts`.
- `MenuRow` cambia su fuente de "destacado": en vez de buscar el nombre en
  una tabla `signatures` aparte, usa directamente `item.destacado && item.fotoUrl`
  del dato de la fila. Si es `true`, muestra la miniatura (`next/image`,
  `src={item.fotoUrl}`) y el badge "Recomendado" (ya sin `title` dinámico —
  el campo `reason` no existe en la hoja, se deja el badge sin tooltip
  personalizado). Si `destacado` es `true` pero `fotoUrl` está vacío, la fila
  se muestra como texto plano (sin badge) — igual que hoy para productos sin
  foto.
- `alt` de la imagen: `descripcion` si existe, si no `nombre`.
- El footer de la Carta pierde el segundo párrafo del asterisco de "precio
  sin confirmar" (ya no hay campo que lo alimente); queda solo el aviso de
  alérgenos.

### `src/lib/schema.ts`

- Deja de importar `menu` de `data/menu.ts`. El bloque `hasMenu` del JSON-LD
  se simplifica a `{ "@type": "Menu", url: `${site.url}/#carta` }`, sin
  `hasMenuSection`/`hasMenuItem`. Motivo: `layout.tsx` (root layout, se
  renderiza en cada página) no debe depender de un fetch externo a Google
  Sheets solo para el JSON-LD de una sección. Pérdida menor de riqueza SEO
  estructurada, compensada por cero riesgo nuevo en el layout raíz.

### `next.config.ts`

- `images.remotePatterns` gana `{ protocol: "https", hostname: "**" }` (sustituye/engloba
  la entrada existente de `images.unsplash.com`), para que `foto_url` acepte
  cualquier host público sin necesitar redeploy cuando el dueño cambie de
  servicio de imágenes.

### `.env.example` (nuevo)

```
# URL del CSV publicado de la Google Sheet de la carta.
# Google Sheets > Archivo > Compartir > Publicar en la web > formato CSV.
MENU_SHEET_CSV_URL=
```

### `package.json`

- Añade dependencia `papaparse` + devDependency `@types/papaparse`.

### `src/data/menu.ts`

- Se elimina por completo una vez verificado que la web pinta igual.

## Manejo de errores / fallback (criterio de aceptación)

- Primer nivel: `fetch` con `next: { revalidate: 300 }` — Next.js sirve la
  respuesta cacheada mientras revalida en segundo plano (stale-while-revalidate
  nativo de la Data Cache de fetch). Si la revalidación en segundo plano
  falla, la caché anterior se mantiene intacta y ninguna request lo nota.
- Segundo nivel (solo caché fría — primer deploy o fallo persistente desde
  el arranque): `getMenu()` devuelve `null` y `Menu.tsx` pinta el mensaje
  discreto en vez de rows vacíos o una página rota.

## Acción manual pendiente del usuario (antes de publicar)

Para que el lanzamiento sea visualmente idéntico al actual, el usuario debe
rellenar `foto_url` en la hoja para las 4 filas que hoy ya tienen foto:

- Tostada de hummus → `/images/menu/tostada-de-hummus.webp`
- Tostada de aguacate → `/images/menu/tostada-de-aguacate.webp`
- Bagel de pastrami → `/images/menu/bagel-de-pastrami.webp`
- Tarta de queso → `/images/menu/tarta-de-queso.webp`

Sin este paso, esos 4 productos se publicarían sin foto/badge (regresión
visual). El código funciona igual con o sin este paso — es una edición de
contenido en la hoja, no de código. `Smoothies y batidos` quedó marcado
`destacado=TRUE` sin foto; con la lógica de arriba se mostrará como fila de
texto normal (igual que hoy) mientras no tenga `foto_url`.

## Fuera de alcance (explícitamente descartado)

- Revalidación on-demand vía webhook.
- Columna/lógica de "precio sin confirmar" para Dulce.
- JSON-LD itemizado por producto (`hasMenuSection`/`hasMenuItem`).
- Tests automatizados (el proyecto no tiene infraestructura de testing hoy).
