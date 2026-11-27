import React from 'react';
import Icon from '../atoms/Icon';
import CalendarDayColumn from '../molecules/CalendarDayColumn';

const SKELETON_COL_IDS = ['col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7'];
const EMPTY_RESERVATIONS = [];

/**
 * WeeklyCalendarGrid Organism
 * Shared week navigation bar, loading skeleton, and Mon-Sun grid used by both
 * Administrator and Customer panels.
 */
export default function WeeklyCalendarGrid({
  weekDays,
  todayKey,
  weekSelectorLabel,
  closedDaysMap,
  turns,
  reservations = EMPTY_RESERVATIONS,
  bookedDateKeys = null,
  isBookingBlocked = false,
  isLoading = false,
  isAdmin = false,
  mode = 'admin',
  onPrevWeek,
  onNextWeek,
  onOpenClosedDayModal,
  onClearDayTurns,
  onOpenTurnDetail,
}) {
  return (
    <>
      <div className="w-full h-11 inline-flex items-center justify-between rounded-2xl border border-surface-container-high bg-surface-container-lowest px-2 shadow-2xs">
        <button
          type="button"
          data-testid="calendar-prev-week-btn"
          onClick={onPrevWeek}
          className="inline-flex items-center justify-center w-9 h-8 rounded-xl text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
          aria-label="Semana anterior"
        >
          <Icon name="chevron_left" className="text-[22px]" />
        </button>
        <span
          data-testid="calendar-week-range"
          className="font-label-lg text-label-lg font-semibold text-primary text-center truncate px-3"
        >
          {weekSelectorLabel}
        </span>
        <button
          type="button"
          data-testid="calendar-next-week-btn"
          onClick={onNextWeek}
          className="inline-flex items-center justify-center w-9 h-8 rounded-xl text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
          aria-label="Semana siguiente"
        >
          <Icon name="chevron_right" className="text-[22px]" />
        </button>
      </div>

      {isLoading ? (
        <div
          data-testid="calendar-loading-skeleton"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3"
        >
          {SKELETON_COL_IDS.map((id) => (
            <div
              key={id}
              className="h-72 rounded-2xl bg-surface-container-lowest border border-surface-container-high p-3 animate-pulse space-y-2.5"
            >
              <div className="h-5 w-20 rounded bg-surface-container-high" />
              <div className="h-16 w-full rounded-xl bg-surface-container-high" />
              <div className="h-16 w-full rounded-xl bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid="calendar-week-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-stretch"
        >
          {weekDays.map((day) => (
            <CalendarDayColumn
              key={day.dateKey}
              day={day}
              isToday={day.dateKey === todayKey}
              todayKey={todayKey}
              closedInfo={closedDaysMap[day.dateKey]}
              dayTurns={turns.filter((t) => t.dateKey === day.dateKey)}
              reservations={reservations}
              bookedDateKeys={bookedDateKeys}
              isBookingBlocked={isBookingBlocked}
              isAdmin={isAdmin}
              mode={mode}
              onOpenClosedDayModal={onOpenClosedDayModal}
              onClearDayTurns={onClearDayTurns}
              onOpenTurnDetail={onOpenTurnDetail}
            />
          ))}
        </div>
      )}
    </>
  );
}
