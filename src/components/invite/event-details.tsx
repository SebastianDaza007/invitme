import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { EventoInvitacion } from "@/src/types/invite";
import {
  formatFechaEvento,
  formatHoraEvento,
  urlMapa,
} from "@/src/lib/utils";

interface EventDetailsProps {
  evento: EventoInvitacion;
}

function DetailItem({
  icon: Icon,
  titulo,
  detalle,
  children,
}: {
  icon: typeof CalendarDays;
  titulo: string;
  detalle: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="sm:px-8 sm:first:pl-0 sm:last:pr-0 lg:px-10">
      <Icon className="size-5 text-primary" aria-hidden />
      <p className="mt-3 text-base font-semibold leading-snug text-foreground">
        {titulo}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {detalle}
      </p>
      {children}
    </li>
  );
}

export function EventDetails({ evento }: EventDetailsProps) {
  const horario = evento.fechaFin
    ? `${formatHoraEvento(evento.fechaInicio)} – ${formatHoraEvento(evento.fechaFin)} h`
    : `${formatHoraEvento(evento.fechaInicio)} h`;

  return (
    <section
      aria-labelledby="detalles-titulo"
      className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="flex items-end justify-between gap-6 border-b border-primary/10 pb-6">
        <div>
          <p
            id="detalles-titulo"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            Detalles
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold italic text-foreground sm:text-3xl">
            Lo esencial
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-sm leading-relaxed text-muted-foreground md:block">
          Todo lo que necesitas saber para llegar y disfrutar.
        </p>
      </div>

      <ul className="mt-2 grid gap-8 pt-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-primary/10 sm:pt-10">
        <DetailItem
          icon={CalendarDays}
          titulo={formatFechaEvento(evento.fechaInicio)}
          detalle="Agrégalo a tu calendario para no olvidarlo"
        />
        <DetailItem
          icon={Clock}
          titulo={horario}
          detalle="Puntualidad apreciada"
        />
        <DetailItem icon={MapPin} titulo="Ubicación" detalle={evento.lugar}>
          <a
            href={urlMapa(evento.lugar)}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Cómo llegar
            <ArrowUpRight
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </DetailItem>
      </ul>
    </section>
  );
}
