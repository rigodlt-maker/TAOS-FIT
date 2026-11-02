// Qué día de la rutina toca y resumen de la semana
import type { Plan, Serie } from "./tipos";

export const hoyLocal = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());

export function sumarDias(fecha: string, n: number) {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Toca el día siguiente al último que entrenaste (si hoy ya entrenaste, sigue siendo el de hoy)
export function diaQueToca(plan: Plan, series: Serie[], hoy = hoyLocal()): { dia: number; yaHoy: boolean } {
  const delPlan = series.filter((s) => s.plan_id === plan.id || s.plan_id === null);
  if (!delPlan.length) return { dia: 0, yaHoy: false };
  const ultimaFecha = delPlan.reduce((m, s) => (s.fecha > m ? s.fecha : m), "");
  const ultimoDia = Math.max(...delPlan.filter((s) => s.fecha === ultimaFecha).map((s) => s.dia));
  if (ultimaFecha === hoy) return { dia: ultimoDia % plan.dias.length, yaHoy: true };
  return { dia: (ultimoDia + 1) % plan.dias.length, yaHoy: false };
}

// Días distintos que entrenaste en los últimos 7 días
export function entrenosSemana(series: Serie[], hoy = hoyLocal()): number {
  const desde = sumarDias(hoy, -6);
  return new Set(series.filter((s) => s.fecha >= desde && s.fecha <= hoy).map((s) => s.fecha)).size;
}

export function fechaBonita(fecha: string) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`)).replace(".", "");
}

export const descanso = (seg: number) => (seg >= 60 ? `${Math.floor(seg / 60)}${seg % 60 ? `:${String(seg % 60).padStart(2, "0")}` : ""} min` : `${seg} s`);

// Hora de ahora en México (0 a 23)
export function horaLocal(): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Mexico_City", hour: "numeric", hour12: false }).format(new Date())) % 24;
}

// Consejo según la hora a la que vas a entrenar (de noche cuida tu sueño; muy temprano, calienta más)
export function avisoPorHora(hora: number): string | null {
  if (hora >= 21 || hora < 5)
    return "🌙 Es tarde para entrenar fuerte. Si vas a entrenar, haz la versión ligera: 2 series por ejercicio, sin llegar al fallo y sin cardio intenso. O pásalo a mañana: dormir bien también es progreso.";
  if (hora < 7) return "☀️ Entreno temprano: calienta 2 o 3 minutos más de lo normal, el cuerpo todavía está frío.";
  return null;
}
