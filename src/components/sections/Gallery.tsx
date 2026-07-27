"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react";
import { Shell, Section, RunningHead, Display } from "@/components/ui/Shell";
import { Reveal, MaskLines, Line } from "@/components/motion/Reveal";
import { lockPageScroll, unlockPageScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

import "photoswipe/style.css";

type Shot = {
  src: string;
  /** Dimensiones reales del archivo. PhotoSwipe las necesita ANTES de cargar
   *  la imagen para reservar el hueco y no dar un salto al abrirse. */
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Correccion de color. Ver `.graded` / `.graded-flat` en globals.css. */
  grading: "graded" | "graded-flat";
};

/**
 * Galeria curada. Diez piezas, todas servidas como assets del proyecto: no hay
 * ningun embed de terceros, de modo que nada de aqui puede traerse su propia
 * interfaz — checkbox de seleccion, campo de responder, controles de story —
 * y romper la estetica del resto de la pagina.
 *
 * Queda fuera a proposito `composicion-marca-tostada.webp`, la pieza
 * tipografica de "shalom shalom shalom / TOAST": es una publicacion
 * publicitaria, no una foto de como es el local, y en una rejilla de sala y
 * producto se lee como un anuncio colado entre las fotos.
 *
 * Las tomas vienen de dos sesiones muy distintas — producto en penumbra y
 * fotos reales del local a plena luz — asi que cada una entra con la
 * correccion que le toca para que la rejilla se lea como un solo cuerpo.
 */
const shots: Shot[] = [
  {
    src: "/images/local/fachada-shalom.webp",
    width: 875,
    height: 678,
    alt: "Fachada de shalom speciality coffee en la calle Luces de la Ciudad, con el rótulo en el escaparate y clientes sentados dentro",
    caption: "El local, desde la calle",
    grading: "graded-flat",
  },
  {
    src: "/images/gallery/coffee-pour.webp",
    width: 1024,
    height: 1024,
    alt: "Espresso cayendo en una taza de cerámica negra, con la crema formándose en la superficie",
    caption: "La extracción",
    grading: "graded",
  },
  {
    src: "/images/gallery/banner-cafe.webp",
    width: 1024,
    height: 1024,
    alt: "Granos de café de especialidad recién tostados, en primer plano",
    caption: "El grano del mes",
    grading: "graded",
  },
  {
    src: "/images/gallery/toast-overhead.webp",
    width: 1024,
    height: 1024,
    alt: "Tostada de hummus con aguacate, tomate cherry y rúcula servida sobre pizarra",
    caption: "Tostada de hummus",
    grading: "graded",
  },
  {
    src: "/images/gallery/banner-tostadas.webp",
    width: 1024,
    height: 1024,
    alt: "Tostada de aguacate con tomate cherry amarillo y rojo y brotes de rúcula, en plato negro",
    caption: "Tostada de aguacate",
    grading: "graded",
  },
  {
    src: "/images/gallery/banner-bagels.webp",
    width: 1024,
    height: 1024,
    alt: "Bagel de pastrami cortado por la mitad, con cheddar fundido, cebolla caramelizada y rúcula",
    caption: "Bagel de pastrami",
    grading: "graded",
  },
  {
    src: "/images/gallery/banner-dulce.webp",
    width: 1024,
    height: 1024,
    alt: "Croissant, cinnamon roll y porción de tarta de queso servidos en platos de cerámica",
    caption: "La vitrina de dulce",
    grading: "graded",
  },
  {
    src: "/images/gallery/tostada-aguacate-plato.webp",
    width: 514,
    height: 606,
    alt: "Tostada de aguacate con tomate cherry y rúcula servida en plato oscuro",
    caption: "En barra",
    grading: "graded",
  },
  {
    src: "/images/gallery/tostada-aguacate-cerca.webp",
    width: 512,
    height: 562,
    alt: "Detalle de una tostada con queso crema, aguacate y tomate cherry asado",
    caption: "Hummus de la casa",
    grading: "graded",
  },
  {
    src: "/images/gallery/bizcocho-cortado.webp",
    width: 376,
    height: 592,
    alt: "Bizcocho casero apoyado sobre un vaso de cortado rebosando espuma",
    caption: "Bizcocho y cortado",
    grading: "graded-flat",
  },
];

const GRID_ID = "galeria-rejilla";

/**
 * Gallery — rejilla propia con lightbox propio.
 *
 * Familia de layout: rejilla de imagen sobre plinto de carbon.
 *
 * Diez celdas en 2 columnas en movil y 5 en escritorio: las dos rejillas
 * salen exactas, sin una fila coja al final. Todas las celdas comparten el
 * mismo ratio 4:5 y `object-fit: cover`, de modo que la rejilla mantiene el
 * pulso aunque los archivos de origen tengan proporciones distintas.
 *
 * Cada celda es un `<a>` al archivo completo: sin JavaScript el clic sigue
 * abriendo la foto, y PhotoSwipe se limita a interceptarlo cuando esta
 * disponible. La libreria entra por import dinamico, asi que no pesa en el
 * bundle inicial de quien no llega a abrir ninguna foto.
 */
export function Gallery() {
  useEffect(() => {
    let lightbox: { destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox");
      if (cancelled) return;

      const instance = new PhotoSwipeLightbox({
        gallery: `#${GRID_ID}`,
        children: "a",
        pswpModule: () => import("photoswipe"),
        bgOpacity: 0.97,
        padding: { top: 24, bottom: 64, left: 16, right: 16 },
        showHideAnimationType: "zoom",
      });

      // Pie de foto dentro del visor. La rejilla solo lo ensena al senalar,
      // asi que sin esto quien abre una foto desde el movil se queda sin
      // saber que esta mirando.
      instance.on("uiRegister", () => {
        instance.pswp?.ui?.registerElement({
          name: "shalom-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          onInit: (el, pswp) => {
            el.className = "pswp-caption";
            pswp.on("change", () => {
              const anchor = pswp.currSlide?.data?.element;
              el.textContent =
                anchor
                  ?.closest("figure")
                  ?.querySelector("figcaption")
                  ?.textContent?.trim() ?? "";
            });
          },
        });
      });

      // Lenis sigue escuchando la rueda por debajo del visor. Si no se para,
      // al cerrar el lightbox la pagina ha viajado sola.
      instance.on("beforeOpen", lockPageScroll);
      instance.on("destroy", unlockPageScroll);

      instance.init();
      lightbox = instance;
    })();

    return () => {
      cancelled = true;
      // Si el visor esta abierto al desmontar, destruirlo dispara `destroy`
      // y con el la devolucion del scroll.
      lightbox?.destroy();
    };
  }, []);

  return (
    <Section id="galeria" className="surface-dark">
      <Shell>
        <RunningHead label="El espacio" meta={`${shots.length} fotos`} />

        <div className="mt-12 lg:mt-16">
          <MaskLines>
            <Display className="max-w-[18ch]">
              <Line>El local, la barra</Line>
              <Line className="text-cement">y lo que sale de ella.</Line>
            </Display>
          </MaskLines>
        </div>

        <Reveal className="mt-12 md:mt-16" stagger={0.05}>
          <div id={GRID_ID} className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {shots.map((shot) => (
              <figure
                key={shot.src}
                /* El ratio cambia solo en tablet. A dos columnas sobre 834px
                   cada celda mide ~370px de ancho, y en 4:5 la rejilla se iba
                   a 2.300px de alto: cinco pantallas de scroll para diez
                   fotos. El recorte apaisado la deja en la mitad sin romper
                   la consistencia dentro de cada breakpoint. */
                className="anim-rise group relative aspect-[4/5] overflow-hidden rounded-edge border border-rule bg-onyx transition-colors duration-300 hover:border-accent focus-within:border-accent md:aspect-[4/3] lg:aspect-[4/5]"
              >
                <a
                  href={shot.src}
                  data-pswp-width={shot.width}
                  data-pswp-height={shot.height}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Ampliar la foto: ${shot.caption}`}
                  className="absolute inset-0 block"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className={cn(
                      "object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]",
                      shot.grading
                    )}
                  />

                  {/* Velo e icono, solo al senalar. Diez pies de foto siempre
                      visibles convertirian la rejilla en una tabla con fotos.
                      Van fijos a negro y blanco: son texto sobre imagen, no
                      superficie de pagina, y no siguen los tokens de tema. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <ArrowsOutSimpleIcon size={13} weight="bold" />
                  </span>
                </a>

                <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 text-[0.6875rem] uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-8 flex flex-col gap-2 border-t border-rule pt-4 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="anim-rise max-w-[52ch] text-sm text-ash">
            Las fotos son del local y del material publicado por la casa. Hay
            más en el perfil, que se actualiza cada semana.
          </p>
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noreferrer noopener"
            className="anim-rise shrink-0 text-[0.6875rem] uppercase tracking-[0.2em] text-snow underline decoration-rule-2 underline-offset-[6px] transition-colors duration-200 hover:text-accent hover:decoration-accent"
          >
            {site.social.instagram.handle}
          </a>
        </Reveal>
      </Shell>
    </Section>
  );
}
