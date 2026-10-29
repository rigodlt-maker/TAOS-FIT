// Valida las migraciones en un Postgres embebido (PGlite) y que Row Level Security aísla a cada usuario
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const SIMULACION_SUPABASE = `
  create role authenticated nologin;
  create role service_role nologin;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
`;
const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";

test("las migraciones se aplican (dos veces) y RLS separa a los usuarios", async () => {
  const db = new PGlite();
  await db.exec(SIMULACION_SUPABASE);
  for (let vez = 0; vez < 2; vez++)
    for (const archivo of readdirSync("supabase/migrations").sort()) await db.exec(readFileSync(`supabase/migrations/${archivo}`, "utf8"));
  await db.exec(`insert into auth.users values ('${A}'), ('${B}'); grant usage on schema public, auth to authenticated; grant execute on all functions in schema auth to authenticated;`);
  const como = async (u: string, sql: string) => {
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${u}', false);`);
    try {
      return await db.query<Record<string, unknown>>(sql);
    } finally {
      await db.exec("reset role;");
    }
  };
  await como(A, `insert into fit_profiles (nombre, genero, nacimiento, altura_cm, objetivo, nivel, dias_semana, minutos_sesion, lugar) values ('A', 'hombre', '1990-01-01', 175, 'fuerza', 'intermedio', 4, 60, 'gimnasio')`);
  await como(A, `insert into fit_measurements (peso_kg, cintura_cm) values (80, 90)`);
  await como(A, `insert into fit_sets (ejercicio, serie, peso_kg, reps) values ('Barbell_Squat', 1, 60, 8)`);
  assert.equal((await como(B, `select * from fit_profiles`)).rows.length, 0);
  assert.equal((await como(B, `select * from fit_sets`)).rows.length, 0);
  assert.equal((await como(A, `select * from fit_measurements`)).rows.length, 1);
  await assert.rejects(como(B, `insert into fit_measurements (user_id, peso_kg) values ('${A}', 70)`));
  await assert.rejects(como(A, `insert into fit_profiles (nombre, genero, nacimiento, altura_cm, objetivo, nivel, dias_semana, minutos_sesion, lugar) values ('X', 'otro', '1990-01-01', 175, 'fuerza', 'intermedio', 4, 60, 'gimnasio')`));
  // Versión Coach: géneros nuevos, datos flexibles, RIR y tablas de registro, ajustes y menú
  await como(A, `update fit_profiles set genero = 'no_binario', datos = '{"cuerpo": "femenino"}'`);
  await como(A, `insert into fit_sets (ejercicio, serie, peso_kg, reps, rir, nota) values ('Barbell_Squat', 2, 60, 8, 2, 'dolor')`);
  await como(A, `insert into fit_checkins (peso_kg, adherencia, energia, sueno, hambre) values (80, 90, 7, 7, 5)`);
  await como(A, `insert into fit_adjustments (tipo, detalle, motivo) values ('calorias', '-150 kcal', 'prueba')`);
  await como(A, `insert into fit_meal_plans (menu) values ('{}')`);
  for (const t of ["fit_checkins", "fit_adjustments", "fit_meal_plans"]) {
    assert.equal((await como(A, `select * from ${t}`)).rows.length, 1);
    assert.equal((await como(B, `select * from ${t}`)).rows.length, 0, `${t} separado por usuario`);
  }
  await assert.rejects(como(A, `insert into fit_checkins (peso_kg, adherencia, energia, sueno, hambre) values (80, 120, 7, 7, 5)`));
  await assert.rejects(como(A, `update fit_profiles set genero = 'otro'`));
  await db.close();
});
