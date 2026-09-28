"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  LoaderCircle,
} from "lucide-react";
import { actualizarEvento } from "@/src/server/eventos";
import { FONDO_DEFAULT } from "@/src/lib/fondos";
import { cn } from "@/src/lib/utils";
import { SelectorFondo } from "@/src/components/common/selector-fondo";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface DatosEvento {
  slug: string;
  titulo: string;
  anfitrion: string;
  fechaInicioISO: string;
  lugar: string;
  descripcion: string;
  fondo: string | null;
}

type Campo = "titulo" | "anfitrion" | "fechaHora" | "lugar";
type Errores = Partial<Record<Campo, string>>;
type EstadoForm = "idle" | "guardando" | "guardado";

// datetime-local espera "YYYY-MM-DDTHH:mm" en la hora local del navegador;
// convertir acá (no en el server) evita correr la hora por diferencia de zona.
function aInputLocal(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function EditarEvento({ evento }: { evento: DatosEvento }) {
  const [titulo, setTitulo] = useState(evento.titulo);
  const [anfitrion, setAnfitrion] = useState(evento.anfitrion);
  const [fechaHora, setFechaHora] = useState(() =>
    aInputLocal(evento.fechaInicioISO),
  );
  const [lugar, setLugar] = useState(evento.lugar);
  const [descripcion, setDescripcion] = useState(evento.descripcion);
  const [fondo, setFondo] = useState(evento.fondo ?? FONDO_DEFAULT);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoForm>("idle");
  const resumenRef = useRef<HTMLDivElement>(null);

  // Al tocar un campo después de guardar, el estado vuelve a "idle" y el
  // botón recupera su texto normal.
  function editar(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      if (estado === "guardado") setEstado("idle");
    };
  }

  function validar(): Errores {
    const e: Errores = {};
    if (titulo.trim().length < 3) {
      e.titulo = "Ponle un título a tu evento";
    }
    if (anfitrion.trim().length < 2) {
      e.anfitrion = "Escribe tu nombre";
    }
    const fecha = fechaHora ? new Date(fechaHora) : null;
    if (!fecha || Number.isNaN(fecha.getTime())) {
      e.fechaHora = "Elegí fecha y hora";
    } else if (fecha.getTime() <= Date.now()) {
      e.fechaHora = "La fecha debe ser futura";
    }
    if (lugar.trim().length < 3) {
      e.lugar = "¿Dónde es el evento?";
    }
    return e;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "guardando") return;

    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      requestAnimationFrame(() => resumenRef.current?.focus());
      return;
    }

    setEstado("guardando");
    setErrorGeneral(null);
    const res = await actualizarEvento({
      slug: evento.slug,
      titulo,
      anfitrion,
      fechaHora,
      lugar,
      descripcion,
      fondo,
    });
    if (!res.ok) {
      setErrorGeneral(res.error);
      setEstado("idle");
      return;
    }
    // El action revalida la página: el encabezado ya muestra los datos nuevos.
    setEstado("guardado");
  }

  const hayErrores = Object.keys(errores).length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 border-t border-primary/10 px-5 py-5 sm:px-6"
    >
      {errorGeneral && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive"
        >
          {errorGeneral}
        </div>
      )}
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
          htmlFor="editar-titulo"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Nombre del evento
        </label>
        <Input
          id="editar-titulo"
          name="titulo"
          value={titulo}
          onChange={(e) => editar(setTitulo)(e.target.value)}
          aria-invalid={!!errores.titulo}
          aria-describedby={errores.titulo ? "editar-titulo-error" : undefined}
        />
        {errores.titulo && (
          <p id="editar-titulo-error" className="mt-1.5 text-sm text-destructive">
            {errores.titulo}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="editar-anfitrion"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Tu nombre
          </label>
          <Input
            id="editar-anfitrion"
            name="anfitrion"
            autoComplete="name"
            value={anfitrion}
            onChange={(e) => editar(setAnfitrion)(e.target.value)}
            aria-invalid={!!errores.anfitrion}
            aria-describedby={
              errores.anfitrion ? "editar-anfitrion-error" : undefined
            }
          />
          {errores.anfitrion && (
            <p
              id="editar-anfitrion-error"
              className="mt-1.5 text-sm text-destructive"
            >
              {errores.anfitrion}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="editar-fecha"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Fecha y hora
          </label>
          <Input
            id="editar-fecha"
            name="fechaHora"
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => editar(setFechaHora)(e.target.value)}
            aria-invalid={!!errores.fechaHora}
            aria-describedby={
              errores.fechaHora ? "editar-fecha-error" : undefined
            }
          />
          {errores.fechaHora && (
            <p
              id="editar-fecha-error"
              className="mt-1.5 text-sm text-destructive"
            >
              {errores.fechaHora}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="editar-lugar"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Lugar
        </label>
        <Input
          id="editar-lugar"
          name="lugar"
          value={lugar}
          onChange={(e) => editar(setLugar)(e.target.value)}
          aria-invalid={!!errores.lugar}
          aria-describedby={errores.lugar ? "editar-lugar-error" : undefined}
        />
        {errores.lugar && (
          <p id="editar-lugar-error" className="mt-1.5 text-sm text-destructive">
            {errores.lugar}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="editar-descripcion"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Descripción{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="editar-descripcion"
          name="descripcion"
          rows={3}
          value={descripcion}
          onChange={(e) => editar(setDescripcion)(e.target.value)}
          className={cn(
            "w-full resize-none rounded-2xl border border-border bg-white/70 px-4 py-3 text-[15px] text-foreground",
            "placeholder:text-muted-foreground/70",
            "transition-shadow duration-200",
            "focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          )}
        />
      </div>

      <SelectorFondo
        value={fondo}
        onChange={(f) => {
          setFondo(f);
          if (estado === "guardado") setEstado("idle");
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="accent"
          disabled={estado === "guardando"}
          className="h-11 px-6 text-[15px]"
        >
          {estado === "guardando" ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Guardando…
            </>
          ) : estado === "guardado" ? (
            <>
              <Check className="size-4" aria-hidden />
              Guardado
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
        {estado === "guardado" && (
          <p role="status" className="text-sm font-medium text-primary">
            Ya está visible en la invitación.
          </p>
        )}
      </div>
    </form>
  );
}
