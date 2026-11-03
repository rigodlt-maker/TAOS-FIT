// Insignia hexagonal con niveles (Bronce, Plata, Oro, Platino, Ónix), al estilo de las medallas de los juegos de realidad aumentada:
// marco de metal biselado, cara de color del nivel y un dibujo propio a dos tonos (claro + turquesa; en Ónix, gris metálico + morado).
// Dibujos propios de TAOS. Para una medalla nueva, agrega su dibujo a DIBUJOS con el mismo nombre que su "icono" en lib/medallas.ts.
import type { ReactNode } from "react";
import type { Nivel } from "@/lib/medallas";

type Paleta = {
  borde: string; // filo exterior brillante
  marcoClaro: string; // bisel que da a la luz (arriba a la izquierda)
  marcoOscuro: string; // bisel en sombra
  cara: string; // color de la cara
  dibujo: string; // tono claro del dibujo
  acento: string; // segundo tono del dibujo
  halo?: string;
};

const PALETAS: Record<Nivel | "bloqueado", Paleta> = {
  bronce: { borde: "#f2b382", marcoClaro: "#d48a55", marcoOscuro: "#5e2f17", cara: "#5c2e1c", dibujo: "#f3c7a2", acento: "#4fe3d0" },
  plata: { borde: "#cfd6da", marcoClaro: "#aeb8be", marcoOscuro: "#3f474c", cara: "#3c454b", dibujo: "#e6eef1", acento: "#4fe3d0" },
  oro: { borde: "#fbe3a0", marcoClaro: "#e6be6c", marcoOscuro: "#6e4d1a", cara: "#96703c", dibujo: "#f8e7c0", acento: "#4fe3d0", halo: "#ffd36b" },
  platino: { borde: "#ffffff", marcoClaro: "#ffffff", marcoOscuro: "#9fb4bf", cara: "#7d97a5", dibujo: "#ffffff", acento: "#7ffcf0", halo: "#e9fbff" },
  onix: { borde: "#55525e", marcoClaro: "#3a3842", marcoOscuro: "#020203", cara: "#060608", dibujo: "#a3a2ab", acento: "#9a7cf2", halo: "#7b55e0" },
  bloqueado: { borde: "#5a4434", marcoClaro: "#3f2d22", marcoOscuro: "#160f0b", cara: "#24180f", dibujo: "#2fa597", acento: "#2fa597" },
};

// ---------- Utilidades de color y forma ----------
const aRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mezclar = (a: string, b: string, t: number) =>
  `#${aRgb(a)
    .map((x, i) => Math.round(x + (aRgb(b)[i] - x) * t).toString(16).padStart(2, "0"))
    .join("")}`;

const CX = 50;
const CY = 56;
const punto = (r: number, i: number): [number, number] => {
  const a = (Math.PI / 180) * (60 * i - 90);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const hexagono = (r: number) =>
  Array.from({ length: 6 }, (_, i) => punto(r, i).map((n) => n.toFixed(2)).join(",")).join(" ");

// Las 6 caras del bisel, cada una con su luz (la luz viene de arriba a la izquierda)
function bisel(p: Paleta, rFuera: number, rDentro: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const pts = [punto(rFuera, i), punto(rFuera, i + 1), punto(rDentro, i + 1), punto(rDentro, i)];
    const normal = 60 * i - 60; // dirección hacia afuera de esa cara, en grados
    const luz = (Math.cos(((normal + 135) * Math.PI) / 180) + 1) / 2; // 1 = de frente a la luz
    return { pts: pts.map((q) => q.map((n) => n.toFixed(2)).join(",")).join(" "), color: mezclar(p.marcoOscuro, p.marcoClaro, 0.15 + 0.85 * luz) };
  });
}

// Arco con flecha (para "Repeticiones")
function arcoConFlecha(r: number, desde: number, hasta: number, color: string, grosor: number) {
  const rad = (g: number) => (g * Math.PI) / 180;
  const pt = (g: number) => [CX + r * Math.cos(rad(g)), CY + r * Math.sin(rad(g))];
  const [x1, y1] = pt(desde);
  const [x2, y2] = pt(hasta);
  const t = [-Math.sin(rad(hasta)), Math.cos(rad(hasta))];
  const n = [Math.cos(rad(hasta)), Math.sin(rad(hasta))];
  const punta = [x2 + t[0] * 7, y2 + t[1] * 7];
  const a = [x2 + n[0] * 5.5, y2 + n[1] * 5.5];
  const b = [x2 - n[0] * 5.5, y2 - n[1] * 5.5];
  return (
    <>
      <path d={`M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`} fill="none" stroke={color} strokeWidth={grosor} />
      <polygon points={[punta, a, b].map((q) => q.map((v) => v.toFixed(2)).join(",")).join(" ")} fill={color} />
    </>
  );
}

// ---------- Dibujos (cuadro de 100 × 112, centro 50,56). d = tono claro, a = acento, c = color de la cara ----------
type Colores = { d: string; a: string; c: string };
const DIBUJOS: Record<string, (k: Colores) => ReactNode> = {
  // Constancia: mancuerna sobre ondas
  pesa: ({ d, a, c }) => (
    <>
      <ellipse cx="50" cy="75" rx="25" ry="5.5" fill="none" stroke={a} strokeWidth="2.2" />
      <ellipse cx="50" cy="75" rx="15" ry="3" fill="none" stroke={a} strokeWidth="2" />
      <rect x="30" y="48" width="40" height="6" rx="1.5" fill={d} />
      <rect x="23" y="36" width="9" height="30" rx="2.5" fill={d} />
      <rect x="68" y="36" width="9" height="30" rx="2.5" fill={d} />
      <rect x="32" y="40" width="5.5" height="22" rx="1.5" fill={a} />
      <rect x="62.5" y="40" width="5.5" height="22" rx="1.5" fill={a} />
      <rect x="18.5" y="46" width="5" height="10" rx="1.5" fill={d} />
      <rect x="76.5" y="46" width="5" height="10" rx="1.5" fill={d} />
      <line x1="26" y1="40" x2="26" y2="62" stroke={c} strokeOpacity="0.35" strokeWidth="1.2" />
      <line x1="71" y1="40" x2="71" y2="62" stroke={c} strokeOpacity="0.35" strokeWidth="1.2" />
    </>
  ),
  // En racha: flama con corazón turquesa y chispas
  fuego: ({ d, a }) => (
    <>
      <path d="M50 26 C56 37 69 44 69 61 C69 73 60 82 50 82 C40 82 31 73 31 62 C31 53 37 48 40 41 C42 49 45 52 48 50 C45 42 46 33 50 26 Z" fill={d} />
      <path d="M50 51 C54 57 61 62 61 69 C61 75 56 80 50 80 C44 80 39 75 39 69 C39 64 43 61 45 56 C46 60 48 61 50 60 C48.5 57 48.5 54 50 51 Z" fill={a} />
      <circle cx="65" cy="36" r="2" fill={a} />
      <circle cx="35" cy="34" r="1.6" fill={a} />
      <circle cx="60" cy="28" r="1.3" fill={d} />
      <circle cx="29" cy="46" r="1.2" fill={d} />
    </>
  ),
  // Semana perfecta: calendario con la semana llena y palomita
  calendario: ({ d, a, c }) => (
    <>
      <rect x="27" y="36" width="46" height="42" rx="4" fill="none" stroke={d} strokeWidth="3.5" />
      <rect x="27" y="36" width="46" height="10" rx="3" fill={d} />
      <rect x="35" y="30" width="4.5" height="11" rx="2" fill={d} />
      <rect x="60.5" y="30" width="4.5" height="11" rx="2" fill={d} />
      {[0, 1, 2, 3].map((i) => <rect key={`a${i}`} x={32.5 + i * 9.5} y="51" width="6.5" height="6.5" rx="1" fill={a} />)}
      {[0, 1, 2].map((i) => <rect key={`b${i}`} x={32.5 + i * 9.5} y="62" width="6.5" height="6.5" rx="1" fill={a} />)}
      <path d="M44 66 L52 74 L70 52" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 66 L52 74 L70 52" fill="none" stroke={d} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Más fuerte: flecha que sube entre columnas de luces
  sube: ({ d, a }) => (
    <>
      {[0, 1, 2, 3, 4, 5].flatMap((f) =>
        [25, 30, 70, 75].map((x) => <circle key={`${f}-${x}`} cx={x} cy={38 + f * 7} r="1.5" fill={a} opacity={0.35 + f * 0.12} />),
      )}
      <polygon points="50,28 67,47 57,47 57,64 43,64 43,47 33,47" fill={d} />
      <path d="M36 74 L50 64 L64 74" fill="none" stroke={a} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M41 82 L50 75.5 L59 82" fill="none" stroke={a} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
    </>
  ),
  // Toneladas: pesa rusa que agrieta el piso
  pesas: ({ d, a, c }) => (
    <>
      <path d="M38 47 C37 30 63 30 62 47" fill="none" stroke={d} strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="50" cy="61" r="18" fill={d} />
      <rect x="38" y="74" width="24" height="5" rx="1.5" fill={d} />
      <circle cx="50" cy="61" r="9.5" fill={a} />
      <circle cx="50" cy="61" r="4" fill={c} />
      <path d="M22 83 H78" stroke={a} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 83 L26 88 M70 83 L75 88 M44 83 L42 87 M57 83 L60 87" stroke={a} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  // Trabajador: capas apiladas
  capas: ({ d, a, c }) => (
    <>
      <polygon points="50,62 75,73 50,84 25,73" fill={c} stroke={d} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="50,49 75,60 50,71 25,60" fill={c} stroke={d} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="50,33 75,44 50,55 25,44" fill={a} stroke={d} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="50,39 62,44 50,49 38,44" fill={d} opacity="0.85" />
    </>
  ),
  // Repeticiones: dos flechas en círculo con órbita de puntos
  ciclo: ({ d, a }) => (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const g = (i * 30 * Math.PI) / 180;
        return <circle key={i} cx={(CX + 29 * Math.cos(g)).toFixed(2)} cy={(CY + 29 * Math.sin(g)).toFixed(2)} r={i % 3 === 0 ? 2 : 1.2} fill={a} />;
      })}
      {arcoConFlecha(19, -60, 100, d, 5)}
      {arcoConFlecha(19, 120, 280, d, 5)}
      <circle cx="50" cy="56" r="7" fill={a} />
    </>
  ),
  // Explorador: rosa de los vientos
  brujula: ({ d, a, c }) => (
    <>
      <circle cx="50" cy="56" r="24" fill="none" stroke={d} strokeWidth="2.5" />
      <circle cx="50" cy="56" r="19" fill="none" stroke={a} strokeWidth="1.4" strokeDasharray="2 3" />
      <polygon points="50,56 54,52 66,40 52,54" fill={a} />
      <polygon points="50,56 54,60 66,72 52,58" fill={a} />
      <polygon points="50,56 46,60 34,72 48,58" fill={a} />
      <polygon points="50,56 46,52 34,40 48,54" fill={a} />
      <polygon points="50,28 55,51 50,56 45,51" fill={d} />
      <polygon points="50,84 55,61 50,56 45,61" fill={d} />
      <polygon points="22,56 45,51 50,56 45,61" fill={d} />
      <polygon points="78,56 55,51 50,56 55,61" fill={d} />
      <circle cx="50" cy="56" r="3.5" fill={c} stroke={d} strokeWidth="1.5" />
    </>
  ),
  // Disciplina: tabla con palomitas
  lista: ({ d, a }) => (
    <>
      <rect x="31" y="34" width="38" height="48" rx="4" fill="none" stroke={d} strokeWidth="3.5" />
      <rect x="41" y="29" width="18" height="9" rx="2.5" fill={d} />
      {[48, 59, 70].map((y) => (
        <g key={y}>
          <path d={`M37 ${y} L40 ${y + 3} L45 ${y - 3}`} fill="none" stroke={a} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="49" y={y - 1.5} width="14" height="3.5" rx="1.5" fill={d} />
        </g>
      ))}
    </>
  ),
  // Bajo la lupa: cinta métrica
  regla: ({ d, a, c }) => (
    <>
      <rect x="44" y="61" width="36" height="9" rx="1" fill={a} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={54 + i * 3.5} y1="61" x2={54 + i * 3.5} y2={i % 2 ? 64 : 66} stroke={c} strokeWidth="1.2" />
      ))}
      <rect x="77" y="58" width="4" height="15" rx="1" fill={d} />
      <circle cx="44" cy="54" r="19" fill={d} />
      <circle cx="44" cy="54" r="12" fill="none" stroke={a} strokeWidth="2.2" />
      <circle cx="44" cy="54" r="5" fill={c} />
    </>
  ),
  // Mi meta: diana con flecha clavada
  diana: ({ d, a, c }) => (
    <>
      <circle cx="48" cy="58" r="23" fill="none" stroke={d} strokeWidth="4" />
      <circle cx="48" cy="58" r="15" fill="none" stroke={a} strokeWidth="4" />
      <circle cx="48" cy="58" r="6.5" fill={d} />
      <line x1="48" y1="58" x2="74" y2="32" stroke={c} strokeWidth="6" strokeLinecap="round" />
      <line x1="48" y1="58" x2="74" y2="32" stroke={d} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M74 32 L82 30 M74 32 L76 24 M70 36 L78 34 M70 36 L72 28" stroke={a} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  // Volviste: amanecer
  amanecer: ({ d, a }) => (
    <>
      {[-160, -135, -110, -90, -70, -45, -20].map((g) => {
        const r = (g * Math.PI) / 180;
        return (
          <line key={g} x1={(50 + 19 * Math.cos(r)).toFixed(2)} y1={(64 + 19 * Math.sin(r)).toFixed(2)} x2={(50 + (g === -90 ? 32 : 27) * Math.cos(r)).toFixed(2)} y2={(64 + (g === -90 ? 32 : 27) * Math.sin(r)).toFixed(2)} stroke={a} strokeWidth="3" strokeLinecap="round" />
        );
      })}
      <path d="M35 64 A15 15 0 0 1 65 64 Z" fill={d} />
      <line x1="22" y1="66" x2="78" y2="66" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
      <line x1="32" y1="73" x2="68" y2="73" stroke={a} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="40" y1="80" x2="60" y2="80" stroke={a} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </>
  ),
};

const candado = ({ a, c }: Colores) => (
  <>
    <path d="M39 54 V45 A11 11 0 0 1 61 45 V54" fill="none" stroke={a} strokeWidth="5.5" />
    <rect x="32" y="52" width="36" height="28" rx="4" fill={a} />
    <circle cx="50" cy="63" r="4.2" fill={c} />
    <rect x="48.2" y="64" width="3.6" height="9" rx="1" fill={c} />
  </>
);

export function Insignia({ icono, nivel, tamano = 84, className = "" }: { icono: string; nivel: Nivel | null; tamano?: number; className?: string }) {
  const p = PALETAS[nivel ?? "bloqueado"];
  const id = `ins-${icono}-${nivel ?? "x"}`;
  const onix = nivel === "onix";
  // En Ónix el dibujo es de metal gris con degradado
  const colores = { d: onix ? `url(#${id}-m)` : p.dibujo, a: p.acento, c: p.cara };
  const dibujo = nivel ? (DIBUJOS[icono] ?? DIBUJOS.pesa)(colores) : candado(colores);
  return (
    <svg viewBox="-4 -4 108 120" width={tamano} height={(tamano * 120) / 108} className={className} role="img" aria-label={nivel ? `Medalla nivel ${nivel}` : "Medalla bloqueada"}>
      <defs>
        <radialGradient id={`${id}-c`} cx="0.5" cy="0.38" r="0.7">
          <stop offset="0" stopColor={mezclar(p.cara, "#ffffff", onix ? 0.04 : 0.16)} />
          <stop offset="1" stopColor={mezclar(p.cara, "#000000", 0.3)} />
        </radialGradient>
        <linearGradient id={`${id}-b`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={onix ? 0.22 : 0.14} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {onix && (
          <linearGradient id={`${id}-o`} x1="0" y1="0" x2="1" y2="0.75">
            <stop offset="0.12" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.24" stopColor="#ffffff" stopOpacity="0.26" />
            <stop offset="0.33" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.76" stopColor="#d8ccff" stopOpacity="0.1" />
            <stop offset="0.82" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        )}
        {onix && (
          <linearGradient id={`${id}-m`} gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="88">
            <stop offset="0" stopColor="#d9d8de" />
            <stop offset="0.5" stopColor="#8d8c95" />
            <stop offset="1" stopColor="#4a4950" />
          </linearGradient>
        )}
        <filter id={`${id}-h`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={onix ? 2.4 : 3} />
        </filter>
      </defs>

      {/* Halo: Oro cálido, Platino blanco brillante, Ónix morado tenue */}
      {p.halo && <polygon points={hexagono(49)} fill="none" stroke={p.halo} strokeWidth={nivel === "platino" ? 7 : 5} opacity={nivel === "platino" ? 1 : onix ? 0.75 : 0.7} filter={`url(#${id}-h)`} />}

      {/* Marco de metal biselado */}
      {bisel(p, 49, 42).map((f, i) => (
        <polygon key={i} points={f.pts} fill={f.color} />
      ))}
      <polygon points={hexagono(49)} fill="none" stroke={p.borde} strokeWidth="1.3" strokeLinejoin="round" />

      {/* Cara */}
      <polygon points={hexagono(42)} fill={`url(#${id}-c)`} />
      <polygon points={hexagono(42)} fill="none" stroke="#000000" strokeOpacity="0.45" strokeWidth="1.6" />
      <polygon points={hexagono(39.6)} fill="none" stroke={p.borde} strokeOpacity={nivel ? 0.28 : 0.15} strokeWidth="0.8" />

      {/* Dibujo */}
      <g opacity={nivel ? 1 : 0.55} transform="translate(50 56) scale(1.14) translate(-50 -56)">
        {dibujo}
      </g>

      {/* Brillo de vidrio (en Ónix, reflejos de obsidiana) */}
      <polygon points={hexagono(42)} fill={`url(#${id}-b)`} />
      {onix && <polygon points={hexagono(49)} fill={`url(#${id}-o)`} />}
    </svg>
  );
}
