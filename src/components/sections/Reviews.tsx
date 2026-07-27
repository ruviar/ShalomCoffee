"use client";

import { Shell, Section, RunningHead } from "@/components/ui/Shell";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { Star, GoogleLogo } from "@phosphor-icons/react";
import { reviews } from "@/data/reviews";
import { site } from "@/data/site";

const hasPlaceholders = reviews.some((review) => review.placeholder);

/**
 * Reviews — banda de carbon con la valoracion real a gran escala y las
 * resenas en tarjetas de papel.
 *
 * Familia de layout: cifra de titular + rejilla de tarjetas.
 *
 * La seccion es la mas oscura de la pagina junto con la Galeria y el pie:
 * rima con el Hero y hace de suelo bajo la Carta, que es el punto de maxima
 * luz. Las tarjetas entran en `.surface-paper`, de modo que su texto vuelve a
 * la rampa clara por cascada y ninguna de ellas necesita saber que esta
 * apoyada sobre una superficie oscura.
 *
 * El 4,9/5 es real y esta verificado. Las citas tambien: si alguna volviera a
 * marcarse como `placeholder`, la seccion se delata sola. Publicar
 * testimonios inventados con nombre y apellido es fabricar prueba social.
 */
export function Reviews() {
  return (
    <Section id="resenas" className="surface-dark">
      <Shell>
        <RunningHead label="Valoraciones" meta={`${site.rating.display}/5 Google`} />

        <div className="mt-12 flex flex-col gap-8 lg:mt-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-baseline gap-5">
            <CountUp
              value={site.rating.value}
              className="tnum font-display text-[clamp(4.5rem,13vw,9rem)] leading-[0.85] tracking-[-0.03em] text-snow"
            />
            <div className="flex flex-col gap-1">
              <span className="text-lg text-cement">/ {site.rating.best}</span>
              <span className="text-[0.6875rem] uppercase tracking-[0.2em] text-ash">
                en Google
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex gap-1.5 text-accent" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} weight="fill" size={20} />
              ))}
            </div>
            <a
              href={site.maps.directions}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.2em] text-snow underline decoration-rule-2 underline-offset-[6px] transition-colors duration-200 hover:text-accent hover:decoration-accent"
            >
              <GoogleLogo weight="bold" size={14} />
              Ver la ficha en Google
            </a>
          </div>
        </div>

        {hasPlaceholders && (
          <p className="mt-12 border border-dashed border-rule-2 px-5 py-4 text-[0.8125rem] text-cement lg:mt-16">
            Reseñas de ejemplo. Sustituir por el texto literal de reseñas
            reales de Google Maps, con el nombre tal y como aparece en el
            perfil público, antes de publicar.
          </p>
        )}

        <Reveal
          as="ul"
          stagger={0.09}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reviews.slice(0, 3).map((review) => (
            <li
              key={review.id}
              className="surface-paper anim-rise flex flex-col gap-4 rounded-2xl p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.9)]"
            >
              <div className="flex items-center justify-between">
                {/* `aria-label` necesita un rol que lo admita: en un `div`
                    pelado es un atributo prohibido y los lectores lo ignoran. */}
                <div className="flex gap-1 text-accent" role="img" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} weight="fill" size={16} aria-hidden="true" />
                  ))}
                </div>
                <GoogleLogo weight="bold" size={18} className="text-cement opacity-50" />
              </div>
              <p className="flex-1 text-[0.9375rem] leading-relaxed text-mist">
                &quot;{review.quote}&quot;
              </p>
              <footer className="mt-2 flex flex-col gap-0.5 border-t border-rule pt-3">
                <span className="text-[0.875rem] font-medium text-snow">
                  {review.author}
                </span>
                <span className="text-[0.75rem] text-cement">{review.context}</span>
              </footer>
            </li>
          ))}
        </Reveal>
      </Shell>
    </Section>
  );
}
