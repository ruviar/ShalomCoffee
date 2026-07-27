import {
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Shell, Section, RunningHead, Display } from "@/components/ui/Shell";
import { MaskLines, Line, Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { OpenStatus } from "@/components/motion/OpenStatus";
import { groupedSchedule } from "@/data/hours";
import { site, fullAddress } from "@/data/site";

/**
 * Location — cierre de la pagina. Mapa a la izquierda, los datos que hacen
 * falta para venir a la derecha.
 *
 * Familia de layout: bloque de dos piezas, imagen viva y tabla de datos.
 *
 * EL MAPA. Google sirve el embed con su propia paleta y su propio tipo de
 * letra, y sin clave de la Maps JavaScript API no hay JSON de estilo que
 * aplicarle. El tratamiento se hace entonces por composicion, en dos capas:
 * el iframe va desaturado y contrastado (`.map-canvas`), y encima lleva una
 * lamina del ambar en `multiply` (`.map-tint`) que le devuelve la temperatura
 * del resto del sitio. No es el gris de fabrica de Google y no cuesta ni una
 * dependencia ni una peticion mas.
 *
 * La lamina no intercepta el puntero: el mapa se sigue arrastrando y
 * ampliando con normalidad por debajo.
 */
export function Location() {
  return (
    <Section id="visitanos" className="surface-cream">
      <Shell>
        <RunningHead
          label="Dónde estamos"
          meta={`${site.address.postalCode} ${site.address.city}`}
        />

        <div className="mt-12 lg:mt-16">
          <MaskLines>
            <Display className="max-w-[16ch]">
              <Line>Luces de la</Line>
              <Line>Ciudad, 21.</Line>
            </Display>
          </MaskLines>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* Mapa */}
          <div className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-edge border border-rule bg-onyx max-lg:aspect-[4/3] lg:min-h-[30rem]">
              <iframe
                src={site.maps.embed}
                title={`Mapa de ${site.legalName} en ${fullAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-canvas size-full border-0"
              />
              <div aria-hidden="true" className="map-tint pointer-events-none absolute inset-0" />
              {/* Filete interior. Recorta el borde duro del embed y ata el
                  mapa al mismo sistema de 1px que el resto de la pagina. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-edge border border-rule-2"
              />
            </div>
          </div>

          {/* Datos */}
          <div className="flex flex-col gap-10 lg:col-span-5">
            <Reveal className="flex flex-col gap-10" stagger={0.1}>
              <div className="anim-rise flex flex-col gap-3 border-t border-rule pt-5">
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-cement">
                  Dirección
                </span>
                <address className="font-display text-2xl not-italic leading-snug text-snow md:text-[1.75rem]">
                  {site.address.street}
                  <br />
                  <span className="text-cement">
                    {site.address.postalCode} {site.address.city}
                  </span>
                </address>
                <OpenStatus className="mt-1" />
              </div>

              <div className="anim-rise flex flex-col gap-3 border-t border-rule pt-5">
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-cement">
                  Teléfono
                </span>
                {/* Enlace `tel:` de verdad: quien abre esto desde el movil
                    llama con un toque, sin copiar el numero a mano. */}
                <a
                  href={site.phone.href}
                  className="group inline-flex w-fit items-center gap-2.5 font-display text-2xl leading-snug text-snow transition-colors duration-200 hover:text-accent md:text-[1.75rem]"
                >
                  <PhoneIcon
                    size={20}
                    weight="regular"
                    className="text-cement transition-colors duration-200 group-hover:text-accent"
                  />
                  {site.phone.display}
                </a>
              </div>

              <div className="anim-rise flex flex-col gap-4 border-t border-rule pt-5">
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-cement">
                  Horario
                </span>
                <dl className="flex flex-col">
                  {groupedSchedule.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-b border-rule py-3 last:border-b-0"
                    >
                      <dt className="text-[0.9375rem] text-mist">{row.label}</dt>
                      <dd className="tnum text-right font-mono text-[0.8125rem] text-ash">
                        {row.intervals.map((interval) => (
                          <span key={interval.from} className="block">
                            {interval.from} – {interval.to}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <Button href={site.maps.directions} id="location-cta-llegar" external>
                <MapPinIcon size={15} weight="regular" />
                Cómo llegar
              </Button>
              <Button
                href={site.social.instagram.url}
                id="location-cta-instagram"
                variant="outline"
                external
              >
                <InstagramLogoIcon size={15} weight="regular" />
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
