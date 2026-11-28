import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { formatArsPrice, getPackageNumericPrice } from '../../services/packageService';

/**
 * CustomerConfirmPackageModal Molecule
 * Confirmation modal when a student selects a credit package.
 * Displays package summary, bank transfer details, and credit/expiry rules
 * without asking for a receipt upload or payment method dropdown.
 */
export default function CustomerConfirmPackageModal({
  dialogRef,
  selectedPackage,
  cobrosConfig,
  isMutating = false,
  onClose,
  onConfirm,
}) {
  const numericPrice = getPackageNumericPrice(selectedPackage);
  const priceLabel = formatArsPrice(numericPrice);
  const validityDays = selectedPackage?.validityDays || 30;
  const provisoryHours = cobrosConfig?.horasVencimientoProvisorio || 24;
  const classesCount = selectedPackage?.classesCount || 1;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      data-testid="customer-confirm-package-dialog"
      aria-labelledby="confirm-package-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-black/40"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Confirmar Paquete
          </span>
          <h1
            id="confirm-package-title"
            className="font-headline-sm text-headline-sm font-semibold text-primary mt-0.5"
          >
            {selectedPackage ? selectedPackage.name : 'Reservar paquete'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          data-testid="customer-confirm-package-close-btn"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {selectedPackage && (
        <div className="mt-4 space-y-4">
          {/* Resumen del paquete elegido */}
          <div
            data-testid="customer-confirm-package-summary"
            className="p-3.5 rounded-xl bg-secondary-container/40 border border-secondary/30 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-label-lg font-semibold text-primary">
                {selectedPackage.name}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {classesCount} {classesCount === 1 ? 'crédito' : 'créditos'}
                {selectedPackage.frequency ? ` • ${selectedPackage.frequency}` : ''}
              </p>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold text-primary whitespace-nowrap">
              {priceLabel}
            </span>
          </div>

          {/* Datos de cuenta para transferir */}
          <div
            data-testid="customer-confirm-package-bank-details"
            className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm space-y-1.5"
          >
            <p className="font-label-sm uppercase tracking-wider text-secondary font-semibold">
              Datos para transferir
            </p>
            <div className="flex justify-between gap-2">
              <span className="text-on-surface-variant">Alias:</span>
              <code
                data-testid="customer-confirm-package-alias"
                className="font-mono font-semibold text-secondary"
              >
                {cobrosConfig?.alias || cobrosConfig?.aliasCbu || '—'}
              </code>
            </div>
            {cobrosConfig?.cvu && (
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">CVU / CBU:</span>
                <code
                  data-testid="customer-confirm-package-cvu"
                  className="font-mono font-semibold text-primary"
                >
                  {cobrosConfig.cvu}
                </code>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <span className="text-on-surface-variant">Titular:</span>
              <span
                data-testid="customer-confirm-package-titular"
                className="font-medium text-primary text-right"
              >
                {cobrosConfig?.titularCuenta || '—'}
              </span>
            </div>
            {cobrosConfig?.cuilCuit && (
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">CUIL / CUIT:</span>
                <code
                  data-testid="customer-confirm-package-cuil"
                  className="font-mono font-medium text-primary"
                >
                  {cobrosConfig.cuilCuit}
                </code>
              </div>
            )}
          </div>

          {/* Condiciones de los créditos y del pago */}
          <div
            data-testid="customer-confirm-package-rules"
            className="p-3.5 rounded-xl bg-surface-container border border-surface-container-highest space-y-2 text-body-sm text-on-surface-variant"
          >
            <p className="font-label-sm uppercase tracking-wider text-primary font-semibold">
              Información importante sobre tus créditos
            </p>
            <ul className="space-y-1.5 text-[13px] leading-snug">
              <li className="flex items-start gap-2">
                <Icon name="event_available" className="text-[17px] text-secondary shrink-0 mt-0.5" />
                <span>
                  Los créditos tienen <strong className="text-primary">{validityDays} días de validez</strong> para usar desde la confirmación del pago hasta {validityDays} días posteriores.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="receipt_long" className="text-[17px] text-secondary shrink-0 mt-0.5" />
                <span>
                  Debés <strong className="text-primary">informar el pago</strong> una vez realizada la transferencia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="confirmation_number" className="text-[17px] text-secondary shrink-0 mt-0.5" />
                <span>
                  Podés consultar tu saldo de créditos actualizado arriba en el <strong className="text-primary">header</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="schedule" className="text-[17px] text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Si luego de <strong className="text-primary">{provisoryHours} horas</strong> no informaste el pago o no hubo confirmación de Administración, se darán de baja tus créditos y las reservas realizadas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="block" className="text-[17px] text-amber-700 shrink-0 mt-0.5" />
                <span>
                  No vas a poder realizar otra compra de paquete hasta que se confirme este pago.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-surface-container-high flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isMutating}
            >
              <span>Cancelar</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isMutating}
              data-testid="customer-confirm-package-submit-btn"
              onClick={() => onConfirm?.(selectedPackage)}
            >
              <span>{isMutating ? 'Confirmando...' : 'Confirmar paquete'}</span>
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
