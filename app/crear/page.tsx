import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthMenu } from "@/src/components/auth/auth-menu";
import { CreateEvento } from "@/src/components/create/create-evento";

export const metadata: Metadata = {
  title: "Invitme — Crea el tuyo",
  description: "Arma tu invitación digital en minutos y comparte el link.",
};

export default function CrearPage() {
  return (
    <main className="bg-mesh relative flex flex-1 flex-col">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <Sparkles className="size-4 text-primary" aria-hidden />
            Invitme
          </Link>
          <AuthMenu />
        </div>
      </header>

      <CreateEvento />
    </main>
  );
}
