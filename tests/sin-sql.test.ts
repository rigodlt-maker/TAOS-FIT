// Antes de correr el SQL 0003 la app no debe romperse: lee lo que hay, guarda lo que puede y avisa.
import assert from "node:assert/strict";
import { test } from "node:test";
import { FALTA_SQL } from "../lib/datos/repo";
import { faltaEsquema, repoSupabase } from "../lib/datos/supabase";
import { PERFIL_BASE } from "../lib/perfil";

// Imita la base vieja: sin columna "datos", sin tablas nuevas y solo géneros hombre/mujer
function baseVieja() {
  const guardado: Record<string, unknown>[] = [];
  const respuesta = (tabla: string, op: string, fila?: Record<string, unknown>) => {
    if (["fit_checkins", "fit_adjustments", "fit_meal_plans"].includes(tabla)) return { data: null, error: { code: "PGRST205", message: `Could not find the table 'public.${tabla}' in the schema cache` } };
    if (tabla === "fit_profiles" && op === "select-datos") return { data: null, error: { code: "42703", message: "column fit_profiles.datos does not exist" } };
    if (tabla === "fit_profiles" && op === "upsert") {
      if (fila && "datos" in fila) return { data: null, error: { code: "PGRST204", message: "Could not find the 'datos' column of 'fit_profiles' in the schema cache" } };
      if (fila && !["hombre", "mujer"].includes(String(fila.genero))) return { data: null, error: { code: "23514", message: "violates check constraint" } };
      guardado.push(fila!);
    }
    return { data: op === "select" ? [] : null, error: null };
  };
  const cadena = (tabla: string, op: string, fila?: Record<string, unknown>): unknown => {
    const r = respuesta(tabla, op, fila);
    const obj: Record<string, unknown> = {};
    for (const m of ["eq", "order", "limit", "gte", "select", "single", "maybeSingle"]) obj[m] = () => obj;
    obj.then = (ok: (v: unknown) => unknown) => ok(r);
    return obj;
  };
  const db = {
    from: (tabla: string) => ({
      select: (cols = "*") => cadena(tabla, cols === "datos" ? "select-datos" : "select"),
      upsert: (fila: Record<string, unknown>) => cadena(tabla, "upsert", fila),
      insert: () => cadena(tabla, "insert"),
      update: () => cadena(tabla, "update"),
      delete: () => cadena(tabla, "delete"),
    }),
  };
  return { db, guardado };
}

test("con la base vieja: avisa, lee vacío y guarda el perfil sin los datos nuevos", async () => {
  const { db, guardado } = baseVieja();
  const repo = repoSupabase(db as never, "u1");
  assert.equal(await repo.esquemaPendiente(), true);
  assert.deepEqual(await repo.registros(), []);
  assert.deepEqual(await repo.ajustes(), []);
  assert.equal(await repo.menuActivo(), null);
  const r = await repo.guardarPerfil({ ...PERFIL_BASE, nombre: "Sam", genero: "no_binario", cuerpo: "femenino" });
  assert.equal(r.completo, false);
  assert.equal(guardado[0].genero, "mujer");
  assert.ok(!("datos" in guardado[0]));
  await assert.rejects(repo.guardarRegistro({ fecha: "2026-10-28", peso_kg: 80, cintura_cm: null, cadera_cm: null, brazo_cm: null, adherencia: 80, energia: 7, sueno: 7, hambre: 5, notas: null }), { message: FALTA_SQL });
  assert.ok(faltaEsquema({ code: "42P01", message: 'relation "x" does not exist' }));
  assert.ok(!faltaEsquema({ code: "23505", message: "duplicate key" }));
});
