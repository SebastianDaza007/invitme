<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Notas del proyecto (invitme)

## Confirmación de email en Supabase (decidido)
"Confirm email" queda ACTIVADO en Supabase → Authentication → Sign In / Providers.
Con la confirmación activada, `signUp` devuelve `session: null` y el AuthModal
muestra el aviso "te enviamos un email de confirmación" (flujo contemplado).
Nota: el SMTP default de Supabase tiene límite bajo; si se envían mails reales
(actualizaciones a invitados), configurar SMTP propio o servicio tipo Resend.

## Emails y Supabase (estado + pendientes)

Mails que existen HOY:
- Confirmación de cuenta al registrarse (signUp con `emailRedirectTo` a
  `/auth/callback`) — SMTP default de Supabase.
- Recuperación de contraseña (vista "recuperar" del AuthModal →
  `resetPasswordForEmail` → `/auth/callback?next=/recuperar`) — SMTP default.
- Detalles del evento al invitado que confirma (RESEND — ver abajo).
- El límite bajo del SMTP default de Supabase (~un puñado/hora) aplica SOLO a
  los mails de auth, o sea a anfitriones que se registran o recuperan pass.

Resend (implementado):
- `src/lib/email.ts`: singleton `Resend` + `enviarDetallesEvento()` (template
  HTML inline-styles, escapa inputs del usuario con `esc()`).
- Punto de envío: `src/server/rsvp.ts` → `confirmarAsistencia`, solo cuando
  `respuesta === "CONFIRMADO"`. Fallo de Resend se loguea y NO rompe el RSVP.
- Env vars: `RESEND_API_KEY` (obligatoria) y `RESEND_FROM` — la que gatea todo.
- LIMITACIÓN: `onboarding@resend.dev` solo entrega al mail de la cuenta de
  Resend. Para llegar a invitados reales hay que verificar un dominio propio
  en Resend (DNS SPF/DKIM) y poner `RESEND_FROM` con ese dominio. Un dominio
  `*.vercel.app` NO se puede verificar (Vercel controla ese DNS).
- Estado actual (decidido): `enviarDetallesEvento` NO intenta mandar si falta
  `RESEND_FROM` — cero llamadas a la API hasta tener dominio. Para probar el
  mail hoy: `RESEND_FROM="Invitme <onboarding@resend.dev>"` en .env y confirmar
  con el email de la cuenta de Resend.
- El copy del éxito del RSVP ya NO promete mail ("Guardá el link de la
  invitación…"). Cuando haya dominio verificado, si se quiere, restaurar la
  promesa de mail en `rsvp-form.tsx`.
- Límite plan free: 100 mails/día + 3.000/mes (día = UTC).
- El link del mail se arma con `host`/`x-forwarded-proto` del request — funciona
  en cualquier deploy sin env extra.
- Extra posible: Resend como SMTP propio de Supabase (Authentication → SMTP)
  para sacar los mails de auth del límite default.

Checklist para deploy a Vercel/producción:
- Supabase → Authentication → URL Configuration:
  - Redirect URLs: agregar `https://<dominio>/auth/callback` (mantener la de
    localhost para dev; admite wildcards tipo `https://*.vercel.app/**`).
  - Site URL: `https://<dominio>` (fallback cuando el mail no trae redirectTo).
- Env vars en Vercel: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM` (si
  hay dominio verificado).

Anti-spam del RSVP (implementado):
- Rate-limit por IP en `src/server/rsvp.ts` (`pasaRateLimit`): máx 10 envíos
  por hora por `x-forwarded-for` (ventana deslizante, Map en memoria).
  Corre antes de la validación — corta floods de basura también.
- Best-effort: en serverless el contador es por instancia, no global. Suficiente
  para cortar que inflen invitados falsos a lo loco; si crece, Upstash/Redis
  o Turnstile.
- Caveat aceptado: el upsert por email pisa `Persona.nombre`, así alguien con
  el email de otro puede cambiarle nombre/respuesta. Mitigación barata futura:
  sacar `nombre` del `update` del upsert cuando la Persona ya existe.

Pendientes decididos (no implementados aún):
- `Invitacion.mensaje`: el campo existe en el schema y el panel lo muestra,
  pero el RSVP no lo pide (siempre null). Fix = textarea "¿Algún mensaje para
  el anfitrión?" en `rsvp-form.tsx` + pasarlo al upsert (~15 líneas).
- "Cómo llegar" directo a indicaciones: hoy `urlMapa()` (`src/lib/utils.ts`)
  usa `maps/search/?api=1&query=...` → abre Maps en modo búsqueda y el
  invitado tiene que tocar "Indicaciones" a mano. Cambiar a
  `maps/dir/?api=1&destination=...` abre directo en modo indicaciones con
  origen "Tu ubicación". NO requiere API key ni billing (el `api=1` es solo
  la versión del esquema Google Maps URLs). Opcionales: `travelmode=`
  (driving/walking/transit) y `dir_action=navigate` (en móvil arranca
  navegación turn-by-turn). El helper lo usan `invite-hero.tsx` y
  `event-details.tsx`; el preview de /crear es solo visual (no linkea).
  El campo `lugar` NO cambia: `destination=` acepta texto libre igual que
  la barra de búsqueda de Maps. Autocompletado con sugerencias = Google
  Places Autocomplete (Places API New): sí requiere Google Cloud + billing
  + API key (hay ~10k req/mes gratis), y devolvería `place_id` para usar
  `destination_place_id=` (precisión exacta). Decidido: no por ahora; la
  validación gratis es que el anfitrión pruebe el link desde su panel.
  Opción intermedia sin API: si `lugar` es una URL de Maps ("Compartir"),
  usarla tal cual en vez de armar la nuestra.

## Backend (implementado)
- Auth: Supabase Auth (`@supabase/ssr`). Browser client en `src/lib/supabase/client.ts`
  (sesión en cookies), server client en `src/lib/supabase/server.ts`, refresh de
  token en `proxy.ts` (en Next 16 el middleware se llama proxy.ts).
- DB: Postgres de Supabase via Prisma 7 + adapter `PrismaPg`. Cliente singleton en
  `src/lib/db.ts`. `DATABASE_URL` (pooler, runtime) / `DIRECT_URL` (migraciones).
- Server Actions en `src/server/`: `auth.ts` (sincronizarPersona),
  `eventos.ts` (publicarEvento, actualizarEvento), `rsvp.ts` (confirmarAsistencia).
- `Persona.authId` = UUID de `auth.users` (null para invitados sin cuenta).
  `Evento.slug` es la URL pública: `app/e/[slug]/page.tsx`.
- Rutas privadas: `/mis-eventos` (secciones `#creados` / `#asisto`) y
  `/mis-eventos/[slug]` (panel de invitados, solo creador). Guard por sesión
  en el server component (`supabaseServer().auth.getUser()` → redirect "/").
- El panel `/mis-eventos/[slug]` tiene un `<details>` "Editar evento" con
  `src/components/admin/editar-evento.tsx` → `actualizarEvento`. El slug no se
  edita (los links ya compartidos seguirían funcionando). `anfitrion` en la
  invitación es `evento.creador.nombre`, editable desde ese mismo form.
- Fondos de invitación (presets): `Evento.fondo` guarda un id del catálogo
  `src/lib/fondos.ts`; los assets son SVG en `public/fondos/*.svg` (null =
  "calido"). Selector compartido: `src/components/common/selector-fondo.tsx`
  (lo usan /crear y el panel de edición). Se renderiza como background-image
  en el hero (`invite-hero.tsx`) y el preview de /crear. Para agregar uno:
  SVG/JPG en public/fondos + entrada en FONDOS.
- Recuperar contraseña: AuthModal vista "recuperar" → `resetPasswordForEmail`
  con redirect a `/auth/callback?next=/recuperar`. `app/auth/callback/route.ts`
  hace `exchangeCodeForSession` (también lo usa `emailRedirectTo` del signUp) y
  `/recuperar` setea la pass con `updateUser`. Requiere whitelist de
  `/auth/callback` en Supabase → Authentication → URL Configuration.
- Navegación: `NavMenu` (hamburguesa junto al logo) + dropdown del `AuthMenu`
  tienen entrada a "Mis eventos". `CopyLinkButton` copia el link `/e/[slug]`.
- La home `/` es landing+demo con mock (`src/lib/mock-event.ts`); el RSVP sin
  prop `slug` se simula.
- Verificación: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
