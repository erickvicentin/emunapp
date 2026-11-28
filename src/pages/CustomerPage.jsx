import React, { useCallback, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardSidebar from '../components/organisms/DashboardSidebar';
import CustomerTurnsSection from '../components/organisms/CustomerTurnsSection';
import CustomerPackagesSection from '../components/organisms/CustomerPackagesSection';
import CustomerPaymentsSection from '../components/organisms/CustomerPaymentsSection';
import Snackbar from '../components/molecules/Snackbar';
import Icon from '../components/atoms/Icon';
import { useAuth } from '../hooks/useAuth';
import { useCustomerCalendar } from '../hooks/useCustomerCalendar';
import { useCustomerPayments } from '../hooks/useCustomerPayments';
import { CUSTOMER_NAV_ITEMS } from '../data/customerNavItems';

function CustomerPlaceholderSection({ activeNavItem }) {
  return (
    <section
      data-testid="customer-placeholder-section"
      className="p-8 sm:p-12 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs flex flex-col items-center justify-center text-center min-h-[360px]"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary-container/70 text-on-secondary-container flex items-center justify-center mb-4">
        <Icon name={activeNavItem.icon} className="text-[28px]" />
      </div>
      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
        Espacio Alumna • Emuná Pilates
      </span>
      <h1
        data-testid="customer-placeholder-title"
        className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
      >
        {activeNavItem.label}
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
        {activeNavItem.description}
      </p>
      <span
        data-testid="customer-placeholder-status"
        className="mt-6 px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md"
      >
        Próximo a implementar
      </span>
    </section>
  );
}

/**
 * CustomerPage View
 * Path: /customer/:section
 * Workspace for users with role="customer" (alumnas)
 */
export default function CustomerPage() {
  const { user, userProfile } = useAuth();
  const { section } = useParams();
  const [snackbar, setSnackbar] = useState({ open: false, variant: 'success', message: '' });

  const showSnackbar = useCallback((variant, message) => {
    setSnackbar({ open: true, variant, message });
  }, []);

  const fullName = userProfile?.nombre
    ? `${userProfile.nombre} ${userProfile.apellido || ''}`.trim()
    : user?.displayName || 'Alumna';
  const email = userProfile?.email || user?.email || '';

  const activeNavItem = CUSTOMER_NAV_ITEMS.find((item) => item.id === section);
  const calendar = useCustomerCalendar({
    uid: user?.uid,
    userName: fullName,
    userEmail: email,
    isEnabled: activeNavItem?.id === 'turnos',
    showSnackbar,
  });

  const customerPayments = useCustomerPayments({
    uid: user?.uid,
    userName: fullName,
    userEmail: email,
    reservations: calendar.reservations,
    onAccountUpdated: calendar.reloadAccountData,
    showSnackbar,
  });

  if (!activeNavItem) {
    return <Navigate to="/customer/turnos" replace />;
  }

  const renderSection = () => {
    if (activeNavItem.id === 'turnos') {
      return <CustomerTurnsSection calendar={calendar} />;
    }
    if (activeNavItem.id === 'paquetes') {
      return (
        <CustomerPackagesSection
          packages={calendar.packages}
          cobrosConfig={calendar.cobrosConfig}
          isPackageReservationBlocked={customerPayments.isPackageReservationBlocked}
          hasPendingConfirmation={customerPayments.hasPendingConfirmation}
          hasPendingReservationPayment={customerPayments.hasPendingReservationPayment}
          isMutating={customerPayments.isMutating}
          onSubmitPackagePayment={customerPayments.submitPackagePayment}
        />
      );
    }
    if (activeNavItem.id === 'pagos') {
      return (
        <CustomerPaymentsSection
          payments={customerPayments.payments}
          reservations={calendar.reservations}
          cobrosConfig={calendar.cobrosConfig}
          totalCredits={calendar.totalCredits}
          rejectedCount={customerPayments.rejectedCount}
          isLoading={customerPayments.isLoading}
          isMutating={customerPayments.isMutating}
          onInformPackagePayment={customerPayments.informPackagePayment}
          onClearRejected={customerPayments.clearRejectedPayments}
        />
      );
    }
    return <CustomerPlaceholderSection activeNavItem={activeNavItem} />;
  };

  return (
    <DashboardLayout
      roleName="Alumna"
      roleBadge="customer"
      userName={fullName}
      userEmail={email}
      badgeLabel={`Créditos: ${calendar.totalCredits}`}
      badgeIcon="confirmation_number"
      sidebarId="customer-drawer"
      renderSidebar={(sidebarProps) => (
        <DashboardSidebar
          {...sidebarProps}
          navItems={CUSTOMER_NAV_ITEMS}
          drawerId="customer-drawer"
          testIdPrefix="customer"
          ariaLabel="Menú de alumna"
          navAriaLabel="Navegación de alumna"
          mobileHeaderSubtitle="Espacio Alumna"
        />
      )}
    >
      {renderSection()}

      <Snackbar
        open={snackbar.open}
        variant={snackbar.variant}
        message={snackbar.message}
        position="bottom-left"
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </DashboardLayout>
  );
}
