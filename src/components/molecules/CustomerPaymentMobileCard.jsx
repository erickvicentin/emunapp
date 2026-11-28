import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { formatArsPrice } from '../../services/packageService';
import {
  buildPaymentWhatsappNoticeUrl,
  formatPaymentDateTime,
  PAYMENT_STATUS_META,
} from '../../services/paymentService';

/**
 * CustomerPaymentMobileCard Molecule
 * Responsive mobile card view for a student payment item.
 */
export default function CustomerPaymentMobileCard({
  payment,
  studentName = '',
  isMutating = false,
  onInformPayment,
}) {
  const badge =
    PAYMENT_STATUS_META[payment.estado] || PAYMENT_STATUS_META.pendiente_conciliacion;
  const methodLabel = payment.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia';
  const canInform = payment.estado === 'pendiente_informar';
  const isPendingConfirmation = payment.estado === 'pendiente_conciliacion';

  return (
    <article
      data-testid={`customer-payment-card-${payment.id}`}
      className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xs space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-body-md text-primary leading-snug">
            {payment.paqueteNombre || 'Pago'}
          </h3>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            {payment.clasesCantidad
              ? `${payment.clasesCantidad} ${payment.clasesCantidad === 1 ? 'clase' : 'clases'} • `
              : ''}
            {methodLabel}
            {payment.numeroOperacion ? ` • Op: ${payment.numeroOperacion}` : ''}
          </p>
        </div>
        <span className="text-body-md font-bold text-primary whitespace-nowrap shrink-0">
          {formatArsPrice(payment.monto)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container">
        <span className="text-[12px] text-on-surface-variant">
          {formatPaymentDateTime(payment.creadoEn)}
        </span>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
        >
          {badge.label}
        </span>
      </div>

      {payment.estado === 'rechazado' && payment.motivoRechazo ? (
        <p className="text-[12px] text-error bg-error/5 rounded-xl px-3 py-2">
          Motivo: {payment.motivoRechazo}
        </p>
      ) : null}

      {canInform ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isMutating}
          data-testid={`customer-inform-payment-mobile-btn-${payment.id}`}
          onClick={() => onInformPayment?.(payment)}
          className="w-full justify-center"
        >
          <span>Informar pago</span>
        </Button>
      ) : isPendingConfirmation ? (
        <Button
          href={buildPaymentWhatsappNoticeUrl(payment, studentName)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="sm"
          data-testid={`customer-whatsapp-notice-mobile-btn-${payment.id}`}
          className="w-full justify-center"
        >
          <Icon name="chat" className="text-[16px] mr-1.5" />
          <span>Dar aviso por Whatsapp</span>
        </Button>
      ) : null}
    </article>
  );
}
