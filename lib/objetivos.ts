// 1.4.0 · Varios objetivos, lugar por día y clases fijas (feedback de piloto). Reglas puras, sin base de datos.
import type { Ejercicio } from "./ejercicios";
import { DIAS_SEMANA, NOMBRES_LUGAR, type Clase, type Lugar, type Objetivo, type Perfil } from "./tipos";

// El principal (columna «objetivo») siempre va primero; si la lista no lo trae (dato viejo o editado aparte), manda el principal solo
export function objetivosDe(p: Pick<Perfil, "objetivo" | "objetivos">): Objetivo[] {
  const lista = p.objetivos?.length ? p.objetivos : [p.objetivo];
  return lista.includes(p.objetivo) ? [p.objetivo, ...lista.filter((o) => o !== p.objetivo)] : [p.objetivo];
}
const tiene = (p: Pick<Perfil, "objetivo" | "objetivos">, o: Objetivo) => objetivosDe(p).includes(o);

// Calorías: «bajar grasa» manda déficit; si no, músculo o fuerza piden superávit; solo resistencia = mantenimiento
export function objetivoNutricion(p: Pick<Perfil, "objetivo" | "objetivos">): Objetivo {
  if (tiene(p, "grasa")) return "grasa";
  if (tiene(p, "hipertrofia")) return "hipertrofia";
  if (tiene(p, "fuerza")) return "fuerza";
  return "resistencia";
}

// Series y repeticiones de cada ejercicio cuando eliges varios: el primero con series de fuerza, los demás compuestos
// y los aislados con series de músculo, y si no hay ni músculo ni fuerza, de resistencia o de bajar grasa
export function objetivoPara(ej: Pick<Ejercicio, "compuesto">, orden: number, p: Pick<Perfil, "objetivo" | "objetivos">): Objetivo {
  const lista = objetivosDe(p);
  if (lista.length === 1) return lista[0];
  // Con varios objetivos, solo el primer ejercicio va con series de fuerza (son largas): así cabe el resto en tu tiempo
  const principal = ej.compuesto && orden === 0;
  if (principal && tiene(p, "fuerza")) return "fuerza";
  if (tiene(p, "hipertrofia")) return "hipertrofia";
  if (tiene(p, "fuerza")) return "fuerza";
  if (tiene(p, "grasa")) return "grasa";
  return "resistencia";
}

// Minutos de cardio al final: bajar grasa pide más; resistencia, un poco
export function cardioDe(p: Pick<Perfil, "objetivo" | "objetivos" | "minutos_sesion">): number {
  if (tiene(p, "grasa")) return p.minutos_sesion >= 60 ? 20 : 12;
  if (tiene(p, "resistencia")) return 10;
  return 0;
}

// Lugares de más a menos equipo
export const RANGO_LUGAR: Record<Lugar, number> = { gimnasio: 2, casa_mancuernas: 1, casa_sin_equipo: 0 };
// La rutina se arma para el lugar con más equipo de tus días; los días con menos se adaptan solos
export function lugarBase(lugares: Lugar[], actual: Lugar): Lugar {
  return lugares.length ? lugares.reduce((a, b) => (RANGO_LUGAR[b] > RANGO_LUGAR[a] ? b : a)) : actual;
}
const diaDe = (fecha: string) => new Date(`${fecha}T12:00:00Z`).getUTCDay();
export function lugarDelDia(p: Pick<Perfil, "lugar" | "lugar_por_dia">, fecha: string): Lugar {
  return p.lugar_por_dia?.[diaDe(fecha)] ?? p.lugar;
}
export const clasesDelDia = (p: Pick<Perfil, "clases">, fecha: string): Clase[] =>
  (p.clases ?? []).filter((c) => c.dia === diaDe(fecha)).sort((a, b) => (a.hora ?? "99").localeCompare(b.hora ?? "99"));

// «Gimnasio (Lun, Mié) · Casa con pesas (Mar, Jue)»; si es un solo lugar, su nombre
export function resumenLugares(p: Pick<Perfil, "lugar" | "lugar_por_dia">): string {
  const porLugar = new Map<Lugar, number[]>();
  for (const [d, l] of Object.entries(p.lugar_por_dia ?? {})) if (l) porLugar.set(l, [...(porLugar.get(l) ?? []), Number(d)]);
  if (porLugar.size <= 1) return NOMBRES_LUGAR[[...porLugar.keys()][0] ?? p.lugar];
  const orden = (d: number) => (d + 6) % 7;
  return [...porLugar].map(([l, ds]) => `${NOMBRES_LUGAR[l].split(" (")[0]} (${ds.sort((a, b) => orden(a) - orden(b)).map((d) => DIAS_SEMANA[d]).join(", ")})`).join(" · ");
}
