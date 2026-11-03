// Insignia hexagonal con niveles (Bronce, Plata, Oro, Platino, Ónix). Diseño propio de TAOS.
import { CalendarCheck, ClipboardCheck, Compass, Dumbbell, Flame, Layers, Lock, Repeat, Ruler, Sunrise, Target, TrendingUp, Weight, type LucideIcon } from "lucide-react";
import type { Nivel } from "@/lib/medallas";

const ICONOS: Record<string, LucideIcon> = {
  pesa: Dumbbell,
  fuego: Flame,
  calendario: CalendarCheck,
  sube: TrendingUp,
  pesas: Weight,
  capas: Layers,
  ciclo: Repeat,
  brujula: Compass,
  lista: ClipboardCheck,
  regla: Ruler,
  diana: Target,
  amanecer: Sunrise,
};

// Colores de cada nivel: metal del borde (claro → oscuro), fondo interior y color del dibujo
const COLORES: Record<Nivel | "bloqueado", { claro: string; oscuro: string; fondo: string; linea: string; brillo?: string }> = {
  bronce: { claro: "#eaa66a", oscuro: "#6e3d1d", fondo: "#24160d", linea: "#f2b27a" },
  plata: { claro: "#f2f5f9", oscuro: "#757d88", fondo: "#181c22", linea: "#e6ebf2" },
  oro: { claro: "#f8e08a", oscuro: "#8a6a12", fondo: "#211a06", linea: "#f6d55c", brillo: "#ffd84d" },
  platino: { claro: "#ffffff", oscuro: "#8fb3c6", fondo: "#0f1d25", linea: "#9fe7ee", brillo: "#8ff3ff" },
  onix: { claro: "#f6dd7c", oscuro: "#8a6a12", fondo: "#050208", linea: "#c58cff", brillo: "#b066ff" },
  bloqueado: { claro: "#3a3a3a", oscuro: "#1c1c1c", fondo: "#111111", linea: "#5c5c5c" },
};

// Hexágono con punta arriba, en un cuadro de 100 × 112
const hexagono = (r: number, cx = 50, cy = 56) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

export function Insignia({ icono, nivel, tamano = 84, className = "" }: { icono: string; nivel: Nivel | null; tamano?: number; className?: string }) {
  const c = COLORES[nivel ?? "bloqueado"];
  const Icono = nivel ? (ICONOS[icono] ?? Dumbbell) : Lock;
  const id = `ins-${icono}-${nivel ?? "x"}`;
  return (
    <svg viewBox="-4 -4 108 120" width={tamano} height={(tamano * 112) / 100} className={className} role="img" aria-label={nivel ? `Medalla nivel ${nivel}` : "Medalla bloqueada"}>
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.claro} />
          <stop offset="0.55" stopColor={c.oscuro} />
          <stop offset="1" stopColor={c.claro} />
        </linearGradient>
        <radialGradient id={`${id}-f`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor={c.brillo ?? c.linea} stopOpacity={nivel === "onix" ? 0.32 : nivel ? 0.28 : 0.05} />
          <stop offset="1" stopColor={c.fondo} stopOpacity="1" />
        </radialGradient>
        <filter id={`${id}-h`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      {/* Halo brillante en Oro, Platino y Ónix */}
      {c.brillo && (
        <>
          <polygon points={hexagono(50)} fill="none" stroke={c.brillo} strokeWidth="6" filter={`url(#${id}-h)`} opacity="0.95" />
          <polygon points={hexagono(52)} fill="none" stroke={c.brillo} strokeOpacity="0.9" strokeWidth="1.6" />
        </>
      )}
      <polygon points={hexagono(48)} fill={`url(#${id}-m)`} />
      <polygon points={hexagono(41)} fill={`url(#${id}-f)`} />
      <polygon points={hexagono(35)} fill="none" stroke={c.linea} strokeOpacity={nivel ? 0.45 : 0.25} strokeWidth="1.2" />
      <Icono x={29} y={35} width={42} height={42} color={c.linea} strokeWidth={nivel ? 1.6 : 1.8} opacity={nivel ? 1 : 0.7} />
    </svg>
  );
}
