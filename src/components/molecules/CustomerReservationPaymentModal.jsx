import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { formatArsPrice, getPackageNumericPrice } from '../../services/packageService';
import { formatDateKey, parseTurnDateTime } from '../../utils/scheduleUtils';

function formatReservationDate(dateKey) {
  if (!dateKey) return '';
  const date = parseTurnDateTime(dateKey, '12:00');
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

/**
 * CustomerReservationPaymentModal Molecule
 * Dedicated modal for reporting payment of a reservation booked without credits:
 * fixed to "Clase individual" with its fixed price, no package selector,
 * no receipt upload, and only the transfer date input.
 */
export default function CustomerReservationPaymentModal({
  dialogRef,
  reservation,
  individualPackage,
  cobrosConfig,
  isMutating = false,
  onClose,
  onSubmit,
}) {
  const [todayKey] = useState(() => formatDateKey(new Date()));
  const [fechaTransferencia, setFechaTransferencia] = useState(() => formatDateKey(new Date()));

  const priceNumeric = getPackageNumericPrice(individualPackage);
  const priceLabel = priceNumeric > 0 ? formatArsPrice(priceNumeric) : 'Según tarifa vigente';
  const conceptLabel = individualPackage?.name || 'Clase individual';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation || !fechaTransferencia) return;
    const ok = await onSubmit?.({
      reservation,
      fechaTransferencia,
    });
    if (ok) {
      onClose?.();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="customer-reservation-payment-dialog"
      aria-labelledby="reservation-payment-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Informar pago de reserva
          </span>
          <h1
            id="reservation-payment-title"
            className="font-headline-sm text-headline-sm font-semibold text-primary mt-0.5 capitalize"
          >
            {reservation ? `${formatReservationDate(reservation.dateKey)} • ${reservation.startTime} hs` : 'Reserva'}
          </h1>
        </div>
        <button
          type="button"
          data-testid="reservation-payment-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div
          data-testid="reservation-payment-concept-box"
          className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between gap-3"
        >
          <div>
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
              Concepto
            </span>
            <strong data-testid="reservation-payment-concept" className="text-body-md text-primary">
              {conceptLabel}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
              Monto
            </span>
            <strong data-testid="reservation-payment-amount" className="text-body-md text-primary">
              {priceLabel}
            </strong>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-container border border-surface-container-highest text-[12px] space-y-1">
          <p className="font-label-sm uppercase tracking-wider text-secondary font-semibold">
            Cuenta destino
          </p>
          <div className="flex justify-between gap-2">
            <span className="text-on-surface-variant">Alias:</span>
            <code className="font-mono font-semibold text-primary">{cobrosConfig?.alias || '-'}</code>
          </div>
          {cobrosConfig?.cvu && (
            <div className="flex justify-between gap-2">
              <span className="text-on-surface-variant">CVU / CBU:</span>
              <code className="font-mono font-semibold text-primary">{cobrosConfig.cvu}</code>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <span className="text-on-surface-variant">Titular:</span>
            <span className="font-medium text-primary">{cobrosConfig?.titularCuenta || '-'}</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="reservation-transfer-date"
            className="block text-label-md font-semibold text-primary mb-1.5"
          >
            Fecha de la transferencia
          </label>
          <input
            id="reservation-transfer-date"
            type="date"
            required
            max={todayKey}
            data-testid="reservation-payment-date-input"
            value={fechaTransferencia}
            onChange={(e) => setFechaTransferencia(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            autoFocus
            data-testid="reservation-payment-cancel-btn"
            onClick={onClose}
            disabled={isMutating}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            data-testid="reservation-payment-submit-btn"
            disabled={isMutating || !fechaTransferencia}
          >
            {isMutating ? 'Enviando...' : 'Informar pago'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
