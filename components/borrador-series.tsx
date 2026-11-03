"use client";

// Guarda en el celular lo que vas escribiendo en un ejercicio (peso, reps, RIR) y lo devuelve si sales y regresas.
// Se borra al guardar el ejercicio. También marca que hay un entrenamiento en curso.
import { useEffect, useRef } from "react";
import { marcarEnCurso } from "@/lib/entreno-en-curso";

export function BorradorSeries({ clave, hoy }: { clave: string; hoy: string }) {
  const ancla = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ancla.current?.closest("form");
    if (!form) return;
    const k = `taos-borrador:${hoy}:${clave}`;
    const campos = () => [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name=peso], input[name=reps], select[name=rir]")];
    // Regresa lo que habías escrito
    try {
      const guardado = JSON.parse(localStorage.getItem(k) ?? "null") as string[] | null;
      if (guardado) campos().forEach((c, i) => guardado[i] !== undefined && guardado[i] !== "" && (c.value = guardado[i]));
    } catch {}
    const alEscribir = () => {
      try {
        localStorage.setItem(k, JSON.stringify(campos().map((c) => c.value)));
      } catch {}
      marcarEnCurso(hoy, location.pathname + location.search);
    };
    const alGuardar = () => {
      try {
        localStorage.removeItem(k);
      } catch {}
      marcarEnCurso(hoy, location.pathname + location.search);
    };
    form.addEventListener("input", alEscribir);
    form.addEventListener("change", alEscribir);
    form.addEventListener("submit", alGuardar);
    return () => {
      form.removeEventListener("input", alEscribir);
      form.removeEventListener("change", alEscribir);
      form.removeEventListener("submit", alGuardar);
    };
  }, [clave, hoy]);
  return <span ref={ancla} hidden />;
}
