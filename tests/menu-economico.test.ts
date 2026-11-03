import { test } from "node:test";
import assert from "node:assert/strict";
import { ALIMENTOS } from "../lib/alimentos";
import { menuDeLaSemana } from "../lib/menu";
import { PERFIL_BASE } from "../lib/perfil";
import { costoSemana, factorEconomico, PRECIO_KG } from "../lib/precios";
import type { Perfil } from "../lib/tipos";

const p: Perfil = { ...PERFIL_BASE, nombre: "Prueba", nacimiento: "1990-01-01", altura_cm: 175, dias_semana: 4 };

test("todos los alimentos tienen precio de referencia", () => {
  for (const a of ALIMENTOS) assert.ok(PRECIO_KG[a.id] > 0, `falta precio de ${a.id}`);
});

test("el menú económico prefiere lo que rinde (huevo antes que salmón)", () => {
  const al = (id: string) => ALIMENTOS.find((x) => x.id === id)!;
  assert.ok(factorEconomico(al("huevo")) > factorEconomico(al("salmon")));
  assert.ok(factorEconomico(al("frijoles")) > factorEconomico(al("quinoa")));
});

test("el menú económico sale más barato que el normal en varias semanas", () => {
  let normal = 0;
  let economico = 0;
  for (let i = 0; i < 6; i++) {
    normal += costoSemana(menuDeLaSemana(p, { peso_kg: 80 }, "u", `v${i}`));
    economico += costoSemana(menuDeLaSemana({ ...p, menu_economico: true }, { peso_kg: 80 }, "u", `v${i}`));
  }
  assert.ok(economico < normal * 0.9, `económico ${economico} vs normal ${normal}`);
});
