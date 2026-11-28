import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

/**
 * ClosedDayModal Molecule
 * Admin-only modal to mark a date as holiday/closed (or reopen it).
 */
export default function ClosedDayModal({
  dialogRef,
  targetDay,
  closedInfo,
  isMutating = false,
  onClose,
  onMarkClosed,
  onReopen,
}) {
  const [reason, setReason] = useState('Feriado / Día no hábil');

  const handleCloseDay = async (e) => {
    e.preventDefault();
    if (!targetDay) return;
    const ok = await onMarkClosed(targetDay.dateKey, reason);
    if (ok) onClose();
  };

  const handleReopenDay = async () => {
    if (!targetDay) return;
    const ok = await onReopen(targetDay.dateKey);
    if (ok) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="closed-day-dialog"
      aria-labelledby="closed-day-title"
      onClose={onClose}
      className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-md w-[calc(100%-2rem)] text-on-surface m-auto"
    >
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Feriado / Día Cerrado
          </span>
          <h2
            id="closed-day-title"
            data-testid="closed-day-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5"
          >
            {targetDay ? `${targetDay.label} ${targetDay.displayDate}` : 'Configurar día'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
          aria-label="Cerrar modal"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {closedInfo ? (
        <div className="mt-4 space-y-4">
          <p className="text-body-md text-on-surface-variant">
            Este día figura cerrado por:{' '}
            <strong className="text-primary">{closedInfo.reason}</strong>. Si lo rehabilitás, volverán a generarse los horarios base correspondientes.
          </p>
          <div className="pt-3 border-t border-surface-container-high flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              <span>Cancelar</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isMutating}
              data-testid="closed-day-reopen-btn"
              onClick={handleReopenDay}
            >
              <span>Habilitar día nuevamente</span>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCloseDay} className="mt-4 space-y-4">
          <p className="text-body-sm text-on-surface-variant">
            Al marcar este día como cerrado, se inhabilita para nuevas reservas y si existen turnos programados se cancelan devolviendo los créditos a los alumnos.
          </p>
          <Input
            id="closed-day-reason"
            data-testid="closed-day-reason-input"
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Feriado Nacional"
            required
          />
          <div className="pt-3 border-t border-surface-container-high flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isMutating}
              data-testid="closed-day-confirm-btn"
            >
              <span>{isMutating ? 'Guardando...' : 'Cerrar día'}</span>
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
