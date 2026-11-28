import React from 'react';
import { formatArsPrice } from '../../services/packageService';
import { formatPaymentDateTime, PAYMENT_STATUS_META } from '../../services/paymentService';

/**
 * CustomerPaymentsTable Molecule
 * Desktop table view for the student's payment history.
 */
export default function CustomerPaymentsTable({ payments }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-labelledby="customer-payments-table-caption"
      data-testid="customer-payments-list"
      className="hidden md:block rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs overflow-x-auto"
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
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {payments.map((pay) => {
            const badge =
              PAYMENT_STATUS_META[pay.estado] || PAYMENT_STATUS_META.pendiente_conciliacion;
            const methodLabel =
              pay.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia';

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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
