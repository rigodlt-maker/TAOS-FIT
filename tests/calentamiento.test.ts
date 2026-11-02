import assert from "node:assert/strict";
import { test } from "node:test";
import { calentamiento, minutosDe } from "../lib/calentamiento";

const nombres = (l: { nombre: string }[]) => l.map((m) => m.nombre);

test("siempre hay cardio suave y movilidad, y dura entre 5 y 10 minutos", () => {
  for (const zonas of [["piernas", "gluteo"], ["pecho", "brazos"], ["espalda"], []] as const) {
    const l = calentamiento([...zonas], [], "gimnasio");
    assert.match(l[0].nombre, /Caminadora/);
    assert.ok(nombres(l).includes("Círculos de brazos"));
    assert.ok(minutosDe(l) >= 5 && minutosDe(l) <= 10, `${minutosDe(l)} min`);
  }
});

test("activa lo que toca hoy", () => {
  assert.ok(nombres(calentamiento(["piernas"], [], "gimnasio")).includes("Sentadilla libre"));
  assert.ok(nombres(calentamiento(["pecho"], [], "gimnasio")).includes("Lagartijas inclinadas"));
  assert.ok(!nombres(calentamiento(["pecho"], [], "gimnasio")).includes("Sentadilla libre"));
});

test("respeta molestias y lugar", () => {
  assert.ok(!nombres(calentamiento(["piernas"], ["rodilla"], "gimnasio")).includes("Zancadas caminando"));
  assert.ok(!nombres(calentamiento(["pecho"], ["hombro"], "gimnasio")).includes("Lagartijas inclinadas"));
  assert.ok(!nombres(calentamiento(["espalda"], ["espalda_baja"], "gimnasio")).includes("Superman"));
  assert.match(calentamiento([], [], "casa_sin_equipo")[0].nombre, /Marcha/);
});
