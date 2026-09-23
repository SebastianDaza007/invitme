import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fechaFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const horaFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "numeric",
  minute: "2-digit",
});

/** "sábado, 14 de junio de 2026" → "Sábado, 14 de junio de 2026" */
export function formatFechaEvento(fecha: Date) {
  const texto = fechaFormatter.format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatHoraEvento(fecha: Date) {
  return horaFormatter.format(fecha);
}

export function urlMapa(lugar: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
}
