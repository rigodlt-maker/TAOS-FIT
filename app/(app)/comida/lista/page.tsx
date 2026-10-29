import { redirect } from "next/navigation";
import { ListaSuper } from "@/components/lista-super";
import { Titulo } from "@/components/taos/encabezado";
import { hoyLocal, sumarDias } from "@/lib/entreno";
import { listaDeCompras } from "@/lib/menu";
import { indiceDia, menuVigente } from "@/lib/menu-actual";
import { obtenerRepo } from "@/lib/sesion";

export default async function Lista() {
  const repo = await obtenerRepo();
  const [perfil, medidas] = await Promise.all([repo.perfil(), repo.medidas()]);
  if (!perfil) redirect("/bienvenida");
  const menu = await menuVigente(repo, perfil, medidas.at(-1));
  if (!menu) redirect("/comida");
  const hoy = hoyLocal();
  const lunes = sumarDias(hoy, -indiceDia(hoy));
  const secciones = listaDeCompras(menu).map((s) => ({ seccion: s.seccion, cosas: s.cosas.map((c) => ({ id: c.alimento.id, nombre: c.alimento.nombre, texto: c.texto })) }));
  return (
    <div className="grid gap-4">
      <Titulo detalle="Todo lo de tu menú de la semana, por sección del súper. Palomea lo que ya tienes.">Lista del súper</Titulo>
      <ListaSuper semana={lunes} secciones={secciones} />
    </div>
  );
}
