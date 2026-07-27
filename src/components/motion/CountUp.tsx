"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * CountUp — cifra que cuenta desde cero al entrar en el viewport.
 *
 * El valor final se renderiza en el servidor dentro de un `<span>` para
 * lectores de pantalla y para el HTML sin JavaScript: la valoracion es un dato
 * real y no puede depender de que una animacion llegue a ejecutarse. La cifra
 * visible es una capa aparte, marcada como decorativa, que se pone a cero en
 * cuanto arranca el JS y sube hasta el valor cuando la seccion aparece.
 *
 * Se formatea con `Intl` en es-ES, de modo que el separador decimal es la coma
 * en cada uno de los fotogramas y no solo en el ultimo.
 */
export function CountUp({
  value,
  decimals = 1,
  duration = 1.6,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(value);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // A cero antes de que la seccion entre en pantalla. La cifra vive bajo el
    // pliegue, asi que nadie llega a ver el salto del valor final al cero.
    el.textContent = format(0);

    const counter = { current: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        current: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(counter.current);
        },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [value, decimals, duration]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {new Intl.NumberFormat("es-ES", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)}
      </span>
      <span className="sr-only">
        {new Intl.NumberFormat("es-ES", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)}
      </span>
    </span>
  );
}
