import Link from "next/link";
import { FestejoMedallas } from "@/components/festejo-medallas";
import { Insignia } from "@/components/insignia";
import { Card } from "@/components/ui/card";
import { formatoValor, logros, NIVELES, NOMBRE_NIVEL } from "@/lib/medallas";
import { misMedallas } from "@/lib/medallas-datos";

export const dynamic = "force-dynamic";

// Álbum de medallas: panal de insignias. Toca una para ver sus 5 niveles y cuánto te falta.
export default async function Medallas({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m: elegida } = await searchParams;
  const lista = await misMedallas();
  const ganados = logros(lista);
  const total = lista.length * NIVELES.length;
  const sel = lista.find((m) => m.id === elegida) ?? lista[0];
  // Panal: filas de 4 y 3, centradas
  const filas: (typeof lista)[] = [];
  for (let i = 0, ancho = 4; i < lista.length; i += ancho, ancho = ancho === 4 ? 3 : 4) filas.push(lista.slice(i, i + ancho));

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Mis medallas</h1>
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">{ganados.length}</strong> de {total} niveles · cada medalla sube de Bronce a Ónix.
        </p>
      </div>

      <Card className="grid gap-4">
        <div className="flex items-center gap-4">
          <Insignia icono={sel.icono} nivel={sel.nivel} tamano={104} />
          <div className="min-w-0">
            <p className="text-xl font-semibold">{sel.nombre}</p>
            <p className="text-sm text-primary">{sel.nivel ? `Nivel ${NOMBRE_NIVEL[sel.nivel]}` : "Aún sin nivel"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{sel.que}</p>
          </div>
        </div>
        {sel.siguiente !== null ? (
          <div className="grid gap-1.5">
            <p className="text-sm">
              <strong>{formatoValor(sel, sel.actual)}</strong> de {formatoValor(sel, sel.siguiente)} {sel.porcentaje ? sel.unidad : sel.unidad} para{" "}
              <strong>{NOMBRE_NIVEL[sel.siguienteNivel!]}</strong>
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (sel.actual / sel.siguiente) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-primary">🏆 ¡Llegaste a Ónix, el nivel más alto!</p>
        )}
        <div className="grid grid-cols-5 gap-1 text-center">
          {NIVELES.map((n, i) => (
            <div key={n} className="grid justify-items-center gap-0.5">
              <Insignia icono={sel.icono} nivel={i <= sel.indice ? n : null} tamano={52} />
              <span className="text-[11px] font-semibold">{NOMBRE_NIVEL[n]}</span>
              <span className="text-[11px] text-muted-foreground">{formatoValor(sel, sel.metas[i])}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="panal" aria-label="Todas tus medallas">
        {filas.map((fila, i) => (
          <div key={i} className="panal-fila">
            {fila.map((m) => (
              <Link key={m.id} href={`/medallas?m=${m.id}`} scroll={false} className={m.id === sel.id ? "panal-celda elegida" : "panal-celda"} aria-label={`${m.nombre}: ${m.nivel ? NOMBRE_NIVEL[m.nivel] : "sin nivel"}`}>
                <Insignia icono={m.icono} nivel={m.nivel} tamano={80} />
              </Link>
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Toca una medalla para ver sus niveles. Pronto habrá más. 🏅</p>
      <FestejoMedallas logros={ganados} />
    </div>
  );
}
