import { cronAutorizado, repoDelDueno } from "@/lib/cron";
import { diaQueToca, entrenosSemana, hoyLocal, sumarDias } from "@/lib/entreno";
import { enviarPush, type AvisoPush } from "@/lib/push";
import { registroPendiente, tocaEntrenar } from "@/lib/semana";

export const dynamic = "force-dynamic";

// Todos los días a las 7:00 (hora de México): recordatorio de entreno y, el día que toca, del registro semanal
export async function GET(req: Request) {
  if (!cronAutorizado(req)) return new Response("No autorizado", { status: 401 });
  try {
    const repo = await repoDelDueno();
    const hoy = hoyLocal();
    const [perfil, plan, series, registros] = await Promise.all([repo.perfil(), repo.planActivo(), repo.series({ desde: sumarDias(hoy, -14) }), repo.registros()]);
    if (!perfil) return Response.json({ ok: true, nada: "sin perfil" });
    const avisos: AvisoPush[] = [];
    const semana = entrenosSemana(series, hoy);
    if (plan && tocaEntrenar(perfil, hoy, semana)) {
      const dia = plan.dias[diaQueToca(plan, series, hoy).dia];
      avisos.push({
        titulo: `🏋️ Hoy toca ${dia.nombre.replace(/^Día \d+ · /, "")}`,
        cuerpo: `${dia.enfoque} · ${dia.ejercicios.length} ejercicios${perfil.hora_entreno ? ` a las ${perfil.hora_entreno}` : ""}. Llevas ${semana} de ${perfil.dias_semana} esta semana.`,
        url: "/entrenar",
        etiqueta: "entreno",
      });
    }
    if (registroPendiente(perfil, registros, hoy))
      avisos.push({ titulo: "📋 Tu registro semanal", cuerpo: `Esta semana entrenaste ${semana} de ${perfil.dias_semana} días. Un minuto para ajustar tu plan.`, url: "/registro", etiqueta: "registro" });
    const push = await enviarPush(repo, avisos);
    return Response.json({ ok: true, avisos: avisos.length, push });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
