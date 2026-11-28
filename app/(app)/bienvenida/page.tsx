import { redirect } from "next/navigation";
import { Bienvenida } from "@/components/bienvenida";
import { esNube } from "@/lib/modo";
import { obtenerRepo } from "@/lib/sesion";
import { puedeEscribirUsuario } from "@/lib/suscripcion-servidor";
import { clienteAdmin } from "@/lib/supabase/admin";
import { clienteServidor } from "@/lib/supabase/servidor";

export default async function PaginaBienvenida() {
  if (await (await obtenerRepo()).perfil()) redirect("/");
  // Nube: sin suscripción vigente se avisa desde el principio que el plan se guarda al empezar los 7 días gratis
  let sinSuscripcion = false;
  if (esNube()) {
    const { data } = await (await clienteServidor()).auth.getClaims();
    const usuario = data?.claims?.sub;
    sinSuscripcion = typeof usuario === "string" && !(await puedeEscribirUsuario(clienteAdmin(), usuario));
  }
  return <Bienvenida sinSuscripcion={sinSuscripcion} />;
}
