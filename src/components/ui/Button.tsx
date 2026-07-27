import { cn } from "@/lib/utils";

/**
 * Button — CTA rectangular de 2px de radio.
 *
 * Los cuatro variantes comparten altura, padding horizontal, tamano de fuente
 * y tracking exactos. Puestos uno junto a otro en un flex, sus cajas coinciden
 * al pixel: no hay forma de que un CTA quede mas alto o mas ancho que su
 * pareja. La pastilla redondeada esta descartada a proposito: el mundo de la
 * marca es industrial y de canto vivo.
 *
 * Micro-interaccion: el boton sube 2px y proyecta una sombra corta y calida
 * al senalarlo. Va en `focus-visible` ademas de en `hover` porque quien
 * navega con teclado tiene el mismo derecho a saber que el control esta vivo.
 * 180ms: por debajo no se percibe, por encima se arrastra.
 */
const BASE = [
  "inline-flex shrink-0 items-center justify-center gap-2.5",
  "rounded-edge",
  "font-medium uppercase leading-none",
  "whitespace-nowrap",
  "transition-[background-color,color,border-color,transform,box-shadow]",
  "duration-[180ms] ease-[var(--ease-out-expo)]",
  "hover:-translate-y-0.5 focus-visible:-translate-y-0.5",
  "will-change-transform",
].join(" ");

/* Dos tamanos y solo dos. `md` es el CTA de contenido, `sm` el de la barra
   de navegacion. Cualquier boton de la pagina cae en uno de los dos, asi
   que dos CTAs juntos coinciden siempre al pixel. */
const SIZES = {
  md: "h-[3.25rem] px-7 md:px-8 text-[0.75rem] tracking-[0.16em]",
  sm: "h-10 px-6 text-[0.6875rem] tracking-[0.14em]",
} as const;

/* La sombra es corta, muy difuminada y CALIDA: hereda la temperatura de la
   paleta en vez de meter un gris azulado que no existe en ninguna otra parte
   del sitio. Sobre foto y sobre carbon necesita ser mas profunda para
   despegarse del fondo. */
const LIFT =
  "hover:shadow-[0_10px_24px_-10px_rgb(23_21_15/0.45)] focus-visible:shadow-[0_10px_24px_-10px_rgb(23_21_15/0.45)]";
const LIFT_DARK =
  "hover:shadow-[0_10px_28px_-10px_rgb(0_0_0/0.7)] focus-visible:shadow-[0_10px_28px_-10px_rgb(0_0_0/0.7)]";

/* El acento entra SOLO en el estado hover/activo. En reposo la pagina sigue
   siendo monocroma; el color aparece cuando el usuario senala algo. */
const VARIANTS = {
  solid: `bg-snow text-void hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white ${LIFT}`,
  outline: `border border-rule-2 text-mist hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent ${LIFT}`,
  light: `bg-white text-black hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white ${LIFT_DARK}`,
  "light-outline": `border border-white/50 text-white hover:border-accent hover:bg-white/10 focus-visible:border-accent focus-visible:bg-white/10 ${LIFT_DARK}`,
} as const;

type Props = {
  href: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  external?: boolean;
  id?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
};

export function Button({
  href,
  variant = "solid",
  size = "md",
  external = false,
  id,
  className,
  onClick,
  children,
}: Props) {
  return (
    <a
      id={id}
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className={cn(BASE, SIZES[size], VARIANTS[variant], className)}
    >
      {children}
    </a>
  );
}
