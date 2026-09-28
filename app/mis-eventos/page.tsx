import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Sparkles, Users } from "lucide-react";
import { db } from "@/src/lib/db";
import { supabaseServer } from "@/src/lib/supabase/server";
import { formatFechaEvento, formatHoraEvento } from "@/src/lib/utils";
import { AuthMenu } from "@/src/components/auth/auth-menu";
import { NavMenu } from "@/src/components/common/nav-menu";
import { CopyLinkButton } from "@/src/components/common/copy-link-button";
import { Logo } from "@/src/components/common/logo";
import { buttonClasses } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Invitme — Mis eventos",
  description: "Tus eventos creados y los que confirmaste asistencia.",
};

const btnChico = "h-9 px-3.5 text-sm";

export default async function MisEventosPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const persona = await db.persona.findUnique({ where: { authId: user.id } });
  if (!persona) redirect("/");

  const [creados, asisto] = await Promise.all([
    db.evento.findMany({
      where: { creadorId: persona.id },
      orderBy: { fechaInicio: "asc" },
      include: {
        _count: {
          select: { invitaciones: { where: { estado: "CONFIRMADO" } } },
        },
      },
    }),
    db.invitacion.findMany({
      where: { personaId: persona.id, estado: "CONFIRMADO" },
      orderBy: { evento: { fechaInicio: "asc" } },
      include: { evento: { include: { creador: true } } },
    }),
  ]);

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

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mi cuenta
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold italic text-foreground sm:text-4xl">
          Mis eventos
        </h1>

        <section
          id="creados"
          aria-labelledby="creados-titulo"
          className="mt-12 scroll-mt-24"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="creados-titulo"
              className="font-display text-2xl font-semibold italic text-foreground"
            >
              Creados por mí
            </h2>
            <Link
              href="/crear"
              className={buttonClasses({
                variant: "glass",
                className: btnChico,
              })}
            >
              <Sparkles className="size-4 text-primary" aria-hidden />
              Nuevo evento
            </Link>
          </div>

          {creados.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-primary/25 bg-white/40 px-6 py-10 text-center">
              <p className="text-[15px] text-muted-foreground">
                Todavía no creaste ningún evento.
              </p>
              <Link
                href="/crear"
                className={buttonClasses({
                  variant: "primary",
                  className: "mt-4",
                })}
              >
                Crear mi primer evento
              </Link>
            </div>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {creados.map((e) => (
                <li
                  key={e.id}
                  className="rounded-3xl border border-primary/10 bg-white/55 p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl font-semibold italic text-foreground">
                        {e.titulo}
                      </h3>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays
                          className="size-3.5 shrink-0"
                          aria-hidden
                        />
                        {formatFechaEvento(e.fechaInicio)} ·{" "}
                        {formatHoraEvento(e.fechaInicio)} h
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        {e.lugar}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      <Users className="size-3.5" aria-hidden />
                      {e._count.invitaciones}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/mis-eventos/${e.slug}`}
                      className={buttonClasses({
                        variant: "primary",
                        className: btnChico,
                      })}
                    >
                      Administrar
                    </Link>
                    <Link
                      href={`/e/${e.slug}`}
                      className={buttonClasses({
                        variant: "glass",
                        className: btnChico,
                      })}
                    >
                      Ver invitación
                    </Link>
                    <CopyLinkButton ruta={`/e/${e.slug}`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          id="asisto"
          aria-labelledby="asisto-titulo"
          className="mt-14 scroll-mt-24"
        >
          <h2
            id="asisto-titulo"
            className="font-display text-2xl font-semibold italic text-foreground"
          >
            Eventos a los que asisto
          </h2>

          {asisto.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-primary/25 bg-white/40 px-6 py-10 text-center">
              <p className="text-[15px] text-muted-foreground">
                Todavía no confirmaste asistencia a ningún evento. Cuando
                respondas una invitación con tu email, va a aparecer acá.
              </p>
            </div>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {asisto.map(({ evento }) => (
                <li
                  key={evento.id}
                  className="rounded-3xl border border-primary/10 bg-white/55 p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl font-semibold italic text-foreground">
                        {evento.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Anfitrión: {evento.creador.nombre}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays
                          className="size-3.5 shrink-0"
                          aria-hidden
                        />
                        {formatFechaEvento(evento.fechaInicio)} ·{" "}
                        {formatHoraEvento(evento.fechaInicio)} h
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        {evento.lugar}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      Confirmado
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/e/${evento.slug}`}
                      className={buttonClasses({
                        variant: "glass",
                        className: btnChico,
                      })}
                    >
                      Ver invitación
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
