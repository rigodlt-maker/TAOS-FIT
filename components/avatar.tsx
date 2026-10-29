import { ALTO, ANCHO, PIELES, figura, normalizarApariencia, tono, type Apariencia, type Peinado } from "@/lib/avatar";
import type { Medida, Perfil } from "@/lib/tipos";

type Props = {
  perfil: Pick<Perfil, "cuerpo" | "altura_cm" | "nacimiento"> & { avatar?: Apariencia | null };
  medida: Medida;
  antes?: Medida | null;
  apariencia?: Apariencia; // para la vista previa del editor
  className?: string;
  titulo?: string;
  soloCara?: boolean; // retrato (cabeza y hombros) para encabezados
};

// Coordenadas de la cabeza: centro 120,90; radios 60 × 64
const GORRO = "M62,108 C52,40 96,16 120,16 C148,16 190,38 178,108 C172,84 160,66 142,62 C122,70 96,64 80,76 C70,84 65,96 62,108 Z";

// Pelo que va detrás de la cabeza y los hombros
function PeloAtras({ peinado, color }: { peinado: Peinado; color: string }) {
  switch (peinado) {
    case "largo":
      return <path d="M56,100 C48,26 192,26 184,100 L192,214 C174,226 152,218 146,202 L144,150 L96,150 L94,202 C88,218 66,226 48,214 Z" fill={color} />;
    case "ondulado":
      return <path d="M56,98 C48,26 192,26 184,98 C196,120 184,138 194,156 C204,176 186,190 172,186 C160,190 150,176 148,160 L92,160 C90,176 80,190 68,186 C54,190 36,176 46,156 C56,138 44,120 56,98 Z" fill={color} />;
    case "bob":
      return <path d="M54,100 C46,26 194,26 186,100 L188,150 C176,164 156,158 150,146 L90,146 C84,158 64,164 52,150 Z" fill={color} />;
    case "afro":
      return <circle cx="120" cy="74" r="84" fill={color} />;
    case "coleta":
      return <path d="M156,36 C204,36 214,112 200,172 C194,196 174,190 180,160 C188,116 182,74 156,56 Z" fill={color} />;
    case "rizado":
      return <ellipse cx="120" cy="70" rx="72" ry="58" fill={color} />;
    default:
      return null;
  }
}

function PeloFrente({ peinado, relleno, color }: { peinado: Peinado; relleno: string; color: string }) {
  if (peinado === "calvo") return <path d={GORRO} fill={color} opacity=".16" />;
  if (peinado === "rizado" || peinado === "afro") {
    const grande = peinado === "afro";
    const rizos: [number, number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (1.02 + (i / 10) * 0.96);
      rizos.push([120 + Math.cos(a) * (grande ? 66 : 60), 92 + Math.sin(a) * (grande ? 70 : 66), grande ? 19 : 16]);
    }
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI * (1.12 + (i / 6) * 0.76);
      rizos.push([120 + Math.cos(a) * 42, 88 + Math.sin(a) * 50, 15]);
    }
    return (
      <g fill={relleno}>
        {rizos.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
    );
  }
  if (peinado === "cresta")
    return (
      <g fill={relleno}>
        <path d={GORRO} opacity=".25" />
        <path d="M100,64 C100,30 104,14 110,4 L114,22 L120,-2 L126,22 L132,6 C138,18 140,34 140,64 C128,56 112,56 100,64 Z" />
      </g>
    );
  if (peinado === "trenzas")
    return (
      <g fill={relleno}>
        <path d={GORRO} />
        <path d="M120,18 L120,60" stroke={tono(color, -0.3)} strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i}>
            <ellipse cx={62 - i * 0.6} cy={124 + i * 17} rx={9} ry={10.5} />
            <ellipse cx={178 + i * 0.6} cy={124 + i * 17} rx={9} ry={10.5} />
          </g>
        ))}
        <circle cx="58" cy="244" r="5" fill="#d4af37" />
        <circle cx="182" cy="244" r="5" fill="#d4af37" />
      </g>
    );
  return (
    <g fill={relleno}>
      {peinado === "bob" || peinado === "ondulado" ? (
        <path d="M60,104 C56,40 184,40 180,104 C174,78 156,64 120,66 C92,64 70,76 60,104 Z" />
      ) : (
        <path d={GORRO} />
      )}
      {peinado === "copete" && <path d="M82,56 C80,14 128,-4 166,20 C152,22 148,32 152,44 C134,30 106,36 82,56 Z" />}
      {peinado === "lateral" && <path d="M66,86 C70,34 140,12 180,58 C150,46 118,54 96,86 C88,78 76,78 66,86 Z" />}
      {peinado === "chongo" && <circle cx="120" cy="12" r="20" />}
      {peinado === "coleta" && <circle cx="160" cy="44" r="8" fill="#d4af37" />}
      {(peinado === "largo" || peinado === "ondulado") && <path d="M64,104 C62,70 84,52 112,50 C96,62 84,80 80,104 Z" />}
    </g>
  );
}

function Ojos({ a }: { a: Apariencia }) {
  const ojo = (x: number, cerrado: boolean) =>
    cerrado ? (
      <path d={`M${x - 9},106 Q${x},96 ${x + 9},106`} stroke="#1b1a1f" strokeWidth="4" strokeLinecap="round" fill="none" />
    ) : (
      <g>
        <ellipse cx={x} cy={104} rx={a.ojos === "grandes" ? 11 : 8.5} ry={a.ojos === "grandes" ? 13 : 10.5} fill="#1b1a1f" />
        {a.ojos === "grandes" && <ellipse cx={x} cy={106} rx={7} ry={8} fill="#4a2c1a" />}
        <circle cx={x - 2.8} cy={100} r={a.ojos === "grandes" ? 4 : 3} fill="#fff" opacity=".92" />
        <circle cx={x + 2.5} cy={107.5} r={1.4} fill="#fff" opacity=".6" />
        {a.ojos === "pestanas" && (
          <path d={x < 120 ? `M${x - 8},97 l-5,-4 M${x - 5},95 l-3,-5` : `M${x + 8},97 l5,-4 M${x + 5},95 l3,-5`} stroke="#1b1a1f" strokeWidth="2.2" strokeLinecap="round" />
        )}
      </g>
    );
  return (
    <>
      {ojo(98, a.ojos === "felices")}
      {ojo(142, a.ojos === "felices" || a.ojos === "guino")}
    </>
  );
}

function Cejas({ a }: { a: Apariencia }) {
  const ancho = { normales: 6, gruesas: 9, finas: 3.5, arqueadas: 5 }[a.cejas];
  const alto = a.cejas === "arqueadas" ? 72 : 77;
  const color = tono(a.pelo === "#f2f2f2" || a.pelo === "#f1dfa8" ? "#8a5a2c" : a.pelo, -0.1);
  return (
    <g stroke={color} strokeWidth={ancho} strokeLinecap="round" fill="none">
      <path d={`M86,86 Q98,${alto} 110,84`} />
      <path d={`M130,84 Q142,${alto} 154,86`} />
    </g>
  );
}

function Boca({ a, piel }: { a: Apariencia; piel: string }) {
  const tapada = a.vello === "barba" || a.vello === "candado";
  if (a.boca === "risa")
    return (
      <g>
        <path d="M106,132 Q120,152 134,132 Z" fill="#5b2c1d" />
        <path d="M108,133 Q120,137 132,133 L131,137 Q120,141 109,137 Z" fill="#fff" />
      </g>
    );
  if (a.boca === "tranquila") return <path d="M112,137 Q120,140 128,137" stroke={tapada ? tono(piel, 0.3) : "#5b2c1d"} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
  return <path d="M107,135 Q120,144 133,135" stroke={tapada ? tono(piel, 0.3) : "#5b2c1d"} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
}

function Vello({ a, relleno }: { a: Apariencia; relleno: string }) {
  const barba = "M64,104 C64,152 96,168 120,168 C144,168 176,152 176,104 C170,126 158,138 142,136 C132,131 108,131 98,136 C82,138 70,126 64,104 Z";
  const bigote = "M103,129 Q111,121 120,127 Q129,121 137,129 Q128,134 120,131 Q112,134 103,129 Z";
  switch (a.vello) {
    case "barba":
      return <path d={barba} fill={relleno} />;
    case "barba_corta":
      return <path d={barba} fill={relleno} opacity=".45" />;
    case "bigote":
      return <path d={bigote} fill={relleno} />;
    case "candado":
      return (
        <g fill={relleno}>
          <path d={bigote} />
          <path d="M106,146 Q120,166 134,146 Q120,154 106,146 Z" />
        </g>
      );
    default:
      return null;
  }
}

function Lentes({ a }: { a: Apariencia }) {
  if (a.lentes === "ninguno") return null;
  const sol = a.lentes === "sol";
  const marco = (x: number) =>
    a.lentes === "redondos" ? <circle cx={x} cy={104} r={15} /> : <rect x={x - 16} y={92} width={32} height={24} rx={a.lentes === "sol" ? 8 : 5} />;
  return (
    <g stroke="#1d1d22" strokeWidth="3.2" fill={sol ? "#1d1d22" : "#ffffff22"}>
      {marco(98)}
      {marco(142)}
      <path d="M113,102 Q120,98 127,102" fill="none" />
      <path d="M82,100 L64,96 M158,100 L176,96" fill="none" />
      {sol && <path d="M88,96 l8,-2 M132,96 l8,-2" stroke="#fff" strokeWidth="2.5" opacity=".5" />}
    </g>
  );
}

function Accesorio({ a, color }: { a: Apariencia; color: string }) {
  switch (a.accesorio) {
    case "gorra":
      return (
        <g>
          <path d="M58,84 C56,22 184,22 182,84 Z" fill={color} />
          <path d="M60,84 C80,74 160,74 180,84 C198,88 206,96 196,100 C160,92 80,92 60,92 Z" fill={tono(color, -0.25)} />
          <circle cx="120" cy="30" r="5" fill={tono(color, -0.3)} />
        </g>
      );
    case "banda":
      return <path d="M60,70 Q120,44 180,70 L180,84 Q120,58 60,84 Z" fill={color} />;
    case "diadema":
      return <path d="M64,82 Q120,4 176,82" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />;
    case "audifonos":
      return (
        <g>
          <path d="M58,104 C52,10 188,10 182,104" stroke="#26262c" strokeWidth="7" fill="none" />
          <rect x="46" y="88" width="20" height="34" rx="9" fill={color} />
          <rect x="174" y="88" width="20" height="34" rx="9" fill={color} />
        </g>
      );
    case "aretes":
      return (
        <g fill="#d4af37">
          <circle cx="58" cy="124" r="4.5" />
          <circle cx="182" cy="124" r="4.5" />
        </g>
      );
    default:
      return null;
  }
}

// Personaje estilo caricatura 3D. Con "antes" se dibuja encima, punteada, la silueta de otra medición.
export function Avatar({ perfil, medida, antes, apariencia, className, titulo = "Tu avatar", soloCara = false }: Props) {
  const a = normalizarApariencia(apariencia ?? perfil.avatar, perfil.cuerpo);
  const fig = figura(perfil, medida, a.complexion);
  const previa = antes ? figura(perfil, antes, a.complexion) : null;
  const id = `av${medida.id}${JSON.stringify(a)}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 60);
  const piel = PIELES[a.piel] ?? PIELES[2];
  const oscura = tono(piel, -0.25);
  const g = (n: string) => `url(#${id}-${n})`;
  const sudadera = a.prenda === "sudadera";
  const pielTorso = a.prenda === "tirantes" || a.prenda === "top";
  const piernasCubiertas = a.inferior !== "short";
  const vista = soloCara ? "30 0 180 200" : `0 0 ${ANCHO} ${ALTO}`;

  return (
    <svg viewBox={vista} role="img" aria-label={titulo} className={className}>
      <defs>
        <linearGradient id={`${id}-piel`} x1="0" x2="1">
          <stop offset="0" stopColor={tono(piel, -0.2)} />
          <stop offset=".45" stopColor={tono(piel, 0.1)} />
          <stop offset="1" stopColor={tono(piel, -0.16)} />
        </linearGradient>
        <radialGradient id={`${id}-cara`} cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor={tono(piel, 0.16)} />
          <stop offset=".55" stopColor={piel} />
          <stop offset="1" stopColor={tono(piel, -0.18)} />
        </radialGradient>
        <linearGradient id={`${id}-ropa`} x1="0" x2="1">
          <stop offset="0" stopColor={tono(a.ropa, -0.3)} />
          <stop offset=".42" stopColor={tono(a.ropa, 0.15)} />
          <stop offset="1" stopColor={tono(a.ropa, -0.25)} />
        </linearGradient>
        <radialGradient id={`${id}-panza`} cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor={tono(pielTorso && a.prenda === "top" ? piel : a.ropa, 0.2)} />
          <stop offset="1" stopColor={tono(pielTorso && a.prenda === "top" ? piel : a.ropa, -0.15)} />
        </radialGradient>
        <linearGradient id={`${id}-abajo`} x1="0" x2="1">
          <stop offset="0" stopColor={tono(a.color_inferior, -0.35)} />
          <stop offset=".45" stopColor={tono(a.color_inferior, 0.12)} />
          <stop offset="1" stopColor={tono(a.color_inferior, -0.35)} />
        </linearGradient>
        <radialGradient id={`${id}-pelo`} cx=".35" cy=".2" r=".9">
          <stop offset="0" stopColor={tono(a.pelo, 0.28)} />
          <stop offset=".6" stopColor={a.pelo} />
          <stop offset="1" stopColor={tono(a.pelo, -0.3)} />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#d4af37" stopOpacity=".2" />
          <stop offset="1" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-sombra`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity=".45" />
        </filter>
      </defs>

      {!soloCara && <ellipse cx={ANCHO / 2} cy={ALTO * 0.47} rx={ANCHO * 0.5} ry={ALTO * 0.5} fill={g("halo")} />}
      {!soloCara && <ellipse cx={ANCHO / 2} cy={ALTO - 10} rx={70} ry={7} fill="#000" opacity=".45" />}

      <g filter={g("sombra")} transform={soloCara ? undefined : `translate(${ANCHO / 2} ${ALTO - 12}) scale(${fig.escala}) translate(${-ANCHO / 2} ${-(ALTO - 12)})`}>
        <PeloAtras peinado={a.peinado} color={tono(a.pelo, -0.12)} />
        {sudadera && <ellipse cx={120} cy={170} rx={48} ry={18} fill={tono(a.ropa, -0.35)} />}
        {/* Piernas, tenis y short/licra/pants */}
        <g fill={piernasCubiertas ? g("abajo") : g("piel")}>
          {fig.piernas.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {piernasCubiertas &&
          fig.tenis.map(([x], i) => <ellipse key={i} cx={x} cy={404} rx={a.inferior === "pants" ? 15 : 12} ry={a.inferior === "pants" ? 7 : 4} fill={tono(a.color_inferior, -0.4)} />)}
        {fig.tenis.map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x + (i ? -3 : 3)} cy={y + 2} rx={17} ry={8} fill={tono(a.tenis, -0.2)} />
            <ellipse cx={x + (i ? -3 : 3)} cy={y - 1} rx={15} ry={8} fill={a.tenis} />
            <path d={`M${x - 8},${y - 3} h16`} stroke={a.tenis === "#f8f8f8" ? a.ropa : "#f8f8f8"} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <path d={fig.short} fill={g("abajo")} />
        {/* Brazos (de tela con sudadera) y manos */}
        <g fill={sudadera ? g("ropa") : g("piel")}>
          {fig.brazos.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {fig.manos.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={10.5} fill={g("cara")} />
        ))}
        {/* Cuello, torso y prenda */}
        <path d={fig.cuello} fill={oscura} />
        {pielTorso && <path d={fig.torso} fill={g("piel")} />}
        {pielTorso && fig.panza && <ellipse cx={ANCHO / 2} cy={fig.panza.cy} rx={fig.panza.rx} ry={fig.panza.ry} fill={g("cara")} />}
        {a.prenda === "top" && fig.definicion > 0.2 && (
          <g stroke={oscura} strokeWidth="1.5" strokeLinecap="round" opacity={0.2 + fig.definicion * 0.35}>
            <path d="M120,244 L120,282" />
            <path d={`M${120 - fig.cintura * 0.35},256 L${120 + fig.cintura * 0.35},256 M${120 - fig.cintura * 0.33},270 L${120 + fig.cintura * 0.33},270`} />
          </g>
        )}
        <path d={a.prenda === "tirantes" ? fig.tirantes : a.prenda === "top" ? fig.top : fig.torso} fill={g("ropa")} />
        {!pielTorso && fig.panza && <ellipse cx={ANCHO / 2} cy={fig.panza.cy} rx={fig.panza.rx} ry={fig.panza.ry} fill={g("panza")} />}
        {a.prenda === "playera" && fig.mangas.pts.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={fig.mangas.rx} ry={fig.mangas.ry} fill={g("ropa")} />)}
        {sudadera && (
          <g>
            <path d={`M${120 - fig.cintura * 0.55},262 L${120 + fig.cintura * 0.55},262 L${120 + fig.cintura * 0.45},284 L${120 - fig.cintura * 0.45},284 Z`} fill={tono(a.ropa, -0.15)} />
            <path d="M113,176 L111,214 M127,176 L129,214" stroke="#f5f5f5" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}
        <path d="M104,166 Q120,186 136,166" fill={oscura} />
        {fig.musculo > 0.25 && !pielTorso && (
          <g fill="none" stroke={tono(a.ropa, -0.4)} strokeWidth="1.6" strokeLinecap="round" opacity={0.15 + fig.definicion * 0.3}>
            <path d="M92,214 Q106,224 119,214" />
            <path d="M121,214 Q134,224 148,214" />
          </g>
        )}
        {/* Orejas y cabeza */}
        {[60, 180].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={106} rx={11} ry={15} fill={g("cara")} />
            <ellipse cx={x + (x < 120 ? 2 : -2)} cy={106} rx={5} ry={8} fill={oscura} opacity=".35" />
          </g>
        ))}
        <ellipse cx={120} cy={90} rx={60} ry={64} fill={g("cara")} />
        <Vello a={a} relleno={g("pelo")} />
        {/* Cara */}
        <Ojos a={a} />
        <Cejas a={a} />
        <ellipse cx={120} cy={121} rx={8} ry={6.5} fill={tono(piel, -0.1)} />
        <ellipse cx={117.5} cy={118.5} rx={3} ry={2} fill="#fff" opacity=".35" />
        <ellipse cx={86} cy={125} rx={9} ry={5} fill="#ff6b6b" opacity=".22" />
        <ellipse cx={154} cy={125} rx={9} ry={5} fill="#ff6b6b" opacity=".22" />
        {a.pecas && (
          <g fill={tono(piel, -0.35)} opacity=".6">
            {[
              [80, 118],
              [86, 121],
              [92, 117],
              [148, 117],
              [154, 121],
              [160, 118],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} />
            ))}
          </g>
        )}
        <Boca a={a} piel={piel} />
        {a.accesorio !== "gorra" && <PeloFrente peinado={a.peinado} relleno={g("pelo")} color={a.pelo} />}
        <Accesorio a={a} color={a.ropa === "#f5f5f5" ? "#d4af37" : a.ropa} />
        <Lentes a={a} />
      </g>

      {previa && !soloCara && (
        <path
          d={previa.silueta}
          transform={`translate(${ANCHO / 2} ${ALTO - 12}) scale(${previa.escala}) translate(${-ANCHO / 2} ${-(ALTO - 12)})`}
          fill="none"
          stroke="#f5f5f5"
          strokeWidth="1.6"
          strokeDasharray="5 4"
          opacity=".8"
        />
      )}
    </svg>
  );
}
