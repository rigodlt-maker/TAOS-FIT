"use client";

// "Continuar entrenamiento": si empezaste a entrenar hoy y te saliste, te regresa a donde ibas
import { Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EVENTO_ENTRENO, hoyDelCelular, leerEnCurso, terminarEntreno, type EnCurso } from "@/lib/entreno-en-curso";

export function useEnCurso() {
  const [e, setE] = useState<EnCurso | null>(null);
  useEffect(() => {
    const leer = () => setE(leerEnCurso(hoyDelCelular()));
    leer();
    window.addEventListener(EVENTO_ENTRENO, leer);
    window.addEventListener("focus", leer);
    return () => {
      window.removeEventListener(EVENTO_ENTRENO, leer);
      window.removeEventListener("focus", leer);
    };
  }, []);
  return e;
}

export function ContinuarEntreno() {
  const e = useEnCurso();
  if (!e) return null;
  return (
    <Link href={e.url} className="flex min-h-16 items-center gap-3 rounded-2xl bg-primary px-4 text-primary-foreground active:scale-[0.99]">
      <Play className="size-6 shrink-0" />
      <span>
        <span className="block font-semibold">Continuar entrenamiento</span>
        <span className="block text-sm opacity-80">Empezaste hace {Math.max(1, Math.round((Date.now() - e.inicio) / 60000))} min. Tu avance está guardado.</span>
      </span>
    </Link>
  );
}

// En la pantalla de resumen: cierra el entrenamiento y dice cuánto duró
export function CerrarEntreno() {
  const [min, setMin] = useState<number | null>(null);
  const cerrado = useRef(false);
  useEffect(() => {
    // Una sola vez: al cerrar se borra el registro, una segunda lectura ya no sabría cuánto duró
    if (cerrado.current) return;
    cerrado.current = true;
    setMin(terminarEntreno(hoyDelCelular()));
  }, []);
  return min ? (
    <div>
      <p className="text-2xl font-semibold">{min} min</p>
      <p className="text-xs text-muted-foreground">duración</p>
    </div>
  ) : null;
}
