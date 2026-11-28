import React, { useMemo, useState } from 'react';
import Icon from '../atoms/Icon';
import CustomerHistoryMobileCard from '../molecules/CustomerHistoryMobileCard';
import CustomerHistoryTable from '../molecules/CustomerHistoryTable';
import PaginationBar from '../molecules/PaginationBar';
import { DEFAULT_PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { calculateAttendancePercentage, parseTurnDateTime } from '../../utils/scheduleUtils';

const EMPTY_LIST = [];

function sortDescendingByTurn(a, b) {
  if (a.dateKey !== b.dateKey) {
    return String(b.dateKey || '').localeCompare(String(a.dateKey || ''));
  }
  return String(b.startTime || '').localeCompare(String(a.startTime || ''));
}

function formatAttendanceSummary(presentes, evaluadas) {
  if (evaluadas === 0) return 'Se calcula a partir de tus clases registradas';
  const presentLabel = presentes === 1 ? 'presente' : 'presentes';
  const classLabel = evaluadas === 1 ? 'clase registrada' : 'clases registradas';
  return `${presentes} ${presentLabel} de ${evaluadas} ${classLabel}`;
}

/**
 * CustomerHistorySection Organism
 * Displays the student's attendance percentage above the table and the list of
 * confirmed non-cancelled classes the student has already had (Date, Time, Attendance).
 */
export default function CustomerHistorySection({ reservations = EMPTY_LIST }) {
  const [renderedAtMs] = useState(() => Date.now());

  const pastConfirmedClasses = useMemo(
    () =>
      reservations
        .filter((res) => {
          if (res?.estado !== 'confirmada') return false;
          if (res.asistencia === 'presente' || res.asistencia === 'ausente') {
            return true;
          }
          return parseTurnDateTime(res.dateKey, res.startTime).getTime() <= renderedAtMs;
        })
        .sort(sortDescendingByTurn),
    [reservations, renderedAtMs]
  );

  const attendancePercentage = useMemo(
    () => calculateAttendancePercentage(reservations),
    [reservations]
  );

  const attendanceCounts = useMemo(() => {
    let presentes = 0;
    let ausentes = 0;
    for (const item of pastConfirmedClasses) {
      if (item.asistencia === 'presente') presentes += 1;
      else if (item.asistencia === 'ausente') ausentes += 1;
    }
    return { presentes, ausentes, evaluadas: presentes + ausentes };
  }, [pastConfirmedClasses]);

  const pagination = usePagination(pastConfirmedClasses, DEFAULT_PAGE_SIZE);

  return (
    <div data-testid="customer-history-section" className="space-y-5">
      <section className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-4">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Espacio Alumna • Emuná Pilates
          </span>
          <h1
            data-testid="customer-history-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Historial de Clases
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Consultá las clases confirmadas que ya tuviste y tu porcentaje de presentismo.
          </p>
        </div>

        <div
          data-testid="customer-history-attendance-card"
          className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/70 text-on-secondary-container flex items-center justify-center shrink-0">
                <Icon name="fact_check" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <span className="block font-label-md text-label-md font-semibold text-primary leading-tight">
                  Presentismo
                </span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {formatAttendanceSummary(attendanceCounts.presentes, attendanceCounts.evaluadas)}
                </span>
              </div>
            </div>

            <span
              data-testid="customer-history-attendance-percentage"
              className="shrink-0 font-headline-md text-2xl sm:text-3xl font-bold text-primary tabular-nums tracking-tight"
            >
              {attendancePercentage}%
            </span>
          </div>

          <div
            aria-hidden="true"
            className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, attendancePercentage))}%` }}
            />
          </div>
        </div>
      </section>

      {pastConfirmedClasses.length === 0 ? (
        <div
          data-testid="customer-history-empty"
          className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center space-y-2"
        >
          <p className="text-body-md text-on-surface-variant">
            Todavía no tenés clases confirmadas en tu historial.
          </p>
        </div>
      ) : (
        <>
          <div
            data-testid="customer-history-mobile-list"
            className="md:hidden space-y-3"
          >
            {pagination.paginatedItems.map((item) => (
              <CustomerHistoryMobileCard key={item.id} item={item} />
            ))}
          </div>

          <CustomerHistoryTable classes={pagination.paginatedItems} />

          <PaginationBar
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPrevPage={pagination.prevPage}
            onNextPage={pagination.nextPage}
            testIdPrefix="customer-history"
          />
        </>
      )}
    </div>
  );
}
