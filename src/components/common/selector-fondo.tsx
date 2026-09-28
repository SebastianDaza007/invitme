"use client";

import { Check } from "lucide-react";
import { FONDOS, urlFondo } from "@/src/lib/fondos";
import { cn } from "@/src/lib/utils";

// Thumbnails de los fondos preset. Lo usan /crear y el panel de edición.
export function SelectorFondo({
  value,
  onChange,
}: {
  value: string;
  onChange: (fondo: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-foreground">
        Fondo de la invitación
      </legend>
      <div className="grid grid-cols-3 gap-2.5">
        {FONDOS.map((f) => {
          const activo = value === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={activo}
              onClick={() => onChange(f.id)}
              className={cn(
                "group relative h-16 cursor-pointer overflow-hidden rounded-2xl border-2 sm:h-20",
                "transition-all duration-200 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                activo
                  ? "border-primary shadow-[0_8px_20px_-8px_rgb(227_108_20/0.5)]"
                  : "border-transparent hover:border-primary/40",
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${urlFondo(f.id)})` }}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-5 text-left text-[11px] font-semibold text-white">
                {f.label}
              </span>
              {activo && (
                <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                  <Check className="size-3" aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
