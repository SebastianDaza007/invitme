import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { AuthMenu } from "@/src/components/auth/auth-menu";
import { NavMenu } from "@/src/components/common/nav-menu";
import { RecuperarForm } from "@/src/components/auth/recuperar-form";
import { Logo } from "@/src/components/common/logo";

export const metadata: Metadata = {
  title: "Invitme — Nueva contraseña",
};

type SearchParams = Promise<{ error?: string }>;

// Acá aterriza el link de recuperación (/auth/callback?next=/recuperar ya
// intercambió el code por sesión). Sin sesión el link era inválido o expiró.
export default async function RecuperarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="bg-mesh relative flex flex-1 flex-col">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <NavMenu />
            <Link href="/" className="inline-flex items-center">
              <Logo height={28} />
            </Link>
          </div>
          <AuthMenu />
        </div>
      </header>

      <RecuperarForm activo={!!user && error !== "enlace"} />
    </main>
  );
}
