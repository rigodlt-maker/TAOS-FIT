import { CalendarPlus, ClipboardCheck, Dumbbell, MapPin, Palette, Ruler, Salad, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import Link from "next/link";
import { AvisosPush } from "@/components/avisos-push";
import { FormularioContrasena } from "@/components/contrasena";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { enlaceCalendario } from "@/lib/calendario";
import { hoyLocal } from "@/lib/entreno";
import { correoActual, obtenerRepo } from "@/lib/sesion";

// Mosaico grande con ícono: todo a la vista, nada escondido
function Mosaico({ href, icono: Icono, titulo, detalle, externo }: { href: string; icono: typeof MapPin; titulo: string; detalle: string; externo?: boolean }) {
  return (
    <Link href={href} target={externo ? "_blank" : undefined} className="flex min-h-32 flex-col justify-between gap-3 rounded-2xl border bg-card p-4 active:scale-[0.98] active:bg-muted">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15">
        <Icono className="size-6 text-primary" />
      </span>
      <span>
        <span className="block leading-tight font-semibold">{titulo}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{detalle}</span>
      </span>
    </Link>
  );
}

export default async function Yo() {
  const repo = await obtenerRepo();
  const [correo, perfil, medidas] = await Promise.all([correoActual(), repo.perfil(), repo.medidas()]);
  if (!perfil) redirect("/bienvenida");
  const ultima = medidas.at(-1);
  const calendario = enlaceCalendario(perfil, hoyLocal());
  return (
    <div className="grid gap-4">
      <Card className="flex items-center gap-4">
        {ultima && <Avatar perfil={perfil} medida={ultima} soloCara className="size-20 shrink-0 rounded-full bg-background" />}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{perfil.nombre}</h1>
          {correo && <p className="truncate text-sm text-muted-foreground">{correo}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/personaje" className="flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm active:bg-muted">
              <Palette className="size-4 text-primary" /> Personaje
            </Link>
            <Link href="/cuerpo" className="flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm active:bg-muted">
              <Ruler className="size-4 text-primary" /> Medidas
            </Link>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Mosaico href="/perfil" icono={UserRound} titulo="Mi perfil" detalle="Meta, días, comida y molestias" />
        <Mosaico href="/cuerpo" icono={Ruler} titulo="Medidas" detalle="Peso y cinta; tu personaje cambia" />
        <Mosaico href="/personaje" icono={Palette} titulo="Mi personaje" detalle="Cara, pelo y ropa" />
        <Mosaico href="/registro" icono={ClipboardCheck} titulo="Registro semanal" detalle="1 minuto: ajusta tu plan" />
        <Mosaico href="/ejercicios" icono={Dumbbell} titulo="Ejercicios" detalle="Fotos y pasos de cada uno" />
        {calendario && <Mosaico href={calendario} icono={CalendarPlus} titulo="A mi calendario" detalle="Tus entrenos con aviso" externo />}
        <Mosaico href="https://www.google.com/maps/search/gimnasios+cerca+de+mi" icono={MapPin} titulo="Gimnasios cerca" detalle="Abre Google Maps" externo />
        <Mosaico href="https://www.google.com/maps/search/restaurantes+saludables+cerca+de+mi" icono={Salad} titulo="Comida saludable" detalle="Cerca de ti" externo />
      </div>
      <Card>
        <CardTitle className="mb-1">Notificaciones en el celular</CardTitle>
        <CardDescription className="mb-4">Te recuerdo cuándo entrenar y tu registro semanal.</CardDescription>
        <AvisosPush />
      </Card>
      {repo.modo === "supabase" && (
        <Card>
          <CardTitle className="mb-1">Contraseña</CardTitle>
          <CardDescription className="mb-4">Es la misma de tus otras apps TAOS.</CardDescription>
          <FormularioContrasena />
        </Card>
      )}
      <p className="px-2 text-center text-xs text-muted-foreground">
        Tao Fit da orientación general de entrenamiento y alimentación; no sustituye a un médico, nutriólogo ni entrenador certificado. Si tienes una lesión o enfermedad, consulta
        antes de empezar. Fotos de ejercicios: Free Exercise DB (dominio público).
      </p>
    </div>
  );
}
