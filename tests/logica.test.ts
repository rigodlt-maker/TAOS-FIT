// Lógica de Tao Fit: rutinas, progresión, composición corporal y avatar (datos inventados)
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { figura } from "../lib/avatar";
import { composicion, edad } from "../lib/composicion";
import { EJERCICIOS, ejercicioPorId } from "../lib/ejercicios";
import { equipoDisponible, generarPlan, minutosDe } from "../lib/rutina";
import { sugerir } from "../lib/progresion";
import { PERFIL_BASE } from "../lib/perfil";
import type { Medida, Perfil, Serie } from "../lib/tipos";

const base: Perfil = { ...PERFIL_BASE, nombre: "Prueba", nacimiento: "1990-01-01", altura_cm: 175, nivel: "intermedio", dias_semana: 4 };
const medida = (o: Partial<Medida> = {}): Medida => ({ id: "m", fecha: "2026-10-28", peso_kg: 75, cintura_cm: 85, cadera_cm: null, pecho_cm: 100, brazo_cm: 33, muslo_cm: null, cuello_cm: 38, ...o });

test("todos los ejercicios tienen sus 2 fotos y nombres únicos", () => {
  assert.equal(new Set(EJERCICIOS.map((e) => e.id)).size, EJERCICIOS.length);
  for (const e of EJERCICIOS) for (const n of [0, 1]) assert.ok(existsSync(`public/ejercicios/${e.id}/${n}.jpg`), `${e.id}/${n}.jpg`);
});

test("cualquier combinación genera una rutina válida", () => {
  for (const objetivo of ["hipertrofia", "fuerza", "resistencia", "grasa"] as const)
    for (const nivel of ["principiante", "intermedio", "avanzado"] as const)
      for (const lugar of ["gimnasio", "casa_mancuernas", "casa_sin_equipo"] as const)
        for (const dias_semana of [2, 3, 4, 5, 6])
          for (const minutos_sesion of [30, 60, 90]) {
            const p = { ...base, objetivo, nivel, lugar, dias_semana, minutos_sesion, lesiones: ["rodilla" as const], enfasis: ["gluteo" as const] };
            const { dias } = generarPlan(p);
            const equipo = equipoDisponible(p);
            assert.equal(dias.length, dias_semana);
            for (const d of dias) {
              assert.ok(d.ejercicios.length >= 3, `${objetivo}/${nivel}/${lugar}/${dias_semana}: ${d.nombre} tiene ${d.ejercicios.length}`);
              assert.equal(new Set(d.ejercicios.map((e) => e.ejercicio)).size, d.ejercicios.length, "sin repetidos en el día");
              for (const e of d.ejercicios) {
                const ej = ejercicioPorId(e.ejercicio)!;
                assert.ok(equipo.has(ej.equipo), `${ej.id} no se puede hacer en ${lugar}`);
                assert.ok(!ej.evitar?.includes("rodilla"), `${ej.id} molesta la rodilla`);
                assert.ok(e.reps_min <= e.reps_max && e.series >= 2);
              }
              if (d.ejercicios.length > 3) assert.ok(d.ejercicios.reduce((s, e) => s + minutosDe(e), 0) <= Math.max(20, minutos_sesion - 8 - (d.cardio_min ?? 0)) + 0.01);
            }
          }
});

test("la rutina cambia según la persona y el objetivo", () => {
  const a = generarPlan(base, 0, "persona-a").dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicio)).join();
  const b = generarPlan(base, 0, "persona-b").dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicio)).join();
  const a2 = generarPlan(base, 1, "persona-a").dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicio)).join();
  assert.notEqual(a, b);
  assert.notEqual(a, a2, "cambiar ejercicios da otra combinación");
  assert.equal(a, generarPlan(base, 0, "persona-a").dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicio)).join(), "es estable");
  const fuerza = generarPlan({ ...base, objetivo: "fuerza" }).dias[0].ejercicios[0];
  assert.equal(fuerza.reps_max, 5);
  assert.ok(fuerza.descanso_seg >= 180);
  assert.ok(generarPlan({ ...base, objetivo: "grasa" }).dias[0].cardio_min! > 0);
  const casa = generarPlan({ ...base, lugar: "casa_sin_equipo" }).dias.flatMap((d) => d.ejercicios.map((e) => ejercicioPorId(e.ejercicio)!.equipo));
  assert.ok(casa.every((e) => e === "corporal"));
});

const serie = (fecha: string, n: number, peso: number, reps: number): Serie => ({ id: `${fecha}-${n}`, fecha, plan_id: null, dia: 0, ejercicio: "Barbell_Squat", serie: n, peso_kg: peso, reps, rir: null, nota: null });
const plan = { ejercicio: "Barbell_Squat", series: 3, reps_min: 6, reps_max: 10, descanso_seg: 120 };

test("progresión: sube, mantiene, baja y detecta estancamiento", () => {
  assert.equal(sugerir(plan, []).tipo, "nuevo");
  const subir = sugerir(plan, [1, 2, 3].map((n) => serie("2026-10-20", n, 60, 10)));
  assert.equal(subir.tipo, "subir");
  assert.equal(subir.peso, 65);
  const mantener = sugerir(plan, [serie("2026-10-20", 1, 60, 10), serie("2026-10-20", 2, 60, 8), serie("2026-10-20", 3, 60, 7)]);
  assert.equal(mantener.tipo, "mantener");
  assert.equal(mantener.peso, 60);
  const bajar = sugerir(plan, [...[1, 2, 3].map((n) => serie("2026-10-20", n, 80, n === 3 ? 4 : 6)), ...[1, 2, 3].map((n) => serie("2026-10-23", n, 80, n === 3 ? 5 : 6))]);
  assert.equal(bajar.tipo, "bajar");
  assert.equal(bajar.peso, 70);
  const fechas = ["2026-10-01", "2026-10-04", "2026-10-07", "2026-10-10"];
  const estancado = sugerir(plan, fechas.flatMap((f, i) => [1, 2, 3].map((n) => serie(f, n, 60, i === 0 ? 9 : 8))));
  assert.equal(estancado.tipo, "estancado");
});

test("composición corporal con la fórmula de la Marina", () => {
  assert.equal(edad("1990-11-05", "2026-10-28"), 35);
  const c = composicion(base, medida());
  assert.equal(c.metodoGrasa, "medidas");
  assert.ok(c.grasa > 15 && c.grasa < 19, `grasa ${c.grasa}`);
  assert.equal(composicion(base, medida({ cintura_cm: null })).metodoGrasa, "estimado");
});

test("el avatar se ensancha de cintura al subir la medida", () => {
  const ancho = (d: string) => {
    const xs = [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    return Math.max(...xs) - Math.min(...xs);
  };
  const flaco = figura(base, medida({ cintura_cm: 75, peso_kg: 68 }));
  const ancho2 = figura(base, medida({ cintura_cm: 110, peso_kg: 100 }));
  assert.ok(ancho(ancho2.silueta) > ancho(flaco.silueta));
  assert.ok(flaco.definicion > ancho2.definicion, "con menos grasa se marcan más los músculos");
});
