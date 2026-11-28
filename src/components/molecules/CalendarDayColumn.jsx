import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import DayActionsMenu from './DayActionsMenu';
import {
  DEFAULT_MAX_CAPACITY,
  formatBlockEndLabel,
  isTurnBookingOpen,
} from '../../utils/scheduleUtils';

function getAdminTurnMeta(turn, reservations) {
  const activeCount = reservations.filter(
    (r) => r.turnoId === turn.id && r.estado === 'confirmada'
  ).length;
  const maxCap = Number(turn.maxCapacity) || DEFAULT_MAX_CAPACITY;
  const cancelled = turn.estado === 'cancelado';
  const isFull = activeCount >= maxCap;
  return { activeCount, maxCap, cancelled, isFull };
}

function getAdminTurnClasses({ cancelled, isFull }) {
  if (cancelled) {
    return 'bg-error-container/35 border-error/60 hover:border-error hover:shadow-xs cursor-pointer';
  }
  if (isFull) {
    return 'bg-amber-50 border-amber-300 hover:shadow-xs cursor-pointer';
  }
  return 'bg-surface-container-low border-surface-container-high hover:border-secondary/60 hover:shadow-xs cursor-pointer';
}

function CustomerDayBody({
  dayDateKey,
  todayKey,
  visibleTurns,
  isDayBooked = false,
  isBookingBlocked = false,
  onOpenTurnDetail,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isPastDay = Boolean(todayKey && dayDateKey < todayKey);

  if (isPastDay) {
    return (
      <div
        data-testid={`customer-day-disabled-${dayDateKey}`}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-surface-container/60 border border-surface-container-high text-on-surface-variant opacity-65 text-center"
      >
        <span className="text-body-sm font-medium">Día pasado</span>
      </div>
    );
  }

  if (isDayBooked) {
    return (
      <div
        data-testid={`customer-day-booked-${dayDateKey}`}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-surface-container/60 border border-surface-container-high text-on-surface-variant opacity-75 text-center"
      >
        <span className="text-body-sm font-medium">Ya tenés un turno reservado</span>
      </div>
    );
  }

  if (isBookingBlocked) {
    return (
      <div
        data-testid={`customer-day-blocked-${dayDateKey}`}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-surface-container/60 border border-surface-container-high text-on-surface-variant opacity-75 text-center"
      >
        <span className="text-body-sm font-medium">Pago pendiente de confirmación</span>
      </div>
    );
  }

  const availableTurns = visibleTurns.filter((turn) => {
    if (turn.estado === 'cancelado') return false;
    if (!isTurnBookingOpen(dayDateKey, turn.startTime)) return false;
    const occupied = Number(turn.cuposOcupados) || 0;
    const maxCap = Number(turn.maxCapacity) || DEFAULT_MAX_CAPACITY;
    return occupied < maxCap;
  });

  if (availableTurns.length === 0) {
    return (
      <div
        data-testid={`customer-day-empty-${dayDateKey}`}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-surface-container/50 border border-surface-container-high text-on-surface-variant text-center"
      >
        <span className="text-body-sm">Sin turnos disponibles</span>
      </div>
    );
  }

  const count = availableTurns.length;
  const summaryLabel = `${count} ${count === 1 ? 'turno disponible' : 'turnos disponibles'}`;

  return (
    <div className="flex-1 flex flex-col gap-2">
      <button
        type="button"
        data-testid={`customer-day-toggle-${dayDateKey}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3 rounded-xl bg-secondary-container/45 border border-secondary/30 hover:border-secondary/60 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
      >
        <span className="font-label-md text-label-md font-semibold text-primary leading-snug">
          {summaryLabel}
        </span>
        <Icon
          name={isOpen ? 'expand_less' : 'expand_more'}
          className="text-[20px] text-secondary shrink-0"
        />
      </button>

      {isOpen && (
        <div
          data-testid={`customer-day-dropdown-${dayDateKey}`}
          className="space-y-1.5 pt-1"
        >
          {availableTurns.map((turn) => {
            const occupied = Number(turn.cuposOcupados) || 0;
            const maxCap = Number(turn.maxCapacity) || DEFAULT_MAX_CAPACITY;

            return (
              <button
                key={turn.id}
                type="button"
                data-testid={`calendar-turn-card-${turn.id}`}
                onClick={() => onOpenTurnDetail?.(turn)}
                className="w-full text-left p-2.5 rounded-xl border bg-surface-container-low border-surface-container-high hover:border-secondary/60 hover:shadow-xs transition-[border-color,box-shadow] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="font-semibold text-body-md text-primary">
                    {turn.startTime}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 shrink-0">
                    {`${occupied}/${maxCap}`}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Sesion de {turn.durationMinutes} min
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminDayBody({ visibleTurns, reservations, onOpenTurnDetail }) {
  if (visibleTurns.length === 0) {
    return (
      <p className="text-center py-6 text-body-sm text-on-surface-variant">
        Sin turnos
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {visibleTurns.map((turn) => {
        const meta = getAdminTurnMeta(turn, reservations);

        return (
          <button
            key={turn.id}
            type="button"
            data-testid={`calendar-turn-card-${turn.id}`}
            onClick={() => onOpenTurnDetail?.(turn)}
            className={`w-full text-left p-2.5 rounded-xl border transition-[border-color,box-shadow] ${getAdminTurnClasses(meta)}`}
          >
            <div className="flex items-center justify-between gap-1 min-w-0">
              <span
                className={`font-semibold text-body-md ${
                  meta.cancelled ? 'text-error line-through' : 'text-primary'
                }`}
              >
                {turn.startTime}
              </span>
              {meta.cancelled ? (
                <span
                  title="Turno cancelado"
                  aria-label="Turno cancelado"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-[11px] font-bold shrink-0"
                >
                  ✕
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 shrink-0">
                  {`${meta.activeCount}/${meta.maxCap}`}
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
  bookedDateKeys = null,
  isBookingBlocked = false,
  isAdmin = false,
  mode = 'admin',
  onOpenClosedDayModal,
  onClearDayTurns,
  onOpenTurnDetail,
}) {
  const visibleTurns = dayTurns.filter((t) => t.estado !== 'inhabilitado');
  const isPastCustomerDay = mode === 'customer' && Boolean(todayKey && day.dateKey < todayKey);

  const columnClasses = closedInfo
    ? 'bg-error-container/25 border-error/30'
    : isToday
    ? 'bg-surface-container-lowest border-secondary ring-2 ring-secondary/35 shadow-[0_0_20px_rgba(143,92,72,0.22)]'
    : 'bg-surface-container-lowest border-surface-container-high';

  return (
    <section
      data-testid={`calendar-day-col-${day.dateKey}`}
      data-today={isToday ? 'true' : 'false'}
      className={`relative h-full ${
        isPastCustomerDay ? 'hidden md:flex' : 'flex'
      } flex-col rounded-2xl border p-3 space-y-3 min-h-0 md:min-h-44 min-w-0 transition-shadow ${columnClasses}`}
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
      ) : mode === 'customer' ? (
        <CustomerDayBody
          dayDateKey={day.dateKey}
          todayKey={todayKey}
          visibleTurns={visibleTurns}
          isDayBooked={Boolean(bookedDateKeys?.has(day.dateKey))}
          isBookingBlocked={isBookingBlocked}
          onOpenTurnDetail={onOpenTurnDetail}
        />
      ) : (
        <AdminDayBody
          visibleTurns={visibleTurns}
          reservations={reservations}
          onOpenTurnDetail={onOpenTurnDetail}
        />
      )}
    </section>
  );
}
