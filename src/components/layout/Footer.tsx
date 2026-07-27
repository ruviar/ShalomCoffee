import { InstagramLogoIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { Shell } from "@/components/ui/Shell";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/data/site";

const nav = [
  { href: "#filosofia", label: "Filosofía" },
  { href: "#galeria", label: "Galería" },
  { href: "#carta", label: "Carta" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#visitanos", label: "Visítanos" },
];

/**
 * Footer — cierre en carbon. El wordmark a gran escala ancla el final de la
 * pagina: se llega abajo y lo ultimo que queda en pantalla es el nombre del
 * sitio, no una fila de enlaces legales.
 *
 * Repite en texto plano los tres datos que definen la ficha del negocio —
 * direccion completa con codigo postal, telefono y horario — porque el pie es
 * donde los buscadores y los agregadores esperan encontrarlos, y porque
 * cualquier discrepancia entre esto y Google Business penaliza el SEO local.
 * Todo sale de `site` y de `hours`: no hay ni un dato escrito a mano aqui.
 */
export function Footer() {
  return (
    <footer className="surface-dark border-t border-rule">
      <Shell className="py-16 md:py-20">
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <span className="text-[2.5rem] text-snow md:text-[3rem]">
              <Wordmark descriptor />
            </span>
            <address className="flex flex-col gap-3 text-sm not-italic leading-relaxed text-ash">
              <span>
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </span>
              <a
                href={site.phone.href}
                className="inline-flex w-fit items-center gap-2 text-snow transition-colors duration-200 hover:text-accent"
              >
                <PhoneIcon size={15} weight="regular" />
                {site.phone.display}
              </a>
            </address>
          </div>

          <nav aria-label="Pie de página" className="lg:col-span-4">
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-cement">
              Navegación
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-ash underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-snow hover:decoration-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-cement">
              Síguenos
            </h2>
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 text-sm text-ash transition-colors duration-200 hover:text-accent"
            >
              <InstagramLogoIcon size={16} weight="regular" />
              {site.social.instagram.handle}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-rule pt-6 text-[0.6875rem] uppercase tracking-[0.18em] text-cement sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}
          </p>
          <p>
            {site.address.city}, {site.address.region}
          </p>
        </div>
      </Shell>
    </footer>
  );
}
