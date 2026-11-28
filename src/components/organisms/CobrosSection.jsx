import React, { useMemo, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import SelectChevron from '../atoms/SelectChevron';
import ReceiptPreviewModal from '../molecules/ReceiptPreviewModal';
import CashNoticeModal from '../molecules/CashNoticeModal';
import { formatDateKey } from '../../utils/scheduleUtils';

const EMPTY_LIST = [];

const STATUS_MAP = {
  pendiente_conciliacion: {
    label: 'Pendiente conciliación',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  aprobado: {
    label: 'Acreditado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  rechazado: {
    label: 'Rechazado',
    classes: 'bg-error-container text-on-error-container border-error/30',
  },
  vencido: {
    label: 'Vencido',
    classes: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  },
};

const FILTER_OPTIONS = [
  { id: 'todos', label: 'Todos los estados' },
  { id: 'pendiente_conciliacion', label: 'Pendientes' },
  { id: 'aprobado', label: 'Acreditados' },
  { id: 'cerrados', label: 'Rechazados / Vencidos' },
];

function toDateOrNull(value) {
  if (!value) return null;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPaymentCreatedAt(value) {
  const date = toDateOrNull(value);
  if (!date) return '-';
  return `${date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} hs`;
}

function isValidDateInput(dateStr) {
  if (!dateStr) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (y < 2020) return false;
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

function clampFourDigitYear(val) {
  if (!val) return '';
  const parts = val.split('-');
  if (parts[0] && parts[0].length > 4) {
    return [parts[0].slice(0, 4), ...parts.slice(1)].join('-');
  }
  return val;
}

function getDateRangeError(dateFrom, dateTo) {
  if (!isValidDateInput(dateFrom) || !isValidDateInput(dateTo)) {
    return 'Ingresá un rango de fechas válido (año de 4 dígitos).';
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return 'La fecha "Desde" no puede ser mayor que "Hasta".';
  }
  return '';
}

function matchesPaymentFilters(pay, filter, dateFrom, dateTo, hasDateError) {
  if (filter === 'cerrados') {
    if (pay.estado !== 'rechazado' && pay.estado !== 'vencido') return false;
  } else if (filter !== 'todos' && pay.estado !== filter) {
    return false;
  }

  if (hasDateError || (!dateFrom && !dateTo)) return true;

  const created = toDateOrNull(pay.creadoEn);
  if (!created) return false;
  const createdKey = formatDateKey(created);
  if (dateFrom && createdKey < dateFrom) return false;
  if (dateTo && createdKey > dateTo) return false;
  return true;
}

/**
 * CobrosSection Organism
 * Manages payment reconciliation table, status/date-range filters, receipt preview, and cash notices.
 */
export default function CobrosSection({
  isAdmin = false,
  paymentsManager,
  students = EMPTY_LIST,
  packages = EMPTY_LIST,
}) {
  const [filter, setFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [todayKey] = useState(() => formatDateKey(new Date()));
  const [previewPayment, setPreviewPayment] = useState(null);
  const previewDialogRef = useRef(null);
  const cashDialogRef = useRef(null);

  const {
    payments = EMPTY_LIST,
    isLoading,
    isMutating,
    approvePayment,
    rejectPayment,
    deletePayment,
    registerCashNotice,
    sweepExpired,
  } = paymentsManager;

  const dateRangeError = getDateRangeError(dateFrom, dateTo);

  const filteredPayments = useMemo(
    () =>
      payments.filter((pay) =>
        matchesPaymentFilters(pay, filter, dateFrom, dateTo, Boolean(dateRangeError))
      ),
    [payments, filter, dateFrom, dateTo, dateRangeError]
  );

  const pendingCount = payments.filter((p) => p.estado === 'pendiente_conciliacion').length;
  const approvedCount = payments.filter((p) => p.estado === 'aprobado').length;
  const hasActiveFilters = filter !== 'todos' || Boolean(dateFrom) || Boolean(dateTo);

  return (
    <div data-testid="cobros-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración
          </span>
          <h1 data-testid="cobros-title" className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
            Cobros y Conciliación
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Controlá avisos de transferencia o efectivo, comprobantes y conciliación manual dentro de las 24 hs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMutating}
            data-testid="cobros-sweep-expired-btn"
            onClick={sweepExpired}
            className="bg-surface-container-lowest"
          >
            <Icon name="schedule_send" className="text-[17px] mr-1.5" />
            <span>Limpiar vencidos</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            data-testid="cobros-register-cash-btn"
            onClick={() => cashDialogRef.current?.showModal()}
          >
            <Icon name="payments" className="text-[17px] mr-1.5" />
            <span>Registrar efectivo</span>
          </Button>
        </div>
      </section>

      <section
        data-testid="cobros-filter-tabs"
        className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <label className="space-y-1">
            <span className="block text-label-sm font-semibold text-on-surface">Estado</span>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                data-testid="cobros-filter-select"
                className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-3 pr-9 py-2 text-body-sm text-on-surface"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>

          <label className="space-y-1">
            <span className="block text-label-sm font-semibold text-on-surface">Desde</span>
            <input
              type="date"
              min="2020-01-01"
              max={todayKey}
              value={dateFrom}
              onChange={(e) => setDateFrom(clampFourDigitYear(e.target.value))}
              data-testid="cobros-date-from-input"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-label-sm font-semibold text-on-surface">Hasta</span>
            <input
              type="date"
              min="2020-01-01"
              max={todayKey}
              value={dateTo}
              onChange={(e) => setDateTo(clampFourDigitYear(e.target.value))}
              data-testid="cobros-date-to-input"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface"
            />
          </label>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="cobros-clear-filters-btn"
                onClick={() => {
                  setFilter('todos');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="bg-surface-container-lowest"
              >
                <span>Limpiar filtros</span>
              </Button>
            )}
            <p className="text-body-sm text-on-surface-variant whitespace-nowrap">
              <strong className="text-primary">{pendingCount}</strong> pendientes •{' '}
              <strong className="text-primary">{approvedCount}</strong> acreditados
            </p>
          </div>
        </div>

        {dateRangeError && (
          <p
            data-testid="cobros-date-range-error"
            className="text-body-sm text-error font-medium"
          >
            {dateRangeError}
          </p>
        )}
      </section>

      {isLoading ? (
        <div data-testid="cobros-loading" className="p-8 text-center text-body-md text-on-surface-variant">
          Cargando cobros...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div
          data-testid="cobros-empty"
          className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center text-body-md text-on-surface-variant"
        >
          No hay cobros registrados en esta vista.
        </div>
      ) : (
        <div
          data-testid="cobros-list"
          className="rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs overflow-x-auto"
        >
          <table data-testid="cobros-table" className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/70 text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 px-4 font-semibold">Fecha / Hora</th>
                <th className="py-3 px-4 font-semibold">Alumno</th>
                <th className="py-3 px-4 font-semibold">Ítem</th>
                <th className="py-3 px-4 font-semibold">Importe</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredPayments.map((pay) => {
                const badge = STATUS_MAP[pay.estado] || STATUS_MAP.pendiente_conciliacion;
                const isPending = pay.estado === 'pendiente_conciliacion';
                const isRejected = pay.estado === 'rechazado';
                const reportedAtLabel = formatPaymentCreatedAt(pay.creadoEn);

                return (
                  <tr
                    key={pay.id}
                    data-testid={`cobros-row-${pay.id}`}
                    className="hover:bg-surface-container-low/40 transition-colors"
                  >
                    <td
                      data-testid={`cobros-reported-at-${pay.id}`}
                      className="py-3.5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap"
                    >
                      {reportedAtLabel}
                    </td>
                    <td className="py-3.5 px-4 font-label-lg font-semibold text-primary">
                      {pay.alumnoNombre}
                    </td>
                    <td className="py-3.5 px-4 text-body-sm text-on-surface">
                      <div>
                        <span>{pay.paqueteNombre}</span>{' '}
                        <span className="text-on-surface-variant">({pay.clasesCantidad} clases)</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {pay.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                        {pay.numeroOperacion && (
                          <>
                            {' '}• Op: <code className="font-mono text-secondary">{pay.numeroOperacion}</code>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-body-md font-bold text-primary whitespace-nowrap">
                      ${Number(pay.monto || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {(pay.comprobanteDataUrl || pay.comprobanteNombre) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPreviewPayment(pay);
                              previewDialogRef.current?.showModal();
                            }}
                          >
                            <span>Ver comprobante</span>
                          </Button>
                        )}

                        {isAdmin && isRejected && deletePayment && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            data-testid={`cobros-delete-${pay.id}`}
                            onClick={() => deletePayment(pay)}
                            className="border-error/40 text-error hover:bg-error-container/40"
                          >
                            <Icon name="delete" className="text-[16px] mr-1" />
                            <span>Eliminar</span>
                          </Button>
                        )}

                        {isAdmin && isPending && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isMutating}
                              data-testid={`cobros-reject-${pay.id}`}
                              onClick={() => rejectPayment(pay, 'Pago no acreditado / rechazado')}
                              className="border-error/40 text-error hover:bg-error-container/40"
                            >
                              <span>Rechazar</span>
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              disabled={isMutating}
                              data-testid={`cobros-approve-${pay.id}`}
                              onClick={() => approvePayment(pay)}
                            >
                              <span>Acreditar</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ReceiptPreviewModal
        dialogRef={previewDialogRef}
        payment={previewPayment}
        onClose={() => previewDialogRef.current?.close()}
      />

      <CashNoticeModal
        dialogRef={cashDialogRef}
        students={students}
        packages={packages}
        isMutating={isMutating}
        onClose={() => cashDialogRef.current?.close()}
        onSubmit={registerCashNotice}
      />
    </div>
  );
}
