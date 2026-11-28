import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import ReportPaymentModal from '../molecules/ReportPaymentModal';
import CustomerPaymentMobileCard from '../molecules/CustomerPaymentMobileCard';
import CustomerPaymentsTable from '../molecules/CustomerPaymentsTable';
import TransferDetailsCard from '../molecules/TransferDetailsCard';

const EMPTY_LIST = [];

/**
 * CustomerPaymentsSection Organism
 * Displays transfer account details in the header, the student's payment history
 * (package payments, single-class reservation payments, and admin cash charges),
 * and allows reporting pending transfers or clearing rejected payments from view.
 */
export default function CustomerPaymentsSection({
  payments = EMPTY_LIST,
  reservations = EMPTY_LIST,
  cobrosConfig,
  totalCredits = 0,
  rejectedCount = 0,
  isLoading = false,
  isMutating = false,
  onInformPackagePayment,
  onClearRejected,
}) {
  const navigate = useNavigate();
  const reportDialogRef = useRef(null);
  const [paymentToInform, setPaymentToInform] = useState(null);

  const hasUnreportedReservation = useMemo(
    () => reservations.some((r) => r.estado === 'esperando_comprobante'),
    [reservations]
  );

  const handleOpenInformModal = (pay) => {
    setPaymentToInform(pay);
    reportDialogRef.current?.showModal();
  };

  const handleCloseInformModal = () => {
    reportDialogRef.current?.close();
    setPaymentToInform(null);
  };

  return (
    <div data-testid="customer-payments-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Espacio Alumna • Emuná Pilates
            </span>
            <h1
              data-testid="customer-payments-title"
              className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
            >
              Pagos
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Historial de pagos de paquetes, clases individuales y cobros registrados en el estudio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div
              data-testid="customer-payments-credits-pill"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-secondary-container/70 text-on-secondary-container text-label-md font-semibold"
            >
              <Icon name="confirmation_number" className="text-[18px]" />
              <span>Créditos: {totalCredits}</span>
            </div>

            {rejectedCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isMutating}
                data-testid="customer-clear-rejected-payments-btn"
                onClick={onClearRejected}
                className="h-10 gap-1.5 bg-surface-container-lowest text-error border-error/30 hover:bg-error-container/30"
              >
                <Icon name="delete_sweep" className="text-[18px]" />
                <span>Limpiar rechazados ({rejectedCount})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Datos de la cuenta bancaria siempre visibles en la cabecera de Pagos */}
        <TransferDetailsCard cobrosConfig={cobrosConfig} />
      </section>

      {hasUnreportedReservation && (
        <div
          data-testid="customer-payments-unreported-banner"
          className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-body-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <Icon name="info" className="text-[20px] shrink-0 mt-0.5 text-amber-700" />
            <span>
              Tenés una reserva de clase individual pendiente de informar el pago. Podés informar la transferencia desde la sección Turnos.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/customer/turnos')}
            className="shrink-0"
          >
            <span>Ir a Turnos</span>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          data-testid="customer-payments-loading"
          className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center text-body-md text-on-surface-variant"
        >
          Cargando historial de pagos...
        </div>
      ) : payments.length === 0 ? (
        <div
          data-testid="customer-payments-empty"
          className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center space-y-3"
        >
          <p className="text-body-md text-on-surface-variant">
            Todavía no tenés pagos registrados en tu historial.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            data-testid="customer-payments-explore-packages-btn"
            onClick={() => navigate('/customer/paquetes')}
          >
            <span>Ver paquetes disponibles</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile card list (< md) */}
          <div
            data-testid="customer-payments-mobile-list"
            className="md:hidden space-y-3"
          >
            {payments.map((pay) => (
              <CustomerPaymentMobileCard
                key={pay.id}
                payment={pay}
                isMutating={isMutating}
                onInformPayment={handleOpenInformModal}
              />
            ))}
          </div>

          {/* Desktop table (>= md) */}
          <CustomerPaymentsTable
            payments={payments}
            isMutating={isMutating}
            onInformPayment={handleOpenInformModal}
          />
        </>
      )}

      <ReportPaymentModal
        dialogRef={reportDialogRef}
        lockedPayment={paymentToInform}
        cobrosConfig={cobrosConfig}
        isMutating={isMutating}
        onClose={handleCloseInformModal}
        onSubmit={onInformPackagePayment}
      />
    </div>
  );
}
