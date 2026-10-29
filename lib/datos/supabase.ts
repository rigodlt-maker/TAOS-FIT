import type { SupabaseClient } from "@supabase/supabase-js";
import type { Menu } from "../menu";
import { completarPerfil, separarPerfil } from "../perfil";
import type { Ajuste, Medida, Plan, Registro, Serie, SuscripcionPush } from "../tipos";
import { FALTA_SQL, type MenuGuardado, type Repo } from "./repo";

// Nombre de esta app en la tabla compartida de notificaciones push
const APP_PUSH = "fit";

type Error = { message: string; code?: string } | null;

// Postgres devuelve los "numeric" como texto: siempre se convierten
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

// La tabla o columna todavía no existe (falta correr el SQL de la actualización)
export const faltaEsquema = (e: Error) => !!e && (["42P01", "42703", "PGRST204", "PGRST205"].includes(e.code ?? "") || /does not exist|could not find the|schema cache/i.test(e.message));

function revisar<T>(r: { data: T | null; error: Error }): T {
  if (r.error) throw new Error(faltaEsquema(r.error) ? FALTA_SQL : `Error de base de datos: ${r.error.message}`);
  return r.data as T;
}
// Para lecturas de tablas nuevas: si no existen todavía, se responde vacío
function opcional<T>(r: { data: T | null; error: Error }, vacio: T): T {
  if (r.error && faltaEsquema(r.error)) return vacio;
  return revisar(r) ?? vacio;
}

// Funciona con la sesión del usuario (RLS) o con la llave secreta en los crons; por eso siempre filtra por user_id
export function repoSupabase(db: SupabaseClient, uid: string): Repo {
  const de = (tabla: string, columnas = "*") => db.from(tabla).select(columnas).eq("user_id", uid);
  const medida = (r: Record<string, unknown>): Medida => ({
    id: String(r.id),
    fecha: String(r.fecha),
    peso_kg: Number(r.peso_kg),
    cintura_cm: num(r.cintura_cm),
    cadera_cm: num(r.cadera_cm),
    pecho_cm: num(r.pecho_cm),
    brazo_cm: num(r.brazo_cm),
    muslo_cm: num(r.muslo_cm),
    cuello_cm: num(r.cuello_cm),
  });

  return {
    modo: "supabase",
    usuario: uid,

    async esquemaPendiente() {
      const [a, b] = await Promise.all([db.from("fit_profiles").select("datos").limit(1), db.from("fit_checkins").select("id").limit(1)]);
      return faltaEsquema(a.error) || faltaEsquema(b.error);
    },

    async perfil() {
      const fila = revisar(await de("fit_profiles").maybeSingle()) as Record<string, unknown> | null;
      return fila ? completarPerfil(fila) : null;
    },
    async guardarPerfil(p) {
      const { columnas, datos } = separarPerfil(p);
      const r = await db.from("fit_profiles").upsert({ ...columnas, datos, user_id: uid, updated_at: new Date().toISOString() });
      if (!r.error) return { completo: true };
      if (!faltaEsquema(r.error) && r.error.code !== "23514") revisar(r);
      // Sin el SQL nuevo: se guarda lo que la tabla vieja acepta (género hombre/mujer según tu cuerpo)
      revisar(await db.from("fit_profiles").upsert({ ...columnas, genero: p.cuerpo === "femenino" ? "mujer" : "hombre", user_id: uid, updated_at: new Date().toISOString() }));
      return { completo: false };
    },

    async medidas() {
      return (revisar(await de("fit_measurements").order("fecha").order("created_at")) as unknown as Record<string, unknown>[]).map(medida);
    },
    async guardarMedida(m) {
      // Una medida por día: si ya hay una de esa fecha, se reemplaza
      revisar(await db.from("fit_measurements").delete().eq("user_id", uid).eq("fecha", m.fecha));
      revisar(await db.from("fit_measurements").insert({ ...m, user_id: uid }));
    },
    async borrarMedida(id) {
      revisar(await db.from("fit_measurements").delete().eq("id", id).eq("user_id", uid));
    },

    async planActivo() {
      const fila = revisar(await de("fit_plans").eq("activo", true).order("creado", { ascending: false }).limit(1).maybeSingle()) as Record<string, unknown> | null;
      return fila ? ({ id: fila.id, creado: fila.creado, activo: true, dias: fila.dias, notas: fila.notas } as Plan) : null;
    },
    async crearPlan(dias, notas) {
      revisar(await db.from("fit_plans").update({ activo: false }).eq("user_id", uid).eq("activo", true));
      const fila = revisar(await db.from("fit_plans").insert({ user_id: uid, dias, notas, activo: true }).select("id").single()) as { id: string };
      return fila.id;
    },

    async series(filtro = {}) {
      let q = de("fit_sets");
      if (filtro.ejercicio) q = q.eq("ejercicio", filtro.ejercicio);
      if (filtro.desde) q = q.gte("fecha", filtro.desde);
      return (revisar(await q.order("fecha").order("serie").limit(5000)) as unknown as Record<string, unknown>[]).map((r) => ({
        ...(r as unknown as Serie),
        peso_kg: Number(r.peso_kg),
        rir: r.rir == null ? null : Number(r.rir),
        nota: (r.nota as string | null) ?? null,
      }));
    },
    async guardarSeries(s) {
      if (!s.length) return;
      const r = await db.from("fit_sets").insert(s.map((x) => ({ ...x, user_id: uid })));
      if (r.error && faltaEsquema(r.error)) revisar(await db.from("fit_sets").insert(s.map(({ rir: _, nota: __, ...x }) => ({ ...x, user_id: uid }))));
      else revisar(r);
    },
    async borrarSeries(fecha, ejercicio) {
      revisar(await db.from("fit_sets").delete().eq("user_id", uid).eq("fecha", fecha).eq("ejercicio", ejercicio));
    },

    async registros() {
      return (opcional(await de("fit_checkins").order("fecha"), []) as unknown as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        fecha: String(r.fecha),
        peso_kg: Number(r.peso_kg),
        cintura_cm: num(r.cintura_cm),
        cadera_cm: num(r.cadera_cm),
        brazo_cm: num(r.brazo_cm),
        adherencia: Number(r.adherencia),
        energia: Number(r.energia),
        sueno: Number(r.sueno),
        hambre: Number(r.hambre),
        notas: (r.notas as string | null) ?? null,
      }));
    },
    async guardarRegistro(reg) {
      // Uno por día: si lo repites el mismo día, se reemplaza
      revisar(await db.from("fit_checkins").delete().eq("user_id", uid).eq("fecha", reg.fecha));
      revisar(await db.from("fit_checkins").insert({ ...reg, user_id: uid }));
    },

    async ajustes(limite = 50) {
      return opcional(await de("fit_adjustments", "id, fecha, tipo, detalle, motivo").order("created_at", { ascending: false }).limit(limite), []) as unknown as Ajuste[];
    },
    async guardarAjustes(a) {
      if (a.length) revisar(await db.from("fit_adjustments").insert(a.map((x) => ({ ...x, user_id: uid }))));
    },

    async menuActivo() {
      const r = await de("fit_meal_plans").eq("activo", true).order("creado", { ascending: false }).limit(1).maybeSingle();
      const m = opcional(r, null) as Record<string, unknown> | null;
      return m ? ({ ...(m.menu as Menu), id: String(m.id), creado: String(m.creado) } as MenuGuardado) : null;
    },
    async guardarMenu(menu) {
      revisar(await db.from("fit_meal_plans").update({ activo: false }).eq("user_id", uid).eq("activo", true));
      const fila = revisar(await db.from("fit_meal_plans").insert({ user_id: uid, menu, activo: true }).select("id").single()) as { id: string };
      return fila.id;
    },

    async suscripcionesPush() {
      return revisar(await de("push_subscriptions").eq("app", APP_PUSH).order("created_at")) as unknown as SuscripcionPush[];
    },
    async guardarSuscripcionPush(s) {
      // Si el mismo celular se vuelve a suscribir, se actualizan sus llaves
      revisar(await db.from("push_subscriptions").upsert({ ...s, user_id: uid, app: APP_PUSH }, { onConflict: "endpoint" }));
    },
    async borrarSuscripcionPush(endpoint) {
      revisar(await db.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", uid));
    },
  };
}
