"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { OpenStatus } from "@/components/motion/OpenStatus";
import { site } from "@/data/site";

/**
 * Foto real de la barra del local, no imagen de banco.
 *
 * Asset local y en minuscula: la imagen del Hero es el LCP de la pagina, y
 * servirla desde el propio origen ahorra la resolucion DNS y el handshake TLS
 * contra un tercero justo en el momento mas caro de la carga. La ruta va toda
 * en minusculas a proposito — Windows resuelve `/images/HERO/` igual que
 * `/images/hero/`, pero el servidor de produccion es Linux y ahi la primera
 * devuelve un 404.
 */
const HERO_IMAGE = "/images/hero/hero-barista.webp";

/**
 * Hero — fotografia a pantalla completa, velo en dos capas y contenido
 * centrado en tres planos de z-index.
 *
 *   z-0   <Image fill object-cover />   fotografia de fondo
 *   z-10  velo                          base plana + foco central + pie
 *   z-20  contenido                     h1 + fila de botones + barra de datos
 *
 * EL VELO. La foto de la barra es clara: pared gris, maquina blanca y una
 * pila de vasos justo detras del titular. Un velo plano lo bastante denso
 * para que el texto pequeno cumpla AA apagaria la foto entera y dejaria un
 * rectangulo gris. En su lugar van dos capas: una base suave sobre toda la
 * imagen, que deja vivos al barista y a la maquina en los bordes, y un foco
 * eliptico mas denso justo bajo el bloque de texto. El contraste se concentra
 * donde hay letras y la fotografia respira donde no las hay.
 *
 * Movimiento: parallax de la imagen de fondo ligado al scroll (GSAP
 * ScrollTrigger con scrub) y entrada escalonada del titular y los botones al
 * montar. Todo se anula con prefers-reduced-motion.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const bg = bgRef.current;
    if (!root || !bg) return;

    gsap.registerPlugin(ScrollTrigger);

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const rises = root.querySelectorAll<HTMLElement>(".anim-rise");

      if (isReduced) {
        gsap.set(rises, { clearProps: "all" });
        return;
      }

      // Entrada: fade up escalonado del titular y los botones.
      gsap.to(rises, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "expo.out",
        delay: 0.2,
      });

      // Parallax del fondo. La capa mide 120% de alto y se desplaza dentro
      // del recorte de la seccion, de modo que nunca descubre el borde.
      gsap.fromTo(
        bg,
        { yPercent: 0 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="inicio"
      aria-label="Inicio"
      className="relative flex h-dvh min-h-[34rem] w-full items-center justify-center overflow-hidden"
    >
      {/* ── Imagen de fondo ────────────────────────────────────────────── */}
      <div ref={bgRef} className="absolute inset-x-0 -top-[10%] z-0 h-[120%] will-change-transform">
        <Image
          src={HERO_IMAGE}
          alt="Un barista de shalom preparando un café en la máquina Rocket de la barra del local"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
      </div>

      {/* ── Velo ───────────────────────────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 z-10 bg-black/50" />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_68%_54%_at_50%_46%,rgb(0_0_0/0.76)_0%,rgb(0_0_0/0.45)_55%,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black/90 to-transparent"
      />

      {/* ── Contenido ──────────────────────────────────────────────────── */}
      <div className="relative z-20 mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <span className="anim-rise mb-6 text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-white/75">
          {site.descriptor} · {site.address.city}
        </span>

        <h1 className="anim-rise font-display text-[clamp(2.5rem,7vw,5.5rem)] font-normal leading-[1.05] tracking-[-0.02em] text-white">
          Café de especialidad,
          <br />
          molido al momento
        </h1>

        <p className="anim-rise mt-8 max-w-[46ch] text-lg leading-relaxed text-white/85">
          Grano de origen, molido en el momento de servirlo. Espresso, V60 y
          brunch en {site.address.street}.
        </p>

        {/* `flex-wrap`: los dos CTA suman 339px y en una pantalla de 320 no
            caben en una linea. Sin envolver, se salian del viewport y el
            recorte del body los cortaba por los dos lados. */}
        <div className="anim-rise mt-10 flex flex-row flex-wrap items-center justify-center gap-4">
          <Button href="#carta" id="hero-cta-carta" variant="light">
            Ver la carta
          </Button>
          <Button
            href={site.maps.directions}
            id="hero-cta-llegar"
            variant="light-outline"
            external
          >
            Cómo llegar
          </Button>
        </div>
      </div>

      {/* Barra de datos al pie del Hero. Va fuera del bloque de contenido
          para no alterar su estructura, y mantiene visible lo que trae a
          alguien a esta pagina desde el movil: donde esta, si esta abierto
          y como llamar. */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/15">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-2 px-6 py-5 text-[0.6875rem] uppercase tracking-[0.18em] text-white/70 sm:flex-row sm:justify-between md:px-12 lg:px-24">
          <address className="not-italic">{site.address.street}</address>
          <OpenStatus />
          <a
            href={site.phone.href}
            className="transition-colors duration-200 hover:text-white"
          >
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
