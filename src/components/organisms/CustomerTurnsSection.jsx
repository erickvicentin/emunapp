import React, { useMemo, useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import WeeklyCalendarGrid from './WeeklyCalendarGrid';
import CustomerBookTurnModal from '../molecules/CustomerBookTurnModal';
import CustomerUpcomingTurns from '../molecules/CustomerUpcomingTurns';
import CustomerReservationPaymentModal from '../molecules/CustomerReservationPaymentModal';
import { formatDateKey, getWeekStartMonday } from '../../utils/scheduleUtils';

const ACTIVE_BOOKING_STATES = new Set([
  'confirmada',
  'esperando_comprobante',
  'pendiente_confirmacion',
]);

/**
 * CustomerTurnsSection Organism
 * Displays the weekly read-only calendar for students, booking confirmation modal,
 * and upcoming reservations list below the calendar.
 */
export default function CustomerTurnsSection({ calendar }) {
  const bookDialogRef = useRef(null);
  const reportDialogRef = useRef(null);
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const {
    weekDays,
    closedDaysMap,
    turns,
    totalCredits,
    upcomingReservations,
    cobrosConfig,
    individualPackage,
    isLoading,
    isMutating,
    loadError,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    bookTurn,
    reportReservationPayment,
  } = calendar;

  const [todayKey] = useState(() => formatDateKey(new Date()));
  const [currentWeekStartKey] = useState(() => formatDateKey(getWeekStartMonday(new Date())));

  const bookedDateKeys = useMemo(
    () =>
      new Set(
        upcomingReservations
          .filter((r) => ACTIVE_BOOKING_STATES.has(r.estado))
          .map((r) => r.dateKey)
      ),
    [upcomingReservations]
  );

  const hasPendingSinglePayment = useMemo(
    () => upcomingReservations.some((r) => r.estado === 'esperando_comprobante'),
    [upcomingReservations]
  );

  const weekRangeLabel =
    weekDays.length === 7
      ? `${weekDays[0].displayDate} al ${weekDays[6].displayDate}`
      : '';

  const isCurrentWeek = weekDays[0]?.dateKey === currentWeekStartKey;
  const weekSelectorLabel = isCurrentWeek
    ? 'Semana en curso'
    : `Semana ${weekRangeLabel}`;

  const handleOpenBookModal = (turn) => {
    setSelectedTurn(turn);
    bookDialogRef.current?.showModal();
  };

  const handleCloseBookModal = () => {
    bookDialogRef.current?.close();
    setSelectedTurn(null);
  };

  const handleConfirmBooking = async (turn) => {
    const ok = await bookTurn(turn);
    if (ok) {
      handleCloseBookModal();
    }
  };

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

      {hasPendingSinglePayment && (
        <div
          data-testid="customer-pending-payment-block-banner"
          className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-body-sm flex items-start gap-2.5"
        >
          <Icon name="info" className="text-[20px] shrink-0 mt-0.5" />
          <span>
            Tenés una reserva pendiente de confirmación de pago por clase individual. No podés realizar otra reserva hasta que se apruebe el pago.
          </span>
        </div>
      )}

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
        bookedDateKeys={bookedDateKeys}
        isBookingBlocked={hasPendingSinglePayment}
        isLoading={isLoading}
        isAdmin={false}
        mode="customer"
        onPrevWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onOpenTurnDetail={handleOpenBookModal}
      />

      <CustomerUpcomingTurns
        reservations={upcomingReservations}
        onReportPayment={(res) => {
          setSelectedReservation(res);
          reportDialogRef.current?.showModal();
        }}
      />

      <CustomerBookTurnModal
        dialogRef={bookDialogRef}
        turn={selectedTurn}
        totalCredits={totalCredits}
        cobrosConfig={cobrosConfig}
        individualPackage={individualPackage}
        isMutating={isMutating}
        onClose={handleCloseBookModal}
        onConfirm={handleConfirmBooking}
      />

      <CustomerReservationPaymentModal
        dialogRef={reportDialogRef}
        reservation={selectedReservation}
        individualPackage={individualPackage}
        cobrosConfig={cobrosConfig}
        isMutating={isMutating}
        onClose={() => {
          reportDialogRef.current?.close();
          setSelectedReservation(null);
        }}
        onSubmit={reportReservationPayment}
      />
    </div>
  );
}
