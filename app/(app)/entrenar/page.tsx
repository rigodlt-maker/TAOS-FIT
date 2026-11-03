import { ArrowLeftRight, Dumbbell, House } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calentamiento } from "@/components/calentamiento";
import { BorradorSeries } from "@/components/borrador-series";
import { Descanso } from "@/components/descanso";
import { FotoEjercicio } from "@/components/foto-ejercicio";
import { BotonAccion, Formulario } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/campos";
import { cambiarEjercicioSiempre, guardarEjercicio } from "@/lib/acciones";
import { calentamiento, minutosDe } from "@/lib/calentamiento";
import { ejercicioPorId } from "@/lib/ejercicios";
import { diaQueToca, fechaBonita, hoyLocal } from "@/lib/entreno";
import { sesionesDe, sugerir } from "@/lib/progresion";
import { aCasa, alternativas, conVolumen } from "@/lib/rutina";
import { obtenerRepo } from "@/lib/sesion";
import { cn } from "@/lib/utils";

const COLORES = { nuevo: "text-muted-foreground", subir: "text-primary", mantener: "text-muted-foreground", bajar: "text-destructive", estancado: "text-destructive" };
const redondear = (kg: number) => Math.max(0, Math.round(kg / 2.5) * 2.5);

export default async function Entrenar({ searchParams }: { searchParams: Promise<{ dia?: string; c?: string | string[]; casa?: string }> }) {
  const params = await searchParams;
  const repo = await obtenerRepo();
  const [perfil, plan, series] = await Promise.all([repo.perfil(), repo.planActivo(), repo.series()]);
  if (!perfil) redirect("/bienvenida");
  if (!plan) redirect("/rutina");
  const pedido = Number(params.dia);
  const indice = Number.isInteger(pedido) && pedido >= 0 && pedido < plan.dias.length ? pedido : diaQueToca(plan, series).dia;
  const dia = plan.dias[indice];
  const hoy = hoyLocal();
  const enPlan = dia.ejercicios.map((e) => e.ejercicio);
  // "Hoy entreno en casa" (?casa=1): por hoy, todo con tu propio peso. Tu rutina del gym no cambia.
  const puedeCasa = perfil.lugar !== "casa_sin_equipo";
  const enCasa = puedeCasa && params.casa === "1";
  const casa = enCasa ? aCasa(enPlan, perfil) : { cambios: new Map<string, string>(), sinEquivalente: [] as string[] };
  const perfilHoy = enCasa ? { ...perfil, lugar: "casa_sin_equipo" as const } : perfil;
  // Cambios solo por hoy: ?c=viejo:nuevo (por ejemplo, el aparato está ocupado); tienen prioridad sobre los de "en casa"
  const pedidos = (Array.isArray(params.c) ? params.c : params.c ? [params.c] : []).map((x) => x.split(":") as [string, string]).filter(([v, n]) => ejercicioPorId(v) && ejercicioPorId(n));
  const cambiosHoy = new Map([...casa.cambios, ...pedidos]);
  const enlace = (extra: Map<string, string>) => {
    const q = new URLSearchParams({ dia: String(indice) });
    if (enCasa) q.set("casa", "1");
    for (const [v, n] of extra) if (casa.cambios.get(v) !== n) q.append("c", `${v}:${n}`);
    return `/entrenar?${q}`;
  };
  const primero = dia.ejercicios[0];
  const zonas = dia.ejercicios.flatMap((e) => ejercicioPorId(cambiosHoy.get(e.ejercicio) ?? e.ejercicio)?.zonas ?? []);
  const movs = calentamiento(zonas, perfil.lesiones, perfilHoy.lugar);
  const pesoPrimero = primero ? sugerir(primero, series.filter((s) => s.ejercicio === (cambiosHoy.get(primero.ejercicio) ?? primero.ejercicio) && s.fecha < hoy)).peso : null;

  // Qué ejercicios ya terminaste hoy (todas sus series guardadas)
  const visibles = dia.ejercicios.filter((o) => !casa.sinEquivalente.includes(o.ejercicio));
  const terminado = (o: (typeof dia.ejercicios)[number]) => {
    const id = cambiosHoy.get(o.ejercicio) ?? o.ejercicio;
    return series.filter((s) => s.ejercicio === id && s.fecha === hoy).length >= conVolumen({ ...o, ejercicio: id }, perfil.volumen).series;
  };
  const hechos = visibles.filter(terminado).length;
  const todos = hechos === visibles.length;

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
      {puedeCasa && (
        <Link
          href={enCasa ? `/entrenar?dia=${indice}` : `/entrenar?dia=${indice}&casa=1`}
          className={cn("flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium", enCasa && "border-primary text-primary")}
        >
          {enCasa ? <Dumbbell className="size-5" /> : <House className="size-5" />}
          {enCasa ? "Volver a mi rutina normal" : "Hoy entreno en casa (sin aparatos)"}
        </Link>
      )}
      {enCasa && (
        <p className="rounded-xl border border-primary/60 px-4 py-3 text-sm">
          🏠 Hoy en casa: cambié lo que necesita aparatos por ejercicios con tu propio peso. Tu rutina normal sigue igual.
          {casa.sinEquivalente.length > 0 && ` Hoy te saltas ${casa.sinEquivalente.map((x) => ejercicioPorId(x)?.nombre).join(", ")}.`}
        </p>
      )}
      {perfil.volumen < 1 && <p className="rounded-xl border px-4 py-3 text-sm">📉 Esta semana va con 20% menos series porque registraste poca energía o sueño.</p>}

      <Calentamiento
        movimientos={movs}
        minutos={minutosDe(movs)}
        clave={`${hoy}-${indice}`}
        aproximacion={
          primero
            ? `${ejercicioPorId(cambiosHoy.get(primero.ejercicio) ?? primero.ejercicio)?.nombre}: ${pesoPrimero ? `10 reps con ${redondear(pesoPrimero * 0.5)} kg y 5 con ${redondear(pesoPrimero * 0.75)} kg.` : "10 reps ligeras y 5 a medio peso."}`
            : undefined
        }
      />

      <div className="grid gap-2 rounded-2xl border bg-card px-4 py-3" aria-label="Avance del entrenamiento">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {hechos} de {visibles.length} ejercicios listos
          </span>
          {todos && <span className="text-primary">¡Completo! 🎉</span>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${visibles.length ? (hechos / visibles.length) * 100 : 0}%` }} />
        </div>
      </div>

      {dia.ejercicios.map((original, n) => {
        if (casa.sinEquivalente.includes(original.ejercicio)) return null;
        const id = cambiosHoy.get(original.ejercicio) ?? original.ejercicio;
        const e = conVolumen({ ...original, ejercicio: id }, perfil.volumen);
        const ej = ejercicioPorId(id);
        if (!ej) return null;
        const historial = series.filter((s) => s.ejercicio === id && s.fecha < hoy);
        const deHoy = series.filter((s) => s.ejercicio === id && s.fecha === hoy).sort((a, b) => a.serie - b.serie);
        const sug = sugerir(e, historial, perfil.pausa_hasta, hoy);
        const ultima = sesionesDe(historial, id)[0];
        const filas = Math.max(e.series, deHoy.length);
        const otros = alternativas(original.ejercicio, perfilHoy, [...enPlan, ...cambiosHoy.values()]).slice(0, 3);
        const cambiado = id !== original.ejercicio;
        const hecho = deHoy.length >= e.series;
        return (
          <Card key={original.ejercicio} className={cn(hecho && "border-primary/50")}>
            {hecho && (
              <div className="flex items-center gap-3">
                <FotoEjercicio id={id} nombre={ej.nombre} quieta className="size-14 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary">✓ Hecho · ejercicio {n + 1} de {dia.ejercicios.length}</p>
                  <p className="truncate font-semibold">{ej.nombre}</p>
                  <p className="text-sm text-muted-foreground">{deHoy.map((x) => `${x.peso_kg ? `${x.peso_kg} kg × ` : ""}${x.reps}`).join(" · ")}</p>
                </div>
              </div>
            )}
            <Plegable abierto={!hecho}>
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
                <BorradorSeries clave={`${indice}:${id}`} hoy={hoy} />
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
                <Descanso segundos={e.descanso_seg} de={`${indice}:${id}`} />
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
                {/* Un cambio de "en casa" no se regresa ni se guarda: tu rutina del gym sigue igual */}
                {cambiado && casa.cambios.get(original.ejercicio) !== id && (
                  <div className="flex w-full flex-wrap gap-2">
                    <Link href={enlace(new Map([...cambiosHoy].filter(([v]) => v !== original.ejercicio)))} className="flex min-h-11 items-center rounded-xl border px-3 text-sm">
                      Regresar al original
                    </Link>
                    {!enCasa && (
                      <BotonAccion accion={cambiarEjercicioSiempre.bind(null, original.ejercicio, id)} variant="outline" size="sm">
                        Usar este siempre
                      </BotonAccion>
                    )}
                  </div>
                )}
              </div>
            </Plegable>
          </Card>
        );
      })}

      {dia.cardio_min && (
        <Card>
          <CardTitle className="text-base">Cardio: {dia.cardio_min} minutos</CardTitle>
          <CardDescription>Caminadora inclinada, bici o elíptica a un ritmo en el que puedas hablar con esfuerzo.</CardDescription>
        </Card>
      )}
      <Link
        href={`/entrenar/listo?dia=${indice}`}
        className={cn("flex min-h-14 items-center justify-center gap-2 rounded-2xl text-base font-semibold", todos ? "bg-primary text-primary-foreground" : "border")}
      >
        🏁 {todos ? "Terminar entrenamiento" : `Terminar entrenamiento (${hechos} de ${visibles.length})`}
      </Link>

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

// Un ejercicio terminado se pliega: queda el resumen y "Corregir" para cambiar algo
function Plegable({ abierto, children }: { abierto: boolean; children: React.ReactNode }) {
  if (abierto) return <>{children}</>;
  return (
    <details className="mt-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm text-primary">Corregir o ver detalle</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
