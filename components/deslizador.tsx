"use client";

import { useState } from "react";

// Barra deslizable grande con el valor y una carita, fácil de usar con el pulgar
export function Deslizador({ name, etiqueta, min, max, paso = 1, inicial, caritas, unidad = "" }: { name: string; etiqueta: string; min: number; max: number; paso?: number; inicial: number; caritas?: string[]; unidad?: string }) {
  const [valor, setValor] = useState(inicial);
  const cara = caritas ? caritas[Math.min(caritas.length - 1, Math.floor(((valor - min) / (max - min + 0.0001)) * caritas.length))] : "";
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="flex items-center justify-between">
        {etiqueta}
        <span className="text-lg">
          {cara} <strong className="text-primary">{valor}</strong>
          <span className="text-sm text-muted-foreground">{unidad}</span>
        </span>
      </span>
      <input type="range" name={name} min={min} max={max} step={paso} value={valor} onChange={(e) => setValor(Number(e.target.value))} className="h-10 w-full accent-[#d4af37]" />
    </label>
  );
}
