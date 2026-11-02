import { NextResponse } from "next/server";
import { avisoPorHora, horaLocal, hoyLocal, sumarDias } from "@/lib/entreno";
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
  const texto = String(pregunta ?? "").slice(0, 300);
  let respuesta = responderTao(texto, { perfil, medidas, plan, series, registros, ajustes, menu, hoy });
  // Si preguntas qué entrenar a deshoras, Tao te lo dice
  const aviso = /entren|rutina|ejercicio|gym|gimnasio/i.test(texto) ? avisoPorHora(horaLocal()) : null;
  if (aviso) respuesta = `${aviso}\n\n${respuesta}`;
  return NextResponse.json({ respuesta });
}
