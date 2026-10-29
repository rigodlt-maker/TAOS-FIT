import { redirect } from "next/navigation";
import { Bienvenida } from "@/components/bienvenida";
import { obtenerRepo } from "@/lib/sesion";

export default async function PaginaBienvenida() {
  if (await (await obtenerRepo()).perfil()) redirect("/");
  return <Bienvenida />;
}
