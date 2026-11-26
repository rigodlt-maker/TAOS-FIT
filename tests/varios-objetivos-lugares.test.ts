// 1.4.0 · Feedback de piloto: varios objetivos, lugar por día con su equipo y clases fijas (se registran, no se arman)
import assert from "node:assert/strict";
import { test } from "node:test";
import { EJERCICIOS } from "../lib/ejercicios";
import { entrenosSemana } from "../lib/entreno";
import { calcularObjetivos } from "../lib/nutricion";
import { cardioDe, clasesDelDia, lugarBase, lugarDelDia, objetivoNutricion, objetivoPara, objetivosDe, resumenLugares } from "../lib/objetivos";
import { PERFIL_BASE, completarPerfil, leerClases, leerLugarPorDia, separarPerfil } from "../lib/perfil";
import { aCasa, equipoDisponible, generarPlan } from "../lib/rutina";
import type { Perfil } from "../lib/tipos";

// Perfil parecido al de la piloto: mujer, 54 kg con meta 56 kg, músculo + fuerza + resistencia, gym y casa
const piloto: Perfil = {
  ...PERFIL_BASE,
  nombre: "Piloto",
  genero: "mujer",
  cuerpo: "femenino",
  nacimiento: "1965-05-10",
  altura_cm: 160,
  objetivo: "hipertrofia",
  objetivos: ["hipertrofia", "fuerza", "resistencia"],
  nivel: "intermedio",
  dias_semana: 4,
  dias_entreno: [1, 2, 4, 5],
  lugar: "gimnasio",
  lugar_por_dia: { 1: "gimnasio", 2: "casa_mancuernas", 4: "gimnasio", 5: "casa_mancuernas" },
  clases: [{ id: "c1", tipo: "pilates", dia: 3, hora: "19:00", minutos: 60 }],
  meta_peso_kg: 56,
};

test("1.4.0: un perfil anterior (sin datos nuevos) queda igual: un objetivo, un lugar, sin clases", () => {
  const p = completarPerfil({ nombre: "Ana", objetivo: "fuerza", lugar: "casa_mancuernas", datos: {} });
  assert.deepEqual(p.objetivos, ["fuerza"]);
  assert.equal(p.objetivo, "fuerza");
  assert.deepEqual(p.lugar_por_dia, {});
  assert.deepEqual(p.clases, []);
  assert.deepEqual(p.clases_hechas, []);
  assert.equal(lugarDelDia(p, "2026-11-25"), "casa_mancuernas");
});

test("1.4.0: los datos nuevos se guardan en «datos» (sin SQL) y se leen igual; lo raro se ignora", () => {
  const { columnas, datos } = separarPerfil(piloto);
  assert.equal(columnas.objetivo, "hipertrofia"); // la columna de siempre guarda el principal
  assert.deepEqual(datos.objetivos, ["hipertrofia", "fuerza", "resistencia"]);
  const otra = completarPerfil({ ...columnas, datos });
  assert.deepEqual(otra.objetivos, piloto.objetivos);
  assert.deepEqual(otra.lugar_por_dia, piloto.lugar_por_dia);
  assert.deepEqual(otra.clases, piloto.clases);
  assert.deepEqual(leerLugarPorDia({ 1: "gimnasio", 9: "gimnasio", 2: "luna" }), { 1: "gimnasio" });
  assert.deepEqual(leerClases([{ tipo: "yoga", dia: 7 }, { tipo: "rara", dia: 2, hora: "7pm", minutos: 999 }]).map((c) => [c.tipo, c.dia, c.hora, c.minutos]), [["otra", 2, null, 180]]);
  assert.deepEqual(completarPerfil({ objetivo: "fuerza", datos: { objetivos: ["inventado"] } }).objetivos, ["fuerza"]);
});

test("1.4.0: calorías con varios objetivos — «bajar grasa» manda déficit; músculo o fuerza, superávit", () => {
  assert.equal(objetivoNutricion(piloto), "hipertrofia");
  assert.equal(objetivoNutricion({ objetivo: "resistencia", objetivos: ["resistencia", "grasa"] }), "grasa");
  assert.equal(objetivoNutricion({ objetivo: "resistencia", objetivos: ["resistencia"] }), "resistencia");
  const conVarios = calcularObjetivos(piloto, { peso_kg: 54 }, "2026-11-25");
  const soloMusculo = calcularObjetivos({ ...piloto, objetivos: ["hipertrofia"] }, { peso_kg: 54 }, "2026-11-25");
  assert.equal(conVarios.kcal, soloMusculo.kcal); // superávit pequeño: va de 54 a 56 kg
  const mantener = calcularObjetivos({ ...piloto, objetivo: "resistencia", objetivos: ["resistencia"] }, { peso_kg: 54 }, "2026-11-25");
  assert.ok(conVarios.kcal > mantener.kcal);
});

test("1.4.0: la rutina combina los objetivos: el primero con series de fuerza, los demás de músculo y cardio al final", () => {
  const compuesto = { compuesto: true };
  const aislado = { compuesto: false };
  assert.equal(objetivoPara(compuesto, 0, piloto), "fuerza");
  assert.equal(objetivoPara(compuesto, 1, piloto), "hipertrofia");
  assert.equal(objetivoPara(compuesto, 3, piloto), "hipertrofia");
  assert.equal(objetivoPara(aislado, 0, piloto), "hipertrofia");
  assert.equal(cardioDe(piloto), 10);
  const plan = generarPlan(piloto);
  for (const d of plan.dias) {
    assert.ok(d.ejercicios.length >= 3, `${d.nombre}: ${d.ejercicios.length} ejercicios`);
    assert.equal(d.cardio_min, 10);
  }
  // Algún ejercicio con 3 a 5 repeticiones (fuerza) y otros con 6 o más (músculo)
  assert.ok(plan.dias.some((d) => d.ejercicios.some((e) => e.reps_max <= 5)));
  assert.ok(plan.dias.every((d) => d.ejercicios.slice(1).every((e) => e.reps_min >= 6)));
  assert.ok(plan.notas.some((n) => /Combinas 3 objetivos/.test(n)));
  // Un solo objetivo: igual que antes
  assert.deepEqual(objetivosDe({ objetivo: "grasa", objetivos: [] }), ["grasa"]);
  assert.deepEqual(objetivosDe({ objetivo: "grasa", objetivos: ["hipertrofia"] }), ["grasa"]); // manda el principal
});

test("1.4.0: lugar por día — la rutina se arma para el gym y los días en casa usan solo el equipo de casa", () => {
  assert.equal(lugarBase(["casa_mancuernas", "gimnasio"], "casa_sin_equipo"), "gimnasio");
  assert.equal(lugarDelDia(piloto, "2026-11-23"), "gimnasio"); // lunes
  assert.equal(lugarDelDia(piloto, "2026-11-24"), "casa_mancuernas"); // martes
  assert.equal(lugarDelDia(piloto, "2026-11-25"), "gimnasio"); // miércoles sin lugar propio → el principal
  const equipoCasa = equipoDisponible({ lugar: "casa_mancuernas", barra_dominadas: false });
  const plan = generarPlan(piloto);
  for (const d of plan.dias) {
    const ids = d.ejercicios.map((e) => e.ejercicio);
    const { cambios, sinEquivalente } = aCasa(ids, piloto, "casa_mancuernas");
    for (const id of ids) {
      if (sinEquivalente.includes(id)) continue;
      const final = EJERCICIOS.find((x) => x.id === (cambios.get(id) ?? id))!;
      assert.ok(equipoCasa.has(final.equipo), `${final.id} (${final.equipo}) no se puede hacer en casa con pesas`);
    }
  }
  assert.equal(resumenLugares(piloto), "Gimnasio (Lun, Jue) · Casa con mancuernas (Mar, Vie)");
});

test("1.4.0: clases fijas — se ven el día que tocan y, al marcarlas, cuentan en tu semana", () => {
  assert.deepEqual(clasesDelDia(piloto, "2026-11-25").map((c) => c.tipo), ["pilates"]); // miércoles
  assert.deepEqual(clasesDelDia(piloto, "2026-11-24"), []);
  assert.equal(entrenosSemana([], "2026-11-25", ["2026-11-25", "2026-11-10"]), 1);
  assert.equal(entrenosSemana([{ fecha: "2026-11-25" } as never], "2026-11-25", ["2026-11-25"]), 1); // mismo día no cuenta doble
});

test("1.4.0 (arreglos): el buscador lleva a objetivos, días y lugares, y clases fijas", async () => {
  const { buscarDestinos } = await import("../components/taos/buscador");
  const { DESTINOS } = await import("../lib/destinos");
  const primero = (q: string) => buscarDestinos(q, DESTINOS)[0]?.ruta;
  assert.equal(primero("pilates"), "/perfil#clases");
  assert.equal(primero("mis clases"), "/perfil#clases");
  assert.equal(primero("donde entreno"), "/perfil#dias");
  assert.equal(primero("objetivos"), "/perfil#meta");
});
