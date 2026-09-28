"use server";

import { db } from "@/src/lib/db";
import { slugify } from "@/src/lib/utils";
import { sincronizarPersona } from "@/src/server/auth";

type Resultado<T> = { ok: true; data: T } | { ok: false; error: string };

export async function publicarEvento(input: {
  titulo: string;
  anfitrion: string;
  fechaHora: string;
  lugar: string;
  descripcion?: string;
}): Promise<Resultado<{ slug: string }>> {
  const titulo = input.titulo.trim();
  const anfitrion = input.anfitrion.trim();
  const lugar = input.lugar.trim();
  const descripcion = input.descripcion?.trim() || null;
  const fechaInicio = new Date(input.fechaHora);

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
    data: { slug, titulo, descripcion, lugar, fechaInicio, creadorId: persona.id },
  });

  return { ok: true, data: { slug } };
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
