import type { Apariencia } from "./avatar";
import type { Lesion, Zona } from "./ejercicios";

export type Resultado = { ok: true; mensaje: string } | { ok: false; mensaje: string };

export type Genero = "hombre" | "mujer" | "no_binario" | "prefiero_no_decir";
// Base para las fórmulas (calorías y % de grasa usan fórmulas distintas para cuerpo masculino y femenino)
export type Cuerpo = "masculino" | "femenino";
export type Objetivo = "hipertrofia" | "fuerza" | "resistencia" | "grasa";
export type Nivel = "principiante" | "intermedio" | "avanzado";
// Dónde entrenas: define qué ejercicios se pueden proponer
export type Lugar = "gimnasio" | "casa_mancuernas" | "casa_sin_equipo";
// Qué tanto te mueves fuera del gym (trabajo, caminatas)
export type Actividad = "sedentaria" | "ligera" | "activa";

export const NOMBRES_GENERO: Record<Genero, string> = { hombre: "Hombre", mujer: "Mujer", no_binario: "No binario", prefiero_no_decir: "Prefiero no decirlo" };
export const NOMBRES_OBJETIVO: Record<Objetivo, string> = {
  hipertrofia: "Ganar músculo",
  fuerza: "Ganar fuerza",
  resistencia: "Resistencia y salud",
  grasa: "Bajar grasa",
};
export const NOMBRES_NIVEL: Record<Nivel, string> = { principiante: "Principiante", intermedio: "Intermedio", avanzado: "Avanzado" };
export const NOMBRES_LUGAR: Record<Lugar, string> = {
  gimnasio: "Gimnasio",
  casa_mancuernas: "Casa con mancuernas",
  casa_sin_equipo: "Casa sin equipo",
};
export const NOMBRES_ACTIVIDAD: Record<Actividad, string> = {
  sedentaria: "Casi todo el día sentado",
  ligera: "Camino o me muevo un poco",
  activa: "Trabajo de pie o muy activo",
};
export const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type Perfil = {
  nombre: string;
  genero: Genero;
  cuerpo: Cuerpo;
  nacimiento: string; // AAAA-MM-DD
  altura_cm: number;
  objetivo: Objetivo;
  nivel: Nivel;
  dias_semana: number; // 2 a 6
  minutos_sesion: number;
  lugar: Lugar;
  barra_dominadas: boolean;
  lesiones: Lesion[];
  enfasis: Zona[]; // zonas que quieres priorizar (máximo 2)
  hora_entreno: string | null; // "07:00", para recordatorios
  avatar: Apariencia | null; // cómo se ve tu personaje
  // --- Meta, comida y ajustes (se guardan juntos en la columna "datos") ---
  actividad: Actividad;
  dias_entreno: number[]; // 0 = domingo … 6 = sábado (opcional)
  meta_peso_kg: number | null;
  fecha_meta: string | null;
  alimentos_habituales: string[]; // ids de lib/alimentos
  alimentos_excluidos: string[]; // ids de alimentos o grupos ("cerdo", "lacteos"…)
  veces_cocina: number; // por semana
  dia_registro: number; // día del registro semanal (0 = domingo)
  ajuste_kcal: number; // suma de los ajustes automáticos de calorías
  volumen: number; // 1 normal, 0.8 = 20% menos series por cansancio
  pausa_hasta: string | null; // sin aumentos de peso hasta esta fecha (por dolor o mareo)
};

// Medidas en cm y peso en kg. Solo altura (en el perfil) y peso son obligatorios; lo demás mejora el avatar.
export type Medida = {
  id: string;
  fecha: string;
  peso_kg: number;
  cintura_cm: number | null;
  cadera_cm: number | null;
  pecho_cm: number | null;
  brazo_cm: number | null;
  muslo_cm: number | null;
  cuello_cm: number | null;
};

export type EjercicioPlan = {
  ejercicio: string; // id del catálogo
  series: number;
  reps_min: number;
  reps_max: number;
  descanso_seg: number;
  rir?: number; // repeticiones en reserva objetivo
  segundos?: boolean; // reps_min/max son segundos (plancha)
};

export type DiaPlan = { nombre: string; enfoque: string; ejercicios: EjercicioPlan[]; cardio_min?: number };

export type Plan = {
  id: string;
  creado: string;
  activo: boolean;
  dias: DiaPlan[];
  notas: string[]; // por qué se armó así
};

export type Serie = {
  id: string;
  fecha: string;
  plan_id: string | null;
  dia: number; // índice del día del plan
  ejercicio: string;
  serie: number;
  peso_kg: number;
  reps: number;
  rir: number | null;
  nota: string | null; // "dolor" si marcaste dolor agudo o mareo
};

// Registro semanal: cómo te fue en la semana
export type Registro = {
  id: string;
  fecha: string;
  peso_kg: number; // peso promedio de la semana
  cintura_cm: number | null;
  cadera_cm: number | null;
  brazo_cm: number | null;
  adherencia: number; // % de la comida que cumpliste
  energia: number; // 1 a 10
  sueno: number; // 1 a 10
  hambre: number; // 1 a 10
  notas: string | null;
};

export type TipoAjuste = "calorias" | "volumen" | "ejercicio" | "salud" | "rutina";
export type Ajuste = { id: string; fecha: string; tipo: TipoAjuste; detalle: string; motivo: string };

// Un celular o navegador donde activaste las notificaciones push (tabla compartida con las otras apps TAOS)
export type SuscripcionPush = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  dispositivo: string | null;
  created_at?: string;
};
