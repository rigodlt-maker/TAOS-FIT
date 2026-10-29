import { CalendarPlus, ChevronRight, Dumbbell, MapPin, Palette, Ruler, Salad, UserRound } from "lucide-react";
import Link from "next/link";
import { AvisosPush } from "@/components/avisos-push";
import { FormularioContrasena } from "@/components/contrasena";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { enlaceCalendario } from "@/lib/calendario";
import { hoyLocal } from "@/lib/entreno";
import { correoActual, obtenerRepo } from "@/lib/sesion";

function Fila({ href, icono: Icono, titulo, detalle, externo }: { href: string; icono: typeof MapPin; titulo: string; detalle: string; externo?: boolean }) {
  return (
    <Link href={href} target={externo ? "_blank" : undefined} className="flex min-h-16 items-center gap-4 rounded-2xl border bg-card px-4 py-3 active:bg-muted">
      <Icono className="size-6 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{titulo}</span>
        <span className="block text-sm text-muted-foreground">{detalle}</span>
      </span>
      <ChevronRight className="size-5 text-muted-foreground" />
    </Link>
  );
}

export default async function Mas() {
  const repo = await obtenerRepo();
  const [correo, perfil] = await Promise.all([correoActual(), repo.perfil()]);
  const calendario = perfil ? enlaceCalendario(perfil, hoyLocal()) : null;
  return (
    <div className="grid gap-3">
      <Titulo detalle={correo ?? undefined}>Más</Titulo>
      <Fila href="/perfil" icono={UserRound} titulo="Mi perfil" detalle="Meta, entreno, comida y molestias" />
      <Fila href="/personaje" icono={Palette} titulo="Mi personaje" detalle="Cara, peinado, ropa y accesorios" />
      <Fila href="/cuerpo" icono={Ruler} titulo="Medidas" detalle="Registrar y ver tu historial" />
      <Fila href="/ejercicios" icono={Dumbbell} titulo="Ejercicios" detalle="Fotos y pasos de cada ejercicio" />
      {calendario && <Fila href={calendario} icono={CalendarPlus} titulo="Entrenos a Google Calendar" detalle="Evento que se repite tus días, con aviso" externo />}
      <Fila href="https://www.google.com/maps/search/gimnasios+cerca+de+mi" icono={MapPin} titulo="Gimnasios cerca de ti" detalle="Se abre Google Maps" externo />
      <Fila href="https://www.google.com/maps/search/restaurantes+saludables+cerca+de+mi" icono={Salad} titulo="Comida saludable cerca" detalle="Se abre Google Maps" externo />
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
