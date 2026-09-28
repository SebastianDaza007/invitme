import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase para Server Components y Server Actions.
// Lee las cookies del request; escribe solo cuando el contexto lo permite
// (actions/route handlers). En Server Components el refresh lo hace proxy.ts.
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component: no se pueden escribir cookies acá.
          }
        },
      },
    },
  );
}
