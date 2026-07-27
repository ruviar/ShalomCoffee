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
