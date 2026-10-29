// Progresión automática ("doble progresión"): primero subes repeticiones dentro del rango; cuando todas las series
// llegan al máximo, sube el peso. Si te quedas corto dos veces seguidas, baja un poco para recuperar la técnica.
import { ejercicioPorId } from "./ejercicios";
import type { EjercicioPlan, Serie } from "./tipos";

export type Sugerencia = { peso: number | null; meta: string; mensaje: string; tipo: "nuevo" | "subir" | "mantener" | "bajar" | "estancado" };

// Sesiones de un ejercicio, de la más reciente a la más vieja
export function sesionesDe(series: Serie[], ejercicio: string): Serie[][] {
  const porFecha = new Map<string, Serie[]>();
  for (const s of series.filter((x) => x.ejercicio === ejercicio)) porFecha.set(s.fecha, [...(porFecha.get(s.fecha) ?? []), s]);
  return [...porFecha.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([, lista]) => lista.sort((a, b) => a.serie - b.serie));
}

// Fuerza estimada de una serie (fórmula de Epley)
export const unaRM = (peso: number, reps: number) => (peso > 0 ? peso * (1 + reps / 30) : reps);
const mejor = (sesion: Serie[]) => Math.max(...sesion.map((s) => unaRM(s.peso_kg, s.reps)));

const redondear = (kg: number, paso: number) => Math.max(0, Math.round(kg / paso) * paso);

function incremento(ejercicio: string, peso: number): number {
  const ej = ejercicioPorId(ejercicio);
  const pierna = ej && ["sentadilla", "bisagra", "unilateral", "gluteo", "pantorrilla"].includes(ej.patron);
  if (ej?.equipo === "mancuernas" || ej?.equipo === "kettlebell") return 2;
  return pierna && peso >= 40 ? 5 : 2.5;
}

// "pausa": hasta qué fecha no se proponen aumentos de peso (si marcaste dolor o mareo)
export function sugerir(plan: EjercicioPlan, historial: Serie[], pausa: string | null = null, hoy = new Date().toISOString().slice(0, 10)): Sugerencia {
  const s = sugerirBase(plan, historial);
  if (pausa && pausa >= hoy && (s.tipo === "subir" || s.tipo === "nuevo")) {
    const ultima = sesionesDe(historial, plan.ejercicio)[0];
    const peso = ultima ? Math.max(...ultima.map((x) => x.peso_kg)) : s.peso;
    return { ...s, peso: peso || null, tipo: "mantener", mensaje: "Pausa de aumentos por la molestia que registraste: usa el mismo peso o menos. Si el dolor sigue, consulta a un médico." };
  }
  return s;
}

function sugerirBase(plan: EjercicioPlan, historial: Serie[]): Sugerencia {
  const unidad = plan.segundos ? "s" : " reps";
  const rango = `${plan.series} × ${plan.reps_min}–${plan.reps_max}${unidad}`;
  const sesiones = sesionesDe(historial, plan.ejercicio);
  if (!sesiones.length)
    return {
      peso: null,
      meta: rango,
      tipo: "nuevo",
      mensaje: plan.segundos
        ? `Primera vez: aguanta lo que puedas con buena técnica, entre ${plan.reps_min} y ${plan.reps_max} segundos.`
        : `Primera vez: elige un peso con el que llegues a ${plan.reps_max} repeticiones con buena técnica y te queden 1–2 en reserva.`,
    };
  const ultima = sesiones[0];
  const peso = Math.max(...ultima.map((s) => s.peso_kg));
  const conPeso = peso > 0;
  const completas = ultima.length >= plan.series && ultima.every((s) => s.reps >= plan.reps_max);
  const cortas = (ses: Serie[]) => ses.some((s) => s.reps < plan.reps_min);

  // Estancado: 3 sesiones seguidas sin superar tu mejor marca anterior
  if (sesiones.length >= 4) {
    const antes = Math.max(...sesiones.slice(3).map(mejor));
    if (sesiones.slice(0, 3).every((s) => mejor(s) <= antes))
      return {
        peso: conPeso ? redondear(peso * 0.9, incremento(plan.ejercicio, peso)) : null,
        meta: rango,
        tipo: "estancado",
        mensaje: "Llevas 3 sesiones sin mejorar. Baja un poco el peso esta vez; si sigue igual, cambia este ejercicio por otro parecido.",
      };
  }
  if (completas) {
    if (!conPeso || plan.segundos)
      return { peso: conPeso ? peso : null, meta: rango, tipo: "subir", mensaje: plan.segundos ? `¡Llegaste al máximo! Suma 5–10 segundos por serie.` : "¡Llegaste al máximo! Hazlo más difícil: baja más lento (3 s) o usa la variante más difícil." };
    const nuevo = peso + incremento(plan.ejercicio, peso);
    return { peso: nuevo, meta: rango, tipo: "subir", mensaje: `¡Completaste todas las series! Sube a ${nuevo} kg; empieza otra vez por ${plan.reps_min} repeticiones.` };
  }
  if (cortas(ultima) && sesiones[1] && cortas(sesiones[1]) && conPeso) {
    const nuevo = redondear(peso * 0.9, incremento(plan.ejercicio, peso));
    return { peso: nuevo, meta: rango, tipo: "bajar", mensaje: `Dos sesiones sin llegar a ${plan.reps_min} repeticiones: baja a ${nuevo} kg y cuida la técnica.` };
  }
  const total = ultima.reduce((s, x) => s + x.reps, 0);
  return {
    peso: conPeso ? peso : null,
    meta: rango,
    tipo: "mantener",
    mensaje: `Mismo peso${conPeso ? ` (${peso} kg)` : ""}: intenta sumar al menos 1 ${plan.segundos ? "segundo" : "repetición"} más que la vez pasada (${total} en total).`,
  };
}
