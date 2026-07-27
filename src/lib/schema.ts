import { schedule } from "@/data/hours";
import { menu } from "@/data/menu";
import { site } from "@/data/site";

/**
 * JSON-LD de negocio local. Sin bloque `geo`: no disponemos de coordenadas
 * verificadas y no se inventan. Google resuelve la ficha por direccion postal.
 */
export function buildLocalBusinessSchema() {
  const openingHoursSpecification = schedule.flatMap((day) =>
    day.intervals.map((interval) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${day.schemaDay}`,
      opens: interval.from,
      closes: interval.to,
    }))
  );

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: site.legalName,
    alternateName: site.name,
    description: `${site.tagline} ${site.address.street}, ${site.address.city}.`,
    url: site.url,
    telephone: site.phone.e164,
    servesCuisine: "Café de especialidad",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    sameAs: [site.social.instagram.url],
    openingHoursSpecification,
    hasMenu: {
      "@type": "Menu",
      url: `${site.url}/#carta`,
      hasMenuSection: menu.flatMap((tab) =>
        tab.groups.map((group) => ({
          "@type": "MenuSection",
          name: `${tab.label} · ${group.title}`,
          hasMenuItem: group.items.map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            ...(item.note ? { description: item.note } : {}),
            offers: {
              "@type": "Offer",
              price: item.price.toFixed(2),
              priceCurrency: "EUR",
            },
          })),
        }))
      ),
    },
  };

  // AggregateRating solo se emite con un recuento real de resenas.
  if (site.rating.count !== null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: site.rating.value,
      bestRating: site.rating.best,
      reviewCount: site.rating.count,
    };
  }

  return schema;
}
