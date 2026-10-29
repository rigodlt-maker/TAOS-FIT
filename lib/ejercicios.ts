// Catálogo de ejercicios de Tao Fit. Las fotos vienen de Free Exercise DB (dominio público, Unlicense):
// https://github.com/yuhonas/free-exercise-db — se copian a public/ejercicios/<id>/0.jpg y 1.jpg (inicio y final del movimiento).

export type Patron =
  | "sentadilla"
  | "bisagra"
  | "empuje_horizontal"
  | "empuje_vertical"
  | "jalon"
  | "remo"
  | "unilateral"
  | "gluteo"
  | "cuadriceps"
  | "femoral"
  | "pantorrilla"
  | "biceps"
  | "triceps"
  | "hombro_lateral"
  | "hombro_posterior"
  | "pecho_aislado"
  | "core"
  | "cardio";

export type Equipo = "barra" | "mancuernas" | "maquina" | "polea" | "corporal" | "kettlebell" | "barra_dominadas";
export type Lesion = "rodilla" | "hombro" | "espalda_baja" | "muneca";
export type Zona = "pecho" | "espalda" | "hombros" | "brazos" | "piernas" | "gluteo" | "abdomen";

export type Ejercicio = {
  id: string;
  nombre: string;
  patron: Patron;
  equipo: Equipo;
  dificultad: 1 | 2 | 3; // 1 principiante, 2 intermedio, 3 avanzado
  compuesto: boolean;
  zonas: Zona[];
  evitar?: Lesion[]; // no se propone si tienes esta molestia
  pasos: string[];
};

export const NOMBRES_PATRON: Record<Patron, string> = {
  sentadilla: "Sentadilla",
  bisagra: "Bisagra de cadera",
  empuje_horizontal: "Empuje de pecho",
  empuje_vertical: "Empuje de hombro",
  jalon: "Jalón vertical",
  remo: "Remo",
  unilateral: "Pierna a una pierna",
  gluteo: "Glúteo",
  cuadriceps: "Cuádriceps",
  femoral: "Femoral",
  pantorrilla: "Pantorrilla",
  biceps: "Bíceps",
  triceps: "Tríceps",
  hombro_lateral: "Hombro lateral",
  hombro_posterior: "Hombro posterior",
  pecho_aislado: "Pecho (aislado)",
  core: "Abdomen",
  cardio: "Cardio",
};

export const NOMBRES_EQUIPO: Record<Equipo, string> = {
  barra: "Barra",
  mancuernas: "Mancuernas",
  maquina: "Máquina",
  polea: "Polea",
  corporal: "Peso corporal",
  kettlebell: "Kettlebell",
  barra_dominadas: "Barra de dominadas",
};

const e = (
  id: string,
  nombre: string,
  patron: Patron,
  equipo: Equipo,
  dificultad: 1 | 2 | 3,
  zonas: Zona[],
  pasos: string[],
  extra: { compuesto?: boolean; evitar?: Lesion[] } = {},
): Ejercicio => ({ id, nombre, patron, equipo, dificultad, zonas, pasos, compuesto: extra.compuesto ?? false, evitar: extra.evitar });

export const EJERCICIOS: Ejercicio[] = [
  // ---------- Sentadilla ----------
  e("Barbell_Squat", "Sentadilla con barra", "sentadilla", "barra", 2, ["piernas", "gluteo"], [
    "Barra sobre la parte alta de la espalda, pies al ancho de hombros y puntas un poco hacia afuera.",
    "Baja sentándote hacia atrás, rodillas en la línea de los pies y pecho arriba, hasta que el muslo quede paralelo al piso.",
    "Sube empujando el piso con todo el pie, sin despegar los talones.",
  ], { compuesto: true, evitar: ["rodilla", "espalda_baja"] }),
  e("Smith_Machine_Squat", "Sentadilla en máquina Smith", "sentadilla", "maquina", 1, ["piernas", "gluteo"], [
    "Pies un poco adelante de la barra, al ancho de hombros.",
    "Baja controlado hasta que el muslo quede paralelo al piso, espalda recta.",
    "Sube empujando con los talones y sin bloquear del todo las rodillas.",
  ], { compuesto: true, evitar: ["rodilla"] }),
  e("Leg_Press", "Prensa de piernas", "sentadilla", "maquina", 1, ["piernas", "gluteo"], [
    "Espalda y cadera pegadas al respaldo, pies al ancho de hombros en el centro de la plataforma.",
    "Baja hasta que las rodillas formen unos 90°, sin que la cadera se despegue.",
    "Empuja con todo el pie sin bloquear las rodillas arriba.",
  ], { compuesto: true }),
  e("Goblet_Squat", "Sentadilla goblet", "sentadilla", "kettlebell", 1, ["piernas", "gluteo"], [
    "Sostén una kettlebell o mancuerna pegada al pecho con ambas manos.",
    "Baja entre tus piernas con el pecho arriba y los codos por dentro de las rodillas.",
    "Sube empujando con los talones.",
  ], { compuesto: true, evitar: ["rodilla"] }),
  e("Dumbbell_Squat", "Sentadilla con mancuernas", "sentadilla", "mancuernas", 1, ["piernas", "gluteo"], [
    "Una mancuerna en cada mano a los costados, pies al ancho de hombros.",
    "Baja sentándote hacia atrás con la espalda recta hasta el paralelo.",
    "Sube empujando el piso con todo el pie.",
  ], { compuesto: true, evitar: ["rodilla"] }),
  e("Bodyweight_Squat", "Sentadilla libre", "sentadilla", "corporal", 1, ["piernas", "gluteo"], [
    "Pies al ancho de hombros, brazos al frente para equilibrarte.",
    "Baja como si te sentaras en una silla, con el pecho arriba.",
    "Sube apretando glúteos. Si es fácil, baja más lento (3 segundos).",
  ], { compuesto: true }),
  e("Hack_Squat", "Sentadilla hack", "sentadilla", "maquina", 2, ["piernas"], [
    "Hombros bajo los cojines, espalda pegada al respaldo, pies al ancho de hombros.",
    "Baja hasta que el muslo quede paralelo a la plataforma.",
    "Sube empujando con todo el pie, sin bloquear las rodillas.",
  ], { compuesto: true, evitar: ["rodilla"] }),

  // ---------- Bisagra de cadera ----------
  e("Romanian_Deadlift", "Peso muerto rumano con barra", "bisagra", "barra", 2, ["piernas", "gluteo", "espalda"], [
    "De pie con la barra frente a los muslos, rodillas un poco flexionadas.",
    "Lleva la cadera hacia atrás y baja la barra pegada a las piernas, espalda recta, hasta sentir el estiramiento atrás del muslo.",
    "Regresa empujando la cadera al frente y apretando glúteos.",
  ], { compuesto: true, evitar: ["espalda_baja"] }),
  e("Stiff-Legged_Dumbbell_Deadlift", "Peso muerto rumano con mancuernas", "bisagra", "mancuernas", 1, ["piernas", "gluteo"], [
    "Una mancuerna en cada mano frente a los muslos, rodillas suaves.",
    "Inclina el torso llevando la cadera atrás, mancuernas pegadas a las piernas y espalda recta.",
    "Sube apretando glúteos sin arquear la espalda.",
  ], { compuesto: true, evitar: ["espalda_baja"] }),
  e("Barbell_Deadlift", "Peso muerto con barra", "bisagra", "barra", 3, ["piernas", "gluteo", "espalda"], [
    "Pies bajo la barra, agárrala al ancho de hombros, espalda recta y pecho arriba.",
    "Empuja el piso con las piernas y sube la barra pegada al cuerpo hasta quedar de pie.",
    "Baja controlado llevando la cadera atrás primero.",
  ], { compuesto: true, evitar: ["espalda_baja"] }),
  e("Kettlebell_One-Legged_Deadlift", "Peso muerto a una pierna", "bisagra", "kettlebell", 2, ["piernas", "gluteo"], [
    "Sostén la pesa con la mano contraria a la pierna de apoyo.",
    "Inclínate al frente mientras la otra pierna sube atrás, espalda recta y cadera nivelada.",
    "Regresa apretando el glúteo de la pierna de apoyo.",
  ], { compuesto: true }),
  e("Hyperextensions_Back_Extensions", "Hiperextensiones", "bisagra", "maquina", 1, ["espalda", "gluteo"], [
    "Cadera apoyada en el cojín y talones fijos.",
    "Baja el torso doblándote desde la cadera con la espalda recta.",
    "Sube hasta quedar en línea con las piernas, sin arquear de más.",
  ]),
  e("Superman", "Superman", "bisagra", "corporal", 1, ["espalda", "gluteo"], [
    "Acostado boca abajo con brazos estirados al frente.",
    "Despega al mismo tiempo brazos, pecho y piernas del piso.",
    "Sostén 2 segundos arriba y baja controlado.",
  ]),

  // ---------- Empuje horizontal (pecho) ----------
  e("Barbell_Bench_Press_-_Medium_Grip", "Press de banca con barra", "empuje_horizontal", "barra", 2, ["pecho", "brazos"], [
    "Acostado en el banco, ojos bajo la barra, agarre un poco más ancho que los hombros y omóplatos juntos.",
    "Baja la barra a la parte baja del pecho con los codos a unos 45° del cuerpo.",
    "Empuja hacia arriba sin despegar la cadera del banco.",
  ], { compuesto: true, evitar: ["hombro"] }),
  e("Dumbbell_Bench_Press", "Press de banca con mancuernas", "empuje_horizontal", "mancuernas", 1, ["pecho", "brazos"], [
    "Acostado en el banco con una mancuerna en cada mano a la altura del pecho.",
    "Empuja hacia arriba juntando ligeramente las mancuernas.",
    "Baja controlado hasta sentir el estiramiento en el pecho.",
  ], { compuesto: true }),
  e("Incline_Dumbbell_Press", "Press inclinado con mancuernas", "empuje_horizontal", "mancuernas", 1, ["pecho", "hombros"], [
    "Banco inclinado a unos 30°, mancuernas a los lados del pecho.",
    "Empuja hacia arriba y un poco hacia adentro.",
    "Baja lento hasta la altura del pecho alto.",
  ], { compuesto: true }),
  e("Barbell_Incline_Bench_Press_-_Medium_Grip", "Press inclinado con barra", "empuje_horizontal", "barra", 2, ["pecho", "hombros"], [
    "Banco a 30°, agarre un poco más ancho que los hombros.",
    "Baja la barra a la parte alta del pecho.",
    "Empuja hacia arriba manteniendo los omóplatos juntos.",
  ], { compuesto: true, evitar: ["hombro"] }),
  e("Machine_Bench_Press", "Press de pecho en máquina", "empuje_horizontal", "maquina", 1, ["pecho", "brazos"], [
    "Ajusta el asiento para que las manijas queden a la altura del pecho.",
    "Empuja al frente sin bloquear los codos.",
    "Regresa lento hasta sentir el estiramiento.",
  ], { compuesto: true }),
  e("Pushups", "Lagartijas", "empuje_horizontal", "corporal", 1, ["pecho", "brazos"], [
    "Manos un poco más anchas que los hombros, cuerpo recto de cabeza a talones.",
    "Baja el pecho casi al piso con los codos a 45°.",
    "Empuja hasta estirar los brazos sin hundir la cadera.",
  ], { compuesto: true, evitar: ["muneca"] }),
  e("Incline_Push-Up", "Lagartijas inclinadas", "empuje_horizontal", "corporal", 1, ["pecho", "brazos"], [
    "Manos sobre un banco, mesa o escalón; cuerpo recto.",
    "Baja el pecho hacia el borde.",
    "Empuja hasta estirar los brazos. Entre más bajo el apoyo, más difícil.",
  ], { compuesto: true }),
  e("Push-Ups_With_Feet_Elevated", "Lagartijas con pies elevados", "empuje_horizontal", "corporal", 2, ["pecho", "hombros"], [
    "Pies sobre un banco o silla, manos en el piso.",
    "Baja el pecho controlado manteniendo el cuerpo recto.",
    "Empuja fuerte hasta estirar los brazos.",
  ], { compuesto: true, evitar: ["muneca", "hombro"] }),
  e("Dips_-_Chest_Version", "Fondos en paralelas", "empuje_horizontal", "corporal", 3, ["pecho", "brazos"], [
    "En paralelas con brazos estirados, inclina un poco el torso al frente.",
    "Baja hasta que los codos formen unos 90°.",
    "Sube empujando sin encoger los hombros.",
  ], { compuesto: true, evitar: ["hombro"] }),

  // ---------- Pecho aislado ----------
  e("Dumbbell_Flyes", "Aperturas con mancuernas", "pecho_aislado", "mancuernas", 1, ["pecho"], [
    "Acostado con las mancuernas arriba del pecho y codos un poco doblados.",
    "Abre los brazos en arco hasta sentir el estiramiento en el pecho.",
    "Regresa juntándolas como si abrazaras un árbol.",
  ], { evitar: ["hombro"] }),
  e("Cable_Crossover", "Cruce de poleas", "pecho_aislado", "polea", 1, ["pecho"], [
    "Poleas arriba, un paso al frente con el torso un poco inclinado.",
    "Junta las manos al frente y abajo en arco, codos suaves.",
    "Regresa lento hasta sentir el estiramiento.",
  ]),
  e("Butterfly", "Pec deck (mariposa)", "pecho_aislado", "maquina", 1, ["pecho"], [
    "Espalda pegada al respaldo, antebrazos o manos en las manijas a la altura del pecho.",
    "Junta los brazos al frente apretando el pecho.",
    "Abre lento sin pasar la línea de los hombros.",
  ]),

  // ---------- Empuje vertical (hombro) ----------
  e("Standing_Military_Press", "Press militar con barra", "empuje_vertical", "barra", 2, ["hombros", "brazos"], [
    "De pie, barra a la altura de la clavícula y agarre al ancho de hombros.",
    "Empuja la barra arriba de la cabeza apretando abdomen y glúteos.",
    "Baja controlado a la clavícula.",
  ], { compuesto: true, evitar: ["hombro", "espalda_baja"] }),
  e("Seated_Dumbbell_Press", "Press de hombro con mancuernas", "empuje_vertical", "mancuernas", 1, ["hombros", "brazos"], [
    "Sentado con respaldo, mancuernas a la altura de las orejas.",
    "Empuja hacia arriba hasta casi juntarlas.",
    "Baja lento a la altura de las orejas.",
  ], { compuesto: true, evitar: ["hombro"] }),
  e("Machine_Shoulder_Military_Press", "Press de hombro en máquina", "empuje_vertical", "maquina", 1, ["hombros", "brazos"], [
    "Ajusta el asiento para que las manijas queden a la altura de los hombros.",
    "Empuja hacia arriba sin bloquear los codos.",
    "Baja controlado.",
  ], { compuesto: true }),
  e("Arnold_Dumbbell_Press", "Press Arnold", "empuje_vertical", "mancuernas", 2, ["hombros"], [
    "Sentado, mancuernas frente a la cara con las palmas hacia ti.",
    "Sube girando las muñecas hasta que las palmas miren al frente arriba.",
    "Baja girando de regreso.",
  ], { compuesto: true, evitar: ["hombro"] }),
  e("Kettlebell_Thruster", "Thruster con kettlebell", "empuje_vertical", "kettlebell", 2, ["hombros", "piernas"], [
    "Pesa a la altura del hombro, baja en sentadilla.",
    "Al subir, usa el impulso para empujar la pesa arriba de la cabeza.",
    "Bájala al hombro y repite.",
  ], { compuesto: true, evitar: ["hombro", "rodilla"] }),

  // ---------- Hombro lateral y posterior ----------
  e("Side_Lateral_Raise", "Elevaciones laterales", "hombro_lateral", "mancuernas", 1, ["hombros"], [
    "De pie con una mancuerna en cada mano a los costados.",
    "Sube los brazos a los lados hasta la altura de los hombros, codos suaves.",
    "Baja lento; no uses impulso.",
  ]),
  e("Cable_Seated_Lateral_Raise", "Elevación lateral en polea", "hombro_lateral", "polea", 1, ["hombros"], [
    "Polea abajo, tómala con la mano contraria cruzando frente al cuerpo.",
    "Sube el brazo al lado hasta la altura del hombro.",
    "Baja controlado.",
  ]),
  e("Reverse_Flyes", "Aperturas posteriores", "hombro_posterior", "mancuernas", 1, ["hombros", "espalda"], [
    "Inclinado al frente con la espalda recta, mancuernas colgando.",
    "Abre los brazos a los lados juntando los omóplatos.",
    "Baja lento.",
  ]),
  e("Face_Pull", "Face pull", "hombro_posterior", "polea", 2, ["hombros", "espalda"], [
    "Polea a la altura de la cara con cuerda.",
    "Jala hacia tu cara separando las manos y con los codos altos.",
    "Regresa lento.",
  ]),

  // ---------- Jalón vertical ----------
  e("Pullups", "Dominadas", "jalon", "barra_dominadas", 3, ["espalda", "brazos"], [
    "Cuelga de la barra con agarre un poco más ancho que los hombros.",
    "Sube llevando el pecho a la barra y los codos hacia abajo.",
    "Baja completo y controlado.",
  ], { compuesto: true, evitar: ["hombro"] }),
  e("Chin-Up", "Dominadas supinas", "jalon", "barra_dominadas", 2, ["espalda", "brazos"], [
    "Cuelga con las palmas hacia ti, al ancho de hombros.",
    "Sube hasta que la barbilla pase la barra.",
    "Baja completo y lento.",
  ], { compuesto: true }),
  e("Band_Assisted_Pull-Up", "Dominadas asistidas con banda", "jalon", "barra_dominadas", 1, ["espalda", "brazos"], [
    "Amarra una liga a la barra y apoya la rodilla o el pie en ella.",
    "Sube llevando el pecho a la barra.",
    "Baja controlado. Usa una liga más delgada cuando sea fácil.",
  ], { compuesto: true }),
  e("Wide-Grip_Lat_Pulldown", "Jalón al pecho", "jalon", "polea", 1, ["espalda", "brazos"], [
    "Sentado con los muslos fijos, agarre ancho.",
    "Jala la barra a la parte alta del pecho llevando los codos abajo.",
    "Sube lento hasta estirar los brazos.",
  ], { compuesto: true }),
  e("Close-Grip_Front_Lat_Pulldown", "Jalón agarre cerrado", "jalon", "polea", 1, ["espalda", "brazos"], [
    "Agarre cerrado, pecho arriba.",
    "Jala hacia el pecho apretando la espalda.",
    "Regresa lento.",
  ], { compuesto: true }),
  e("Straight-Arm_Pulldown", "Pullover en polea", "jalon", "polea", 1, ["espalda"], [
    "De pie frente a la polea alta, brazos estirados.",
    "Baja la barra hasta los muslos con los brazos casi rectos.",
    "Sube lento.",
  ]),

  // ---------- Remo ----------
  e("Bent_Over_Barbell_Row", "Remo con barra", "remo", "barra", 2, ["espalda", "brazos"], [
    "Inclinado al frente con la espalda recta y rodillas suaves.",
    "Jala la barra al ombligo juntando los omóplatos.",
    "Baja controlado sin redondear la espalda.",
  ], { compuesto: true, evitar: ["espalda_baja"] }),
  e("One-Arm_Dumbbell_Row", "Remo con mancuerna a un brazo", "remo", "mancuernas", 1, ["espalda", "brazos"], [
    "Apoya rodilla y mano del mismo lado en el banco, espalda plana.",
    "Jala la mancuerna hacia la cadera con el codo pegado.",
    "Baja hasta estirar el brazo.",
  ], { compuesto: true }),
  e("Seated_Cable_Rows", "Remo sentado en polea", "remo", "polea", 1, ["espalda", "brazos"], [
    "Sentado con la espalda recta y rodillas suaves.",
    "Jala la manija al abdomen juntando los omóplatos.",
    "Regresa lento sin redondear la espalda.",
  ], { compuesto: true }),
  e("Leverage_Iso_Row", "Remo en máquina", "remo", "maquina", 1, ["espalda", "brazos"], [
    "Pecho apoyado en el cojín.",
    "Jala las manijas hacia ti juntando los omóplatos.",
    "Regresa controlado.",
  ], { compuesto: true }),
  e("Inverted_Row", "Remo invertido", "remo", "corporal", 1, ["espalda", "brazos"], [
    "Debajo de una barra o mesa firme, cuerpo recto y talones en el piso.",
    "Jala el pecho hacia la barra.",
    "Baja controlado. Entre más horizontal, más difícil.",
  ], { compuesto: true }),
  e("Bent_Over_Two-Dumbbell_Row", "Remo con dos mancuernas", "remo", "mancuernas", 1, ["espalda", "brazos"], [
    "Inclinado al frente, espalda recta, una mancuerna en cada mano.",
    "Jala ambas hacia la cadera.",
    "Baja lento.",
  ], { compuesto: true, evitar: ["espalda_baja"] }),

  // ---------- Pierna unilateral ----------
  e("Dumbbell_Lunges", "Zancadas con mancuernas", "unilateral", "mancuernas", 1, ["piernas", "gluteo"], [
    "De pie con una mancuerna en cada mano.",
    "Da un paso largo al frente y baja hasta que la rodilla de atrás casi toque el piso.",
    "Empuja con el pie de adelante para regresar. Alterna piernas.",
  ], { compuesto: true, evitar: ["rodilla"] }),
  e("Bodyweight_Walking_Lunge", "Zancadas caminando", "unilateral", "corporal", 1, ["piernas", "gluteo"], [
    "Da un paso largo y baja la rodilla de atrás cerca del piso.",
    "Empuja y avanza con la otra pierna.",
    "Mantén el torso derecho.",
  ], { compuesto: true, evitar: ["rodilla"] }),
  e("Split_Squat_with_Dumbbells", "Sentadilla búlgara (split squat)", "unilateral", "mancuernas", 2, ["piernas", "gluteo"], [
    "Un pie adelante y el otro atrás (si puedes, apoyado en un banco).",
    "Baja recto hasta que la rodilla de atrás casi toque el piso.",
    "Sube empujando con el talón de adelante.",
  ], { compuesto: true }),
  e("Dumbbell_Step_Ups", "Subidas al banco", "unilateral", "mancuernas", 1, ["piernas", "gluteo"], [
    "Frente a un banco o escalón firme, mancuernas a los lados.",
    "Sube con una pierna empujando con el talón.",
    "Baja controlado y alterna.",
  ], { compuesto: true }),
  e("Barbell_Walking_Lunge", "Zancadas con barra", "unilateral", "barra", 2, ["piernas", "gluteo"], [
    "Barra en la espalda alta.",
    "Da pasos largos bajando la rodilla de atrás cerca del piso.",
    "Mantén el torso derecho.",
  ], { compuesto: true, evitar: ["rodilla"] }),

  // ---------- Glúteo ----------
  e("Barbell_Hip_Thrust", "Hip thrust con barra", "gluteo", "barra", 2, ["gluteo", "piernas"], [
    "Espalda alta apoyada en el banco, barra sobre la cadera (usa un cojín).",
    "Sube la cadera hasta quedar en línea con el torso, apretando glúteos.",
    "Baja controlado.",
  ], { compuesto: true }),
  e("Butt_Lift_Bridge", "Puente de glúteo", "gluteo", "corporal", 1, ["gluteo"], [
    "Acostado boca arriba con rodillas dobladas y pies en el piso.",
    "Sube la cadera apretando glúteos.",
    "Sostén 1 segundo arriba y baja.",
  ]),
  e("Single_Leg_Glute_Bridge", "Puente de glúteo a una pierna", "gluteo", "corporal", 2, ["gluteo"], [
    "Como el puente, pero con una pierna estirada al aire.",
    "Sube la cadera empujando con el talón de apoyo.",
    "Baja lento y cambia de lado.",
  ]),
  e("Glute_Kickback", "Patada de glúteo", "gluteo", "corporal", 1, ["gluteo"], [
    "En cuatro puntos, espalda plana.",
    "Lleva una pierna atrás y arriba apretando el glúteo.",
    "Regresa sin arquear la espalda.",
  ]),
  e("Thigh_Abductor", "Abductores en máquina", "gluteo", "maquina", 1, ["gluteo"], [
    "Sentado con las piernas por dentro de los cojines.",
    "Abre las piernas apretando la parte de afuera de la cadera.",
    "Cierra lento.",
  ]),

  // ---------- Cuádriceps, femoral y pantorrilla ----------
  e("Leg_Extensions", "Extensión de piernas", "cuadriceps", "maquina", 1, ["piernas"], [
    "Rodilla alineada con el eje de la máquina, cojín sobre los tobillos.",
    "Estira las piernas apretando el muslo.",
    "Baja lento.",
  ], { evitar: ["rodilla"] }),
  e("Lying_Leg_Curls", "Curl femoral acostado", "femoral", "maquina", 1, ["piernas"], [
    "Boca abajo, cojín sobre los talones.",
    "Dobla las rodillas llevando los talones al glúteo.",
    "Baja controlado.",
  ]),
  e("Seated_Leg_Curl", "Curl femoral sentado", "femoral", "maquina", 1, ["piernas"], [
    "Sentado con el cojín detrás de los tobillos.",
    "Lleva los talones hacia abajo y atrás.",
    "Regresa lento.",
  ]),
  e("Ball_Leg_Curl", "Curl femoral con pelota", "femoral", "corporal", 2, ["piernas", "gluteo"], [
    "Boca arriba con los talones sobre una pelota (o una toalla en piso liso).",
    "Sube la cadera y jala la pelota hacia ti doblando las rodillas.",
    "Estira lento sin bajar la cadera.",
  ]),
  e("Standing_Calf_Raises", "Elevación de talones de pie", "pantorrilla", "maquina", 1, ["piernas"], [
    "Puntas de los pies en el borde de la plataforma.",
    "Sube lo más alto que puedas sobre las puntas.",
    "Baja hasta sentir el estiramiento.",
  ]),
  e("Calf_Raise_On_A_Dumbbell", "Elevación de talones con mancuerna", "pantorrilla", "mancuernas", 1, ["piernas"], [
    "Puntas en un escalón, una mancuerna en la mano y la otra mano apoyada.",
    "Sube sobre las puntas.",
    "Baja lento hasta estirar.",
  ]),
  e("Seated_Calf_Raise", "Elevación de talones sentado", "pantorrilla", "maquina", 1, ["piernas"], [
    "Sentado con el cojín sobre los muslos y puntas en la plataforma.",
    "Sube los talones lo más alto posible.",
    "Baja lento.",
  ]),

  // ---------- Bíceps ----------
  e("Barbell_Curl", "Curl con barra", "biceps", "barra", 1, ["brazos"], [
    "De pie, barra con las palmas al frente y codos pegados al cuerpo.",
    "Sube la barra doblando los codos sin mover los hombros.",
    "Baja lento.",
  ], { evitar: ["muneca"] }),
  e("Dumbbell_Bicep_Curl", "Curl con mancuernas", "biceps", "mancuernas", 1, ["brazos"], [
    "Una mancuerna en cada mano, codos pegados.",
    "Sube girando la palma hacia arriba.",
    "Baja controlado.",
  ]),
  e("Hammer_Curls", "Curl martillo", "biceps", "mancuernas", 1, ["brazos"], [
    "Mancuernas con las palmas mirándose entre sí.",
    "Sube doblando los codos sin girar las muñecas.",
    "Baja lento.",
  ]),
  e("Cable_Hammer_Curls_-_Rope_Attachment", "Curl martillo en polea", "biceps", "polea", 1, ["brazos"], [
    "Polea abajo con cuerda.",
    "Sube la cuerda doblando los codos, pegados al cuerpo.",
    "Baja lento.",
  ]),
  e("Incline_Dumbbell_Curl", "Curl inclinado", "biceps", "mancuernas", 2, ["brazos"], [
    "Recostado en banco inclinado, brazos colgando.",
    "Sube las mancuernas sin mover los codos.",
    "Baja completo para estirar el bíceps.",
  ]),

  // ---------- Tríceps ----------
  e("Triceps_Pushdown_-_Rope_Attachment", "Extensión de tríceps en polea", "triceps", "polea", 1, ["brazos"], [
    "Polea alta con cuerda, codos pegados al cuerpo.",
    "Empuja hacia abajo separando la cuerda al final.",
    "Sube lento sin mover los codos.",
  ]),
  e("Standing_Dumbbell_Triceps_Extension", "Extensión de tríceps con mancuerna", "triceps", "mancuernas", 1, ["brazos"], [
    "Sostén una mancuerna con ambas manos arriba de la cabeza.",
    "Bájala detrás de la cabeza doblando los codos.",
    "Sube estirando los brazos.",
  ], { evitar: ["hombro"] }),
  e("Bench_Dips", "Fondos en banco", "triceps", "corporal", 1, ["brazos"], [
    "Manos en el borde de un banco o silla, piernas al frente.",
    "Baja doblando los codos hacia atrás.",
    "Sube empujando con las palmas.",
  ], { evitar: ["hombro", "muneca"] }),
  e("Close-Grip_Barbell_Bench_Press", "Press de banca agarre cerrado", "triceps", "barra", 2, ["brazos", "pecho"], [
    "Acostado, agarre al ancho de hombros.",
    "Baja la barra al pecho con los codos pegados.",
    "Empuja estirando los brazos.",
  ], { compuesto: true, evitar: ["muneca"] }),
  e("Tricep_Dumbbell_Kickback", "Patada de tríceps", "triceps", "mancuernas", 1, ["brazos"], [
    "Inclinado al frente, codo pegado al cuerpo y doblado a 90°.",
    "Estira el brazo hacia atrás.",
    "Regresa lento.",
  ]),

  // ---------- Abdomen ----------
  e("Plank", "Plancha", "core", "corporal", 1, ["abdomen"], [
    "Antebrazos en el piso, cuerpo recto de cabeza a talones.",
    "Aprieta abdomen y glúteos sin hundir la cadera.",
    "Sostén el tiempo indicado respirando normal.",
  ]),
  e("Dead_Bug", "Dead bug", "core", "corporal", 1, ["abdomen"], [
    "Boca arriba con brazos al techo y rodillas a 90°.",
    "Estira un brazo y la pierna contraria sin despegar la espalda baja del piso.",
    "Regresa y cambia de lado.",
  ]),
  e("Crunches", "Abdominales (crunch)", "core", "corporal", 1, ["abdomen"], [
    "Boca arriba con rodillas dobladas.",
    "Sube los hombros del piso apretando el abdomen.",
    "Baja lento sin jalar el cuello.",
  ]),
  e("Cable_Crunch", "Crunch en polea", "core", "polea", 1, ["abdomen"], [
    "De rodillas frente a la polea alta, cuerda junto a la cabeza.",
    "Dobla el torso hacia abajo apretando el abdomen.",
    "Sube lento.",
  ]),
  e("Hanging_Leg_Raise", "Elevación de piernas colgado", "core", "barra_dominadas", 3, ["abdomen"], [
    "Cuelga de la barra con el cuerpo quieto.",
    "Sube las piernas sin balancearte.",
    "Baja lento.",
  ]),
  e("Side_Bridge", "Plancha lateral", "core", "corporal", 1, ["abdomen"], [
    "De lado, apoyado en el antebrazo, cuerpo recto.",
    "Sube la cadera y sostén.",
    "Cambia de lado.",
  ]),
  e("Mountain_Climbers", "Escaladores", "core", "corporal", 1, ["abdomen"], [
    "En posición de lagartija.",
    "Lleva las rodillas al pecho alternando rápido.",
    "Mantén la cadera baja.",
  ], { evitar: ["muneca"] }),

  // ---------- Cardio ----------
  e("Jogging_Treadmill", "Caminadora", "cardio", "maquina", 1, [], [
    "Camina rápido o trota a un ritmo en el que puedas hablar con esfuerzo.",
    "Inclinación de 5–10% para quemar más sin impacto.",
    "Mantén el ritmo el tiempo indicado.",
  ]),
  e("Bicycling", "Bicicleta", "cardio", "maquina", 1, [], [
    "Ajusta el asiento a la altura de la cadera.",
    "Pedalea a un ritmo constante.",
    "Sube la resistencia si se vuelve fácil.",
  ]),
  e("Elliptical_Trainer", "Elíptica", "cardio", "maquina", 1, [], [
    "Espalda recta y manos en las manijas.",
    "Mueve piernas y brazos a ritmo constante.",
    "Sube la resistencia poco a poco.",
  ]),
  e("Rope_Jumping", "Saltar la cuerda", "cardio", "corporal", 2, [], [
    "Salta sobre las puntas, codos pegados y giro desde las muñecas.",
    "Haz bloques de 30–60 segundos con descansos cortos.",
    "Si no tienes cuerda, simula el movimiento.",
  ], { evitar: ["rodilla"] }),
  e("Air_Bike", "Bicicleta en el piso", "cardio", "corporal", 1, [], [
    "Boca arriba con las manos detrás de la cabeza.",
    "Lleva el codo a la rodilla contraria alternando.",
    "Mantén un ritmo constante.",
  ]),
];

export const ejercicioPorId = (id: string) => EJERCICIOS.find((x) => x.id === id);
export const imagenesDe = (id: string) => [`/ejercicios/${id}/0.jpg`, `/ejercicios/${id}/1.jpg`];
