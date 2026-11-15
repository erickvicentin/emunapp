import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../molecules/SearchBar';
import StudentsHeader from '../molecules/StudentsHeader';
import StudentsTable from '../molecules/StudentsTable';
import StudentDeleteDialog from '../molecules/StudentDeleteDialog';
import { filterStudents } from '../../utils/studentFilter';

/**
 * StaffSection Organism
 * Admin-only table for managing users with role `staff`
 * (list, search, activate/deactivate switch, view, edit, delete).
 */
export default function StaffSection({
  staffUsers = [],
  isLoadingStaff = false,
  isDeletingStaff = false,
  togglingStaffId = null,
  onDeleteStaff,
  onToggleStaffActive,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [staffToDelete, setStaffToDelete] = useState(null);
  const deleteDialogRef = useRef(null);

  const filteredStaff = filterStudents(staffUsers, searchQuery);

  const handleOpenDeleteDialog = (member) => {
    setStaffToDelete(member);
    deleteDialogRef.current?.showModal();
  };

  const handleDeleteDialogClose = () => {
    const dialog = deleteDialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    setStaffToDelete(null);
  };

  const handleCancelDelete = () => {
    deleteDialogRef.current?.close('cancel');
  };

  const handleConfirmDelete = async (event) => {
    event.preventDefault();
    if (staffToDelete) {
      await onDeleteStaff?.(staffToDelete);
    }
    deleteDialogRef.current?.close('confirm');
  };

  return (
    <div data-testid="staff-section" className="space-y-5">
      <StudentsHeader
        studentsCount={staffUsers.length}
        onCreateStudent={() => navigate('/administrador/usuarios/nuevo')}
        title="Usuarios (staff)"
        subtitle="Administración de instructoras y personal autorizado del estudio."
        createLabel="Crear usuario staff"
        showExport={false}
        testIdPrefix="staff"
      />

      <SearchBar
        id="staff-search-input"
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Buscar staff por nombre, apellido, DNI o email..."
        ariaLabel="Buscar usuarios staff por nombre, apellido, DNI o email"
        clearLabel="Limpiar"
        testIdPrefix="staff-search"
      />

      <StudentsTable
        students={filteredStaff}
        isLoading={isLoadingStaff}
        hasSearchFilter={Boolean(searchQuery.trim())}
        togglingStudentId={togglingStaffId}
        onToggleStudentActive={onToggleStaffActive}
        showAttendance={false}
        tableTestIdPrefix="staff"
        rowTestIdPrefix="staff"
        emptyTitle="No hay usuarios staff registrados"
        emptyDescription="Crea un nuevo usuario staff para habilitar su acceso al panel."
        emptySearchTitle="No se encontraron usuarios staff"
        onViewStudent={(member) =>
          navigate(
            `/administrador/usuarios/detail?userId=${encodeURIComponent(member.id)}`
          )
        }
        onEditStudent={(member) =>
          navigate(
            `/administrador/usuarios/edit?userId=${encodeURIComponent(member.id)}`
          )
        }
        onDeleteStudent={handleOpenDeleteDialog}
      />

      <StudentDeleteDialog
        dialogRef={deleteDialogRef}
        studentToDelete={staffToDelete}
        isDeleting={isDeletingStaff}
        onClose={handleDeleteDialogClose}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
