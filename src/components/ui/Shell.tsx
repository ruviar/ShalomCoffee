import { cn } from "@/lib/utils";

/**
 * Shell — contenedor horizontal unico de la pagina.
 *
 *   max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-24
 *
 * Todo lo que tenga borde izquierdo o derecho visible pasa por aqui. Ninguna
 * seccion define sus propios margenes laterales: si un elemento se come el
 * borde de la pantalla es porque se salto este componente.
 */
export function Shell({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "header" | "footer" | "nav" | "section";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[1400px] px-6 md:px-12 lg:px-24",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Section — ritmo vertical unico: py-24 en todas las secciones.
 *
 * Section + Shell componen exactamente el wrapper acordado:
 *   py-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full
 * repartido en dos nodos para que el navbar y el footer puedan reutilizar
 * los margenes laterales sin heredar el padding vertical de seccion.
 */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("relative py-24", className)}>
      {children}
    </section>
  );
}

/**
 * RunningHead — el sistema de encabezado de seccion.
 *
 * Un filete de 1px a todo el ancho, con la etiqueta de la seccion a la
 * izquierda y un dato real de esa seccion a la derecha, como el folio de una
 * publicacion. Es la misma gramatica en todas las secciones, no un eyebrow
 * suelto flotando sobre cada bloque.
 *
 * `meta` lleva informacion, nunca una numeracion decorativa: cuantas
 * referencias tiene la carta, la valoracion real, el codigo postal. Si una
 * seccion no tiene ningun dato que aportar, se omite.
 */
export function RunningHead({
  label,
  meta,
  className,
}: {
  label: string;
  meta?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-t border-rule pt-4",
        className
      )}
    >
      <span className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-ash">
        {label}
      </span>
      {meta && (
        <span className="tnum font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-cement">
          {meta}
        </span>
      )}
    </div>
  );
}

/**
 * Display — el titular de seccion. Una sola escala para toda la pagina, de
 * modo que ninguna seccion pueda gritar mas fuerte que otra por accidente.
 */
export function Display({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "font-display font-normal text-snow",
        "text-[clamp(2.25rem,5.2vw,4.25rem)] leading-[1.04] tracking-[-0.02em]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
