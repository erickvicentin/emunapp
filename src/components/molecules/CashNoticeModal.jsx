import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import SelectChevron from '../atoms/SelectChevron';
import { formatArsPrice, getPackageNumericPrice } from '../../services/packageService';

const EMPTY_LIST = [];

/**
 * Modal for Staff or Administradora to register a cash payment notice (provisional credits).
 */
export default function CashNoticeModal({
  dialogRef,
  students = EMPTY_LIST,
  packages = EMPTY_LIST,
  isMutating = false,
  onClose,
  onSubmit,
}) {
  const activeStudents = students.filter((s) => s.active !== false);
  const activePackages = packages.filter((p) => p.active !== false);

  const [studentId, setStudentId] = useState('');
  const [packageId, setPackageId] = useState('');

  const selectedStudent = activeStudents.find((s) => s.id === studentId);
  const selectedPkg = activePackages.find((p) => p.id === packageId) || activePackages[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedPkg) return;
    const ok = await onSubmit?.({
      student: selectedStudent,
      pkg: selectedPkg,
      montoInformado: getPackageNumericPrice(selectedPkg),
    });
    if (ok) {
      setStudentId('');
      onClose?.();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="cash-notice-dialog"
      aria-labelledby="cash-notice-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <h3 id="cash-notice-title" className="font-headline-sm text-headline-sm font-semibold text-primary">
            Registrar Aviso en Efectivo
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            Otorga créditos provisorios hasta que Administración confirme el cobro.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="cash-student-select" className="block text-label-md font-semibold text-primary">
            Alumno
          </label>
          <div className="relative w-full">
            <select
              id="cash-student-select"
              data-testid="cash-student-select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-low pl-3 pr-10 py-2.5 text-body-md cursor-pointer"
            >
              <option value="">Seleccioná un alumno...</option>
              {activeStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombreApellido} {s.dni ? `(${s.dni})` : ''}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="cash-package-select" className="block text-label-md font-semibold text-primary">
            Paquete
          </label>
          <div className="relative w-full">
            <select
              id="cash-package-select"
              data-testid="cash-package-select"
              value={selectedPkg?.id || ''}
              onChange={(e) => setPackageId(e.target.value)}
              required
              className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-low pl-3 pr-10 py-2.5 text-body-md cursor-pointer"
            >
              {activePackages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatArsPrice(getPackageNumericPrice(p))}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="pt-3 border-t border-surface-container-high flex justify-end gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!selectedStudent || !selectedPkg || isMutating}
            data-testid="cash-notice-submit-btn"
          >
            <span>{isMutating ? 'Registrando...' : 'Registrar aviso'}</span>
          </Button>
        </div>
      </form>
    </dialog>
  );
}
