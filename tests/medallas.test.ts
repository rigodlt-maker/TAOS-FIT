// Medallas de Tao Fit con niveles (datos inventados)
import assert from "node:assert/strict";
import { test } from "node:test";
import { CATALOGO, estadisticas, logros, medallas, NIVELES, type DatosMedallas } from "../lib/medallas";

const serie = (fecha: string, ejercicio = "sentadilla", peso_kg = 40, reps = 10) => ({ fecha, ejercicio, peso_kg, reps });
const datos = (o: Partial<DatosMedallas> = {}): DatosMedallas => ({ series: [], medidas: [], registros: [], perfil: { dias_semana: 3, meta_peso_kg: null }, hoy: "2026-11-04", ...o });
const medalla = (d: DatosMedallas, id: string) => medallas(d).find((m) => m.id === id)!;
const dias = (n: number) => Array.from({ length: n }, (_, i) => serie(new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10)));

test("catálogo: ids únicos y 5 metas que siempre suben", () => {
  assert.equal(new Set(CATALOGO.map((m) => m.id)).size, CATALOGO.length);
  for (const m of CATALOGO) {
    assert.equal(m.metas.length, NIVELES.length, m.id);
    assert.ok(m.metas.every((x, i) => i === 0 || x > m.metas[i - 1]), `${m.id} sube`);
  }
});

test("sin datos: ninguna medalla tiene nivel y la siguiente meta es Bronce", () => {
  const c = medalla(datos(), "constancia");
  assert.equal(c.nivel, null);
  assert.equal(c.siguiente, 5);
  assert.equal(c.siguienteNivel, "bronce");
  assert.equal(logros(medallas(datos())).length, 0);
});

test("niveles de Constancia: 5 bronce, 25 plata, 100 oro", () => {
  assert.equal(medalla(datos({ series: dias(4) }), "constancia").nivel, null);
  assert.equal(medalla(datos({ series: dias(5) }), "constancia").nivel, "bronce");
  const c = medalla(datos({ series: dias(30) }), "constancia");
  assert.equal(c.nivel, "plata");
  assert.equal(c.siguiente, 100);
  // Los logros incluyen cada nivel alcanzado
  assert.deepEqual(logros([c]).map((l) => l.id), ["constancia:bronce", "constancia:plata"]);
});

test("entrenos por día, semanas completas y racha", () => {
  const d = datos({ series: ["2026-10-26", "2026-10-28", "2026-10-30", "2026-11-02", "2026-11-02"].map((f) => serie(f)) });
  const s = estadisticas(d);
  assert.equal(s.entrenos, 4);
  assert.equal(s.semanasCompletas, 1);
  assert.equal(s.rachaSemanas, 2);
  assert.equal(estadisticas(datos({ series: [serie("2026-10-28")] })).rachaSemanas, 1, "si esta semana no entrena, cuenta hasta la pasada");
});

test("récords, toneladas, repeticiones, ejercicios y regresos", () => {
  const d = datos({ series: [serie("2026-09-01", "sentadilla", 40), serie("2026-09-03", "sentadilla", 45), serie("2026-10-01", "sentadilla", 50), serie("2026-10-01", "press", 20)] });
  const s = estadisticas(d);
  assert.equal(s.records, 2);
  assert.equal(s.toneladas, 1.55);
  assert.equal(s.repeticiones, 40);
  assert.equal(s.ejercicios, 2);
  assert.equal(s.regresos, 1);
  assert.equal(medalla(d, "toneladas").nivel, "bronce");
});

test("meta de peso en porcentaje (bajar o subir)", () => {
  const bajar = datos({ perfil: { dias_semana: 3, meta_peso_kg: 80 }, medidas: [{ fecha: "2026-09-01", peso_kg: 90 }, { fecha: "2026-11-01", peso_kg: 85 }] });
  assert.equal(medalla(bajar, "meta").nivel, "oro", "50% del camino");
  const subir = datos({ perfil: { dias_semana: 3, meta_peso_kg: 70 }, medidas: [{ fecha: "2026-09-01", peso_kg: 60 }, { fecha: "2026-11-01", peso_kg: 71 }] });
  assert.equal(medalla(subir, "meta").nivel, "onix");
  assert.equal(medalla(subir, "meta").siguiente, null);
});
