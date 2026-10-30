// Tao, el asistente de Tao Fit: responde con tus datos y reglas (sin IA ni costos).
// Es una función pura: recibe tus datos y la pregunta, y devuelve la respuesta en markdown sencillo.
import { alimentoPorId, ALIMENTOS, porcion } from "./alimentos";
import { EJERCICIOS, ejercicioPorId } from "./ejercicios";
import { diaQueToca, entrenosSemana, fechaBonita, sumarDias } from "./entreno";
import { DIAS_MENU, NOMBRE_COMIDA, macros, reemplazos, type Menu } from "./menu";
import { indiceDia } from "./menu-actual";
import { calcularObjetivos } from "./nutricion";
import { registroPendiente, tocaEntrenar } from "./semana";
import type { Ajuste, Medida, Perfil, Plan, Registro, Serie } from "./tipos";
import type { TipoComida } from "./alimentos";

export type DatosTao = {
  perfil: Perfil;
  medidas: Medida[];
  plan: Plan | null;
  series: Serie[];
  registros: Registro[];
  ajustes: Ajuste[];
  menu: Menu | null;
  hoy: string;
};

export const EJEMPLOS_TAO = ["¿Qué entreno hoy?", "¿Qué como hoy?", "¿Cuántas calorías me tocan?", "¿Cómo voy con mi peso?", "¿Puedo entrenar en casa?", "¿Qué como en vez de pollo?"];

// Minúsculas y sin acentos, para comparar sin importar cómo se escriba
export const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const kg = (n: number) => `${Math.round(n * 10) / 10} kg`;
const AYUDA = `Puedo ayudarte con:\n- **Entreno**: “¿qué entreno hoy?”, “¿cómo se hace el press de banca?”\n- **Comida**: “¿qué ceno?”, “¿cuánta proteína me toca?”, “¿qué como en vez de atún?”\n- **Progreso**: “¿cómo voy?”, “¿cuánto me falta para mi meta?”, “¿cuándo es mi registro?”`;

// Busca el ejercicio que mencionas (por nombre completo o por sus palabras importantes)
export function buscarEjercicio(q: string) {
  const palabras = (n: string) => normalizar(n).split(" ").filter((p) => p.length > 3 && !["con", "para", "entre"].includes(p));
  let mejor: { id: string; puntos: number } | null = null;
  for (const e of EJERCICIOS) {
    const n = normalizar(e.nombre);
    const ps = palabras(e.nombre);
    const puntos = q.includes(n) ? 100 + n.length : ps.filter((p) => q.includes(p)).length * 10 - (ps.length - ps.filter((p) => q.includes(p)).length);
    if (puntos >= 9 && (!mejor || puntos > mejor.puntos)) mejor = { id: e.id, puntos };
  }
  return mejor ? ejercicioPorId(mejor.id)! : null;
}

// Busca un alimento por su nombre (o por la primera palabra: “pollo” → pechuga de pollo)
export function buscarAlimento(q: string) {
  const exacto = ALIMENTOS.filter((a) => q.includes(normalizar(a.nombre)));
  if (exacto.length) return exacto.sort((a, b) => b.nombre.length - a.nombre.length)[0];
  return ALIMENTOS.find((a) => normalizar(a.nombre).split(" ").some((p) => p.length > 3 && new RegExp(`\\b${p}\\b`).test(q))) ?? null;
}

function comidaDe(q: string): TipoComida | null {
  if (/\bdesayun/.test(q)) return "desayuno";
  if (/\bcolacion|\bsnack|\bentre comidas|\bcolacion/.test(q)) return "colacion";
  if (/\bcena|\bceno|\bcenar/.test(q)) return "cena";
  if (/\bcomida\b|\balmuerz|\bcomo a medio dia/.test(q) && !/que como|que comer/.test(q)) return "comida";
  return null;
}

function menuDelDia(d: DatosTao, q: string): string {
  if (!d.menu) return "Todavía no tengo tu menú: registra tu peso en [Medidas](/cuerpo) y lo armo.";
  const manana = /\bmanana\b/.test(q);
  const fecha = manana ? sumarDias(d.hoy, 1) : d.hoy;
  const i = indiceDia(fecha);
  const tipo = comidaDe(q);
  const comidas = d.menu.dias[i].comidas.filter((c) => !tipo || c.tipo === tipo);
  if (!comidas.length) return `Tu menú de ${DIAS_MENU[i].toLowerCase()} no tiene ${tipo ? NOMBRE_COMIDA[tipo].toLowerCase() : "comidas"}. Míralo completo en [Comida](/comida?dia=${i}).`;
  const lineas = comidas.map((c) => {
    const m = macros(c.items);
    const cosas = c.items.map((it) => `${alimentoPorId(it.alimento)?.nombre ?? it.alimento}: ${porcion(alimentoPorId(it.alimento)!, it.gramos)}`).join("; ");
    return `- **${NOMBRE_COMIDA[c.tipo]}** · ${Math.round(m.kcal)} kcal, ${Math.round(m.p)} g prot: ${cosas}`;
  });
  return `${manana ? "Mañana" : "Hoy"} (${DIAS_MENU[i].toLowerCase()}) te toca:\n${lineas.join("\n")}\n\nVer o cambiar algo en [Comida](/comida?dia=${i}).`;
}

function entrenoDeHoy(d: DatosTao): string {
  if (!d.plan) return "Aún no tienes rutina. Termina tu perfil y la armo: [Mi perfil](/perfil).";
  const semana = entrenosSemana(d.series, d.hoy);
  const toca = diaQueToca(d.plan, d.series, d.hoy);
  const dia = d.plan.dias[toca.dia];
  const ejercicios = dia.ejercicios
    .map((e) => `- ${ejercicioPorId(e.ejercicio)?.nombre ?? e.ejercicio}: ${e.series} × ${e.reps_min}–${e.reps_max}${e.segundos ? " s" : ""}`)
    .join("\n");
  const pausa = d.perfil.pausa_hasta && d.perfil.pausa_hasta >= d.hoy ? `\n\n⚠️ Estás en pausa de aumentos hasta el ${fechaBonita(d.perfil.pausa_hasta)}: mantén los pesos.` : "";
  if (toca.yaHoy) return `Hoy ya entrenaste **${dia.nombre}**. ¡Bien! Llevas ${semana} de ${d.perfil.dias_semana} esta semana.${pausa}`;
  const cardio = dia.cardio_min ? `\n- Cardio: ${dia.cardio_min} min al final` : "";
  const encabezado = tocaEntrenar(d.perfil, d.hoy, semana)
    ? `Hoy toca **${dia.nombre}** (${dia.enfoque}):`
    : `Hoy es descanso 😴 (llevas ${semana} de ${d.perfil.dias_semana}). Lo siguiente es **${dia.nombre}**:`;
  return `${encabezado}\n${ejercicios}${cardio}\n\n[Empezar entrenamiento](/entrenar)${pausa}`;
}

function progreso(d: DatosTao): string {
  const inicio = d.medidas[0];
  const ultima = d.medidas.at(-1);
  if (!inicio || !ultima) return "Todavía no tengo medidas tuyas. Regístralas en [Medidas](/cuerpo).";
  if (inicio === ultima) return `Tu primer registro es de ${kg(ultima.peso_kg)} (${fechaBonita(ultima.fecha)}). Con tu siguiente medida te digo cómo vas. [Registrar medidas](/cuerpo)`;
  const cambio = ultima.peso_kg - inicio.peso_kg;
  const semanas = Math.max(1, Math.round((new Date(ultima.fecha).getTime() - new Date(inicio.fecha).getTime()) / (7 * 86_400_000)));
  const cintura = inicio.cintura_cm && ultima.cintura_cm ? ` Cintura: ${ultima.cintura_cm - inicio.cintura_cm > 0 ? "+" : ""}${Math.round((ultima.cintura_cm - inicio.cintura_cm) * 10) / 10} cm.` : "";
  const sentido = cambio < 0 ? `bajaste ${kg(-cambio)}` : cambio > 0 ? `subiste ${kg(cambio)}` : "tu peso está igual";
  return `En ${semanas} semana${semanas === 1 ? "" : "s"} ${sentido}: de ${kg(inicio.peso_kg)} a ${kg(ultima.peso_kg)}.${cintura}\n\nMira tus gráficas en [Progreso](/progreso).`;
}

function meta(d: DatosTao): string {
  const ultima = d.medidas.at(-1);
  if (!d.perfil.meta_peso_kg) return "No tienes una meta de peso. Ponla en [Mi perfil](/perfil) y te digo cuánto te falta.";
  if (!ultima) return `Tu meta es ${kg(d.perfil.meta_peso_kg)}. Registra tu peso en [Medidas](/cuerpo) para medir cuánto falta.`;
  const falta = ultima.peso_kg - d.perfil.meta_peso_kg;
  const fecha = d.perfil.fecha_meta ? ` para el ${fechaBonita(d.perfil.fecha_meta)}` : "";
  if (Math.abs(falta) < 0.5) return `¡Llegaste a tu meta de ${kg(d.perfil.meta_peso_kg)}! 🎉 Puedes poner una nueva en [Mi perfil](/perfil).`;
  return `Tu meta es ${kg(d.perfil.meta_peso_kg)}${fecha}. Hoy estás en ${kg(ultima.peso_kg)}: te ${falta > 0 ? "faltan" : "faltan subir"} **${kg(Math.abs(falta))}**.`;
}

export function responderTao(pregunta: string, d: DatosTao): string {
  const q = normalizar(pregunta);
  if (!q) return AYUDA;
  const ultima = d.medidas.at(-1);

  // Seguridad primero
  if (/\b(dolor|duele|lastim|lesion|mare|desmay|falta de aire|pecho apretado)/.test(q))
    return "Si sientes **dolor agudo, mareo o falta de aire, detente** y descansa. Si no se quita o es fuerte, busca atención médica.\n\nEn [Entrenar](/entrenar) toca **“Me duele”**: pauso los aumentos de peso 7 días y te cambio los ejercicios que molestan. Tao Fit no sustituye a un médico.";

  if (/^(hola|buenas|buenos dias|buenas tardes|que onda|hey)\b/.test(q) && q.split(" ").length <= 3) return `¡Hola, ${d.perfil.nombre}! 👋\n\n${AYUDA}`;
  if (/\b(ayuda|que puedes|que sabes|como funcionas|que haces)\b/.test(q)) return AYUDA;

  // Entrenar en casa (lo más pedido en la encuesta)
  if (/\b(en casa|sin aparatos|sin gym|sin gimnasio|sin equipo|sin pesas)\b/.test(q) && !/\b(como se hace|tecnica)\b/.test(q)) {
    if (d.perfil.lugar === "casa_sin_equipo") return `Tu rutina ya es **en casa sin aparatos**: solo con tu cuerpo, una silla firme y un tapete.\n\n${entrenoDeHoy(d)}`;
    return "¡Sí! En [Mi perfil](/perfil) cambia **Dónde entrenas** a **Casa sin aparatos** y te armo la rutina solo con tu cuerpo (sentadillas, lagartijas, zancadas, plancha…). Si tienes mancuernas o ligas, elige **Casa con pesas**.";
  }

  // Cómo se hace un ejercicio
  const ejercicio = buscarEjercicio(q);
  if (ejercicio && (/\b(como|tecnica|pasos|se hace|hago|explica|postura)\b/.test(q) || !/\b(comer|como hoy|cena|desayun)/.test(q))) {
    if (/\b(como|tecnica|pasos|se hace|hago|explica|postura|que es)\b/.test(q))
      return `**${ejercicio.nombre}**\n${ejercicio.pasos.map((p) => `- ${p}`).join("\n")}\n\nVe las fotos en [Ejercicios](/ejercicios).`;
  }

  // Reemplazar un alimento
  if (/\b(en vez de|en lugar de|cambiar|cambio|reemplaz|sustitu|no me gusta|no tengo|alternativa)/.test(q)) {
    const al = buscarAlimento(q);
    if (al) {
      const item = d.menu?.dias.flatMap((x) => x.comidas.flatMap((c) => c.items.map((it) => ({ it, tipo: c.tipo })))).find((x) => x.it.alimento === al.id);
      const tipo = item?.tipo ?? al.comidas[0];
      const alt = reemplazos(item?.it ?? { alimento: al.id, gramos: 100 }, tipo, d.perfil.alimentos_excluidos).slice(0, 4);
      if (!alt.length) return `No encontré algo parecido a ${al.nombre.toLowerCase()} con lo que excluiste. Revisa tus alimentos en [Mi perfil](/perfil).`;
      return `En vez de **${al.nombre.toLowerCase()}**${item ? ` (${porcion(al, item.it.gramos)})` : ""} puedes usar:\n${alt.map((r) => `- ${alimentoPorId(r.alimento)!.nombre}: ${porcion(alimentoPorId(r.alimento)!, r.gramos)}`).join("\n")}\n\nAportan casi lo mismo. Si nunca lo quieres, quítalo en [Mi perfil](/perfil).`;
    }
  }

  if (/\b(lista|super|supermercado|compras|mandado)\b/.test(q)) return "Tu lista del súper sale de tu menú de la semana, ordenada por pasillo: [Lista del súper](/comida/lista).";

  if (/\b(por que|ajuste|ajustaste|cambiaste|bajaste|subiste)\b/.test(q) && d.ajustes.length) {
    const a = d.ajustes[0];
    return `Mi último ajuste (${fechaBonita(a.fecha)}): **${a.detalle}**.\nPor qué: ${a.motivo}\n\nTodo el historial está en [Progreso](/progreso).`;
  }

  if (/\b(calori\w*|kcal|protein\w*|carbo\w*|grasas?|macros?|cuanto debo comer|cuanto como)\b/.test(q)) {
    if (!ultima) return "Necesito tu peso para calcularlo. Regístralo en [Medidas](/cuerpo).";
    const o = calcularObjetivos(d.perfil, ultima, d.hoy);
    return `Tu meta diaria: **${o.kcal.toLocaleString("es-MX")} kcal**, ${o.proteina} g de proteína, ${o.carbos} g de carbos y ${o.grasa} g de grasa.\n\nSe calcula con tu peso (${kg(ultima.peso_kg)}), tu actividad y tu objetivo. La explicación completa está en [Comida](/comida).`;
  }

  if (/\b(desayun\w*|cena\w*|ceno|colacion\w*|snacks?|almuerz\w*|menu|que como|que comer|comida)\b/.test(q)) return menuDelDia(d, q);

  if (/\b(entren\w*|rutina|toca hoy|que toca|me toca|gym|gimnasio|ejercicios?|pesas|cardio)\b/.test(q)) return entrenoDeHoy(d);

  if (/\b(meta|objetivo|cuanto me falta|falta)\b/.test(q)) return meta(d);

  if (/\b(registro|check\w*|pesarme|pesar)\b/.test(q)) {
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    if (registroPendiente(d.perfil, d.registros, d.hoy)) return "Tu registro semanal está **pendiente**. Toma 1 minuto: [Hacer mi registro](/registro).";
    const ultimo = d.registros.at(-1);
    return `Tu registro semanal es cada **${dias[d.perfil.dia_registro]}**.${ultimo ? ` El último fue el ${fechaBonita(ultimo.fecha)}.` : ""} Pésate en la mañana, en ayunas.`;
  }

  if (/\b(peso|baje|bajado|subi|subido|progreso|avance|como voy|resultados?|cintura|medidas)\b/.test(q)) return progreso(d);

  if (/\b(personaje|avatar|muneco|monito)\b/.test(q))
    return "Tu personaje tiene 2 partes:\n- **Cara, peinado y ropa**: las eliges en [Mi personaje](/personaje).\n- **Su cuerpo**: cambia solo con tus medidas. Actualízalas en [Medidas](/cuerpo) y verás el cambio.";

  if (ejercicio) return `**${ejercicio.nombre}**\n${ejercicio.pasos.map((p) => `- ${p}`).join("\n")}\n\nVe las fotos en [Ejercicios](/ejercicios).`;

  return `No estoy seguro de qué me preguntas. 🤔\n\n${AYUDA}`;
}
