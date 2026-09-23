import type { EventoInvitacion } from "@/src/types/invite";

// Mock de fase 1: simula el Evento que vendrá de Prisma.
// La fecha se calcula relativa a "ahora" para que la cuenta regresiva siempre tenga datos.
const ahora = Date.now();
const EN_21_DIAS = ahora + 21 * 24 * 60 * 60 * 1000;

export const mockEvento: EventoInvitacion = {
  titulo: "Cumpleaños de Valentina",
  descripcion:
    "Una noche para celebrar entre amigos: buena música, tragos y muchas risas en la terraza. Trae tus mejores ganas de festejar.",
  lugar: "Rooftop Costanera, Av. del Libertador 4600, Buenos Aires",
  fechaInicio: new Date(EN_21_DIAS + 21 * 60 * 60 * 1000), // ~21:00
  fechaFin: new Date(EN_21_DIAS + 26 * 60 * 60 * 1000),
  anfitrion: "Valentina Ruiz",
};
