// Alimentos comunes en México con sus macros por cada 100 g (o 100 ml). Valores aproximados de tablas
// nutricionales públicas; sirven para planear, no son etiquetas exactas.

export type Grupo = "proteina" | "carbo" | "fruta" | "verdura" | "grasa";
export type TipoComida = "desayuno" | "colacion" | "comida" | "cena";
export type Seccion = "Frutas y verduras" | "Carnes y pescados" | "Lácteos y huevo" | "Tortillas y pan" | "Abarrotes" | "Congelados";
export type Etiqueta = "res" | "cerdo" | "pollo" | "pescado" | "mariscos" | "huevo" | "lacteos" | "gluten";

export type Alimento = {
  id: string;
  nombre: string;
  grupo: Grupo;
  seccion: Seccion;
  kcal: number;
  p: number; // proteína (g)
  g: number; // grasa (g)
  c: number; // carbohidratos (g)
  comidas: TipoComida[];
  etiquetas?: Etiqueta[];
  pieza?: { nombre: string; g: number }; // para mostrar "2 tortillas" en vez de gramos
  min?: number; // gramos mínimos y máximos por comida
  max?: number;
};

const D: TipoComida[] = ["desayuno"];
const DC: TipoComida[] = ["desayuno", "colacion"];
const CC: TipoComida[] = ["comida", "cena"];
const DCC: TipoComida[] = ["desayuno", "comida", "cena"];
const TODAS: TipoComida[] = ["desayuno", "colacion", "comida", "cena"];

const a = (id: string, nombre: string, grupo: Grupo, seccion: Seccion, [kcal, p, g, c]: [number, number, number, number], comidas: TipoComida[], extra: Partial<Alimento> = {}): Alimento => ({
  id,
  nombre,
  grupo,
  seccion,
  kcal,
  p,
  g,
  c,
  comidas,
  ...extra,
});

export const ALIMENTOS: Alimento[] = [
  // ---------- Proteínas ----------
  a("pollo", "Pechuga de pollo", "proteina", "Carnes y pescados", [165, 31, 3.6, 0], CC, { etiquetas: ["pollo"], min: 90, max: 260 }),
  a("muslo_pollo", "Muslo de pollo sin piel", "proteina", "Carnes y pescados", [209, 26, 11, 0], CC, { etiquetas: ["pollo"], min: 90, max: 220 }),
  a("bistec", "Bistec de res", "proteina", "Carnes y pescados", [200, 29, 9, 0], CC, { etiquetas: ["res"], min: 90, max: 240 }),
  a("molida", "Carne molida de res 90/10", "proteina", "Carnes y pescados", [217, 26, 12, 0], CC, { etiquetas: ["res"], min: 90, max: 220 }),
  a("lomo_cerdo", "Lomo de cerdo", "proteina", "Carnes y pescados", [196, 29, 8, 0], CC, { etiquetas: ["cerdo"], min: 90, max: 240 }),
  a("pescado", "Filete de pescado (tilapia)", "proteina", "Carnes y pescados", [128, 26, 2.7, 0], CC, { etiquetas: ["pescado"], min: 100, max: 280 }),
  a("salmon", "Salmón", "proteina", "Carnes y pescados", [206, 22, 13, 0], CC, { etiquetas: ["pescado"], min: 90, max: 220 }),
  a("camaron", "Camarón", "proteina", "Carnes y pescados", [99, 24, 0.3, 0.2], CC, { etiquetas: ["mariscos"], min: 100, max: 280 }),
  a("atun", "Atún en agua (lata)", "proteina", "Abarrotes", [116, 26, 1, 0], ["colacion", "comida", "cena"], { etiquetas: ["pescado"], pieza: { nombre: "lata", g: 140 }, min: 70, max: 280 }),
  a("sardina", "Sardinas en tomate (lata)", "proteina", "Abarrotes", [186, 20, 11, 1], CC, { etiquetas: ["pescado"], min: 80, max: 200 }),
  a("huevo", "Huevo", "proteina", "Lácteos y huevo", [143, 12.6, 9.5, 0.7], DCC, { etiquetas: ["huevo"], pieza: { nombre: "huevo", g: 50 }, min: 50, max: 200 }),
  a("claras", "Claras de huevo", "proteina", "Lácteos y huevo", [52, 11, 0.2, 0.7], D, { etiquetas: ["huevo"], min: 60, max: 300 }),
  a("jamon_pavo", "Jamón de pavo", "proteina", "Lácteos y huevo", [104, 17, 3, 3], DC, { pieza: { nombre: "rebanada", g: 20 }, min: 40, max: 120 }),
  a("panela", "Queso panela", "proteina", "Lácteos y huevo", [250, 18, 18, 3], DCC, { etiquetas: ["lacteos"], min: 40, max: 120 }),
  a("cottage", "Queso cottage", "proteina", "Lácteos y huevo", [98, 11, 4.3, 3.4], DC, { etiquetas: ["lacteos"], min: 100, max: 300 }),
  a("yogurt_griego", "Yogurt griego natural", "proteina", "Lácteos y huevo", [59, 10, 0.4, 3.6], DC, { etiquetas: ["lacteos"], min: 120, max: 350 }),
  a("whey", "Proteína en polvo", "proteina", "Abarrotes", [400, 80, 6, 8], DC, { etiquetas: ["lacteos"], pieza: { nombre: "scoop", g: 30 }, min: 30, max: 60 }),
  a("tofu", "Tofu firme", "proteina", "Lácteos y huevo", [144, 17, 9, 3], DCC, { min: 100, max: 300 }),
  a("lentejas", "Lentejas cocidas", "proteina", "Abarrotes", [116, 9, 0.4, 20], CC, { min: 150, max: 400 }),
  a("garbanzo", "Garbanzos cocidos", "proteina", "Abarrotes", [164, 8.9, 2.6, 27], CC, { min: 120, max: 300 }),

  // ---------- Carbohidratos ----------
  a("tortilla", "Tortilla de maíz", "carbo", "Tortillas y pan", [218, 5.7, 2.9, 44.6], DCC, { pieza: { nombre: "tortilla", g: 30 }, min: 30, max: 180 }),
  a("tortilla_harina", "Tortilla de harina", "carbo", "Tortillas y pan", [304, 8, 8, 50], DCC, { etiquetas: ["gluten"], pieza: { nombre: "tortilla", g: 40 }, min: 40, max: 160 }),
  a("tostada", "Tostada horneada", "carbo", "Tortillas y pan", [380, 9, 5, 74], ["cena", "comida"], { pieza: { nombre: "tostada", g: 12 }, min: 24, max: 72 }),
  a("pan_integral", "Pan integral", "carbo", "Tortillas y pan", [247, 13, 3.4, 41], DCC, { etiquetas: ["gluten"], pieza: { nombre: "rebanada", g: 30 }, min: 30, max: 150 }),
  a("bolillo", "Bolillo", "carbo", "Tortillas y pan", [270, 9, 2, 55], ["desayuno", "cena"], { etiquetas: ["gluten"], pieza: { nombre: "bolillo", g: 60 }, min: 60, max: 120 }),
  a("avena", "Avena en hojuelas", "carbo", "Abarrotes", [389, 16.9, 6.9, 66], D, { min: 30, max: 120 }),
  a("arroz", "Arroz blanco cocido", "carbo", "Abarrotes", [130, 2.7, 0.3, 28], CC, { min: 60, max: 400 }),
  a("arroz_integral", "Arroz integral cocido", "carbo", "Abarrotes", [123, 2.7, 1, 25.6], CC, { min: 60, max: 400 }),
  a("pasta", "Pasta cocida", "carbo", "Abarrotes", [158, 5.8, 0.9, 31], CC, { etiquetas: ["gluten"], min: 80, max: 350 }),
  a("papa", "Papa cocida", "carbo", "Frutas y verduras", [87, 1.9, 0.1, 20], CC, { min: 100, max: 500 }),
  a("camote", "Camote cocido", "carbo", "Frutas y verduras", [90, 2, 0.2, 20.7], ["desayuno", "comida", "cena"], { min: 100, max: 450 }),
  a("elote", "Elote desgranado", "carbo", "Frutas y verduras", [96, 3.4, 1.5, 21], CC, { min: 80, max: 350 }),
  a("quinoa", "Quinoa cocida", "carbo", "Abarrotes", [120, 4.4, 1.9, 21.3], CC, { min: 80, max: 380 }),
  a("frijoles", "Frijoles cocidos", "carbo", "Abarrotes", [132, 8.9, 0.5, 23.7], DCC, { min: 60, max: 300 }),
  a("galletas_arroz", "Galletas de arroz", "carbo", "Abarrotes", [387, 8, 2.8, 81], ["colacion"], { pieza: { nombre: "galleta", g: 9 }, min: 9, max: 45 }),

  // ---------- Frutas ----------
  a("platano", "Plátano", "fruta", "Frutas y verduras", [89, 1.1, 0.3, 22.8], DC, { pieza: { nombre: "plátano", g: 120 }, min: 60, max: 240 }),
  a("manzana", "Manzana", "fruta", "Frutas y verduras", [52, 0.3, 0.2, 13.8], DC, { pieza: { nombre: "manzana", g: 180 }, min: 90, max: 360 }),
  a("papaya", "Papaya", "fruta", "Frutas y verduras", [43, 0.5, 0.3, 10.8], DC, { min: 100, max: 400 }),
  a("melon", "Melón", "fruta", "Frutas y verduras", [34, 0.8, 0.2, 8.2], DC, { min: 100, max: 400 }),
  a("naranja", "Naranja", "fruta", "Frutas y verduras", [47, 0.9, 0.1, 11.8], DC, { pieza: { nombre: "naranja", g: 150 }, min: 150, max: 300 }),
  a("fresas", "Fresas", "fruta", "Frutas y verduras", [32, 0.7, 0.3, 7.7], DC, { min: 100, max: 400 }),
  a("mango", "Mango", "fruta", "Frutas y verduras", [60, 0.8, 0.4, 15], DC, { min: 100, max: 300 }),
  a("pina", "Piña", "fruta", "Frutas y verduras", [50, 0.5, 0.1, 13], DC, { min: 100, max: 350 }),
  a("guayaba", "Guayaba", "fruta", "Frutas y verduras", [68, 2.6, 1, 14.3], DC, { pieza: { nombre: "guayaba", g: 55 }, min: 55, max: 220 }),
  a("sandia", "Sandía", "fruta", "Frutas y verduras", [30, 0.6, 0.2, 7.6], DC, { min: 150, max: 450 }),

  // ---------- Verduras ----------
  a("nopales", "Nopales", "verdura", "Frutas y verduras", [16, 1.3, 0.1, 3.3], DCC, { min: 80, max: 250 }),
  a("calabacita", "Calabacita", "verdura", "Frutas y verduras", [17, 1.2, 0.3, 3.1], CC, { min: 80, max: 250 }),
  a("brocoli", "Brócoli", "verdura", "Frutas y verduras", [35, 2.4, 0.4, 7.2], CC, { min: 80, max: 250 }),
  a("espinaca", "Espinaca", "verdura", "Frutas y verduras", [23, 2.9, 0.4, 3.6], DCC, { min: 50, max: 200 }),
  a("ensalada", "Lechuga, jitomate y pepino", "verdura", "Frutas y verduras", [16, 0.9, 0.2, 3.3], CC, { min: 100, max: 300 }),
  a("zanahoria", "Zanahoria", "verdura", "Frutas y verduras", [41, 0.9, 0.2, 9.6], CC, { min: 60, max: 200 }),
  a("chayote", "Chayote", "verdura", "Frutas y verduras", [19, 0.8, 0.1, 4.5], CC, { min: 80, max: 250 }),
  a("ejotes", "Ejotes", "verdura", "Frutas y verduras", [31, 1.8, 0.2, 7], CC, { min: 80, max: 250 }),
  a("champinones", "Champiñones", "verdura", "Frutas y verduras", [22, 3.1, 0.3, 3.3], DCC, { min: 60, max: 200 }),
  a("pimiento", "Pimiento morrón", "verdura", "Frutas y verduras", [31, 1, 0.3, 6], DCC, { min: 50, max: 200 }),
  a("coliflor", "Coliflor", "verdura", "Frutas y verduras", [25, 1.9, 0.3, 5], CC, { min: 80, max: 250 }),
  a("verduras_mixtas", "Verduras mixtas congeladas", "verdura", "Congelados", [65, 3, 0.5, 13], CC, { min: 80, max: 250 }),

  // ---------- Grasas ----------
  a("aguacate", "Aguacate", "grasa", "Frutas y verduras", [160, 2, 14.7, 8.5], DCC, { min: 20, max: 100 }),
  a("aceite_oliva", "Aceite de oliva", "grasa", "Abarrotes", [884, 0, 100, 0], CC, { pieza: { nombre: "cucharadita", g: 5 }, min: 5, max: 20 }),
  a("crema_cacahuate", "Crema de cacahuate", "grasa", "Abarrotes", [588, 25, 50, 20], DC, { pieza: { nombre: "cucharada", g: 16 }, min: 8, max: 32 }),
  a("almendras", "Almendras", "grasa", "Abarrotes", [579, 21, 50, 21.6], DC, { min: 10, max: 40 }),
  a("nueces", "Nueces", "grasa", "Abarrotes", [654, 15, 65, 14], DC, { min: 10, max: 35 }),
  a("cacahuates", "Cacahuates naturales", "grasa", "Abarrotes", [567, 26, 49, 16], ["colacion"], { min: 10, max: 40 }),
];

export const alimentoPorId = (id: string) => ALIMENTOS.find((x) => x.id === id);

// Grupos que puedes excluir de un toque
export const EXCLUSIONES: { id: string; nombre: string; etiquetas: Etiqueta[]; ids?: string[] }[] = [
  { id: "vegetariano", nombre: "Soy vegetariano", etiquetas: ["res", "cerdo", "pollo", "pescado", "mariscos"], ids: ["jamon_pavo"] },
  { id: "vegano", nombre: "Soy vegano", etiquetas: ["res", "cerdo", "pollo", "pescado", "mariscos", "huevo", "lacteos"], ids: ["jamon_pavo"] },
  { id: "res", nombre: "Sin res", etiquetas: ["res"] },
  { id: "cerdo", nombre: "Sin cerdo", etiquetas: ["cerdo"] },
  { id: "pescado", nombre: "Sin pescado ni mariscos", etiquetas: ["pescado", "mariscos"] },
  { id: "lacteos", nombre: "Sin lácteos", etiquetas: ["lacteos"] },
  { id: "huevo", nombre: "Sin huevo", etiquetas: ["huevo"] },
  { id: "gluten", nombre: "Sin gluten", etiquetas: ["gluten"] },
];

// ¿Se puede usar este alimento con lo que excluiste? (acepta grupos y alimentos sueltos)
export function permitido(al: Alimento, excluidos: string[]): boolean {
  if (excluidos.includes(al.id)) return false;
  for (const ex of EXCLUSIONES) {
    if (!excluidos.includes(ex.id)) continue;
    if (al.etiquetas?.some((e) => ex.etiquetas.includes(e)) || ex.ids?.includes(al.id)) return false;
  }
  return true;
}

export const ORDEN_SECCIONES: Seccion[] = ["Frutas y verduras", "Carnes y pescados", "Lácteos y huevo", "Tortillas y pan", "Abarrotes", "Congelados"];

// "2 tortillas (60 g)" o "150 g"
export function porcion(al: Alimento, gramos: number): string {
  if (al.pieza) {
    const n = Math.round((gramos / al.pieza.g) * 2) / 2;
    if (n >= 0.5) {
      const plural = n <= 1 ? al.pieza.nombre : al.pieza.nombre.endsWith("n") ? `${al.pieza.nombre}es` : `${al.pieza.nombre}s`;
      return `${String(n).replace(".5", "½").replace(/^0½/, "½")} ${plural} (${gramos} g)`;
    }
  }
  return `${gramos} g`;
}
