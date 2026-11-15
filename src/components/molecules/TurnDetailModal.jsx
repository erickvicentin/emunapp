import React, { useMemo, useState } from 'react';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import SelectChevron from '../atoms/SelectChevron';
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
  const [selectedStudentId, setSelectedStudentId] = useState('');

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

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!turn || !selectedStudentId) return;
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;
    const ok = await onAssignStudent(turn.id, student);
    if (ok) setSelectedStudentId('');
  };

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
      ) : (
        <div className="mt-4 space-y-5">
          {/* Assign student form */}
          <form
            onSubmit={handleAssign}
            className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="turn-assign-student-select"
                className="block font-label-md text-label-md text-on-surface mb-1"
              >
                Asignar alumno al turno (consume crédito si tiene, sino asigna igual)
              </label>
              <div className="relative w-full">
                <select
                  id="turn-assign-student-select"
                  data-testid="turn-assign-student-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={isFull || isMutating}
                  className="w-full appearance-none rounded-xl bg-surface-container-lowest border border-outline-variant pl-3 pr-10 py-2.5 text-body-md disabled:opacity-50 cursor-pointer"
                >
                  <option value="">
                    {isFull ? 'Turno completo (4/4 cupos)' : 'Seleccioná un alumno...'}
                  </option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nombreApellido} {student.dni ? `(${student.dni})` : ''}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!selectedStudentId || isFull || isMutating}
              data-testid="turn-assign-submit-btn"
            >
              <span>Asignar</span>
            </Button>
          </form>

          {/* Assigned students list */}
          <div className="space-y-2">
            <h3 className="font-label-md text-label-md text-primary font-semibold">
              Alumnos inscriptos ({occupiedCount})
            </h3>
            {activeReservations.length === 0 ? (
              <p
                data-testid="turn-empty-reservations"
                className="text-center py-6 rounded-xl bg-surface-container-low text-body-md text-on-surface-variant"
              >
                Todavía no hay alumnos asignados a este horario.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activeReservations.map((res) => (
                  <div
                    key={res.id}
                    data-testid={`turn-reservation-row-${res.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high"
                  >
                    <div>
                      <p className="font-semibold text-primary text-body-md">
                        {res.alumnoNombre}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge
                          variant={
                            res.asistencia === 'presente'
                              ? 'success'
                              : res.asistencia === 'ausente'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {res.asistencia === 'presente'
                            ? 'Presente'
                            : res.asistencia === 'ausente'
                            ? 'Ausente'
                            : 'Pendiente'}
                        </Badge>
                        {res.origen === 'admin_sin_cupo' && (
                          <Badge variant="warning">Asignado sin cupo</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isMutating}
                        data-testid={`turn-present-btn-${res.id}`}
                        onClick={() => onMarkAttendance(res, 'presente')}
                        className={`px-2.5 py-1 rounded-full text-label-sm font-semibold cursor-pointer ${
                          res.asistencia === 'presente'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        Presente
                      </button>
                      <button
                        type="button"
                        disabled={isMutating}
                        data-testid={`turn-absent-btn-${res.id}`}
                        onClick={() => onMarkAttendance(res, 'ausente')}
                        className={`px-2.5 py-1 rounded-full text-label-sm font-semibold cursor-pointer ${
                          res.asistencia === 'ausente'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        Ausente
                      </button>
                      <button
                        type="button"
                        disabled={isMutating}
                        data-testid={`turn-remove-res-btn-${res.id}`}
                        onClick={() => onRemoveReservation(res)}
                        aria-label={`Quitar a ${res.alumnoNombre}`}
                        className="p-1.5 rounded-lg text-error hover:bg-error-container/60 cursor-pointer"
                      >
                        <Icon name="person_remove" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
