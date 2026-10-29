// Reglas del registro semanal (en código, sin IA). Cada ajuste se guarda con el dato que lo motivó.
import { ejercicioPorId } from "./ejercicios";
import { sumarDias } from "./entreno";
import { sugerir } from "./progresion";
import { alternativas } from "./rutina";
import type { Perfil, Plan, Registro, Serie, TipoAjuste } from "./tipos";

export type NuevoAjuste = { tipo: TipoAjuste; detalle: string; motivo: string };
export type Evaluacion = {
  ajustes: NuevoAjuste[];
  perfil: Partial<Perfil>; // cambios al perfil (calorías, volumen, pausa)
  cambios: { ejercicio: string; nuevo: string }[]; // ejercicios del plan que se cambian
  consejos: string[]; // recomendaciones que no cambian el plan
};

// Palabras que indican un problema de salud: se pausa el aumento de cargas y se recomienda ir al médico
export const ALERTA_SALUD = /dolor (agudo|fuerte|intenso|punzante)|mareo|mare[ée]|desmay|v[oó]mit|me lastim|lesi[oó]n|me lesion|dolor (de|en el) pecho|falta de aire|taquicardia|condici[oó]n m[eé]dica|presi[oó]n (alta|baja)/i;

const pct = (a: number, b: number) => ((a - b) / b) * 100;
const f1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("es-MX");

export function evaluarSemana(p: Perfil, registros: Registro[], plan: Plan | null, series: Serie[], hoy: string): Evaluacion {
  const r: Evaluacion = { ajustes: [], perfil: {}, cambios: [], consejos: [] };
  const lista = [...registros].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const [w0, w1, w2] = [lista.at(-1), lista.at(-2), lista.at(-3)];
  if (!w0) return r;

  // 1) Salud primero
  if (w0.notas && ALERTA_SALUD.test(w0.notas)) {
    r.perfil.pausa_hasta = sumarDias(hoy, 7);
    r.ajustes.push({ tipo: "salud", detalle: "Pausa de aumentos de peso por 7 días", motivo: `Escribiste: "${w0.notas.slice(0, 120)}"` });
    r.consejos.push("⚠️ Por lo que escribiste, consulta a un médico antes de seguir subiendo cargas. Entrena ligero o descansa.");
  }

  // 2) Calorías: solo con 3 semanas de datos y buena adherencia
  if (w1 && w2) {
    const c1 = pct(w0.peso_kg, w1.peso_kg);
    const c2 = pct(w1.peso_kg, w2.peso_kg);
    const ultimas4 = lista.slice(-5);
    const tendencia = ultimas4.length >= 2 ? pct(ultimas4.at(-1)!.peso_kg, ultimas4[0].peso_kg) / (ultimas4.length - 1) : c1;
    const datos = `Peso promedio ${f1(w2.peso_kg)} → ${f1(w1.peso_kg)} → ${f1(w0.peso_kg)} kg (tendencia ${tendencia >= 0 ? "+" : ""}${f1(tendencia)}%/semana) con ${w1.adherencia}% y ${w0.adherencia}% de cumplimiento`;
    const cumple = w0.adherencia >= 80 && w1.adherencia >= 80;
    const quieto = (c: number) => (p.objetivo === "grasa" ? c > -0.25 : c < 0.1);
    if (p.objetivo === "grasa" || p.objetivo === "hipertrofia" || p.objetivo === "fuerza") {
      const sube = p.objetivo !== "grasa";
      if (quieto(c1) && quieto(c2)) {
        if (cumple) {
          const cambio = sube ? 150 : -150;
          r.perfil.ajuste_kcal = p.ajuste_kcal + cambio;
          r.ajustes.push({ tipo: "calorias", detalle: `${cambio > 0 ? "+" : "−"}150 kcal al día`, motivo: `${datos}: el peso no se movió en 2 semanas.` });
        } else r.consejos.push(`Tu peso no se movió, pero cumpliste menos del 80% del menú. Antes de cambiar calorías, intenta cumplirlo una semana más.`);
      } else if (!sube && c1 < -1 && c2 < -1) {
        r.perfil.ajuste_kcal = p.ajuste_kcal + 100;
        r.ajustes.push({ tipo: "calorias", detalle: "+100 kcal al día", motivo: `${datos}: bajas más de 1% por semana; más rápido arriesga músculo.` });
      } else if (sube && c1 > 0.5 && c2 > 0.5) {
        r.perfil.ajuste_kcal = p.ajuste_kcal - 100;
        r.ajustes.push({ tipo: "calorias", detalle: "−100 kcal al día", motivo: `${datos}: subes más de 0.5% por semana; sería más grasa que músculo.` });
      }
    } else if (Math.abs(c1) > 1 && Math.abs(c2) > 1 && Math.sign(c1) === Math.sign(c2)) {
      const cambio = c1 > 0 ? -100 : 100;
      r.perfil.ajuste_kcal = p.ajuste_kcal + cambio;
      r.ajustes.push({ tipo: "calorias", detalle: `${cambio > 0 ? "+" : "−"}100 kcal al día`, motivo: `${datos}: para resistencia buscamos mantener tu peso.` });
    }
  } else r.consejos.push(`Con ${3 - lista.length} ${3 - lista.length === 1 ? "registro" : "registros"} más podré ajustar tus calorías según tu tendencia.`);

  // 3) Cansancio: menos volumen; cuando te recuperas, regresa a lo normal
  if (w0.energia < 5 || w0.sueno < 5) {
    if (p.volumen >= 1) {
      r.perfil.volumen = 0.8;
      r.ajustes.push({ tipo: "volumen", detalle: "20% menos series esta semana", motivo: `Energía ${w0.energia}/10 y sueño ${w0.sueno}/10: necesitas recuperarte.` });
    }
    r.consejos.push("Prioriza dormir 7–9 horas; ahí es donde se construye el músculo.");
  } else if (p.volumen < 1 && w0.energia >= 6 && w0.sueno >= 6) {
    r.perfil.volumen = 1;
    r.ajustes.push({ tipo: "volumen", detalle: "Series completas otra vez", motivo: `Energía ${w0.energia}/10 y sueño ${w0.sueno}/10: ya te recuperaste.` });
  }
  if (w0.hambre >= 8 && p.objetivo === "grasa") r.consejos.push("Mucha hambre: más verdura, proteína en cada comida y agua. Si sigue igual 2 semanas, subiremos un poco las calorías.");

  // 4) Ejercicios estancados 3 sesiones: se cambian por otro del mismo movimiento
  if (plan) {
    const enPlan = plan.dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicio));
    for (const d of plan.dias)
      for (const e of d.ejercicios) {
        if (r.cambios.some((c) => c.ejercicio === e.ejercicio)) continue;
        if (sugerir(e, series).tipo !== "estancado") continue;
        const nuevo = alternativas(e.ejercicio, p, [...enPlan, ...r.cambios.map((c) => c.nuevo)])[0];
        if (!nuevo) continue;
        r.cambios.push({ ejercicio: e.ejercicio, nuevo: nuevo.id });
        r.ajustes.push({
          tipo: "ejercicio",
          detalle: `${ejercicioPorId(e.ejercicio)?.nombre} → ${nuevo.nombre}`,
          motivo: "3 sesiones sin mejorar peso ni repeticiones: un estímulo nuevo destraba el progreso.",
        });
      }
  }
  if (!r.ajustes.length && !r.consejos.length) r.consejos.push("Todo va en camino: sigue igual esta semana. 💪");
  return r;
}

// Aplica los cambios de ejercicio a un plan (nueva versión)
export function planConCambios(plan: Plan, cambios: Evaluacion["cambios"]) {
  return plan.dias.map((d) => ({ ...d, ejercicios: d.ejercicios.map((e) => ({ ...e, ejercicio: cambios.find((c) => c.ejercicio === e.ejercicio)?.nuevo ?? e.ejercicio })) }));
}
