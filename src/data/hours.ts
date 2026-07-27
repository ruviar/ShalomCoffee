export type Interval = { from: string; to: string };

export type DaySchedule = {
  /** Indice de Date.getDay(): 0 domingo, 6 sabado. */
  day: number;
  name: string;
  schemaDay: string;
  intervals: Interval[];
};

/**
 * Horario verificado contra la ficha de Google Business.
 * Lunes y martes no abren por la tarde; el domingo abre a las 09:00.
 * Si cambia en Google, cambia aqui: esta es la unica fuente del sitio y
 * alimenta a la vez la tabla de Visitanos, el estado abierto/cerrado y el
 * JSON-LD de OpeningHoursSpecification.
 */
export const schedule: DaySchedule[] = [
  { day: 1, name: "Lunes", schemaDay: "Monday", intervals: [{ from: "08:30", to: "13:00" }] },
  { day: 2, name: "Martes", schemaDay: "Tuesday", intervals: [{ from: "08:30", to: "13:00" }] },
  {
    day: 3,
    name: "Miércoles",
    schemaDay: "Wednesday",
    intervals: [
      { from: "08:30", to: "13:00" },
      { from: "17:00", to: "20:00" },
    ],
  },
  {
    day: 4,
    name: "Jueves",
    schemaDay: "Thursday",
    intervals: [
      { from: "08:30", to: "13:00" },
      { from: "17:00", to: "20:00" },
    ],
  },
  {
    day: 5,
    name: "Viernes",
    schemaDay: "Friday",
    intervals: [
      { from: "08:30", to: "13:00" },
      { from: "17:00", to: "20:00" },
    ],
  },
  { day: 6, name: "Sábado", schemaDay: "Saturday", intervals: [{ from: "08:30", to: "13:00" }] },
  { day: 0, name: "Domingo", schemaDay: "Sunday", intervals: [{ from: "09:00", to: "13:00" }] },
];

/**
 * Vista agrupada para la interfaz. Siete filas identicas serian ruido:
 * se agrupan los dias que comparten horario.
 */
export const groupedSchedule = [
  { label: "Lunes y martes", days: [1, 2], intervals: schedule[0].intervals },
  { label: "Miércoles a viernes", days: [3, 4, 5], intervals: schedule[2].intervals },
  { label: "Sábado", days: [6], intervals: schedule[5].intervals },
  { label: "Domingo", days: [0], intervals: schedule[6].intervals },
];

const TZ = "Europe/Madrid";
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Hora local de Zaragoza, independiente de la zona horaria del visitante. */
function localNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    day: WEEKDAY_INDEX[get("weekday")] ?? 0,
    // Algunos motores devuelven "24" para medianoche.
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

export type OpenState =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensLabel: string }
  | { open: false; opensAt: null; opensLabel: null };

/**
 * Estado abierto/cerrado. Se calcula en cliente tras la hidratacion
 * para no servir HTML con una hora congelada en el cache.
 */
export function getOpenState(now: Date = new Date()): OpenState {
  const { day, minutes } = localNow(now);
  const today = schedule.find((d) => d.day === day);

  if (today) {
    for (const iv of today.intervals) {
      if (minutes >= toMinutes(iv.from) && minutes < toMinutes(iv.to)) {
        return { open: true, closesAt: iv.to };
      }
    }
    const later = today.intervals.find((iv) => minutes < toMinutes(iv.from));
    if (later) return { open: false, opensAt: later.from, opensLabel: "hoy" };
  }

  // Busca la siguiente apertura en los proximos siete dias.
  for (let offset = 1; offset <= 7; offset++) {
    const target = schedule.find((d) => d.day === (day + offset) % 7);
    if (target?.intervals.length) {
      return {
        open: false,
        opensAt: target.intervals[0].from,
        opensLabel: offset === 1 ? "mañana" : target.name.toLowerCase(),
      };
    }
  }

  return { open: false, opensAt: null, opensLabel: null };
}
