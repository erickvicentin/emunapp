import React from 'react';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

function getAttendanceBadgeVariant(asistencia) {
  if (asistencia === 'presente') return 'success';
  if (asistencia === 'ausente') return 'danger';
  return 'neutral';
}

function getAttendanceBadgeLabel(asistencia) {
  if (asistencia === 'presente') return 'Presente';
  if (asistencia === 'ausente') return 'Ausente';
  return 'Pendiente';
}

/**
 * TurnReservationsList Molecule
 * Displays the list of students booked in a shift with attendance and removal actions.
 */
export default function TurnReservationsList({
  activeReservations,
  occupiedCount,
  isMutating = false,
  onMarkAttendance,
  onRemoveReservation,
}) {
  return (
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
                  <Badge variant={getAttendanceBadgeVariant(res.asistencia)}>
                    {getAttendanceBadgeLabel(res.asistencia)}
                  </Badge>
                  {res.origen === 'admin_sin_cupo' && (
                    <Badge variant="warning">Asignado sin cupo</Badge>
                  )}
                  {res.origen === 'admin_historico' && (
                    <Badge variant="neutral">Histórico (sin crédito)</Badge>
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
  );
}
