type ClassValue = string | false | null | undefined;

/** Une clases condicionales. No hay conflictos de utilidades que resolver en este proyecto. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
