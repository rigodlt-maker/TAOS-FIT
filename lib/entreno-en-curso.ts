// Entrenamiento en curso (solo en el celular, localStorage): para ofrecer "Continuar entrenamiento",
// medir cuánto duró y guardar lo que vas escribiendo de cada ejercicio aunque cambies de pantalla.
export type EnCurso = { fecha: string; url: string; inicio: number };

const CLAVE = "taos-entreno-en-curso";
export const EVENTO_ENTRENO = "taos-entreno";

export function leerEnCurso(hoy: string): EnCurso | null {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as EnCurso | null;
    return v && v.fecha === hoy ? v : null;
  } catch {
    return null;
  }
}

export function marcarEnCurso(hoy: string, url: string) {
  try {
    const antes = leerEnCurso(hoy);
    localStorage.setItem(CLAVE, JSON.stringify({ fecha: hoy, url, inicio: antes?.inicio ?? Date.now() }));
    window.dispatchEvent(new Event(EVENTO_ENTRENO));
  } catch {}
}

// Al terminar: devuelve los minutos que duró y borra el estado y los borradores de hoy
export function terminarEntreno(hoy: string): number | null {
  const e = leerEnCurso(hoy);
  try {
    localStorage.removeItem(CLAVE);
    for (const k of Object.keys(localStorage)) if (k.startsWith(`taos-borrador:${hoy}:`)) localStorage.removeItem(k);
    window.dispatchEvent(new Event(EVENTO_ENTRENO));
  } catch {}
  return e ? Math.max(1, Math.round((Date.now() - e.inicio) / 60000)) : null;
}

// Fecha local del celular (YYYY-MM-DD), igual que hoyLocal() del servidor en México
export const hoyDelCelular = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
