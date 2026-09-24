"use server";

import { db } from "@/src/lib/db";
import { supabaseServer } from "@/src/lib/supabase/server";

// Upsert de la fila Persona ligada al usuario autenticado de Supabase.
// Cubre dos casos: usuario nuevo (crea la fila) e invitado que luego se
// registra con el mismo email (vincula el authId a su fila existente).
export async function sincronizarPersona(nombre?: string) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const email = user.email.toLowerCase();
  const nombreMeta = (user.user_metadata?.nombre as string | undefined)?.trim();
  const nombreFinal = nombre?.trim() || nombreMeta || email.split("@")[0];

  return db.persona.upsert({
    where: { email },
    create: { authId: user.id, nombre: nombreFinal, email },
    update: { authId: user.id, nombre: nombreFinal },
  });
}
