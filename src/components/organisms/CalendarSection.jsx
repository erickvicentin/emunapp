import React, { useMemo, useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import BaseScheduleModal from '../molecules/BaseScheduleModal';
import CustomTurnModal from '../molecules/CustomTurnModal';
import ClosedDayModal from '../molecules/ClosedDayModal';
import TurnDetailModal from '../molecules/TurnDetailModal';
import WeeklyCalendarGrid from './WeeklyCalendarGrid';
import { formatDateKey, getWeekStartMonday } from '../../utils/scheduleUtils';

const EMPTY_STUDENTS = [];

/**
 * CalendarSection Organism
 * Weekly Mon-Sun calendar view for managing shifts, base schedule, closed days, and attendance.
 */
export default function CalendarSection({
  isAdmin = false,
  students = EMPTY_STUDENTS,
  calendar,
}) {
  const baseDialogRef = useRef(null);
  const customTurnDialogRef = useRef(null);
  const closedDayDialogRef = useRef(null);
  const turnDetailDialogRef = useRef(null);

  const [selectedDayForClose, setSelectedDayForClose] = useState(null);
  const [selectedTurnId, setSelectedTurnId] = useState(null);

  const {
    weekDays,
    baseSlots,
    closedDaysMap,
    turns,
    reservations,
    isLoading,
    isMutating,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    saveBaseSchedule,
    addCustomTurn,
    cancelTurn,
    deleteTurn,
    closeDay,
    reopenDay,
    assignStudent,
    removeReservation,
    markAttendance,
  } = calendar;

  const selectedTurn = useMemo(
    () => turns.find((t) => t.id === selectedTurnId) || null,
    [turns, selectedTurnId]
  );

  const openTurnDetail = (turn) => {
    setSelectedTurnId(turn.id);
    turnDetailDialogRef.current?.showModal();
  };

  const openClosedDayModal = (day) => {
    setSelectedDayForClose(day);
    closedDayDialogRef.current?.showModal();
  };

  const weekRangeLabel =
    weekDays.length === 7
      ? `${weekDays[0].displayDate} al ${weekDays[6].displayDate}`
      : '';

  const todayKey = formatDateKey(new Date());
  const currentWeekStartKey = formatDateKey(getWeekStartMonday(new Date()));
  const isCurrentWeek = weekDays[0]?.dateKey === currentWeekStartKey;
  const weekSelectorLabel = isCurrentWeek
    ? 'Semana en curso'
    : `Semana ${weekRangeLabel}`;

  return (
    <div data-testid="calendar-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración
          </span>
          <h1
            data-testid="calendar-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Calendario y Turnos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Agenda semanal de Lunes a Domingo (4 cupos por horario, clases de 50 min).
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-64 shrink-0">
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

          <Button
            type="button"
            variant="primary"
            size="sm"
            data-testid="calendar-add-turn-btn"
            onClick={() => customTurnDialogRef.current?.showModal()}
            className="w-full h-10 justify-center gap-1.5"
          >
            <Icon name="add" className="text-[18px]" />
            <span>Agregar turno</span>
          </Button>

          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="calendar-base-schedule-btn"
              onClick={() => baseDialogRef.current?.showModal()}
              className="w-full h-10 justify-center gap-1.5 bg-surface-container-lowest"
            >
              <Icon name="tune" className="text-[18px]" />
              <span>Grilla Base</span>
            </Button>
          )}
        </div>
      </section>

      <WeeklyCalendarGrid
        weekDays={weekDays}
        todayKey={todayKey}
        weekSelectorLabel={weekSelectorLabel}
        closedDaysMap={closedDaysMap}
        turns={turns}
        reservations={reservations}
        isLoading={isLoading}
        isAdmin={isAdmin}
        mode="admin"
        onPrevWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onOpenClosedDayModal={openClosedDayModal}
        onClearDayTurns={calendar.clearDayTurns}
        onOpenTurnDetail={openTurnDetail}
      />

      {isAdmin && (
        <BaseScheduleModal
          dialogRef={baseDialogRef}
          baseSlots={baseSlots}
          isMutating={isMutating}
          onClose={() => baseDialogRef.current?.close()}
          onSaveSchedule={saveBaseSchedule}
        />
      )}

      <CustomTurnModal
        dialogRef={customTurnDialogRef}
        weekDays={weekDays}
        closedDaysMap={closedDaysMap}
        isMutating={isMutating}
        onClose={() => customTurnDialogRef.current?.close()}
        onSubmit={addCustomTurn}
      />

      {isAdmin && (
        <ClosedDayModal
          dialogRef={closedDayDialogRef}
          targetDay={selectedDayForClose}
          closedInfo={
            selectedDayForClose ? closedDaysMap[selectedDayForClose.dateKey] : null
          }
          isMutating={isMutating}
          onClose={() => closedDayDialogRef.current?.close()}
          onMarkClosed={closeDay}
          onReopen={reopenDay}
        />
      )}

      <TurnDetailModal
        dialogRef={turnDetailDialogRef}
        turn={selectedTurn}
        reservations={reservations}
        students={students}
        isMutating={isMutating}
        onClose={() => turnDetailDialogRef.current?.close()}
        onAssignStudent={assignStudent}
        onRemoveReservation={removeReservation}
        onMarkAttendance={markAttendance}
        onCancelTurn={cancelTurn}
        onReopenTurn={calendar.reopenTurn}
        onDeleteTurn={deleteTurn}
      />
    </div>
  );
}
