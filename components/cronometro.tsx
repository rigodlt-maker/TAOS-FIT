"use client";

import { Timer } from "lucide-react";
import { useEffect, useState } from "react";

// Cuenta regresiva del descanso entre series; vibra al terminar (si el celular lo permite)
export function Cronometro({ segundos }: { segundos: number }) {
  const [resta, setResta] = useState<number | null>(null);
  useEffect(() => {
    if (resta === null) return;
    if (resta <= 0) {
      navigator.vibrate?.([300, 150, 300]);
      const t = setTimeout(() => setResta(null), 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setResta(resta - 1), 1000);
    return () => clearTimeout(t);
  }, [resta]);
  const texto = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <button
      type="button"
      onClick={() => setResta(resta === null ? segundos : null)}
      className="flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold tabular-nums active:bg-muted"
      aria-live="polite"
    >
      <Timer className="size-5 text-primary" />
      {resta === null ? `Descanso ${texto(segundos)}` : resta > 0 ? `${texto(resta)} · tocar para parar` : "¡Siguiente serie! 💪"}
    </button>
  );
}
