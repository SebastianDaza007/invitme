import { useMemo, useSyncExternalStore } from "react";

export interface Sesion {
  nombre: string;
  email: string;
}

const SESION_KEY = "invitme:sesion";
const SESION_EVENT = "invitme:sesion-cambio";

// Sesión mock como external store: persiste en localStorage y se sincroniza
// entre pestañas. Cuando llegue el backend se reemplaza por la auth real.
function subscribeSesion(callback: () => void) {
  window.addEventListener(SESION_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SESION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSesionCruda() {
  return localStorage.getItem(SESION_KEY);
}

function getSesionServidor() {
  return null;
}

export function useSesion(): Sesion | null {
  const crudo = useSyncExternalStore(
    subscribeSesion,
    getSesionCruda,
    getSesionServidor,
  );
  return useMemo(() => {
    if (!crudo) return null;
    try {
      return JSON.parse(crudo) as Sesion;
    } catch {
      // Sesión mock corrupta: se ignora y arranca deslogueado.
      return null;
    }
  }, [crudo]);
}

export function guardarSesion(nueva: Sesion | null) {
  try {
    if (nueva) localStorage.setItem(SESION_KEY, JSON.stringify(nueva));
    else localStorage.removeItem(SESION_KEY);
  } catch {
    // Storage no disponible: la sesión solo vive en memoria.
  }
  window.dispatchEvent(new Event(SESION_EVENT));
}
