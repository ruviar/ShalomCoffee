"use client";

import Image from "next/image";
import { Shell, Section, RunningHead, Display } from "@/components/ui/Shell";
import { Reveal, MaskLines, Line, Parallax } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const paragraphs = [
  "Molemos cada café en el momento de servirlo. El origen cambia cada pocas semanas y la receta se ajusta a lo que pide el grano: dosis, tiempo y temperatura se recalibran en barra.",
  "Con la comida hacemos lo mismo. Pan del día, aguacate en su punto y hummus de la casa. Carta corta, sin fotos que no se parezcan al plato.",
];

/**
 * Las tres imagenes del collage cuentan el proceso en orden: el grano, la
 * extraccion y el sitio donde se sirve. Cada una lleva su correccion de color
 * porque no vienen de la misma sesion: las dos primeras son producto en
 * penumbra y la tercera es una toma real del local, plana y a plena luz.
 */
const collage = [
  {
    src: "/images/gallery/coffee-pour.webp",
    alt: "Espresso cayendo en una taza de cerámica negra, con la crema formándose en la superficie",
    className: "col-span-2 max-lg:aspect-[16/10] lg:row-span-3",
    grading: "graded",
    parallax: -6,
    sizes: "(max-width: 1024px) 100vw, 46vw",
  },
  {
    src: "/images/gallery/banner-cafe.webp",
    alt: "Granos de café de especialidad recién tostados, en primer plano",
    className: "max-lg:aspect-square lg:row-span-2",
    grading: "graded",
    parallax: -9,
    sizes: "(max-width: 1024px) 50vw, 23vw",
  },
  {
    src: "/images/local/fachada-shalom.webp",
    alt: "Escaparate de shalom speciality coffee con el rótulo en el cristal y gente sentada dentro",
    className: "max-lg:aspect-square lg:row-span-2",
    grading: "graded-flat",
    parallax: -4,
    sizes: "(max-width: 1024px) 50vw, 23vw",
  },
] as const;

/**
 * Philosophy — manifiesto a dos columnas sobre crema.
 *
 * Familia de layout: columna de lectura + rejilla de imagen.
 *
 * La columna de imagen es un collage de tres piezas que ESTIRA a la altura de
 * la columna de texto (`lg:items-stretch` en el grid padre, `h-full` en la
 * rejilla). Antes habia aqui una sola foto centrada verticalmente en su
 * columna: al ser mas corta que el texto dejaba dos bolsas de blanco arriba y
 * abajo que se leian como un fallo de maquetacion, no como respiracion.
 *
 * El parallax vive dentro de cada celda y no en la celda: la imagen se mueve
 * detras de un marco quieto, de modo que la rejilla nunca se desalinea.
 */
export function Philosophy() {
  return (
    <Section id="filosofia" className="surface-cream">
      <Shell>
        <RunningHead label="Filosofía" meta="Molienda al momento" />

        <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 lg:mt-16 lg:grid-cols-12 lg:items-stretch">
          {/* ── Columna de lectura ──────────────────────────────────────── */}
          <div className="flex flex-col lg:col-span-6">
            <MaskLines>
              <Display>
                <Line>La diferencia</Line>
                <Line className="text-cement">está en el grano.</Line>
              </Display>
            </MaskLines>

            {/* Un unico ritmo vertical: el mismo hueco entre el titular y el
                primer parrafo que entre los dos parrafos. */}
            <Reveal className="mt-10 flex max-w-[58ch] flex-col gap-10">
              {paragraphs.map((text) => (
                <p key={text} className="anim-rise text-[1.0625rem] text-mist">
                  {text}
                </p>
              ))}
            </Reveal>

            {/* Filete de acento. Cierra la columna por abajo y es una de las
                pocas apariciones del color en estado de reposo. */}
            <div
              aria-hidden="true"
              className="mt-10 h-px w-16 bg-accent lg:mt-auto"
            />
          </div>

          {/* ── Collage ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-6">
            {/* En escritorio las celdas NO llevan proporcion propia: las filas
                reparten la altura que marca la columna de texto, de modo que
                las dos columnas terminan a la misma linea. Si el collage
                impusiera su alto intrinseco volveria a abrirse una bolsa de
                blanco bajo el ultimo parrafo. El minimo evita que en pantallas
                anchas, con el texto en pocas lineas, las fotos se aplasten. */}
            <div className="grid h-full grid-cols-2 grid-rows-[auto_auto] gap-3 lg:min-h-[32rem] lg:grid-rows-5">
              {collage.map((cell) => (
                <figure
                  key={cell.src}
                  className={cn(
                    "relative overflow-hidden rounded-edge border border-rule bg-onyx",
                    cell.className
                  )}
                >
                  <Parallax
                    speed={cell.parallax}
                    className="absolute inset-x-0 -top-[6%] h-[112%]"
                  >
                    <Image
                      src={cell.src}
                      alt={cell.alt}
                      fill
                      sizes={cell.sizes}
                      className={cn("object-cover", cell.grading)}
                    />
                  </Parallax>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
