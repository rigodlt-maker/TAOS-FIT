"use client";

import { useEffect, useState } from "react";
import { imagenesDe } from "@/lib/ejercicios";
import { cn } from "@/lib/utils";

// Alterna la foto de inicio y la de final del movimiento para que se entienda cómo se hace
export function FotoEjercicio({ id, nombre, className, quieta = false }: { id: string; nombre: string; className?: string; quieta?: boolean }) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    if (quieta || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setPaso((p) => 1 - p), 1300);
    return () => clearInterval(t);
  }, [quieta]);
  const [a, b] = imagenesDe(id);
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-white", className)}>
      <img src={a} alt={`${nombre}: inicio`} loading="lazy" className="absolute inset-0 size-full object-cover" />
      <img src={b} alt={`${nombre}: final`} loading="lazy" className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", paso ? "opacity-100" : "opacity-0")} />
    </div>
  );
}
