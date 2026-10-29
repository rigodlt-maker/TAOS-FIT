import { CalendarCheck, ChevronRight, Flame, HeartPulse, Sparkles, Target, Utensils } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { FotoEjercicio } from "@/components/foto-ejercicio";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { alimentoPorId } from "@/lib/alimentos";
import { ejercicioPorId } from "@/lib/ejercicios";
import { diaQueToca, entrenosSemana, fechaBonita, hoyLocal, sumarDias } from "@/lib/entreno";
import { NOMBRE_COMIDA, macros } from "@/lib/menu";
import { indiceDia, menuVigente } from "@/lib/menu-actual";
import { calcularObjetivos } from "@/lib/nutricion";
import { obtenerRepo } from "@/lib/sesion";
import { registroPendiente, tocaEntrenar } from "@/lib/semana";

const saludo = () => {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Mexico_City", hour: "numeric", hour12: false }).format(new Date())) % 24;
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
};

export default async function Hoy({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const { bienvenida } = await searchParams;
  const repo = await obtenerRepo();
  const hoy = hoyLocal();
  const [perfil, medidas, plan, series, registros, ajustes] = await Promise.all([repo.perfil(), repo.medidas(), repo.planActivo(), repo.series({ desde: sumarDias(hoy, -60) }), repo.registros(), repo.ajustes(3)]);
  if (!perfil) redirect("/bienvenida");
  const ultima = medidas.at(-1);
  const semana = entrenosSemana(series);
  const toca = plan ? diaQueToca(plan, series, hoy) : null;
  const dia = plan && toca ? plan.dias[toca.dia] : null;
  const entrenar = toca?.yaHoy || tocaEntrenar(perfil, hoy, semana);
  const menu = await menuVigente(repo, perfil, ultima);
  const comidasHoy = menu?.dias[indiceDia(hoy)]?.comidas ?? [];
  const metas = ultima ? calcularObjetivos(perfil, ultima) : null;
  const pausa = perfil.pausa_hasta && perfil.pausa_hasta >= hoy;
  const ajusteReciente = ajustes.find((a) => a.fecha >= sumarDias(hoy, -7));
  const inicio = medidas[0];
  const meta = perfil.meta_peso_kg;
  const avance = meta && inicio && ultima && inicio.peso_kg !== meta ? Math.min(1, Math.max(0, (inicio.peso_kg - ultima.peso_kg) / (inicio.peso_kg - meta))) : null;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        {ultima && <Avatar perfil={perfil} medida={ultima} soloCara className="size-16 shrink-0 rounded-full bg-card" />}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {saludo()}, {perfil.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">
            Esta semana: {semana} de {perfil.dias_semana} entrenamientos
          </p>
        </div>
      </div>

      {bienvenida && (
        <Card className="border-primary/60">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle>¡Tu plan está listo!</CardTitle>
          </div>
          <CardDescription className="mt-1">Rutina, menú y personaje hechos con tus datos. Empieza por aquí:</CardDescription>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <Link href="/rutina" className="rounded-xl border p-3 active:bg-muted">🏋️ Ver rutina</Link>
            <Link href="/comida" className="rounded-xl border p-3 active:bg-muted">🍽️ Ver menú</Link>
            <Link href="/personaje" className="rounded-xl border p-3 active:bg-muted">🧑‍🎨 Mi personaje</Link>
          </div>
        </Card>
      )}

      {pausa && (
        <p className="flex gap-3 rounded-xl border border-destructive/60 px-4 py-3 text-sm">
          <HeartPulse className="size-5 shrink-0 text-destructive" />
          <span>Pausa de aumentos de peso hasta el {fechaBonita(perfil.pausa_hasta!)} por la molestia que registraste. Si el dolor o el mareo siguen, consulta a un médico.</span>
        </p>
      )}

      {registroPendiente(perfil, registros, hoy) && (
        <Link href="/registro" className="flex min-h-16 items-center gap-3 rounded-2xl border border-primary bg-primary/10 px-4 py-3 active:bg-primary/20">
          <CalendarCheck className="size-6 shrink-0 text-primary" />
          <span className="flex-1 text-sm">
            <strong className="block">Toca tu registro semanal (1 minuto)</strong>
            <span className="text-muted-foreground">Con él ajusto tus calorías y tu rutina.</span>
          </span>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>
      )}

      {dia && toca && (
        <Card>
          <p className="text-sm text-primary">{toca.yaHoy ? "Hoy ya entrenaste 💪" : entrenar ? "Hoy toca" : "Hoy es descanso 😴 · lo siguiente es"}</p>
          <CardTitle className="mt-1">{dia.nombre}</CardTitle>
          <CardDescription className="mb-4">
            {dia.enfoque} · {dia.ejercicios.length} ejercicios{dia.cardio_min ? ` + ${dia.cardio_min} min de cardio` : ""}
          </CardDescription>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {dia.ejercicios.slice(0, 4).map((e) => (
              <FotoEjercicio key={e.ejercicio} id={e.ejercicio} nombre={ejercicioPorId(e.ejercicio)?.nombre ?? ""} quieta className="aspect-square w-full" />
            ))}
          </div>
          <Link href={`/entrenar?dia=${toca.dia}`} className={`flex min-h-12 items-center justify-center rounded-xl font-semibold ${entrenar ? "bg-primary text-primary-foreground" : "border"}`}>
            {toca.yaHoy ? "Ver o corregir lo de hoy" : entrenar ? "Empezar entrenamiento" : "Adelantar este entrenamiento"}
          </Link>
        </Card>
      )}

      {metas && comidasHoy.length > 0 && (
        <Link href="/comida" className="block">
          <Card className="active:bg-muted">
            <div className="flex items-center gap-2">
              <Utensils className="size-5 text-primary" />
              <CardTitle className="flex-1">Tu comida de hoy</CardTitle>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {metas.kcal.toLocaleString("es-MX")} kcal · {metas.proteina} g de proteína
            </p>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {comidasHoy.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-20 shrink-0 text-muted-foreground">{NOMBRE_COMIDA[c.tipo]}</span>
                  <span className="min-w-0 flex-1 truncate">{c.items.map((it) => alimentoPorId(it.alimento)?.nombre).join(", ")}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{Math.round(macros(c.items).kcal)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Link>
      )}

      {meta && ultima && (
        <Card>
          <div className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            <CardTitle className="flex-1 text-base">Tu meta: {meta} kg</CardTitle>
            {perfil.fecha_meta && <span className="text-xs text-muted-foreground">para el {fechaBonita(perfil.fecha_meta)}</span>}
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((avance ?? 0) * 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {inicio?.peso_kg} kg → <strong className="text-foreground">{ultima.peso_kg} kg</strong> → {meta} kg ·{" "}
            {Math.abs(ultima.peso_kg - meta) < 0.3 ? "¡Llegaste! 🎉" : `te faltan ${Math.abs(ultima.peso_kg - meta).toFixed(1)} kg`}
          </p>
        </Card>
      )}

      {ajusteReciente && (
        <Link href="/progreso#ajustes" className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 text-sm active:bg-muted">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <strong className="block">Ajusté tu plan: {ajusteReciente.detalle}</strong>
            <span className="text-muted-foreground">{ajusteReciente.motivo}</span>
          </span>
        </Link>
      )}

      {semana >= perfil.dias_semana && (
        <p className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
          <Flame className="size-5 text-primary" /> ¡Cumpliste tu semana! Descansar también construye músculo.
        </p>
      )}
    </div>
  );
}
