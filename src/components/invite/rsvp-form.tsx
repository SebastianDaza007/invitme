"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  CircleCheck,
  HeartCrack,
  LoaderCircle,
  X,
} from "lucide-react";
import type { RespuestaRsvp } from "@/src/types/invite";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

type Campo = "nombre" | "email";
type Errores = Partial<Record<Campo, string>>;
type EstadoForm = "idle" | "enviando" | "enviado";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarNombre(valor: string) {
  return valor.trim().length >= 2 ? undefined : "Escribe tu nombre";
}

function validarEmail(valor: string) {
  return EMAIL_RE.test(valor.trim()) ? undefined : "Ingresa un email válido";
}

export function RsvpForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [respuesta, setRespuesta] = useState<RespuestaRsvp | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [errorRespuesta, setErrorRespuesta] = useState(false);
  const [estado, setEstado] = useState<EstadoForm>("idle");
  const resumenRef = useRef<HTMLDivElement>(null);

  function validarCampo(campo: Campo, valor: string) {
    const error =
      campo === "nombre" ? validarNombre(valor) : validarEmail(valor);
    setErrores((prev) => ({ ...prev, [campo]: error }));
    return error;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;

    const nuevos: Errores = {
      nombre: validarNombre(nombre),
      email: validarEmail(email),
    };
    setErrores(nuevos);
    setErrorRespuesta(respuesta === null);

    if (nuevos.nombre || nuevos.email || respuesta === null) {
      // Mueve el foco al resumen de errores (patrón GOV.UK / UX accesible).
      requestAnimationFrame(() => resumenRef.current?.focus());
      return;
    }

    // Fase 1: envío simulado — aquí irá el POST a la API / Server Action.
    setEstado("enviando");
    await new Promise((r) => setTimeout(r, 900));
    setEstado("enviado");
  }

  function reiniciar() {
    setNombre("");
    setEmail("");
    setRespuesta(null);
    setErrores({});
    setErrorRespuesta(false);
    setEstado("idle");
  }

  if (estado === "enviado") {
    const confirmado = respuesta === "CONFIRMADO";
    return (
      <section
        id="rsvp"
        aria-live="polite"
        className="scroll-mt-20 border-t border-primary/10 bg-white/45"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {confirmado ? (
              <CircleCheck className="size-7" aria-hidden />
            ) : (
              <HeartCrack className="size-7" aria-hidden />
            )}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold italic text-foreground sm:text-4xl">
            {confirmado ? "¡Nos vemos ahí!" : "Te vamos a extrañar"}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {confirmado
              ? `${nombre.trim()}, tu asistencia quedó confirmada. Recibirás los detalles en ${email.trim()}.`
              : `${nombre.trim()}, registramos que no podrás asistir. ¡Gracias por avisar!`}
          </p>
          <Button variant="ghost" className="mt-6" onClick={reiniciar}>
            Cambiar respuesta
          </Button>
        </div>
      </section>
    );
  }

  const hayErrores =
    !!errores.nombre || !!errores.email || errorRespuesta;

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-titulo"
      className="scroll-mt-20 border-t border-primary/10 bg-white/45"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            RSVP
          </p>
          <h2
            id="rsvp-titulo"
            className="mt-2 font-display text-3xl font-semibold italic leading-tight text-foreground sm:text-5xl"
          >
            ¿Vienes?
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Confirma tu asistencia, toma menos de un minuto. Tu respuesta ayuda
            a organizar mejor la celebración.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 lg:pt-2"
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
                {errores.nombre && <li>{errores.nombre}</li>}
                {errores.email && <li>{errores.email}</li>}
                {errorRespuesta && <li>Elige si asistirás o no</li>}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="rsvp-nombre"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Nombre
              </label>
              <Input
                id="rsvp-nombre"
                name="nombre"
                autoComplete="name"
                placeholder="Tu nombre y apellido"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={(e) => validarCampo("nombre", e.target.value)}
                aria-invalid={!!errores.nombre}
                aria-describedby={
                  errores.nombre ? "rsvp-nombre-error" : undefined
                }
              />
              {errores.nombre && (
                <p
                  id="rsvp-nombre-error"
                  className="mt-1.5 text-sm text-destructive"
                >
                  {errores.nombre}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="rsvp-email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="rsvp-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => validarCampo("email", e.target.value)}
                aria-invalid={!!errores.email}
                aria-describedby={
                  errores.email ? "rsvp-email-error" : undefined
                }
              />
              {errores.email && (
                <p
                  id="rsvp-email-error"
                  className="mt-1.5 text-sm text-destructive"
                >
                  {errores.email}
                </p>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-foreground">
              ¿Asistirás?
            </legend>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                aria-pressed={respuesta === "CONFIRMADO"}
                onClick={() => {
                  setRespuesta("CONFIRMADO");
                  setErrorRespuesta(false);
                }}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border text-[15px] font-semibold",
                  "transition-all duration-200 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  respuesta === "CONFIRMADO"
                    ? "border-primary bg-primary text-on-primary shadow-[0_8px_20px_-8px_rgb(227_108_20/0.5)]"
                    : "border-border bg-white/60 text-foreground hover:bg-white/85",
                )}
              >
                <Check className="size-4" aria-hidden />
                Asistiré
              </button>
              <button
                type="button"
                aria-pressed={respuesta === "RECHAZADO"}
                onClick={() => {
                  setRespuesta("RECHAZADO");
                  setErrorRespuesta(false);
                }}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border text-[15px] font-semibold",
                  "transition-all duration-200 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  respuesta === "RECHAZADO"
                    ? "border-foreground/70 bg-foreground/90 text-background"
                    : "border-border bg-white/60 text-foreground hover:bg-white/85",
                )}
              >
                <X className="size-4" aria-hidden />
                No puedo ir
              </button>
            </div>
          </fieldset>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={estado === "enviando"}
            className="mt-1 w-full sm:w-auto sm:self-start"
          >
            {estado === "enviando" ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              "Confirmar RSVP"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
