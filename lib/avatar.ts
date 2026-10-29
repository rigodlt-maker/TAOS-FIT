// Avatar estilo caricatura 3D (cabezón, volumen con degradados), dibujado desde cero en SVG.
// La cara y el peinado los eliges tú; el cuerpo sale de tus medidas: hombros, brazos, cintura, panza, cadera y piernas.
// Las diferencias se exageran un poco para que se note el cambio entre una medición y otra.
import { composicion } from "./composicion";
import type { Medida, Perfil } from "./tipos";

export const ANCHO = 240;
export const ALTO = 440;
const CX = ANCHO / 2;

// ---------- Apariencia que elige cada usuario ----------

export type Peinado = "corto" | "copete" | "lateral" | "cresta" | "rizado" | "afro" | "calvo" | "ondulado" | "largo" | "bob" | "coleta" | "chongo" | "trenzas";
export type Ojos = "normales" | "grandes" | "pestanas" | "felices" | "guino";
export type Cejas = "normales" | "gruesas" | "finas" | "arqueadas";
export type Boca = "sonrisa" | "risa" | "tranquila";
export type Vello = "ninguno" | "barba" | "barba_corta" | "bigote" | "candado";
export type Lentes = "ninguno" | "redondos" | "cuadrados" | "sol";
export type Accesorio = "ninguno" | "gorra" | "banda" | "diadema" | "audifonos" | "aretes";
export type Prenda = "playera" | "tirantes" | "sudadera" | "top";
export type Inferior = "short" | "licra" | "pants";
export type Complexion = "masculina" | "femenina" | "neutra";

export type Apariencia = {
  piel: number;
  complexion: Complexion;
  peinado: Peinado;
  pelo: string;
  ojos: Ojos;
  cejas: Cejas;
  boca: Boca;
  vello: Vello;
  lentes: Lentes;
  accesorio: Accesorio;
  pecas: boolean;
  prenda: Prenda;
  ropa: string;
  inferior: Inferior;
  color_inferior: string;
  tenis: string;
};

export const PIELES = ["#fde3cf", "#f7d5bd", "#eab894", "#d9a173", "#cf9268", "#a5683f", "#8a5634", "#5e3a24"];
export const PELOS = ["#1f1c1b", "#4b2e1c", "#8a5a2c", "#d9b25c", "#f1dfa8", "#b5432c", "#9a9a9a", "#f2f2f2", "#7c5cff", "#3b82f6", "#ec4899", "#14b8a6"];
export const ROPAS = ["#d4af37", "#111827", "#f5f5f5", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#f97316", "#ec4899", "#14b8a6", "#64748b"];
export const INFERIORES = ["#1f2937", "#111827", "#475569", "#1e3a8a", "#d4af37", "#be185d", "#f5f5f5"];
export const TENIS = ["#f8f8f8", "#111827", "#d4af37", "#ef4444", "#3b82f6", "#22c55e", "#ec4899"];

export const OPCIONES = {
  peinado: { corto: "Corto", copete: "Copete", lateral: "De lado", cresta: "Cresta", rizado: "Rizado", afro: "Afro", calvo: "Rapado", ondulado: "Ondulado", largo: "Largo", bob: "Bob", coleta: "Coleta", chongo: "Chongo", trenzas: "Trenzas" } as Record<Peinado, string>,
  ojos: { normales: "Normales", grandes: "Grandes", pestanas: "Pestañas", felices: "Felices", guino: "Guiño" } as Record<Ojos, string>,
  cejas: { normales: "Normales", gruesas: "Gruesas", finas: "Finas", arqueadas: "Arqueadas" } as Record<Cejas, string>,
  boca: { sonrisa: "Sonrisa", risa: "Risa", tranquila: "Tranquila" } as Record<Boca, string>,
  vello: { ninguno: "Nada", barba: "Barba", barba_corta: "Barba corta", bigote: "Bigote", candado: "Candado" } as Record<Vello, string>,
  lentes: { ninguno: "Sin lentes", redondos: "Redondos", cuadrados: "Cuadrados", sol: "De sol" } as Record<Lentes, string>,
  accesorio: { ninguno: "Nada", gorra: "Gorra", banda: "Banda", diadema: "Diadema", audifonos: "Audífonos", aretes: "Aretes" } as Record<Accesorio, string>,
  prenda: { playera: "Playera", tirantes: "Tirantes", sudadera: "Sudadera", top: "Top" } as Record<Prenda, string>,
  inferior: { short: "Short", licra: "Licra", pants: "Pants" } as Record<Inferior, string>,
  complexion: { masculina: "Masculina", femenina: "Femenina", neutra: "Neutra" } as Record<Complexion, string>,
};

export function aparienciaInicial(cuerpo: "masculino" | "femenino"): Apariencia {
  const f = cuerpo === "femenino";
  return {
    piel: 2,
    complexion: f ? "femenina" : "masculina",
    peinado: f ? "largo" : "copete",
    pelo: PELOS[0],
    ojos: f ? "pestanas" : "normales",
    cejas: "normales",
    boca: "sonrisa",
    vello: "ninguno",
    lentes: "ninguno",
    accesorio: "ninguno",
    pecas: false,
    prenda: f ? "tirantes" : "playera",
    ropa: ROPAS[0],
    inferior: f ? "licra" : "short",
    color_inferior: INFERIORES[0],
    tenis: TENIS[0],
  };
}

// Completa una apariencia guardada (también las de la versión anterior, que solo tenían piel/peinado/pelo/ropa/barba)
export function normalizarApariencia(a: unknown, cuerpo: "masculino" | "femenino"): Apariencia {
  const base = aparienciaInicial(cuerpo);
  if (!a || typeof a !== "object") return base;
  const v = a as Partial<Apariencia> & { barba?: boolean };
  const de = <K extends keyof typeof OPCIONES>(k: K, val: unknown) => (typeof val === "string" && val in OPCIONES[k] ? val : base[k as keyof Apariencia]) as Apariencia[K];
  const color = (lista: string[], val: unknown, def: string) => (typeof val === "string" && lista.includes(val) ? val : def);
  return {
    piel: typeof v.piel === "number" && v.piel >= 0 && v.piel < PIELES.length ? Math.round(v.piel) : base.piel,
    complexion: de("complexion", v.complexion),
    peinado: de("peinado", v.peinado),
    pelo: color(PELOS, v.pelo, base.pelo),
    ojos: de("ojos", v.ojos),
    cejas: de("cejas", v.cejas),
    boca: de("boca", v.boca),
    vello: v.vello ? de("vello", v.vello) : v.barba ? "barba" : "ninguno",
    lentes: de("lentes", v.lentes),
    accesorio: de("accesorio", v.accesorio),
    pecas: v.pecas === true,
    prenda: de("prenda", v.prenda),
    ropa: color(ROPAS, v.ropa, base.ropa),
    inferior: de("inferior", v.inferior),
    color_inferior: color(INFERIORES, v.color_inferior, base.color_inferior),
    tenis: color(TENIS, v.tenis, base.tenis),
  };
}

// ---------- Medidas ----------

export type Contornos = { pecho: number; cintura: number; cadera: number; brazo: number; muslo: number; cuello: number; estimadas: string[] };

// Medidas completas: las que diste y, las que faltan, estimadas por IMC y género
export function contornos(p: Pick<Perfil, "cuerpo" | "altura_cm">, m: Medida): Contornos {
  const k = Math.sqrt(m.peso_kg / (p.altura_cm / 100) ** 2 / 22);
  const h = p.cuerpo === "masculino";
  const cintura = m.cintura_cm ?? p.altura_cm * (h ? 0.47 : 0.43) * k;
  const estimadas = Object.entries({ cintura: m.cintura_cm, pecho: m.pecho_cm, cadera: m.cadera_cm, brazo: m.brazo_cm, muslo: m.muslo_cm, cuello: m.cuello_cm })
    .filter(([, v]) => v == null)
    .map(([n]) => n);
  return {
    cintura,
    pecho: m.pecho_cm ?? cintura * (h ? 1.17 : 1.22),
    cadera: m.cadera_cm ?? cintura * (h ? 1.1 : 1.38),
    brazo: m.brazo_cm ?? p.altura_cm * (h ? 0.18 : 0.165) * k,
    muslo: m.muslo_cm ?? p.altura_cm * (h ? 0.32 : 0.335) * k,
    cuello: m.cuello_cm ?? p.altura_cm * (h ? 0.215 : 0.185) * Math.sqrt(k),
    estimadas,
  };
}

// Medidas de un cuerpo "promedio" a 175 cm (hombre) o 162 cm (mujer): con ellas el avatar sale en su tamaño base
const REFERENCIA = {
  masculino: { pecho: 100, cintura: 86, cadera: 97, brazo: 32, muslo: 56 },
  femenino: { pecho: 90, cintura: 73, cadera: 99, brazo: 28, muslo: 56 },
};
// Exagera la diferencia contra la referencia (1.5) y la limita para que no se deforme
const factor = (valor: number, ref: number) => Math.min(1.75, Math.max(0.68, (valor / ref) ** 1.5));

// ---------- Geometría ----------

type Punto = [number, number];

// Curva suave que pasa por todos los puntos (Catmull-Rom convertida a Bézier)
export function curva(pts: Punto[], cerrar = false): string {
  const p = cerrar ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${f(p[1][0])},${f(p[1][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return cerrar ? `${d} Z` : d;
}
const f = (n: number) => Math.round(n * 10) / 10;
// Lado derecho y su espejo, como una sola figura cerrada
const simetrica = (lado: Punto[]) => curva([...lado.map(([x, y]): Punto => [CX + x, y]), ...[...lado].reverse().map(([x, y]): Punto => [CX - x, y])], true);

export type Figura = {
  torso: string; // playera (y la piel del torso cuando usas tirantes o top)
  tirantes: string;
  top: string;
  mangas: { pts: [Punto, Punto]; rx: number; ry: number };
  cintura: number;
  short: string;
  piernas: [string, string];
  brazos: [string, string];
  manos: [Punto, Punto];
  cuello: string;
  panza: { rx: number; ry: number; cy: number } | null;
  tenis: [Punto, Punto];
  silueta: string; // contorno del cuerpo (para comparar contra otra medición)
  definicion: number; // 0 a 1: qué tanto se marcan los músculos
  musculo: number; // 0 a 1
  escala: number; // altura relativa
};

// "complexion" solo cambia la forma base del dibujo; las medidas mandan sobre el tamaño
export function figura(p: Pick<Perfil, "cuerpo" | "altura_cm" | "nacimiento">, m: Medida, complexion: Complexion = p.cuerpo === "masculino" ? "masculina" : "femenina"): Figura {
  const c = contornos(p, m);
  const comp = composicion(p, m);
  const hombre = p.cuerpo === "masculino";
  const ref = REFERENCIA[p.cuerpo];
  const forma = { masculina: { h: 54, pe: 46, ci: 39, ca: 41 }, femenina: { h: 47, pe: 42, ci: 33, ca: 45 }, neutra: { h: 50.5, pe: 44, ci: 36, ca: 43 } }[complexion];
  const musculo = Math.max(0, Math.min(1, (comp.ffmi - (hombre ? 18 : 15)) / 5));
  const grasa = Math.max(0, Math.min(1, (comp.grasa - (hombre ? 18 : 26)) / 14));

  const hombros = forma.h * Math.sqrt(factor(c.pecho, ref.pecho)) + musculo * 9;
  const pecho = forma.pe * factor(c.pecho, ref.pecho) ** 0.8;
  const cintura = forma.ci * factor(c.cintura, ref.cintura);
  const cadera = forma.ca * factor(c.cadera, ref.cadera) ** 0.9;
  const brazo = 20 * factor(c.brazo, ref.brazo);
  const muslo = 25 * factor(c.muslo, ref.muslo);
  const cuello = 13 + musculo * 3 + grasa * 2;

  // Alturas (px): cabeza grande arriba, cuerpo de ~2.5 cabezas
  const Y = { hombro: 176, axila: 196, pecho: 212, cintura: 254, cadera: 290, entrepierna: 304, short: 330, rodilla: 366, tobillo: 410 };

  const lados: Punto[] = [
    [cuello + 2, 166],
    [hombros * 0.75, 172],
    [hombros, Y.hombro + 10],
    [pecho, Y.axila + 4],
    [Math.max(pecho, cintura) * 0.98, Y.pecho + 10],
    [cintura, Y.cintura],
    [cadera, Y.cadera - 6],
  ];
  const cerrar = (l: Punto[], abajo: number, ancho: number) =>
    curva([...l.map(([x, y]): Punto => [CX + x, y]), [CX + ancho, abajo], [CX - ancho, abajo], ...[...l].reverse().map(([x, y]): Punto => [CX - x, y])], true);
  const torso = cerrar(lados, Y.cadera + 2, cadera * 0.98);
  const tirantesLados: Punto[] = [[cuello + 3, 172], [cuello + 15, 168], [pecho * 0.86, Y.axila + 4], [pecho, Y.axila + 16], ...lados.slice(4)];
  const tirantes = cerrar(tirantesLados, Y.cadera + 2, cadera * 0.98);
  const top = cerrar([[cuello + 3, 172], [cuello + 15, 168], [pecho * 0.86, Y.axila + 4], [pecho, Y.axila + 16], [Math.max(pecho, cintura) * 0.97, 236]], 238, Math.max(pecho, cintura) * 0.9);

  const separacion = 3;
  const exterior = Math.max(cadera, separacion + muslo * 2 * 0.95);
  const short = simetrica([
    [cadera * 0.99, Y.cadera - 8],
    [exterior + 1, Y.entrepierna],
    [exterior - 2, Y.short],
    [separacion - 1, Y.short],
    [0.5, Y.entrepierna + 2],
  ]);
  const pierna = (s: 1 | -1) => {
    const x = (dx: number) => CX + s * dx;
    const centro = separacion + (exterior - separacion) / 2;
    const ancho = (exterior - separacion) / 2;
    return curva(
      [
        [x(centro - ancho), Y.short - 6],
        [x(centro + ancho), Y.short - 6],
        [x(centro + ancho * 0.62), Y.rodilla],
        [x(centro + ancho * 0.7), Y.rodilla + 18],
        [x(centro + ancho * 0.42), Y.tobillo],
        [x(centro - ancho * 0.42), Y.tobillo],
        [x(centro - ancho * 0.55), Y.rodilla + 18],
        [x(centro - ancho * 0.55), Y.rodilla],
      ],
      true,
    );
  };
  const piernaCentro = separacion + (exterior - separacion) / 2;

  // Brazos: del hombro a la mano, un poco separados del cuerpo según la cintura
  const codoX = Math.max(cintura + brazo * 0.65 + 4, hombros - brazo * 0.2);
  const brazoDe = (s: 1 | -1) => {
    const x = (dx: number) => CX + s * dx;
    return curva(
      [
        [x(hombros - brazo * 0.55), Y.hombro - 2],
        [x(hombros + brazo * 0.45 + musculo * 4), Y.hombro + 12],
        [x(codoX + brazo * 0.55), 228],
        [x(codoX + brazo * 0.44), 262],
        [x(codoX + brazo * 0.36), 290],
        [x(codoX - brazo * 0.3), 292],
        [x(codoX - brazo * 0.42), 262],
        [x(codoX - brazo * 0.5), 230],
        [x(pecho - 4), Y.axila + 6],
      ],
      true,
    );
  };

  const silueta = simetrica([
    [cuello + 2, 166],
    [hombros, Y.hombro + 10],
    [pecho, Y.axila + 4],
    [cintura + (grasa > 0 ? grasa * 6 : 0), Y.cintura],
    [cadera, Y.cadera - 6],
    [exterior, Y.entrepierna + 6],
    [piernaCentro + (exterior - separacion) * 0.31, Y.rodilla],
    [piernaCentro + (exterior - separacion) * 0.21, Y.tobillo],
    [separacion, Y.tobillo],
    [separacion, Y.entrepierna + 4],
    [0, Y.entrepierna],
  ]);

  return {
    torso,
    tirantes,
    top,
    mangas: { pts: [[CX + hombros - 3, Y.hombro + 12], [CX - hombros + 3, Y.hombro + 12]], rx: brazo * 0.66 + musculo * 3, ry: 17 },
    cintura,
    short,
    piernas: [pierna(1), pierna(-1)],
    brazos: [brazoDe(1), brazoDe(-1)],
    manos: [
      [CX + codoX + 1, 300],
      [CX - codoX - 1, 300],
    ],
    cuello: `M${f(CX - cuello)},140 L${f(CX + cuello)},140 L${f(CX + cuello + 1)},172 L${f(CX - cuello - 1)},172 Z`,
    panza: grasa > 0.15 ? { rx: cintura * (0.7 + grasa * 0.25), ry: 18 + grasa * 22, cy: Y.cintura + 4 } : null,
    tenis: [
      [CX + piernaCentro, 418],
      [CX - piernaCentro, 418],
    ],
    silueta,
    definicion: Math.max(0, Math.min(1, ((hombre ? 20 : 28) - comp.grasa) / 8)),
    musculo,
    escala: Math.min(1.04, Math.max(0.9, p.altura_cm / (hombre ? 175 : 162))),
  };
}

// Aclara (>0) u oscurece (<0) un color hex
export function tono(hex: string, cantidad: number): string {
  const n = parseInt(hex.slice(1), 16);
  const canal = (v: number) => Math.round(cantidad >= 0 ? v + (255 - v) * cantidad : v * (1 + cantidad));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(canal);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
