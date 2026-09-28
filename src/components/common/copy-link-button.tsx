"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

// Copia el link público del evento (origin actual + ruta) al portapapeles.
export function CopyLinkButton({
  ruta,
  className,
}: {
  ruta: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${ruta}`,
      );
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles no disponible (permiso denegado o contexto inseguro).
    }
  }

  return (
    <Button
      variant="glass"
      onClick={copiar}
      className={className ?? "h-9 px-3.5 text-sm"}
    >
      {copiado ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Link2 className="size-4" aria-hidden />
      )}
      {copiado ? "¡Copiado!" : "Copiar link"}
    </Button>
  );
}
