import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton sobre globalThis: en dev Next recarga módulos y sin esto
// cada hot-reload abriría un pool nuevo contra Supabase.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
