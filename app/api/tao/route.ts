import { NextResponse } from "next/server";
import { hoyLocal, sumarDias } from "@/lib/entreno";
import { menuVigente } from "@/lib/menu-actual";
import { obtenerRepo } from "@/lib/sesion";
import { responderTao } from "@/lib/tao";

// Tao responde con los datos de quien pregunta (la sesión la valida proxy.ts)
export async function POST(req: Request) {
  const { pregunta } = (await req.json().catch(() => ({}))) as { pregunta?: string };
  const repo = await obtenerRepo();
  const hoy = hoyLocal();
  const [perfil, medidas, plan, series, registros, ajustes] = await Promise.all([
    repo.perfil(),
    repo.medidas(),
    repo.planActivo(),
    repo.series({ desde: sumarDias(hoy, -60) }),
    repo.registros(),
    repo.ajustes(5),
  ]);
  if (!perfil) return NextResponse.json({ respuesta: "Primero completa tu bienvenida: [Empezar](/bienvenida)." });
  const menu = await menuVigente(repo, perfil, medidas.at(-1)).catch(() => null);
  return NextResponse.json({ respuesta: responderTao(String(pregunta ?? "").slice(0, 300), { perfil, medidas, plan, series, registros, ajustes, menu, hoy }) });
}
