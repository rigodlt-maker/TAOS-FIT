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

test("en casa nunca propone lo que necesita algo especial y cambia pierna por pierna, espalda por espalda", () => {
  for (const lesiones of [[], ["espalda_baja"], ["rodilla"]] as Perfil["lesiones"][]) {
    for (const objetivo of ["fuerza", "hipertrofia", "grasa"] as const) {
      const p = { ...gym, lesiones, objetivo };
      for (const dia of generarPlan(p).dias) {
        const { cambios } = aCasa(dia.ejercicios.map((e) => e.ejercicio), p);
        for (const [viejo, nuevo] of cambios) {
          const a = EJERCICIOS.find((x) => x.id === viejo)!;
          const b = EJERCICIOS.find((x) => x.id === nuevo)!;
          assert.ok(!b.requiere, `${b.nombre} necesita ${b.requiere}`);
          const pierna = (z: string) => z === "piernas" || z === "gluteo";
          // Pierna/glúteo se cambia por pierna/glúteo; lo de arriba, por algo de arriba
          assert.equal(pierna(b.zonas[0]), pierna(a.zonas[0]), `${a.nombre} → ${b.nombre}`);
        }
      }
    }
  }
});

