import Link from "next/link";
import { FotoEjercicio } from "@/components/foto-ejercicio";
import { Titulo } from "@/components/taos/encabezado";
import { EJERCICIOS, NOMBRES_EQUIPO, NOMBRES_PATRON, type Patron } from "@/lib/ejercicios";
import { cn } from "@/lib/utils";

const GRUPOS: [string, Patron[]][] = [
  ["Pierna", ["sentadilla", "unilateral", "cuadriceps", "femoral", "pantorrilla"]],
  ["Glúteo y cadera", ["bisagra", "gluteo"]],
  ["Pecho", ["empuje_horizontal", "pecho_aislado"]],
  ["Espalda", ["jalon", "remo"]],
  ["Hombro", ["empuje_vertical", "hombro_lateral", "hombro_posterior"]],
  ["Brazos", ["biceps", "triceps"]],
  ["Abdomen y cardio", ["core", "cardio"]],
];

export default async function Ejercicios({ searchParams }: { searchParams: Promise<{ grupo?: string }> }) {
  const { grupo } = await searchParams;
  const actual = GRUPOS.find(([n]) => n === grupo) ?? GRUPOS[0];
  const lista = EJERCICIOS.filter((e) => actual[1].includes(e.patron));
  return (
    <div className="grid gap-4">
      <Titulo detalle={`${EJERCICIOS.length} ejercicios con fotos de cómo hacerlos`}>Ejercicios</Titulo>
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Grupos musculares">
        {GRUPOS.map(([n]) => (
          <Link key={n} href={`/ejercicios?grupo=${encodeURIComponent(n)}`} className={cn("flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm", n === actual[0] && "border-primary bg-primary font-semibold text-primary-foreground")}>
            {n}
          </Link>
        ))}
      </nav>
      <ul className="grid grid-cols-2 gap-3">
        {lista.map((e) => (
          <li key={e.id}>
            <Link href={`/ejercicios/${e.id}`} className="block rounded-2xl border bg-card p-2 active:bg-muted">
              <FotoEjercicio id={e.id} nombre={e.nombre} quieta className="aspect-[4/3] w-full" />
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-tight">{e.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {NOMBRES_PATRON[e.patron]} · {NOMBRES_EQUIPO[e.equipo]}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
