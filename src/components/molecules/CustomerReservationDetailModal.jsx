import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { STUDIO_INFO } from '../../data/landingData';
import {
  DEFAULT_CLASS_DURATION_MINUTES,
  formatBlockEndLabel,
  parseTurnDateTime,
} from '../../utils/scheduleUtils';

function formatDetailDate(dateKey) {
  if (!dateKey) return '';
  const date = parseTurnDateTime(dateKey, '12:00');
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

/**
 * CustomerReservationDetailModal Molecule
 * Displays full details of a student's upcoming reservation, including any rejection or cancellation reason.
 */
export default function CustomerReservationDetailModal({
  dialogRef,
  reservation,
  statusMeta,
  onClose,
}) {
  const duration = Number(reservation?.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES;

  return (
    <dialog
      ref={dialogRef}
      data-testid="customer-reservation-detail-dialog"
      aria-labelledby="customer-res-detail-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Detalle del Turno
          </span>
          <h1
            id="customer-res-detail-title"
            className="font-headline-sm text-headline-sm font-semibold text-primary mt-0.5 capitalize"
          >
            {reservation ? formatDetailDate(reservation.dateKey) : 'Turno'}
          </h1>
        </div>
        <button
          type="button"
          autoFocus
          data-testid="customer-res-detail-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {reservation && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-on-surface-variant">Estado</span>
            <span
              className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${
                statusMeta?.badgeClass || ''
              }`}
            >
              {statusMeta?.label || reservation.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Horario
              </span>
              <strong className="text-primary">
                {reservation.startTime} – {formatBlockEndLabel(reservation.startTime)} hs
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Duración
              </span>
              <strong className="text-primary">{duration} min</strong>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Instructora
              </span>
              <strong className="text-primary">
                {reservation.instructorName || 'Profesora Titular'}
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Ubicación
              </span>
              <strong className="text-primary">{STUDIO_INFO.address}</strong>
            </div>
          </div>

          {reservation.motivoRechazo && (
            <div className="p-3 rounded-xl bg-error-container/70 text-on-error-container text-body-sm space-y-0.5">
              <strong className="block font-semibold">Motivo del rechazo:</strong>
              <p>{reservation.motivoRechazo}</p>
            </div>
          )}

          {reservation.motivoCancelacion && (
            <div className="p-3 rounded-xl bg-surface-container text-on-surface-variant text-body-sm space-y-0.5">
              <strong className="block font-semibold text-on-surface">Motivo de cancelación:</strong>
              <p>{reservation.motivoCancelacion}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
