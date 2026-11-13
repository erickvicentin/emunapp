import React from 'react';
import Icon from '../atoms/Icon';

/**
 * AttendancePercentage helper
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
 * StudentsTable Molecule
 * Renders the responsive students table with empty state and row action buttons.
 */
export default function StudentsTable({
  students,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
}) {
  return (
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
                        onClick={() => onViewStudent(student)}
                        aria-label={`Ver detalle de ${student.nombreApellido}`}
                        title="Ver detalle"
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <Icon name="visibility" className="text-[19px]" />
                      </button>
                      <button
                        type="button"
                        data-testid={`student-edit-btn-${student.id}`}
                        onClick={() => onEditStudent(student)}
                        aria-label={`Editar datos de ${student.nombreApellido}`}
                        title="Editar alumno"
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary-container/40 transition-colors cursor-pointer"
                      >
                        <Icon name="edit" className="text-[19px]" />
                      </button>
                      <button
                        type="button"
                        data-testid={`student-delete-btn-${student.id}`}
                        onClick={() => onDeleteStudent(student)}
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
  );
}
