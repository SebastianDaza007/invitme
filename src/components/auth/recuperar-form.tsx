"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import { Button, buttonClasses } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

type EstadoForm = "idle" | "enviando" | "ok";

function traducirError(mensaje: string) {
  const m = mensaje.toLowerCase();
  if (m.includes("password")) return "La contraseña es demasiado débil.";
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Demasiados intentos. Esperá un momento y probá de nuevo.";
  }
  if (m.includes("session") || m.includes("auth")) {
    return "Tu sesión expiró. Pedí un link nuevo desde el login.";
  }
  return "Algo salió mal. Intentá de nuevo.";
}

export function RecuperarForm({ activo }: { activo: boolean }) {
  const [contrasena, setContrasena] = useState("");
  const [repetir, setRepetir] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoForm>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;

    if (contrasena.length < 6) {
      setErrorCampo("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (contrasena !== repetir) {
      setErrorCampo("Las contraseñas no coinciden");
      return;
    }
    setErrorCampo(null);

    setEstado("enviando");
    setErrorGeneral(null);
    const { error } = await supabaseBrowser().auth.updateUser({
      password: contrasena,
    });
    if (error) {
      setErrorGeneral(traducirError(error.message));
      setEstado("idle");
      return;
    }
    setEstado("ok");
  }

  if (!activo) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold italic text-foreground sm:text-4xl">
          Este link no sirve más
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Es inválido, expiró o ya fue usado. Pedí uno nuevo desde Iniciar
          sesión → ¿Olvidaste tu contraseña?
        </p>
        <Link
          href="/"
          className={buttonClasses({ variant: "primary", className: "mt-7" })}
        >
          Volver al inicio
        </Link>
      </section>
    );
  }

  if (estado === "ok") {
    return (
      <section
        aria-live="polite"
        className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold italic text-foreground sm:text-4xl">
          Contraseña actualizada
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Ya quedaste con sesión iniciada — podés seguir usando tu cuenta con
          la contraseña nueva.
        </p>
        <Link
          href="/mis-eventos"
          className={buttonClasses({ variant: "primary", className: "mt-7" })}
        >
          Ir a mis eventos
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-display text-3xl font-semibold italic text-foreground sm:text-4xl">
        Nueva contraseña
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Elegí una contraseña nueva para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
        {errorGeneral && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive"
          >
            {errorGeneral}
          </div>
        )}

        <div>
          <label
            htmlFor="nueva-contrasena"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Nueva contraseña
          </label>
          <div className="relative">
            <Input
              id="nueva-contrasena"
              name="contrasena"
              type={mostrar ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              aria-invalid={!!errorCampo}
              aria-describedby={errorCampo ? "contrasena-error" : undefined}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              aria-label={mostrar ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {mostrar ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="repetir-contrasena"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Repetí la contraseña
          </label>
          <Input
            id="repetir-contrasena"
            name="repetir"
            type={mostrar ? "text" : "password"}
            autoComplete="new-password"
            placeholder="La misma de arriba"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
            aria-invalid={!!errorCampo}
            aria-describedby={errorCampo ? "contrasena-error" : undefined}
          />
          {errorCampo && (
            <p id="contrasena-error" className="mt-1.5 text-sm text-destructive">
              {errorCampo}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={estado === "enviando"}
          className="mt-1 w-full"
        >
          {estado === "enviando" ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Guardando…
            </>
          ) : (
            "Guardar contraseña"
          )}
        </Button>
      </form>
    </section>
  );
}
