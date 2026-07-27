"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ListIcon, XIcon, PhoneIcon } from "@phosphor-icons/react";
import { Shell } from "@/components/ui/Shell";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { lockPageScroll, unlockPageScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "#filosofia", label: "Filosofía" },
  { href: "#galeria", label: "Galería" },
  { href: "#carta", label: "Carta" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#visitanos", label: "Visítanos" },
];

/**
 * Navbar — 68px fijos, transparente sobre el Hero y con velo de carbon en
 * cuanto empieza el scroll. Comparte Shell con el resto de la pagina, de
 * modo que el wordmark queda a plomo con el filete superior del Hero y con
 * el margen izquierdo de todas las secciones.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** Si este componente pidio el bloqueo de scroll. Evita que el primer paso
   *  del efecto, con el menu cerrado, devuelva un bloqueo que nunca tomo. */
  const lockedRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Apertura y cierre del menu movil.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const items = listRef.current?.querySelectorAll("li");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (open) {
      // `overflow: hidden` en el body no basta: quien escucha la rueda es
      // Lenis sobre `window`, asi que sin pararlo la pagina sigue viajando
      // por debajo del menu y al cerrarlo aparece otra seccion.
      document.body.style.overflow = "hidden";
      if (!lockedRef.current) {
        lockPageScroll();
        lockedRef.current = true;
      }
      gsap.set(menu, { display: "flex" });

      if (reduced) {
        gsap.set(menu, { clipPath: "inset(0% 0% 0% 0%)" });
        if (items?.length) gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        menu,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "expo.out" }
      );

      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.06,
            delay: 0.15,
          }
        );
      }
      return;
    }

    document.body.style.overflow = "";
    if (lockedRef.current) {
      unlockPageScroll();
      lockedRef.current = false;
    }
    gsap.to(menu, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: reduced ? 0 : 0.4,
      ease: "expo.in",
      onComplete: () => gsap.set(menu, { display: "none" }),
    });
  }, [open]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    },
    [open]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // El body y Lenis quedarian bloqueados si el componente se desmonta abierto.
  useEffect(() => () => {
    document.body.style.overflow = "";
    if (lockedRef.current) {
      unlockPageScroll();
      lockedRef.current = false;
    }
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[68px] transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-out-expo)]",
          // Sin scroll la barra flota sobre la fotografia del Hero y toma la
          // rampa del modo oscuro SIN pintar fondo: solo asi el subrayado de
          // acento y el foco de teclado se ven sobre la foto.
          scrolled
            ? "border-b border-rule bg-void/85 backdrop-blur-xl"
            : "tokens-dark border-b border-transparent bg-transparent"
        )}
      >
        <Shell as="nav" className="flex h-full items-center justify-between gap-8">
          <a
            href="#inicio"
            aria-label="shalom, ir al inicio"
            className={cn(
              "shrink-0 text-[1.375rem] transition-[color,opacity] duration-300 hover:opacity-70",
              scrolled ? "text-snow" : "text-white"
            )}
          >
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-9 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "group relative py-2 text-[0.9375rem] font-medium transition-colors duration-200",
                    scrolled ? "text-ash hover:text-snow" : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  {/* Subrayado de acento. Es una de las pocas apariciones del
                      color fuera de un estado de reposo neutro. */}
                  <span
                    className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-3">
            {/* El CTA de la barra NO repite el del Hero. Tenerlos a los dos
                en "Ver la carta", separados por unos pocos pixeles en el
                primer viewport, gastaba dos veces el mismo destino: este
                lleva a la ficha de visita — mapa, horario y telefono. */}
            <Button
              href="#visitanos"
              id="nav-cta-visitanos"
              size="sm"
              variant={scrolled ? "solid" : "light"}
              className="max-sm:hidden"
            >
              Visítanos
            </Button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="menu-movil"
              className={cn(
                "grid size-10 place-items-center rounded-full border transition-colors duration-200 lg:hidden",
                scrolled
                  ? "border-rule-2 text-mist hover:border-snow hover:text-snow"
                  : "border-white/30 text-white hover:border-white"
              )}
            >
              <ListIcon size={17} weight="regular" />
            </button>
          </div>
        </Shell>
      </header>

      {/* ── Menu movil ───────────────────────────────────────────────── */}
      <div
        ref={menuRef}
        id="menu-movil"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed inset-0 z-[60] hidden flex-col bg-void lg:hidden"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        <Shell className="flex h-[68px] shrink-0 items-center justify-between">
          <span className="text-[1.375rem] text-snow">
            <Wordmark />
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="grid size-10 place-items-center rounded-full border border-rule-2 text-mist transition-colors duration-200 hover:border-snow hover:text-snow"
          >
            <XIcon size={17} weight="regular" />
          </button>
        </Shell>

        <Shell className="flex flex-1 flex-col justify-center">
          <ul ref={listRef}>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline justify-between gap-6 border-b border-rule py-5 font-display text-[clamp(1.75rem,8vw,2.75rem)] leading-tight tracking-[-0.02em] text-snow transition-colors duration-200 hover:text-accent"
                >
                  <span>{link.label}</span>
                  <span
                    aria-hidden="true"
                    className="font-sans text-base text-slate transition-[transform,color] duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-accent"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Shell>

        {/* En el cajon movil el CTA principal es llamar: quien abre esto
            desde la calle quiere saber si estan abiertos o reservar mesa, y
            la carta ya esta un dedo mas arriba en la propia lista. */}
        <Shell className="flex shrink-0 flex-col gap-3 pb-10 pt-8">
          <Button href="#carta" onClick={() => setOpen(false)} className="w-full sm:hidden">
            Ver la carta
          </Button>
          <Button
            href={site.phone.href}
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:hidden"
          >
            <PhoneIcon size={15} weight="regular" />
            {site.phone.display}
          </Button>
        </Shell>
      </div>
    </>
  );
}
