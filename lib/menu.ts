// Menú semanal sin IA: arma cada comida con tus alimentos habituales (sin los que no comes), calcula los gramos
// y valida en código que el total de cada día quede dentro de ±5% de tus calorías. Si cocinas 3 veces o menos,
// la comida y la cena se repiten por lotes para que cocines menos.
import { calcularObjetivos } from "./nutricion";
import type { Medida, Perfil } from "./tipos";
import { ALIMENTOS, ORDEN_SECCIONES, alimentoPorId, permitido, type Alimento, type Grupo, type Seccion, type TipoComida } from "./alimentos";

export type Item = { alimento: string; gramos: number };
export type ComidaMenu = { tipo: TipoComida; items: Item[] };
export type DiaMenu = { comidas: ComidaMenu[] };
export type Lote = { cocinar: number; dias: number[] }; // índices de día: 0 = lunes … 6 = domingo
export type Metas = { kcal: number; proteina: number; grasa: number; carbos: number };
export type Menu = Metas & { dias: DiaMenu[]; lotes: Lote[] | null };
export type Preferencias = { habituales: string[]; excluidos: string[]; veces_cocina: number };

export const DIAS_MENU = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const NOMBRE_COMIDA: Record<TipoComida, string> = { desayuno: "Desayuno", colacion: "Colación", comida: "Comida", cena: "Cena" };

export function macros(items: Item[]) {
  const t = { kcal: 0, p: 0, g: 0, c: 0 };
  for (const it of items) {
    const al = alimentoPorId(it.alimento);
    if (!al) continue;
    const f = it.gramos / 100;
    t.kcal += al.kcal * f;
    t.p += al.p * f;
    t.g += al.g * f;
    t.c += al.c * f;
  }
  return t;
}
export const macrosDia = (d: DiaMenu) => macros(d.comidas.flatMap((c) => c.items));

// Generador pseudoaleatorio con semilla: el mismo menú para la misma semilla
function rng(semilla: string) {
  let h = 1779033703;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const paso = (al: Alimento) => (al.pieza && al.grupo !== "grasa" && al.grupo !== "fruta" ? al.pieza.g : al.grupo === "grasa" ? 5 : 10);
const ajustar = (al: Alimento, g: number) => {
  const s = paso(al);
  return Math.min(al.max ?? 400, Math.max(al.min ?? s, Math.round(g / s) * s));
};

// Reparto del día por comida (con más de 2,400 kcal se agrega una segunda colación)
function reparto(kcal: number): [TipoComida, number][] {
  return kcal >= 2400
    ? [["desayuno", 0.25], ["colacion", 0.1], ["comida", 0.3], ["colacion", 0.1], ["cena", 0.25]]
    : [["desayuno", 0.25], ["colacion", 0.12], ["comida", 0.38], ["cena", 0.25]];
}

const PLANTILLA: Record<TipoComida, Grupo[]> = {
  desayuno: ["proteina", "carbo", "fruta", "grasa"],
  colacion: ["proteina", "fruta", "grasa"],
  comida: ["proteina", "carbo", "verdura", "grasa"],
  cena: ["proteina", "carbo", "verdura", "grasa"],
};

export function candidatos(grupo: Grupo, tipo: TipoComida, excluidos: string[]) {
  return ALIMENTOS.filter((x) => x.grupo === grupo && x.comidas.includes(tipo) && permitido(x, excluidos));
}

// Gramos de cada alimento de una comida para acercarse a sus calorías, proteína y grasa
function porciones(elegidos: Alimento[], tipo: TipoComida, meta: { kcal: number; p: number; g: number }): Item[] {
  const items: Item[] = [];
  let kcal = 0;
  let grasa = 0;
  const poner = (al: Alimento, g: number) => {
    const gr = ajustar(al, g);
    items.push({ alimento: al.id, gramos: gr });
    kcal += (al.kcal * gr) / 100;
    grasa += (al.g * gr) / 100;
  };
  const prot = elegidos.find((x) => x.grupo === "proteina");
  if (prot) poner(prot, (meta.p * 0.8) / (prot.p / 100));
  const verdura = elegidos.find((x) => x.grupo === "verdura");
  if (verdura) poner(verdura, 150);
  const fruta = elegidos.find((x) => x.grupo === "fruta");
  if (fruta) poner(fruta, (meta.kcal * (tipo === "colacion" ? 0.3 : 0.15)) / (fruta.kcal / 100));
  const gr = elegidos.find((x) => x.grupo === "grasa");
  if (gr) {
    const g = (Math.max(0, meta.g - grasa) / (gr.g / 100)) * 0.9;
    if (g >= (gr.min ?? 5) * 0.6) poner(gr, g);
  }
  const carbo = elegidos.find((x) => x.grupo === "carbo");
  if (carbo) {
    const g = (meta.kcal - kcal) / (carbo.kcal / 100);
    if (g >= (carbo.min ?? 30) * 0.6) poner(carbo, g);
  }
  return items;
}

// Corrige el día hasta quedar dentro de ±3% (y nunca fuera de ±5%): primero carbohidratos, luego fruta, grasa y proteína
function cuadrarDia(dia: DiaMenu, meta: number) {
  const orden: Grupo[] = ["carbo", "fruta", "grasa", "proteina", "verdura"];
  for (let pasada = 0; pasada < 12; pasada++) {
    const diff = meta - macrosDia(dia).kcal;
    if (Math.abs(diff) <= meta * 0.03) return;
    let movido = false;
    for (const grupo of orden) {
      for (const c of dia.comidas)
        for (const it of c.items) {
          const al = alimentoPorId(it.alimento)!;
          if (al.grupo !== grupo) continue;
          const resta = meta - macrosDia(dia).kcal;
          if (Math.abs(resta) <= meta * 0.03) return;
          const nuevo = ajustar(al, it.gramos + resta / (al.kcal / 100) / 2);
          if (nuevo !== it.gramos) {
            it.gramos = nuevo;
            movido = true;
          }
        }
    }
    if (!movido) break;
  }
  // Si aún falta comida (topes por porción), se agrega una colación sencilla
  const faltan = meta - macrosDia(dia).kcal;
  if (faltan > meta * 0.04) {
    const platano = ALIMENTOS.find((x) => x.id === "platano")!;
    dia.comidas.push({ tipo: "colacion", items: [{ alimento: platano.id, gramos: ajustar(platano, faltan / (platano.kcal / 100)) }] });
  }
}

export function generarMenu(metas: Metas, prefs: Preferencias, semilla: string): Menu {
  const azar = rng(semilla);
  // Tus alimentos habituales salen más seguido; tofu y leguminosas como plato fuerte solo si no comes carne o los marcaste
  const vegetal = ["tofu", "lentejas", "garbanzo"];
  const peso = (al: Alimento) => (prefs.habituales.includes(al.id) ? 5 : vegetal.includes(al.id) ? 0.25 : 1);
  const elegir = (lista: Alimento[], evitar: string[] = []) => {
    const opciones = lista.filter((x) => !evitar.includes(x.id));
    const pool = opciones.length ? opciones : lista;
    const total = pool.reduce((s, x) => s + peso(x), 0);
    let r = azar() * total;
    for (const x of pool) if ((r -= peso(x)) <= 0) return x;
    return pool[pool.length - 1];
  };

  const veces = Math.max(1, Math.min(7, prefs.veces_cocina || 7));
  const lotes: Lote[] | null =
    veces <= 3
      ? Array.from({ length: veces }, (_, i) => {
          const desde = Math.floor((i * 7) / veces);
          const hasta = Math.floor(((i + 1) * 7) / veces);
          const dias = Array.from({ length: hasta - desde }, (_, j) => desde + j);
          return { cocinar: (dias[0] + 6) % 7, dias };
        })
      : null;

  const reparte = reparto(metas.kcal);
  const ayer: Record<string, string[]> = {};
  const dias: DiaMenu[] = [];
  for (let d = 0; d < 7; d++) {
    const lote = lotes?.find((l) => l.dias.includes(d));
    const primero = lote ? lote.dias[0] : d;
    const comidas: ComidaMenu[] = reparte.map(([tipo, parte], n) => {
      // Comida y cena de un lote se copian del primer día del lote
      if (lote && primero !== d && (tipo === "comida" || tipo === "cena")) return structuredClone(dias[primero].comidas[n]);
      const clave = `${tipo}-${n}`;
      const elegidos = PLANTILLA[tipo]
        .map((grupo) => {
          const lista = candidatos(grupo, tipo, prefs.excluidos);
          return lista.length ? elegir(lista, ayer[clave]) : null;
        })
        .filter((x): x is Alimento => !!x);
      ayer[clave] = elegidos.map((x) => x.id);
      return { tipo, items: porciones(elegidos, tipo, { kcal: metas.kcal * parte, p: metas.proteina * parte, g: metas.grasa * parte }) };
    });
    const dia = { comidas };
    cuadrarDia(dia, metas.kcal);
    dias.push(dia);
  }
  return { ...metas, dias, lotes };
}

// Alternativas con calorías parecidas para cambiar un alimento
export function reemplazos(item: Item, tipo: TipoComida, excluidos: string[]): Item[] {
  const al = alimentoPorId(item.alimento);
  if (!al) return [];
  const kcal = (al.kcal * item.gramos) / 100;
  return candidatos(al.grupo, tipo, excluidos)
    .filter((x) => x.id !== al.id)
    .sort((x, y) => Math.abs(x.p / x.kcal - al.p / al.kcal) - Math.abs(y.p / y.kcal - al.p / al.kcal))
    .slice(0, 3)
    .map((x) => ({ alimento: x.id, gramos: ajustar(x, kcal / (x.kcal / 100)) }));
}

// Lista del súper de toda la semana, agrupada por sección
export function listaDeCompras(menu: Menu): { seccion: Seccion; cosas: { alimento: Alimento; texto: string }[] }[] {
  const total = new Map<string, number>();
  for (const d of menu.dias) for (const c of d.comidas) for (const it of c.items) total.set(it.alimento, (total.get(it.alimento) ?? 0) + it.gramos);
  return ORDEN_SECCIONES.map((seccion) => ({
    seccion,
    cosas: [...total.entries()]
      .map(([id, g]) => ({ alimento: alimentoPorId(id)!, g }))
      .filter((x) => x.alimento?.seccion === seccion)
      .sort((x, y) => x.alimento.nombre.localeCompare(y.alimento.nombre))
      .map(({ alimento, g }) => ({
        alimento,
        texto: alimento.pieza && alimento.grupo !== "grasa" ? `${Math.ceil(g / alimento.pieza.g)} ${alimento.pieza.nombre}${Math.ceil(g / alimento.pieza.g) === 1 ? "" : "s"}` : g >= 1000 ? `${(Math.ceil(g / 100) / 10).toFixed(1)} kg` : `${Math.ceil(g / 50) * 50} g`,
      })),
  })).filter((s) => s.cosas.length);
}

// Menú de la semana con tus metas del día. La misma semana da el mismo menú (salvo que pidas otro).
export function menuDeLaSemana(p: Perfil, m: Pick<Medida, "peso_kg">, usuario: string, variante = ""): Menu {
  const o = calcularObjetivos(p, m);
  const lunes = new Date();
  lunes.setUTCDate(lunes.getUTCDate() - ((lunes.getUTCDay() + 6) % 7));
  return generarMenu(o, { habituales: p.alimentos_habituales, excluidos: p.alimentos_excluidos, veces_cocina: p.veces_cocina }, `${usuario}:${lunes.toISOString().slice(0, 10)}:${variante}`);
}
