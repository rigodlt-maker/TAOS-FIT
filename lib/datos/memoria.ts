// Modo demostración: sin Supabase, los datos viven en memoria del servidor con un ejemplo ya armado
// (perfil, 3 meses de medidas y registros, rutina, entrenamientos, menú y ajustes). Sirve para ver y grabar la app.
import { generarMenu, type Menu } from "../menu";
import { calcularObjetivos } from "../nutricion";
import { generarPlan } from "../rutina";
import type { Ajuste, Medida, Perfil, Plan, Registro, Serie, SuscripcionPush } from "../tipos";
import type { MenuGuardado, Repo } from "./repo";

type Almacen = {
  perfil: Perfil | null;
  medidas: Medida[];
  planes: Plan[];
  series: Serie[];
  registros: Registro[];
  ajustes: Ajuste[];
  menus: MenuGuardado[];
  suscripciones: SuscripcionPush[];
};

const id = () => crypto.randomUUID();
const dia = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export const PERFIL_DEMO: Perfil = {
  nombre: "Alex",
  genero: "hombre",
  cuerpo: "masculino",
  nacimiento: "1994-03-15",
  altura_cm: 176,
  objetivo: "grasa",
  nivel: "intermedio",
  dias_semana: 4,
  minutos_sesion: 60,
  lugar: "gimnasio",
  barra_dominadas: true,
  lesiones: [],
  enfasis: ["brazos"],
  hora_entreno: "07:00",
  avatar: null,
  actividad: "ligera",
  dias_entreno: [1, 2, 4, 5],
  meta_peso_kg: 76,
  fecha_meta: dia(90),
  alimentos_habituales: ["pollo", "huevo", "tortilla", "avena", "arroz", "frijoles", "platano", "aguacate"],
  alimentos_excluidos: [],
  veces_cocina: 3,
  dia_registro: 0,
  ajuste_kcal: -150,
  volumen: 1,
  pausa_hasta: null,
};

function crearAlmacen(): Almacen {
  // 12 semanas: baja la cintura, sube el brazo; el peso se estanca en las semanas 6–7 y se ajustan calorías
  const pesos = [84, 83.4, 82.9, 82.5, 82.1, 81.9, 81.85, 81.8, 81.2, 80.7, 80.3, 79.9];
  const registros: Registro[] = pesos.map((peso, i) => ({
    id: id(),
    fecha: dia(-77 + i * 7),
    peso_kg: peso,
    cintura_cm: Math.round((94 - i * 0.7) * 10) / 10,
    cadera_cm: 100 - Math.round(i * 0.3),
    brazo_cm: Math.round((33.5 + i * 0.15) * 10) / 10,
    adherencia: [70, 80, 85, 85, 90, 85, 85, 90, 80, 85, 90, 85][i],
    energia: [6, 7, 7, 6, 7, 7, 6, 7, 8, 7, 8, 8][i],
    sueno: [6, 6, 7, 7, 7, 6, 7, 7, 8, 7, 7, 8][i],
    hambre: [7, 6, 6, 5, 6, 5, 5, 6, 6, 5, 5, 5][i],
    notas: null,
  }));
  const medidas: Medida[] = registros
    .filter((_, i) => i % 4 === 0 || i === registros.length - 1)
    .map((r, i) => ({ id: id(), fecha: r.fecha, peso_kg: r.peso_kg, cintura_cm: r.cintura_cm, cadera_cm: r.cadera_cm, pecho_cm: 102 + i * 0.5, brazo_cm: r.brazo_cm, muslo_cm: 58, cuello_cm: 39 }));
  const { dias, notas } = generarPlan(PERFIL_DEMO, 0, "demo");
  const plan: Plan = { id: id(), creado: dia(-84), activo: true, dias, notas };
  // Historial de los ejercicios de cada día: el peso sube poco a poco
  const series: Serie[] = [];
  dias.forEach((d, i) => {
    d.ejercicios.slice(0, 3).forEach((ej, n) => {
      for (let semana = 0; semana < 8; semana++) {
        const fecha = dia(-56 + semana * 7 + i);
        const base = [60, 45, 20][n] ?? 20;
        for (let s = 1; s <= ej.series; s++)
          series.push({
            id: id(),
            fecha,
            plan_id: plan.id,
            dia: i,
            ejercicio: ej.ejercicio,
            serie: s,
            peso_kg: base + Math.floor(semana / 2) * 2.5,
            reps: Math.min(ej.reps_max, ej.reps_min + (semana % 2) * 2 + (s === 1 ? 1 : 0)),
            rir: 2,
            nota: null,
          });
      }
    });
  });
  const ajustes: Ajuste[] = [
    { id: id(), fecha: dia(-28), tipo: "calorias", detalle: "−150 kcal al día", motivo: "Peso promedio 81.9 → 81.85 → 81.8 kg con 85% y 90% de cumplimiento: el peso no se movió en 2 semanas." },
    { id: id(), fecha: dia(-42), tipo: "volumen", detalle: "20% menos series esta semana", motivo: "Energía 4/10 y sueño 5/10: necesitas recuperarte." },
    { id: id(), fecha: dia(-35), tipo: "volumen", detalle: "Series completas otra vez", motivo: "Energía 7/10 y sueño 7/10: ya te recuperaste." },
  ];
  // DEMO_VACIO=1 arranca sin datos (para ver o grabar la bienvenida)
  if (process.env.DEMO_VACIO) return { perfil: null, medidas: [], planes: [], series: [], registros: [], ajustes: [], menus: [], suscripciones: [] };
  return { perfil: PERFIL_DEMO, medidas, planes: [plan], series, registros, ajustes, menus: [], suscripciones: [] };
}

const g = globalThis as unknown as { __fitDemo?: Almacen; __fitDemoCreado?: number };

function almacen(): Almacen {
  // Se reinicia cada 6 horas para que la demostración no acumule cambios
  if (!g.__fitDemo || Date.now() - (g.__fitDemoCreado ?? 0) > 6 * 3600_000) {
    g.__fitDemo = crearAlmacen();
    g.__fitDemoCreado = Date.now();
  }
  return g.__fitDemo;
}

export function repoMemoria(): Repo {
  const a = almacen();
  return {
    modo: "demo",
    usuario: "demo",
    async esquemaPendiente() {
      return false;
    },
    async perfil() {
      return a.perfil;
    },
    async guardarPerfil(p) {
      a.perfil = p;
      return { completo: true };
    },
    async medidas() {
      return [...a.medidas].sort((x, y) => x.fecha.localeCompare(y.fecha));
    },
    async guardarMedida(m) {
      a.medidas = a.medidas.filter((x) => x.fecha !== m.fecha);
      a.medidas.push({ ...m, id: id() });
    },
    async borrarMedida(i) {
      a.medidas = a.medidas.filter((x) => x.id !== i);
    },
    async planActivo() {
      return a.planes.find((p) => p.activo) ?? null;
    },
    async crearPlan(dias, notas) {
      a.planes.forEach((p) => (p.activo = false));
      const nuevo = id();
      a.planes.push({ id: nuevo, creado: new Date().toISOString(), activo: true, dias, notas });
      return nuevo;
    },
    async series(filtro = {}) {
      return a.series.filter((s) => (!filtro.ejercicio || s.ejercicio === filtro.ejercicio) && (!filtro.desde || s.fecha >= filtro.desde));
    },
    async guardarSeries(s) {
      a.series.push(...s.map((x) => ({ ...x, id: id() })));
    },
    async borrarSeries(fecha, ejercicio) {
      a.series = a.series.filter((s) => !(s.fecha === fecha && s.ejercicio === ejercicio));
    },
    async registros() {
      return [...a.registros].sort((x, y) => x.fecha.localeCompare(y.fecha));
    },
    async guardarRegistro(r) {
      a.registros = a.registros.filter((x) => x.fecha !== r.fecha);
      a.registros.push({ ...r, id: id() });
    },
    async ajustes(limite = 50) {
      return [...a.ajustes].sort((x, y) => y.fecha.localeCompare(x.fecha)).slice(0, limite);
    },
    async guardarAjustes(nuevos) {
      a.ajustes.push(...nuevos.map((x) => ({ ...x, id: id() })));
    },
    async menuActivo() {
      // El ejemplo arma su menú la primera vez que se pide
      if (!a.menus.length && a.perfil) {
        const ultima = a.medidas.at(-1) ?? { peso_kg: 80 };
        const o = calcularObjetivos(a.perfil, ultima);
        const menu: Menu = generarMenu(o, { habituales: a.perfil.alimentos_habituales, excluidos: a.perfil.alimentos_excluidos, veces_cocina: a.perfil.veces_cocina }, "demo");
        a.menus.push({ ...menu, id: id(), creado: new Date().toISOString() });
      }
      return a.menus.at(-1) ?? null;
    },
    async guardarMenu(m) {
      const nuevo = id();
      a.menus.push({ ...m, id: nuevo, creado: new Date().toISOString() });
      return nuevo;
    },
    async suscripcionesPush() {
      return [...a.suscripciones];
    },
    async guardarSuscripcionPush(s) {
      a.suscripciones = a.suscripciones.filter((x) => x.endpoint !== s.endpoint);
      a.suscripciones.push({ ...s, id: id(), created_at: new Date().toISOString() });
    },
    async borrarSuscripcionPush(endpoint) {
      a.suscripciones = a.suscripciones.filter((x) => x.endpoint !== endpoint);
    },
  };
}
