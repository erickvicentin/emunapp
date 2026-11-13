import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * StudentsHeader Molecule
 * Renders the Alumnos section header, registered count badge, and action buttons.
 */
export default function StudentsHeader({
  studentsCount,
  onExportExcel,
  onCreateStudent,
}) {
  return (
    <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
      <div>
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Módulo de Administración
        </span>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1
            data-testid="students-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight"
          >
            Alumnos
          </h1>
          <span
            data-testid="students-count-badge"
            className="px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-[12px] font-semibold"
          >
            {studentsCount} registrados
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Listado general de alumnos registrados, tengan o no paquetes contratados o clases inscriptas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <Button
          variant="outline"
          size="sm"
          data-testid="students-export-btn"
          onClick={onExportExcel}
          className="gap-2 bg-surface-container-lowest cursor-pointer"
        >
          <Icon name="table_view" className="text-[18px] text-secondary" />
          <span>Exportar plantilla como Excel</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          data-testid="students-create-btn"
          onClick={onCreateStudent}
          className="gap-2 cursor-pointer"
        >
          <Icon name="person_add" className="text-[18px]" />
          <span>Crear alumno</span>
        </Button>
      </div>
    </section>
  );
}
