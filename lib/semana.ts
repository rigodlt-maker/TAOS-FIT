// ¿Toca el registro semanal? (el día que elegiste o si ya pasó más de una semana)
import { sumarDias } from "./entreno";
import type { Perfil, Registro } from "./tipos";

export function registroPendiente(p: Perfil, registros: Registro[], hoy: string): boolean {
  const ultimo = registros.at(-1)?.fecha;
  if (ultimo === hoy) return false;
  const diaSemana = new Date(`${hoy}T12:00:00Z`).getUTCDay();
  if (diaSemana === p.dia_registro && (!ultimo || ultimo < sumarDias(hoy, -3))) return true;
  return !!ultimo && ultimo < sumarDias(hoy, -8);
}

// ¿Hoy es día de entrenar? Si elegiste días, esos; si no, mientras te falten entrenos esta semana
export function tocaEntrenar(p: Perfil, hoy: string, entrenosSemana: number): boolean {
  if (p.dias_entreno.length) return p.dias_entreno.includes(new Date(`${hoy}T12:00:00Z`).getUTCDay());
  return entrenosSemana < p.dias_semana;
}
