import React from 'react';
import { formatHistoryDate, getAttendanceMeta } from '../../utils/scheduleUtils';

/**
 * CustomerHistoryMobileCard Molecule
 * Responsive mobile card view for a past confirmed class (Date, Time, Attendance only).
 */
export default function CustomerHistoryMobileCard({ item }) {
  const badge = getAttendanceMeta(item.asistencia);

  return (
    <article
      data-testid={`customer-history-card-${item.id}`}
      className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <p
          data-testid={`customer-history-mobile-date-${item.id}`}
          className="font-semibold text-body-md text-primary leading-snug"
        >
          {formatHistoryDate(item.dateKey)}
        </p>
        <p
          data-testid={`customer-history-mobile-time-${item.id}`}
          className="text-body-sm text-on-surface-variant mt-0.5"
        >
          {item.startTime ? `${item.startTime} hs` : '-'}
        </p>
      </div>

      <span
        data-testid={`customer-history-mobile-attendance-${item.id}`}
        className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge.classes}`}
      >
        {badge.label}
      </span>
    </article>
  );
}
