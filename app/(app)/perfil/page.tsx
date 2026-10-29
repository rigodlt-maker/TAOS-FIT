import { redirect } from "next/navigation";
import { CamposComida, CamposEntreno, CamposMeta, CamposTu } from "@/components/campos-perfil";
import { Formulario } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { guardarPerfil } from "@/lib/acciones";
import { obtenerRepo } from "@/lib/sesion";

const SECCIONES = [
  ["tu", "Tú", "", CamposTu],
  ["meta", "Tu meta", "Cambia tus calorías y tu rutina.", CamposMeta],
  ["entreno", "Tu entreno", "Si cambias algo aquí, rehago tu rutina.", CamposEntreno],
  ["comida", "Tu comida", "Si cambias algo aquí, rehago tu menú.", CamposComida],
] as const;

export default async function MiPerfil() {
  const perfil = await (await obtenerRepo()).perfil();
  if (!perfil) redirect("/bienvenida");
  return (
    <div className="grid gap-4">
      <Titulo detalle="Cada sección se guarda por separado.">Mi perfil</Titulo>
      <nav className="grid grid-cols-4 gap-2 text-center text-sm">
        {SECCIONES.map(([id, nombre]) => (
          <a key={id} href={`#${id}`} className="flex min-h-11 items-center justify-center rounded-xl border">
            {nombre.replace("Tu ", "")}
          </a>
        ))}
      </nav>
      {SECCIONES.map(([id, nombre, detalle, Campos]) => (
        <Card key={id} id={id} className="scroll-mt-20">
          <CardTitle className="mb-1">{nombre}</CardTitle>
          {detalle && <CardDescription className="mb-4">{detalle}</CardDescription>}
          <Formulario accion={guardarPerfil} boton="Guardar">
            <Campos p={perfil} />
          </Formulario>
        </Card>
      ))}
    </div>
  );
}
