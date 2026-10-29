import Link from "next/link";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardTitle } from "@/components/ui/card";
import { hoyLocal } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";

const ICONO = { calorias: "🍽️", volumen: "📉", ejercicio: "🔁", salud: "⚠️", rutina: "🗓️" } as const;

export default async function Listo({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  let consejos: string[] = [];
  try {
    consejos = (JSON.parse(c ?? "[]") as unknown[]).map(String).slice(0, 6);
  } catch {}
  const ajustes = (await (await obtenerRepo()).ajustes(10)).filter((a) => a.fecha === hoyLocal());
  return (
    <div className="grid gap-4">
      <Titulo detalle="Guardé tu semana y revisé tu progreso.">¡Registro listo! ✅</Titulo>
      <Card>
        <CardTitle className="mb-3 text-base">{ajustes.length ? "Esto cambié en tu plan" : "Tu plan sigue igual"}</CardTitle>
        {ajustes.length ? (
          <ul className="grid gap-3">
            {ajustes.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="text-xl leading-none">{ICONO[a.tipo]}</span>
                <span>
                  <strong className="block">{a.detalle}</strong>
                  <span className="text-muted-foreground">{a.motivo}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No hizo falta ajustar nada esta semana.</p>
        )}
      </Card>
      {consejos.length > 0 && (
        <Card>
          <CardTitle className="mb-2 text-base">Para esta semana</CardTitle>
          <ul className="grid list-disc gap-2 pl-5 text-sm">
            {consejos.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/progreso" className="flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">
          Ver mi progreso
        </Link>
        <Link href="/" className="flex min-h-12 items-center justify-center rounded-xl border font-semibold">
          Ir a Hoy
        </Link>
      </div>
    </div>
  );
}
