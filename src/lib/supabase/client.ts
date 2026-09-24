"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton lazy: el browser client guarda la sesión en cookies (no en
// localStorage), así el servidor la ve en cada request y las Server Actions.
let cliente: SupabaseClient | null = null;

export function supabaseBrowser() {
  cliente ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return cliente;
}
