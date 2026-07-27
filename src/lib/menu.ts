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
