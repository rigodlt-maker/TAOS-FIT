// Calorías, menú, lista del súper, reglas del registro semanal y compatibilidad con perfiles viejos (datos inventados)
import assert from "node:assert/strict";
import { test } from "node:test";
import { ALERTA_SALUD, evaluarSemana } from "../lib/ajustes";
import { ALIMENTOS, alimentoPorId, permitido, porcion } from "../lib/alimentos";
import { normalizarApariencia } from "../lib/avatar";
import { generarMenu, listaDeCompras, macrosDia, reemplazos } from "../lib/menu";
import { calcularObjetivos } from "../lib/nutricion";
import { PERFIL_BASE, completarPerfil, separarPerfil } from "../lib/perfil";
import { sugerir } from "../lib/progresion";
import { generarPlan } from "../lib/rutina";
import type { Perfil, Registro, Serie } from "../lib/tipos";

const yo: Perfil = { ...PERFIL_BASE, nombre: "Prueba", nacimiento: "1990-06-01", altura_cm: 175, objetivo: "grasa", dias_semana: 4, actividad: "ligera" };

test("calorías y macros con Mifflin-St Jeor", () => {
  const o = calcularObjetivos(yo, { peso_kg: 80 }, "2026-10-28");
  assert.equal(o.tmb, Math.round(10 * 80 + 6.25 * 175 - 5 * 36 + 5));
  assert.equal(o.factor, 1.515);
  assert.equal(o.mantenimiento, Math.round(o.tmb * 1.515));
  assert.ok(o.kcal < o.mantenimiento * 0.86 && o.kcal > o.mantenimiento * 0.8, "déficit 15–20%");
  assert.equal(o.proteina, Math.round(2.2 * 80));
  assert.equal(o.carbos, Math.round((o.kcal - o.proteina * 4 - o.grasa * 9) / 4));
  assert.equal(o.explicaciones.length, 6);
  const masa = calcularObjetivos({ ...yo, objetivo: "hipertrofia" }, { peso_kg: 80 }, "2026-10-28");
  assert.ok(masa.kcal > masa.mantenimiento * 1.04 && masa.kcal < masa.mantenimiento * 1.11, "superávit 5–10%");
  // Nunca por debajo del mínimo seguro
  const extremo = calcularObjetivos({ ...yo, cuerpo: "femenino", altura_cm: 150, ajuste_kcal: -2000 }, { peso_kg: 45 }, "2026-10-28");
  assert.ok(extremo.kcal >= Math.max(extremo.tmb, 1200));
});

test("el menú cuadra ±5% cada día y respeta lo que no comes", () => {
  for (const kcal of [1300, 1700, 2100, 2600, 3200, 3700])
    for (const excluidos of [[], ["vegano"], ["vegetariano", "gluten"], ["lacteos", "huevo", "pescado"]])
      for (const veces of [7, 3, 1]) {
        const m = generarMenu({ kcal, proteina: Math.round(kcal * 0.075), grasa: Math.round(kcal * 0.03), carbos: 0 }, { habituales: ["pollo", "tortilla"], excluidos, veces_cocina: veces }, `${kcal}${excluidos}${veces}`);
        assert.equal(m.dias.length, 7);
        for (const d of m.dias) {
          const t = macrosDia(d).kcal;
          assert.ok(Math.abs(t - kcal) / kcal <= 0.05, `${kcal} kcal ${excluidos}: el día dio ${Math.round(t)}`);
          for (const c of d.comidas) for (const it of c.items) assert.ok(permitido(alimentoPorId(it.alimento)!, excluidos), `${it.alimento} con ${excluidos}`);
        }
        if (veces <= 3) {
          assert.equal(m.lotes!.length, veces);
          const lote = m.lotes![0];
          if (lote.dias.length > 1) assert.deepEqual(m.dias[lote.dias[0]].comidas.find((c) => c.tipo === "comida")!.items.map((i) => i.alimento), m.dias[lote.dias[1]].comidas.find((c) => c.tipo === "comida")!.items.map((i) => i.alimento), "la comida se repite en el lote");
        } else assert.equal(m.lotes, null);
      }
});

test("reemplazos con calorías parecidas y lista del súper por sección", () => {
  const m = generarMenu({ kcal: 2000, proteina: 150, grasa: 60, carbos: 200 }, { habituales: [], excluidos: [], veces_cocina: 7 }, "x");
  const comida = m.dias[0].comidas.find((c) => c.tipo === "comida")!;
  const item = comida.items[0];
  const al = alimentoPorId(item.alimento)!;
  for (const r of reemplazos(item, "comida", [])) {
    const otro = alimentoPorId(r.alimento)!;
    assert.equal(otro.grupo, al.grupo);
    assert.ok(Math.abs((otro.kcal * r.gramos) / 100 - (al.kcal * item.gramos) / 100) < 90);
  }
  const lista = listaDeCompras(m);
  assert.ok(lista.length >= 3);
  assert.ok(lista.every((s) => s.cosas.every((c) => c.alimento.seccion === s.seccion)));
  assert.equal(porcion(alimentoPorId("tortilla")!, 90), "3 tortillas (90 g)");
  assert.equal(porcion(alimentoPorId("huevo")!, 50), "1 huevo (50 g)");
  assert.ok(ALIMENTOS.filter((a) => a.grupo !== "verdura").every((a) => Math.abs(a.p * 4 + a.c * 4 + a.g * 9 - a.kcal) / a.kcal < 0.25), "macros coherentes con las kcal");
});

const reg = (i: number, peso: number, o: Partial<Registro> = {}): Registro => ({ id: String(i), fecha: `2026-09-${String(1 + i * 7).padStart(2, "0")}`, peso_kg: peso, cintura_cm: null, cadera_cm: null, brazo_cm: null, adherencia: 90, energia: 7, sueno: 7, hambre: 5, notas: null, ...o });

test("registro semanal: calorías, volumen y salud", () => {
  // Bajar grasa y el peso no se mueve 2 semanas con buena adherencia → −150 kcal
  const quieto = evaluarSemana(yo, [reg(0, 80), reg(1, 79.95), reg(2, 79.9)], null, [], "2026-09-15");
  assert.equal(quieto.perfil.ajuste_kcal, -150);
  assert.equal(quieto.ajustes[0].tipo, "calorias");
  assert.match(quieto.ajustes[0].motivo, /80 → 80 → 79\.9 kg/);
  // Con poca adherencia no se cambia: solo consejo
  const flojo = evaluarSemana(yo, [reg(0, 80, { adherencia: 60 }), reg(1, 80, { adherencia: 60 }), reg(2, 80, { adherencia: 60 })], null, [], "2026-09-15");
  assert.equal(flojo.perfil.ajuste_kcal, undefined);
  assert.ok(flojo.consejos.some((c) => /80%/.test(c)));
  // Ganar músculo sin subir → +150
  assert.equal(evaluarSemana({ ...yo, objetivo: "hipertrofia" }, [reg(0, 70), reg(1, 70), reg(2, 70)], null, [], "2026-09-15").perfil.ajuste_kcal, 150);
  // Bajando demasiado rápido → +100
  assert.equal(evaluarSemana(yo, [reg(0, 80), reg(1, 78.8), reg(2, 77.6)], null, [], "2026-09-15").perfil.ajuste_kcal, 100);
  // Bien encaminado: sin cambios
  assert.equal(evaluarSemana(yo, [reg(0, 80), reg(1, 79.5), reg(2, 79)], null, [], "2026-09-15").perfil.ajuste_kcal, undefined);
  // Cansancio → −20% de volumen; recuperado → normal
  assert.equal(evaluarSemana(yo, [reg(0, 80, { energia: 4 })], null, [], "2026-09-01").perfil.volumen, 0.8);
  assert.equal(evaluarSemana({ ...yo, volumen: 0.8 }, [reg(0, 80, { energia: 7, sueno: 8 })], null, [], "2026-09-01").perfil.volumen, 1);
  // Salud → pausa y aviso
  const salud = evaluarSemana(yo, [reg(0, 80, { notas: "Me dio un mareo fuerte en la sentadilla" })], null, [], "2026-09-01");
  assert.equal(salud.perfil.pausa_hasta, "2026-09-08");
  assert.ok(salud.consejos[0].includes("médico"));
  assert.ok(ALERTA_SALUD.test("tengo dolor agudo en la rodilla"));
  assert.ok(!ALERTA_SALUD.test("me dolieron las piernas por el entreno"));
});

test("ejercicio estancado se cambia por otro del mismo movimiento", () => {
  const { dias } = generarPlan({ ...yo, objetivo: "hipertrofia" }, 0, "s");
  const plan = { id: "p", creado: "", activo: true, dias, notas: [] };
  const ej = dias[0].ejercicios[0];
  const fechas = ["2026-08-01", "2026-08-04", "2026-08-07", "2026-08-10"];
  const series: Serie[] = fechas.flatMap((fecha, i) => [1, 2, 3].map((n) => ({ id: `${i}${n}`, fecha, plan_id: "p", dia: 0, ejercicio: ej.ejercicio, serie: n, peso_kg: 60, reps: i === 0 ? ej.reps_min + 1 : ej.reps_min, rir: 2, nota: null })));
  const r = evaluarSemana(yo, [reg(0, 80)], plan, series, "2026-08-12");
  assert.equal(r.cambios[0].ejercicio, ej.ejercicio);
  assert.notEqual(r.cambios[0].nuevo, ej.ejercicio);
  assert.ok(r.ajustes.some((a) => a.tipo === "ejercicio"));
});

test("pausa por dolor: no sugiere subir de peso", () => {
  const plan = { ejercicio: "Barbell_Squat", series: 3, reps_min: 6, reps_max: 10, descanso_seg: 120 };
  const series: Serie[] = [1, 2, 3].map((n) => ({ id: String(n), fecha: "2026-10-20", plan_id: null, dia: 0, ejercicio: "Barbell_Squat", serie: n, peso_kg: 60, reps: 10, rir: 1, nota: null }));
  assert.equal(sugerir(plan, series).tipo, "subir");
  const pausa = sugerir(plan, series, "2026-10-30", "2026-10-25");
  assert.equal(pausa.tipo, "mantener");
  assert.equal(pausa.peso, 60);
});

test("perfiles y personajes de la versión anterior siguen funcionando", () => {
  const viejo = completarPerfil({ nombre: "Ana", genero: "mujer", nacimiento: "1995-01-01", altura_cm: "160.0", objetivo: "grasa", nivel: "principiante", dias_semana: 3, minutos_sesion: 45, lugar: "gimnasio", barra_dominadas: false, lesiones: [], enfasis: [], hora_entreno: null, avatar: { piel: 1, peinado: "largo", pelo: "#1f1c1b", ropa: "#d4af37", barba: true } });
  assert.equal(viejo.cuerpo, "femenino");
  assert.equal(viejo.altura_cm, 160);
  assert.equal(viejo.veces_cocina, 7);
  assert.equal(viejo.avatar!.vello, "barba");
  assert.equal(viejo.avatar!.peinado, "largo");
  const nb = completarPerfil({ nombre: "Sam", genero: "no_binario", datos: { cuerpo: "femenino", veces_cocina: 2 } });
  assert.equal(nb.cuerpo, "femenino");
  assert.equal(nb.veces_cocina, 2);
  const { columnas, datos } = separarPerfil(nb);
  assert.ok("genero" in columnas && !("cuerpo" in columnas));
  assert.equal(datos.veces_cocina, 2);
  assert.equal(normalizarApariencia({ peinado: "inventado", piel: 99 }, "masculino").peinado, "copete");
});

test("el SQL que muestra la app es el mismo de la migración", async () => {
  const { readFileSync } = await import("node:fs");
  const { SQL_INSTALAR } = await import("../lib/sql");
  assert.equal(SQL_INSTALAR, readFileSync("supabase/instalar.sql", "utf8"));
  for (const m of ["0001_tao_fit.sql", "0002_push.sql", "0003_coach.sql"]) assert.ok(SQL_INSTALAR.includes(readFileSync(`supabase/migrations/${m}`, "utf8").trim()), m);
});
