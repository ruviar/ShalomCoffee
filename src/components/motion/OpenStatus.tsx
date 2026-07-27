"use client";

import { useEffect, useState } from "react";
import { getOpenState, type OpenState } from "@/data/hours";
import { cn } from "@/lib/utils";

/**
 * Estado abierto/cerrado en tiempo real, contra la hora local de Zaragoza.
 *
 * Se calcula tras la hidratacion: el HTML estatico se cachea y serviria una
 * hora congelada. Hasta entonces se reserva el espacio con un esqueleto de la
 * misma forma que el resultado final, para no provocar salto de layout.
 *
 * El indicador es un punto lleno cuando esta abierto y un anillo vacio cuando
 * esta cerrado. La diferencia es de forma, no de color: la paleta es neutra y
 * el verde y el rojo de semaforo no existen en este sistema.
 */
export function OpenStatus({ className }: { className?: string }) {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    setState(getOpenState());
    // Se refresca cada minuto para que el estado no se quede obsoleto.
    const id = setInterval(() => setState(getOpenState()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!state) {
    return (
      <div className={cn("flex h-5 items-center gap-2.5", className)} aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-slate" />
        <span className="h-2 w-36 animate-pulse rounded-edge bg-slate" />
      </div>
    );
  }

  const label = state.open
    ? `Abierto ahora · cierra a las ${state.closesAt}`
    : state.opensAt
      ? `Cerrado · abre ${state.opensLabel} a las ${state.opensAt}`
      : "Cerrado ahora";

  return (
    <p
      role="status"
      className={cn(
        "flex h-5 items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.18em]",
        state.open ? "text-snow" : "text-ash",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          state.open ? "bg-snow" : "border border-cement"
        )}
      />
      <span className="tnum">{label}</span>
    </p>
  );
}
