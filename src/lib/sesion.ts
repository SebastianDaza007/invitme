"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/src/lib/supabase/client";

export interface Sesion {
  nombre: string;
  email: string;
}

// La sesión vive en cookies manejadas por Supabase. onAuthStateChange emite
// INITIAL_SESSION apenas monta (leyendo la cookie/cache), y luego SIGNED_IN /
// SIGNED_OUT ante cada cambio — login, logout o refresh del proxy.ts.
export function sesionDeUsuario(user: User): Sesion {
  const email = user.email ?? "";
  const nombreMeta = (user.user_metadata?.nombre as string | undefined)?.trim();
  return { nombre: nombreMeta || email.split("@")[0], email };
}

export function useSesion(): Sesion | null {
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSesion(session?.user ? sesionDeUsuario(session.user) : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return sesion;
}
