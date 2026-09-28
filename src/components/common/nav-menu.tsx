"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  House,
  Menu,
  Sparkles,
  TicketCheck,
} from "lucide-react";
import { useSesion } from "@/src/lib/sesion";

const itemClases =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-primary/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

// Navegación principal: hamburguesa junto al logo. Las entradas de
// "Mis eventos" solo aparecen con sesión (la página redirige a "/").
export function NavMenu() {
  const sesion = useSesion();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer click fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const dentroMenu = menuRef.current?.contains(e.target as Node);
      const dentroTrigger = triggerRef.current?.contains(e.target as Node);
      if (!dentroMenu && !dentroTrigger) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú de navegación"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/60 text-foreground backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/85 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Menu className="size-4" aria-hidden />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_24px_60px_-20px_rgb(120_60_10/0.4)] backdrop-blur-xl"
        >
          <Link
            href="/"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClases}
          >
            <House className="size-4 text-primary" aria-hidden />
            Inicio
          </Link>
          <Link
            href="/crear"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClases}
          >
            <Sparkles className="size-4 text-primary" aria-hidden />
            Crear evento
          </Link>
          {sesion && (
            <>
              <div className="mx-2 my-1 h-px bg-border/80" aria-hidden />
              <Link
                href="/mis-eventos#creados"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={itemClases}
              >
                <CalendarDays className="size-4 text-primary" aria-hidden />
                Mis eventos creados
              </Link>
              <Link
                href="/mis-eventos#asisto"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={itemClases}
              >
                <TicketCheck className="size-4 text-primary" aria-hidden />
                Eventos a los que asisto
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
