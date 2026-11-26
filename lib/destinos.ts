// Todas las pantallas de Tao Fit, por grupo y con las palabras con que la gente las busca (buscador 🔍 del encabezado)
import { Award, Bell, BookOpen, CalendarCheck, CalendarDays, Target, ClipboardCheck, ClipboardList, Dumbbell, Home, KeyRound, LineChart, MessageSquareHeart, Palette, Play, Ruler, Salad, ShoppingCart, Type, UserRound } from "lucide-react";
import type { Destino } from "@/components/taos/buscador";

export const GRUPOS = ["Entrenar", "Comer", "Mi progreso", "Mi cuenta"] as const;

export const DESTINOS: Destino[] = [
  { ruta: "/", nombre: "Hoy", detalle: "Lo que te toca hoy", grupo: "Entrenar", icono: Home, palabras: "inicio hoy principal resumen" },
  { ruta: "/entrenar", nombre: "Entrenar ahora", detalle: "Calentamiento, series y la última vez", grupo: "Entrenar", icono: Play, palabras: "entrenar empezar entreno gym gimnasio series pesas calentamiento ejercicio hoy casa" },
  { ruta: "/rutina", nombre: "Mi rutina", detalle: "Los ejercicios de cada día", grupo: "Entrenar", icono: ClipboardList, palabras: "rutina plan dias ejercicios semana cambiar ejercicio aparato ocupado" },
  { ruta: "/ejercicios", nombre: "Ejercicios", detalle: "Fotos y pasos de cada uno", grupo: "Entrenar", icono: Dumbbell, palabras: "ejercicios tecnica como se hace fotos lista" },
  { ruta: "/comida", nombre: "Mi menú", detalle: "Menú de la semana con tus calorías", grupo: "Comer", icono: Salad, palabras: "comida menu comer calorias proteina dieta desayuno comida cena kcal macros" },
  { ruta: "/comida/lista", nombre: "Lista del súper", detalle: "Lo que necesitas comprar", grupo: "Comer", icono: ShoppingCart, palabras: "lista super compras mandado despensa" },
  { ruta: "/progreso", nombre: "Progreso", detalle: "Tus gráficas y ajustes", grupo: "Mi progreso", icono: LineChart, palabras: "progreso graficas peso avance historial ajustes" },
  { ruta: "/registro", nombre: "Registro semanal", detalle: "1 minuto: ajusta tu plan", grupo: "Mi progreso", icono: ClipboardCheck, palabras: "registro semanal check in peso energia sueno" },
  { ruta: "/cuerpo", nombre: "Medidas", detalle: "Peso y cinta; tu personaje cambia", grupo: "Mi progreso", icono: Ruler, palabras: "medidas peso cintura cuerpo cinta" },
  { ruta: "/medallas", nombre: "Mis medallas", detalle: "Tu álbum", grupo: "Mi progreso", icono: Award, palabras: "medallas logros premios album" },
  { ruta: "/perfil", nombre: "Mi plan y perfil", detalle: "Objetivos, días, lugares, clases y comida", grupo: "Mi cuenta", icono: UserRound, palabras: "perfil plan meta edad altura alimentos molestias lesion vegetariano" },
  { ruta: "/perfil#meta", nombre: "Mis objetivos", detalle: "Músculo, fuerza, bajar grasa… uno o varios", grupo: "Mi cuenta", icono: Target, palabras: "objetivo objetivos meta bajar grasa ganar musculo fuerza resistencia peso" },
  { ruta: "/perfil#dias", nombre: "Días y lugar de entreno", detalle: "Qué días entrenas y dónde (gym o casa)", grupo: "Mi cuenta", icono: CalendarDays, palabras: "dias de entreno lugar donde entreno casa gimnasio sabado domingo semana" },
  { ruta: "/perfil#clases", nombre: "Mis clases fijas", detalle: "Pilates, yoga, barre… y «Ya fui»", grupo: "Mi cuenta", icono: CalendarCheck, palabras: "clases clase pilates yoga barre sculpt taichi mobility instructor ya fui" },
  { ruta: "/personaje", nombre: "Mi personaje", detalle: "Cara, pelo y ropa", grupo: "Mi cuenta", icono: Palette, palabras: "personaje avatar cara pelo ropa" },
  { ruta: "/mas#avisos", nombre: "Notificaciones", detalle: "Recordatorios para entrenar", grupo: "Mi cuenta", icono: Bell, palabras: "notificaciones avisos recordatorios alertas push" },
  { ruta: "/mas#pantalla", nombre: "Letra grande", detalle: "Tamaño de la letra", grupo: "Mi cuenta", icono: Type, palabras: "letra grande tamano pantalla tutorial" },
  { ruta: "/mas#contrasena", nombre: "Contraseña", detalle: "La misma de tus apps TAOS", grupo: "Mi cuenta", icono: KeyRound, palabras: "contrasena clave password entrar" },
  { ruta: "/sugerencias", nombre: "Sugerencias", detalle: "Ideas, fallas o mejoras para TAOS", grupo: "Mi cuenta", icono: MessageSquareHeart, palabras: "sugerencias sugerencia idea ideas falla error mejora comentario opinion soporte" },
  { ruta: "/mas", nombre: "Mi cuenta", detalle: "Perfil, avisos y todo lo demás", grupo: "Mi cuenta", icono: BookOpen, palabras: "yo mas ajustes configuracion gimnasios cerca calendario" },
];
