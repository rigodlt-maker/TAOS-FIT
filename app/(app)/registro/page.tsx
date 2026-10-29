import { redirect } from "next/navigation";
import { Deslizador } from "@/components/deslizador";
import { Formulario } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/campos";
import { guardarRegistro } from "@/lib/acciones";
import { hoyLocal } from "@/lib/entreno";
import { obtenerRepo } from "@/lib/sesion";

export default async function Registro() {
  const repo = await obtenerRepo();
  const [perfil, medidas, registros] = await Promise.all([repo.perfil(), repo.medidas(), repo.registros()]);
  if (!perfil) redirect("/bienvenida");
  const previo = registros.at(-1);
  const ultima = medidas.at(-1);
  return (
    <div className="grid gap-4">
      <Titulo detalle="Un minuto. Con esto ajusto tus calorías, tu volumen y tus ejercicios.">Registro semanal</Titulo>
      <Formulario accion={guardarRegistro} boton="Guardar y ajustar mi plan">
        <input type="hidden" name="fecha" value={hoyLocal()} />
        <Card className="grid gap-3">
          <Label>
            Peso promedio de la semana (kg)
            <Input name="peso_kg" inputMode="decimal" required placeholder={String(previo?.peso_kg ?? ultima?.peso_kg ?? "75")} />
            <span className="text-xs font-normal text-muted-foreground">Pésate 3 o más mañanas (en ayunas, después del baño) y saca el promedio. Si solo te pesaste hoy, pon ese.</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["cintura_cm", "Cintura", previo?.cintura_cm ?? ultima?.cintura_cm],
              ["cadera_cm", "Cadera", previo?.cadera_cm ?? ultima?.cadera_cm],
              ["brazo_cm", "Brazo", previo?.brazo_cm ?? ultima?.brazo_cm],
            ].map(([c, n, v]) => (
              <Label key={c as string}>
                {n as string}
                <Input name={c as string} inputMode="decimal" placeholder={v ? String(v) : "cm"} />
              </Label>
            ))}
          </div>
          <CardDescription>Medidas opcionales (cm): si no te mediste, déjalas vacías.</CardDescription>
        </Card>
        <Card className="grid gap-5">
          <Deslizador name="adherencia" etiqueta="¿Cuánto cumpliste del menú?" min={0} max={100} paso={5} inicial={previo?.adherencia ?? 80} unidad="%" caritas={["😬", "😐", "🙂", "😄"]} />
          <Deslizador name="energia" etiqueta="Energía en la semana" min={1} max={10} inicial={previo?.energia ?? 7} caritas={["🪫", "😴", "🙂", "⚡"]} />
          <Deslizador name="sueno" etiqueta="¿Qué tal dormiste?" min={1} max={10} inicial={previo?.sueno ?? 7} caritas={["😵", "🥱", "😌", "😴"]} />
          <Deslizador name="hambre" etiqueta="Hambre" min={1} max={10} inicial={previo?.hambre ?? 5} caritas={["😌", "🙂", "😋", "🤤"]} />
        </Card>
        <Card>
          <Label>
            Notas (opcional)
            <textarea name="notas" rows={3} maxLength={500} placeholder="¿Algo que deba saber? Por ejemplo: viaje, dolor, mucho estrés…" className="rounded-xl border bg-background p-3 text-base font-normal" />
            <span className="text-xs font-normal text-muted-foreground">Si escribes dolor agudo, mareo u otra condición médica, pauso los aumentos de peso y te recomiendo ir al médico.</span>
          </Label>
        </Card>
      </Formulario>
    </div>
  );
}
