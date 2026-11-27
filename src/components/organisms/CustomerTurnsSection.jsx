import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import WeeklyCalendarGrid from './WeeklyCalendarGrid';
import { formatDateKey, getWeekStartMonday } from '../../utils/scheduleUtils';

/**
 * CustomerTurnsSection Organism
 * Displays the weekly read-only calendar for students, disabling past days,
 * turns within 10 min of start, and full turns.
 */
export default function CustomerTurnsSection({ calendar }) {
  const {
    weekDays,
    closedDaysMap,
    turns,
    isLoading,
    loadError,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = calendar;

  const [todayKey] = useState(() => formatDateKey(new Date()));
  const [currentWeekStartKey] = useState(() => formatDateKey(getWeekStartMonday(new Date())));

  const weekRangeLabel =
    weekDays.length === 7
      ? `${weekDays[0].displayDate} al ${weekDays[6].displayDate}`
      : '';

  const isCurrentWeek = weekDays[0]?.dateKey === currentWeekStartKey;
  const weekSelectorLabel = isCurrentWeek
    ? 'Semana en curso'
    : `Semana ${weekRangeLabel}`;

  return (
    <div data-testid="customer-turns-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Espacio Alumna • Emuná Pilates
          </span>
          <h1
            data-testid="customer-turns-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Turnos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Consultá los horarios disponibles desde hoy en adelante. Podés reservar hasta 10 minutos antes del inicio de cada clase.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-56 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="calendar-today-btn"
            onClick={goToCurrentWeek}
            disabled={isCurrentWeek}
            className="w-full h-10 justify-center gap-1.5 bg-surface-container-lowest disabled:opacity-50"
          >
            <Icon name="today" className="text-[18px]" />
            <span>Ir a semana actual</span>
          </Button>
        </div>
      </section>

      {loadError && (
        <div
          data-testid="customer-turns-error"
          className="p-4 rounded-xl bg-error-container text-on-error-container text-body-sm"
        >
          {loadError}
        </div>
      )}

      <WeeklyCalendarGrid
        weekDays={weekDays}
        todayKey={todayKey}
        weekSelectorLabel={weekSelectorLabel}
        closedDaysMap={closedDaysMap}
        turns={turns}
        isLoading={isLoading}
        isAdmin={false}
        mode="customer"
        onPrevWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />
    </div>
  );
}
