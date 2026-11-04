import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navegacion } from "@/components/navegacion";
import { ChatTao } from "@/components/taos/chat-tao";
import { Encabezado } from "@/components/taos/encabezado";
import { Recorrido, type Paso } from "@/components/taos/recorrido";
import { Campana } from "@/components/taos/campana";
import { Actualizacion } from "@/components/taos/actualizacion";
import { BotonTao } from "@/components/taos/tao";
import { hoyLocal } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";
import { registroPendiente } from "@/lib/semana";
import { EJEMPLOS_TAO } from "@/lib/tao";

export const dynamic = "force-dynamic";

// Recorrido de bienvenida (sale una sola vez)
const RECORRIDO: Paso[] = [
  { icono: "🏋️", titulo: "Bienvenido a Tao Fit", texto: "Tu entrenador personal: rutina y menú hechos a tu medida. Te enseño lo básico en 1 minuto." },
  { icono: "▶️", titulo: "Entrenar", texto: "Empieza tu entreno de hoy: calentamiento, series y “la última vez” para superarla.", donde: "flotante" },
  { icono: "📋", titulo: "Tu rutina", texto: "Los ejercicios de cada día. ¿Aparato ocupado? Cámbialo por otro.", donde: "/rutina" },
  { icono: "🥗", titulo: "Tu menú", texto: "Menú mexicano de la semana con tus calorías y la lista del súper.", donde: "/comida" },
  { icono: "📈", titulo: "Progreso", texto: "Tus gráficas y el registro semanal: con él ajusto tus calorías y tu rutina.", donde: "/progreso" },
  { icono: "🏅", titulo: "Yo", texto: "Tu perfil, medidas, personaje y tus medallas.", donde: "/mas" },
  { icono: "🔔", titulo: "Tus avisos", texto: "Aquí quedan los avisos que te manda la app, por si se te pasó alguno. El numerito te dice cuántos no has visto.", donde: "campana" },
  { icono: "🎙️", titulo: "Pregúntale a Tao", texto: "“¿Qué entreno hoy?”, “¿qué ceno?”: escribe o usa el micrófono.", donde: "tao" },
];

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const repo = await obtenerRepo();
  // Sin tablas (primera vez) o con una actualización pendiente: primero el paso de la base de datos
  if (await repo.esquemaPendiente()) redirect("/configurar");
  const [perfil, registros] = await Promise.all([repo.perfil(), repo.registros()]);
  const aviso = perfil && registroPendiente(perfil, registros, hoyLocal()) ? 1 : 0;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-[calc(10rem+env(safe-area-inset-bottom))]">
      <Encabezado
        nombre="Tao Fit"
        derecha={
          perfil && (
            <div className="flex items-center gap-2">
              <Campana ajustes="/mas" />
              <BotonTao>
                <ChatTao ejemplos={EJEMPLOS_TAO} placeholder="¿Qué entreno hoy?" />
              </BotonTao>
            </div>
          )
        }
      />
      {repo.modo === "demo" && !process.env.OCULTAR_AVISO_DEMO && (
        <p className="mb-4 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Modo demostración:</strong> estás viendo un ejemplo con 3 meses de progreso.
        </p>
      )}
      <Actualizacion repo="taos-fit" />
      <main>{children}</main>
      <Suspense>
        <Recorrido pasos={RECORRIDO} />
      </Suspense>
      <Navegacion aviso={aviso} />
    </div>
  );
}
