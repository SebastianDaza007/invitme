import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/src/lib/db";
import type { EventoInvitacion } from "@/src/types/invite";
import { Reveal } from "@/src/components/invite/reveal";
import { InviteHero } from "@/src/components/invite/invite-hero";
import { Countdown } from "@/src/components/invite/countdown";
import { EventDetails } from "@/src/components/invite/event-details";
import { RsvpForm } from "@/src/components/invite/rsvp-form";
import { AuthMenu } from "@/src/components/auth/auth-menu";
import { buttonClasses } from "@/src/components/ui/button";
import { Logo } from "@/src/components/common/logo";

type Params = Promise<{ slug: string }>;

async function getEvento(slug: string) {
  const evento = await db.evento.findUnique({
    where: { slug },
    include: { creador: true },
  });
  return evento;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEvento(slug);
  if (!evento) return { title: "Invitme" };
  return {
    title: `Invitme — ${evento.titulo}`,
    description:
      evento.descripcion ??
      `${evento.creador.nombre} te invita a celebrar. Confirmá tu asistencia.`,
  };
}

export default async function PaginaEvento({ params }: { params: Params }) {
  const { slug } = await params;
  const evento = await getEvento(slug);
  if (!evento) notFound();

  const vm: EventoInvitacion = {
    titulo: evento.titulo,
    descripcion: evento.descripcion ?? undefined,
    lugar: evento.lugar,
    fechaInicio: evento.fechaInicio,
    fechaFin: evento.fechaFin ?? undefined,
    anfitrion: evento.creador.nombre,
  };

  return (
    <main className="bg-mesh relative flex-1">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <Logo height={28} />
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href="#rsvp"
              className={buttonClasses({
                variant: "primary",
                className: "h-9 px-3.5 text-sm sm:px-4",
              })}
            >
              <span className="sm:hidden">Confirmar</span>
              <span className="hidden sm:inline">Confirmar asistencia</span>
            </a>
            <AuthMenu />
          </div>
        </div>
      </header>

      <Reveal>
        <InviteHero evento={vm} />
      </Reveal>
      <Reveal>
        <Countdown target={vm.fechaInicio} />
      </Reveal>
      <Reveal>
        <EventDetails evento={vm} />
      </Reveal>
      <Reveal>
        <RsvpForm slug={slug} />
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-4xl border border-primary/10 bg-white/50 px-6 py-12 text-center sm:py-16">
            <Logo height={22} className="mx-auto" />
            <h2 className="text-gradient-warm mx-auto mt-3 max-w-xl font-display text-3xl font-semibold italic leading-tight sm:text-4xl">
              ¿Tú también tienes un evento?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Crea tu invitación digital en minutos, comparte el link y recibe
              confirmaciones sin esfuerzo.
            </p>
            <Link
              href="/crear"
              className={buttonClasses({
                variant: "primary",
                size: "lg",
                className: "mt-7",
              })}
            >
              Crea tu invitación
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </Reveal>

      <footer className="border-t border-primary/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            Hecho con{" "}
            <span className="font-semibold text-foreground/80">Invitme</span>
          </p>
          <p>Invitaciones digitales con estilo</p>
        </div>
      </footer>
    </main>
  );
}
