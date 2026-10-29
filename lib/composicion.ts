// Composición corporal a partir de medidas con cinta (sin básculas especiales)
import type { Cuerpo, Medida, Perfil } from "./tipos";

export function edad(nacimiento: string, hoy = new Date().toISOString().slice(0, 10)): number {
  const [a, m, d] = nacimiento.split("-").map(Number);
  const [ha, hm, hd] = hoy.split("-").map(Number);
  return ha - a - (hm < m || (hm === m && hd < d) ? 1 : 0);
}

export const imc = (peso: number, alturaCm: number) => peso / (alturaCm / 100) ** 2;

// % de grasa: fórmula de la Marina de EE. UU. si hay cintura y cuello (y cadera en mujeres); si no, una estimación por IMC
export function grasaCorporal(g: Cuerpo, alturaCm: number, m: Pick<Medida, "peso_kg" | "cintura_cm" | "cuello_cm" | "cadera_cm">, anios: number): { valor: number; metodo: "medidas" | "estimado" } {
  const { cintura_cm: cin, cuello_cm: cue, cadera_cm: cad } = m;
  if (cin && cue && (g === "masculino" ? cin > cue : cad && cin + cad > cue)) {
    const v =
      g === "masculino"
        ? 495 / (1.0324 - 0.19077 * Math.log10(cin - cue) + 0.15456 * Math.log10(alturaCm)) - 450
        : 495 / (1.29579 - 0.35004 * Math.log10(cin + cad! - cue) + 0.221 * Math.log10(alturaCm)) - 450;
    return { valor: Math.min(60, Math.max(3, v)), metodo: "medidas" };
  }
  const v = 1.2 * imc(m.peso_kg, alturaCm) + 0.23 * anios - 10.8 * (g === "masculino" ? 1 : 0) - 5.4;
  return { valor: Math.min(60, Math.max(3, v)), metodo: "estimado" };
}

export type Composicion = { imc: number; grasa: number; metodoGrasa: "medidas" | "estimado"; magraKg: number; grasaKg: number; ffmi: number };

export function composicion(p: Pick<Perfil, "cuerpo" | "altura_cm" | "nacimiento">, m: Medida): Composicion {
  const g = grasaCorporal(p.cuerpo, p.altura_cm, m, edad(p.nacimiento));
  const grasaKg = (m.peso_kg * g.valor) / 100;
  const magraKg = m.peso_kg - grasaKg;
  return { imc: imc(m.peso_kg, p.altura_cm), grasa: g.valor, metodoGrasa: g.metodo, magraKg, grasaKg, ffmi: magraKg / (p.altura_cm / 100) ** 2 };
}

// Rangos orientativos para mostrar en palabras (no son diagnóstico)
export function nivelGrasa(g: Cuerpo, grasa: number): string {
  const [atleta, fitness, promedio] = g === "masculino" ? [14, 18, 25] : [21, 25, 32];
  if (grasa < atleta) return "Atlético";
  if (grasa < fitness) return "En forma";
  if (grasa < promedio) return "Promedio";
  return "Alto";
}
