// Generador de rutinas personalizadas. Sin IA: reglas de entrenamiento según objetivo, nivel, días, tiempo,
// lugar, molestias y zonas que quieres priorizar. "variante" rota los ejercicios cuando pides cambiarlos.
import { EJERCICIOS, type Ejercicio, type Equipo, type Patron, type Zona } from "./ejercicios";
import type { DiaPlan, EjercicioPlan, Nivel, Objetivo, Perfil } from "./tipos";

type Hueco = { patron: Patron; v?: number }; // v = 0 el mejor candidato, 1 el segundo, etc.
type Plantilla = { nombre: string; enfoque: string; huecos: Hueco[] };

const h = (patron: Patron, v = 0): Hueco => ({ patron, v });

const CUERPO_A: Plantilla = { nombre: "Cuerpo completo A", enfoque: "Todo el cuerpo", huecos: [h("sentadilla"), h("empuje_horizontal"), h("remo"), h("bisagra"), h("hombro_lateral"), h("core")] };
const CUERPO_B: Plantilla = { nombre: "Cuerpo completo B", enfoque: "Todo el cuerpo", huecos: [h("bisagra", 1), h("empuje_vertical"), h("jalon"), h("unilateral"), h("biceps"), h("triceps")] };
const CUERPO_C: Plantilla = { nombre: "Cuerpo completo C", enfoque: "Todo el cuerpo", huecos: [h("sentadilla", 1), h("empuje_horizontal", 1), h("remo", 1), h("gluteo"), h("femoral"), h("core", 1)] };
const TORSO_A: Plantilla = { nombre: "Torso A", enfoque: "Pecho, espalda, hombros y brazos", huecos: [h("empuje_horizontal"), h("remo"), h("empuje_vertical"), h("jalon"), h("biceps"), h("triceps")] };
const TORSO_B: Plantilla = { nombre: "Torso B", enfoque: "Pecho, espalda y hombros", huecos: [h("empuje_horizontal", 1), h("jalon", 1), h("remo", 1), h("hombro_lateral"), h("pecho_aislado"), h("hombro_posterior")] };
const PIERNA_A: Plantilla = { nombre: "Pierna A", enfoque: "Cuádriceps, femoral y glúteo", huecos: [h("sentadilla"), h("bisagra"), h("unilateral"), h("femoral"), h("pantorrilla"), h("core")] };
const PIERNA_B: Plantilla = { nombre: "Pierna B", enfoque: "Glúteo, femoral y cuádriceps", huecos: [h("bisagra", 1), h("sentadilla", 1), h("gluteo"), h("cuadriceps"), h("pantorrilla", 1), h("core", 1)] };
const EMPUJE: Plantilla = { nombre: "Empuje", enfoque: "Pecho, hombros y tríceps", huecos: [h("empuje_horizontal"), h("empuje_vertical"), h("empuje_horizontal", 1), h("hombro_lateral"), h("pecho_aislado"), h("triceps")] };
const JALON: Plantilla = { nombre: "Jalón", enfoque: "Espalda y bíceps", huecos: [h("jalon"), h("remo"), h("remo", 1), h("hombro_posterior"), h("biceps"), h("biceps", 1)] };
const EMPUJE_2: Plantilla = { ...EMPUJE, nombre: "Empuje B", huecos: [h("empuje_vertical"), h("empuje_horizontal", 1), h("empuje_horizontal", 2), h("hombro_lateral", 1), h("pecho_aislado", 1), h("triceps", 1)] };
const JALON_2: Plantilla = { ...JALON, nombre: "Jalón B", huecos: [h("remo", 1), h("jalon", 1), h("remo", 2), h("hombro_posterior", 1), h("biceps", 1), h("core")] };

export function division(dias: number): Plantilla[] {
  if (dias <= 2) return [CUERPO_A, CUERPO_B];
  if (dias === 3) return [CUERPO_A, CUERPO_B, CUERPO_C];
  if (dias === 4) return [TORSO_A, PIERNA_A, TORSO_B, PIERNA_B];
  if (dias === 5) return [TORSO_A, PIERNA_A, EMPUJE, JALON, PIERNA_B];
  return [{ ...EMPUJE, nombre: "Empuje A" }, { ...JALON, nombre: "Jalón A" }, PIERNA_A, EMPUJE_2, JALON_2, PIERNA_B];
}

// Equipo disponible según dónde entrenas
export function equipoDisponible(p: Pick<Perfil, "lugar" | "barra_dominadas">): Set<Equipo> {
  if (p.lugar === "gimnasio") return new Set(["barra", "mancuernas", "maquina", "polea", "corporal", "kettlebell", "barra_dominadas"]);
  const base: Equipo[] = p.lugar === "casa_mancuernas" ? ["mancuernas", "kettlebell", "corporal"] : ["corporal"];
  if (p.barra_dominadas) base.push("barra_dominadas");
  return new Set(base);
}

const DIFICULTAD_MAX: Record<Nivel, number> = { principiante: 1, intermedio: 2, avanzado: 3 };

// Si no hay ejercicio para un patrón (p. ej. femoral en casa sin equipo), se usa uno parecido
const RESPALDO: Partial<Record<Patron, Patron[]>> = {
  femoral: ["bisagra", "gluteo"],
  cuadriceps: ["unilateral", "sentadilla"],
  jalon: ["remo"],
  pecho_aislado: ["empuje_horizontal"],
  hombro_posterior: ["remo"],
  hombro_lateral: ["empuje_vertical"],
  empuje_vertical: ["empuje_horizontal"],
  pantorrilla: [],
  triceps: ["empuje_horizontal"],
  biceps: ["remo"],
};

// Número pseudoaleatorio estable a partir de un texto: misma persona y variante = misma rutina
function azar(texto: string): number {
  let x = 2166136261;
  for (let i = 0; i < texto.length; i++) x = Math.imul(x ^ texto.charCodeAt(i), 16777619);
  return ((x >>> 0) % 1000) / 1000;
}

function puntaje(ej: Ejercicio, p: Perfil, semilla: string): number {
  let s = 0;
  const max = DIFICULTAD_MAX[p.nivel];
  if (ej.dificultad === max) s += 1;
  // En los movimientos principales se prefieren los compuestos (jalón al pecho antes que pullover)
  if (ej.compuesto && !["biceps", "triceps"].includes(ej.patron)) s += 1.5;
  if (ej.compuesto && p.nivel !== "principiante" && ["barra", "mancuernas"].includes(ej.equipo)) s += 1;
  if (p.objetivo === "fuerza" && ej.compuesto) s += ej.equipo === "barra" ? 3 : ej.equipo === "mancuernas" ? 1 : 0;
  if (p.nivel === "principiante") s += ej.equipo === "maquina" ? 2 : ej.equipo === "barra" ? -1 : 0;
  if (p.objetivo === "hipertrofia" && ["mancuernas", "polea", "maquina"].includes(ej.equipo)) s += 1;
  if (p.objetivo === "resistencia" || p.objetivo === "grasa") s += ej.equipo === "corporal" || ej.equipo === "mancuernas" || ej.equipo === "kettlebell" ? 1 : 0;
  // Desempate personal: cada persona (y cada "cambiar ejercicios") recibe una combinación distinta
  return s + azar(`${semilla}:${ej.id}`) * 1.2;
}

export function candidatos(patron: Patron, p: Perfil, semilla: string): Ejercicio[] {
  const equipo = equipoDisponible(p);
  const max = DIFICULTAD_MAX[p.nivel];
  return EJERCICIOS.filter((ej) => ej.patron === patron && equipo.has(ej.equipo) && ej.dificultad <= max && !ej.evitar?.some((l) => p.lesiones.includes(l))).sort(
    (a, b) => puntaje(b, p, semilla) - puntaje(a, p, semilla),
  );
}

// Series, repeticiones y descanso según el objetivo
export function prescripcion(ej: Ejercicio, objetivo: Objetivo, nivel: Nivel, orden: number): Omit<EjercicioPlan, "ejercicio"> {
  if (ej.patron === "core") {
    const tiempo = ["Plank", "Side_Bridge"].includes(ej.id);
    return tiempo
      ? { series: 3, reps_min: nivel === "principiante" ? 20 : 30, reps_max: nivel === "principiante" ? 40 : 60, descanso_seg: 45, segundos: true }
      : { series: 3, reps_min: 12, reps_max: 20, descanso_seg: 45 };
  }
  let r: Omit<EjercicioPlan, "ejercicio">;
  const principal = ej.compuesto && orden < 2;
  if (objetivo === "fuerza") r = principal ? { series: 5, reps_min: 3, reps_max: 5, descanso_seg: 180 } : ej.compuesto ? { series: 4, reps_min: 5, reps_max: 8, descanso_seg: 150 } : { series: 3, reps_min: 8, reps_max: 12, descanso_seg: 90 };
  else if (objetivo === "hipertrofia") r = ej.compuesto ? { series: principal ? 4 : 3, reps_min: 6, reps_max: 10, descanso_seg: 120 } : { series: 3, reps_min: 10, reps_max: 15, descanso_seg: 75 };
  else if (objetivo === "resistencia") r = ej.compuesto ? { series: 3, reps_min: 12, reps_max: 15, descanso_seg: 60 } : { series: 2, reps_min: 15, reps_max: 20, descanso_seg: 45 };
  else r = ej.compuesto ? { series: 3, reps_min: 8, reps_max: 12, descanso_seg: 75 } : { series: 3, reps_min: 12, reps_max: 15, descanso_seg: 60 };
  r.rir = nivel === "principiante" ? 3 : objetivo === "hipertrofia" ? 1 : 2;
  if (nivel === "principiante") r.series = Math.max(2, r.series - 1);
  if (nivel === "avanzado" && ej.compuesto) r.series += 1;
  // Con peso corporal se compensa la falta de carga con más repeticiones
  if (ej.equipo === "corporal" && objetivo !== "resistencia") {
    r.reps_min = Math.max(r.reps_min, 8);
    r.reps_max = Math.max(r.reps_max, 15);
  }
  return r;
}

// Minutos aproximados de un ejercicio: ~40 s por serie más el descanso
export const minutosDe = (e: EjercicioPlan) => (e.series * (40 + e.descanso_seg)) / 60;

const EXTRA_POR_ZONA: Record<Zona, Patron> = {
  pecho: "pecho_aislado",
  espalda: "remo",
  hombros: "hombro_lateral",
  brazos: "biceps",
  piernas: "cuadriceps",
  gluteo: "gluteo",
  abdomen: "core",
};

export function generarPlan(p: Perfil, variante = 0, semillaBase = p.nombre): { dias: DiaPlan[]; notas: string[] } {
  const semilla = `${semillaBase}:${variante}`;
  const notas: string[] = [];
  const plantillas = division(p.dias_semana);
  const cardio = p.objetivo === "grasa" ? (p.minutos_sesion >= 60 ? 20 : 12) : p.objetivo === "resistencia" ? 10 : 0;
  const disponible = Math.max(20, p.minutos_sesion - 8 - cardio); // 8 min de calentamiento

  const dias = plantillas.map((pl, i): DiaPlan => {
    const usados = new Set<string>();
    const elegir = (hueco: Hueco): Ejercicio | null => {
      for (const patron of [hueco.patron, ...(RESPALDO[hueco.patron] ?? [])]) {
        const lista = candidatos(patron, p, semilla).filter((ej) => !usados.has(ej.id));
        const ej = lista[Math.min(hueco.v ?? 0, lista.length - 1)] ?? null;
        if (ej) return ej;
      }
      return null;
    };
    const huecos = [...pl.huecos];
    // Zonas que quieres priorizar: un ejercicio extra en los días que ya las trabajan
    for (const zona of p.enfasis.slice(0, 2)) {
      const trabaja = huecos.some((x) => EJERCICIOS.some((ej) => ej.patron === x.patron && ej.zonas.includes(zona)));
      if (trabaja) huecos.push(h(EXTRA_POR_ZONA[zona], 1));
    }
    let ejercicios: EjercicioPlan[] = [];
    for (const hueco of huecos) {
      const ej = elegir(hueco);
      if (!ej) continue;
      usados.add(ej.id);
      const pres = prescripcion(ej, p.objetivo, p.nivel, ejercicios.length);
      // Prioridad: solo suma series a los ejercicios cuyo músculo principal es esa zona
      if (p.enfasis.includes(ej.zonas[0]) && ej.patron !== "core") pres.series = Math.min(5, pres.series + 1);
      ejercicios.push({ ejercicio: ej.id, ...pres });
    }
    // Con poco equipo (p. ej. jalón en casa sin equipo) pueden quedar pocos ejercicios: se completa con otros útiles
    for (const patron of ["core", "bisagra", "gluteo", "unilateral", "sentadilla", "empuje_horizontal"] as Patron[]) {
      if (ejercicios.length >= 4) break;
      const ej = elegir(h(patron));
      if (!ej) continue;
      usados.add(ej.id);
      ejercicios.push({ ejercicio: ej.id, ...prescripcion(ej, p.objetivo, p.nivel, ejercicios.length) });
    }
    // Recorta desde el final (accesorios) hasta que quepa en tu tiempo, dejando al menos 3
    const total = () => ejercicios.reduce((s, e) => s + minutosDe(e), 0);
    // Orden para quitar: primero aislados sin prioridad, luego aislados de tu zona prioritaria y al final los compuestos
    const valor = (e: EjercicioPlan) => {
      const ej = EJERCICIOS.find((x) => x.id === e.ejercicio)!;
      const principal = ej.compuesto && !["biceps", "triceps"].includes(ej.patron);
      return (principal ? 3 : 0) + (p.enfasis.includes(ej.zonas[0]) ? 1 : 0);
    };
    while (ejercicios.length > 3 && total() > disponible) {
      let quitar = -1;
      for (let j = ejercicios.length - 1; j > 0; j--) if (quitar < 0 || valor(ejercicios[j]) < valor(ejercicios[quitar])) quitar = j;
      ejercicios = ejercicios.filter((_, j) => j !== quitar);
    }
    // Primero los compuestos (más pesados), luego los aislados y el abdomen al final
    const peso = (e: EjercicioPlan) => {
      const ej = EJERCICIOS.find((x) => x.id === e.ejercicio)!;
      return ej.patron === "core" ? 2 : ej.compuesto ? 0 : 1;
    };
    ejercicios = ejercicios.map((e, j) => [e, j] as const).sort((a, b) => peso(a[0]) - peso(b[0]) || a[1] - b[1]).map(([e]) => e);
    return { nombre: `Día ${i + 1} · ${pl.nombre}`, enfoque: pl.enfoque, ejercicios, ...(cardio ? { cardio_min: cardio } : {}) };
  });

  const nombresDivision: Record<number, string> = {
    2: "cuerpo completo 2 veces por semana",
    3: "cuerpo completo 3 veces por semana: cada músculo se entrena seguido",
    4: "torso y pierna, 2 veces cada uno",
    5: "torso/pierna más empuje, jalón y pierna",
    6: "empuje, jalón y pierna, 2 veces cada uno",
  };
  notas.push(`Con ${p.dias_semana} días: ${nombresDivision[Math.min(6, Math.max(2, p.dias_semana))]}.`);
  const porObjetivo: Record<Objetivo, string> = {
    fuerza: "Fuerza: pocas repeticiones (3–5) con peso alto en los ejercicios principales y descansos largos (2–3 min).",
    hipertrofia: "Hipertrofia: 6–15 repeticiones cerca del fallo (deja 1–2 en reserva) y descansos de 1–2 min.",
    resistencia: "Resistencia: 12–20 repeticiones con descansos cortos y un poco de cardio al final.",
    grasa: "Bajar grasa: pesas para conservar músculo y cardio al final. Lo que más cuenta es la comida.",
  };
  notas.push(porObjetivo[p.objetivo]);
  if (p.lesiones.length) notas.push("Se evitaron ejercicios que suelen molestar en las zonas que marcaste.");
  if (p.enfasis.length) notas.push(`Más series y un ejercicio extra para: ${p.enfasis.join(" y ")}.`);
  if (p.nivel === "principiante") notas.push("Primeras 2 semanas: usa pesos cómodos y aprende la técnica; luego la app te dirá cuándo subir.");
  return { dias, notas };
}

// Otros ejercicios del mismo movimiento (para "está ocupado" o para cambiar uno estancado)
export function alternativas(ejercicio: string, p: Perfil, excluir: string[] = []): Ejercicio[] {
  const ej = EJERCICIOS.find((x) => x.id === ejercicio);
  if (!ej) return [];
  return candidatos(ej.patron, p, `alt:${ejercicio}`).filter((x) => x.id !== ejercicio && !excluir.includes(x.id));
}

// Menos series cuando estás cansado (volumen 0.8 = 20% menos), mínimo 1 serie
export const conVolumen = (e: EjercicioPlan, volumen: number): EjercicioPlan => (volumen >= 1 ? e : { ...e, series: Math.max(1, Math.round(e.series * volumen)) });
