"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { evaluarSemana, planConCambios } from "./ajustes";
import { normalizarApariencia } from "./avatar";
import { FALTA_SQL } from "./datos/repo";
import type { Lesion, Zona } from "./ejercicios";
import { ejercicioPorId } from "./ejercicios";
import { hoyLocal, sumarDias } from "./entreno";
import { menuDeLaSemana } from "./menu";
import { PERFIL_BASE } from "./perfil";
import { generarPlan } from "./rutina";
import { obtenerRepo } from "./sesion";
import type { Actividad, Cuerpo, Genero, Lugar, Medida, Nivel, Objetivo, Perfil, Resultado } from "./tipos";

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "").trim();
const numero = (f: FormData, campo: string) => {
  const v = texto(f, campo).replace(",", ".");
  return v === "" ? null : Number(v);
};
const error = (e: unknown): Resultado => ({ ok: false, mensaje: e instanceof Error ? e.message : String(e) });

function refrescar() {
  revalidatePath("/", "layout");
}

// Lee del formulario solo los campos que trae; lo demás se queda como estaba.
// Las listas de casillas mandan un campo oculto "_campos" para saber que vinieron (aunque vengan vacías).
function leerPerfil(f: FormData, anterior: Perfil | null): Perfil {
  const p: Perfil = structuredClone(anterior ?? PERFIL_BASE);
  const tiene = (c: string) => f.has(c);
  const listas = f.getAll("_campos").map(String);
  const uno = <T extends string>(campo: string, validos: readonly T[], actual: T): T => (tiene(campo) ? (validos.includes(texto(f, campo) as T) ? (texto(f, campo) as T) : actual) : actual);

  if (tiene("nombre")) {
    if (!texto(f, "nombre")) throw new Error("Escribe tu nombre.");
    p.nombre = texto(f, "nombre").slice(0, 60);
  }
  p.genero = uno<Genero>("genero", ["hombre", "mujer", "no_binario", "prefiero_no_decir"], p.genero);
  // Para hombre/mujer la base de cálculo sale sola; para las otras opciones la eliges
  p.cuerpo = p.genero === "hombre" ? "masculino" : p.genero === "mujer" ? "femenino" : uno<Cuerpo>("cuerpo", ["masculino", "femenino"], p.cuerpo);
  if (tiene("nacimiento")) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto(f, "nacimiento"))) throw new Error("Escribe tu fecha de nacimiento.");
    p.nacimiento = texto(f, "nacimiento");
  }
  if (tiene("altura_cm")) {
    const altura = numero(f, "altura_cm");
    if (!altura || altura < 100 || altura > 250) throw new Error("La altura va en centímetros, por ejemplo 172.");
    p.altura_cm = altura;
  }
  p.objetivo = uno<Objetivo>("objetivo", ["hipertrofia", "fuerza", "resistencia", "grasa"], p.objetivo);
  p.nivel = uno<Nivel>("nivel", ["principiante", "intermedio", "avanzado"], p.nivel);
  p.lugar = uno<Lugar>("lugar", ["gimnasio", "casa_mancuernas", "casa_sin_equipo"], p.lugar);
  p.actividad = uno<Actividad>("actividad", ["sedentaria", "ligera", "activa"], p.actividad);
  if (tiene("dias_semana")) p.dias_semana = Math.min(6, Math.max(2, numero(f, "dias_semana") ?? 3));
  if (tiene("minutos_sesion")) p.minutos_sesion = Math.min(180, Math.max(20, numero(f, "minutos_sesion") ?? 60));
  if (tiene("hora_entreno")) p.hora_entreno = /^\d{2}:\d{2}$/.test(texto(f, "hora_entreno")) ? texto(f, "hora_entreno") : null;
  if (listas.includes("barra_dominadas")) p.barra_dominadas = f.get("barra_dominadas") === "on";
  if (listas.includes("lesiones")) p.lesiones = f.getAll("lesiones").map(String).filter((l): l is Lesion => ["rodilla", "hombro", "espalda_baja", "muneca"].includes(l));
  if (listas.includes("enfasis")) p.enfasis = f.getAll("enfasis").map(String).filter((z): z is Zona => ["pecho", "espalda", "hombros", "brazos", "piernas", "gluteo", "abdomen"].includes(z)).slice(0, 2);
  if (listas.includes("dias_entreno")) {
    p.dias_entreno = [...new Set(f.getAll("dias_entreno").map(Number).filter((d) => d >= 0 && d <= 6))].sort();
    if (p.dias_entreno.length >= 2) p.dias_semana = Math.min(6, p.dias_entreno.length);
  }
  if (listas.includes("alimentos_habituales")) p.alimentos_habituales = f.getAll("alimentos_habituales").map(String).slice(0, 80);
  if (listas.includes("alimentos_excluidos")) p.alimentos_excluidos = f.getAll("alimentos_excluidos").map(String).slice(0, 80);
  if (tiene("veces_cocina")) p.veces_cocina = Math.min(7, Math.max(1, numero(f, "veces_cocina") ?? 7));
  if (tiene("dia_registro")) p.dia_registro = Math.min(6, Math.max(0, numero(f, "dia_registro") ?? 0));
  if (tiene("meta_peso_kg")) {
    const meta = numero(f, "meta_peso_kg");
    p.meta_peso_kg = meta && meta >= 30 && meta <= 300 ? meta : null;
  }
  if (tiene("fecha_meta")) p.fecha_meta = /^\d{4}-\d{2}-\d{2}$/.test(texto(f, "fecha_meta")) ? texto(f, "fecha_meta") : null;
  if (tiene("av_peinado")) {
    const av: Record<string, unknown> = {};
    for (const [k, v] of f.entries()) if (k.startsWith("av_")) av[k.slice(3)] = k === "av_piel" ? Number(v) : k === "av_pecas" ? v === "on" : String(v);
    if (!f.has("av_pecas")) av.pecas = false;
    p.avatar = normalizarApariencia(av, p.cuerpo);
  } else if (!anterior) p.avatar = normalizarApariencia(null, p.cuerpo);
  return p;
}

function leerMedida(f: FormData): Omit<Medida, "id"> {
  const peso = numero(f, "peso_kg");
  if (!peso || peso < 25 || peso > 350) throw new Error("Escribe tu peso en kilos, por ejemplo 78.5.");
  const cm = (campo: string) => {
    const v = numero(f, campo);
    if (v !== null && (Number.isNaN(v) || v < 15 || v > 250)) throw new Error(`Revisa la medida de ${campo.replace("_cm", "")}: va en centímetros.`);
    return v;
  };
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(texto(f, "fecha")) ? texto(f, "fecha") : hoyLocal();
  return { fecha, peso_kg: peso, cintura_cm: cm("cintura_cm"), cadera_cm: cm("cadera_cm"), pecho_cm: cm("pecho_cm"), brazo_cm: cm("brazo_cm"), muslo_cm: cm("muslo_cm"), cuello_cm: cm("cuello_cm") };
}

// Guarda el menú nuevo si la base ya lo permite (si no, la pantalla de Comida lo arma igual cada semana)
async function rehacerMenu(repo: Awaited<ReturnType<typeof obtenerRepo>>, p: Perfil, motivo: string) {
  const medidas = await repo.medidas();
  if (!medidas.length) return;
  try {
    await repo.guardarMenu(menuDeLaSemana(p, medidas.at(-1)!, repo.usuario, motivo));
  } catch (e) {
    if (!(e instanceof Error && e.message === FALTA_SQL)) throw e;
  }
}

// Primera vez: perfil, primeras medidas, rutina y menú
export async function empezar(f: FormData): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    const perfil = leerPerfil(f, null);
    const medida = leerMedida(f);
    await repo.guardarPerfil(perfil);
    await repo.guardarMedida(medida);
    const { dias, notas } = generarPlan(perfil, 0, repo.usuario);
    await repo.crearPlan(dias, notas);
    await rehacerMenu(repo, perfil, "inicio");
    refrescar();
  } catch (e) {
    return error(e);
  }
  redirect("/?bienvenida=1");
}

const claveRutina = (p: Perfil | null) => (p ? JSON.stringify([p.objetivo, p.nivel, p.dias_semana, p.minutos_sesion, p.lugar, p.barra_dominadas, p.lesiones, p.enfasis]) : "");
const claveMenu = (p: Perfil | null) => (p ? JSON.stringify([p.objetivo, p.cuerpo, p.actividad, p.dias_semana, p.alimentos_habituales, p.alimentos_excluidos, p.veces_cocina, p.ajuste_kcal]) : "");

// Cambiar tus datos: si cambió algo que afecta la rutina o el menú, se rehacen
export async function guardarPerfil(f: FormData): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    const antes = await repo.perfil();
    const perfil = leerPerfil(f, antes);
    const { completo } = await repo.guardarPerfil(perfil);
    const cambios: string[] = [];
    if (claveRutina(antes) !== claveRutina(perfil) || !(await repo.planActivo())) {
      const { dias, notas } = generarPlan(perfil, 0, repo.usuario);
      await repo.crearPlan(dias, notas);
      cambios.push("rutina");
    }
    if (claveMenu(antes) !== claveMenu(perfil)) {
      await rehacerMenu(repo, perfil, "perfil");
      cambios.push("menú");
    }
    refrescar();
    if (!completo) return { ok: true, mensaje: "Guardado ✓ (algunas opciones se guardarán cuando termines el paso de la base de datos)." };
    return { ok: true, mensaje: cambios.length ? `Guardado ✓ Rehice tu ${cambios.join(" y tu ")} con los cambios.` : "Guardado ✓" };
  } catch (e) {
    return error(e);
  }
}

// Misma estructura, otros ejercicios
export async function cambiarEjercicios(): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    const perfil = await repo.perfil();
    if (!perfil) return { ok: false, mensaje: "Primero llena tu perfil." };
    const { dias, notas } = generarPlan(perfil, Date.now() % 100_000, repo.usuario);
    await repo.crearPlan(dias, notas);
    await repo.guardarAjustes([{ fecha: hoyLocal(), tipo: "rutina", detalle: "Rutina con otros ejercicios", motivo: "Lo pediste desde Rutina." }]).catch(() => {});
    refrescar();
    return { ok: true, mensaje: "Listo: rutina nueva con otros ejercicios ✓" };
  } catch (e) {
    return error(e);
  }
}

// Cambia un ejercicio del plan para siempre (por ejemplo, el aparato casi siempre está ocupado)
export async function cambiarEjercicioSiempre(viejo: string, nuevo: string): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    const plan = await repo.planActivo();
    if (!plan || !ejercicioPorId(nuevo)) return { ok: false, mensaje: "No encontré tu rutina." };
    await repo.crearPlan(planConCambios(plan, [{ ejercicio: viejo, nuevo }]), plan.notas);
    await repo.guardarAjustes([{ fecha: hoyLocal(), tipo: "ejercicio", detalle: `${ejercicioPorId(viejo)?.nombre} → ${ejercicioPorId(nuevo)?.nombre}`, motivo: "Lo cambiaste tú desde el entrenamiento." }]).catch(() => {});
    refrescar();
    return { ok: true, mensaje: "Cambiado en tu rutina ✓" };
  } catch (e) {
    return error(e);
  }
}

export async function nuevoMenu(): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    const perfil = await repo.perfil();
    if (!perfil) return { ok: false, mensaje: "Primero llena tu perfil." };
    const medidas = await repo.medidas();
    if (!medidas.length) return { ok: false, mensaje: "Primero registra tu peso en Progreso." };
    await repo.guardarMenu(menuDeLaSemana(perfil, medidas.at(-1)!, repo.usuario, String(Date.now())));
    refrescar();
    return { ok: true, mensaje: "Menú nuevo listo ✓" };
  } catch (e) {
    return error(e);
  }
}

export async function guardarMedida(f: FormData): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    await repo.guardarMedida(leerMedida(f));
    refrescar();
    return { ok: true, mensaje: "Medidas guardadas ✓ Mira cómo cambió tu personaje." };
  } catch (e) {
    return error(e);
  }
}

export async function borrarMedida(id: string): Promise<Resultado> {
  try {
    await (await obtenerRepo()).borrarMedida(id);
    refrescar();
    return { ok: true, mensaje: "Medida borrada." };
  } catch (e) {
    return error(e);
  }
}

// Guarda las series de un ejercicio de hoy (reemplaza lo que ya habías guardado hoy de ese ejercicio)
export async function guardarEjercicio(f: FormData): Promise<Resultado> {
  try {
    const repo = await obtenerRepo();
    const ejercicio = texto(f, "ejercicio");
    const dia = numero(f, "dia") ?? 0;
    const plan = await repo.planActivo();
    const pesos = f.getAll("peso").map((v) => Number(String(v).replace(",", ".") || 0));
    const reps = f.getAll("reps").map((v) => Number(String(v) || 0));
    const rirs = f.getAll("rir").map((v) => (String(v) === "" ? null : Number(v)));
    const dolor = f.get("dolor") === "on";
    const hoy = hoyLocal();
    const series = reps
      .map((r, i) => ({ fecha: hoy, plan_id: plan?.id ?? null, dia, ejercicio, serie: i + 1, peso_kg: Math.max(0, pesos[i] || 0), reps: Math.round(r), rir: rirs[i] ?? null, nota: dolor ? "dolor" : null }))
      .filter((s) => s.reps > 0 && !Number.isNaN(s.peso_kg));
    if (!ejercicio || !series.length) return { ok: false, mensaje: "Escribe las repeticiones de al menos una serie." };
    await repo.borrarSeries(hoy, ejercicio);
    await repo.guardarSeries(series);
    if (dolor) {
      const perfil = await repo.perfil();
      if (perfil) await repo.guardarPerfil({ ...perfil, pausa_hasta: sumarDias(hoy, 7) });
      await repo
        .guardarAjustes([{ fecha: hoy, tipo: "salud", detalle: "Pausa de aumentos de peso por 7 días", motivo: `Marcaste dolor agudo o mareo en ${ejercicioPorId(ejercicio)?.nombre ?? ejercicio}.` }])
        .catch(() => {});
      refrescar();
      return { ok: true, mensaje: "Guardado. ⚠️ Pausé los aumentos de peso 7 días. Si el dolor o el mareo siguen, consulta a un médico." };
    }
    refrescar();
    return { ok: true, mensaje: `Guardado ✓ ${series.length} ${series.length === 1 ? "serie" : "series"}.` };
  } catch (e) {
    return error(e);
  }
}

// Registro semanal: guarda cómo te fue, corre las reglas y aplica los ajustes
export async function guardarRegistro(f: FormData): Promise<Resultado> {
  let destino = "/progreso";
  try {
    const repo = await obtenerRepo();
    const perfil = await repo.perfil();
    if (!perfil) return { ok: false, mensaje: "Primero llena tu perfil." };
    const m = leerMedida(f);
    const escala = (c: string, def: number) => Math.min(10, Math.max(1, Math.round(numero(f, c) ?? def)));
    const registro = {
      fecha: m.fecha,
      peso_kg: m.peso_kg,
      cintura_cm: m.cintura_cm,
      cadera_cm: m.cadera_cm,
      brazo_cm: m.brazo_cm,
      adherencia: Math.min(100, Math.max(0, Math.round(numero(f, "adherencia") ?? 80))),
      energia: escala("energia", 7),
      sueno: escala("sueno", 7),
      hambre: escala("hambre", 5),
      notas: texto(f, "notas").slice(0, 500) || null,
    };
    await repo.guardarRegistro(registro);
    // También cuenta como medida (para el personaje), conservando las medidas que no se pidieron esta vez
    const previa = (await repo.medidas()).at(-1);
    await repo.guardarMedida({ ...m, pecho_cm: m.pecho_cm ?? previa?.pecho_cm ?? null, muslo_cm: m.muslo_cm ?? previa?.muslo_cm ?? null, cuello_cm: m.cuello_cm ?? previa?.cuello_cm ?? null });

    const [registros, plan, series] = await Promise.all([repo.registros(), repo.planActivo(), repo.series({ desde: sumarDias(m.fecha, -90) })]);
    const ev = evaluarSemana(perfil, registros, plan, series, hoyLocal());
    const nuevo = { ...perfil, ...ev.perfil };
    if (Object.keys(ev.perfil).length) await repo.guardarPerfil(nuevo);
    if (plan && ev.cambios.length) await repo.crearPlan(planConCambios(plan, ev.cambios), plan.notas);
    await repo.guardarAjustes(ev.ajustes.map((a) => ({ ...a, fecha: m.fecha })));
    if (ev.perfil.ajuste_kcal !== undefined) await rehacerMenu(repo, nuevo, `ajuste-${m.fecha}`);
    refrescar();
    destino = `/registro/listo?n=${ev.ajustes.length}&c=${encodeURIComponent(JSON.stringify(ev.consejos))}`;
  } catch (e) {
    return error(e);
  }
  redirect(destino);
}
