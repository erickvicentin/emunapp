import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import PackageCard from '../molecules/PackageCard';
import CustomerConfirmPackageModal from '../molecules/CustomerConfirmPackageModal';

const EMPTY_LIST = [];

/**
 * CustomerPackagesSection Organism
 * Displays all active credit packages (including Individual Class) for the student
 * and blocks reservation while any payment or payment report is pending.
 */
export default function CustomerPackagesSection({
  packages = EMPTY_LIST,
  cobrosConfig,
  isPackageReservationBlocked = false,
  hasPendingConfirmation = false,
  hasPendingReservationPayment = false,
  isMutating = false,
  onSubmitPackagePayment,
}) {
  const navigate = useNavigate();
  const reportDialogRef = useRef(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const activePackages = useMemo(
    () =>
      packages
        .filter((pkg) => pkg.active !== false)
        .sort((a, b) => (a.order || 99) - (b.order || 99) || a.classesCount - b.classesCount),
    [packages]
  );

  const handleOpenModal = (pkg) => {
    if (isPackageReservationBlocked) return;
    setSelectedPackage(pkg);
    reportDialogRef.current?.showModal();
  };

  const handleCloseModal = () => {
    reportDialogRef.current?.close();
    setSelectedPackage(null);
  };

  const handleConfirmPackage = async (pkg) => {
    const ok = await onSubmitPackagePayment?.(pkg);
    if (ok) {
      handleCloseModal();
      navigate('/customer/pagos');
    }
    return ok;
  };

  return (
    <div data-testid="customer-packages-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Espacio Alumna • Emuná Pilates
          </span>
          <h1
            data-testid="customer-packages-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Paquetes
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Elegí tu paquete de clases (desde clase individual hasta membresías mensuales) y reservá tus créditos.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="customer-packages-go-pagos-btn"
          onClick={() => navigate('/customer/pagos')}
          className="h-10 gap-1.5 bg-surface-container-lowest shrink-0"
        >
          <Icon name="payments" className="text-[18px]" />
          <span>Ver mis pagos</span>
        </Button>
      </section>

      {isPackageReservationBlocked && (
        <div
          data-testid="customer-packages-pending-block-banner"
          className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-body-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <Icon name="warning" className="text-[20px] shrink-0 mt-0.5 text-amber-700" />
            <span>
              {hasPendingReservationPayment
                ? 'Tenés una reserva pendiente de informar o confirmar el pago. No podés reservar ningún paquete hasta completar o confirmar esa operación.'
                : hasPendingConfirmation
                  ? 'Tenés un pago pendiente de confirmación por Administración. No podés reservar otro paquete hasta que sea conciliado.'
                  : 'Tenés un pago pendiente. Esperá su confirmación antes de reservar un paquete.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasPendingReservationPayment && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/customer/turnos')}
              >
                <span>Ir a Turnos</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/customer/pagos')}
            >
              <span>Ir a Pagos</span>
            </Button>
          </div>
        </div>
      )}

      {activePackages.length === 0 ? (
        <div
          data-testid="customer-packages-empty"
          className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center text-body-md text-on-surface-variant"
        >
          No hay paquetes disponibles en este momento.
        </div>
      ) : (
        <div
          data-testid="customer-packages-grid"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch"
        >
          {activePackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              category={pkg.category}
              name={pkg.name}
              frequency={pkg.frequency}
              price={pkg.price}
              features={pkg.features}
              isPopular={pkg.isPopular}
              testId={`customer-package-card-${pkg.id}`}
              ctaTestId={`customer-package-select-btn-${pkg.id}`}
              ctaText={
                isPackageReservationBlocked
                  ? 'Pago pendiente'
                  : `Confirmar ${pkg.name}`
              }
              disabled={isPackageReservationBlocked || isMutating}
              onSelect={() => handleOpenModal(pkg)}
            />
          ))}
        </div>
      )}

      <CustomerConfirmPackageModal
        dialogRef={reportDialogRef}
        selectedPackage={selectedPackage}
        cobrosConfig={cobrosConfig}
        isMutating={isMutating}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPackage}
      />
    </div>
  );
}
