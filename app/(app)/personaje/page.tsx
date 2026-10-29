import { Ruler } from "lucide-react";
import Link from "next/link";
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
      <Titulo detalle="Aquí eliges su cara, pelo y ropa.">Tu personaje</Titulo>
      <Link href="/cuerpo" className="flex min-h-14 items-center gap-3 rounded-2xl border border-primary/50 px-4 py-3 text-sm active:bg-muted">
        <Ruler className="size-5 shrink-0 text-primary" />
        <span>
          <strong>¿Y su cuerpo?</strong> Se forma solo con tus medidas. <span className="text-primary">Actualizar mis medidas →</span>
        </span>
      </Link>
      <Formulario accion={guardarPerfil} boton="Guardar mi personaje">
        <EditorAvatar inicial={perfil.avatar} cuerpo={perfil.cuerpo} altura={perfil.altura_cm} nacimiento={perfil.nacimiento} medida={medidas.at(-1) ?? null} />
      </Formulario>
    </div>
  );
}
