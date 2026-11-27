import React from 'react';
import DayActionsMenu from './DayActionsMenu';
import {
  DEFAULT_MAX_CAPACITY,
  formatBlockEndLabel,
  isTurnBookingOpen,
} from '../../utils/scheduleUtils';

function getTurnCardMeta({ turn, dayDateKey, todayKey, mode, reservations }) {
  const activeCount =
    mode === 'customer'
      ? Number(turn.cuposOcupados) || 0
      : reservations.filter((r) => r.turnoId === turn.id && r.estado === 'confirmada').length;
  const maxCap = Number(turn.maxCapacity) || DEFAULT_MAX_CAPACITY;
  const cancelled = turn.estado === 'cancelado';

  if (mode !== 'customer') {
    const isFull = activeCount >= maxCap;
    return {
      activeCount,
      maxCap,
      cancelled,
      isPastDay: false,
      isCutoffPassed: false,
      isFull,
      isDisabled: false,
    };
  }

  const isPastDay = Boolean(todayKey && dayDateKey < todayKey);
  const isCutoffPassed = !isPastDay && !isTurnBookingOpen(dayDateKey, turn.startTime);
  const isFull = !isPastDay && !isCutoffPassed && activeCount >= maxCap;
  return {
    activeCount,
    maxCap,
    cancelled,
    isPastDay,
    isCutoffPassed,
    isFull,
    isDisabled: isPastDay || isCutoffPassed || isFull || cancelled,
  };
}

function getTurnCardClasses({ cancelled, isPastDay, isCutoffPassed, isFull, isDisabled }) {
  if (cancelled) {
    return isDisabled
      ? 'bg-error-container/35 border-error/60 opacity-60 cursor-not-allowed'
      : 'bg-error-container/35 border-error/60 hover:border-error hover:shadow-xs cursor-pointer';
  }
  if (isPastDay || isCutoffPassed) {
    return 'bg-surface-container/60 border-surface-container-high text-on-surface-variant opacity-55 cursor-not-allowed';
  }
  if (isFull) {
    return isDisabled
      ? 'bg-amber-50/70 border-amber-200 opacity-75 cursor-not-allowed'
      : 'bg-amber-50 border-amber-300 hover:shadow-xs cursor-pointer';
  }
  return 'bg-surface-container-low border-surface-container-high hover:border-secondary/60 hover:shadow-xs cursor-pointer';
}

function TurnRightBadge({ cancelled, mode, isPastDay, isCutoffPassed, isFull, activeCount, maxCap }) {
  if (cancelled) {
    return (
      <span
        title="Turno cancelado"
        aria-label="Turno cancelado"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-[11px] font-bold shrink-0"
      >
        ✕
      </span>
    );
  }
  if (mode === 'customer' && (isPastDay || isCutoffPassed)) {
    return null;
  }
  if (mode === 'customer' && isFull) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
        Cupo lleno
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 shrink-0">
      {`${activeCount}/${maxCap}`}
    </span>
  );
}

/**
 * CalendarDayColumn Molecule
 * Renders a single day column in the Mon-Sun weekly schedule grid.
 */
export default function CalendarDayColumn({
  day,
  isToday = false,
  todayKey = '',
  closedInfo,
  dayTurns = [],
  reservations = [],
  isAdmin = false,
  mode = 'admin',
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
            const meta = getTurnCardMeta({
              turn,
              dayDateKey: day.dateKey,
              todayKey,
              mode,
              reservations,
            });

            return (
              <button
                key={turn.id}
                type="button"
                disabled={meta.isDisabled}
                data-testid={`calendar-turn-card-${turn.id}`}
                data-past={meta.isPastDay ? 'true' : 'false'}
                data-full={meta.isFull ? 'true' : 'false'}
                onClick={() => !meta.isDisabled && onOpenTurnDetail?.(turn)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all ${getTurnCardClasses(meta)}`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span
                    className={`font-semibold text-body-md ${
                      meta.cancelled
                        ? 'text-error line-through'
                        : meta.isDisabled
                        ? 'text-on-surface-variant'
                        : 'text-primary'
                    }`}
                  >
                    {turn.startTime}
                  </span>
                  <TurnRightBadge
                    cancelled={meta.cancelled}
                    mode={mode}
                    isPastDay={meta.isPastDay}
                    isCutoffPassed={meta.isCutoffPassed}
                    isFull={meta.isFull}
                    activeCount={meta.activeCount}
                    maxCap={meta.maxCap}
                  />
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
