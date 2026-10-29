import { redirect } from "next/navigation";
import { EditorAvatar } from "@/components/editor-avatar";
import { Formulario } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { guardarPerfil } from "@/lib/acciones";
import { obtenerRepo } from "@/lib/sesion";

export default async function Personaje() {
  const repo = await obtenerRepo();
  const [perfil, medidas] = await Promise.all([repo.perfil(), repo.medidas()]);
  if (!perfil) redirect("/bienvenida");
  return (
    <div className="grid gap-4">
      <Titulo detalle="Elige cómo se ve. Su cuerpo cambia solo con tus medidas.">Tu personaje</Titulo>
      <Formulario accion={guardarPerfil} boton="Guardar mi personaje">
        <EditorAvatar inicial={perfil.avatar} cuerpo={perfil.cuerpo} altura={perfil.altura_cm} nacimiento={perfil.nacimiento} medida={medidas.at(-1) ?? null} />
      </Formulario>
    </div>
  );
}
