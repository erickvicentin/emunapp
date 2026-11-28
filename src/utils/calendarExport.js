import { STUDIO_INFO } from '../data/landingData';
import { DEFAULT_CLASS_DURATION_MINUTES, parseTurnDateTime } from './scheduleUtils';

function toUtcCompact(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildEventDates(reservation) {
  const start = parseTurnDateTime(reservation.dateKey, reservation.startTime);
  const duration = Number(reservation.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES;
  const end = new Date(start.getTime() + duration * 60 * 1000);
  return {
    startUtc: toUtcCompact(start),
    endUtc: toUtcCompact(end),
  };
}

function buildGoogleCalendarUrl(reservation) {
  const { startUtc, endUtc } = buildEventDates(reservation);
  const title = `Pilates Reformer - ${STUDIO_INFO.name}`;
  const details = `Clase de Pilates Reformer (${reservation.instructorName || 'Profesora Titular'}).`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startUtc}/${endUtc}`,
    details,
    location: STUDIO_INFO.address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(reservation) {
  const { startUtc, endUtc } = buildEventDates(reservation);
  const uid = `${reservation.id || Date.now()}@emunapilates.com`;
  const summary = `Pilates Reformer - ${STUDIO_INFO.name}`;
  const description = `Clase de Pilates Reformer con ${reservation.instructorName || 'Profesora Titular'}.`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Emuna Pilates//Turnos//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcCompact(new Date())}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${STUDIO_INFO.address}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `emuna-pilates-${reservation.dateKey}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Adds a reserved class to the user's native calendar:
 * - Android: opens Google Calendar deep link.
 * - iPhone / iPad / Desktop: downloads an .ics file for Apple Calendar / native calendar apps.
 */
export function addToMyCalendar(reservation) {
  if (!reservation?.dateKey || !reservation?.startTime) return;
  const isAndroid =
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '');

  if (isAndroid) {
    window.open(buildGoogleCalendarUrl(reservation), '_blank', 'noopener,noreferrer');
    return;
  }

  downloadIcsFile(reservation);
}

/**
 * Builds a WhatsApp link to the studio administrator with a prefilled payment notice message.
 */
export function buildAdminWhatsappPaymentUrl({ conceptLabel, amountLabel }) {
  const digits = String(STUDIO_INFO.phone || '').replace(/\D/g, '');
  const message = `Hola! Quería informar el pago por ${conceptLabel} con un importe de ${amountLabel} el cual está esperando confirmación.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
