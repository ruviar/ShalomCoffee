# Shalom Speciality Coffee — Sistema de diseño

> Documento normativo, escrito **desde el código construido**, no antes de él.
> Toda decisión visual del proyecto se resuelve aquí antes de escribirse.
> Zaragoza · Next.js 16 + Tailwind v4 + GSAP + Lenis
>
> El manual anterior queda archivado en `DESIGN.previo.md`. Describía un
> sistema distinto (grotesca Archivo, fondos gris perla, acento verde
> aguacate) que ya no existe en el código. No usarlo como referencia.
>
> **Revisión de tema.** La página era dark-only; ahora es light-only. Los
> roles de cada token se mantienen (fondo, superficie, filete, texto), solo
> cambia la dirección de la rampa. Ver §2.
>
> **Revisión de superficie y acento (encargo del cliente).** Dos de las
> prohibiciones duras originales quedan levantadas por decisión expresa de
> quien encarga el trabajo: la página ya no es de un solo fondo plano, sino
> que **alterna superficie clara y oscura sección a sección** (§2.0), y ya no
> es estrictamente acromática, sino que tiene **un acento único, el ámbar
> tostado** (§2.4). El motivo del encargo era concreto: sin ritmo de
> superficie la página se leía como una sola banda gris de arriba abajo, y
> sin acento no había forma de señalar un estado interactivo salvo por peso
> tipográfico. Lo demás del sistema —tipografía, rejilla, radio, gramática de
> sección, movimiento— sigue vigente sin cambios.

---

## 0. Tesis

**La barra de un bar de especialidad, ahora vista de día.** Fondo claro de
cemento, filetes de 1px como sistema de rejilla, y una sola fuente de luz que
es la fotografía del producto.

Esto rechaza dos cosas a la vez. Rechaza la landing de cafetería por defecto
—crema, latón y serif artesanal— y rechaza también su opuesto previsible, el
hero oscuro genérico de foto de archivo con velo negro encima.

El recurso central no es invención: **el wordmark repetido en filas apiladas
con el producto recortado superpuesto es material de marca que ya existe**, es
lo que el local publica en su feed. La web lo hereda y lo lleva a escala de
pantalla.

### Diales

| Dial | Valor | Por qué |
|---|---|---|
| `DESIGN_VARIANCE` | 6 | Composición decidida y de canto vivo, sin barroquismo. La marca real es sobria. |
| `MOTION_INTENSITY` | 5 | Una coreografía de entrada en el Hero y un parallax por capas. Nada más se mueve por su cuenta. |
| `VISUAL_DENSITY` | 3 | La fotografía necesita aire. Secciones de `py-24` a `py-52`. |

---

## 1. Prohibiciones duras

Estas no son preferencias. Romper cualquiera de ellas es un bug.

- **Un solo color cromático, y es el acento.** `accent` / `accent-strong` /
  `accent-soft` son los **únicos** tokens con saturación de todo el sistema.
  Cualquier otro hex saturado fuera de una fotografía es un bug. Siguen
  prohibidos los verdes/rojos de semáforo para estados: el estado
  abierto/cerrado se comunica por forma, no por color (§2.4).
- **El acento no pinta superficie.** Va en hover y foco de control, subrayado
  de enlace, filete decorativo, icono pequeño y el badge de recomendado. En
  cuanto cubre área deja de ser acento y se convierte en tema.
- **La paleta neutra es cálida, pero no es beige.** La rampa lleva sesgo hacia
  el amarillo para que la fotografía de comida se apoye en ella. Latón,
  dorado y degradados de espresso siguen fuera.
- **Cero pastilla redondeada.** Un solo radio en toda la página: 2px. La única
  excepción son los botones de icono, que son círculos completos.
- **Cero `feTurbulence`, cero grano SVG, cero indicador de scroll.**
- **La monoespaciada solo donde hay cifras que cuadrar**: precios y horarios.
  Nunca como disfraz de "técnico" en etiquetas.
- **La serif no toca el wordmark.** Ver §3.

---

## 2. Color

### 2.0 Ritmo de superficie

La página **alterna claro y oscuro sección a sección**. Ninguna sección
comparte fondo con la que tiene encima o debajo. Sin este ritmo la página se
leía como una única banda gris de 8.000px.

| Sección | Superficie | Fondo |
|---|---|---|
| Hero | fotografía + velo | — |
| Filosofía | `.surface-cream` | `#f4f1ec` |
| Galería | `.surface-dark` | `#16161a` |
| Carta | `.surface-paper` | `#ffffff` |
| Reseñas | `.surface-dark` | `#16161a` |
| ↳ tarjetas de reseña | `.surface-paper` | `#ffffff` |
| Visítanos | `.surface-cream` | `#f4f1ec` |
| Footer | `.surface-dark` | `#16161a` |

**Cómo funciona.** Todos los tokens de color son indirectos: la utilidad de
Tailwind emite `var(--c-*)` (bloque `@theme inline` en `globals.css`), y una
clase de superficie redefine la escala entera por cascada. Un componente
**nunca** sabe sobre qué superficie está: `text-snow` es texto casi negro
sobre crema y texto casi blanco sobre carbón, sin una sola condicional en
React ni una prop de tema. Anidar superficies funciona — las tarjetas blancas
de Reseñas viven dentro de una sección oscura y recuperan la rampa clara solo
con añadirse `.surface-paper`.

Cada superficie existe en dos formas:

- `.tokens-*` — redefine la escala de color y nada más.
- `.surface-*` — hace lo mismo **y** pinta el fondo.

La barra de navegación usa la primera: flota transparente sobre la fotografía
del Hero, así que necesita la rampa del modo oscuro para que el subrayado de
acento y el foco de teclado se vean, pero no puede pintar fondo ninguno.

### 2.1 Escala clara (`:root`, `.surface-cream`)

Muestreada del local, con **sesgo cálido**: el gris tira al amarillo, no al
azul, para que la fotografía de comida se apoye en el fondo en vez de pelearse
con él.

| Token | Hex | Rol | Contraste sobre `void` |
|---|---|---|---|
| `void` | `#f4f1ec` | Fondo de sección — blanco roto cálido | — |
| `ink` | `#ffffff` | Superficie alterna | — |
| `onyx` | `#ffffff` | Superficie de card sobre crema | — |
| `graphite` | `#e7e2d9` | Superficie sobre onyx, bordes fuertes | — |
| `slate` | `#d8d2c7` | Filetes visibles, iconografía inactiva | 1,3:1 |
| `cement` / `ash` | `#6b6459` | Texto de apoyo, metadatos | 5,9:1 |
| `mist` | `#3c382f` | Texto de cuerpo | 11,0:1 |
| `snow` | `#17150f` | Titulares, texto principal. Nunca `#000000` | 16,4:1 |

`.surface-paper` es la misma rampa de texto con el fondo en `#ffffff`: solo
cambia el plano, no el contraste.

### 2.2 Escala oscura (`.surface-dark`)

| Token | Hex | Rol | Contraste sobre `void` |
|---|---|---|---|
| `void` | `#16161a` | Carbón — conecta con el velo del Hero | — |
| `onyx` | `#1f1f24` | Superficie de card sobre carbón | — |
| `cement` / `ash` | `#9a948a` | Texto de apoyo, metadatos | 6,4:1 |
| `mist` | `#d6d2ca` | Texto de cuerpo | 12,1:1 |
| `snow` | `#f5f3ef` | Titulares, texto principal | 15,9:1 |

### 2.3 Filetes

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `rule` | `rgb(23 21 15 / 0.12)` | `rgb(245 243 239 / 0.14)` | Filete estándar: encabezados de sección, separadores de fila, bordes de celda |
| `rule-2` | `rgb(23 21 15 / 0.26)` | `rgb(245 243 239 / 0.28)` | Borde de control, puntos guía de la carta |

### 2.4 Acento

**Ámbar tostado.** Muestreado de la crema del espresso en `coffee-pour.webp` y
del tueste del grano en `banner-cafe.webp` — está en la fotografía del propio
sitio, no traído de fuera.

| Token | Claro | Oscuro |
|---|---|---|
| `accent` | `#8a5a2b` — 5,2:1 sobre crema, 5,9:1 sobre blanco | `#c99a63` — 7,1:1 sobre carbón |
| `accent-strong` | `#6f4620` — 7,2:1 sobre crema | `#dcb385` |
| `accent-soft` | `rgb(138 90 43 / 0.14)` | `rgb(201 154 99 / 0.18)` |

**Cada superficie trae su propia pareja de acento.** El ámbar oscuro sobre
carbón cae a 3,1:1 y dejaría de cumplir AA, así que en oscuro se sustituye por
su versión clara en lugar de arrastrar el mismo hex a una superficie donde no
se lee.

**Dónde va:** hover y foco de botón, subrayado de enlace de navegación, filete
decorativo de 1px, borde izquierdo y badge de las referencias destacadas de la
carta, estrellas de las reseñas, `:focus-visible` de toda la página.

**Dónde no va:** fondo de superficie grande, texto de cuerpo, cualquier bloque
de más de un par de líneas.

El estado abierto/cerrado se sigue comunicando **por forma, no por color**:
punto lleno cuando está abierto, anillo vacío cuando está cerrado. Un semáforo
verde/rojo seguiría estando mal.

### Fotografía a sangre

El Hero, el pie de foto de la Galería y el Navbar transparente (antes de
`scrolled`, mientras flota sobre la foto del Hero) llevan texto **blanco
fijo** sobre velo **negro fijo** (`bg-black/70`, `from-black/85`,
`text-white`, `border-white/*`), sin usar los tokens de la escala. Es texto
sobre imagen, no superficie de página: no tiene que seguir el tema y no lo
hace. En cuanto el Navbar pasa a `scrolled` gana su propia superficie
(`bg-void/85` + blur) y ahí sí usa los tokens normales. Cambiar el tema no
debe tocar estos puntos.

### Tema

**Light only.** No hay toggle: un conmutador de tema en una landing de una
sola página es chrome sin trabajo detrás — esa razón no cambia con el tema.
Lo que sí cambió es la dirección: la página pasó de dark a light en esta
revisión (ver nota de cabecera).

**El mapa.** Google sirve el embed con su propia paleta, y sin clave de la
Maps JavaScript API no hay JSON de Styling Wizard que aplicarle. El
tratamiento se hace por composición, en dos capas sobre el iframe:

- `.map-canvas` — `grayscale(1) contrast(1.08) brightness(0.96)` sobre el
  iframe: le quita el color de fábrica.
- `.map-tint` — lámina de `accent` en `mix-blend-mode: multiply` al 16%, con
  `pointer-events: none`: le devuelve la temperatura del resto del sitio sin
  impedir que el mapa se arrastre y se amplíe por debajo.

Si algún día hay clave de API con facturación activa, esto se sustituye por un
estilo JSON real y un marcador propio. Mientras no la haya, esto es lo que se
puede hacer sin añadir ~90KB de JavaScript de terceros.

---

## 3. Tipografía

Tres familias, cada una con una función que ninguna otra cubre.

| Rol | Familia | Uso |
|---|---|---|
| `display` | **Playfair Display** (400) | Titulares de sección, H1 del Hero, títulos de grupo de la carta, la cifra 4,9 |
| `sans` | **Jost** (400/500/600) | Interfaz, cuerpo, etiquetas, navegación, botones **y el wordmark** |
| `mono` | **pila del sistema** (`ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`) | Precios, horas, códigos postales, el folio de sección |

**Solo los pesos que se pintan.** Playfair cargaba 400/500/600 y Jost
300/400/500/600; en el código construido solo se usan Playfair 400 y Jost
400/500/600. Los pesos sobrantes viajaban por la red sin dibujar un glifo.

**La monoespaciada es de sistema a propósito.** Geist Mono son 70KB de fuente
variable para unas pocas decenas de cifras — precios, horas y el folio de
sección. En móvil costaba más LCP del que aportaba, y la pila del sistema ya
da cifras de ancho fijo. La función (que las columnas de precio y hora
cuadren) se conserva; el peso, no. Junto con el recorte de pesos anteriores,
la carga de fuentes bajó de 134KB a 64KB y el Lighthouse de rendimiento en
móvil subió de 79 a 86.

**El wordmark va en la geométrica, nunca en la serif.** La serif es la voz
editorial de la web. El logotipo es un activo que ya existe en el rótulo del
escaparate, en caja baja y con el tracking muy cerrado. Vestirlo de serif
sería inventar una identidad que el negocio no tiene.

### Escala

| Nivel | Valor | Notas |
|---|---|---|
| Pila del Hero | `clamp(4.5rem, 20vw, 10.5rem)` · lh 0.95 · ls −0.05em | En móvil 20vw, no menos: por debajo la foto tapa el wordmark entero |
| H1 del Hero | `clamp(1.875rem, 5.4vw, 3.75rem)` · lh 1.08 · ls −0.02em | |
| `Display` (H2) | `clamp(2.25rem, 5.2vw, 4.25rem)` · lh 1.04 · ls −0.02em | Una sola escala para todas las secciones |
| Cuerpo | `1rem`–`1.0625rem` · lh 1.7 · `mist` | Medida máxima `58ch` |
| Etiqueta | `0.6875rem` · uppercase · ls 0.22em | En `sans`, no en mono |
| Precio | `0.8125rem` mono · `.tnum` | |

Suelo de tracking: **−0.05em**, y solo en el wordmark. El resto no baja de
−0.02em.

---

## 4. Rejilla y alineación

**`<Shell>` es la única autoridad de alineación horizontal de la página.**
Todo lo que tenga borde izquierdo o derecho visible pasa por ahí. Ninguna
sección define sus propios márgenes laterales.

```
max-w: 84rem (1344px)
padding: 16px / 32px (md) / 64px (lg)
+ env(safe-area-inset) en el breakpoint base
```

Si un botón o un texto se come el borde de la pantalla, es porque se saltó
`<Shell>`.

`<Section>` fija el ritmo vertical: tres densidades y ninguna más.

| Densidad | Padding |
|---|---|
| `tight` | `py-20 md:py-24` |
| `normal` | `py-24 md:py-32 lg:py-40` |
| `loose` | `py-32 md:py-40 lg:py-52` |

---

## 5. Gramática de sección

Cada sección abre con un `<RunningHead>`: un filete de 1px a todo el ancho con
la etiqueta a la izquierda y **un dato real** a la derecha, como el folio de
una publicación.

El slot derecho lleva información, nunca numeración decorativa: `43
referencias`, `4,9/5 Google`, `50018 Zaragoza`. Si una sección no tiene ningún
dato que aportar, se omite.

**Ninguna sección repite familia de layout:**

| Sección | Familia |
|---|---|
| Hero | Plinto y foco: pila tipográfica + objeto flotante |
| Filosofía | Texto corrido contra tabla de datos |
| Galería | Bento de imagen, 5 celdas, 3 columnas |
| Carta | Lista tipográfica de una columna con puntos guía |
| Reseñas | Columnas de texto sobre rejilla horizontal |
| Visítanos | Dos piezas: mapa vivo + tabla de datos |

La Carta es una única columna centrada (`max-w-[800px]`), sin pestañas
Bebida/Comida ni rejilla de cards: todas las categorías de `data/menu.ts` se
listan seguidas, como en la carta impresa del local. Cada fila conecta
nombre y precio con la guía de puntos (`.leader`); la descripción y los
alérgenos van debajo, en `cement`.

---

## 6. Elevación y superficie

Se declara **una sola vez** por elemento. Las celdas del bento llevan
`border-rule` y ningún sombreado. La única sombra de la página es la de la
fotografía del Hero, y lleva desplazamiento y desenfoque reales
(`0 2.5rem 5rem -1.5rem`), no un halo centrado.

Nada de glass ni backdrop-blur decorativo. El único `backdrop-blur` está en el
navbar cuando hay contenido pasando por debajo, que es para lo que sirve.

---

## 7. Movimiento

Lenis interpola el scroll y GSAP dibuja, **compartiendo un único bucle de
frames**: GSAP es el reloj y Lenis se engancha a su ticker. Dos `rAF`
independientes hacen que el parallax llegue un frame tarde y se vea el
temblor.

### Un solo momento coreografiado

La entrada del Hero es una sola línea de tiempo encadenada: filete superior →
filas del wordmark saliendo de su máscara → la foto se descubre con un clip
desde abajo mientras suelta la escala → titular por líneas → CTAs y filete
inferior.

Al hacer scroll, pila (+6%) y foto (−11%) se separan en profundidad. En las
secciones, `Reveal` hace fade-up con stagger y `Parallax` mueve la imagen
**dentro** de un marco quieto, para que la rejilla nunca se desalinee.
`Parallax` se mantiene por debajo del 16%: por encima el elemento se despega
de su contexto y el efecto pasa de profundidad a mareo.

### Estados iniciales

Viven en CSS bajo `.js-motion`, clase que un script en `<head>` pone antes del
primer pintado. Sin JS el contenido se sirve visible.

> **Trampa documentada.** `getComputedStyle` devuelve `translateY(105%)` ya
> resuelto a píxeles. GSAP lo cachea como `y` y lo suma al `yPercent` que se
> anima, dejando un desplazamiento residual: la línea termina invisible pero
> ocupando su hueco. Por eso todos los `fromTo` de máscara declaran
> `{ yPercent: 105, y: 0 }`. El `y: 0` **no es redundante**.

`prefers-reduced-motion` desmonta Lenis entero y limpia todos los estados
iniciales por CSS.

### Contador de la valoración

`CountUp` sube la cifra de reseñas de 0 a 4,9 al entrar en el viewport,
formateando con `Intl` en cada fotograma para que el separador decimal sea la
coma también durante la cuenta, no solo al final.

El valor final se renderiza **en el servidor** dentro de un `<span>` para
lectores de pantalla y para el HTML sin JavaScript: la valoración es un dato
real y no puede depender de que una animación llegue a ejecutarse. La cifra
visible es una capa aparte, marcada `aria-hidden`, que se pone a cero cuando
arranca el JS. Como el bloque vive bajo el pliegue, nadie llega a ver el salto.

### Micro-interacción de control

Los CTA suben 2px y proyectan una sombra corta y cálida en **`hover` y en
`focus-visible`** (180ms, `ease-out-expo`). Va en los dos estados a propósito:
quien navega con teclado tiene el mismo derecho a saber que el control está
vivo.

### Bloqueo de scroll bajo overlay

`body { overflow: hidden }` **no basta** con Lenis: quien escucha la rueda es
Lenis sobre `window`, así que el fondo seguiría viajando por debajo del menú
móvil o del lightbox y al cerrarlos aparecería otra sección.
`SmoothScroll` exporta `lockPageScroll()` / `unlockPageScroll()`, con cuenta de
capas para que dos overlays simultáneos no se pisen. Es un singleton de módulo
y no un contexto de React porque lo consume código que corre fuera del árbol
(los callbacks de PhotoSwipe).

---

## 8. Honestidad del contenido

- **`data/reviews.ts` es texto de ejemplo.** Mientras `placeholder` siga
  activo, la sección se marca sola con un aviso visible. Publicar testimonios
  inventados con nombre y apellido es fabricar prueba social.
- **El 4,9/5 sí es real** y está verificado.
- **Los precios de repostería van con asterisco.** Se transcribieron de una
  foto de la carta donde esa columna está desfasada de fila.
- **`priceOf()` lee de `data/menu.ts`.** Si una referencia no existe, la fila
  sale sin precio en vez de con uno inventado. Los nombres tienen que coincidir
  literalmente con la carta, incluida su grafía (`Expresso`, `speciality`).
- **Solo fotografía real del local o material publicado por la marca.** Cero
  banco de imágenes: una cafetería de barrio se vende enseñándose a sí misma.
- **NAP consistente con Google Business.** Nombre, dirección y teléfono salen
  todos de `data/site.ts`, y el horario de `data/hours.ts`. De ahí se
  alimentan a la vez la sección Visítanos, el pie, el estado abierto/cerrado y
  el JSON-LD. El código postal es **50019**, no 50018: cualquier discrepancia
  con la ficha de Google penaliza el SEO local. Si cambia en Google, cambia
  aquí y en ningún otro sitio.
- **Cero embeds sociales.** La galería sirve sus propias imágenes desde
  `public/`. Un widget de Instagram embebido trae su interfaz nativa —
  checkbox de selección, campo de responder, controles de story— y la planta
  en medio del sitio. El enlace al perfil se queda; el widget, no.
- **La pieza tipográfica de marca no va en la galería.**
  `composicion-marca-tostada.webp` («shalom shalom shalom / TOAST») es una
  publicación publicitaria. En una rejilla de sala y producto se lee como un
  anuncio colado entre las fotos.

---

## 9. Estructura

```
src/
├─ app/
│  ├─ layout.tsx          fuentes, metadata, JSON-LD, flag .js-motion
│  ├─ page.tsx            composición + contrato de dirección en HTML
│  └─ globals.css         @theme, tokens, estados iniciales de animación
│
├─ components/
│  ├─ layout/             Navbar · Footer
│  ├─ motion/             Reveal (Reveal/MaskLines/Line/Parallax) · OpenStatus
│  ├─ providers/          SmoothScroll
│  ├─ sections/           Hero · Philosophy · Gallery · Menu · Reviews · Location
│  └─ ui/                 Shell (Shell/Section/RunningHead/Display) · Button · Wordmark
│
├─ data/                  menu · hours · reviews · site
└─ lib/                   schema · utils
```

---

## 10. Checklist de preflight

- [ ] Cero hex con saturación fuera de una imagen
- [ ] Un solo radio (2px) aplicado sin excepción
- [ ] Todo borde lateral pasa por `<Shell>`
- [ ] El Hero cabe en `100dvh` a 900px y a 844px de alto
- [ ] Los dos CTA de un par coinciden al píxel
- [ ] Cuerpo ≤ 58ch, `text-wrap: pretty` en párrafos
- [ ] `scrollWidth === clientWidth` en 390px y en 1440px
- [ ] `min-h-[100dvh]`, nunca `h-screen`
- [ ] Cada sección abre con `RunningHead` y su meta es un dato, no un número
- [ ] Ninguna sección repite familia de layout
- [ ] El bento tiene sus 5 celdas llenas y ninguna columna vacía
- [ ] Toda animación justificable en una frase
- [ ] Sin JS el contenido se sirve visible
- [ ] `prefers-reduced-motion` respetado, Lenis incluido
- [ ] Iconos solo de Phosphor
