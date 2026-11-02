import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navegacion } from "@/components/navegacion";
import { ChatTao } from "@/components/taos/chat-tao";
import { Encabezado } from "@/components/taos/encabezado";
import { Recorrido, type Paso } from "@/components/taos/recorrido";
import { BotonTao } from "@/components/taos/tao";
import { hoyLocal } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";
import { registroPendiente } from "@/lib/semana";
import { EJEMPLOS_TAO } from "@/lib/tao";

export const dynamic = "force-dynamic";

// Recorrido de bienvenida (sale una sola vez)
const RECORRIDO: Paso[] = [
  { icono: "🏋️", titulo: "Bienvenido a Tao Fit", texto: "En Hoy ves qué te toca entrenar y comer. Todo se ajusta a tu meta, tus días y tu equipo." },
  { icono: "✍️", titulo: "Entrena y anota", texto: "En Entrenar anota peso y repeticiones de cada serie. Fíjate en “la última vez” para superarla. Si algo duele, toca “Me duele”." },
  { icono: "🥗", titulo: "Tu menú ya calculado", texto: "En Comida tienes tu menú mexicano de la semana y la lista del súper. ¿No te gusta algo? Cámbialo por otro." },
  { icono: "📏", titulo: "Registro semanal", texto: "Una vez por semana anota peso, energía y sueño. Con eso Tao Fit ajusta tus calorías y tu rutina." },
  { icono: "🎙️", titulo: "Pregúntale a Tao", texto: "Toca el botón dorado de arriba y escribe o usa el micrófono: “¿qué entreno hoy?”, “¿qué ceno?”." },
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
            <BotonTao>
              <ChatTao ejemplos={EJEMPLOS_TAO} placeholder="¿Qué entreno hoy?" />
            </BotonTao>
          )
        }
      />
      {repo.modo === "demo" && !process.env.OCULTAR_AVISO_DEMO && (
        <p className="mb-4 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Modo demostración:</strong> estás viendo un ejemplo con 3 meses de progreso.
        </p>
      )}
      <main>{children}</main>
      <Suspense>
        <Recorrido pasos={RECORRIDO} />
      </Suspense>
      <Navegacion aviso={aviso} />
    </div>
  );
}
