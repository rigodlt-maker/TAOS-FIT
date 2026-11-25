// 1.3.1 · Feedback de piloto: las exclusiones son filtros DUROS. Nada de lo que excluyes (grupo o alimento suelto) puede
// salir en el menú de la semana, en «Cambiar», en el menú económico ni en la lista del súper.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ALIMENTOS, ALIMENTOS_VISIBLES, EXCLUSIONES, EXCLUSIONES_VISIBLES, alimentoPorId, excluidosParaMostrar, permitido } from "../lib/alimentos";
import { generarMenu, listaDeCompras, reemplazos } from "../lib/menu";

const METAS = [1300, 1700, 2100, 2600, 3200].map((kcal) => ({ kcal, proteina: Math.round(kcal / 18), grasa: Math.round(kcal / 36), carbos: Math.round(kcal / 9) }));

function revisar(excluidos: string[], semilla: string, economico = false) {
  for (const m of METAS) {
    const menu = generarMenu(m as never, { habituales: ["almendras", "nueces", "camaron", "platano", "ensalada"], excluidos, veces_cocina: 3 + (semilla.length % 5), economico }, semilla);
    for (const d of menu.dias)
      for (const c of d.comidas)
        for (const it of c.items) {
          const al = alimentoPorId(it.alimento)!;
          assert.ok(permitido(al, excluidos), `${al.id} salió con ${excluidos.join(",")}`);
          assert.ok(!al.oculto, `${al.id} ya no debe salir en menús nuevos`);
          for (const r of reemplazos(it, c.tipo, excluidos)) assert.ok(permitido(alimentoPorId(r.alimento)!, excluidos), `«Cambiar» ofreció ${r.alimento}`);
        }
    for (const s of listaDeCompras(menu)) for (const x of s.cosas) assert.ok(permitido(x.alimento, excluidos), `súper: ${x.alimento.id}`);
  }
}

test("1.3.1: «Sin frutos secos ni semillas» quita nuez, almendra, cacahuate y crema de cacahuate de todo", () => {
  const ex = EXCLUSIONES.find((e) => e.id === "frutos_secos")!;
  for (const id of ["almendras", "nueces", "cacahuates", "crema_cacahuate"]) assert.equal(permitido(alimentoPorId(id)!, ["frutos_secos"]), false, id);
  assert.ok(ex && !ex.oculta);
  for (let i = 0; i < 40; i++) {
    revisar(["frutos_secos"], `fs-${i}`);
    revisar(["frutos_secos"], `fs-eco-${i}`, true);
  }
});

test("1.3.1: cada exclusión visible, sola y combinada, es un filtro duro (miles de menús)", () => {
  const ids = EXCLUSIONES_VISIBLES.map((e) => e.id);
  for (const id of ids) for (let i = 0; i < 12; i++) revisar([id], `${id}-${i}`, i % 2 === 0);
  for (let i = 0; i < 60; i++) {
    const elegidas = ids.filter((_, k) => (i * 7 + k * 3) % 4 === 0);
    revisar(elegidas, `combo-${i}`, i % 3 === 0);
  }
});

test("1.3.1: un alimento suelto excluido (aunque sea habitual) nunca sale, tampoco como fruta extra", () => {
  for (const id of ["almendras", "platano", "pollo", "lechuga", "jitomate"].filter((x) => alimentoPorId(x))) for (let i = 0; i < 15; i++) revisar([id], `${id}-${i}`);
  // Sin plátano y con metas altas: la fruta extra que cuadra el día debe ser otra
  revisar(["platano"], "sin-platano-alto");
});

test("1.3.1: «Sin pescado» y «Sin mariscos» por separado; quien tenía «Sin pescado ni mariscos» sigue sin los dos", () => {
  const camaron = ALIMENTOS.find((a) => a.etiquetas?.includes("mariscos"))!;
  const pescado = ALIMENTOS.find((a) => a.etiquetas?.includes("pescado"))!;
  assert.equal(permitido(pescado, ["sin_mariscos"]), true);
  assert.equal(permitido(camaron, ["sin_mariscos"]), false);
  assert.equal(permitido(pescado, ["sin_pescado"]), false);
  assert.equal(permitido(camaron, ["sin_pescado"]), true);
  // Versión anterior: «pescado» sigue quitando los dos y se muestra como las dos nuevas marcadas
  assert.equal(permitido(pescado, ["pescado"]), false);
  assert.equal(permitido(camaron, ["pescado"]), false);
  assert.deepEqual(excluidosParaMostrar(["pescado", "cerdo"]).sort(), ["cerdo", "sin_mariscos", "sin_pescado"]);
  assert.ok(!EXCLUSIONES_VISIBLES.some((e) => e.id === "pescado"));
  for (let i = 0; i < 20; i++) revisar(["pescado"], `ant-${i}`);
});

test("1.3.1: lechuga, jitomate y pepino por separado; los menús guardados con «ensalada» se siguen leyendo", () => {
  for (const id of ["lechuga", "jitomate", "pepino"]) assert.ok(ALIMENTOS_VISIBLES().some((a) => a.id === id), id);
  assert.ok(alimentoPorId("ensalada"), "los menús guardados siguen encontrando la ensalada");
  assert.ok(!ALIMENTOS_VISIBLES().some((a) => a.id === "ensalada"));
});
