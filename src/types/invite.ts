// Tipos del dominio de invitaciones, alineados con prisma/schema.prisma.
// Cuando se conecte el backend, estos tipos se reemplazan/derivan de los modelos.

export type Rol = "ANFITRION" | "INVITADO";

export type EstadoAsistencia = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";

/** View-model que consume la UI de la invitación pública. */
export interface EventoInvitacion {
  titulo: string;
  descripcion?: string;
  lugar: string;
  fechaInicio: Date;
  fechaFin?: Date;
  /** Nombre visible del creador del evento (Persona.nombre). */
  anfitrion: string;
}

/** Respuesta que el invitado elige en el RSVP (PENDIENTE no es una respuesta válida). */
export type RespuestaRsvp = Exclude<EstadoAsistencia, "PENDIENTE">;

export interface RsvpPayload {
  nombre: string;
  email: string;
  respuesta: RespuestaRsvp;
}
