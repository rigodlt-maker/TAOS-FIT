import { test } from "node:test";
import assert from "node:assert/strict";
import { EJERCICIOS } from "../lib/ejercicios";
import { PERFIL_BASE } from "../lib/perfil";
import { aCasa, equipoDisponible, generarPlan } from "../lib/rutina";
import type { Perfil } from "../lib/tipos";

const gym: Perfil = { ...PERFIL_BASE, nombre: "Prueba", nacimiento: "1990-01-01", altura_cm: 175, nivel: "intermedio", dias_semana: 4, lugar: "gimnasio" };

test("Hoy entreno en casa: todo lo de hoy queda sin aparatos, sin repetir ejercicios", () => {
  const sinEquipo = equipoDisponible({ ...gym, lugar: "casa_sin_equipo" });
  for (const dia of generarPlan(gym).dias) {
    const ids = dia.ejercicios.map((e) => e.ejercicio);
    const { cambios, sinEquivalente } = aCasa(ids, gym);
    const hoy = ids.filter((id) => !sinEquivalente.includes(id)).map((id) => cambios.get(id) ?? id);
    for (const id of hoy) assert.ok(sinEquipo.has(EJERCICIOS.find((x) => x.id === id)!.equipo), `${dia.nombre}: ${id} necesita equipo`);
    assert.equal(new Set(hoy).size, hoy.length, `${dia.nombre}: ejercicios repetidos`);
    assert.ok(hoy.length >= ids.length / 2, `${dia.nombre}: se quedó casi vacío`);
  }
});
