export type MenuItem = {
  name: string;
  price: number;
  /** Ingredientes tal como figuran en la carta del local. */
  note?: string;
  /** El precio no se lee con total certeza en la carta fotografiada. */
  unverified?: boolean;
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

/**
 * Carta transcrita de la publicacion del local.
 * Los items marcados con `unverified` proceden de un bloque de la captura
 * donde el precio va alineado a la derecha con desfase de fila. Requieren
 * confirmacion del cliente antes de publicar.
 */
export const menu: MenuTab[] = [
  {
    id: "bebida",
    label: "Bebida",
    groups: [
      {
        id: "cafe",
        title: "Café",
        items: [
          { name: "Expresso", price: 1.8 },
          { name: "Doble expresso", price: 2.5 },
          { name: "Cortado", price: 1.9 },
          { name: "Latte", price: 2.2 },
          { name: "Flat white", price: 2.8 },
          { name: "Caramel latte", price: 2.7 },
          { name: "Capuccino", price: 2.5 },
          { name: "Mocaccino", price: 2.8 },
          { name: "Filtro del día", price: 2.0 },
          { name: "V60", price: 5.0 },
        ],
      },
      {
        id: "especialidades",
        title: "Especialidades",
        items: [
          { name: "Matcha latte", price: 3.5 },
          { name: "Chai latte", price: 3.0 },
          { name: "Dirty chai", price: 3.7 },
          { name: "Infusión", price: 2.2 },
          { name: "Cacao", price: 2.0 },
        ],
      },
      {
        id: "frio",
        title: "Frío",
        items: [
          { name: "Ice latte", price: 3.0 },
          { name: "Ice matcha", price: 4.0 },
          { name: "Cold brew", price: 3.2 },
          { name: "Ice chai", price: 3.5 },
          { name: "Dirty chai frío", price: 4.0 },
          { name: "Naranja natural", price: 2.5 },
          { name: "Limonada", price: 3.0 },
          { name: "Zumo", price: 2.0 },
          { name: "Refresco", price: 2.2 },
        ],
      },
      {
        id: "batidos",
        title: "Batidos",
        items: [{ name: "Smoothies y batidos", price: 5.0 }],
      },
    ],
  },
  {
    id: "comida",
    label: "Comida",
    groups: [
      {
        id: "tostadas",
        title: "Tostadas",
        items: [
          { name: "Tostada AOVE", price: 2.5 },
          { name: "Tostada de tomate", price: 3.5 },
          {
            name: "Tostada de atún",
            price: 6.0,
            note: "Cebolla, pimiento piquillo y AOVE",
          },
          { name: "Tostada de jamón", price: 6.0, note: "Tomate, aguacate y AOVE" },
          {
            name: "Tostada de hummus",
            price: 6.0,
            note: "Aguacate, tomate cherry, rúcula y AOVE",
          },
          {
            name: "Tostada de aguacate",
            price: 6.0,
            note: "Queso crema, rúcula y tomate cherry",
          },
        ],
      },
      {
        id: "bagels",
        title: "Bagels",
        items: [
          { name: "Bagel de jamón york", price: 5.0, note: "Mayonesa, lechuga y tomate" },
          {
            name: "Bagel de pastrami",
            price: 6.0,
            note: "Miel mostaza, cheddar, cebolla caramelizada y rúcula",
          },
          {
            name: "Bagel de bacon",
            price: 6.0,
            note: "Huevo poché, cheddar, salsa ahumada y rúcula",
          },
          {
            name: "Bagel de salmón",
            price: 6.0,
            note: "Queso crema, pepinillo y huevo duro",
          },
        ],
      },
      {
        id: "dulce",
        title: "Dulce",
        items: [
          { name: "Cookie", price: 3.0, unverified: true },
          { name: "Bizcocho", price: 3.0, unverified: true },
          { name: "Croissant", price: 3.0, unverified: true },
          { name: "Cinnamon roll", price: 4.0, unverified: true },
          { name: "Tarta de queso", price: 3.2, unverified: true },
          { name: "Tarta de manzana", price: 4.0, unverified: true },
          { name: "Milhojas de crema", price: 3.5, unverified: true },
        ],
      },
      {
        id: "bowls",
        title: "Bowls",
        items: [{ name: "Bowl de avena y fruta", price: 6.0 }],
      },
    ],
  },
];

/**
 * Referencias destacadas de la carta.
 *
 * La seleccion NO es de marketing: son las cuatro que aparecen citadas por su
 * nombre en las resenas publicas de Google, es decir, las que ya tienen prueba
 * social. El resto de la carta se queda como listado tipografico limpio a
 * proposito: una foto por linea convertiria la carta en un catalogo de
 * franquicia y perderia lo unico que la hace legible de un vistazo.
 *
 * Se indexa por nombre exacto en vez de guardarse dentro de `MenuItem` para
 * que la transcripcion de la carta siga siendo un dato plano y auditable
 * contra la foto de la carta del local.
 */
export type Signature = {
  src: string;
  alt: string;
  /** Motivo del destacado. Se lee en el `title` y en tecnologia de apoyo. */
  reason: string;
};

export const signatures: Record<string, Signature> = {
  "Tostada de hummus": {
    src: "/images/menu/tostada-de-hummus.webp",
    alt: "Tostada de hummus con aguacate, tomate cherry y rúcula sobre pizarra",
    reason: "De lo más pedido en barra",
  },
  "Tostada de aguacate": {
    src: "/images/menu/tostada-de-aguacate.webp",
    alt: "Tostada de aguacate con tomate cherry amarillo y rojo, y brotes de rúcula",
    reason: "De lo más pedido en barra",
  },
  "Bagel de pastrami": {
    src: "/images/menu/bagel-de-pastrami.webp",
    alt: "Bagel de pastrami abierto por la mitad, con cheddar, cebolla caramelizada y rúcula",
    reason: "De lo más pedido en barra",
  },
  "Tarta de queso": {
    src: "/images/menu/tarta-de-queso.webp",
    alt: "Porción de tarta de queso con coulis de frutos rojos y arándanos",
    reason: "De lo más pedido en barra",
  },
};

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const formatPrice = (value: number) => eur.format(value);

/** Total de referencias de la carta. Se muestra en el folio de la seccion. */
export const menuItemCount = menu.reduce(
  (total, tab) => total + tab.groups.reduce((n, g) => n + g.items.length, 0),
  0
);

/**
 * Busca el precio de una referencia por nombre exacto.
 * Devuelve undefined si no existe, para que quien lo consuma omita el dato
 * en lugar de imprimir un precio inventado.
 */
export function priceOf(name: string): number | undefined {
  for (const tab of menu) {
    for (const group of tab.groups) {
      const hit = group.items.find((item) => item.name === name);
      if (hit) return hit.price;
    }
  }
  return undefined;
}
