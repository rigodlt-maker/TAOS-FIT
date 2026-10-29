// Enlace para agregar tus entrenamientos a Google Calendar como evento que se repite (gratis, sin API)
import { sumarDias } from "./entreno";
import type { Perfil } from "./tipos";

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function enlaceCalendario(p: Perfil, hoy: string): string | null {
  if (!p.dias_entreno.length || !p.hora_entreno) return null;
  // Primer día de entreno a partir de mañana
  let inicio = sumarDias(hoy, 1);
  while (!p.dias_entreno.includes(new Date(`${inicio}T12:00:00Z`).getUTCDay())) inicio = sumarDias(inicio, 1);
  const [h, m] = p.hora_entreno.split(":").map(Number);
  const fin = h * 60 + m + p.minutos_sesion;
  const hora = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}${String(min % 60).padStart(2, "0")}00`;
  const fecha = inicio.replace(/-/g, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: "🏋️ Entrenar (Tao Fit)",
    dates: `${fecha}T${hora(h * 60 + m)}/${fecha}T${hora(fin)}`,
    ctz: "America/Mexico_City",
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${p.dias_entreno.map((d) => BYDAY[d]).join(",")}`,
    details: "Abre Tao Fit para ver qué toca hoy.",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
