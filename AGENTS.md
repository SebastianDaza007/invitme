<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Notas del proyecto (invitme)

## Pendiente: confirmación de email en Supabase
Decisión del usuario pendiente: si el registro debe dar sesión inmediata, hay que
desactivar "Confirm email" en Supabase → Authentication → Sign In / Providers.
Con la confirmación activada, `signUp` devuelve `session: null` y el AuthModal
ya muestra el aviso "te enviamos un email de confirmación" (flujo contemplado).

## Backend (implementado)
- Auth: Supabase Auth (`@supabase/ssr`). Browser client en `src/lib/supabase/client.ts`
  (sesión en cookies), server client en `src/lib/supabase/server.ts`, refresh de
  token en `proxy.ts` (en Next 16 el middleware se llama proxy.ts).
- DB: Postgres de Supabase via Prisma 7 + adapter `PrismaPg`. Cliente singleton en
  `src/lib/db.ts`. `DATABASE_URL` (pooler, runtime) / `DIRECT_URL` (migraciones).
- Server Actions en `src/server/`: `auth.ts` (sincronizarPersona),
  `eventos.ts` (publicarEvento), `rsvp.ts` (confirmarAsistencia).
- `Persona.authId` = UUID de `auth.users` (null para invitados sin cuenta).
  `Evento.slug` es la URL pública: `app/e/[slug]/page.tsx`.
- La home `/` es landing+demo con mock (`src/lib/mock-event.ts`); el RSVP sin
  prop `slug` se simula.
- Verificación: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
