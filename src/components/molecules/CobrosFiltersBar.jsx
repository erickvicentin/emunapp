import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import SelectChevron from '../atoms/SelectChevron';

const FILTER_OPTIONS = [
  { id: 'todos', label: 'Todos los estados' },
  { id: 'pendiente_conciliacion', label: 'Pendientes' },
  { id: 'aprobado', label: 'Acreditados' },
  { id: 'cerrados', label: 'Rechazados / Vencidos' },
];

function clampFourDigitYear(val) {
  if (!val) return '';
  const parts = val.split('-');
  if (parts[0] && parts[0].length > 4) {
    return [parts[0].slice(0, 4), ...parts.slice(1)].join('-');
  }
  return val;
}

/**
 * CobrosFiltersBar Molecule
 * Search, status, and date-range filters with summary counts for CobrosSection.
 */
export default function CobrosFiltersBar({
  studentSearch,
  onStudentSearchChange,
  filter,
  onFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  todayKey,
  hasActiveFilters,
  onClearFilters,
  pendingCount,
  approvedCount,
  dateRangeError,
}) {
  return (
    <section
      data-testid="cobros-filter-tabs"
      className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">Alumno</span>
          <div className="relative flex items-center">
            <Icon
              name="search"
              className="absolute left-3 text-on-surface-variant text-[18px] pointer-events-none select-none"
            />
            <input
              type="search"
              value={studentSearch}
              onChange={(e) => onStudentSearchChange(e.target.value)}
              placeholder="Nombre o email..."
              aria-label="Buscar alumno"
              data-testid="cobros-student-search-input"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-9 pr-3 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/60"
            />
          </div>
        </label>

        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">Estado</span>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
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
            onChange={(e) => onDateFromChange(clampFourDigitYear(e.target.value))}
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
            onChange={(e) => onDateToChange(clampFourDigitYear(e.target.value))}
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
              onClick={onClearFilters}
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
  );
}
