import type { Menu } from "../menu";
import type { Ajuste, DiaPlan, Medida, Perfil, Plan, Registro, Serie, SuscripcionPush } from "../tipos";

export type MenuGuardado = Menu & { id: string; creado: string };

// Todas las operaciones de datos de Tao Fit. Dos versiones: Supabase (real) y memoria (modo demostración).
export interface Repo {
  modo: "supabase" | "demo";
  usuario: string; // id del usuario (sirve de semilla para personalizar rutina y menú)
  // true si falta correr el SQL de la actualización (las funciones nuevas avisan en vez de fallar)
  esquemaPendiente(): Promise<boolean>;

  perfil(): Promise<Perfil | null>;
  guardarPerfil(p: Perfil): Promise<{ completo: boolean }>;

  medidas(): Promise<Medida[]>; // de la más vieja a la más nueva
  guardarMedida(m: Omit<Medida, "id">): Promise<void>;
  borrarMedida(id: string): Promise<void>;

  planActivo(): Promise<Plan | null>;
  crearPlan(dias: DiaPlan[], notas: string[]): Promise<string>; // desactiva el anterior

  series(filtro?: { ejercicio?: string; desde?: string }): Promise<Serie[]>;
  guardarSeries(s: Omit<Serie, "id">[]): Promise<void>;
  borrarSeries(fecha: string, ejercicio: string): Promise<void>;

  registros(): Promise<Registro[]>; // registros semanales, del más viejo al más nuevo
  guardarRegistro(r: Omit<Registro, "id">): Promise<void>;

  ajustes(limite?: number): Promise<Ajuste[]>; // del más nuevo al más viejo
  guardarAjustes(a: Omit<Ajuste, "id">[]): Promise<void>;

  menuActivo(): Promise<MenuGuardado | null>;
  guardarMenu(m: Menu): Promise<string>;

  suscripcionesPush(): Promise<SuscripcionPush[]>;
  guardarSuscripcionPush(s: Omit<SuscripcionPush, "id" | "created_at">): Promise<void>;
  borrarSuscripcionPush(endpoint: string): Promise<void>;
}

export const FALTA_SQL = "Falta un paso en Supabase para esta función. Abre la app de nuevo y sigue la pantalla «Un último paso: tu base de datos».";
