import React from 'react';
import Button from '../atoms/Button';

/**
 * TurnCancelledNotice Molecule
 * Displays the cancellation banner and optional reopen action for a cancelled shift.
 */
export default function TurnCancelledNotice({
  turn,
  isMutating = false,
  onClose,
  onReopenTurn,
}) {
  return (
    <div className="mt-4 space-y-4">
      <div
        data-testid="turn-cancelled-banner"
        className="p-4 rounded-xl bg-error-container text-on-error-container text-body-md space-y-1.5 border border-error/30"
      >
        <p className="font-semibold flex items-center gap-2">
          <span aria-hidden="true">✕</span>
          <span>Turno cancelado</span>
        </p>
        <p className="text-body-sm">
          Motivo: <strong>{turn.motivoCancelacion || 'Cancelado por el estudio'}</strong>
        </p>
        <p className="text-body-sm opacity-90">
          Si había alumnos con reserva confirmada, sus créditos fueron devueltos automáticamente sin afectar su presencialidad.
        </p>
      </div>
      {onReopenTurn && (
        <div className="flex justify-end gap-3 pt-2 border-t border-surface-container-high">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            <span>Cerrar</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={isMutating}
            data-testid="turn-reopen-btn"
            onClick={async () => {
              const ok = await onReopenTurn(turn.id);
              if (ok) onClose();
            }}
          >
            <span>{isMutating ? 'Habilitando...' : 'Habilitar turno nuevamente'}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
