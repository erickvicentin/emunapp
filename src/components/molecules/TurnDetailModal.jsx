import React, { useMemo } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import TurnCancelledNotice from './TurnCancelledNotice';
import TurnAssignForm from './TurnAssignForm';
import TurnReservationsList from './TurnReservationsList';
import { DEFAULT_MAX_CAPACITY } from '../../utils/scheduleUtils';

const EMPTY_LIST = [];

/**
 * TurnDetailModal Molecule
 * Allows staff/admin to assign students, mark attendance, remove bookings, or cancel a shift.
 */
export default function TurnDetailModal({
  dialogRef,
  turn,
  reservations = EMPTY_LIST,
  students = EMPTY_LIST,
  isMutating = false,
  onClose,
  onAssignStudent,
  onRemoveReservation,
  onMarkAttendance,
  onCancelTurn,
  onReopenTurn,
  onDeleteTurn,
}) {
  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (r) => r.turnoId === turn?.id && r.estado === 'confirmada'
      ),
    [reservations, turn?.id]
  );

  const bookedIds = useMemo(
    () => new Set(activeReservations.map((r) => r.usuarioId)),
    [activeReservations]
  );

  const availableStudents = useMemo(
    () =>
      students.filter(
        (s) => s.active !== false && !bookedIds.has(s.id)
      ),
    [students, bookedIds]
  );

  const maxCapacity = Number(turn?.maxCapacity) || DEFAULT_MAX_CAPACITY;
  const occupiedCount = activeReservations.length;
  const isFull = occupiedCount >= maxCapacity;
  const isCancelled = turn?.estado === 'cancelado';

  return (
    <dialog
      ref={dialogRef}
      data-testid="turn-detail-dialog"
      aria-labelledby="turn-detail-title"
      onClose={onClose}
      className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-2xl w-[calc(100%-2rem)] text-on-surface m-auto"
    >
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Detalle del Turno • {turn?.dateKey}
          </span>
          <h2
            id="turn-detail-title"
            data-testid="turn-detail-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5"
          >
            {turn ? `${turn.startTime} hs (${turn.durationMinutes} min)` : 'Turno'}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Cupos ocupados: <strong className="text-primary">{occupiedCount} / {maxCapacity}</strong> •{' '}
            {turn?.instructorName || 'Profesora Titular'}
          </p>
        </div>

        <button
          type="button"
          data-testid="turn-detail-close-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
          aria-label="Cerrar modal"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {isCancelled ? (
        <TurnCancelledNotice
          turn={turn}
          isMutating={isMutating}
          onClose={onClose}
          onReopenTurn={onReopenTurn}
        />
      ) : (
        <div className="mt-4 space-y-5">
          <TurnAssignForm
            turnId={turn?.id}
            availableStudents={availableStudents}
            isFull={isFull}
            isMutating={isMutating}
            onAssignStudent={onAssignStudent}
          />

          <TurnReservationsList
            activeReservations={activeReservations}
            occupiedCount={occupiedCount}
            isMutating={isMutating}
            onMarkAttendance={onMarkAttendance}
            onRemoveReservation={onRemoveReservation}
          />

          <div className="pt-3 border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isMutating}
                data-testid="turn-cancel-shift-btn"
                onClick={async () => {
                  const ok = await onCancelTurn(turn.id, 'Cancelado por el estudio');
                  if (ok) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-label-md text-[13px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon name="event_busy" className="text-[18px]" />
                <span>Cancelar turno</span>
              </button>

              <button
                type="button"
                disabled={isMutating}
                data-testid="turn-delete-shift-btn"
                onClick={async () => {
                  const ok = await onDeleteTurn(turn);
                  if (ok) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-label-md text-[13px] font-semibold text-error hover:bg-error-container/60 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon name="delete" className="text-[18px]" />
                <span>Eliminar de este día</span>
              </button>
            </div>

            <Button type="button" variant="outline" size="md" onClick={onClose}>
              <span>Cerrar</span>
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
