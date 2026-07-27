"use client";

import Image from "next/image";
import { Parallax } from "@/components/motion/Reveal";

/**
 * ImageDivider — franja panorámica a sangre entre secciones.
 *
 * Rompe el ritmo vertical de la página insertando una franja de imagen de
 * altura generosa. El parallax ligero (speed -5) da sensación de profundidad
 * sin desorientar. El clip-path reveal de entrada se activa vía CSS animation
 * apoyada en el IntersectionObserver que inyecta la clase `in-view`.
 *
 * Uso:
 *   <ImageDivider
 *     src="/images/local/fachada-shalom.webp"
 *     alt="La barra de Shalom vista desde la entrada"
 *   />
 */
export function ImageDivider({
  src,
  alt,
  height = "clamp(22rem, 35vw, 40rem)",
  parallaxSpeed = -5,
  priority = false,
}: {
  src: string;
  alt: string;
  /** Altura CSS del contenedor. Acepta cualquier valor CSS. */
  height?: string;
  parallaxSpeed?: number;
  priority?: boolean;
}) {
  return (
    <div
      className="image-divider-root relative w-full overflow-hidden"
      style={{ height }}
      aria-hidden={alt === "" ? true : undefined}
    >
      <Parallax
        speed={parallaxSpeed}
        className="absolute inset-x-0 -top-[7%] h-[114%]"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority={priority}
        />
      </Parallax>

      {/* Velo superior e inferior para integrar la franja con las secciones
          adyacentes sin un corte abrupto. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-void to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-void to-transparent"
      />
    </div>
  );
}
