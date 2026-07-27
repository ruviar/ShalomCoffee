import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Gallery } from "@/components/sections/Gallery";
import { Menu } from "@/components/sections/Menu";
import { Reviews } from "@/components/sections/Reviews";
import { Location } from "@/components/sections/Location";

export default function Page() {
  return (
    <>
      {/* El orden alterna superficie clara y oscura sin excepcion: ninguna
          seccion comparte fondo con la que tiene encima o debajo. Cambiar el
          orden aqui sin revisar las clases `surface-*` rompe el ritmo. */}

      {/* Hero — 100dvh, fotografia real de la barra */}
      <Hero />

      {/* Filosofía — crema · manifiesto + collage de tres fotos */}
      <Philosophy />

      {/* Galería — carbón · rejilla propia con lightbox propio */}
      <Gallery />

      {/* Carta — blanco · switch Bebida / Comida + destacados con foto */}
      <Menu />

      {/* Reseñas — carbón · valoración real y tarjetas de papel */}
      <Reviews />

      {/* Visítanos — crema · mapa tratado, teléfono y horario */}
      <Location />
    </>
  );
}
