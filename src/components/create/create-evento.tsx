"use client";

import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock,
  Copy,
  LoaderCircle,
  MapPin,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { AuthModal, type Vista } from "@/src/components/auth/auth-modal";
import { Button, buttonClasses } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  guardarSesion,
  useSesion,
  type Sesion,
} from "@/src/lib/sesion";
import {
  cn,
  formatFechaEvento,
  formatHoraEvento,
} from "@/src/lib/utils";

interface BorradorEvento {
  titulo: string;
  anfitrion: string;
  fechaHora: string;
  lugar: string;
  descripcion: string;
}

type Campo = "titulo" | "anfitrion" | "fechaHora" | "lugar";
type Errores = Partial<Record<Campo, string>>;
type EstadoForm = "idle" | "publicando" | "publicado";

const BORRADOR_KEY = "invitme:borrador-evento";
const BORRADOR_EVENT = "invitme:borrador-cambio";

const BORRADOR_VACIO: BorradorEvento = {
  titulo: "",
  anfitrion: "",
  fechaHora: "",
  lugar: "",
  descripcion: "",
};

// Fecha fija para el preview cuando el usuario aún no eligió una
// (determinística: evita diferencias entre SSR y cliente).
const FECHA_PLACEHOLDER = new Date(2026, 11, 31, 21, 0);

// Borrador como external store: cada cambio persiste en localStorage,
// así el formulario sobrevive refresh, navegación y el login.
function subscribeBorrador(callback: () => void) {
  window.addEventListener(BORRADOR_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(BORRADOR_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getBorradorCrudo() {
  return localStorage.getItem(BORRADOR_KEY);
}

function getBorradorServidor() {
  return null;
}

function guardarBorrador(borrador: BorradorEvento | null) {
  try {
    if (borrador) {
      localStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador));
    } else {
      localStorage.removeItem(BORRADOR_KEY);
    }
  } catch {
    // Storage no disponible: el borrador solo vive en memoria.
  }
  window.dispatchEvent(new Event(BORRADOR_EVENT));
}

function slugify(texto: string) {
  return (
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "mi-evento"
  );
}

export function CreateEvento() {
  const crudo = useSyncExternalStore(
    subscribeBorrador,
    getBorradorCrudo,
    getBorradorServidor,
  );
  const borrador = useMemo<BorradorEvento>(() => {
    if (!crudo) return BORRADOR_VACIO;
    try {
      return { ...BORRADOR_VACIO, ...(JSON.parse(crudo) as Partial<BorradorEvento>) };
    } catch {
      return BORRADOR_VACIO;
    }
  }, [crudo]);

  const sesion = useSesion();
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<EstadoForm>("idle");
  const [modalOpen, setModalOpen] = useState(false);
  const [vistaModal, setVistaModal] = useState<Vista>("registro");
  const [linkPublicado, setLinkPublicado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const resumenRef = useRef<HTMLDivElement>(null);

  function setCampo(campo: keyof BorradorEvento, valor: string) {
    guardarBorrador({ ...borrador, [campo]: valor });
  }

  function validar(): Errores {
    const e: Errores = {};
    if (borrador.titulo.trim().length < 3) {
      e.titulo = "Ponle un título a tu evento";
    }
    if (borrador.anfitrion.trim().length < 2) {
      e.anfitrion = "Escribe tu nombre";
    }
    const fecha = borrador.fechaHora ? new Date(borrador.fechaHora) : null;
    if (!fecha || Number.isNaN(fecha.getTime())) {
      e.fechaHora = "Elegí fecha y hora";
    } else if (fecha.getTime() <= Date.now()) {
      e.fechaHora = "La fecha debe ser futura";
    }
    if (borrador.lugar.trim().length < 3) {
      e.lugar = "¿Dónde es el evento?";
    }
    return e;
  }

  async function finalizarPublicacion() {
    // Fase 1: publicación simulada — aquí irá el create del Evento en Prisma.
    setLinkPublicado(`invitme.app/e/${slugify(borrador.titulo)}`);
    setEstado("publicando");
    await new Promise((r) => setTimeout(r, 900));
    guardarBorrador(null);
    setEstado("publicado");
  }

  async function publicar() {
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      requestAnimationFrame(() => resumenRef.current?.focus());
      return;
    }
    // Flujo honesto: sin sesión se pide cuenta recién acá, con el borrador ya a salvo.
    if (!sesion) {
      setVistaModal("registro");
      setModalOpen(true);
      return;
    }
    await finalizarPublicacion();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "publicando") return;
    void publicar();
  }

  function onAuthOk(nueva: Sesion) {
    guardarSesion(nueva);
    setModalOpen(false);
    void finalizarPublicacion();
  }

  function reiniciar() {
    setEstado("idle");
    setLinkPublicado(null);
    setCopiado(false);
    setErrores({});
  }

  async function copiarLink() {
    if (!linkPublicado) return;
    try {
      await navigator.clipboard.writeText(`https://${linkPublicado}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard no disponible: el link queda visible para copiar a mano.
    }
  }

  if (estado === "publicado" && linkPublicado) {
    return (
      <section
        aria-live="polite"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold italic text-foreground sm:text-5xl">
          ¡Tu invitación está lista!
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Compartí este link con tus invitados. Ellos confirman con nombre y
          email, sin necesidad de registrarse.
        </p>

        <div className="mt-7 flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-white/70 py-2 pl-4 pr-2">
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground/90">
            {linkPublicado}
          </span>
          <button
            type="button"
            onClick={copiarLink}
            className={cn(
              buttonClasses({ variant: "glass" }),
              "h-9 shrink-0 gap-1.5 border-border bg-white/70 px-3.5 text-sm",
            )}
          >
            {copiado ? (
              <>
                <Check className="size-4 text-primary" aria-hidden />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden />
                Copiar
              </>
            )}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={buttonClasses({ variant: "primary", size: "lg" })}
          >
            Ver invitación
          </Link>
          <Button variant="ghost" onClick={reiniciar}>
            Crear otro evento
          </Button>
        </div>
      </section>
    );
  }

  const hayErrores = Object.keys(errores).length > 0;

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Crea el tuyo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight text-foreground sm:text-5xl">
            Tu invitación, en minutos
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Completa los datos básicos y mira cómo queda al instante en la vista
            previa.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 flex flex-col gap-4"
          >
            {hayErrores && (
              <div
                ref={resumenRef}
                role="alert"
                tabIndex={-1}
                className="rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm outline-none"
              >
                <p className="font-semibold text-destructive">
                  Revisa el formulario
                </p>
                <ul className="mt-1 list-inside list-disc text-destructive/90">
                  {errores.titulo && <li>{errores.titulo}</li>}
                  {errores.anfitrion && <li>{errores.anfitrion}</li>}
                  {errores.fechaHora && <li>{errores.fechaHora}</li>}
                  {errores.lugar && <li>{errores.lugar}</li>}
                </ul>
              </div>
            )}

            <div>
              <label
                htmlFor="crear-titulo"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Nombre del evento
              </label>
              <Input
                id="crear-titulo"
                name="titulo"
                placeholder="Cumpleaños de Valentina"
                value={borrador.titulo}
                onChange={(e) => setCampo("titulo", e.target.value)}
                aria-invalid={!!errores.titulo}
                aria-describedby={
                  errores.titulo ? "crear-titulo-error" : undefined
                }
              />
              {errores.titulo && (
                <p id="crear-titulo-error" className="mt-1.5 text-sm text-destructive">
                  {errores.titulo}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="crear-anfitrion"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Tu nombre
                </label>
                <Input
                  id="crear-anfitrion"
                  name="anfitrion"
                  autoComplete="name"
                  placeholder="Valentina Ruiz"
                  value={borrador.anfitrion}
                  onChange={(e) => setCampo("anfitrion", e.target.value)}
                  aria-invalid={!!errores.anfitrion}
                  aria-describedby={
                    errores.anfitrion ? "crear-anfitrion-error" : undefined
                  }
                />
                {errores.anfitrion && (
                  <p
                    id="crear-anfitrion-error"
                    className="mt-1.5 text-sm text-destructive"
                  >
                    {errores.anfitrion}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="crear-fecha"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Fecha y hora
                </label>
                <Input
                  id="crear-fecha"
                  name="fechaHora"
                  type="datetime-local"
                  value={borrador.fechaHora}
                  onChange={(e) => setCampo("fechaHora", e.target.value)}
                  aria-invalid={!!errores.fechaHora}
                  aria-describedby={
                    errores.fechaHora ? "crear-fecha-error" : undefined
                  }
                />
                {errores.fechaHora && (
                  <p id="crear-fecha-error" className="mt-1.5 text-sm text-destructive">
                    {errores.fechaHora}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="crear-lugar"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Lugar
              </label>
              <Input
                id="crear-lugar"
                name="lugar"
                placeholder="Rooftop Costanera, Av. del Libertador 4600"
                value={borrador.lugar}
                onChange={(e) => setCampo("lugar", e.target.value)}
                aria-invalid={!!errores.lugar}
                aria-describedby={
                  errores.lugar ? "crear-lugar-error" : undefined
                }
              />
              {errores.lugar && (
                <p id="crear-lugar-error" className="mt-1.5 text-sm text-destructive">
                  {errores.lugar}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="crear-descripcion"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Descripción{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>
              <textarea
                id="crear-descripcion"
                name="descripcion"
                rows={4}
                placeholder="Una noche para celebrar entre amigos: buena música, tragos y muchas risas…"
                value={borrador.descripcion}
                onChange={(e) => setCampo("descripcion", e.target.value)}
                className={cn(
                  "w-full resize-none rounded-2xl border border-border bg-white/70 px-4 py-3 text-[15px] text-foreground",
                  "placeholder:text-muted-foreground/70",
                  "transition-shadow duration-200",
                  "focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                )}
              />
            </div>

            <div className="mt-1">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={estado === "publicando"}
                className="w-full sm:w-auto"
              >
                {estado === "publicando" ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Publicando…
                  </>
                ) : (
                  "Publicar evento"
                )}
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Necesitarás una cuenta gratuita para publicar.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setVistaModal("login");
                    setModalOpen(true);
                  }}
                  className="cursor-pointer font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Ya tengo cuenta
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            Vista previa en vivo
          </p>
          <PreviewInvitacion borrador={borrador} />
        </div>
      </section>

      {modalOpen &&
        createPortal(
          <AuthModal
            vistaInicial={vistaModal}
            onClose={() => setModalOpen(false)}
            onAuthOk={onAuthOk}
            textoLogin="Entrá y tu evento se publica al instante."
            textoRegistro="Creá tu cuenta gratis — tu evento se publica enseguida."
          />,
          document.body,
        )}
    </>
  );
}

function PreviewInvitacion({ borrador }: { borrador: BorradorEvento }) {
  const fecha = useMemo(() => {
    const d = borrador.fechaHora ? new Date(borrador.fechaHora) : null;
    return d && !Number.isNaN(d.getTime()) ? d : FECHA_PLACEHOLDER;
  }, [borrador.fechaHora]);

  const dia = fecha.getDate();
  const mes = fecha.toLocaleDateString("es-ES", { month: "long" });
  const anio = fecha.getFullYear();
  const titulo = borrador.titulo.trim() || "Tu evento";
  const anfitrion = borrador.anfitrion.trim() || "Tu nombre";
  const lugar = borrador.lugar.trim() || "El lugar de tu evento";
  const descripcion = borrador.descripcion.trim();

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_24px_60px_-24px_rgb(120_60_10/0.35)] backdrop-blur-xl">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-warm-start via-warm-mid to-warm-end sm:h-52">
        <div
          aria-hidden
          className="animate-float-slow absolute -left-10 top-6 size-36 rounded-full bg-white/25 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -right-8 bottom-2 size-40 rounded-full bg-orange-200/40 blur-3xl"
        />
        <div className="absolute left-5 top-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            <Sparkles className="size-3" aria-hidden />
            Estás invitado
          </span>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="font-display text-6xl font-semibold italic leading-none drop-shadow-sm sm:text-7xl">
            {dia}
          </span>
          <span className="mt-1.5 text-sm font-medium capitalize tracking-wide text-white/90">
            de {mes} · {anio}
          </span>
          <span className="mt-0.5 text-xs font-medium text-white/75">
            {formatHoraEvento(fecha)} h
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {anfitrion} te invita a celebrar
        </p>
        <h3 className="mt-2 font-display text-3xl font-semibold italic leading-tight text-foreground">
          {titulo}
        </h3>
        {descripcion && (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {descripcion}
          </p>
        )}

        <ul className="mt-5 flex flex-col gap-2 text-sm font-medium text-foreground/90">
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
            <span className="min-w-0 truncate">{lugar}</span>
          </li>
        </ul>

        <div aria-hidden className="mt-6 flex flex-wrap gap-2.5">
          <span className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-on-accent">
            Confirmar asistencia
          </span>
          <span className="inline-flex h-10 items-center rounded-full border border-border bg-white/50 px-5 text-sm font-semibold text-foreground">
            Cómo llegar
          </span>
        </div>
      </div>
    </div>
  );
}
