import type { Metadata, Viewport } from "next";
import { Playfair_Display, Jost } from "next/font/google";

import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { buildLocalBusinessSchema } from "@/lib/schema";
import { fullAddress, site } from "@/data/site";

/* Serif editorial de alto contraste. Solo display: titulares de seccion.
   Un unico peso: los titulares van todos en regular, asi que 500 y 600
   viajaban por la red para no pintar ni un glifo. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400"],
  display: "swap",
});

/* Geometrica de linaje Futura. Interfaz, cuerpo y etiquetas.
   Tres pesos reales: cuerpo, etiqueta y wordmark. El 300 no se usaba. */
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500", "600"],
  display: "swap",
});

/* La monoespaciada es de sistema a proposito. Solo la piden los precios, las
   horas y el folio de seccion: unas pocas decenas de cifras. Descargar una
   fuente variable de 70 KB para eso costaba mas LCP en movil de lo que
   aportaba, y la pila del sistema ya da cifras de ancho fijo. */

const description = `${site.tagline} Tostadas, bagels y reposteria en ${fullAddress}. Espresso, V60 y cold brew.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.descriptor} · ${site.address.city}`,
    template: `%s · ${site.name}`,
  },
  description,
  keywords: [
    "café de especialidad Zaragoza",
    "speciality coffee Zaragoza",
    "cafetería Zaragoza",
    "brunch Zaragoza",
    "V60 Zaragoza",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.legalName,
    title: `${site.name} · ${site.descriptor}`,
    description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  /* Carbon, no crema: la barra del navegador queda pegada al Hero, que es lo
     primero que se ve, y no al fondo de las secciones de contenido. */
  themeColor: "#16161a",
};

/**
 * Marca <html> antes del primer pintado. Solo con esta clase presente se
 * aplican los estados iniciales ocultos de las animaciones: sin JS el
 * contenido se sirve visible y no queda nada esperando un reveal.
 */
const MOTION_FLAG = `document.documentElement.classList.add("js-motion")`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-ES"
      suppressHydrationWarning
      className={`${playfair.variable} ${jost.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessSchema()) }}
        />
      </head>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-edge focus:bg-snow focus:px-5 focus:py-3 focus:text-sm focus:text-void"
        >
          Saltar al contenido
        </a>
        <SmoothScroll>
          <Navbar />
          <main id="contenido">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
