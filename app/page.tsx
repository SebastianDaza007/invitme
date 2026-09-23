import { ArrowUpRight, Sparkles } from "lucide-react";
import { mockEvento } from "@/src/lib/mock-event";
import { Reveal } from "@/src/components/invite/reveal";
import { InviteHero } from "@/src/components/invite/invite-hero";
import { Countdown } from "@/src/components/invite/countdown";
import { EventDetails } from "@/src/components/invite/event-details";
import { RsvpForm } from "@/src/components/invite/rsvp-form";
import { AuthMenu } from "@/src/components/auth/auth-menu";
import { buttonClasses } from "@/src/components/ui/button";

export default function Home() {
  return (
    <main className="bg-mesh relative flex-1">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <Sparkles className="size-4 text-primary" aria-hidden />
            Invitme
          </a>
          <div className="flex items-center gap-5">
            <a
              href="/crear"
              className="hidden rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:inline-flex"
            >
              Crea el tuyo
            </a>
            <a
              href="#rsvp"
              className={buttonClasses({
                variant: "primary",
                className: "h-9 px-4 text-sm",
              })}
            >
              Confirmar asistencia
            </a>
            <AuthMenu />
          </div>
        </div>
      </header>

      <Reveal>
        <InviteHero evento={mockEvento} />
      </Reveal>
      <Reveal>
        <Countdown target={mockEvento.fechaInicio} />
      </Reveal>
      <Reveal>
        <EventDetails evento={mockEvento} />
      </Reveal>
      <Reveal>
        <RsvpForm />
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-[2rem] border border-primary/10 bg-white/50 px-6 py-12 text-center sm:py-16">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              Invitme
            </p>
            <h2 className="text-gradient-warm mx-auto mt-3 max-w-xl font-display text-3xl font-semibold italic leading-tight sm:text-4xl">
              ¿Tú también tienes un evento?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Crea tu invitación digital en minutos, comparte el link y recibe
              confirmaciones sin esfuerzo.
            </p>
            <a
              href="/crear"
              className={buttonClasses({
                variant: "primary",
                size: "lg",
                className: "mt-7",
              })}
            >
              Crea tu invitación
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
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
