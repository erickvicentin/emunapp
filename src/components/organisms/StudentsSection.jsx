import React, { useEffect, useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { MOCK_STUDENTS } from '../../data/mockStudents';
import { exportStudentsExcelTemplate } from '../../utils/studentExport';

/**
 * AttendanceBadge helper
 * Renders a visual pill for the student's attendance percentage.
 */
function AttendancePercentage({ percentage }) {
  const badgeClasses =
    percentage >= 85
      ? 'bg-secondary-fixed text-on-secondary-fixed'
      : percentage >= 60
        ? 'bg-surface-container text-primary'
        : 'bg-error-container text-on-error-container';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-[12px] font-semibold tabular-nums ${badgeClasses}`}
    >
      {percentage}%
    </span>
  );
}

/**
 * StudentsSection Organism
 * Displays the registered students table (with or without packages/enrollments),
 * header actions (Crear alumno, Exportar plantilla como Excel),
 * and row actions (Ver detalle, Editar, Borrar).
 */
export default function StudentsSection() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [notice, setNotice] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const deleteDialogRef = useRef(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const showNotice = (message) => {
    setNotice(message);
  };

  const handleExportExcel = () => {
    exportStudentsExcelTemplate(students);
    showNotice('Plantilla de alumnos exportada en formato compatible con Excel.');
  };

  const handleOpenDeleteDialog = (student) => {
    setStudentToDelete(student);
    deleteDialogRef.current?.showModal();
  };

  const handleDeleteDialogClose = () => {
    const dialog = deleteDialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    setStudentToDelete(null);
  };

  const handleCancelDelete = () => {
    deleteDialogRef.current?.close('cancel');
  };

  const handleConfirmDelete = (event) => {
    event.preventDefault();
    if (studentToDelete) {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      showNotice(`Alumno "${studentToDelete.nombreApellido}" eliminado del listado.`);
    }
    deleteDialogRef.current?.close('confirm');
  };

  return (
    <div data-testid="students-section" className="space-y-5">
      {/* Header Card */}
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
              {students.length} registrados
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
            onClick={handleExportExcel}
            className="gap-2 bg-surface-container-lowest cursor-pointer"
          >
            <Icon name="table_view" className="text-[18px] text-secondary" />
            <span>Exportar plantilla como Excel</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            data-testid="students-create-btn"
            onClick={() =>
              showNotice('Próximamente: pantalla para crear un nuevo alumno.')
            }
            className="gap-2 cursor-pointer"
          >
            <Icon name="person_add" className="text-[18px]" />
            <span>Crear alumno</span>
          </Button>
        </div>
      </section>

      {/* Non-intrusive inline feedback notice */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          data-testid="students-notice"
          className="px-4 py-3 rounded-xl bg-secondary-fixed/70 border border-secondary/30 text-on-secondary-fixed flex items-center justify-between gap-3 text-body-md"
        >
          <div className="flex items-center gap-2">
            <Icon name="info" className="text-[18px] text-secondary shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Cerrar notificación"
            className="p-1 rounded-full hover:bg-secondary/10 transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {/* Responsive Students Table */}
      <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-3">
              <Icon name="groups" className="text-[26px]" />
            </div>
            <p className="font-headline-sm text-primary font-semibold">
              No hay alumnos registrados
            </p>
            <p className="font-body-sm text-on-surface-variant mt-1">
              Crea un nuevo alumno o importa una plantilla para comenzar.
            </p>
          </div>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="alumnos-table-caption"
            className="StudentsTable-wrapper p-2 sm:p-0 focus:outline-none focus:ring-2 focus:ring-secondary/40 rounded-2xl"
          >
            <table data-testid="students-table" className="StudentsTable text-left">
              <caption id="alumnos-table-caption" className="sr-only">
                Tabla de alumnos registrados con DNI, edad, sexo, porcentaje de asistencia y acciones
              </caption>
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-surface-container-high">
                  <th
                    scope="col"
                    className="py-3.5 px-5 font-label-md text-[12px] uppercase tracking-wider font-semibold bg-surface-container-low whitespace-nowrap"
                  >
                    Nombre y apellido
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 font-label-md text-[12px] uppercase tracking-wider font-semibold bg-surface-container-low whitespace-nowrap"
                  >
                    DNI
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 font-label-md text-[12px] uppercase tracking-wider font-semibold bg-surface-container-low whitespace-nowrap"
                  >
                    Edad
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 font-label-md text-[12px] uppercase tracking-wider font-semibold bg-surface-container-low whitespace-nowrap"
                  >
                    Sexo
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 font-label-md text-[12px] uppercase tracking-wider font-semibold bg-surface-container-low whitespace-nowrap"
                  >
                    % de asistencia
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-5 font-label-md text-[12px] uppercase tracking-wider font-semibold bg-surface-container-low text-right whitespace-nowrap"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/70">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    data-testid={`student-row-${student.id}`}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <th
                      scope="row"
                      data-testid={`student-name-${student.id}`}
                      className="py-3.5 px-5 font-label-lg text-[14px] font-semibold text-primary bg-surface-container-lowest whitespace-nowrap"
                    >
                      {student.nombreApellido}
                    </th>
                    <td
                      data-testid={`student-dni-${student.id}`}
                      className="py-3.5 px-4 font-body-md text-[14px] text-on-surface tabular-nums whitespace-nowrap"
                    >
                      {student.dni}
                    </td>
                    <td
                      data-testid={`student-age-${student.id}`}
                      className="py-3.5 px-4 font-body-md text-[14px] text-on-surface tabular-nums whitespace-nowrap"
                    >
                      {student.edad} años
                    </td>
                    <td
                      data-testid={`student-gender-${student.id}`}
                      className="py-3.5 px-4 font-body-md text-[14px] text-on-surface-variant whitespace-nowrap"
                    >
                      {student.sexo}
                    </td>
                    <td
                      data-testid={`student-attendance-${student.id}`}
                      className="py-3.5 px-4 whitespace-nowrap"
                    >
                      <AttendancePercentage percentage={student.porcentajeAsistencia} />
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          data-testid={`student-view-btn-${student.id}`}
                          onClick={() =>
                            showNotice(
                              `Próximamente: detalle del alumno ${student.nombreApellido}.`
                            )
                          }
                          aria-label={`Ver detalle de ${student.nombreApellido}`}
                          title="Ver detalle"
                          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        >
                          <Icon name="visibility" className="text-[19px]" />
                        </button>
                        <button
                          type="button"
                          data-testid={`student-edit-btn-${student.id}`}
                          onClick={() =>
                            showNotice(
                              `Próximamente: editar datos de ${student.nombreApellido}.`
                            )
                          }
                          aria-label={`Editar datos de ${student.nombreApellido}`}
                          title="Editar alumno"
                          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary-container/40 transition-colors cursor-pointer"
                        >
                          <Icon name="edit" className="text-[19px]" />
                        </button>
                        <button
                          type="button"
                          data-testid={`student-delete-btn-${student.id}`}
                          onClick={() => handleOpenDeleteDialog(student)}
                          aria-label={`Borrar a ${student.nombreApellido}`}
                          title="Borrar alumno"
                          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/60 transition-colors cursor-pointer"
                        >
                          <Icon name="delete" className="text-[19px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Native Modal Dialog for Delete Confirmation */}
      <dialog
        ref={deleteDialogRef}
        data-testid="student-delete-dialog"
        aria-labelledby="delete-student-title"
        onClose={handleDeleteDialogClose}
        className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-md w-[calc(100%-2rem)] text-on-surface"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <Icon name="delete_forever" className="text-[22px]" />
          </div>
          <div>
            <h2
              id="delete-student-title"
              className="font-headline-sm text-headline-sm text-primary font-semibold"
            >
              ¿Borrar alumno?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Estás por eliminar a{' '}
              <strong className="text-primary">
                {studentToDelete?.nombreApellido}
              </strong>{' '}
              del listado. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <form
          method="dialog"
          onSubmit={handleConfirmDelete}
          className="mt-6 flex items-center justify-end gap-3"
        >
          <button
            type="button"
            value="cancel"
            data-testid="student-delete-cancel-btn"
            onClick={handleCancelDelete}
            autoFocus
            className="px-4 py-2 rounded-full border border-outline-variant text-primary font-label-md text-[13px] font-semibold hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            value="confirm"
            data-testid="student-delete-confirm-btn"
            className="px-4 py-2 rounded-full bg-error text-on-error font-label-md text-[13px] font-semibold hover:bg-error/90 transition-colors cursor-pointer"
          >
            Borrar alumno
          </button>
        </form>
      </dialog>
    </div>
  );
}
