import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import ReportPaymentModal from '../molecules/ReportPaymentModal';
import { formatArsPrice } from '../../services/packageService';
import { formatPaymentDateTime, PAYMENT_STATUS_META } from '../../services/paymentService';

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
        <div
          data-testid="customer-payments-bank-details"
          className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <Icon name="account_balance" className="text-[20px] text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-label-sm uppercase tracking-wider text-secondary font-semibold">
                Datos para transferir
              </p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Alias:{' '}
                <code
                  data-testid="customer-payments-alias"
                  className="font-mono font-semibold text-primary"
                >
                  {cobrosConfig?.alias || cobrosConfig?.aliasCbu || '—'}
                </code>
                {cobrosConfig?.cvu ? (
                  <>
                    {' '}• CVU/CBU:{' '}
                    <code
                      data-testid="customer-payments-cvu"
                      className="font-mono font-semibold text-primary"
                    >
                      {cobrosConfig.cvu}
                    </code>
                  </>
                ) : null}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                Titular:{' '}
                <span data-testid="customer-payments-titular" className="font-medium text-primary">
                  {cobrosConfig?.titularCuenta || '—'}
                </span>
                {cobrosConfig?.cuilCuit ? (
                  <>
                    {' '}• CUIL/CUIT:{' '}
                    <code
                      data-testid="customer-payments-cuil"
                      className="font-mono font-medium text-primary"
                    >
                      {cobrosConfig.cuilCuit}
                    </code>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <span className="text-[12px] text-on-surface-variant shrink-0">
            Plazo provisorio: {cobrosConfig?.horasVencimientoProvisorio || 24} hs
          </span>
        </div>
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
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="customer-payments-table-caption"
          data-testid="customer-payments-list"
          className="rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs overflow-auto max-h-[540px]"
        >
          <table
            data-testid="customer-payments-table"
            className="w-full text-left border-collapse min-w-[700px]"
          >
            <caption id="customer-payments-table-caption" className="sr-only">
              Historial de pagos de la alumna
            </caption>
            <thead className="sticky top-0 z-10 bg-surface-container-low">
              <tr className="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th scope="col" className="py-3 px-4 font-semibold">Fecha</th>
                <th scope="col" className="py-3 px-4 font-semibold">Paquete / Ítem</th>
                <th scope="col" className="py-3 px-4 font-semibold">Importe</th>
                <th scope="col" className="py-3 px-4 font-semibold">Estado</th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {payments.map((pay) => {
                const badge =
                  PAYMENT_STATUS_META[pay.estado] || PAYMENT_STATUS_META.pendiente_conciliacion;
                const methodLabel =
                  pay.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia';
                const canInform = pay.estado === 'pendiente_informar';

                return (
                  <tr
                    key={pay.id}
                    data-testid={`customer-payment-row-${pay.id}`}
                    className="hover:bg-surface-container-low/40 transition-colors"
                  >
                    <td
                      data-testid={`customer-payment-date-${pay.id}`}
                      className="py-3.5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap"
                    >
                      {formatPaymentDateTime(pay.creadoEn)}
                    </td>
                    <td
                      data-testid={`customer-payment-item-${pay.id}`}
                      className="py-3.5 px-4 text-body-sm text-on-surface"
                    >
                      <div className="font-semibold text-primary">
                        {pay.paqueteNombre || 'Pago'}
                        {pay.clasesCantidad ? (
                          <span className="font-normal text-on-surface-variant">
                            {' '}({pay.clasesCantidad} {pay.clasesCantidad === 1 ? 'clase' : 'clases'})
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {methodLabel}
                        {pay.numeroOperacion ? (
                          <>
                            {' '}• Op: <code className="font-mono text-secondary">{pay.numeroOperacion}</code>
                          </>
                        ) : null}
                        {pay.estado === 'rechazado' && pay.motivoRechazo ? (
                          <span className="text-error block mt-0.5">
                            Motivo: {pay.motivoRechazo}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td
                      data-testid={`customer-payment-amount-${pay.id}`}
                      className="py-3.5 px-4 text-body-md font-bold text-primary whitespace-nowrap"
                    >
                      {formatArsPrice(pay.monto)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        data-testid={`customer-payment-status-${pay.id}`}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {canInform ? (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isMutating}
                          data-testid={`customer-inform-payment-btn-${pay.id}`}
                          onClick={() => handleOpenInformModal(pay)}
                        >
                          <span>Informar pago</span>
                        </Button>
                      ) : (
                        <span className="text-[12px] text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
