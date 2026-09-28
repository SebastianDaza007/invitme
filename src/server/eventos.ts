"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/lib/db";
import { esFondoValido } from "@/src/lib/fondos";
import { slugify } from "@/src/lib/utils";
import { sincronizarPersona } from "@/src/server/auth";

type Resultado<T> = { ok: true; data: T } | { ok: false; error: string };

export async function publicarEvento(input: {
  titulo: string;
  anfitrion: string;
  fechaHora: string;
  lugar: string;
  descripcion?: string;
  fondo?: string;
}): Promise<Resultado<{ slug: string }>> {
  const titulo = input.titulo.trim();
  const anfitrion = input.anfitrion.trim();
  const lugar = input.lugar.trim();
  const descripcion = input.descripcion?.trim() || null;
  const fechaInicio = new Date(input.fechaHora);
  // El fondo viene del cliente: solo se acepta un preset conocido.
  const fondo = esFondoValido(input.fondo) ? input.fondo! : null;

  if (
    titulo.length < 3 ||
    anfitrion.length < 2 ||
    lugar.length < 3 ||
    Number.isNaN(fechaInicio.getTime()) ||
    fechaInicio.getTime() <= Date.now()
  ) {
    return { ok: false, error: "Revisá los datos del evento." };
  }

  // La sesión la valida Supabase por cookie; sin sesión no hay publicación.
  const persona = await sincronizarPersona(anfitrion);
  if (!persona) {
    return { ok: false, error: "Tenés que iniciar sesión para publicar." };
  }

  const slug = await slugUnico(titulo);
  await db.evento.create({
    data: { slug, titulo, descripcion, lugar, fechaInicio, fondo, creadorId: persona.id },
  });

  return { ok: true, data: { slug } };
}

// Edición desde el panel /mis-eventos/[slug]. El slug no cambia: el link ya
// fue compartido con los invitados. "anfitrion" actualiza Persona.nombre,
// igual que al publicar (el nombre visible en la invitación sale del creador).
export async function actualizarEvento(input: {
  slug: string;
  titulo: string;
  anfitrion: string;
  fechaHora: string;
  lugar: string;
  descripcion?: string;
  fondo?: string;
}): Promise<Resultado<null>> {
  const titulo = input.titulo.trim();
  const anfitrion = input.anfitrion.trim();
  const lugar = input.lugar.trim();
  const descripcion = input.descripcion?.trim() || null;
  const fechaInicio = new Date(input.fechaHora);
  const fondo = esFondoValido(input.fondo) ? input.fondo! : null;

  if (
    titulo.length < 3 ||
    anfitrion.length < 2 ||
    lugar.length < 3 ||
    Number.isNaN(fechaInicio.getTime()) ||
    fechaInicio.getTime() <= Date.now()
  ) {
    return { ok: false, error: "Revisá los datos del evento." };
  }

  const persona = await sincronizarPersona(anfitrion);
  if (!persona) {
    return { ok: false, error: "Tenés que iniciar sesión para editar." };
  }

  // La autorización se chequea acá, no en la UI: el action es un endpoint
  // público al que cualquiera puede POSTear con un slug ajeno.
  const evento = await db.evento.findUnique({
    where: { slug: input.slug },
    select: { id: true, creadorId: true },
  });
  if (!evento || evento.creadorId !== persona.id) {
    return { ok: false, error: "No encontramos ese evento." };
  }

  await db.evento.update({
    where: { id: evento.id },
    data: { titulo, descripcion, lugar, fechaInicio, fondo },
  });

  revalidatePath(`/e/${input.slug}`);
  revalidatePath(`/mis-eventos/${input.slug}`);
  revalidatePath("/mis-eventos");
  return { ok: true, data: null };
}

async function slugUnico(titulo: string) {
  const base = slugify(titulo);
  for (let i = 0; ; i++) {
    const candidato = i === 0 ? base : `${base}-${i + 1}`;
    const existe = await db.evento.findUnique({
      where: { slug: candidato },
      select: { id: true },
    });
    if (!existe) return candidato;
  }
}
