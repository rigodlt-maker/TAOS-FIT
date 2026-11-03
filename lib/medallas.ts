// Medallas de Tao Fit con niveles: Bronce → Plata → Oro → Platino → Ónix.
// Se calculan solas con lo que ya registras (series, medidas, registro semanal y perfil): no hay tabla nueva ni SQL.
// Para crear una medalla nueva, agrega un renglón a CATALOGO (con sus 5 metas, de menor a mayor).
import type { Medida, Perfil, Registro, Serie } from "./tipos";

export const NIVELES = ["bronce", "plata", "oro", "platino", "onix"] as const;
export type Nivel = (typeof NIVELES)[number];
export const NOMBRE_NIVEL: Record<Nivel, string> = { bronce: "Bronce", plata: "Plata", oro: "Oro", platino: "Platino", onix: "Ónix" };

export type DatosMedallas = {
  series: Pick<Serie, "fecha" | "ejercicio" | "peso_kg" | "reps">[];
  medidas: Pick<Medida, "fecha" | "peso_kg">[];
  registros: Pick<Registro, "fecha">[];
  perfil: Pick<Perfil, "dias_semana" | "meta_peso_kg"> | null;
  hoy: string;
};
type Stats = ReturnType<typeof estadisticas>;
// "icono" es el nombre de un ícono de components/insignia.tsx
export type Medalla = { id: string; nombre: string; que: string; unidad: string; icono: string; metas: [number, number, number, number, number]; porcentaje?: boolean; medir: (s: Stats) => number };
export type MedallaConAvance = Omit<Medalla, "medir"> & { actual: number; indice: number; nivel: Nivel | null; siguiente: number | null; siguienteNivel: Nivel | null };

const lunesDe = (fecha: string) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};
const restarSemanas = (lunes: string, n: number) => {
  const d = new Date(`${lunes}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7 * n);
  return d.toISOString().slice(0, 10);
};
const diasEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);

export function estadisticas(d: DatosMedallas) {
  const dias = [...new Set(d.series.map((s) => s.fecha))].sort();
  const porSemana = new Map<string, number>();
  for (const dia of dias) porSemana.set(lunesDe(dia), (porSemana.get(lunesDe(dia)) ?? 0) + 1);
  const meta = Math.max(1, d.perfil?.dias_semana ?? 3);
  const semanasCompletas = [...porSemana.values()].filter((n) => n >= meta).length;
  // Semanas seguidas entrenando; la semana actual cuenta si ya entrenaste, si no, cuenta desde la pasada
  let lunes = lunesDe(d.hoy);
  if (!porSemana.has(lunes)) lunes = restarSemanas(lunes, 1);
  let rachaSemanas = 0;
  while (porSemana.has(lunes)) {
    rachaSemanas++;
    lunes = restarSemanas(lunes, 1);
  }
  const toneladas = d.series.reduce((t, s) => t + s.peso_kg * s.reps, 0) / 1000;
  const repeticiones = d.series.reduce((t, s) => t + s.reps, 0);
  // Récords: cada vez que un ejercicio supera tu peso más alto anterior
  let records = 0;
  const maximo = new Map<string, number>();
  for (const s of [...d.series].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const antes = maximo.get(s.ejercicio);
    if (antes !== undefined && s.peso_kg > antes && s.peso_kg > 0) records++;
    if (antes === undefined || s.peso_kg > antes) maximo.set(s.ejercicio, s.peso_kg);
  }
  // Regresos: entrenaste después de 14 días o más sin entrenar
  const regresos = dias.filter((dia, i) => i > 0 && diasEntre(dias[i - 1], dia) >= 14).length;
  // Meta de peso: qué tanto del camino llevas (0 a 1)
  const inicio = d.medidas[0]?.peso_kg;
  const actual = d.medidas.at(-1)?.peso_kg;
  const objetivo = d.perfil?.meta_peso_kg ?? null;
  const avanceMeta = inicio !== undefined && actual !== undefined && objetivo !== null && inicio !== objetivo ? Math.max(0, Math.min(1, (inicio - actual) / (inicio - objetivo))) : 0;
  return {
    entrenos: dias.length,
    semanasCompletas,
    rachaSemanas,
    toneladas,
    repeticiones,
    series: d.series.length,
    ejercicios: maximo.size,
    records,
    regresos,
    medidas: d.medidas.length,
    registros: d.registros.length,
    avanceMeta,
  };
}

// El catálogo. Cada medalla tiene 5 metas: Bronce, Plata, Oro, Platino y Ónix.
export const CATALOGO: Medalla[] = [
  { id: "constancia", nombre: "Constancia", que: "Días que entrenaste", unidad: "entrenamientos", icono: "pesa", metas: [5, 25, 100, 250, 500], medir: (s) => s.entrenos },
  { id: "racha", nombre: "En racha", que: "Semanas seguidas entrenando", unidad: "semanas seguidas", icono: "fuego", metas: [2, 4, 12, 26, 52], medir: (s) => s.rachaSemanas },
  { id: "plan", nombre: "Semana perfecta", que: "Semanas en que cumpliste todos los días de tu plan", unidad: "semanas completas", icono: "calendario", metas: [1, 4, 12, 26, 52], medir: (s) => s.semanasCompletas },
  { id: "fuerza", nombre: "Más fuerte", que: "Veces que superaste tu peso más alto en un ejercicio", unidad: "récords", icono: "sube", metas: [1, 10, 50, 150, 300], medir: (s) => s.records },
  { id: "toneladas", nombre: "Toneladas", que: "Peso total levantado (peso × repeticiones)", unidad: "toneladas", icono: "pesas", metas: [1, 10, 50, 200, 500], medir: (s) => s.toneladas },
  { id: "series", nombre: "Trabajador", que: "Series completadas", unidad: "series", icono: "capas", metas: [50, 250, 1000, 2500, 5000], medir: (s) => s.series },
  { id: "repeticiones", nombre: "Repeticiones", que: "Repeticiones en total", unidad: "repeticiones", icono: "ciclo", metas: [500, 2500, 10000, 25000, 50000], medir: (s) => s.repeticiones },
  { id: "explorador", nombre: "Explorador", que: "Ejercicios distintos que has hecho", unidad: "ejercicios", icono: "brujula", metas: [5, 10, 20, 35, 50], medir: (s) => s.ejercicios },
  { id: "registro", nombre: "Disciplina", que: "Registros semanales", unidad: "registros", icono: "lista", metas: [1, 4, 12, 26, 52], medir: (s) => s.registros },
  { id: "medidas", nombre: "Bajo la lupa", que: "Veces que registraste tus medidas", unidad: "medidas", icono: "regla", metas: [1, 4, 12, 26, 52], medir: (s) => s.medidas },
  { id: "meta", nombre: "Mi meta", que: "Qué tanto del camino a tu meta de peso llevas", unidad: "del camino", icono: "diana", metas: [0.1, 0.25, 0.5, 0.75, 1], porcentaje: true, medir: (s) => s.avanceMeta },
  { id: "regreso", nombre: "Volviste", que: "Veces que regresaste a entrenar después de 2 semanas sin hacerlo", unidad: "regresos", icono: "amanecer", metas: [1, 2, 3, 5, 10], medir: (s) => s.regresos },
];

export function medallas(d: DatosMedallas): MedallaConAvance[] {
  const s = estadisticas(d);
  return CATALOGO.map(({ medir, ...m }) => {
    const actual = Math.round(medir(s) * 100) / 100;
    const indice = m.metas.filter((meta) => actual >= meta).length - 1;
    const sig = indice + 1 < NIVELES.length ? indice + 1 : null;
    return { ...m, actual, indice, nivel: indice >= 0 ? NIVELES[indice] : null, siguiente: sig === null ? null : m.metas[sig], siguienteNivel: sig === null ? null : NIVELES[sig] };
  });
}

// Lo que se festeja: cada nivel nuevo de cada medalla ("constancia:oro")
export const logros = (lista: MedallaConAvance[]) => lista.flatMap((m) => NIVELES.slice(0, m.indice + 1).map((n) => ({ id: `${m.id}:${n}`, medalla: m.id, nombre: m.nombre, icono: m.icono, nivel: n })));

export const formatoValor = (m: Pick<Medalla, "porcentaje">, n: number) => (m.porcentaje ? `${Math.round(n * 100)}%` : Number.isInteger(n) ? n.toLocaleString("es-MX") : n.toFixed(1));
