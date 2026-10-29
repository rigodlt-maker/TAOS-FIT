import { redirect } from "next/navigation";
import { Navegacion } from "@/components/navegacion";
import { Encabezado } from "@/components/taos/encabezado";
import { hoyLocal } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";
import { registroPendiente } from "@/lib/semana";

export const dynamic = "force-dynamic";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const repo = await obtenerRepo();
  // Sin tablas (primera vez) o con una actualización pendiente: primero el paso de la base de datos
  if (await repo.esquemaPendiente()) redirect("/configurar");
  const [perfil, registros] = await Promise.all([repo.perfil(), repo.registros()]);
  const aviso = perfil && registroPendiente(perfil, registros, hoyLocal()) ? 1 : 0;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-[calc(10rem+env(safe-area-inset-bottom))]">
      <Encabezado nombre="Tao Fit" />
      {repo.modo === "demo" && !process.env.OCULTAR_AVISO_DEMO && (
        <p className="mb-4 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Modo demostración:</strong> estás viendo un ejemplo con 3 meses de progreso.
        </p>
      )}
      <main>{children}</main>
      <Navegacion aviso={aviso} />
    </div>
  );
}
