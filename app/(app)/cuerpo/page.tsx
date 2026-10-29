import { Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { CamposMedida } from "@/components/campos-medida";
import { BotonAccion, Formulario } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { borrarMedida, guardarMedida } from "@/lib/acciones";
import { fechaBonita } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";

export default async function Medidas() {
  const repo = await obtenerRepo();
  const [perfil, medidas] = await Promise.all([repo.perfil(), repo.medidas()]);
  if (!perfil) redirect("/bienvenida");
  const ultima = medidas.at(-1);
  return (
    <div className="grid gap-4">
      <Titulo detalle="Con una cinta métrica, cada semana o cada mes. Tu personaje se redibuja solo.">Medidas</Titulo>
      <Card id="medir">
        <CardTitle className="mb-1">Nuevas medidas</CardTitle>
        <CardDescription className="mb-4">Siempre igual: en la mañana y antes de comer.</CardDescription>
        <Formulario accion={guardarMedida} boton="Guardar medidas" limpiar>
          <CamposMedida anterior={ultima} />
        </Formulario>
      </Card>
      {medidas.length > 0 && (
        <Card>
          <CardTitle className="mb-2 text-base">Historial</CardTitle>
          <ul className="grid gap-1 text-sm">
            {[...medidas].reverse().map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <span>
                  {fechaBonita(m.fecha)} · <strong>{m.peso_kg} kg</strong>
                  {m.cintura_cm ? ` · cintura ${m.cintura_cm}` : ""}
                  {m.brazo_cm ? ` · brazo ${m.brazo_cm}` : ""}
                </span>
                <BotonAccion accion={borrarMedida.bind(null, m.id)} confirmar="¿Borrar esta medida?" size="icon">
                  <Trash2 className="size-4" aria-label="Borrar" />
                </BotonAccion>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
