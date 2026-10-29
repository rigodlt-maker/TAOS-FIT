import { CalendarCheck, Ruler } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Grafica } from "@/components/grafica";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { contornos } from "@/lib/avatar";
import { composicion, nivelGrasa } from "@/lib/composicion";
import { ejercicioPorId } from "@/lib/ejercicios";
import { fechaBonita, hoyLocal } from "@/lib/entreno";
import { sesionesDe, unaRM } from "@/lib/progresion";
import { obtenerRepo } from "@/lib/sesion";
import { registroPendiente } from "@/lib/semana";
import { cn } from "@/lib/utils";

const ICONO = { calorias: "🍽️", volumen: "📉", ejercicio: "🔁", salud: "⚠️", rutina: "🗓️" } as const;
const COLORES = ["#d4af37", "#60a5fa", "#f472b6", "#34d399"];

export default async function Progreso({ searchParams }: { searchParams: Promise<{ vs?: string }> }) {
  const { vs } = await searchParams;
  const repo = await obtenerRepo();
  const [perfil, medidas, registros, ajustes, series, plan] = await Promise.all([repo.perfil(), repo.medidas(), repo.registros(), repo.ajustes(30), repo.series(), repo.planActivo()]);
  if (!perfil) redirect("/bienvenida");
  const ultima = medidas.at(-1);
  const contra = medidas.length > 1 ? (vs === "anterior" ? medidas.at(-2)! : medidas[0]) : null;
  const comp = ultima ? composicion(perfil, ultima) : null;
  const compAntes = contra ? composicion(perfil, contra) : null;
  const faltan = ultima ? contornos(perfil, ultima).estimadas : [];

  // Peso: registros semanales (promedio) y, donde no hay, las medidas
  const pesoPorFecha = new Map<string, number>();
  for (const m of medidas) pesoPorFecha.set(m.fecha, m.peso_kg);
  for (const r of registros) pesoPorFecha.set(r.fecha, r.peso_kg);
  const peso = [...pesoPorFecha.entries()].map(([fecha, valor]) => ({ fecha, valor }));
  const medida = (campo: "cintura_cm" | "brazo_cm" | "cadera_cm") => medidas.filter((m) => m[campo] != null).map((m) => ({ fecha: m.fecha, valor: m[campo]! }));

  // Cargas: los 3 ejercicios del plan con más sesiones registradas
  const ejercicios = [...new Set(plan?.dias.flatMap((d) => d.ejercicios.map((e) => e.ejercicio)) ?? [])]
    .map((id) => ({ id, sesiones: sesionesDe(series, id) }))
    .filter((e) => e.sesiones.length >= 2)
    .sort((a, b) => b.sesiones.length - a.sesiones.length)
    .slice(0, 3);

  return (
    <div className="grid gap-4">
      <Titulo detalle="Tu personaje cambia con tus medidas; las gráficas, con tus registros.">Tu progreso</Titulo>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/registro" className={cn("flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold", registroPendiente(perfil, registros, hoyLocal()) && "border-primary bg-primary text-primary-foreground")}>
          <CalendarCheck className="size-5" /> Registro semanal
        </Link>
        <Link href="/cuerpo" className="flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold">
          <Ruler className="size-5" /> Medidas
        </Link>
      </div>

      {ultima && comp && (
        <Card>
          {contra && (
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              {[
                ["inicio", "Contra el inicio"],
                ["anterior", "Contra la anterior"],
              ].map(([v, n]) => (
                <Link key={v} href={`/progreso?vs=${v}`} className={cn("flex min-h-11 items-center justify-center rounded-xl border", (vs === "anterior") === (v === "anterior") && "border-primary text-primary")}>
                  {n}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <Avatar perfil={perfil} medida={ultima} antes={contra} className="h-72 w-36 shrink-0" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-muted-foreground">{fechaBonita(ultima.fecha)}</p>
              <p className="mt-1 text-3xl font-semibold">{ultima.peso_kg} kg</p>
              <p className="mt-2 text-xl font-semibold">{comp.grasa.toFixed(1)}%</p>
              <p className="text-muted-foreground">
                grasa · {nivelGrasa(perfil.cuerpo, comp.grasa)}
                {comp.metodoGrasa === "estimado" && " (estimada)"}
              </p>
              <p className="mt-2">
                Masa magra: <strong>{comp.magraKg.toFixed(1)} kg</strong>
              </p>
              {contra && compAntes && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Punteado: tú el {fechaBonita(contra.fecha)}. Grasa {comp.grasa - compAntes.grasa > 0 ? "+" : ""}
                  {(comp.grasa - compAntes.grasa).toFixed(1)}%, magra {comp.magraKg - compAntes.magraKg > 0 ? "+" : ""}
                  {(comp.magraKg - compAntes.magraKg).toFixed(1)} kg.
                </p>
              )}
            </div>
          </div>
          <Link href="/personaje" className="mt-3 flex min-h-11 items-center justify-center rounded-xl border text-sm text-primary">
            Personalizar mi personaje
          </Link>
          {faltan.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Estimado por tu peso (no medido): {faltan.join(", ")}.</p>}
        </Card>
      )}

      <Card>
        <CardTitle className="mb-1 text-base">Peso promedio</CardTitle>
        <CardDescription className="mb-2">{perfil.meta_peso_kg ? `Meta: ${perfil.meta_peso_kg} kg` : "Agrega una meta en Mi perfil"}</CardDescription>
        <Grafica series={[{ nombre: "Peso", color: COLORES[0], puntos: peso }]} unidad="kg" />
      </Card>

      <Card>
        <CardTitle className="mb-2 text-base">Medidas</CardTitle>
        <Grafica
          series={[
            { nombre: "Cintura", color: COLORES[0], puntos: medida("cintura_cm") },
            { nombre: "Cadera", color: COLORES[2], puntos: medida("cadera_cm") },
            { nombre: "Brazo", color: COLORES[1], puntos: medida("brazo_cm") },
          ]}
          unidad="cm"
        />
      </Card>

      <Card>
        <CardTitle className="mb-1 text-base">Fuerza en tus ejercicios principales</CardTitle>
        <CardDescription className="mb-2">Máximo estimado (kg que podrías levantar 1 vez) en cada sesión.</CardDescription>
        <Grafica
          series={ejercicios.map((e, i) => ({
            nombre: ejercicioPorId(e.id)?.nombre ?? e.id,
            color: COLORES[i],
            puntos: e.sesiones.map((s) => ({ fecha: s[0].fecha, valor: Math.round(Math.max(...s.map((x) => unaRM(x.peso_kg, x.reps)))) })),
          }))}
          unidad="kg"
          decimales={0}
        />
      </Card>

      <Card id="ajustes">
        <CardTitle className="mb-1 text-base">Historial de ajustes</CardTitle>
        <CardDescription className="mb-3">Cada cambio a tu plan, con el dato que lo motivó.</CardDescription>
        {ajustes.length ? (
          <ul className="grid gap-3">
            {ajustes.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="text-xl leading-none">{ICONO[a.tipo]}</span>
                <span className="min-w-0">
                  <strong className="block">{a.detalle}</strong>
                  <span className="text-muted-foreground">{a.motivo}</span>
                  <span className="block text-xs text-muted-foreground">{fechaBonita(a.fecha)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Todavía no hay ajustes. Llegan con tus registros semanales.</p>
        )}
      </Card>
    </div>
  );
}
