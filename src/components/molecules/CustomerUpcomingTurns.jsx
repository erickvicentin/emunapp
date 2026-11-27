import React from "react";
import Icon from "../atoms/Icon";
import Button from "../atoms/Button";
import { parseTurnDateTime } from "../../utils/scheduleUtils";

const EMPTY_LIST = [];

const STATUS_META = {
  esperando_comprobante: {
    label: "Esperando comprobante",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
  },
  confirmada: {
    label: "Turno confirmado",
    badgeClass:
      "bg-secondary-container text-on-secondary-container border-secondary/30",
  },
  comprobante_rechazado: {
    label: "Comprobante rechazado",
    badgeClass: "bg-error-container text-on-error-container border-error/40",
  },
  cancelada: {
    label: "Turno cancelado",
    badgeClass:
      "bg-surface-container-highest text-on-surface-variant border-outline-variant/60",
  },
  cancelado_estudio: {
    label: "Turno cancelado",
    badgeClass:
      "bg-surface-container-highest text-on-surface-variant border-outline-variant/60",
  },
  cancelado_tiempo: {
    label: "Turno cancelado",
    badgeClass:
      "bg-surface-container-highest text-on-surface-variant border-outline-variant/60",
  },
  cancelado_tarde: {
    label: "Turno cancelado",
    badgeClass:
      "bg-surface-container-highest text-on-surface-variant border-outline-variant/60",
  },
};

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
  onReportPayment,
}) {
  return (
    <section
      data-testid="customer-upcoming-turns"
      className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-primary">
            Próximos turnos...
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ordenados desde el más próximo en adelante.
          </p>
        </div>
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
            const meta = STATUS_META[res.estado] || STATUS_META.confirmada;
            const awaitingReceipt = res.estado === "esperando_comprobante";

            return (
              <li
                key={res.id}
                data-testid={`upcoming-turn-row-${res.id}`}
                className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-body-md text-primary capitalize">
                      {formatReservationDate(res.dateKey)}
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
                    {res.instructorName || "Profesora Titular"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  {awaitingReceipt && (
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
                  <button
                    type="button"
                    data-testid={`upcoming-turn-actions-btn-${res.id}`}
                    aria-label="Acciones del turno"
                    title="Acciones"
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
