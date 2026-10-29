// Calorías y macros calculados en código (sin IA), con la fórmula y una explicación de cada número
import { edad } from "./composicion";
import type { Medida, Objetivo, Perfil } from "./tipos";

export type Objetivos = {
  tmb: number; // metabolismo en reposo
  factor: number; // actividad
  mantenimiento: number;
  kcal: number;
  proteina: number;
  grasa: number;
  carbos: number;
  explicaciones: { titulo: string; valor: string; formula: string; porque: string }[];
};

// Factor de actividad: días de pesas + qué tanto te mueves el resto del día
export function factorActividad(dias: number, actividad: Perfil["actividad"]): number {
  const base = dias <= 2 ? 1.375 : dias <= 4 ? 1.465 : 1.55;
  return Math.round((base + (actividad === "activa" ? 0.15 : actividad === "ligera" ? 0.05 : 0)) * 1000) / 1000;
}

const CAMBIO: Record<Objetivo, number> = { grasa: -0.18, hipertrofia: 0.08, fuerza: 0.06, resistencia: 0 };
const PROTEINA: Record<Objetivo, number> = { grasa: 2.2, hipertrofia: 2.0, fuerza: 2.0, resistencia: 1.8 };
const GRASA_KG = 0.9;

export function calcularObjetivos(p: Perfil, m: Pick<Medida, "peso_kg">, hoy?: string): Objetivos {
  const anios = edad(p.nacimiento, hoy);
  const masculino = p.cuerpo === "masculino";
  // Mifflin-St Jeor
  const tmb = Math.round(10 * m.peso_kg + 6.25 * p.altura_cm - 5 * anios + (masculino ? 5 : -161));
  const factor = factorActividad(p.dias_semana, p.actividad);
  const mantenimiento = Math.round(tmb * factor);
  const cambio = CAMBIO[p.objetivo];
  // Seguridad: nunca por debajo de tu metabolismo en reposo ni de 1,200 / 1,500 kcal
  const minimo = Math.max(tmb, masculino ? 1500 : 1200);
  const kcal = Math.max(minimo, Math.round((mantenimiento * (1 + cambio) + p.ajuste_kcal) / 10) * 10);
  // Con IMC alto, la proteína se calcula con un peso de referencia (IMC 27) para no exagerar
  const pesoRef = Math.min(m.peso_kg, 27 * (p.altura_cm / 100) ** 2);
  const proteina = Math.round(PROTEINA[p.objetivo] * pesoRef);
  const grasa = Math.round(GRASA_KG * pesoRef);
  const carbos = Math.max(0, Math.round((kcal - proteina * 4 - grasa * 9) / 4));
  const pct = Math.round(Math.abs(cambio) * 100);

  const explicaciones = [
    {
      titulo: "Metabolismo en reposo",
      valor: `${tmb.toLocaleString("es-MX")} kcal`,
      formula: `10 × ${m.peso_kg} kg + 6.25 × ${p.altura_cm} cm − 5 × ${anios} años ${masculino ? "+ 5" : "− 161"}`,
      porque: "Lo que gasta tu cuerpo sin moverte (fórmula Mifflin-St Jeor).",
    },
    {
      titulo: "Gasto del día",
      valor: `${mantenimiento.toLocaleString("es-MX")} kcal`,
      formula: `${tmb} × ${factor}`,
      porque: `Multiplicado por tu actividad: ${p.dias_semana} días de entreno y el resto del día ${p.actividad === "sedentaria" ? "casi sentado" : p.actividad === "ligera" ? "moviéndote un poco" : "activo"}.`,
    },
    {
      titulo: "Tu meta de calorías",
      valor: `${kcal.toLocaleString("es-MX")} kcal`,
      formula: cambio === 0 ? `${mantenimiento} (mantenimiento)${p.ajuste_kcal ? ` ${p.ajuste_kcal > 0 ? "+" : "−"} ${Math.abs(p.ajuste_kcal)} de ajustes` : ""}` : `${mantenimiento} ${cambio < 0 ? "−" : "+"} ${pct}%${p.ajuste_kcal ? ` ${p.ajuste_kcal > 0 ? "+" : "−"} ${Math.abs(p.ajuste_kcal)} de ajustes` : ""}`,
      porque:
        p.objetivo === "grasa"
          ? "Un déficit moderado (15–20%) baja grasa sin perder músculo ni energía."
          : p.objetivo === "resistencia"
            ? "Mantenimiento: comes lo que gastas para rendir y recuperarte."
            : `Un superávit pequeño (5–10%) da material para construir ${p.objetivo === "fuerza" ? "fuerza" : "músculo"} sin subir mucha grasa.`,
    },
    {
      titulo: "Proteína",
      valor: `${proteina} g`,
      formula: `${PROTEINA[p.objetivo]} g × ${Math.round(pesoRef)} kg`,
      porque: "Repara y construye músculo; también quita el hambre.",
    },
    {
      titulo: "Grasa",
      valor: `${grasa} g`,
      formula: `${GRASA_KG} g × ${Math.round(pesoRef)} kg`,
      porque: "Necesaria para tus hormonas; sale de aguacate, aceite, nueces, huevo.",
    },
    {
      titulo: "Carbohidratos",
      valor: `${carbos} g`,
      formula: `(${kcal} − ${proteina} × 4 − ${grasa} × 9) ÷ 4`,
      porque: "El resto de tus calorías: tu energía para entrenar.",
    },
  ];
  return { tmb, factor, mantenimiento, kcal, proteina, grasa, carbos, explicaciones };
}
