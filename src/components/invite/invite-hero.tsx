import { CalendarDays, Clock, MapPin, Navigation, Sparkles } from "lucide-react";
import type { EventoInvitacion } from "@/src/types/invite";
import { formatFechaEvento, formatHoraEvento, urlMapa } from "@/src/lib/utils";
import { buttonClasses } from "@/src/components/ui/button";

interface InviteHeroProps {
  evento: EventoInvitacion;
}

export function InviteHero({ evento }: InviteHeroProps) {
  const fecha = evento.fechaInicio;
  const dia = fecha.getDate();
  const mes = fecha.toLocaleDateString("es-ES", { month: "long" });
  const anio = fecha.getFullYear();

  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20 lg:pt-16">
      {/* Panel visual tipo póster: primero en mobile, a la derecha en desktop */}
      <div className="relative order-first h-44 overflow-hidden rounded-[2rem] bg-gradient-to-br from-warm-start via-warm-mid to-warm-end sm:h-56 lg:order-none lg:h-auto lg:min-h-[540px] lg:self-stretch">
        <div
          aria-hidden
          className="animate-float-slow absolute -left-10 top-8 size-40 rounded-full bg-white/25 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -right-8 bottom-4 size-48 rounded-full bg-orange-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute left-1/3 top-1/2 size-24 rounded-full bg-amber-200/50 blur-2xl"
        />
        <div className="absolute left-5 top-5 lg:left-7 lg:top-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            <Sparkles className="size-3.5" aria-hidden />
            Estás invitado
          </span>
        </div>
        {/* Fecha en grande, estilo afiche */}
        <div className="absolute inset-0 hidden flex-col items-center justify-center text-white lg:flex">
          <span className="font-display text-[9rem] font-semibold italic leading-none drop-shadow-sm">
            {dia}
          </span>
          <span className="mt-2 text-lg font-medium capitalize tracking-wide text-white/90">
            de {mes} · {anio}
          </span>
          <span className="mt-1 text-sm font-medium text-white/75">
            {formatHoraEvento(fecha)} h
          </span>
        </div>
        <p className="absolute inset-x-0 bottom-4 text-center text-sm font-medium text-white/90 drop-shadow-sm lg:hidden">
          {formatFechaEvento(fecha)} · {formatHoraEvento(fecha)} h
        </p>
      </div>

      {/* Contenido del evento */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {evento.anfitrion} te invita a celebrar
        </p>
        <h1 className="mt-4 font-display text-[2.75rem] font-semibold italic leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {evento.titulo}
        </h1>
        {evento.descripcion && (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {evento.descripcion}
          </p>
        )}

        <ul className="mt-7 flex flex-col gap-2.5 text-[15px] font-medium text-foreground/90">
          <li className="flex items-center gap-2.5">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
            {formatFechaEvento(fecha)}
          </li>
          <li className="flex items-center gap-2.5">
            <Clock className="size-4 shrink-0 text-primary" aria-hidden />
            {formatHoraEvento(fecha)} h
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 truncate">{evento.lugar}</span>
          </li>
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#rsvp"
            className={buttonClasses({ variant: "accent", size: "lg" })}
          >
            Confirmar asistencia
          </a>
          <a
            href={urlMapa(evento.lugar)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({
              variant: "glass",
              className: "border-border bg-white/50",
            })}
          >
            <Navigation className="size-4" aria-hidden />
            Cómo llegar
          </a>
        </div>
      </div>
    </section>
  );
}
