import Link from "next/link";
import { redirect } from "next/navigation";
import { CerrarEntreno } from "@/components/continuar-entreno";
import { FestejoMedallas } from "@/components/festejo-medallas";
import { Insignia } from "@/components/insignia";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ejercicioPorId } from "@/lib/ejercicios";
import { hoyLocal } from "@/lib/entreno";
import { formatoValor, logros, NOMBRE_NIVEL } from "@/lib/medallas";
import { misMedallas } from "@/lib/medallas-datos";
import { obtenerRepo } from "@/lib/sesion";

export const dynamic = "force-dynamic";

// Fin del entrenamiento: resumen del día, medalla más cercana y festejo si subiste de nivel
export default async function EntrenoListo({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams;
  const repo = await obtenerRepo();
  const hoy = hoyLocal();
  const [series, lista] = await Promise.all([repo.series({ desde: hoy }), misMedallas()]);
  const deHoy = series.filter((s) => s.fecha === hoy);
  if (!deHoy.length) redirect(`/entrenar${dia ? `?dia=${dia}` : ""}`);

  const ejercicios = [...new Set(deHoy.map((s) => s.ejercicio))];
  const reps = deHoy.reduce((t, s) => t + s.reps, 0);
  const kilos = Math.round(deHoy.reduce((t, s) => t + s.peso_kg * s.reps, 0));
  const dolor = deHoy.some((s) => s.nota === "dolor");
  // La medalla a la que le falta menos para su siguiente nivel
  const cerca = lista
    .filter((m) => m.siguiente !== null)
    .map((m) => ({ m, falta: (m.siguiente! - m.actual) / m.siguiente! }))
    .sort((a, b) => a.falta - b.falta)[0]?.m;

  return (
    <div className="grid gap-4">
      <div className="pt-2 text-center">
        <p className="text-5xl">🏁</p>
        <h1 className="mt-2 text-2xl font-semibold">¡Entrenamiento terminado!</h1>
        <p className="mt-1 text-muted-foreground">{dolor ? "Cuídate: marcaste dolor o mareo. Descansa y, si sigue, consulta a un médico." : "Buen trabajo. Hoy sumaste a tu meta. 💪"}</p>
      </div>

      <Card className="flex justify-around gap-2 text-center">
        <CerrarEntreno />
        <div>
          <p className="text-2xl font-semibold">{deHoy.length}</p>
          <p className="text-xs text-muted-foreground">series</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{kilos ? kilos.toLocaleString("es-MX") : reps}</p>
          <p className="text-xs text-muted-foreground">{kilos ? "kg levantados" : "repeticiones"}</p>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-2 text-base">Lo que hiciste hoy</CardTitle>
        <ul className="grid gap-2 text-sm">
          {ejercicios.map((id) => {
            const s = deHoy.filter((x) => x.ejercicio === id).sort((a, b) => a.serie - b.serie);
            return (
              <li key={id}>
                <p className="font-medium">✓ {ejercicioPorId(id)?.nombre ?? id}</p>
                <p className="text-muted-foreground">{s.map((x) => `${x.peso_kg ? `${x.peso_kg} kg × ` : ""}${x.reps}`).join(" · ")}</p>
              </li>
            );
          })}
        </ul>
      </Card>

      {cerca && cerca.siguienteNivel && (
        <Link href={`/medallas?m=${cerca.id}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 active:bg-muted">
          <Insignia icono={cerca.icono} nivel={cerca.nivel} tamano={56} />
          <span className="min-w-0">
            <span className="block font-medium">
              {cerca.nombre}: vas por {NOMBRE_NIVEL[cerca.siguienteNivel]}
            </span>
            <span className="block text-sm text-muted-foreground">
              {formatoValor(cerca, cerca.actual)} de {formatoValor(cerca, cerca.siguiente!)} {cerca.unidad}
            </span>
          </span>
        </Link>
      )}

      <CardDescription className="text-center">Lo que anotaste ya quedó guardado. Si algo está mal, regresa y toca “Corregir”.</CardDescription>
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/entrenar${dia ? `?dia=${dia}` : ""}`} className="flex min-h-12 items-center justify-center rounded-xl border text-sm">
          Regresar
        </Link>
        <Link href="/" className="flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">
          Listo
        </Link>
      </div>
      <FestejoMedallas logros={logros(lista)} />
    </div>
  );
}
