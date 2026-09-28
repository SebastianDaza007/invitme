"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/src/lib/db";
import { enviarDetallesEvento } from "@/src/lib/email";
import type { RespuestaRsvp } from "@/src/types/invite";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Anti-spam por IP, best-effort: máx N envíos de RSVP por hora en ventana
// deslizante. El Map vive en memoria del proceso — en serverless es por
// instancia (no global), pero corta el abuso obvio de inflar la lista de
// invitados con requests a lo loco. En Vercel x-forwarded-for trae la IP real.
const LIMITE_RSVP_POR_IP = 10;
const VENTANA_RSVP_MS = 60 * 60 * 1000;
const intentosPorIp = new Map<string, number[]>();

function pasaRateLimit(ip: string) {
  const ahora = Date.now();
  const lista = (intentosPorIp.get(ip) ?? []).filter(
    (t) => ahora - t < VENTANA_RSVP_MS,
  );
  if (lista.length >= LIMITE_RSVP_POR_IP) {
    intentosPorIp.set(ip, lista);
    return false;
  }
  lista.push(ahora);
  intentosPorIp.set(ip, lista);
  return true;
}

// RSVP público: el invitado no necesita cuenta. Upsert por (evento, email)
// para que cambiar de respuesta actualice en vez de duplicar.
export async function confirmarAsistencia(input: {
  slug: string;
  nombre: string;
  email: string;
  respuesta: RespuestaRsvp;
}): Promise<{ ok: boolean; error?: string }> {
  const h = await headers();
  const ip = (
    h.get("x-forwarded-for")?.split(",")[0] ??
    h.get("x-real-ip") ??
    "desconocida"
  ).trim();

  // El límite corre antes de la validación: también corta floods de basura.
  if (!pasaRateLimit(ip)) {
    return {
      ok: false,
      error:
        "Demasiadas respuestas seguidas desde tu conexión. Probá de nuevo en un rato.",
    };
  }

  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();

  if (
    nombre.length < 2 ||
    !EMAIL_RE.test(email) ||
    (input.respuesta !== "CONFIRMADO" && input.respuesta !== "RECHAZADO")
  ) {
    return { ok: false, error: "Revisá los datos del formulario." };
  }

  const evento = await db.evento.findUnique({
    where: { slug: input.slug },
    include: { creador: { select: { nombre: true } } },
  });
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

  // El mail va solo al confirmar. enviarDetallesEvento hoy no manda nada sin
  // RESEND_FROM (dominio sin verificar); y si Resend falla el RSVP igual ya
  // quedó guardado en la DB — nunca rompemos la confirmación por el mail.
  if (input.respuesta === "CONFIRMADO") {
    try {
      const proto = h.get("x-forwarded-proto") ?? "http";
      const host =
        h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
      await enviarDetallesEvento({
        email,
        nombre,
        titulo: evento.titulo,
        anfitrion: evento.creador.nombre,
        fechaInicio: evento.fechaInicio,
        lugar: evento.lugar,
        urlInvitacion: `${proto}://${host}/e/${input.slug}`,
      });
    } catch (e) {
      console.error("No se pudo enviar el mail de confirmación:", e);
    }
  }

  revalidatePath(`/e/${input.slug}`);
  return { ok: true };
}
