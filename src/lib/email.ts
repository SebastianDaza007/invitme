import { Resend } from "resend";
import { formatFechaEvento, formatHoraEvento } from "@/src/lib/utils";

// Cliente Resend lazy-singleton. La key va en RESEND_API_KEY (.env / Vercel).
// RESEND_FROM es opcional: sin dominio verificado hay que usar
// onboarding@resend.dev, que solo entrega al mail de la cuenta de Resend.
let resend: Resend | null = null;

function resendClient() {
  resend ??= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// Escapa texto del usuario antes de meterlo en el HTML del mail.
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Mail que recibe el invitado al confirmar. Se manda solo en CONFIRMADO.
// GATEADO por RESEND_FROM: sin remitente configurado no intentamos mandar —
// con el dominio de test de Resend (onboarding@resend.dev) todo envío a
// casillas ajenas sería un rechazo seguro. Cuando se verifique un dominio
// propio, setear RESEND_FROM y esto empieza a entregar solo.
export async function enviarDetallesEvento(input: {
  email: string;
  nombre: string;
  titulo: string;
  anfitrion: string;
  fechaInicio: Date;
  lugar: string;
  urlInvitacion: string;
}) {
  const from = process.env.RESEND_FROM;
  if (!from) return;
  const titulo = esc(input.titulo);
  const nombre = esc(input.nombre);
  const anfitrion = esc(input.anfitrion);
  const lugar = esc(input.lugar);
  const url = esc(input.urlInvitacion);
  const fecha = esc(formatFechaEvento(input.fechaInicio));
  const hora = esc(formatHoraEvento(input.fechaInicio));

  const { error } = await resendClient().emails.send({
    from,
    to: input.email,
    subject: `¡Nos vemos! Confirmaste para ${input.titulo}`,
    html: `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:#faf7f2;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1c1917;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #f0e6da;">
    <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#c75e10;">Invitme</p>
    <h1 style="margin:12px 0 0;font-size:26px;font-style:italic;font-family:Georgia,serif;">¡Nos vemos ahí, ${nombre}!</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#57534e;">
      Tu asistencia a <strong>${titulo}</strong> quedó confirmada. ${anfitrion} te espera para celebrar.
    </p>
    <div style="margin:24px 0;padding:16px 20px;background:#faf7f2;border-radius:14px;">
      <p style="margin:0;font-size:14px;line-height:1.9;">
        <strong>Cuándo:</strong> ${fecha} · ${hora} h<br>
        <strong>Dónde:</strong> ${lugar}
      </p>
    </div>
    <a href="${url}" style="display:inline-block;margin:0;padding:12px 24px;background:#c75e10;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
      Ver la invitación
    </a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a8a29e;">
      Si cambió algo, el link siempre muestra los datos actualizados.
    </p>
  </div>
</body>
</html>`,
  });

  if (error) throw new Error(`Resend: ${error.message}`);
}
