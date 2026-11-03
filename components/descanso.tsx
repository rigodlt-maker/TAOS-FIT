"use client";

// Descanso entre series a pantalla completa: cuenta regresiva grande, frases para motivarte, +30 s y "Saltar descanso".
// Sigue contando aunque cambies de pantalla (la hora de fin se guarda en el celular) y vibra/suena al terminar.
import { Timer, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CLAVE = "taos-descanso";
const FRASES = [
  "Respira profundo. Lo estás haciendo bien.",
  "Cada serie cuenta. La constancia gana.",
  "Hidrátate: un trago de agua.",
  "Afloja hombros y cuello. Relaja la cara.",
  "Piensa en la técnica de la siguiente serie.",
  "Tu yo de dentro de 3 meses te lo agradece.",
  "No tiene que ser perfecto, tiene que ser hoy.",
  "Más fuerte que ayer. 💪",
  "Controla la bajada en la siguiente serie.",
  "Una serie más cerca de tu meta.",
];
// "de" = qué ejercicio lo empezó: solo ese muestra la pantalla (hay un botón de descanso por ejercicio)
type Estado = { fin: number; total: number; de: string };

const leer = (): Estado | null => {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Estado | null;
    return v && v.fin > Date.now() - 3000 ? v : null;
  } catch {
    return null;
  }
};
const guardar = (e: Estado | null) => {
  try {
    if (e) localStorage.setItem(CLAVE, JSON.stringify(e));
    else localStorage.removeItem(CLAVE);
  } catch {}
};

function sonar() {
  try {
    navigator.vibrate?.([300, 150, 300]);
    const ctx = new AudioContext();
    for (const [i, f] of [880, 1175].entries()) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.22 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.22);
      o.stop(ctx.currentTime + i * 0.22 + 0.22);
    }
  } catch {}
}

export function Descanso({ segundos, de }: { segundos: number; de: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  // Si saliste y regresaste con un descanso corriendo, sigue donde iba
  useEffect(() => {
    const e = leer();
    if (e?.de === de) setEstado(e);
  }, [de]);

  const cerrar = useCallback(() => {
    guardar(null);
    setEstado(null);
  }, []);

  useEffect(() => {
    if (!estado) return;
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [estado]);

  const resta = estado ? Math.max(0, Math.ceil((estado.fin - ahora) / 1000)) : 0;
  const termino = !!estado && resta === 0;
  useEffect(() => {
    if (!termino) return;
    sonar();
    const t = setTimeout(cerrar, 2500);
    return () => clearTimeout(t);
  }, [termino, cerrar]);

  function empezar() {
    const e = { fin: Date.now() + segundos * 1000, total: segundos, de };
    guardar(e);
    setAhora(Date.now());
    setEstado(e);
  }
  function mas30() {
    if (!estado) return;
    const e = { ...estado, fin: estado.fin + 30_000, total: estado.total + 30 };
    guardar(e);
    setEstado(e);
  }

  const texto = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const avance = estado ? 1 - resta / estado.total : 0;
  const frase = FRASES[Math.floor((estado ? estado.total - resta : 0) / 10) % FRASES.length];
  const r = 110;
  const largo = 2 * Math.PI * r;

  return (
    <>
      <button type="button" onClick={empezar} className="flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold tabular-nums active:bg-muted">
        <Timer className="size-5 text-primary" />
        Descanso {texto(segundos)}
      </button>
      {estado &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 bg-background/97 px-6 text-center" role="dialog" aria-modal="true" aria-label="Descanso">
            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">DESCANSO</p>
            <div className="relative grid size-64 place-items-center">
              <svg viewBox="0 0 240 240" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="120" cy="120" r={r} fill="none" stroke="currentColor" className="text-muted" strokeWidth="10" />
                <circle cx="120" cy="120" r={r} fill="none" stroke="#d4af37" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${largo * avance} ${largo}`} />
              </svg>
              <p className="text-6xl font-bold tabular-nums" aria-live="polite">
                {termino ? "¡Ya!" : texto(resta)}
              </p>
            </div>
            <p className="min-h-14 max-w-xs text-lg leading-snug">{termino ? "¡A la siguiente serie! 💪" : frase}</p>
            <div className="flex gap-3">
              <button type="button" onClick={mas30} className="min-h-12 rounded-full border px-5 font-semibold">
                +30 s
              </button>
              <button type="button" onClick={cerrar} className="flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
                <X className="size-5" /> Saltar descanso
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
