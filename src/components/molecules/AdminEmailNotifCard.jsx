import React from 'react';
import EmailNotificationsCard from './EmailNotificationsCard';

const EMPTY_CONFIG = {};

const NOTIFICATION_ITEMS = [
  {
    key: 'nuevoPagoPendiente',
    label: 'Nuevo pago pendiente de conciliación',
    description: 'Recibí un aviso inmediato cuando un alumno informe una transferencia o pago.',
    testId: 'admin-notif-switch-nuevo-pago',
  },
  {
    key: 'cancelacionAlumno',
    label: 'Cancelación de turno por un alumno',
    description: 'Enterate cuando se libera una cama porque un alumno canceló su reserva.',
    testId: 'admin-notif-switch-cancelacion-alumno',
  },
  {
    key: 'reservaUltimoMomento',
    label: 'Reserva de último momento',
    description: 'Recibí una alerta cuando un alumno reserve una clase para el mismo día o próximas 12 hs.',
    testId: 'admin-notif-switch-reserva-ultimo-momento',
  },
  {
    key: 'resumenDiario',
    label: 'Resumen diario de la jornada (08:00 hs)',
    description: 'Un único correo matutino con las clases del día, ocupación y pagos pendientes.',
    testId: 'admin-notif-switch-resumen-diario',
  },
];

/**
 * AdminEmailNotifCard Molecule
 * Allows the administrator to enable or disable each automated admin email notification.
 */
export default function AdminEmailNotifCard({
  config = EMPTY_CONFIG,
  isMutating = false,
  onSave,
}) {
  return (
    <EmailNotificationsCard
      title="Notificaciones por Email (Administración)"
      description="Elegí qué avisos automáticos querés recibir en tu correo de administradora."
      items={NOTIFICATION_ITEMS}
      config={config}
      isMutating={isMutating}
      onSave={onSave}
      cardTestId="admin-email-notif-card"
      saveBtnTestId="admin-email-notif-save-btn"
    />
  );
}
