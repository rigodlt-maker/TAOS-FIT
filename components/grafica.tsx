// Gráfica de líneas en SVG, rápida y sin librerías. Cada serie: puntos por fecha.
type Serie = { nombre: string; color: string; puntos: { fecha: string; valor: number }[] };

const corta = (f: string) => new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${f}T12:00:00Z`)).replace(".", "");

export function Grafica({ series, unidad, alto = 160, decimales = 1 }: { series: Serie[]; unidad: string; alto?: number; decimales?: number }) {
  const con = series.filter((s) => s.puntos.length);
  const todos = con.flatMap((s) => s.puntos);
  if (todos.length < 2) return <p className="py-6 text-center text-sm text-muted-foreground">Aún no hay suficientes datos. Aparecerá con tu segundo registro.</p>;
  const W = 340;
  const H = alto;
  const izq = 34;
  const der = 8;
  const arriba = 10;
  const abajo = 22;
  const t = (f: string) => Date.parse(`${f}T12:00:00Z`);
  const [t0, t1] = [Math.min(...todos.map((p) => t(p.fecha))), Math.max(...todos.map((p) => t(p.fecha)))];
  let [v0, v1] = [Math.min(...todos.map((p) => p.valor)), Math.max(...todos.map((p) => p.valor))];
  const margen = Math.max((v1 - v0) * 0.15, Math.abs(v1) * 0.01, 0.5);
  v0 -= margen;
  v1 += margen;
  const x = (f: string) => izq + ((t(f) - t0) / Math.max(1, t1 - t0)) * (W - izq - der);
  const y = (v: number) => arriba + (1 - (v - v0) / (v1 - v0)) * (H - arriba - abajo);
  const marcas = [v0 + (v1 - v0) * 0.15, (v0 + v1) / 2, v1 - (v1 - v0) * 0.15];
  return (
    <figure className="grid gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={con.map((s) => `${s.nombre}: de ${s.puntos[0].valor} a ${s.puntos.at(-1)!.valor} ${unidad}`).join(". ")}>
        {marcas.map((m) => (
          <g key={m}>
            <line x1={izq} x2={W - der} y1={y(m)} y2={y(m)} stroke="var(--border)" strokeDasharray="3 4" />
            <text x={izq - 4} y={y(m) + 3} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">
              {m.toFixed(decimales)}
            </text>
          </g>
        ))}
        <text x={izq} y={H - 6} fontSize="9" fill="var(--muted-foreground)">
          {corta(new Date(t0).toISOString().slice(0, 10))}
        </text>
        <text x={W - der} y={H - 6} fontSize="9" textAnchor="end" fill="var(--muted-foreground)">
          {corta(new Date(t1).toISOString().slice(0, 10))}
        </text>
        {con.map((s) => {
          const pts = [...s.puntos].sort((a, b) => a.fecha.localeCompare(b.fecha));
          const ult = pts.at(-1)!;
          return (
            <g key={s.nombre}>
              <polyline points={pts.map((p) => `${x(p.fecha)},${y(p.valor)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p) => (
                <circle key={p.fecha} cx={x(p.fecha)} cy={y(p.valor)} r="2.6" fill={s.color} />
              ))}
              <circle cx={x(ult.fecha)} cy={y(ult.valor)} r="4.5" fill={s.color} stroke="var(--card)" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      {con.length > 1 && (
        <figcaption className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {con.map((s) => (
            <span key={s.nombre} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.nombre}: {s.puntos.at(-1)!.valor.toFixed(decimales)} {unidad}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
