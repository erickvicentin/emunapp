import React from 'react';
import { formatHistoryDate, getAttendanceMeta } from '../../utils/scheduleUtils';

/**
 * CustomerHistoryTable Molecule
 * Desktop table view for past confirmed classes (Date, Time, Attendance only).
 */
export default function CustomerHistoryTable({ classes = [] }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-labelledby="customer-history-table-caption"
      data-testid="customer-history-list"
      className="hidden md:block rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs overflow-x-auto"
    >
      <table
        data-testid="customer-history-table"
        className="w-full text-left border-collapse"
      >
        <caption id="customer-history-table-caption" className="sr-only">
          Historial de clases confirmadas y asistencia
        </caption>
        <thead className="sticky top-0 z-10 bg-surface-container-low">
          <tr className="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
            <th scope="col" className="py-3 px-4 font-semibold">Fecha</th>
            <th scope="col" className="py-3 px-4 font-semibold">Hora del turno</th>
            <th scope="col" className="py-3 px-4 font-semibold text-right">Asistencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {classes.map((item) => {
            const badge = getAttendanceMeta(item.asistencia);
            return (
              <tr
                key={item.id}
                data-testid={`customer-history-row-${item.id}`}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                <td
                  data-testid={`customer-history-date-${item.id}`}
                  className="py-3.5 px-4 text-body-sm font-medium text-primary whitespace-nowrap"
                >
                  {formatHistoryDate(item.dateKey)}
                </td>
                <td
                  data-testid={`customer-history-time-${item.id}`}
                  className="py-3.5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap"
                >
                  {item.startTime ? `${item.startTime} hs` : '-'}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <span
                    data-testid={`customer-history-attendance-${item.id}`}
                    className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
