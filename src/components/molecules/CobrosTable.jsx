import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

const STATUS_MAP = {
  pendiente_conciliacion: {
    label: 'Pendiente conciliación',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  aprobado: {
    label: 'Acreditado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  rechazado: {
    label: 'Rechazado',
    classes: 'bg-error-container text-on-error-container border-error/30',
  },
  vencido: {
    label: 'Vencido',
    classes: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  },
};

function formatPaymentCreatedAt(value) {
  if (!value) return '-';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} hs`;
}

/**
 * CobrosTable Molecule
 * Renders the payment reconciliation table, loading/empty states, and row actions.
 */
export default function CobrosTable({
  payments,
  isLoading,
  isAdmin,
  isMutating,
  onPreviewReceipt,
  onDeletePayment,
  onRejectPayment,
  onApprovePayment,
}) {
  if (isLoading) {
    return (
      <div data-testid="cobros-loading" className="p-8 text-center text-body-md text-on-surface-variant">
        Cargando cobros...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div
        data-testid="cobros-empty"
        className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center text-body-md text-on-surface-variant"
      >
        No hay cobros registrados en esta vista.
      </div>
    );
  }

  return (
    <div
      data-testid="cobros-list"
      className="rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs overflow-x-auto"
    >
      <table data-testid="cobros-table" className="w-full text-left border-collapse min-w-[760px]">
        <thead>
          <tr className="border-b border-surface-container-high bg-surface-container-low/70 text-label-sm uppercase tracking-wider text-on-surface-variant">
            <th className="py-3 px-4 font-semibold">Fecha / Hora</th>
            <th className="py-3 px-4 font-semibold">Alumno</th>
            <th className="py-3 px-4 font-semibold">Ítem</th>
            <th className="py-3 px-4 font-semibold">Importe</th>
            <th className="py-3 px-4 font-semibold">Estado</th>
            <th className="py-3 px-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {payments.map((pay) => {
            const badge = STATUS_MAP[pay.estado] || STATUS_MAP.pendiente_conciliacion;
            const isPending = pay.estado === 'pendiente_conciliacion';
            const isRejected = pay.estado === 'rechazado';
            const reportedAtLabel = formatPaymentCreatedAt(pay.creadoEn);

            return (
              <tr
                key={pay.id}
                data-testid={`cobros-row-${pay.id}`}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                <td
                  data-testid={`cobros-reported-at-${pay.id}`}
                  className="py-3.5 px-4 text-body-sm text-on-surface-variant whitespace-nowrap"
                >
                  {reportedAtLabel}
                </td>
                <td className="py-3.5 px-4 font-label-lg font-semibold text-primary">
                  {pay.alumnoNombre}
                </td>
                <td className="py-3.5 px-4 text-body-sm text-on-surface">
                  <div>
                    <span>{pay.paqueteNombre}</span>{' '}
                    <span className="text-on-surface-variant">({pay.clasesCantidad} clases)</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {pay.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    {pay.numeroOperacion && (
                      <>
                        {' '}• Op: <code className="font-mono text-secondary">{pay.numeroOperacion}</code>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-body-md font-bold text-primary whitespace-nowrap">
                  ${Number(pay.monto || 0).toLocaleString('es-AR')}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {(pay.comprobanteDataUrl || pay.comprobanteNombre) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewReceipt(pay)}
                      >
                        <span>Ver comprobante</span>
                      </Button>
                    )}

                    {isAdmin && isRejected && onDeletePayment && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        data-testid={`cobros-delete-${pay.id}`}
                        onClick={() => onDeletePayment(pay)}
                        className="border-error/40 text-error hover:bg-error-container/40"
                      >
                        <Icon name="delete" className="text-[16px] mr-1" />
                        <span>Eliminar</span>
                      </Button>
                    )}

                    {isAdmin && isPending && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isMutating}
                          data-testid={`cobros-reject-${pay.id}`}
                          onClick={() => onRejectPayment(pay, 'Pago no acreditado / rechazado')}
                          className="border-error/40 text-error hover:bg-error-container/40"
                        >
                          <span>Rechazar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isMutating}
                          data-testid={`cobros-approve-${pay.id}`}
                          onClick={() => onApprovePayment(pay)}
                        >
                          <span>Acreditar</span>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
