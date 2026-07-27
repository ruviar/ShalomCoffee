# Carta dinámica desde Google Sheets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el array hardcodeado `src/data/menu.ts` por una carta que se
lee dinámicamente desde una Google Sheet publicada como CSV, sin cambiar el
diseño visual de la sección Carta.

**Architecture:** Una función server-only `getMenu()` en `src/lib/menu.ts` hace
fetch al CSV (URL en `MENU_SHEET_CSV_URL`), lo parsea con `papaparse`, filtra y
agrupa los productos. `src/components/sections/Menu.tsx` pasa de client
component a Server Component async que llama a `getMenu()` y renderiza el
nuevo client component `MenuView.tsx` (todo el interior interactivo actual,
sin cambios visuales) o un mensaje de fallback si `getMenu()` devuelve `null`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `papaparse` para
CSV, `next: { revalidate }` de `fetch` para ISR de datos.

## Global Constraints

- El diseño visual de la Carta (toggle Bebida/Comida, cabeceras de
  subcategoría, tarjetas, banners de categoría, destacados con foto) no
  cambia — solo la fuente de los datos.
- La URL del CSV se lee siempre de `process.env.MENU_SHEET_CSV_URL`. Nunca
  hardcodeada en el código. `.env.example` documenta el nombre sin valor real.
- Revalidación periódica de 300s (5 min) vía `fetch(..., { next: { revalidate: 300 } })`.
  No se implementa revalidación on-demand vía webhook en esta iteración.
- Un fallo de fetch/parseo nunca rompe la página: `getMenu()` nunca lanza,
  siempre devuelve `MenuData | null`.
- Estructura de CSV: exactamente 9 columnas —
  `tipo, subcategoria, nombre, descripcion, precio, foto_url, disponible, destacado, orden`.
  Sin columnas extra (se descartó explícitamente añadir una para "precio sin
  confirmar"; los productos de "Dulce" se tratan como cualquier otro).
- El proyecto no tiene test runner instalado (no jest/vitest) y el spec
  excluye añadir uno. La verificación de cada tarea se hace con
  `npm run typecheck`, `npm run lint`, y `npm run dev` + `curl`/navegador —
  no con archivos de test permanentes. Donde se necesite ejercitar
  `getMenu()` de forma aislada, se crea una ruta de depuración temporal que
  se borra al final de la misma tarea (nunca se commitea).
- Al final, `src/data/menu.ts` se elimina y ningún archivo debe seguir
  importando de `@/data/menu`.
- La URL real del CSV publicado (para `.env.local`, nunca para `.env.example`
  ni para commitear):
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vQpZt5ECZBI3I-T7Bht-mO8erW2eMt0PRYSFczmXlAw7fwl01ymi9VLuq6N8NaY_P8uculUVyFYwqch/pub?gid=0&single=true&output=csv`

---

### Task 1: Entorno y dependencias

**Files:**
- Create: `.env.example`
- Create: `.env.local` (gitignored — NO se commitea; ya está en `.gitignore` bajo `.env*` con excepción de `.env.example`)
- Modify: `package.json`, `package-lock.json` (vía `npm install`)
- Modify: `next.config.ts`

**Interfaces:**
- Produces: variable de entorno `MENU_SHEET_CSV_URL` disponible en
  `process.env` para la Tarea 2. Dependencia `papaparse` instalada
  (import `Papa from "papaparse"`) con tipos de `@types/papaparse`.
  `next.config.ts` acepta cualquier host `https` en `images.remotePatterns`
  para que la Tarea 3/4 pueda usar `next/image` con `foto_url` arbitrarias.

- [ ] **Step 1: Crear `.env.example`**

```
# URL del CSV publicado de la Google Sheet de la carta.
# Google Sheets > Archivo > Compartir > Publicar en la web > formato CSV.
MENU_SHEET_CSV_URL=
```

- [ ] **Step 2: Crear `.env.local` con la URL real (solo local, gitignored)**

```
MENU_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1vQpZt5ECZBI3I-T7Bht-mO8erW2eMt0PRYSFczmXlAw7fwl01ymi9VLuq6N8NaY_P8uculUVyFYwqch/pub?gid=0&single=true&output=csv
```

- [ ] **Step 3: Instalar `papaparse`**

Run: `npm install papaparse`
Run: `npm install -D @types/papaparse`

- [ ] **Step 4: Permitir cualquier host https en `next.config.ts`**

Reemplazar el array `remotePatterns` actual:

```ts
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
```

por:

```ts
    // La carta dinamica deja que el dueño pegue cualquier URL https en
    // foto_url. Sin un comodin aqui, Next.js rechazaria imagenes de hosts no
    // listados y cada foto nueva de un servicio distinto exigiria un
    // redeploy — justo lo que la carta dinamica quiere evitar.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
```

- [ ] **Step 5: Verificar**

Run: `npm run typecheck`
Expected: PASS, sin errores (todavía no hay código que use `papaparse`, esto
solo confirma que nada se rompió).

Run: `git status`
Expected: `.env.local` NO aparece como archivo para commitear (está
gitignored); sí aparecen `.env.example`, `package.json`, `package-lock.json`,
`next.config.ts`.

- [ ] **Step 6: Commit**

```bash
git add .env.example package.json package-lock.json next.config.ts
git commit -m "chore: preparar entorno para carta dinamica (papaparse, env, remotePatterns)"
```

---

### Task 2: `src/lib/menu.ts` — fetch, parseo y agrupación

**Files:**
- Create: `src/lib/menu.ts`
- Create (temporal, se borra al final de esta tarea): `src/app/api/debug-menu/route.ts`

**Interfaces:**
- Consumes: `process.env.MENU_SHEET_CSV_URL` (Task 1), `papaparse` (Task 1).
- Produces (para Tasks 3, 4, 5):
  - `export type MenuItem = { tipo: "Bebida" | "Comida"; subcategoria: string; nombre: string; descripcion?: string; precio: number; fotoUrl?: string; disponible: boolean; destacado: boolean; orden?: number }`
  - `export type MenuGroup = { id: string; title: string; items: MenuItem[] }`
  - `export type MenuTab = { id: "bebida" | "comida"; label: string; groups: MenuGroup[] }`
  - `export type MenuData = { tabs: MenuTab[]; itemCount: number }`
  - `export async function getMenu(): Promise<MenuData | null>`
  - `export const formatPrice: (value: number) => string`

- [ ] **Step 1: Escribir `src/lib/menu.ts`**

```ts
import Papa from "papaparse";

export type MenuTipo = "Bebida" | "Comida";

export type MenuItem = {
  tipo: MenuTipo;
  subcategoria: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  fotoUrl?: string;
  disponible: boolean;
  destacado: boolean;
  orden?: number;
};

export type MenuGroup = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type MenuTab = {
  id: "bebida" | "comida";
  label: string;
  groups: MenuGroup[];
};

export type MenuData = {
  tabs: MenuTab[];
  itemCount: number;
};

type RawRow = Record<string, string>;

const TRUTHY = new Set(["true", "1", "si"]);

const DIACRITICS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  Á: "a",
  É: "e",
  Í: "i",
  Ó: "o",
  Ú: "u",
  ñ: "n",
  Ñ: "n",
};

/** Sustituye vocales acentuadas y "ñ" por su equivalente sin diacritico (ej. para comparar "SÍ" con "si", o "Café" con "cafe"). */
function stripDiacritics(value: string): string {
  return value.replace(/[áéíóúÁÉÍÓÚñÑ]/g, (ch) => DIACRITICS[ch] ?? ch);
}

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = stripDiacritics(value.trim().toLowerCase());
  return TRUTHY.has(normalized);
}

function slugify(value: string): string {
  return stripDiacritics(value.trim().toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePrecio(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`precio invalido: "${value}"`);
  }
  return parsed;
}

function parseTipo(value: string): MenuTipo {
  const normalized = value.trim().toLowerCase();
  if (normalized === "bebida") return "Bebida";
  if (normalized === "comida") return "Comida";
  throw new Error(`tipo invalido: "${value}"`);
}

function mapRow(row: RawRow): MenuItem {
  const nombre = row.nombre?.trim();
  if (!nombre) throw new Error("nombre vacio");

  const subcategoria = row.subcategoria?.trim();
  if (!subcategoria) throw new Error("subcategoria vacia");

  const ordenRaw = row.orden?.trim();
  const ordenParsed = ordenRaw ? Number.parseInt(ordenRaw, 10) : NaN;

  return {
    tipo: parseTipo(row.tipo ?? ""),
    subcategoria,
    nombre,
    descripcion: row.descripcion?.trim() || undefined,
    precio: parsePrecio(row.precio ?? ""),
    fotoUrl: row.foto_url?.trim() || undefined,
    disponible: isTruthy(row.disponible),
    destacado: isTruthy(row.destacado),
    orden: Number.isFinite(ordenParsed) ? ordenParsed : undefined,
  };
}

const TAB_META: Record<"bebida" | "comida", { label: string }> = {
  bebida: { label: "Bebida" },
  comida: { label: "Comida" },
};

type IndexedItem = { item: MenuItem; index: number };

function groupItems(items: MenuItem[]): MenuTab[] {
  const indexed: IndexedItem[] = items.map((item, index) => ({ item, index }));

  const byTab: Record<"bebida" | "comida", Map<string, IndexedItem[]>> = {
    bebida: new Map(),
    comida: new Map(),
  };

  for (const entry of indexed) {
    const tabId = entry.item.tipo === "Bebida" ? "bebida" : "comida";
    const groupId = slugify(entry.item.subcategoria);
    const bucket = byTab[tabId].get(groupId);
    if (bucket) {
      bucket.push(entry);
    } else {
      byTab[tabId].set(groupId, [entry]);
    }
  }

  return (["bebida", "comida"] as const).map((tabId) => ({
    id: tabId,
    label: TAB_META[tabId].label,
    groups: Array.from(byTab[tabId].entries()).map(([groupId, entries]) => ({
      id: groupId,
      title: entries[0].item.subcategoria,
      items: [...entries]
        .sort((a, b) => {
          const aOrden = a.item.orden ?? Number.POSITIVE_INFINITY;
          const bOrden = b.item.orden ?? Number.POSITIVE_INFINITY;
          if (aOrden !== bOrden) return aOrden - bOrden;
          return a.index - b.index;
        })
        .map((entry) => entry.item),
    })),
  }));
}

export async function getMenu(): Promise<MenuData | null> {
  const url = process.env.MENU_SHEET_CSV_URL;
  if (!url) {
    console.warn("[menu] MENU_SHEET_CSV_URL no esta configurada");
    return null;
  }

  let csvText: string;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      // 300s: cuanto tarda como maximo un cambio en la hoja en reflejarse en
      // la web. Bajarlo la hace mas reactiva a costa de mas trafico contra
      // Google Sheets; subirlo, al reves.
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      throw new Error(`respuesta ${response.status} al pedir el CSV`);
    }
    csvText = await response.text();
  } catch (error) {
    console.warn("[menu] no se pudo obtener el CSV de la carta", error);
    return null;
  }

  const parsed = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const items: MenuItem[] = [];
  for (const row of parsed.data) {
    try {
      const item = mapRow(row);
      if (item.disponible) items.push(item);
    } catch (error) {
      console.warn("[menu] fila descartada", row, error);
    }
  }

  if (items.length === 0) {
    console.warn("[menu] el CSV no produjo ningun producto valido");
    return null;
  }

  return {
    tabs: groupItems(items),
    itemCount: items.length,
  };
}

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const formatPrice = (value: number) => eur.format(value);
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Crear ruta de depuración temporal**

`src/app/api/debug-menu/route.ts`:

```ts
import { getMenu } from "@/lib/menu";

export async function GET() {
  const data = await getMenu();
  return Response.json(data);
}
```

- [ ] **Step 4: Ejercitar `getMenu()` contra el CSV real**

Run: `npm run dev` (en background)
Run: `curl -s http://localhost:3000/api/debug-menu`

Expected: JSON con `itemCount: 43` y `tabs` con 2 entradas (`bebida`,
`comida`). Confirmar en la salida:
- `"nombre":"Expresso"` con `"precio":1.8`
- `"nombre":"Tarta de queso"` con `"precio":3.2` y `"destacado":true`
- El grupo `id":"cafe"` existe dentro del tab `bebida`
- El grupo `id":"dulce"` existe dentro del tab `comida`

- [ ] **Step 5: Verificar el fallback ante fallo de red**

Editar temporalmente `.env.local`:

```
MENU_SHEET_CSV_URL=https://example.com/no-existe.csv
```

Reiniciar `npm run dev`, luego:

Run: `curl -s http://localhost:3000/api/debug-menu`
Expected: `null` (texto literal, no error 500, no stack trace).

Restaurar `.env.local` a la URL real del bloque de Global Constraints.
Reiniciar `npm run dev` y repetir Step 4 para confirmar que vuelve a
devolver datos.

- [ ] **Step 6: Borrar la ruta de depuración**

Eliminar `src/app/api/debug-menu/route.ts` (y la carpeta `src/app/api/debug-menu/`
si queda vacía). No se commitea nunca.

Detener el servidor de `npm run dev`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/menu.ts
git commit -m "feat: leer la carta desde un CSV publicado de Google Sheets"
```

---

### Task 3: `src/components/sections/MenuView.tsx` — vista interactiva

**Files:**
- Create: `src/components/sections/MenuView.tsx`

**Interfaces:**
- Consumes: `MenuTab`, `MenuItem`, `formatPrice` de `@/lib/menu` (Task 2).
- Produces (para Task 4): `export function MenuView({ tabs, itemCount }: { tabs: MenuTab[]; itemCount: number })`.

- [ ] **Step 1: Escribir `src/components/sections/MenuView.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Shell, Section, RunningHead } from "@/components/ui/Shell";
import { Reveal } from "@/components/motion/Reveal";
import { formatPrice, type MenuItem, type MenuTab } from "@/lib/menu";
import { cn } from "@/lib/utils";

/** Imágenes panorámicas por ID de grupo. Si no existe para un grupo, no se muestra banner. */
const groupBanners: Record<string, { src: string; alt: string }> = {
  cafe: {
    src: "/images/gallery/banner-cafe.webp",
    alt: "Granos de café de especialidad tostados, primer plano",
  },
  tostadas: {
    src: "/images/gallery/banner-tostadas.webp",
    alt: "Tostada de aguacate con tomate cherry y rúcula",
  },
  bagels: {
    src: "/images/gallery/banner-bagels.webp",
    alt: "Bagel de pastrami con cheddar y rúcula, cortado a la mitad",
  },
  dulce: {
    src: "/images/gallery/banner-dulce.webp",
    alt: "Bollería artesana: croissant, cinnamon roll y tarta de queso",
  },
};

/**
 * MenuSwitch — pill toggle Bebida / Comida.
 *
 * El indicador activo se mueve con GSAP para dar suavidad nativa al cambio
 * sin necesidad de CSS transitions adicionales.
 */
function MenuSwitch({
  active,
  onSwitch,
}: {
  active: "bebida" | "comida";
  onSwitch: (id: "bebida" | "comida") => void;
}) {
  const pillRef = useRef<HTMLDivElement>(null);
  const bebidaRef = useRef<HTMLButtonElement>(null);
  const comidaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const pill = pillRef.current;
    const btn = active === "bebida" ? bebidaRef.current : comidaRef.current;
    if (!pill || !btn) return;

    gsap.to(pill, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: 0.35,
      ease: "expo.out",
    });
  }, [active]);

  return (
    <div className="relative mx-auto mb-4 flex w-fit items-center gap-0 rounded-full border border-rule bg-onyx p-1 lg:mb-6">
      <div
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-snow"
        style={{ left: 0, width: 80 }}
      />

      {(["bebida", "comida"] as const).map((id) => {
        const label = id === "bebida" ? "Bebida" : "Comida";
        const isActive = active === id;
        return (
          <button
            key={id}
            ref={id === "bebida" ? bebidaRef : comidaRef}
            onClick={() => onSwitch(id)}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors duration-300",
              isActive ? "text-void" : "text-mist hover:text-snow"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * CategoryBanner — imagen panorámica de cabecera para cada categoría.
 */
function CategoryBanner({ groupId }: { groupId: string }) {
  const banner = groupBanners[groupId];
  if (!banner) return null;

  return (
    <figure className="mt-4 mb-6 overflow-hidden rounded-edge" aria-hidden="true">
      <div className="relative aspect-[21/6] w-full">
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          sizes="(max-width: 840px) 100vw, 800px"
          className="graded object-cover"
        />
      </div>
    </figure>
  );
}

/**
 * MenuRow — una linea de la carta.
 *
 * `destacado` + `fotoUrl` presentes activan el bloque con miniatura y badge
 * "Recomendado"; si falta cualquiera de los dos, es una fila de texto plano.
 */
function MenuRow({ item, divided }: { item: MenuItem; divided: boolean }) {
  const isSignature = item.destacado && Boolean(item.fotoUrl);

  return (
    <li
      className={cn(
        "anim-rise",
        divided && !isSignature && "border-t border-dashed border-rule",
        isSignature
          ? "my-2 rounded-edge border-l-2 border-l-accent bg-onyx py-4 pl-4 pr-4"
          : "py-3"
      )}
    >
      <div className="flex items-center gap-4">
        {isSignature && item.fotoUrl && (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-edge border border-rule sm:size-[92px]">
            <Image
              src={item.fotoUrl}
              alt={item.descripcion ?? item.nombre}
              fill
              sizes="(max-width: 640px) 64px, 92px"
              className="graded object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {isSignature && (
            <span className="mb-1.5 inline-block rounded-edge bg-accent-soft px-2 py-[0.2rem] text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-accent">
              Recomendado
            </span>
          )}

          <div className="flex items-baseline gap-2">
            <span className="min-w-0 text-[0.9375rem] font-medium text-snow">
              {item.nombre}
            </span>

            <span aria-hidden="true" className="leader min-w-4 flex-1 self-stretch" />
            <span className="tnum shrink-0 font-mono text-[0.8125rem] text-mist">
              {formatPrice(item.precio)}
            </span>
          </div>

          {item.descripcion && (
            <p className="mt-1 max-w-[46ch] text-[0.8125rem] leading-snug text-cement">
              {item.descripcion}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * MenuView — carta con switch Bebida / Comida, sobre papel blanco.
 *
 * Recibe los datos ya agrupados desde `Menu.tsx` (Server Component). No hace
 * fetch ni conoce `getMenu()` — solo pinta lo que le llega por props.
 */
export function MenuView({ tabs, itemCount }: { tabs: MenuTab[]; itemCount: number }) {
  const [activeTab, setActiveTab] = useState<"bebida" | "comida">("bebida");
  const listRef = useRef<HTMLDivElement>(null);
  const switchingRef = useRef(false);

  const handleSwitch = useCallback(
    (id: "bebida" | "comida") => {
      if (id === activeTab || switchingRef.current) return;
      switchingRef.current = true;

      const el = listRef.current;
      if (!el) {
        setActiveTab(id);
        switchingRef.current = false;
        return;
      }

      gsap.to(el, {
        opacity: 0,
        y: 8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setActiveTab(id);
          gsap.fromTo(
            el,
            { opacity: 0, y: -8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: "expo.out",
              onComplete: () => {
                switchingRef.current = false;
              },
            }
          );
        },
      });
    },
    [activeTab]
  );

  const activeGroups = tabs.find((tab) => tab.id === activeTab)?.groups ?? [];

  return (
    <Section id="carta" className="surface-paper">
      <Shell>
        <RunningHead label="Carta" meta={`${itemCount} referencias`} />

        <div className="mt-8 lg:mt-12">
          <Reveal>
            <h2 className="anim-rise mb-8 text-center font-display text-[2rem] text-snow sm:text-[2.75rem]">
              Nuestra carta
            </h2>
          </Reveal>
          <MenuSwitch active={activeTab} onSwitch={handleSwitch} />

          <div ref={listRef} className="mx-auto flex max-w-[800px] flex-col">
            {activeGroups.map((group, gi) => (
              <Reveal
                key={group.id}
                className={cn("py-10 sm:py-12", gi > 0 && "border-t border-rule")}
              >
                <h3 className="anim-rise font-display text-[1.75rem] text-snow sm:text-[2.25rem]">
                  {group.title}
                </h3>

                <div className="anim-rise">
                  <CategoryBanner groupId={group.id} />
                </div>

                <ul className="mt-2 flex flex-col">
                  {group.items.map((item, ii) => (
                    <MenuRow key={item.nombre} item={item} divided={ii > 0} />
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-[800px] border-t border-rule pt-6 text-[0.8125rem] text-cement">
            <p className="max-w-[52ch]">
              Precios en euros con IVA incluido. Si tienes alguna alergia o
              intolerancia, dínoslo al pedir y te contamos los ingredientes de
              cada elaboración.
            </p>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
```

- [ ] **Step 2: Verificar tipos y lint**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run lint`
Expected: PASS (o sin errores nuevos).

Nota: este componente todavía no está montado en ninguna página (`Menu.tsx`
sigue siendo el de antes hasta la Task 4), así que no hay verificación visual
en esta tarea — llega en la Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/MenuView.tsx
git commit -m "feat: extraer la vista interactiva de la carta a MenuView"
```

---

### Task 4: `src/components/sections/Menu.tsx` — wrapper server + fallback

**Files:**
- Modify: `src/components/sections/Menu.tsx` (reescritura completa)

**Interfaces:**
- Consumes: `getMenu` de `@/lib/menu` (Task 2), `MenuView` de
  `@/components/sections/MenuView` (Task 3).
- Produces: `export async function Menu()` — el mismo nombre que ya importa
  `src/app/page.tsx`, así que `page.tsx` no necesita cambios.

- [ ] **Step 1: Reemplazar el contenido de `src/components/sections/Menu.tsx`**

```tsx
import { Shell, Section, RunningHead } from "@/components/ui/Shell";
import { getMenu } from "@/lib/menu";
import { MenuView } from "@/components/sections/MenuView";

/**
 * Menu — Server Component que trae la carta desde Google Sheets (via
 * `getMenu()`) y la pasa a `MenuView`. Si `getMenu()` no puede devolver datos
 * (sheet caida y sin cache previa), se muestra un aviso discreto en vez de
 * romper la pagina.
 */
export async function Menu() {
  const data = await getMenu();

  if (!data) {
    return (
      <Section id="carta" className="surface-paper">
        <Shell>
          <RunningHead label="Carta" />
          <div className="mt-8 py-20 text-center lg:mt-12">
            <p className="text-[0.9375rem] text-cement">
              Carta no disponible en este momento. Vuelve a intentarlo en
              unos minutos.
            </p>
          </div>
        </Shell>
      </Section>
    );
  }

  return <MenuView tabs={data.tabs} itemCount={data.itemCount} />;
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Verificación end-to-end en dev**

Run: `npm run dev`
Run: `curl -s http://localhost:3000/ | grep -o "referencias"`
Expected: al menos una coincidencia (el meta de `RunningHead`).

Run: `curl -s http://localhost:3000/ | grep -o "Expresso"`
Run: `curl -s http://localhost:3000/ | grep -o "Tostada de hummus"`
Expected: ambas coincidencias presentes en el HTML renderizado.

Abrir `http://localhost:3000/#carta` en el navegador y confirmar a simple
vista:
- El toggle Bebida/Comida sigue animando igual que antes.
- Los banners panorámicos siguen apareciendo en Café, Tostadas, Bagels y
  Dulce (y solo ahí).
- Los precios se ven en formato `X,XX €`.
- Los productos sin `foto_url` (todos, salvo que ya se haya completado el
  paso manual del spec) se ven como fila de texto — esto es esperado hasta
  que el dueño rellene `foto_url` para las 4 fotos existentes.

- [ ] **Step 4: Verificar el fallback a nivel de página**

Editar temporalmente `.env.local` con una URL rota (igual que en Task 2,
Step 5). Reiniciar `npm run dev`, recargar `http://localhost:3000/#carta`.
Expected: se ve el mensaje "Carta no disponible en este momento..." en vez de
una carta vacía o una página rota.

Restaurar `.env.local` a la URL real y reiniciar `npm run dev` para dejar el
entorno funcional.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Menu.tsx
git commit -m "feat: Menu como Server Component con fallback ante fallo de la sheet"
```

---

### Task 5: Simplificar `src/lib/schema.ts`

**Files:**
- Modify: `src/lib/schema.ts:2` (import), `src/lib/schema.ts:39-58` (bloque `hasMenu`)

**Interfaces:**
- Consumes: nada nuevo (deja de consumir `@/data/menu`).
- Produces: `buildLocalBusinessSchema()` sigue exportando el mismo objeto,
  solo con `hasMenu` simplificado.

- [ ] **Step 1: Quitar el import de `data/menu`**

En `src/lib/schema.ts`, eliminar la línea:

```ts
import { menu } from "@/data/menu";
```

- [ ] **Step 2: Simplificar el bloque `hasMenu`**

Reemplazar:

```ts
    hasMenu: {
      "@type": "Menu",
      url: `${site.url}/#carta`,
      hasMenuSection: menu.flatMap((tab) =>
        tab.groups.map((group) => ({
          "@type": "MenuSection",
          name: `${tab.label} · ${group.title}`,
          hasMenuItem: group.items.map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            ...(item.note ? { description: item.note } : {}),
            offers: {
              "@type": "Offer",
              price: item.price.toFixed(2),
              priceCurrency: "EUR",
            },
          })),
        }))
      ),
    },
```

por:

```ts
    // El detalle de productos ya no se itemiza aqui: listarlo obligaria al
    // layout raiz (se renderiza en cada pagina) a depender de un fetch
    // externo a Google Sheets solo para el JSON-LD.
    hasMenu: {
      "@type": "Menu",
      url: `${site.url}/#carta`,
    },
```

- [ ] **Step 3: Verificar**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run dev`
Run: `curl -s http://localhost:3000/ | grep -o "hasMenuSection"`
Expected: SIN coincidencias (la clave ya no existe).

Run: `curl -s http://localhost:3000/ | grep -o "\"@type\":\"Menu\""`
Expected: una coincidencia.

- [ ] **Step 4: Commit**

```bash
git add src/lib/schema.ts
git commit -m "refactor: simplificar el JSON-LD de la carta, sin depender de data/menu"
```

---

### Task 6: Eliminar `src/data/menu.ts`

**Files:**
- Delete: `src/data/menu.ts`

**Interfaces:**
- Consumes: nada (verificación de que nada más lo importa).
- Produces: nada nuevo — es limpieza final.

- [ ] **Step 1: Confirmar que nada más importa `data/menu`**

Run: `grep -rn "data/menu" src/`
Expected: sin resultados (Task 4 y Task 5 ya quitaron los dos únicos
consumidores: `Menu.tsx` y `schema.ts`).

- [ ] **Step 2: Borrar el archivo**

Eliminar `src/data/menu.ts`.

- [ ] **Step 3: Verificar build completo**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: PASS (compila y exporta sin errores; confirma que ningún import
roto quedó pendiente).

- [ ] **Step 4: Commit**

```bash
git add src/data/menu.ts
git commit -m "chore: eliminar el array de carta hardcodeado"
```

---

### Task 7: Verificación final de criterios de aceptación

**Files:** ninguno (solo verificación).

**Interfaces:** ninguna — checklist final.

- [ ] **Step 1: Confirmar que la URL vive solo en variable de entorno**

Run: `grep -rn "MENU_SHEET_CSV_URL" src/`
Expected: una sola coincidencia, en `src/lib/menu.ts`, leyendo
`process.env.MENU_SHEET_CSV_URL` — ninguna URL literal en el código.

- [ ] **Step 2: Confirmar que `.env.local` no está trackeado**

Run: `git check-ignore .env.local`
Expected: imprime `.env.local` (confirma que está ignorado).

- [ ] **Step 3: Confirmar `.env.example` sin la URL real**

Run: `cat .env.example`
Expected: `MENU_SHEET_CSV_URL=` sin valor.

- [ ] **Step 4: Probar el flujo real de edición sin redeploy**

Con `npm run dev` corriendo y `.env.local` apuntando a la URL real: cambiar
un precio o poner `disponible=FALSE` en una fila de la Google Sheet real,
guardar, recargar `http://localhost:3000/#carta`.
Expected: el cambio aparece (en dev, Next no aplica el cache de 300s de la
misma forma que en producción, así que el cambio se ve casi al instante —
esto confirma que el mecanismo de lectura funciona; en producción/Vercel el
mismo cambio tardará hasta 300s por el `next: { revalidate: 300 }`, dentro
del límite de 10 minutos pedido).

- [ ] **Step 5: Confirmar que no queda ningún array hardcodeado**

Run: `grep -rn "data/menu" .` (fuera de `node_modules` y `.git`)
Expected: sin resultados.

- [ ] **Step 6: Recordatorio de la acción manual pendiente**

Confirmar con el usuario si ya rellenó `foto_url` en la hoja para:
- Tostada de hummus → `/images/menu/tostada-de-hummus.webp`
- Tostada de aguacate → `/images/menu/tostada-de-aguacate.webp`
- Bagel de pastrami → `/images/menu/bagel-de-pastrami.webp`
- Tarta de queso → `/images/menu/tarta-de-queso.webp`

Sin este paso, esos 4 productos se ven como texto plano (sin foto/badge) en
vez del tratamiento "Recomendado" que tenían antes de esta migración.

No hay commit en esta tarea — es solo verificación.
