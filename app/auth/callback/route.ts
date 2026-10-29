import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";

// Aquí llega el enlace mágico del correo: se canjea por una sesión
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const db = await clienteServidor();
  const codigo = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  const resultado = codigo
    ? await db.auth.exchangeCodeForSession(codigo)
    : tokenHash && tipo
      ? await db.auth.verifyOtp({ token_hash: tokenHash, type: tipo })
      : { data: { user: null }, error: { message: "Enlace incompleto" } };

  if (resultado.error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(resultado.error.message)}`, url));

  // Si todavía no tienes perfil, la pantalla de inicio te manda a la bienvenida
  return NextResponse.redirect(new URL("/", url));
}
