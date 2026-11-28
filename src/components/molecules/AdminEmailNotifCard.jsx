import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Switch from '../atoms/Switch';

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
  config = {},
  isMutating = false,
  onSave,
}) {
  const [draft, setDraft] = useState(null);
  const current = draft || config;

  const handleToggle = (key, nextValue) => {
    setDraft((prev) => ({ ...(prev || config), [key]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSave?.(current);
    if (ok) setDraft(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="admin-email-notif-card"
      className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-4"
    >
      <div className="pb-3 border-b border-surface-container-high">
        <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
          <Icon name="notifications_active" className="text-secondary text-[20px]" />
          <span>Notificaciones por Email (Administración)</span>
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Elegí qué avisos automáticos querés recibir en tu correo de administradora.
        </p>
      </div>

      <div className="divide-y divide-surface-container-high/70">
        {NOTIFICATION_ITEMS.map((item) => (
          <div
            key={item.key}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <p className="text-body-md font-semibold text-on-surface">{item.label}</p>
              <p className="text-body-sm text-on-surface-variant">{item.description}</p>
            </div>
            <Switch
              checked={Boolean(current[item.key])}
              onChange={(val) => handleToggle(item.key, val)}
              disabled={isMutating}
              ariaLabel={item.label}
              testId={item.testId}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isMutating}
          data-testid="admin-email-notif-save-btn"
        >
          <span>{isMutating ? 'Guardando...' : 'Guardar notificaciones'}</span>
        </Button>
      </div>
    </form>
  );
}
