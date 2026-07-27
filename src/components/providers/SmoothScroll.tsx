"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Instancia viva de Lenis, a nivel de modulo.
 *
 * Cualquier capa que se ponga por encima de la pagina — el menu movil, el
 * lightbox de la galeria — tiene que congelar el scroll de detras. Con Lenis
 * no basta `body { overflow: hidden }`: quien escucha la rueda es Lenis sobre
 * `window`, asi que el fondo seguiria desplazandose por debajo del overlay.
 * Hay que pararlo de verdad.
 *
 * Es un singleton de modulo y no un contexto de React a proposito: lo consume
 * codigo que corre fuera del arbol (los callbacks de PhotoSwipe), donde un
 * hook no llega.
 */
let lenisInstance: Lenis | null = null;

/** Cuenta de capas que piden bloqueo, para que dos overlays a la vez no se
 *  pisen: el ultimo en cerrarse es el que devuelve el scroll. */
let lockCount = 0;

export function lockPageScroll() {
  lockCount += 1;
  if (lockCount === 1) lenisInstance?.stop();
}

export function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) lenisInstance?.start();
}

/**
 * SmoothScroll — Lenis + GSAP compartiendo un unico bucle de frames.
 *
 * Lenis interpola el scroll y GSAP dibuja: si cada uno corre su propio
 * requestAnimationFrame el parallax llega un frame tarde y se ve el temblor.
 * Aqui GSAP es el reloj y Lenis se engancha a su ticker.
 *
 * Con prefers-reduced-motion el scroll suave no se monta: interpolar el
 * scroll de alguien que ha pedido que nada se mueva es exactamente lo que
 * esa preferencia esta tratando de evitar.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    // Referencia estable: el mismo callback que se anade es el que se quita.
    // Pasar una funcion nueva a remove() no desengancha nada y deja el
    // ticker corriendo contra una instancia de Lenis ya destruida.
    const tick = (time: number) => lenis.raf(time * 1000);

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisInstance = null;
      lockCount = 0;
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
