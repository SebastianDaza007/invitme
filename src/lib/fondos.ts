// Catálogo de fondos preset de la invitación. Son SVGs estáticos en
// public/fondos/ (los sirve el CDN del deploy, ~2KB c/u). Evento.fondo guarda
// el id; null/legacy cae en FONDO_DEFAULT.
export const FONDOS = [
  { id: "calido", label: "Atardecer", archivo: "calido.svg" },
  { id: "noche", label: "Noche de fiesta", archivo: "noche.svg" },
  { id: "confetti", label: "Confetti", archivo: "confetti.svg" },
  { id: "cerveza", label: "Cerveza", archivo: "cerveza.webp" },
] as const;

export type FondoId = (typeof FONDOS)[number]["id"];

export const FONDO_DEFAULT: FondoId = "calido";

const FONDOS_MAP = new Map(FONDOS.map((f) => [f.id, f]));

export function esFondoValido(fondo: string | null | undefined): boolean {
  return !!fondo && FONDOS_MAP.has(fondo as FondoId);
}

export function urlFondo(fondo: string | null | undefined): string {
  const entry = esFondoValido(fondo)
    ? FONDOS_MAP.get(fondo as FondoId)!
    : FONDOS_MAP.get(FONDO_DEFAULT)!;
  return `/fondos/${entry.archivo}`;
}
