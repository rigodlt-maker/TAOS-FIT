"use client";

// Calentamiento guiado: lista con fotos y, al tocar «Empezar», un movimiento a la vez con su cuenta regresiva.
// Vibra al cambiar de movimiento. Al terminar (o al saltarlo) queda marcado como hecho por hoy en este celular.
import { Check, Flame, Pause, Play, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import type { Movimiento } from "@/lib/calentamiento";
import { FotoEjercicio } from "./foto-ejercicio";
import { Button } from "./ui/button";
import { Card, CardTitle } from "./ui/card";

const formato = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Foto({ m, grande = false }: { m: Movimiento; grande?: boolean }) {
  const clase = grande ? "h-48 w-full" : "size-16";
  if (m.foto) return <FotoEjercicio id={m.foto} nombre={m.nombre} className={`shrink-0 ${clase}`} />;
  return (
    <div className={`grid shrink-0 place-items-center rounded-xl bg-muted ${clase}`} aria-hidden="true">
      <Flame className={grande ? "size-12 text-primary" : "size-6 text-primary"} />
    </div>
  );
}

export function Calentamiento({ movimientos, minutos, aproximacion, clave }: { movimientos: Movimiento[]; minutos: number; aproximacion?: string; clave: string }) {
  const [hecho, setHecho] = useState(false);
  const [actual, setActual] = useState<number | null>(null);
  const [resta, setResta] = useState(0);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    try {
      setHecho(localStorage.getItem("calentamiento") === clave);
    } catch {}
  }, [clave]);

  function terminar() {
    setActual(null);
    setHecho(true);
    try {
      localStorage.setItem("calentamiento", clave);
    } catch {}
  }

  function ir(i: number) {
    if (i >= movimientos.length) return terminar();
    navigator.vibrate?.(200);
    setActual(i);
    setResta(movimientos[i].segundos);
    setPausa(false);
  }

  useEffect(() => {
    if (actual === null || pausa) return;
    if (resta <= 0) {
      ir(actual + 1);
      return;
    }
    const t = setTimeout(() => setResta(resta - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual, resta, pausa]);

  if (actual !== null) {
    const m = movimientos[actual];
    return (
      <Card className="border-primary">
        <p className="text-xs font-semibold text-primary">
          Calentamiento · {actual + 1} de {movimientos.length}
        </p>
        <CardTitle className="mt-1 text-xl">{m.nombre}</CardTitle>
        <p className="text-sm text-muted-foreground">{m.dosis}</p>
        <div className="mt-3">
          <Foto m={m} grande />
        </div>
        <p className="mt-3 text-sm">{m.como}</p>
        <p className="mt-3 text-center text-4xl font-bold tabular-nums" aria-live="polite">
          {formato(resta)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => setPausa(!pausa)}>
            {pausa ? <Play className="size-5" /> : <Pause className="size-5" />}
            {pausa ? "Seguir" : "Pausa"}
          </Button>
          <Button type="button" onClick={() => ir(actual + 1)}>
            <SkipForward className="size-5" />
            {actual + 1 < movimientos.length ? "Siguiente" : "Terminar"}
          </Button>
        </div>
      </Card>
    );
  }

  if (hecho) {
    return (
      <Card>
        <div className="flex items-center gap-2">
          <Check className="size-5 text-primary" />
          <CardTitle className="text-base">Calentamiento hecho</CardTitle>
        </div>
        {aproximacion && <p className="mt-2 text-sm text-muted-foreground">Antes del primer ejercicio: {aproximacion}</p>}
        <button type="button" className="mt-2 min-h-11 text-sm text-primary underline" onClick={() => ir(0)}>
          Repetirlo
        </button>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <div className="flex items-center gap-2">
        <Flame className="size-5 text-primary" />
        <CardTitle className="text-base">Primero, calienta ({minutos} min)</CardTitle>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Siempre antes de entrenar: evita lesiones y rindes más desde la primera serie.</p>
      <ol className="mt-3 grid gap-2">
        {movimientos.map((m) => (
          <li key={m.nombre} className="flex items-center gap-3">
            <Foto m={m} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{m.nombre}</p>
              <p className="text-xs text-muted-foreground">{m.dosis}</p>
            </div>
          </li>
        ))}
      </ol>
      {aproximacion && <p className="mt-3 text-sm text-muted-foreground">Al final, series de aproximación: {aproximacion}</p>}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <Button type="button" onClick={() => ir(0)}>
          <Play className="size-5" /> Empezar calentamiento
        </Button>
        <Button type="button" variant="outline" onClick={terminar}>
          Ya calenté
        </Button>
      </div>
    </Card>
  );
}
