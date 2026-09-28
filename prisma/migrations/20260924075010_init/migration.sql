-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ANFITRION', 'INVITADO');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "authId" TEXT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "lugar" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "creadorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitacion" (
    "id" SERIAL NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'INVITADO',
    "estado" "EstadoAsistencia" NOT NULL DEFAULT 'PENDIENTE',
    "mensaje" TEXT,
    "eventoId" INTEGER NOT NULL,
    "personaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Persona_authId_key" ON "Persona"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_email_key" ON "Persona"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_slug_key" ON "Evento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Invitacion_eventoId_personaId_key" ON "Invitacion"("eventoId", "personaId");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
