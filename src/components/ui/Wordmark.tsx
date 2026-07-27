import { cn } from "@/lib/utils";

/**
 * Wordmark — el logotipo del escaparate.
 *
 * Va en la geometrica, nunca en la serif de titulares. La serif es la voz
 * editorial de la web; el logotipo es un activo de marca que ya existe en el
 * rotulo del local, en caja baja y con el tracking muy cerrado. Vestirlo de
 * serif seria inventar una identidad que el negocio no tiene.
 *
 * El tamano lo hereda del contenedor via `font-size`, de modo que el
 * descriptor siempre guarda la misma proporcion con el nombre.
 */
export function Wordmark({
  className,
  descriptor = false,
}: {
  className?: string;
  descriptor?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-[0.9]", className)}>
      <span className="font-sans font-semibold lowercase tracking-[-0.045em]">
        shalom
      </span>
      {descriptor && (
        <span className="mt-[0.28em] font-sans text-[0.235em] font-medium uppercase tracking-[0.2em] text-ash">
          speciality coffee
        </span>
      )}
    </span>
  );
}
