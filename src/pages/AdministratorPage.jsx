import React, { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminSidebar from '../components/organisms/AdminSidebar';
import StudentsSection from '../components/organisms/StudentsSection';
import StudentCreateSection from '../components/organisms/StudentCreateSection';
import StudentDetailSection from '../components/organisms/StudentDetailSection';
import StudentEditSection from '../components/organisms/StudentEditSection';
import StaffSection from '../components/organisms/StaffSection';
import StaffCreateSection from '../components/organisms/StaffCreateSection';
import StaffDetailSection from '../components/organisms/StaffDetailSection';
import StaffEditSection from '../components/organisms/StaffEditSection';
import PackagesSection from '../components/organisms/PackagesSection';
import CalendarSection from '../components/organisms/CalendarSection';
import CobrosSection from '../components/organisms/CobrosSection';
import AdminDashboardOverview from '../components/organisms/AdminDashboardOverview';
import Snackbar from '../components/molecules/Snackbar';
import Icon from '../components/atoms/Icon';
import { useAuth } from '../hooks/useAuth';
import { useStudentsManager } from '../hooks/useStudentsManager';
import { useStaffManager } from '../hooks/useStaffManager';
import { usePackagesManager } from '../hooks/usePackagesManager';
import { useCalendarManager } from '../hooks/useCalendarManager';
import { usePaymentsManager } from '../hooks/usePaymentsManager';
import { ADMIN_NAV_ITEMS } from '../data/adminNavItems';

const INITIAL_BEDS = [
  { id: 1, name: 'Cama 1', alumno: 'Sofía Martínez', status: 'presente' },
  { id: 2, name: 'Cama 2', alumno: 'Lucía González', status: 'pendiente' },
  { id: 3, name: 'Cama 3', alumno: null, status: 'disponible' },
  { id: 4, name: 'Cama 4', alumno: 'Valentina Romero', status: 'presente' },
];

/**
 * AdministratorPage View
 * Path: /administrator
 * Workspace for users with role="staff" (instructor / admin)
 */
const USER_CRUD_ACTIONS = new Set(['nuevo', 'edit', 'detail']);

function resolveAdminRoute(section, action, isAdmin) {
  const activeNavItem = ADMIN_NAV_ITEMS.find((item) => item.id === section);
  if (!activeNavItem || (activeNavItem.adminOnly && !isAdmin)) {
    return { redirectTo: '/administrador/dashboard', activeNavItem: null };
  }
  const supportsCrud = activeNavItem.id === 'alumnos' || activeNavItem.id === 'usuarios';
  if (action && !(supportsCrud && USER_CRUD_ACTIONS.has(action))) {
    return { redirectTo: `/administrador/${activeNavItem.id}`, activeNavItem: null };
  }
  return { redirectTo: null, activeNavItem };
}

function AdminPlaceholderSection({ activeNavItem }) {
  return (
    <section
      data-testid="admin-placeholder-section"
      className="p-8 sm:p-12 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs flex flex-col items-center justify-center text-center min-h-[360px]"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary-container/70 text-on-secondary-container flex items-center justify-center mb-4">
        <Icon name={activeNavItem.icon} className="text-[28px]" />
      </div>
      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
        Módulo de Administración
      </span>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
        {activeNavItem.label}
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
        {activeNavItem.description}
      </p>
      <span className="mt-6 px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
        Próximamente
      </span>
    </section>
  );
}

function getStaffIdentity(user, userProfile) {
  const staffName = userProfile?.nombre
    ? `${userProfile.nombre} ${userProfile.apellido || ''}`.trim()
    : user?.displayName || 'Administradora';
  const staffEmail = userProfile?.email || user?.email || 'admin@emuna.com';
  return { staffName, staffEmail };
}

function renderAlumnosContent({
  action,
  selectedStudent,
  students,
  isLoadingStudents,
  isDeletingStudent,
  togglingStudentId,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onToggleStudentActive,
}) {
  if (action === 'nuevo') {
    return <StudentCreateSection onCreateStudent={onCreateStudent} />;
  }
  if (action === 'detail') {
    return <StudentDetailSection student={selectedStudent} />;
  }
  if (action === 'edit') {
    return (
      <StudentEditSection
        key={selectedStudent?.id || 'missing'}
        student={selectedStudent}
        onUpdateStudent={onUpdateStudent}
      />
    );
  }
  return (
    <StudentsSection
      students={students}
      isLoadingStudents={isLoadingStudents}
      isDeletingStudent={isDeletingStudent}
      togglingStudentId={togglingStudentId}
      onDeleteStudent={onDeleteStudent}
      onToggleStudentActive={onToggleStudentActive}
    />
  );
}

function renderUsuariosContent({
  action,
  selectedStaff,
  staffUsers,
  isLoadingStaff,
  isDeletingStaff,
  togglingStaffId,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStaffActive,
}) {
  if (action === 'nuevo') {
    return <StaffCreateSection onCreateStaff={onCreateStaff} />;
  }
  if (action === 'detail') {
    return <StaffDetailSection staffMember={selectedStaff} />;
  }
  if (action === 'edit') {
    return (
      <StaffEditSection
        key={selectedStaff?.id || 'missing'}
        staffMember={selectedStaff}
        onUpdateStaff={onUpdateStaff}
      />
    );
  }
  return (
    <StaffSection
      staffUsers={staffUsers}
      isLoadingStaff={isLoadingStaff}
      isDeletingStaff={isDeletingStaff}
      togglingStaffId={togglingStaffId}
      onDeleteStaff={onDeleteStaff}
      onToggleStaffActive={onToggleStaffActive}
    />
  );
}

function AdminSectionContent({
  activeNavItem,
  action,
  selectedStudent,
  students,
  isLoadingStudents,
  isDeletingStudent,
  togglingStudentId,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onToggleStudentActive,
  selectedStaff,
  staffUsers,
  isLoadingStaff,
  isDeletingStaff,
  togglingStaffId,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStaffActive,
  renderPackages,
  renderCalendar,
  renderCobros,
  renderDashboard,
}) {
  if (activeNavItem.id === 'alumnos') {
    return renderAlumnosContent({
      action,
      selectedStudent,
      students,
      isLoadingStudents,
      isDeletingStudent,
      togglingStudentId,
      onCreateStudent,
      onUpdateStudent,
      onDeleteStudent,
      onToggleStudentActive,
    });
  }
  if (activeNavItem.id === 'usuarios') {
    return renderUsuariosContent({
      action,
      selectedStaff,
      staffUsers,
      isLoadingStaff,
      isDeletingStaff,
      togglingStaffId,
      onCreateStaff,
      onUpdateStaff,
      onDeleteStaff,
      onToggleStaffActive,
    });
  }
  if (activeNavItem.id === 'precios') {
    return renderPackages();
  }
  if (activeNavItem.id === 'calendario') {
    return renderCalendar();
  }
  if (activeNavItem.id === 'cobros') {
    return renderCobros();
  }
  if (activeNavItem.id !== 'dashboard') {
    return <AdminPlaceholderSection activeNavItem={activeNavItem} />;
  }
  return renderDashboard();
}

export default function AdministratorPage() {
  const { user, userProfile } = useAuth();
  const { section, action } = useParams();
  const [searchParams] = useSearchParams();
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const isAdmin = userProfile?.rol === 'administradora';
  const {
    students,
    isLoadingStudents,
    isDeletingStudent,
    togglingStudentId,
    snackbar,
    showSnackbar,
    closeSnackbar,
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentActive,
  } = useStudentsManager();

  const {
    staffUsers,
    isLoadingStaff,
    isDeletingStaff,
    togglingStaffId,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStaffActive,
  } = useStaffManager({ isAdmin, showSnackbar });

  const {
    packages,
    isLoadingPackages,
    isSavingPackage,
    isDeletingPackage,
    togglingPackageId,
    handleCreatePackage,
    handleUpdatePackage,
    handleToggleActive: handleTogglePackageActive,
    handleDeletePackage,
  } = usePackagesManager({ isEnabled: true, showSnackbar });

  const calendar = useCalendarManager({ isEnabled: true, showSnackbar });
  const paymentsManager = usePaymentsManager({ isEnabled: true, showSnackbar });
  const pendingPayments = paymentsManager.payments.filter(
    (p) => p.estado === 'pendiente_conciliacion'
  );

  const { redirectTo, activeNavItem } = resolveAdminRoute(section, action, isAdmin);
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  const studentId = searchParams.get('studentId');
  const selectedStudent = students.find((student) => student.id === studentId) || null;
  const userId = searchParams.get('userId');
  const selectedStaff = staffUsers.find((member) => member.id === userId) || null;
  const { staffName, staffEmail } = getStaffIdentity(user, userProfile);

  const toggleCheckIn = (bedId) => {
    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id !== bedId || !bed.alumno) return bed;
        return {
          ...bed,
          status: bed.status === 'presente' ? 'ausente' : 'presente',
        };
      })
    );
  };

  return (
    <DashboardLayout
      roleName="Instructora / Admin"
      roleBadge={isAdmin ? 'administradora' : 'staff'}
      userName={staffName}
      userEmail={staffEmail}
      renderSidebar={(sidebarProps) => (
        <AdminSidebar
          {...sidebarProps}
          userRole={userProfile?.rol}
        />
      )}
    >
      <AdminSectionContent
        activeNavItem={activeNavItem}
        action={action}
        selectedStudent={selectedStudent}
        students={students}
        isLoadingStudents={isLoadingStudents}
        isDeletingStudent={isDeletingStudent}
        togglingStudentId={togglingStudentId}
        onCreateStudent={createStudent}
        onUpdateStudent={updateStudent}
        onDeleteStudent={deleteStudent}
        onToggleStudentActive={toggleStudentActive}
        selectedStaff={selectedStaff}
        staffUsers={staffUsers}
        isLoadingStaff={isLoadingStaff}
        isDeletingStaff={isDeletingStaff}
        togglingStaffId={togglingStaffId}
        onCreateStaff={createStaff}
        onUpdateStaff={updateStaff}
        onDeleteStaff={deleteStaff}
        onToggleStaffActive={toggleStaffActive}
        renderPackages={() => (
          <PackagesSection
            packages={packages}
            isLoading={isLoadingPackages}
            isSaving={isSavingPackage}
            isDeleting={isDeletingPackage}
            togglingPackageId={togglingPackageId}
            onCreatePackage={handleCreatePackage}
            onUpdatePackage={handleUpdatePackage}
            onToggleActive={handleTogglePackageActive}
            onDeletePackage={handleDeletePackage}
          />
        )}
        renderCalendar={() => (
          <CalendarSection
            isAdmin={isAdmin}
            students={students}
            calendar={calendar}
          />
        )}
        renderCobros={() => (
          <CobrosSection
            isAdmin={isAdmin}
            paymentsManager={paymentsManager}
            students={students}
            packages={packages}
          />
        )}
        renderDashboard={() => (
          <AdminDashboardOverview
            beds={beds}
            pendingPayments={pendingPayments}
            isAdmin={isAdmin}
            onToggleCheckIn={toggleCheckIn}
            onApprovePayment={paymentsManager.approvePayment}
          />
        )}
      />
      <Snackbar
        open={snackbar.open}
        variant={snackbar.variant}
        message={snackbar.message}
        onClose={closeSnackbar}
      />
    </DashboardLayout>
  );
}
