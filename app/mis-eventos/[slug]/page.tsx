import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  MapPin,
  Pencil,
} from "lucide-react";
import { db } from "@/src/lib/db";
import { supabaseServer } from "@/src/lib/supabase/server";
import { cn, formatFechaEvento, formatHoraEvento } from "@/src/lib/utils";
import { AuthMenu } from "@/src/components/auth/auth-menu";
import { EditarEvento } from "@/src/components/admin/editar-evento";
import { NavMenu } from "@/src/components/common/nav-menu";
import { CopyLinkButton } from "@/src/components/common/copy-link-button";
import { Logo } from "@/src/components/common/logo";
import { buttonClasses } from "@/src/components/ui/button";

type Params = Promise<{ slug: string }>;

const fechaCorta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

const ESTADOS = {
  CONFIRMADO: { label: "Confirmado", clases: "bg-primary/10 text-primary" },
  RECHAZADO: { label: "No asiste", clases: "bg-foreground/8 text-foreground/70" },
  PENDIENTE: { label: "Pendiente", clases: "bg-black/5 text-muted-foreground" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const evento = await db.evento.findUnique({
    where: { slug },
    select: { titulo: true },
  });
  return { title: `Invitme — ${evento?.titulo ?? "Mi evento"}` };
}

export default async function AdminEventoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const persona = await db.persona.findUnique({ where: { authId: user.id } });
  if (!persona) redirect("/");

  const evento = await db.evento.findUnique({
    where: { slug },
    include: {
      invitaciones: {
        include: { persona: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!evento || evento.creadorId !== persona.id) notFound();

  const confirmados = evento.invitaciones.filter(
    (i) => i.estado === "CONFIRMADO",
  ).length;
  const rechazados = evento.invitaciones.filter(
    (i) => i.estado === "RECHAZADO",
  ).length;
  const pendientes = evento.invitaciones.length - confirmados - rechazados;

  return (
    <main className="bg-mesh relative flex-1">
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

      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/mis-eventos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Mis eventos
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Tu evento
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold italic text-foreground sm:text-4xl">
              {evento.titulo}
            </h1>
            <p className="mt-2.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {formatFechaEvento(evento.fechaInicio)} ·{" "}
              {formatHoraEvento(evento.fechaInicio)} h
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {evento.lugar}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton ruta={`/e/${evento.slug}`} />
            <Link
              href={`/e/${evento.slug}`}
              className={buttonClasses({
                variant: "glass",
                className: "h-9 px-3.5 text-sm",
              })}
            >
              Ver invitación
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <span className="rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
            {confirmados} confirmado{confirmados === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-foreground/8 px-3.5 py-1.5 text-sm font-semibold text-foreground/70">
            {rechazados} no asiste{rechazados === 1 ? "" : "n"}
          </span>
          {pendientes > 0 && (
            <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-sm font-semibold text-muted-foreground">
              {pendientes} pendiente{pendientes === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <details className="group mt-8 rounded-3xl border border-primary/10 bg-white/55">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[15px] font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2.5">
              <Pencil className="size-4 text-primary" aria-hidden />
              Editar evento
            </span>
            <ChevronDown
              className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <EditarEvento
            evento={{
              slug: evento.slug,
              titulo: evento.titulo,
              anfitrion: persona.nombre,
              fechaInicioISO: evento.fechaInicio.toISOString(),
              lugar: evento.lugar,
              descripcion: evento.descripcion ?? "",
              fondo: evento.fondo,
            }}
          />
        </details>

        <section aria-labelledby="invitados-titulo" className="mt-10">
          <h2
            id="invitados-titulo"
            className="font-display text-2xl font-semibold italic text-foreground"
          >
            Invitados
          </h2>

          {evento.invitaciones.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-primary/25 bg-white/40 px-6 py-10 text-center">
              <p className="text-[15px] text-muted-foreground">
                Todavía nadie respondió. Compartí el link de la invitación para
                empezar a recibir confirmaciones.
              </p>
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-2.5">
              {evento.invitaciones.map((inv) => {
                const estado = ESTADOS[inv.estado];
                return (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-white/55 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-foreground">
                        {inv.persona.nombre}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {inv.persona.email}
                      </p>
                      {inv.mensaje && (
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          “{inv.mensaje}”
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          estado.clases,
                        )}
                      >
                        {estado.label}
                      </span>
                      <span className="text-xs text-muted-foreground/80">
                        {fechaCorta.format(inv.updatedAt)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
