import Link from "next/link";
import { formatoValor, logros, NOMBRE_NIVEL } from "@/lib/medallas";
import { misMedallas } from "@/lib/medallas-datos";
import { FestejoMedallas } from "./festejo-medallas";
import { Insignia } from "./insignia";

// En Hoy: tus niveles ganados, la medalla más cerca de subir y el festejo si subiste
export async function MedallasHoy() {
  const lista = await misMedallas().catch(() => null);
  if (!lista) return null;
  const ganados = logros(lista);
  const cerca = lista.filter((m) => m.siguiente !== null).sort((a, b) => b.actual / b.siguiente! - a.actual / a.siguiente!)[0];
  return (
    <>
      <Link href={cerca ? `/medallas?m=${cerca.id}` : "/medallas"} className="flex min-h-16 items-center gap-3 rounded-2xl border bg-card px-4 py-2 active:bg-muted">
        {cerca && <Insignia icono={cerca.icono} nivel={cerca.nivel} tamano={44} />}
        <span className="min-w-0 flex-1 text-sm">
          <strong>Medallas: {ganados.length} niveles</strong>
          {cerca && (
            <span className="block truncate text-muted-foreground">
              {cerca.nombre} {NOMBRE_NIVEL[cerca.siguienteNivel!]}: {formatoValor(cerca, cerca.actual)} de {formatoValor(cerca, cerca.siguiente!)}
            </span>
          )}
        </span>
        <span className="text-sm text-primary">Álbum →</span>
      </Link>
      <FestejoMedallas logros={ganados} />
    </>
  );
}
