import React, { useMemo, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import CobrosFiltersBar from '../molecules/CobrosFiltersBar';
import CobrosTable from '../molecules/CobrosTable';
import PaginationBar from '../molecules/PaginationBar';
import ReceiptPreviewModal from '../molecules/ReceiptPreviewModal';
import CashNoticeModal from '../molecules/CashNoticeModal';
import { DEFAULT_PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { formatDateKey } from '../../utils/scheduleUtils';

const EMPTY_LIST = [];

function toDateOrNull(value) {
  if (!value) return null;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidDateInput(dateStr) {
  if (!dateStr) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (y < 2020) return false;
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
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

function matchesPaymentFilters(pay, filter, dateFrom, dateTo, hasDateError, studentSearch) {
  const normalizedQuery = studentSearch.trim().toLowerCase();
  if (normalizedQuery) {
    const studentName = String(pay.alumnoNombre || '').toLowerCase();
    const studentEmail = String(pay.alumnoEmail || '').toLowerCase();
    if (!studentName.includes(normalizedQuery) && !studentEmail.includes(normalizedQuery)) {
      return false;
    }
  }

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
  const [studentSearch, setStudentSearch] = useState('');
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
        matchesPaymentFilters(pay, filter, dateFrom, dateTo, Boolean(dateRangeError), studentSearch)
      ),
    [payments, filter, dateFrom, dateTo, dateRangeError, studentSearch]
  );

  const pendingCount = payments.filter((p) => p.estado === 'pendiente_conciliacion').length;
  const approvedCount = payments.filter((p) => p.estado === 'aprobado').length;
  const hasActiveFilters =
    filter !== 'todos' || Boolean(dateFrom) || Boolean(dateTo) || Boolean(studentSearch.trim());

  const pagination = usePagination(filteredPayments, DEFAULT_PAGE_SIZE);

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    pagination.setPage(1);
  };

  const handleStudentSearchChange = (nextQuery) => {
    setStudentSearch(nextQuery);
    pagination.setPage(1);
  };

  const handleDateFromChange = (nextDate) => {
    setDateFrom(nextDate);
    pagination.setPage(1);
  };

  const handleDateToChange = (nextDate) => {
    setDateTo(nextDate);
    pagination.setPage(1);
  };

  const handleClearFilters = () => {
    setFilter('todos');
    setStudentSearch('');
    setDateFrom('');
    setDateTo('');
    pagination.setPage(1);
  };

  const handlePreviewReceipt = (pay) => {
    setPreviewPayment(pay);
    previewDialogRef.current?.showModal();
  };

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

      <CobrosFiltersBar
        studentSearch={studentSearch}
        onStudentSearchChange={handleStudentSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
        dateFrom={dateFrom}
        onDateFromChange={handleDateFromChange}
        dateTo={dateTo}
        onDateToChange={handleDateToChange}
        todayKey={todayKey}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        dateRangeError={dateRangeError}
      />

      <CobrosTable
        payments={pagination.paginatedItems}
        isLoading={isLoading}
        isAdmin={isAdmin}
        isMutating={isMutating}
        onPreviewReceipt={handlePreviewReceipt}
        onDeletePayment={deletePayment}
        onRejectPayment={rejectPayment}
        onApprovePayment={approvePayment}
      />

      {!isLoading && (
        <PaginationBar
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPrevPage={pagination.prevPage}
          onNextPage={pagination.nextPage}
          testIdPrefix="cobros"
        />
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
