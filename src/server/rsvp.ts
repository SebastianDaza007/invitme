"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/lib/db";
import type { RespuestaRsvp } from "@/src/types/invite";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RSVP público: el invitado no necesita cuenta. Upsert por (evento, email)
// para que cambiar de respuesta actualice en vez de duplicar.
export async function confirmarAsistencia(input: {
  slug: string;
  nombre: string;
  email: string;
  respuesta: RespuestaRsvp;
}): Promise<{ ok: boolean; error?: string }> {
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();

  if (
    nombre.length < 2 ||
    !EMAIL_RE.test(email) ||
    (input.respuesta !== "CONFIRMADO" && input.respuesta !== "RECHAZADO")
  ) {
    return { ok: false, error: "Revisá los datos del formulario." };
  }

  const evento = await db.evento.findUnique({ where: { slug: input.slug } });
  if (!evento) return { ok: false, error: "El evento no existe." };

  const persona = await db.persona.upsert({
    where: { email },
    create: { nombre, email },
    update: { nombre },
  });

  await db.invitacion.upsert({
    where: {
      eventoId_personaId: { eventoId: evento.id, personaId: persona.id },
    },
    create: { eventoId: evento.id, personaId: persona.id, estado: input.respuesta },
    update: { estado: input.respuesta },
  });

  revalidatePath(`/e/${input.slug}`);
  return { ok: true };
}
