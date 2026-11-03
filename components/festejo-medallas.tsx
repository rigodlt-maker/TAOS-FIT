"use client";
// Festejo cuando subes de nivel una medalla. Recuerda en este celular cuáles ya festejaste.
import { useEffect, useState } from "react";
import { NOMBRE_NIVEL, type Nivel } from "@/lib/medallas";
import { Insignia } from "./insignia";

type L = { id: string; medalla: string; nombre: string; icono: string; nivel: Nivel };
const CLAVE = "taos-fit-logros-vistos";

const leer = (): string[] | null => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "null");
  } catch {
    return null;
  }
};
const guardar = (ids: string[]) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...new Set([...(leer() ?? []), ...ids])]));
  } catch {}
};

export function FestejoMedallas({ logros }: { logros: L[] }) {
  const [nuevos, setNuevos] = useState<L[]>([]);
  useEffect(() => {
    const vistos = leer();
    // La primera vez solo se recuerdan: no se festeja de golpe lo que ya tenías
    if (!vistos) return guardar(logros.map((l) => l.id));
    // Si subiste varios niveles de la misma medalla, se festeja solo el más alto
    const pendientes = logros.filter((l) => !vistos.includes(l.id));
    const masAlto = new Map(pendientes.map((l) => [l.medalla, l]));
    setNuevos([...masAlto.values()]);
  }, [logros]);
  const l = nuevos[0];
  if (!l) return null;
  const listo = () => {
    guardar(logros.filter((x) => x.medalla === l.medalla).map((x) => x.id));
    setNuevos((n) => n.slice(1));
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-6" role="dialog" aria-modal="true" aria-label="Medalla nueva">
      <div className="festejo w-full max-w-sm rounded-3xl border border-primary/60 bg-card p-6 text-center">
        <p className="text-sm font-semibold tracking-widest text-primary">{l.nivel === "bronce" ? "¡MEDALLA NUEVA!" : "¡SUBISTE DE NIVEL!"}</p>
        <Insignia icono={l.icono} nivel={l.nivel} tamano={150} className="insignia-gira mx-auto my-4" />
        <p className="text-2xl font-semibold">{l.nombre}</p>
        <p className="mt-1 text-sm text-muted-foreground">Nivel {NOMBRE_NIVEL[l.nivel]}</p>
        <div className="mt-6 grid gap-2">
          <a href={`/medallas?m=${l.medalla}`} onClick={() => guardar(logros.map((x) => x.id))} className="flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">
            Ver mi álbum
          </a>
          <button type="button" onClick={listo} className="min-h-12 rounded-xl border font-semibold">
            {nuevos.length > 1 ? `Siguiente (${nuevos.length - 1} más)` : "¡Seguir!"}
          </button>
        </div>
      </div>
    </div>
  );
}
