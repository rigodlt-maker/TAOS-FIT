import { CalendarPlus, Dumbbell, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FotoEjercicio } from "@/components/foto-ejercicio";
import { BotonAccion } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cambiarEjercicios } from "@/lib/acciones";
import { enlaceCalendario } from "@/lib/calendario";
import { ejercicioPorId } from "@/lib/ejercicios";
import { conVolumen } from "@/lib/rutina";
import { descanso, hoyLocal } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";
import { NOMBRES_LUGAR, NOMBRES_OBJETIVO } from "@/lib/tipos";

export default async function Rutina({ searchParams }: { searchParams: Promise<{ nueva?: string }> }) {
  const { nueva } = await searchParams;
  const repo = await obtenerRepo();
  const [perfil, plan] = await Promise.all([repo.perfil(), repo.planActivo()]);
  if (!perfil) redirect("/bienvenida");
  if (!plan) redirect("/perfil");
  const calendario = enlaceCalendario(perfil, hoyLocal());
  return (
    <div className="grid gap-4">
      <Titulo detalle={`${NOMBRES_OBJETIVO[perfil.objetivo]} · ${perfil.dias_semana} días · ${perfil.minutos_sesion} min · ${NOMBRES_LUGAR[perfil.lugar]}`}>Tu rutina</Titulo>
      {nueva && <p className="rounded-xl border border-primary/50 px-4 py-3 text-sm">🎉 ¡Lista! Esta rutina se armó con tus datos. Toca un día para empezar, y{" "}
          <Link href="/perfil#personaje" className="text-primary underline">personaliza tu personaje</Link>.</p>}

      <div className="grid grid-cols-2 gap-2">
        <Link href="/ejercicios" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm">
          <Dumbbell className="size-5 text-primary" /> Todos los ejercicios
        </Link>
        {calendario ? (
          <a href={calendario} target="_blank" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm">
            <CalendarPlus className="size-5 text-primary" /> A mi calendario
          </a>
        ) : (
          <Link href="/perfil#entreno" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-center text-xs">
            <CalendarPlus className="size-5 shrink-0 text-primary" /> Elige días y hora para tu calendario
          </Link>
        )}
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <Info className="size-5 text-primary" />
          <CardTitle className="text-base">Por qué está armada así</CardTitle>
        </div>
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-muted-foreground">
          {plan.notas.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Card>

      {plan.dias.map((d, i) => (
        <Card key={d.nombre}>
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <CardTitle>{d.nombre}</CardTitle>
              <CardDescription>{d.enfoque}</CardDescription>
            </div>
            <Link href={`/entrenar?dia=${i}`} className="flex min-h-11 shrink-0 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Entrenar
            </Link>
          </div>
          <ul className="grid gap-2">
            {d.ejercicios.map((original) => {
              const e = conVolumen(original, perfil.volumen);
              const ej = ejercicioPorId(e.ejercicio);
              return (
                <li key={e.ejercicio}>
                  <Link href={`/ejercicios/${e.ejercicio}`} className="flex items-center gap-3 rounded-xl p-1 active:bg-muted">
                    <FotoEjercicio id={e.ejercicio} nombre={ej?.nombre ?? ""} quieta className="size-14 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{ej?.nombre}</span>
                      <span className="text-sm text-muted-foreground">
                        {e.series} × {e.reps_min}–{e.reps_max}
                        {e.segundos ? " s" : ""} · descanso {descanso(e.descanso_seg)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {d.cardio_min && <li className="px-1 text-sm text-muted-foreground">+ {d.cardio_min} min de cardio al final (caminadora inclinada, bici o elíptica)</li>}
          </ul>
        </Card>
      ))}

      <Card>
        <CardTitle className="text-base">¿No te gusta algún ejercicio?</CardTitle>
        <CardDescription className="mb-3">Misma estructura, otros ejercicios. Tu historial no se borra.</CardDescription>
        <div className="flex flex-wrap gap-2">
          <BotonAccion accion={cambiarEjercicios} variant="outline" size="default" confirmar="¿Armar la rutina con otros ejercicios?">
            Cambiar ejercicios
          </BotonAccion>
          <Link href="/perfil" className="flex min-h-12 items-center rounded-xl px-4 text-sm text-primary">
            Cambiar objetivo, días o equipo
          </Link>
        </div>
      </Card>
    </div>
  );
}
