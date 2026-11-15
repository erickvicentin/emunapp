import React from 'react';
import DayActionsMenu from './DayActionsMenu';
import { DEFAULT_MAX_CAPACITY, formatBlockEndLabel } from '../../utils/scheduleUtils';

/**
 * CalendarDayColumn Molecule
 * Renders a single day column in the Mon-Sun weekly schedule grid.
 */
export default function CalendarDayColumn({
  day,
  isToday = false,
  closedInfo,
  dayTurns = [],
  reservations = [],
  isAdmin = false,
  onOpenClosedDayModal,
  onClearDayTurns,
  onOpenTurnDetail,
}) {
  const visibleTurns = dayTurns.filter((t) => t.estado !== 'inhabilitado');

  const columnClasses = closedInfo
    ? 'bg-error-container/25 border-error/30'
    : isToday
    ? 'bg-surface-container-lowest border-secondary ring-2 ring-secondary/35 shadow-[0_0_20px_rgba(143,92,72,0.22)]'
    : 'bg-surface-container-lowest border-surface-container-high';

  return (
    <section
      data-testid={`calendar-day-col-${day.dateKey}`}
      data-today={isToday ? 'true' : 'false'}
      className={`relative rounded-2xl border p-3 space-y-3 min-h-60 min-w-0 transition-shadow ${columnClasses}`}
    >
      <div className="flex items-start justify-between gap-1.5 pb-2 border-b border-surface-container min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <p className="font-label-md text-label-md text-primary font-semibold truncate">
              {day.label}
            </p>
            {isToday && (
              <span
                data-testid="calendar-today-badge"
                className="px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-semibold uppercase tracking-wide shrink-0"
              >
                Hoy
              </span>
            )}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {day.displayDate}
          </p>
        </div>

        {isAdmin && (
          <DayActionsMenu
            day={day}
            closedInfo={closedInfo}
            hasVisibleTurns={visibleTurns.length > 0}
            onOpenClosedDayModal={onOpenClosedDayModal}
            onClearDayTurns={onClearDayTurns}
          />
        )}
      </div>

      {closedInfo ? (
        <div
          data-testid={`calendar-closed-banner-${day.dateKey}`}
          className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm space-y-1"
        >
          <p className="font-semibold">Cerrado</p>
          <p>{closedInfo.reason}</p>
        </div>
      ) : visibleTurns.length === 0 ? (
        <p className="text-center py-6 text-body-sm text-on-surface-variant">
          Sin turnos
        </p>
      ) : (
        <div className="space-y-2">
          {visibleTurns.map((turn) => {
            const activeCount = reservations.filter(
              (r) => r.turnoId === turn.id && r.estado === 'confirmada'
            ).length;
            const maxCap = Number(turn.maxCapacity) || DEFAULT_MAX_CAPACITY;
            const cancelled = turn.estado === 'cancelado';

            return (
              <button
                key={turn.id}
                type="button"
                data-testid={`calendar-turn-card-${turn.id}`}
                onClick={() => onOpenTurnDetail(turn)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  cancelled
                    ? 'bg-error-container/35 border-error/60 hover:border-error hover:shadow-xs'
                    : activeCount >= maxCap
                    ? 'bg-amber-50 border-amber-300 hover:shadow-xs'
                    : 'bg-surface-container-low border-surface-container-high hover:border-secondary/60 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span
                    className={`font-semibold text-body-md ${
                      cancelled ? 'text-error line-through' : 'text-primary'
                    }`}
                  >
                    {turn.startTime}
                  </span>
                  {cancelled ? (
                    <span
                      title="Turno cancelado"
                      aria-label="Turno cancelado"
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-[11px] font-bold shrink-0"
                    >
                      ✕
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 shrink-0">
                      {`${activeCount}/${maxCap}`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  {turn.startTime}–{formatBlockEndLabel(turn.startTime)} ({turn.durationMinutes} min)
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
