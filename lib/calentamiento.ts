// Calentamiento guiado (5–8 min) antes de CADA sesión: sube la temperatura, mueve las articulaciones
// y activa los músculos que vas a trabajar hoy. Reglas puras, sin IA. Respeta tus molestias y dónde entrenas.
import { ejercicioPorId, type Lesion, type Zona } from "./ejercicios";
import type { Lugar } from "./tipos";

export type Movimiento = {
  nombre: string;
  dosis: string; // lo que se ve en pantalla: "3 min", "10 repeticiones"…
  segundos: number; // para el temporizador
  como: string; // una frase de cómo hacerlo
  foto?: string; // carpeta en public/ejercicios (si hay foto)
};

const CARDIO: Record<Lugar, Movimiento> = {
  gimnasio: { nombre: "Caminadora o bici suave", dosis: "3 min", segundos: 180, como: "Ritmo en el que puedas platicar. Al final debes sentir el cuerpo tibio.", foto: "Jogging_Treadmill" },
  casa_mancuernas: { nombre: "Marcha en tu lugar", dosis: "2 min", segundos: 120, como: "Sube las rodillas a la altura de la cadera y mueve los brazos.", foto: "Air_Bike" },
  casa_sin_equipo: { nombre: "Marcha en tu lugar", dosis: "2 min", segundos: 120, como: "Sube las rodillas a la altura de la cadera y mueve los brazos.", foto: "Air_Bike" },
};

const BRAZOS: Movimiento = { nombre: "Círculos de brazos", dosis: "10 adelante y 10 atrás", segundos: 40, como: "Brazos estirados a los lados; empieza con círculos chicos y hazlos cada vez más grandes." };
const CADERA: Movimiento = { nombre: "Círculos de cadera", dosis: "10 por lado", segundos: 40, como: "Manos en la cintura, pies a lo ancho de hombros; dibuja círculos lentos con la cadera." };
const GATO: Movimiento = { nombre: "Gato-vaca", dosis: "8 lentos", segundos: 40, como: "En cuatro puntos: redondea la espalda al exhalar y húndela suave al inhalar." };

const desde = (id: string, dosis: string, segundos: number, como: string): Movimiento => ({ nombre: ejercicioPorId(id)?.nombre ?? id, dosis, segundos, como, foto: id });

const SENTADILLA = desde("Bodyweight_Squat", "10 repeticiones", 45, "Sin peso y lento: baja hasta donde estés cómodo, rodillas hacia las puntas de los pies.");
const PUENTE = desde("Butt_Lift_Bridge", "10 repeticiones", 40, "Acostado, aprieta glúteos al subir y sostén 1 segundo arriba.");
const ZANCADA = desde("Bodyweight_Walking_Lunge", "6 por pierna", 50, "Pasos largos y lentos, la rodilla de atrás casi toca el piso.");
const LAGARTIJA = desde("Incline_Push-Up", "8 repeticiones", 40, "Manos en una banca o la pared, cuerpo recto. Suave, sin llegar al cansancio.");
const SUPERMAN = desde("Superman", "8 repeticiones", 40, "Boca abajo, sube brazos y piernas un poco, sostén 2 segundos.");
const DEAD_BUG = desde("Dead_Bug", "6 por lado", 45, "Espalda baja pegada al piso; estira brazo y pierna contrarios despacio.");

// zonas: las del día (de sus ejercicios). Siempre: cardio suave + movilidad + activación de lo que toca hoy.
export function calentamiento(zonas: Zona[], lesiones: Lesion[], lugar: Lugar): Movimiento[] {
  const z = new Set(zonas);
  const sin = (l: Lesion) => !lesiones.includes(l);
  const pierna = z.has("piernas") || z.has("gluteo");
  const torso = z.has("pecho") || z.has("hombros") || z.has("brazos") || z.has("espalda");
  const lista: Movimiento[] = [CARDIO[lugar], BRAZOS, CADERA];

  if (z.has("espalda") || pierna || !sin("espalda_baja")) lista.push(GATO);
  if (pierna) {
    lista.push(SENTADILLA, PUENTE);
    if (sin("rodilla")) lista.push(ZANCADA);
  }
  if (torso && sin("hombro") && sin("muneca")) lista.push(LAGARTIJA);
  if (z.has("espalda") && sin("espalda_baja")) lista.push(SUPERMAN);
  if (z.has("abdomen") || !sin("espalda_baja") || !pierna) lista.push(DEAD_BUG);
  return lista;
}

export const minutosDe = (lista: Movimiento[]) => Math.round(lista.reduce((s, m) => s + m.segundos, 0) / 60);
