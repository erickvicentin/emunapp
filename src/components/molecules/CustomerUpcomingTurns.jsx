import React, { useState } from "react";
import Icon from "../atoms/Icon";
import Button from "../atoms/Button";
import CustomerUpcomingTurnMenu from "./CustomerUpcomingTurnMenu";
import CustomerUpcomingTurnMobileCard from "./CustomerUpcomingTurnMobileCard";
import { buildAdminWhatsappPaymentUrl } from "../../utils/calendarExport";
import { formatArsPrice, getPackageNumericPrice } from "../../services/packageService";
import {
  parseTurnDateTime,
  UPCOMING_STATUS_META,
} from "../../utils/scheduleUtils";

const EMPTY_LIST = [];

const CANCELLED_STATES = new Set([
  'cancelada',
  'cancelado_estudio',
  'cancelado_tiempo',
  'cancelado_tarde',
]);

function formatReservationDate(dateKey) {
  if (!dateKey) return "";
  const date = parseTurnDateTime(dateKey, "12:00");
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

/**
 * CustomerUpcomingTurns Molecule
 * Lists upcoming student reservations ordered from nearest to furthest,
 * with status pill, "Informar pago" CTA when awaiting receipt, and a right-aligned actions button.
 */
export default function CustomerUpcomingTurns({
  reservations = EMPTY_LIST,
  individualPackage = null,
  isMutating = false,
  onReportPayment,
  onViewDetail,
  onAddToCalendar,
  onCancelTurn,
  onClearCancelled,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const individualPrice = getPackageNumericPrice(individualPackage);
  const amountLabel = individualPrice > 0 ? formatArsPrice(individualPrice) : "$---";
  const whatsappPaymentUrl = buildAdminWhatsappPaymentUrl({
    conceptLabel: "la clase individual",
    amountLabel,
  });
  const hasCancelled = reservations.some((r) => CANCELLED_STATES.has(r.estado));

  return (
    <section
      data-testid="customer-upcoming-turns"
      className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-primary">
            Próximos turnos...
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ordenados desde el más próximo en adelante.
          </p>
        </div>

        {hasCancelled && onClearCancelled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMutating}
            data-testid="customer-clear-cancelled-btn"
            onClick={onClearCancelled}
            className="bg-surface-container-lowest"
          >
            <Icon name="cleaning_services" className="text-[16px] mr-1.5" />
            <span>Limpiar turnos cancelados</span>
          </Button>
        )}
      </div>

      {reservations.length === 0 ? (
        <p
          data-testid="customer-upcoming-empty"
          className="text-body-sm text-on-surface-variant py-4 text-center rounded-xl bg-surface-container-lowest border border-surface-container-high"
        >
          Todavía no tenés próximos turnos reservados.
        </p>
      ) : (
        <ul className="space-y-2.5" data-testid="customer-upcoming-list">
          {reservations.map((res) => {
            const meta = UPCOMING_STATUS_META[res.estado] || UPCOMING_STATUS_META.confirmada;
            const canReportPayment =
              res.estado === "esperando_comprobante" ||
              res.estado === "comprobante_rechazado";

            const formattedDate = formatReservationDate(res.dateKey);

            return (
              <li
                key={res.id}
                data-testid={`upcoming-turn-row-${res.id}`}
                className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high"
              >
                {/* Mobile expandable vertical card (< sm) */}
                <CustomerUpcomingTurnMobileCard
                  reservation={res}
                  formattedDate={formattedDate}
                  meta={meta}
                  isExpanded={expandedId === res.id}
                  onToggleExpand={() =>
                    setExpandedId((prev) => (prev === res.id ? null : res.id))
                  }
                  onReportPayment={onReportPayment}
                  onAddToCalendar={onAddToCalendar}
                  onCancelTurn={onCancelTurn}
                />

                {/* Desktop row (>= sm) */}
                <div className="hidden sm:flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-body-md text-primary capitalize">
                        {formattedDate}
                      </span>
                      <span className="text-body-sm font-medium text-on-surface">
                        {res.startTime} hs
                      </span>
                      <span
                        data-testid={`upcoming-turn-status-${res.id}`}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      Profesor/a: {res.instructorName || "Profesora Titular"}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    {canReportPayment && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid={`upcoming-turn-pay-btn-${res.id}`}
                        onClick={() => onReportPayment?.(res)}
                        className="bg-surface-container-lowest"
                      >
                        <Icon name="payments" className="text-[16px] mr-1.5" />
                        <span>Informar pago</span>
                      </Button>
                    )}
                    <CustomerUpcomingTurnMenu
                      reservation={res}
                      whatsappPaymentUrl={whatsappPaymentUrl}
                      onViewDetail={onViewDetail}
                      onAddToCalendar={onAddToCalendar}
                      onCancelTurn={onCancelTurn}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
