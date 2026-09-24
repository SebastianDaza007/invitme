"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  X,
} from "lucide-react";
import type { Sesion } from "@/src/lib/sesion";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Logo } from "@/src/components/common/logo";

export type Vista = "login" | "registro";
type Campo = "nombre" | "email" | "contrasena";
type Errores = Partial<Record<Campo, string>>;
type EstadoForm = "idle" | "enviando";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarNombre(valor: string) {
  return valor.trim().length >= 2 ? undefined : "Escribe tu nombre";
}

function validarEmail(valor: string) {
  return EMAIL_RE.test(valor.trim()) ? undefined : "Ingresa un email válido";
}

function validarContrasena(valor: string) {
  return valor.length >= 6
    ? undefined
    : "La contraseña debe tener al menos 6 caracteres";
}

export function AuthModal({
  vistaInicial,
  onClose,
  onAuthOk,
  textoLogin = "Accede para gestionar tus eventos.",
  textoRegistro = "Necesitas una cuenta para publicar tus propias invitaciones.",
}: {
  vistaInicial: Vista;
  onClose: () => void;
  onAuthOk: (sesion: Sesion) => void;
  textoLogin?: string;
  textoRegistro?: string;
}) {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<EstadoForm>("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const resumenRef = useRef<HTMLDivElement>(null);

  // Foco inicial + Escape para cerrar + bloqueo del scroll del body.
  useEffect(() => {
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function validarCampo(campo: Campo, valor: string) {
    const error =
      campo === "nombre"
        ? validarNombre(valor)
        : campo === "email"
          ? validarEmail(valor)
          : validarContrasena(valor);
    setErrores((prev) => ({ ...prev, [campo]: error }));
    return error;
  }

  function cambiarVista(nueva: Vista) {
    setVista(nueva);
    setErrores({});
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;

    const nuevos: Errores = {
      email: validarEmail(email),
      contrasena: validarContrasena(contrasena),
    };
    if (vista === "registro") nuevos.nombre = validarNombre(nombre);
    setErrores(nuevos);

    if (nuevos.nombre || nuevos.email || nuevos.contrasena) {
      requestAnimationFrame(() => resumenRef.current?.focus());
      return;
    }

    // Fase 1: auth simulado — aquí irá el POST a la API / Server Action real.
    setEstado("enviando");
    await new Promise((r) => setTimeout(r, 900));
    onAuthOk({
      nombre:
        vista === "registro" ? nombre.trim() : email.trim().split("@")[0],
      email: email.trim(),
    });
  }

  const hayErrores =
    !!errores.nombre || !!errores.email || !!errores.contrasena;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-foreground/25 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-titulo"
        tabIndex={-1}
        className="relative mt-[7vh] mb-8 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_32px_80px_-24px_rgb(120_60_10/0.5)] backdrop-blur-2xl outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-4" aria-hidden />
        </button>

        <Logo height={22} />
        <h2
          id="auth-titulo"
          className="mt-2 font-display text-3xl font-semibold italic leading-tight text-foreground"
        >
          {vista === "login" ? "Hola de nuevo" : "Crea tu cuenta"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {vista === "login" ? textoLogin : textoRegistro}
        </p>

        <div
          role="tablist"
          aria-label="Tipo de acceso"
          className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
        >
          {(
            [
              { id: "login", label: "Iniciar sesión" },
              { id: "registro", label: "Registrarse" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={vista === tab.id}
              onClick={() => cambiarVista(tab.id)}
              className={cn(
                "h-9 cursor-pointer rounded-full text-sm font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                vista === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
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
                {errores.contrasena && <li>{errores.contrasena}</li>}
              </ul>
            </div>
          )}

          {vista === "registro" && (
            <div>
              <label
                htmlFor="auth-nombre"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Nombre
              </label>
              <Input
                id="auth-nombre"
                name="nombre"
                autoComplete="name"
                placeholder="Tu nombre y apellido"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={(e) => validarCampo("nombre", e.target.value)}
                aria-invalid={!!errores.nombre}
                aria-describedby={
                  errores.nombre ? "auth-nombre-error" : undefined
                }
              />
              {errores.nombre && (
                <p id="auth-nombre-error" className="mt-1.5 text-sm text-destructive">
                  {errores.nombre}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validarCampo("email", e.target.value)}
              aria-invalid={!!errores.email}
              aria-describedby={errores.email ? "auth-email-error" : undefined}
            />
            {errores.email && (
              <p id="auth-email-error" className="mt-1.5 text-sm text-destructive">
                {errores.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="auth-contrasena"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <div className="relative">
              <Input
                id="auth-contrasena"
                name="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                autoComplete={
                  vista === "login" ? "current-password" : "new-password"
                }
                placeholder="Mínimo 6 caracteres"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                onBlur={(e) => validarCampo("contrasena", e.target.value)}
                aria-invalid={!!errores.contrasena}
                aria-describedby={
                  errores.contrasena ? "auth-contrasena-error" : undefined
                }
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena((v) => !v)}
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {mostrarContrasena ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            {errores.contrasena && (
              <p
                id="auth-contrasena-error"
                className="mt-1.5 text-sm text-destructive"
              >
                {errores.contrasena}
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
                {vista === "login" ? "Entrando…" : "Creando cuenta…"}
              </>
            ) : vista === "login" ? (
              "Entrar"
            ) : (
              "Crear cuenta"
            )}
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Solo los anfitriones necesitan cuenta — tus invitados confirman sin
            registrarse.
          </p>
        </form>
      </div>
    </div>
  );
}
