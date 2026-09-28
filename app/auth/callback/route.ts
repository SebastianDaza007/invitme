import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";

// Destino de los links que manda Supabase por email (confirmación de cuenta y
// recuperación de contraseña). El link trae ?code=...; acá se intercambia por
// una sesión (las cookies quedan escritas en la response) y se redirige a
// `next`, que debe ser una ruta interna — se rechaza cualquier otra cosa para
// no convertir esto en un open redirect.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next =
    nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  const destino = new URL(next, url.origin);
  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(destino);
  }

  // Link inválido, expirado o ya usado: vuelve al destino con flag de error.
  destino.searchParams.set("error", "enlace");
  return NextResponse.redirect(destino);
}
