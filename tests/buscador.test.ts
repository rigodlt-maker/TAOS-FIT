// Buscador 🔍: lo que escribe la gente → la pantalla correcta
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { buscarDestinos } from "../components/taos/buscador";
import { DESTINOS } from "../lib/destinos";

const primero = (q: string) => buscarDestinos(q, DESTINOS)[0]?.ruta;

test("lleva a la pantalla correcta (también mal escrito)", () => {
  assert.equal(primero("menú"), "/comida");
  assert.equal(primero("lista del super"), "/comida/lista");
  assert.equal(primero("medidas"), "/cuerpo");
  assert.equal(primero("medalas"), "/medallas");
  assert.equal(primero("aparato ocupado"), "/rutina");
  assert.equal(primero("notificaciones"), "/mas#avisos");
  assert.deepEqual(buscarDestinos("zzzz", DESTINOS), []);
});

test("cada pantalla existe y no se repite", () => {
  const rutas = DESTINOS.map((d) => d.ruta);
  assert.equal(new Set(rutas).size, rutas.length);
  for (const r of rutas) assert.ok(existsSync(`app/(app)${r.split("#")[0] === "/" ? "" : r.split("#")[0]}/page.tsx`), r);
});
