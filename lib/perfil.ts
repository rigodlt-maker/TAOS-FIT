// Perfil completo con valores por defecto (los perfiles viejos no tienen meta, comida ni ajustes)
import { normalizarApariencia } from "./avatar";
import { NOMBRES_CLASE, type Clase, type Cuerpo, type Genero, type Lugar, type Objetivo, type Perfil, type TipoClase } from "./tipos";

const OBJETIVOS: Objetivo[] = ["hipertrofia", "fuerza", "resistencia", "grasa"];
const LUGARES: Lugar[] = ["gimnasio", "casa_mancuernas", "casa_sin_equipo"];

// 1.4.0: datos nuevos, siempre revisados (lo que venga raro se ignora)
export function leerObjetivos(v: unknown, principal: Objetivo): Objetivo[] {
  const lista = Array.isArray(v) ? [...new Set(v.map(String).filter((x): x is Objetivo => OBJETIVOS.includes(x as Objetivo)))] : [];
  return lista.length ? lista : [principal];
}
export function leerLugarPorDia(v: unknown): Partial<Record<number, Lugar>> {
  const r: Partial<Record<number, Lugar>> = {};
  if (v && typeof v === "object") for (const [k, l] of Object.entries(v)) if (/^[0-6]$/.test(k) && LUGARES.includes(l as Lugar)) r[Number(k)] = l as Lugar;
  return r;
}
export function leerClases(v: unknown): Clase[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .map((c) => ({
      id: String(c.id ?? "").slice(0, 40) || Math.random().toString(36).slice(2, 10),
      tipo: (Object.keys(NOMBRES_CLASE).includes(String(c.tipo)) ? c.tipo : "otra") as TipoClase,
      dia: Number(c.dia),
      hora: typeof c.hora === "string" && /^\d{2}:\d{2}$/.test(c.hora) ? c.hora : null,
      minutos: Math.min(180, Math.max(15, Number(c.minutos) || 60)),
    }))
    .filter((c) => Number.isInteger(c.dia) && c.dia >= 0 && c.dia <= 6)
    .slice(0, 14);
}

// Lo que va en columnas propias de fit_profiles; lo demás se guarda en la columna "datos"
export const COLUMNAS = ["nombre", "genero", "nacimiento", "altura_cm", "objetivo", "nivel", "dias_semana", "minutos_sesion", "lugar", "barra_dominadas", "lesiones", "enfasis", "hora_entreno", "avatar"] as const;

export function completarPerfil(fila: Record<string, unknown>): Perfil {
  const datos = (fila.datos && typeof fila.datos === "object" ? fila.datos : {}) as Record<string, unknown>;
  const genero = (fila.genero as Genero) ?? "hombre";
  const cuerpo: Cuerpo = datos.cuerpo === "femenino" || datos.cuerpo === "masculino" ? (datos.cuerpo as Cuerpo) : genero === "mujer" ? "femenino" : "masculino";
  const num = (v: unknown, def: number) => (typeof v === "number" && Number.isFinite(v) ? v : def);
  const lista = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
  return {
    nombre: String(fila.nombre ?? ""),
    genero,
    cuerpo,
    nacimiento: String(fila.nacimiento ?? "1995-01-01"),
    altura_cm: Number(fila.altura_cm ?? 170),
    objetivo: leerObjetivos(datos.objetivos, (fila.objetivo as Perfil["objetivo"]) ?? "hipertrofia")[0],
    objetivos: leerObjetivos(datos.objetivos, (fila.objetivo as Perfil["objetivo"]) ?? "hipertrofia"),
    nivel: (fila.nivel as Perfil["nivel"]) ?? "principiante",
    dias_semana: Number(fila.dias_semana ?? 3),
    minutos_sesion: Number(fila.minutos_sesion ?? 60),
    lugar: (fila.lugar as Perfil["lugar"]) ?? "gimnasio",
    lugar_por_dia: leerLugarPorDia(datos.lugar_por_dia),
    clases: leerClases(datos.clases),
    clases_hechas: lista(datos.clases_hechas).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-60),
    barra_dominadas: fila.barra_dominadas === true,
    lesiones: lista(fila.lesiones) as Perfil["lesiones"],
    enfasis: lista(fila.enfasis) as Perfil["enfasis"],
    hora_entreno: (fila.hora_entreno as string | null) ?? null,
    avatar: normalizarApariencia(fila.avatar, cuerpo),
    actividad: (["sedentaria", "ligera", "activa"].includes(String(datos.actividad)) ? datos.actividad : "ligera") as Perfil["actividad"],
    dias_entreno: lista(datos.dias_entreno).map(Number).filter((d) => d >= 0 && d <= 6),
    meta_peso_kg: typeof datos.meta_peso_kg === "number" ? datos.meta_peso_kg : null,
    fecha_meta: typeof datos.fecha_meta === "string" ? datos.fecha_meta : null,
    alimentos_habituales: lista(datos.alimentos_habituales),
    alimentos_excluidos: lista(datos.alimentos_excluidos),
    veces_cocina: num(datos.veces_cocina, 7),
    menu_economico: datos.menu_economico === true,
    dia_registro: num(datos.dia_registro, 0),
    ajuste_kcal: num(datos.ajuste_kcal, 0),
    volumen: num(datos.volumen, 1),
    pausa_hasta: typeof datos.pausa_hasta === "string" ? datos.pausa_hasta : null,
  };
}

export function separarPerfil(p: Perfil): { columnas: Record<string, unknown>; datos: Record<string, unknown> } {
  const columnas: Record<string, unknown> = {};
  const datos: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) ((COLUMNAS as readonly string[]).includes(k) ? columnas : datos)[k] = v;
  return { columnas, datos };
}

// Punto de partida de un perfil nuevo (la bienvenida lo va llenando)
export const PERFIL_BASE: Perfil = {
  nombre: "",
  genero: "hombre",
  cuerpo: "masculino",
  nacimiento: "1995-01-01",
  altura_cm: 170,
  objetivo: "hipertrofia",
  objetivos: ["hipertrofia"],
  nivel: "principiante",
  dias_semana: 3,
  minutos_sesion: 60,
  lugar: "gimnasio",
  lugar_por_dia: {},
  clases: [],
  clases_hechas: [],
  barra_dominadas: false,
  lesiones: [],
  enfasis: [],
  hora_entreno: null,
  avatar: null,
  actividad: "ligera",
  dias_entreno: [],
  meta_peso_kg: null,
  fecha_meta: null,
  alimentos_habituales: [],
  alimentos_excluidos: [],
  veces_cocina: 7,
  menu_economico: false,
  dia_registro: 0,
  ajuste_kcal: 0,
  volumen: 1,
  pausa_hasta: null,
};
