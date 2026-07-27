"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Shell, Section, RunningHead } from "@/components/ui/Shell";
import { Reveal } from "@/components/motion/Reveal";
import { formatPrice, menu, menuItemCount, signatures } from "@/data/menu";
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

    /* `offsetLeft`/`offsetWidth`, no `getBoundingClientRect`. Los botones no
       tienen su propio elemento posicionado, así que su `offsetParent` es
       este contenedor (`relative`), y por spec `offsetLeft` ya se mide desde
       el borde de padding de ese contenedor — el mismo punto de referencia
       que usa la propiedad CSS `left` del indicador. Restar bounding rects
       en su lugar duplicaba el padding del contenedor (una vez en el `left`
       fijo del indicador, otra en la resta), así que en "Comida" el
       indicador se salía por la derecha en vez de dejar el mismo margen que
       en "Bebida". */
    gsap.to(pill, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: 0.35,
      ease: "expo.out",
    });
  }, [active]);

  return (
    <div className="relative mx-auto mb-4 flex w-fit items-center gap-0 rounded-full border border-rule bg-onyx p-1 lg:mb-6">
      {/* Indicador deslizante. `left: 0` es el borde de padding del
          contenedor: el punto de partida correcto para sumarle `offsetLeft`
          por transform sin contar el padding dos veces. */}
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
 *
 * Aparece justo debajo del título h3 de cada grupo. Ocupa el ancho completo
 * del contenedor de la carta (800px), con aspect ratio 21:6 para dar
 * presencia sin quitar protagonismo a los productos.
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
 * Dos formas en un solo componente. En reposo es una linea tipografica pura:
 * nombre, puntos-guia y precio. Si la referencia esta en `signatures`, la
 * misma linea gana una miniatura cuadrada a la izquierda y un badge de
 * acento. No hay un segundo componente para los destacados a proposito: si
 * la fila destacada y la normal se construyesen aparte, la altura de linea y
 * la posicion del precio acabarian divergiendo.
 */
function MenuRow({
  item,
  divided,
}: {
  item: { name: string; price: number; note?: string; unverified?: boolean };
  divided: boolean;
}) {
  const signature = signatures[item.name];

  /* La fila destacada NO puede limitarse a meter una miniatura y desplazar el
     nombre: el borde izquierdo del listado se rompe y el resultado se lee como
     un fallo de alineacion. Se marca entera como un bloque sacado de la lista
     — plinto propio, filete de acento a la izquierda y aire alrededor — de
     modo que el sangrado sea evidentemente intencionado. */
  return (
    <li
      className={cn(
        "anim-rise",
        divided && !signature && "border-t border-dashed border-rule",
        signature
          ? "my-2 rounded-edge border-l-2 border-l-accent bg-onyx py-4 pl-4 pr-4"
          : "py-3"
      )}
    >
      {/* Centrado vertical: junto a una miniatura de 92px, un nombre de dos
          lineas alineado arriba deja un hueco muerto debajo. */}
      <div className="flex items-center gap-4">
        {signature && (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-edge border border-rule sm:size-[92px]">
            <Image
              src={signature.src}
              alt={signature.alt}
              fill
              sizes="(max-width: 640px) 64px, 92px"
              className="graded object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* El badge va en su propia linea, no en la del nombre. En la fila
              del precio compartia espacio con la miniatura, el nombre y el
              importe, todos incompresibles, y en movil el conjunto no cabia:
              la carta desbordaba a lo ancho en la pestana de Comida. */}
          {signature && (
            <span
              title={signature.reason}
              className="mb-1.5 inline-block rounded-edge bg-accent-soft px-2 py-[0.2rem] text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-accent"
            >
              Recomendado
            </span>
          )}

          <div className="flex items-baseline gap-2">
            {/* Sin `shrink-0`: un nombre largo en una pantalla estrecha se
                parte en dos lineas en lugar de empujar el precio fuera. */}
            <span className="min-w-0 text-[0.9375rem] font-medium text-snow">
              {item.name}
              {item.unverified && (
                <span aria-hidden="true" className="font-normal text-cement">
                  {" "}*
                </span>
              )}
            </span>

            <span aria-hidden="true" className="leader min-w-4 flex-1 self-stretch" />
            <span className="tnum shrink-0 font-mono text-[0.8125rem] text-mist">
              {formatPrice(item.price)}
            </span>
          </div>

          {item.note && (
            <p className="mt-1 max-w-[46ch] text-[0.8125rem] leading-snug text-cement">
              {item.note}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Menu — carta con switch Bebida / Comida, sobre papel blanco.
 *
 * El blanco es deliberado y es el punto mas claro de la pagina: la carta es lo
 * que alguien viene a leer, y va sobre el fondo de maximo contraste que tiene
 * el sitio. Queda entre dos bandas de carbon (Galeria arriba, Resenas abajo),
 * de modo que se lee como una hoja suelta encima de la mesa.
 *
 * El cambio de tab anima la salida y entrada de los grupos con GSAP fade.
 * Cada categoría lleva un banner panorámico de cabecera (donde existe) y una
 * lista limpia con solo puntos-guía (.leader) como separador visual entre
 * nombre y precio. No hay bordes sólidos entre items.
 */
export function Menu() {
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

  const activeGroups = menu.find((tab) => tab.id === activeTab)?.groups ?? [];

  return (
    <Section id="carta" className="surface-paper">
      <Shell>
        <RunningHead label="Carta" meta={`${menuItemCount} referencias`} />

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
                {/* Título de categoría */}
                <h3 className="anim-rise font-display text-[1.75rem] text-snow sm:text-[2.25rem]">
                  {group.title}
                </h3>

                {/* Banner panorámico de la categoría */}
                <div className="anim-rise">
                  <CategoryBanner groupId={group.id} />
                </div>

                {/* Lista de productos — sin bordes sólidos entre items */}
                <ul className="mt-2 flex flex-col">
                  {group.items.map((item, ii) => (
                    <MenuRow key={item.name} item={item} divided={ii > 0} />
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          {/* Notas legales al pie de la carta */}
          <div className="mx-auto mt-8 flex max-w-[800px] flex-col gap-2 border-t border-rule pt-6 text-[0.8125rem] text-cement sm:flex-row sm:justify-between sm:gap-10">
            <p className="max-w-[52ch]">
              Precios en euros con IVA incluido. Si tienes alguna alergia o
              intolerancia, dínoslo al pedir y te contamos los ingredientes de
              cada elaboración.
            </p>
            <p className="max-w-[34ch] shrink-0 sm:text-right">
              <span aria-hidden="true">* </span>
              Precio pendiente de confirmar con el local.
            </p>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
