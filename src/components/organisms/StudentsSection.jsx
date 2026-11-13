import React, { useEffect, useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import StudentsHeader from '../molecules/StudentsHeader';
import StudentsTable from '../molecules/StudentsTable';
import StudentDeleteDialog from '../molecules/StudentDeleteDialog';
import { MOCK_STUDENTS } from '../../data/mockStudents';
import { exportStudentsExcelTemplate } from '../../utils/studentExport';

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
      <StudentsHeader
        studentsCount={students.length}
        onExportExcel={handleExportExcel}
        onCreateStudent={() =>
          showNotice('Próximamente: pantalla para crear un nuevo alumno.')
        }
      />

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

      <StudentsTable
        students={students}
        onViewStudent={(student) =>
          showNotice(`Próximamente: detalle del alumno ${student.nombreApellido}.`)
        }
        onEditStudent={(student) =>
          showNotice(`Próximamente: editar datos de ${student.nombreApellido}.`)
        }
        onDeleteStudent={handleOpenDeleteDialog}
      />

      <StudentDeleteDialog
        dialogRef={deleteDialogRef}
        studentToDelete={studentToDelete}
        onClose={handleDeleteDialogClose}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
