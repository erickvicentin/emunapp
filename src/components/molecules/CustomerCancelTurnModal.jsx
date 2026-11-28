import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { parseTurnDateTime } from '../../utils/scheduleUtils';

function formatCancelDate(dateKey) {
  if (!dateKey) return '';
  const date = parseTurnDateTime(dateKey, '12:00');
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

/**
 * CustomerCancelTurnModal Molecule
 * Confirmation modal before cancelling a student's upcoming turn (>= 4h before start).
 */
export default function CustomerCancelTurnModal({
  dialogRef,
  reservation,
  isMutating = false,
  onClose,
  onConfirm,
}) {
  return (
    <dialog
      ref={dialogRef}
      data-testid="customer-cancel-turn-dialog"
      aria-labelledby="customer-cancel-turn-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-error font-semibold">
            Cancelar Turno
          </span>
          <h1
            id="customer-cancel-turn-title"
            className="font-headline-sm text-headline-sm font-semibold text-primary mt-0.5 capitalize"
          >
            {reservation
              ? `${formatCancelDate(reservation.dateKey)} • ${reservation.startTime} hs`
              : 'Cancelar turno'}
          </h1>
        </div>
        <button
          type="button"
          data-testid="customer-cancel-turn-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {reservation && (
        <div className="mt-4 space-y-4">
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            {reservation.creditoConsumido || reservation.estado === 'confirmada'
              ? 'Al cancelar con al menos 4 horas de anticipación, se liberará tu lugar en la cama y se acreditará 1 crédito en tu saldo.'
              : 'Al cancelar esta reserva se liberará tu lugar en la cama y podrás volver a elegir otro horario en ese día.'}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              autoFocus
              data-testid="customer-cancel-turn-back-btn"
              onClick={onClose}
              disabled={isMutating}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              data-testid="customer-cancel-turn-confirm-btn"
              onClick={() => onConfirm?.(reservation)}
              disabled={isMutating}
              className="bg-error hover:bg-error/90 text-on-error"
            >
              {isMutating ? 'Cancelando...' : 'Confirmar cancelación'}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
