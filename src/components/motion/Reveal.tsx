"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveal — entrada al viewport.
 *
 * Anima todos los descendientes marcados con `.anim-rise`, en stagger y en
 * orden de documento. El estado inicial vive en CSS bajo `.js-motion`, de
 * forma que sin JS el contenido se sirve visible: nunca hay texto esperando
 * a un reveal que no va a llegar.
 */
export function Reveal({
  as: Tag = "div",
  stagger = 0.08,
  delay = 0,
  start = "top 82%",
  className,
  children,
}: {
  as?: "div" | "ul" | "dl" | "header";
  stagger?: number;
  delay?: number;
  start?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>(".anim-rise");
    if (!targets.length) return;

    if (reduced()) {
      gsap.set(targets, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay,
        stagger,
        ease: "expo.out",
        scrollTrigger: { trigger: root, start, once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [stagger, delay, start]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

/**
 * MaskLines — revelado por lineas tras una mascara.
 *
 * Cada hijo directo se recorta y su contenido sube desde abajo. Se reserva
 * para titulares: aplicado a parrafos convierte la lectura en un desfile.
 */
export function MaskLines({
  delay = 0,
  stagger = 0.09,
  start = "top 84%",
  immediate = false,
  className,
  children,
}: {
  delay?: number;
  stagger?: number;
  start?: string;
  /** Dispara al montar en vez de al entrar al viewport. Solo para el Hero. */
  immediate?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const lines = root.querySelectorAll<HTMLElement>(".mask-line");
    if (!lines.length) return;

    if (reduced()) {
      gsap.set(lines, { clearProps: "all" });
      return;
    }

    // El estado inicial se declara aqui, no se hereda del CSS:
    // getComputedStyle devuelve el translate porcentual ya resuelto a pixeles,
    // asi que GSAP lo leeria como `y` y un tween a `yPercent: 0` no moveria
    // nada. La linea se quedaria invisible pero ocupando su hueco.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        { yPercent: 105, y: 0 },
        {
          yPercent: 0,
          duration: 1.15,
          delay,
          stagger,
          ease: "expo.out",
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: root, start, once: true } }),
        }
      );
    }, root);

    return () => ctx.revert();
  }, [delay, stagger, start, immediate]);

  return (
    <div ref={ref} className={cn("anim-mask", className)}>
      {children}
    </div>
  );
}

/**
 * Line — una linea dentro de MaskLines. El span exterior recorta, el
 * interior es el que viaja.
 */
export function Line({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("block overflow-hidden pt-[0.08em] pb-[0.08em]", className)}>
      <span className="mask-line block">{children}</span>
    </span>
  );
}

/**
 * Parallax — desplazamiento vertical ligado al scroll.
 *
 * `speed` es el recorrido total en porcentaje de la propia altura del
 * elemento a lo largo de su paso por el viewport. Negativo sube, positivo
 * baja. Se mantiene por debajo de 16 a proposito: por encima el elemento se
 * despega de su contexto y el efecto pasa de profundidad a mareo.
 */
export function Parallax({
  speed = -8,
  className,
  children,
}: {
  speed?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed / 2 },
        {
          yPercent: speed / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * FloatImage — animación de levitación infinita.
 *
 * Mueve el elemento `amplitude` píxeles hacia arriba y hacia abajo de forma
 * sinusoidal con `yoyo: true, repeat: -1`. Diseñado para imágenes PNG sin
 * fondo en secciones de filosofía o hero.
 */
export function FloatImage({
  amplitude = 12,
  duration = 3.2,
  className,
  children,
}: {
  amplitude?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -amplitude / 2 },
        {
          y: amplitude / 2,
          duration,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }
      );
    }, el);

    return () => ctx.revert();
  }, [amplitude, duration]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * TiltCard — inclinación 3D en hover mediante GSAP.
 *
 * Registra `pointermove` sobre el contenedor y calcula rotateX / rotateY
 * relativo al centro del elemento. Al salir el puntero restaura a cero con
 * un spring suave. Máximo de rotación configurable via `maxDeg`.
 *
 * Compatible con touch: el giroscopio no activa pointermove en móvil salvo
 * que el navegador lo exponga, por lo que en móvil simplemente no hay tilt
 * (se degrada con gracia).
 */
export function TiltCard({
  maxDeg = 8,
  className,
  children,
}: {
  maxDeg?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(el, {
        rotateY: dx * maxDeg,
        rotateX: -dy * maxDeg,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "expo.out",
        overwrite: "auto",
      });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [maxDeg]);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
