import React from "react";
import Icon from "../atoms/Icon";
import Button from "../atoms/Button";
import { STUDIO_INFO } from "../../data/landingData";
import {
  canCancelWithRefund,
  DEFAULT_CLASS_DURATION_MINUTES,
  formatBlockEndLabel,
} from "../../utils/scheduleUtils";

const CANCELLABLE_STATES = new Set([
  "confirmada",
  "esperando_comprobante",
  "comprobante_rechazado",
]);

const CANCELLED_STATES = new Set([
  "cancelada",
  "cancelado_estudio",
  "cancelado_tiempo",
  "cancelado_tarde",
]);

function getMobileTurnMeta(reservation) {
  const duration =
    Number(reservation.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES;
  const endLabel = formatBlockEndLabel(reservation.startTime, duration);
  const canReportPayment =
    reservation.estado === "esperando_comprobante" ||
    reservation.estado === "comprobante_rechazado";
  const isCancelled = CANCELLED_STATES.has(reservation.estado);
  const isPendingReview = reservation.estado === "pendiente_confirmacion";
  const withinRefundWindow = canCancelWithRefund(
    reservation.dateKey,
    reservation.startTime,
  );
  const canCancel =
    CANCELLABLE_STATES.has(reservation.estado) && withinRefundWindow;

  let cancelNote = "";
  if (isPendingReview) cancelNote = "Pago en revisión";
  else if (!isCancelled && !withinRefundWindow)
    cancelNote = "Disponible hasta 4 hs antes";

  return {
    duration,
    endLabel,
    canReportPayment,
    isCancelled,
    canCancel,
    cancelNote,
    reasonText:
      reservation.motivoRechazo || reservation.motivoCancelacion || "",
  };
}

function MobileTurnDetailPanel({
  reservation,
  metaInfo,
  onReportPayment,
  onAddToCalendar,
  onCancelTurn,
}) {
  return (
    <div
      data-testid={`upcoming-turn-mobile-detail-${reservation.id}`}
      className="pt-3 mt-3 border-t border-surface-container space-y-3"
    >
      <div className="space-y-2.5 text-body-sm">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Profesora
          </span>
          <span className="text-on-surface font-medium">
            {reservation.instructorName || "Profesora Titular"}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Duración
          </span>
          <span className="text-on-surface font-medium">
            {metaInfo.duration} min (hasta {metaInfo.endLabel} hs)
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Ubicación
          </span>
          <span className="text-on-surface font-medium">
            {STUDIO_INFO.address || "Emuná Pilates"}
          </span>
        </div>

        {metaInfo.reasonText && (
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-error">
              Motivo
            </span>
            <span className="text-error">{metaInfo.reasonText}</span>
          </div>
        )}
      </div>

      {metaInfo.canReportPayment && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          data-testid={`upcoming-turn-pay-mobile-btn-${reservation.id}`}
          onClick={() => onReportPayment?.(reservation)}
          className="w-full justify-center"
        >
          <Icon name="payments" className="text-[16px] mr-1.5" />
          <span>Informar pago</span>
        </Button>
      )}

      {!metaInfo.isCancelled && (
        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid={`upcoming-turn-mobile-calendar-btn-${reservation.id}`}
            onClick={() => onAddToCalendar?.(reservation)}
            className="w-full justify-center bg-surface-container-lowest"
          >
            <Icon name="event" className="text-[16px] mr-1.5" />
            <span>Agregar al calendario</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!metaInfo.canCancel}
            data-testid={`upcoming-turn-mobile-cancel-btn-${reservation.id}`}
            onClick={() => onCancelTurn?.(reservation)}
            className="w-full justify-center bg-surface-container-lowest text-error border-error/30 hover:bg-error-container/30"
          >
            <Icon name="event_repeat" className="text-[16px] mr-1.5" />
            <span>
              {metaInfo.cancelNote
                ? `Cambiar turno (${metaInfo.cancelNote})`
                : "Cambiar / cancelar turno"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * CustomerUpcomingTurnMobileCard Molecule
 * Mobile-only (< sm) vertical card with Fecha, Horario, and Status stacked vertically;
 * tapping the card expands inline stacked details and action buttons.
 */
export default function CustomerUpcomingTurnMobileCard({
  reservation,
  formattedDate,
  meta,
  isExpanded,
  onToggleExpand,
  onReportPayment,
  onAddToCalendar,
  onCancelTurn,
}) {
  const metaInfo = getMobileTurnMeta(reservation);

  return (
    <div className="sm:hidden w-full">
      <button
        type="button"
        aria-expanded={isExpanded}
        data-testid={`upcoming-turn-mobile-toggle-${reservation.id}`}
        onClick={onToggleExpand}
        className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0 flex-1 flex flex-col items-start gap-1.5">
          <span className="font-semibold text-body-md text-primary capitalize leading-snug">
            {formattedDate}
          </span>
          <span className="text-body-sm font-medium text-on-surface">
            {reservation.startTime} hs
          </span>
          <span
            data-testid={`upcoming-turn-mobile-status-${reservation.id}`}
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
          >
            {meta.label}
          </span>
        </div>

        <Icon
          name={isExpanded ? "expand_less" : "expand_more"}
          className="text-[20px] text-on-surface-variant shrink-0 mt-0.5"
        />
      </button>

      {isExpanded && (
        <MobileTurnDetailPanel
          reservation={reservation}
          metaInfo={metaInfo}
          onReportPayment={onReportPayment}
          onAddToCalendar={onAddToCalendar}
          onCancelTurn={onCancelTurn}
        />
      )}
    </div>
  );
}
