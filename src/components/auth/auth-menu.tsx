"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LogOut,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useSesion } from "@/src/lib/sesion";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import { AuthModal } from "@/src/components/auth/auth-modal";

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AuthMenu() {
  const sesion = useSesion();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer click fuera o con Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      const dentroMenu = menuRef.current?.contains(e.target as Node);
      const dentroTrigger = triggerRef.current?.contains(e.target as Node);
      if (!dentroMenu && !dentroTrigger) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function cerrarSesion() {
    // onAuthStateChange actualiza useSesion solo — no hace falta estado local.
    await supabaseBrowser().auth.signOut();
    setMenuOpen(false);
  }

  function cerrarModal() {
    setModalOpen(false);
    triggerRef.current?.focus();
  }

  function handleTrigger() {
    if (sesion) setMenuOpen((v) => !v);
    else setModalOpen(true);
  }

  function onAuthOk() {
    setModalOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTrigger}
          aria-label={sesion ? `Cuenta de ${sesion.nombre}` : "Iniciar sesión o registrarse"}
          aria-haspopup={sesion ? "menu" : "dialog"}
          aria-expanded={sesion ? menuOpen : modalOpen}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-full",
            "transition-all duration-200 ease-out active:scale-[0.94]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            sesion
              ? "bg-primary text-[13px] font-bold text-on-primary shadow-[0_8px_20px_-8px_rgb(227_108_20/0.55)] hover:bg-[#c75e10]"
              : "border border-white/70 bg-white/60 text-foreground backdrop-blur-md hover:bg-white/85",
          )}
        >
          {sesion ? (
            <span aria-hidden>{iniciales(sesion.nombre)}</span>
          ) : (
            <UserRound className="size-4" aria-hidden />
          )}
        </button>

        {sesion && menuOpen && (
          <div
            ref={menuRef}
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_24px_60px_-20px_rgb(120_60_10/0.4)] backdrop-blur-xl"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-foreground">
                {sesion.nombre}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {sesion.email}
              </p>
            </div>
            <div className="mx-2 my-1 h-px bg-border/80" aria-hidden />
            <a
              href="/crear"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-primary/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Sparkles className="size-4 text-primary" aria-hidden />
              Crear mi evento
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={cerrarSesion}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-destructive/8 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {modalOpen &&
        createPortal(
          <AuthModal
            vistaInicial="login"
            onClose={cerrarModal}
            onAuthOk={onAuthOk}
          />,
          document.body,
        )}
    </>
  );
}
