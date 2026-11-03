// Precios aproximados en México (MXN por kilo o litro, súper o mercado, 2026) para el "Menú económico" y el costo de la semana.
// Lo cocido (arroz, frijoles, lentejas, pasta) va con precio del kilo ya cocido: crudo rinde unas 2.5 veces.
// Son referencias para comparar y planear, no precios exactos: cambian por ciudad y temporada.
import { ALIMENTOS, type Alimento } from "./alimentos";
import type { Menu } from "./menu";

export const PRECIO_KG: Record<string, number> = {
  pollo: 140, muslo_pollo: 110, bistec: 220, molida: 180, lomo_cerdo: 150, pescado: 140, salmon: 450, camaron: 320,
  atun: 200, sardina: 90, huevo: 50, claras: 90, jamon_pavo: 180, panela: 150, cottage: 140, yogurt_griego: 110,
  whey: 600, tofu: 120, lentejas: 18, garbanzo: 22,
  tortilla: 26, tortilla_harina: 60, tostada: 70, pan_integral: 90, bolillo: 50, avena: 45, arroz: 12, arroz_integral: 18,
  pasta: 20, papa: 30, camote: 35, elote: 40, quinoa: 70, frijoles: 16, galletas_arroz: 200,
  platano: 25, manzana: 50, papaya: 30, melon: 30, naranja: 25, fresas: 80, mango: 40, pina: 30, guayaba: 40, sandia: 20,
  nopales: 25, calabacita: 30, brocoli: 50, espinaca: 60, ensalada: 40, zanahoria: 20, chayote: 25, ejotes: 45,
  champinones: 90, pimiento: 70, coliflor: 40, verduras_mixtas: 70,
  aguacate: 70, aceite_oliva: 250, crema_cacahuate: 140, almendras: 300, nueces: 350, cacahuates: 120,
};

const mediana = (xs: number[]) => {
  const o = [...xs].sort((a, b) => a - b);
  return o.length ? o[Math.floor(o.length / 2)] : 0;
};

// Precio de lo que te da cada alimento: proteína en las proteínas, calorías en lo demás (así el huevo "rinde" más que el salmón)
const costoUtil = (al: Alimento) => {
  const precio = PRECIO_KG[al.id];
  if (!precio) return null;
  const util = al.grupo === "proteina" ? al.p : al.kcal;
  return util > 0 ? precio / util : null;
};
const MEDIANA_GRUPO = new Map(
  [...new Set(ALIMENTOS.map((a) => a.grupo))].map((g) => [g, mediana(ALIMENTOS.filter((a) => a.grupo === g).map(costoUtil).filter((x): x is number => x !== null))]),
);

// Cuánto más (o menos) sale un alimento en el menú económico: lo barato de su grupo hasta 6 veces más; lo caro casi nunca
export function factorEconomico(al: Alimento): number {
  const c = costoUtil(al);
  const m = MEDIANA_GRUPO.get(al.grupo);
  if (c === null || !m) return 1;
  return Math.min(6, Math.max(0.05, (m / c) ** 2.5));
}

// Costo aproximado de la semana (todo lo del menú)
export function costoSemana(menu: Menu): number {
  let total = 0;
  for (const d of menu.dias) for (const c of d.comidas) for (const it of c.items) total += ((PRECIO_KG[it.alimento] ?? 0) * it.gramos) / 1000;
  return Math.round(total / 10) * 10;
}
