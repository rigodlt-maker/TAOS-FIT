import assert from "node:assert/strict";
import test from "node:test";
import { repoMemoria } from "../lib/datos/memoria";
import { hoyLocal, sumarDias } from "../lib/entreno";
import { menuVigente } from "../lib/menu-actual";
import { buscarAlimento, buscarEjercicio, normalizar, responderTao, type DatosTao } from "../lib/tao";

async function datos(): Promise<DatosTao> {
  const repo = repoMemoria();
  const hoy = hoyLocal();
  const [perfil, medidas, plan, series, registros, ajustes] = await Promise.all([repo.perfil(), repo.medidas(), repo.planActivo(), repo.series({ desde: sumarDias(hoy, -60) }), repo.registros(), repo.ajustes(5)]);
  return { perfil: perfil!, medidas, plan, series, registros, ajustes, menu: await menuVigente(repo, perfil!, medidas.at(-1)), hoy };
}

test("Tao Fit entiende las preguntas más comunes", async () => {
  const d = await datos();
  const r = (q: string) => responderTao(q, d);
  assert.match(r("¿Qué entreno hoy?"), /Día \d/);
  assert.match(r("que me toca en el gym"), /Día \d/);
  assert.match(r("¿Qué como hoy?"), /Desayuno/);
  assert.match(r("¿qué ceno mañana?"), /Mañana[\s\S]*Cena/);
  assert.match(r("cuantas calorias me tocan"), /kcal/);
  assert.match(r("cuánta proteína debo comer"), /proteína/);
  assert.match(r("¿Cómo voy con mi peso?"), /bajaste/);
  assert.match(r("cuanto me falta para mi meta"), /meta es 76 kg/);
  assert.match(r("como se hace la sentadilla con barra"), /Sentadilla con barra/);
  assert.match(r("qué como en vez de pollo"), /En vez de/);
  assert.match(r("lista del super"), /\/comida\/lista/);
  assert.match(r("me duele la rodilla"), /detente/);
  assert.match(r("¿por qué bajaste mis calorías?"), /ajuste/);
  assert.match(r("cuando es mi registro"), /registro/);
  assert.match(r("hola"), /Hola, Alex/);
  assert.match(r("asdf qwer"), /No estoy seguro/);
  assert.match(r("¿puedo entrenar en casa sin aparatos?"), /Casa sin aparatos/);
});

test("busca ejercicios y alimentos aunque no escribas el nombre exacto", () => {
  assert.equal(buscarEjercicio(normalizar("press de banca"))?.nombre.toLowerCase().includes("banca"), true);
  assert.equal(buscarAlimento(normalizar("en vez de atun"))?.id, "atun");
  assert.equal(buscarAlimento(normalizar("no me gusta el pollo"))?.id, "pollo");
});
