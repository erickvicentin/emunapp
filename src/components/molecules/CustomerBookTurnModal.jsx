import React from "react";
import Icon from "../atoms/Icon";
import Button from "../atoms/Button";
import {
  DEFAULT_MAX_CAPACITY,
  parseTurnDateTime,
} from "../../utils/scheduleUtils";
import {
  formatArsPrice,
  getPackageNumericPrice,
} from "../../services/packageService";

function formatTurnDisplayDate(dateKey) {
  if (!dateKey) return "";
  const date = parseTurnDateTime(dateKey, "12:00");
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function CreditBookingNotice({ totalCredits }) {
  const remainingAfter = Math.max(0, totalCredits - 1);

  return (
    <div
      data-testid="customer-book-credit-notice"
      className="p-4 rounded-xl bg-secondary-container/45 border border-secondary/30 space-y-2"
    >
      <div className="flex items-start gap-2.5">
        <Icon
          name="confirmation_number"
          className="text-[20px] text-secondary shrink-0 mt-0.5"
        />
        <div className="text-body-sm text-on-surface space-y-1">
          <p className="font-semibold text-primary">
            Se descontará 1 crédito de tu saldo disponible
          </p>
          <p className="text-on-surface-variant">
            No debés realizar ningún pago extra. Luego de confirmar te quedarán{" "}
            <strong
              data-testid="customer-book-remaining-credits"
              className="text-primary"
            >
              {remainingAfter} {remainingAfter === 1 ? "crédito" : "créditos"}
            </strong>
            .
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 pt-2 border-t border-secondary/20 text-[12px] text-on-surface-variant">
        <Icon
          name="schedule"
          className="text-[16px] text-secondary shrink-0 mt-0.5"
        />
        <span>
          Tenés hasta <strong className="text-on-surface">4 horas antes</strong>{" "}
          del inicio de la clase para cancelar sin perder tu crédito.
        </span>
      </div>
    </div>
  );
}

function TransferBookingNotice({ cobrosConfig, individualPackage }) {
  const priceNumeric = getPackageNumericPrice(individualPackage);
  const priceLabel =
    priceNumeric > 0 ? formatArsPrice(priceNumeric) : "una clase individual";

  return (
    <div
      data-testid="customer-book-transfer-notice"
      className="p-4 rounded-xl bg-surface-container border border-surface-container-highest space-y-3"
    >
      <div className="flex items-start gap-2.5">
        <Icon
          name="info"
          className="text-[20px] text-secondary shrink-0 mt-0.5"
        />
        <div className="text-body-sm text-on-surface space-y-1">
          <p className="font-semibold text-primary">
            Reserva sujeta a aprobación del administrador
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            No tenés créditos disponibles. Podés reservar este horario y quedará
            pendiente hasta que envíes el comprobante de pago por el importe de{" "}
            <strong className="text-primary">
              {priceNumeric > 0
                ? `una clase individual (${priceLabel})`
                : priceLabel}
            </strong>{" "}
            hasta el horario de la clase.
          </p>
        </div>
      </div>

      <div
        data-testid="customer-book-bank-details"
        className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high text-[12px] space-y-1.5"
      >
        <p className="font-label-sm uppercase tracking-wider text-secondary font-semibold">
          Datos para transferir
        </p>
        <div className="flex justify-between gap-2">
          <span className="text-on-surface-variant">Alias:</span>
          <code className="font-mono font-semibold text-primary">
            {cobrosConfig?.alias || "-"}
          </code>
        </div>
        {cobrosConfig?.cvu && (
          <div className="flex justify-between gap-2">
            <span className="text-on-surface-variant">CVU / CBU:</span>
            <code className="font-mono font-semibold text-primary">
              {cobrosConfig.cvu}
            </code>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <span className="text-on-surface-variant">Titular:</span>
          <span className="font-medium text-primary">
            {cobrosConfig?.titularCuenta || "-"}
          </span>
        </div>
        {cobrosConfig?.cuilCuit && (
          <div className="flex justify-between gap-2">
            <span className="text-on-surface-variant">CUIL / CUIT:</span>
            <code className="font-mono font-medium text-primary">
              {cobrosConfig.cuilCuit}
            </code>
          </div>
        )}
      </div>

      <p className="text-[12px] text-on-surface-variant leading-relaxed">
        Una vez realizada la transferencia, informá el pago en la sección{" "}
        <strong className="text-on-surface">Pagos</strong> o desde{" "}
        <strong className="text-on-surface">Turnos → Próximos turnos</strong>.
      </p>
    </div>
  );
}

/**
 * CustomerBookTurnModal Molecule
 * Native modal <dialog> for confirming a student turn booking with or without credits.
 */
export default function CustomerBookTurnModal({
  dialogRef,
  turn,
  totalCredits = 0,
  cobrosConfig,
  individualPackage,
  isMutating = false,
  onClose,
  onConfirm,
}) {
  const maxCap = Number(turn?.maxCapacity) || DEFAULT_MAX_CAPACITY;
  const occupied = Number(turn?.cuposOcupados) || 0;
  const availableSpots = Math.max(0, maxCap - occupied);
  const hasCredits = totalCredits > 0;

  return (
    <dialog
      ref={dialogRef}
      data-testid="customer-book-turn-dialog"
      aria-labelledby="customer-book-turn-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Confirmar Reserva
          </span>
          <h1
            id="customer-book-turn-title"
            data-testid="customer-book-turn-title"
            className="font-headline-sm text-headline-sm font-semibold text-primary mt-0.5 capitalize"
          >
            {turn ? formatTurnDisplayDate(turn.dateKey) : "Turno"}
          </h1>
        </div>
        <button
          type="button"
          data-testid="customer-book-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {turn && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Horario
              </span>
              <strong className="text-primary">{turn.startTime} hs</strong>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Duración
              </span>
              <strong className="text-primary">
                {turn.durationMinutes} min
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Instructora
              </span>
              <strong className="text-primary">
                {turn.instructorName || "Maria Luz Bogado Niclis"}
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Cupos disponibles
              </span>
              <strong className="text-primary">
                {availableSpots} de {maxCap}
              </strong>
            </div>
          </div>

          {hasCredits ? (
            <CreditBookingNotice totalCredits={totalCredits} />
          ) : (
            <TransferBookingNotice
              cobrosConfig={cobrosConfig}
              individualPackage={individualPackage}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              autoFocus
              data-testid="customer-book-cancel-btn"
              onClick={onClose}
              disabled={isMutating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              data-testid="customer-book-confirm-btn"
              onClick={() => onConfirm?.(turn)}
              disabled={isMutating}
            >
              {isMutating ? "Reservando..." : "Confirmar reserva"}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
