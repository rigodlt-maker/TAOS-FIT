import { notFound } from "next/navigation";
import { FotoEjercicio } from "@/components/foto-ejercicio";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardTitle } from "@/components/ui/card";
import { NOMBRES_EQUIPO, NOMBRES_PATRON, ejercicioPorId } from "@/lib/ejercicios";
import { fechaBonita } from "@/lib/entreno";
import { sesionesDe, unaRM } from "@/lib/progresion";
import { obtenerRepo } from "@/lib/sesion";

const NIVEL = { 1: "Principiante", 2: "Intermedio", 3: "Avanzado" } as const;
const MOLESTIA = { rodilla: "rodilla", hombro: "hombro", espalda_baja: "espalda baja", muneca: "muñeca" } as const;

export default async function Ejercicio({ params }: { params: Promise<{ id: string }> }) {
  const ej = ejercicioPorId((await params).id);
  if (!ej) notFound();
  const sesiones = sesionesDe(await (await obtenerRepo()).series({ ejercicio: ej.id }), ej.id).slice(0, 8);
  return (
    <div className="grid gap-4">
      <Titulo detalle={`${NOMBRES_PATRON[ej.patron]} · ${NOMBRES_EQUIPO[ej.equipo]} · ${NIVEL[ej.dificultad]}`}>{ej.nombre}</Titulo>
      <FotoEjercicio id={ej.id} nombre={ej.nombre} className="aspect-[3/2] w-full" />
      <Card>
        <CardTitle className="mb-2 text-base">Cómo se hace</CardTitle>
        <ol className="grid list-decimal gap-2 pl-5 text-sm">
          {ej.pasos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        {ej.evitar?.length ? <p className="mt-3 text-xs text-muted-foreground">Si te molesta {ej.evitar.map((l) => MOLESTIA[l]).join(" o ")}, Tao Fit no te lo propone.</p> : null}
      </Card>
      {sesiones.length > 0 && (
        <Card>
          <CardTitle className="mb-2 text-base">Tu historial</CardTitle>
          <ul className="grid gap-1 text-sm">
            {sesiones.map((s) => (
              <li key={s[0].fecha} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{fechaBonita(s[0].fecha)}</span>
                <span className="text-right">
                  {s.map((x) => `${x.peso_kg ? `${x.peso_kg}×` : ""}${x.reps}`).join(" · ")}
                  <span className="ml-2 text-xs text-muted-foreground">máx. est. {Math.round(Math.max(...s.map((x) => unaRM(x.peso_kg, x.reps))))}{s[0].peso_kg ? " kg" : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="text-center text-xs text-muted-foreground">Fotos: Free Exercise DB (dominio público)</p>
    </div>
  );
}
