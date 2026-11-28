import nodemailer from 'nodemailer';

const DEFAULT_SMTP_HOST = 'smtp-relay.brevo.com';
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_FROM = 'Emuná Pilates <no-reply@emuna-pilates.com.ar>';
const DEFAULT_APP_URL = 'https://emuna-pilates.com.ar';
const INTERNAL_AUTH_DOMAIN = '@dni.emuna.local';

let cachedTransporter = null;

export function resetTransporterCache() {
  cachedTransporter = null;
}

/**
 * Escapes HTML special characters to prevent injection inside email templates.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Checks whether an email address is a real deliverable recipient
 * (skips internal synthetic addresses like `<dni>@dni.emuna.local`).
 */
export function isValidRecipientEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || normalized.endsWith(INTERNAL_AUTH_DOMAIN)) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '').trim();
  if (!user || !pass) {
    return null;
  }

  const host = String(process.env.SMTP_HOST || DEFAULT_SMTP_HOST).trim();
  const port = Number(process.env.SMTP_PORT) || DEFAULT_SMTP_PORT;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

function formatDateAr(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || '').trim());
  if (!match) return String(dateKey || '');
  return `${match[3]}/${match[2]}/${match[1]}`;
}

const ARS_CURRENCY_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function formatCurrencyAr(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return '';
  return ARS_CURRENCY_FORMATTER.format(numeric);
}

function buildEmailLayout({ title, greeting, bodyHtml, ctaLabel = 'Ir a Emuná Pilates', ctaUrl }) {
  const baseUrl = String(process.env.APP_URL || DEFAULT_APP_URL).trim().replace(/\/+$/, '');
  const targetUrl = ctaUrl || baseUrl;
  const logoUrl = `${baseUrl}/logo-email.jpg`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fff8f0;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e1b13;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background-color:#fff8f0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d1c4c0;">
          <tr>
            <td style="background:#2c2422;padding:20px 28px;border-bottom:3px solid #82533e;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;">
                    <img src="${escapeHtml(logoUrl)}" width="44" height="44" alt="Emuná Pilates" style="display:block;width:44px;height:44px;border-radius:9999px;object-fit:cover;border:1px solid #82533e;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="font-family:'Epilogue',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:19px;font-weight:600;letter-spacing:0.3px;color:#ffffff;line-height:1.2;">Emuná Pilates</div>
                    <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#f6b99f;margin-top:3px;">Movimiento Consciente</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 14px;font-family:'Epilogue',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:21px;font-weight:600;color:#160f0e;line-height:1.3;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#4e4542;">${escapeHtml(greeting)}</p>
              <div style="font-size:15px;line-height:1.6;color:#4e4542;">
                ${bodyHtml}
              </div>
              <div style="margin-top:26px;">
                <a href="${escapeHtml(targetUrl)}" style="display:inline-block;background:#82533e;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                  ${escapeHtml(ctaLabel)}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#fbf3e4;border-top:1px solid #efe7d9;font-size:12px;line-height:1.5;color:#4e4542;">
              Este es un correo automático enviado desde una casilla sin respuesta (no-reply). Si tenés dudas, contactate directamente con el estudio.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Sends a transactional email via Nodemailer (Brevo SMTP).
 * Never throws so callers/triggers are not aborted by transient SMTP failures.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!isValidRecipientEmail(to)) {
    return { sent: false, reason: 'invalid_or_internal_recipient' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[emailService] SMTP_USER o SMTP_PASS no configurados; se omite envío:', subject);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const from = String(process.env.SMTP_FROM || DEFAULT_FROM).trim();
  const replyTo = String(process.env.SMTP_REPLY_TO || '').trim();

  try {
    const info = await transporter.sendMail({
      from,
      to: String(to).trim(),
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('[emailService] Error enviando correo:', {
      subject,
      to,
      message: error?.message,
    });
    return { sent: false, reason: error?.message || 'smtp_error' };
  }
}

export async function sendWelcomeEmail({ to, nombre }) {
  const firstName = String(nombre || '').trim() || 'alumne';
  const appUrl = String(process.env.APP_URL || DEFAULT_APP_URL).trim();

  return sendEmail({
    to,
    subject: '¡Te damos la bienvenida a Emuná Pilates!',
    text: `Hola ${firstName}, tu cuenta en Emuná Pilates ya está lista. Podés ingresar en ${appUrl} con tu DNI como usuario y contraseña inicial.`,
    html: buildEmailLayout({
      title: '¡Bienvenida/o a Emuná Pilates!',
      greeting: `Hola ${firstName},`,
      bodyHtml: `
        <p style="margin:0 0 12px;">Tu cuenta ya fue habilitada en nuestra plataforma de reservas.</p>
        <p style="margin:0 0 12px;">Para tu primer ingreso, usá tu <strong>DNI</strong> (sin puntos) como contraseña inicial. El sistema te pedirá crear una clave nueva al entrar.</p>
        <p style="margin:0;">Desde el portal vas a poder reservar tu cama reformer, consultar tu saldo de clases y gestionar tus horarios.</p>
      `,
      ctaLabel: 'Ingresar a mi cuenta',
      ctaUrl: `${appUrl}/login`,
    }),
  });
}

export async function sendReservationConfirmedEmail({
  to,
  nombre,
  dateKey,
  startTime,
  instructorName,
}) {
  const firstName = String(nombre || '').trim() || 'alumne';
  const fecha = formatDateAr(dateKey);
  const hora = String(startTime || '').trim();
  const profe = String(instructorName || '').trim();

  return sendEmail({
    to,
    subject: `Reserva confirmada: ${fecha} a las ${hora} hs`,
    text: `Hola ${firstName}, confirmamos tu reserva en Emuná Pilates para el ${fecha} a las ${hora} hs.${profe ? ` Profesora: ${profe}.` : ''} Recordá que podés cancelar con anticipación para no perder tu crédito.`,
    html: buildEmailLayout({
      title: 'Reserva confirmada',
      greeting: `Hola ${firstName},`,
      bodyHtml: `
        <p style="margin:0 0 12px;">Tu lugar en la clase de Pilates Reformer ya está reservado:</p>
        <div style="background:#f5eddf;border-left:4px solid #82533e;border-radius:10px;padding:14px 16px;margin:0 0 14px;color:#1e1b13;">
          <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${escapeHtml(fecha)}</p>
          <p style="margin:0 0 6px;"><strong>Horario:</strong> ${escapeHtml(hora)} hs</p>
          ${profe ? `<p style="margin:0;"><strong>Profesora:</strong> ${escapeHtml(profe)}</p>` : ''}
        </div>
        <p style="margin:0;font-size:13px;color:#6c6660;">Si necesitás cancelar o reprogramar, hacelo con anticipación desde la app para conservar tu crédito.</p>
      `,
      ctaLabel: 'Ver mis reservas',
    }),
  });
}

export async function sendReservationCancelledEmail({
  to,
  nombre,
  dateKey,
  startTime,
  status,
  reason,
}) {
  const firstName = String(nombre || '').trim() || 'alumne';
  const fecha = formatDateAr(dateKey);
  const hora = String(startTime || '').trim();

  const isStudioCancelled = status === 'cancelado_estudio';
  const isLateCancel = status === 'cancelado_tarde';

  let detailText = 'Tu reserva fue cancelada y el crédito se reintegró a tu paquete.';
  if (isStudioCancelled) {
    detailText = reason
      ? `El estudio canceló este turno (${reason}). Si habías usado un crédito, fue reintegrado automáticamente.`
      : 'El estudio canceló este turno. Si habías usado un crédito, fue reintegrado automáticamente.';
  } else if (isLateCancel) {
    detailText = 'La cancelación se realizó fuera de término, por lo que el crédito de la clase no se reintegra.';
  }

  return sendEmail({
    to,
    subject: `Reserva cancelada: ${fecha} ${hora} hs`,
    text: `Hola ${firstName}, la reserva del ${fecha} a las ${hora} hs fue cancelada. ${detailText}`,
    html: buildEmailLayout({
      title: 'Reserva cancelada',
      greeting: `Hola ${firstName},`,
      bodyHtml: `
        <p style="margin:0 0 12px;">Te informamos que la siguiente reserva fue cancelada:</p>
        <div style="background:#f5eddf;border-left:4px solid #82533e;border-radius:10px;padding:14px 16px;margin:0 0 14px;color:#1e1b13;">
          <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${escapeHtml(fecha)}</p>
          <p style="margin:0;"><strong>Horario:</strong> ${escapeHtml(hora)} hs</p>
        </div>
        <p style="margin:0;">${escapeHtml(detailText)}</p>
      `,
      ctaLabel: 'Ver horarios disponibles',
    }),
  });
}

export async function sendPaymentStatusEmail({
  to,
  nombre,
  paqueteNombre,
  monto,
  estado,
  motivoRechazo,
}) {
  const firstName = String(nombre || '').trim() || 'alumne';
  const pkgName = String(paqueteNombre || 'tu paquete').trim();
  const formattedAmount = formatCurrencyAr(monto);
  const isApproved = estado === 'aprobado';
  const isExpired = estado === 'vencido';

  const title = isApproved
    ? 'Pago aprobado'
    : isExpired
      ? 'Pago provisorio vencido'
      : 'Pago no validado';

  const summary = isApproved
    ? `Confirmamos la acreditación de tu pago${formattedAmount ? ` (${formattedAmount})` : ''} para <strong>${escapeHtml(pkgName)}</strong>. Tus clases ya están activas.`
    : isExpired
      ? `El plazo para confirmar tu pago provisorio de <strong>${escapeHtml(pkgName)}</strong> venció sin acreditación, por lo que las reservas asociadas fueron liberadas.`
      : `No pudimos validar tu comprobante para <strong>${escapeHtml(pkgName)}</strong>.${motivoRechazo ? ` Motivo: ${escapeHtml(motivoRechazo)}.` : ''}`;

  return sendEmail({
    to,
    subject: `${title} - Emuná Pilates`,
    text: `Hola ${firstName}, ${title}: ${pkgName}.`,
    html: buildEmailLayout({
      title,
      greeting: `Hola ${firstName},`,
      bodyHtml: `
        <p style="margin:0 0 12px;">${summary}</p>
        ${!isApproved ? '<p style="margin:0;">Si ya realizaste la transferencia o creés que es un error, por favor comunicate con administración.</p>' : ''}
      `,
      ctaLabel: 'Ir a mi portal',
    }),
  });
}

export async function sendClassReminderEmail({
  to,
  nombre,
  dateKey,
  startTime,
  instructorName,
}) {
  const firstName = String(nombre || '').trim() || 'alumne';
  const fecha = formatDateAr(dateKey);
  const hora = String(startTime || '').trim();
  const profe = String(instructorName || '').trim();

  return sendEmail({
    to,
    subject: `Recordatorio: mañana tenés Pilates a las ${hora} hs`,
    text: `Hola ${firstName}, te recordamos tu clase de Emuná Pilates el ${fecha} a las ${hora} hs.${profe ? ` Profesora: ${profe}.` : ''} Recordá cancelar con anticipación si no podés asistir.`,
    html: buildEmailLayout({
      title: 'Recordatorio de tu próxima clase',
      greeting: `Hola ${firstName},`,
      bodyHtml: `
        <p style="margin:0 0 12px;">¡Te esperamos pronto! Este es un recordatorio de tu clase programada:</p>
        <div style="background:#f5eddf;border-left:4px solid #82533e;border-radius:10px;padding:14px 16px;margin:0 0 14px;color:#1e1b13;">
          <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${escapeHtml(fecha)}</p>
          <p style="margin:0 0 6px;"><strong>Horario:</strong> ${escapeHtml(hora)} hs</p>
          ${profe ? `<p style="margin:0;"><strong>Profesora:</strong> ${escapeHtml(profe)}</p>` : ''}
        </div>
        <p style="margin:0;font-size:13px;color:#6c6660;">Si surgiera algún imprevisto, recordá cancelar con al menos 4 horas de anticipación desde la app para recuperar tu crédito.</p>
      `,
      ctaLabel: 'Gestionar mi reserva',
    }),
  });
}
