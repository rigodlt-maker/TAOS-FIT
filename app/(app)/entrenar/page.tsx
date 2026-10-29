import { ArrowLeftRight, Flame } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Cronometro } from "@/components/cronometro";
import { FotoEjercicio } from "@/components/foto-ejercicio";
import { BotonAccion, Formulario } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/campos";
import { cambiarEjercicioSiempre, guardarEjercicio } from "@/lib/acciones";
import { ejercicioPorId } from "@/lib/ejercicios";
import { diaQueToca, fechaBonita, hoyLocal } from "@/lib/entreno";
import { sesionesDe, sugerir } from "@/lib/progresion";
import { alternativas, conVolumen } from "@/lib/rutina";
import { obtenerRepo } from "@/lib/sesion";
import { cn } from "@/lib/utils";

const COLORES = { nuevo: "text-muted-foreground", subir: "text-primary", mantener: "text-muted-foreground", bajar: "text-destructive", estancado: "text-destructive" };
const redondear = (kg: number) => Math.max(0, Math.round(kg / 2.5) * 2.5);

export default async function Entrenar({ searchParams }: { searchParams: Promise<{ dia?: string; c?: string | string[] }> }) {
  const params = await searchParams;
  const repo = await obtenerRepo();
  const [perfil, plan, series] = await Promise.all([repo.perfil(), repo.planActivo(), repo.series()]);
  if (!perfil) redirect("/bienvenida");
  if (!plan) redirect("/rutina");
  const pedido = Number(params.dia);
  const indice = Number.isInteger(pedido) && pedido >= 0 && pedido < plan.dias.length ? pedido : diaQueToca(plan, series).dia;
  const dia = plan.dias[indice];
  const hoy = hoyLocal();
  // Cambios solo por hoy: ?c=viejo:nuevo (por ejemplo, el aparato está ocupado)
  const cambiosHoy = new Map((Array.isArray(params.c) ? params.c : params.c ? [params.c] : []).map((x) => x.split(":") as [string, string]).filter(([v, n]) => ejercicioPorId(v) && ejercicioPorId(n)));
  const enlace = (extra: Map<string, string>) => {
    const q = new URLSearchParams({ dia: String(indice) });
    for (const [v, n] of extra) q.append("c", `${v}:${n}`);
    return `/entrenar?${q}`;
  };
  const enPlan = dia.ejercicios.map((e) => e.ejercicio);
  const primero = dia.ejercicios[0];
  const pesoPrimero = primero ? sugerir(primero, series.filter((s) => s.ejercicio === (cambiosHoy.get(primero.ejercicio) ?? primero.ejercicio) && s.fecha < hoy)).peso : null;

  return (
    <div className="grid gap-4">
      <Titulo detalle={`${dia.enfoque}. Anota peso y repeticiones de cada serie y toca Guardar.`}>{dia.nombre}</Titulo>
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Días de la rutina">
        {plan.dias.map((d, i) => (
          <Link key={d.nombre} href={`/entrenar?dia=${i}`} className={cn("flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm", i === indice && "border-primary bg-primary font-semibold text-primary-foreground")}>
            Día {i + 1}
          </Link>
        ))}
      </nav>
      {perfil.volumen < 1 && <p className="rounded-xl border px-4 py-3 text-sm">📉 Esta semana va con 20% menos series porque registraste poca energía o sueño.</p>}

      <Card>
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-primary" />
          <CardTitle className="text-base">Calentamiento (5–8 min)</CardTitle>
        </div>
        <ol className="mt-2 grid list-decimal gap-1 pl-5 text-sm text-muted-foreground">
          <li>3–5 min de caminadora, bici o saltos suaves.</li>
          <li>10 círculos de brazos, 10 de cadera y 10 sentadillas sin peso.</li>
          {primero && (
            <li>
              Aproximación de {ejercicioPorId(cambiosHoy.get(primero.ejercicio) ?? primero.ejercicio)?.nombre}:{" "}
              {pesoPrimero ? `10 reps con ${redondear(pesoPrimero * 0.5)} kg y 5 con ${redondear(pesoPrimero * 0.75)} kg.` : "10 reps ligeras y 5 a medio peso."}
            </li>
          )}
        </ol>
      </Card>

      {dia.ejercicios.map((original, n) => {
        const id = cambiosHoy.get(original.ejercicio) ?? original.ejercicio;
        const e = conVolumen({ ...original, ejercicio: id }, perfil.volumen);
        const ej = ejercicioPorId(id);
        if (!ej) return null;
        const historial = series.filter((s) => s.ejercicio === id && s.fecha < hoy);
        const deHoy = series.filter((s) => s.ejercicio === id && s.fecha === hoy).sort((a, b) => a.serie - b.serie);
        const sug = sugerir(e, historial, perfil.pausa_hasta, hoy);
        const ultima = sesionesDe(historial, id)[0];
        const filas = Math.max(e.series, deHoy.length);
        const otros = alternativas(original.ejercicio, perfil, enPlan).slice(0, 3);
        const cambiado = id !== original.ejercicio;
        return (
          <Card key={original.ejercicio}>
            <div className="mb-3 flex gap-3">
              <Link href={`/ejercicios/${id}`} className="shrink-0">
                <FotoEjercicio id={id} nombre={ej.nombre} className="size-24" />
              </Link>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Ejercicio {n + 1} de {dia.ejercicios.length}
                  {cambiado && ` · en vez de ${ejercicioPorId(original.ejercicio)?.nombre}`}
                </p>
                <CardTitle className="text-base leading-tight">{ej.nombre}</CardTitle>
                <p className="mt-1 text-sm font-semibold">
                  {sug.meta}
                  {e.rir !== undefined && !e.segundos && <span className="font-normal text-muted-foreground"> · deja {e.rir} en reserva</span>}
                </p>
                <p className={cn("mt-1 text-xs", COLORES[sug.tipo])}>{sug.mensaje}</p>
              </div>
            </div>
            {ultima && (
              <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-xs">
                <strong>La última vez</strong> ({fechaBonita(ultima[0].fecha)}): {ultima.map((x) => `${x.peso_kg ? `${x.peso_kg} kg × ` : ""}${x.reps}`).join(" · ")}
              </p>
            )}
            <Formulario accion={guardarEjercicio} boton={deHoy.length ? "Actualizar" : "Guardar"}>
              <input type="hidden" name="ejercicio" value={id} />
              <input type="hidden" name="dia" value={indice} />
              <div className="grid grid-cols-[2rem_1fr_1fr_4.5rem] items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground">#</span>
                <span className="text-xs text-muted-foreground">{ej.equipo === "corporal" ? "Extra (kg)" : "Peso (kg)"}</span>
                <span className="text-xs text-muted-foreground">{e.segundos ? "Segundos" : "Reps"}</span>
                <span className="text-xs text-muted-foreground">RIR</span>
                {Array.from({ length: filas }, (_, i) => (
                  <div key={i} className="contents">
                    <span className="text-center font-semibold">{i + 1}</span>
                    <Input name="peso" inputMode="decimal" aria-label={`Peso serie ${i + 1}`} defaultValue={deHoy[i]?.peso_kg ?? sug.peso ?? ""} placeholder={ej.equipo === "corporal" ? "0" : "kg"} />
                    <Input name="reps" inputMode="numeric" aria-label={`Repeticiones serie ${i + 1}`} defaultValue={deHoy[i]?.reps ?? ""} placeholder={`${e.reps_min}–${e.reps_max}`} />
                    <select name="rir" aria-label={`Repeticiones en reserva serie ${i + 1}`} defaultValue={deHoy[i]?.rir ?? ""} className="min-h-12 rounded-xl border bg-background px-2">
                      <option value="">–</option>
                      {[0, 1, 2, 3, 4].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm text-muted-foreground">
                <input type="checkbox" name="dolor" defaultChecked={deHoy[0]?.nota === "dolor"} className="size-5 accent-[#f87171]" />
                Sentí dolor agudo o mareo
              </label>
            </Formulario>
            <div className="mt-3 flex flex-wrap gap-2">
              <Cronometro segundos={e.descanso_seg} />
              {otros.length > 0 && (
                <details className="w-full">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm text-primary">
                    <ArrowLeftRight className="size-4" /> ¿Está ocupado? Cámbialo por hoy
                  </summary>
                  <div className="mt-2 grid gap-2">
                    {otros.map((o) => (
                      <Link key={o.id} href={enlace(new Map([...cambiosHoy, [original.ejercicio, o.id]]))} className="flex items-center gap-3 rounded-xl border p-2 text-sm active:bg-muted">
                        <FotoEjercicio id={o.id} nombre={o.nombre} quieta className="size-12 shrink-0" />
                        {o.nombre}
                      </Link>
                    ))}
                  </div>
                </details>
              )}
              {cambiado && (
                <div className="flex w-full flex-wrap gap-2">
                  <Link href={enlace(new Map([...cambiosHoy].filter(([v]) => v !== original.ejercicio)))} className="flex min-h-11 items-center rounded-xl border px-3 text-sm">
                    Regresar al original
                  </Link>
                  <BotonAccion accion={cambiarEjercicioSiempre.bind(null, original.ejercicio, id)} variant="outline" size="sm">
                    Usar este siempre
                  </BotonAccion>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {dia.cardio_min && (
        <Card>
          <CardTitle className="text-base">Cardio: {dia.cardio_min} minutos</CardTitle>
          <CardDescription>Caminadora inclinada, bici o elíptica a un ritmo en el que puedas hablar con esfuerzo.</CardDescription>
        </Card>
      )}
      <details className="rounded-2xl border bg-card p-4 text-sm">
        <summary className="cursor-pointer font-medium">¿Qué es RIR?</summary>
        <p className="mt-2 text-muted-foreground">
          Repeticiones en reserva: cuántas más podrías hacer con buena técnica al terminar la serie. RIR 2 = te quedaron 2 en el tanque. Anotarlo ayuda a saber si el peso es el
          correcto.
        </p>
      </details>
    </div>
  );
}
