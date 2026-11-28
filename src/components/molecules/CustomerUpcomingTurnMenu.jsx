import React, { useEffect, useState } from 'react';
import Icon from '../atoms/Icon';
import { canCancelWithRefund } from '../../utils/scheduleUtils';

const CANCELLABLE_STATES = new Set([
  'confirmada',
  'esperando_comprobante',
  'comprobante_rechazado',
]);

const CANCELLED_STATES = new Set([
  'cancelada',
  'cancelado_estudio',
  'cancelado_tiempo',
  'cancelado_tarde',
]);

/**
 * CustomerUpcomingTurnMenu Molecule
 * Three-dot popup menu for row actions on an upcoming reservation:
 * Ver detalle, Agregar a mi calendario, and Cancelar turno (>= 4h before start).
 */
export default function CustomerUpcomingTurnMenu({
  reservation,
  whatsappPaymentUrl = '',
  onViewDetail,
  onAddToCalendar,
  onCancelTurn,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const isCancelled = CANCELLED_STATES.has(reservation.estado);
  const isPendingReview = reservation.estado === 'pendiente_confirmacion';
  const withinRefundWindow = canCancelWithRefund(
    reservation.dateKey,
    reservation.startTime
  );
  const canCancel =
    CANCELLABLE_STATES.has(reservation.estado) && withinRefundWindow;

  let cancelSublabel = '';
  if (isPendingReview) {
    cancelSublabel = 'Pago en revisión';
  } else if (!isCancelled && !withinRefundWindow) {
    cancelSublabel = 'Disponible hasta 4 hs antes';
  }

  return (
    <div className="relative shrink-0">
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-10"
        />
      )}

      <button
        type="button"
        data-testid={`upcoming-turn-actions-btn-${reservation.id}`}
        aria-label="Acciones del turno"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="relative z-20 w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
      >
        <Icon name="more_vert" className="text-[20px]" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          data-testid={`upcoming-turn-menu-${reservation.id}`}
          className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-lg py-1 text-left"
        >
          <button
            type="button"
            role="menuitem"
            data-testid={`upcoming-turn-detail-btn-${reservation.id}`}
            onClick={() => {
              setMenuOpen(false);
              onViewDetail?.(reservation);
            }}
            className="w-full px-3.5 py-2 text-left text-body-sm font-medium text-primary hover:bg-surface-container flex items-center gap-2.5 cursor-pointer"
          >
            <Icon name="visibility" className="text-[18px] text-secondary" />
            <span>Ver detalle</span>
          </button>

          {!isCancelled && (
            <button
              type="button"
              role="menuitem"
              data-testid={`upcoming-turn-calendar-btn-${reservation.id}`}
              onClick={() => {
                setMenuOpen(false);
                onAddToCalendar?.(reservation);
              }}
              className="w-full px-3.5 py-2 text-left text-body-sm font-medium text-primary hover:bg-surface-container flex items-center gap-2.5 cursor-pointer"
            >
              <Icon name="event" className="text-[18px] text-secondary" />
              <span>Agregar a mi calendario</span>
            </button>
          )}

          {isPendingReview && whatsappPaymentUrl && (
            <a
              role="menuitem"
              href={whatsappPaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`upcoming-turn-whatsapp-link-${reservation.id}`}
              onClick={() => setMenuOpen(false)}
              className="w-full px-3.5 py-2 text-left text-body-sm font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer"
            >
              <Icon name="chat" className="text-[18px]" />
              <span>Avisar por WhatsApp</span>
            </a>
          )}

          {!isCancelled && (
            <button
              type="button"
              role="menuitem"
              disabled={!canCancel}
              data-testid={`upcoming-turn-cancel-btn-${reservation.id}`}
              onClick={() => {
                setMenuOpen(false);
                onCancelTurn?.(reservation);
              }}
              className="w-full px-3.5 py-2 text-left text-body-sm font-medium text-error hover:bg-error-container/40 disabled:opacity-45 disabled:pointer-events-none flex items-start gap-2.5 cursor-pointer"
            >
              <Icon name="cancel" className="text-[18px] shrink-0 mt-0.5" />
              <span className="flex flex-col">
                <span>Cancelar turno</span>
                {cancelSublabel && (
                  <span className="text-[11px] font-normal text-on-surface-variant">
                    {cancelSublabel}
                  </span>
                )}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
