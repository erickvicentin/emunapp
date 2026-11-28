import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import {
  DEFAULT_CLASS_DURATION_MINUTES,
  DEFAULT_MAX_CAPACITY,
  findActiveAndNextTurn,
} from '../../utils/scheduleUtils';

const EMPTY_LIST = [];

function formatShortDate(dateKey = '') {
  const [, month, day] = String(dateKey).split('-');
  if (!day || !month) return dateKey;
  return `${day}/${month}`;
}

function getAttendanceMeta(asistencia) {
  if (asistencia === 'presente') {
    return { label: 'Presente', variant: 'success', border: 'border-secondary/40' };
  }
  if (asistencia === 'ausente') {
    return { label: 'Ausente', variant: 'danger', border: 'border-error/40' };
  }
  return { label: 'Pendiente', variant: 'neutral', border: 'border-outline-variant/60' };
}

function ActiveTurnBedCard({ bedNumber, reservation, isMutating, onMarkAttendance }) {
  if (!reservation) {
    return (
      <div
        data-testid={`admin-bed-card-${bedNumber}`}
        className="p-5 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest shadow-xs flex flex-col justify-between min-h-[168px]"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-lg font-bold text-primary">Cama {bedNumber}</span>
          <Badge variant="neutral">Disponible</Badge>
        </div>
        <p className="font-body-sm text-[13px] text-on-surface-variant italic my-2">
          Cama libre disponible
        </p>
        <div />
      </div>
    );
  }

  const meta = getAttendanceMeta(reservation.asistencia);
  const isPresent = reservation.asistencia === 'presente';
  const isAbsent = reservation.asistencia === 'ausente';

  return (
    <div
      data-testid={`admin-bed-card-${bedNumber}`}
      className={`p-5 rounded-2xl border ${meta.border} bg-surface-container-lowest transition-colors shadow-xs flex flex-col justify-between min-h-[168px]`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-label-lg font-bold text-primary">Cama {bedNumber}</span>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      <div className="my-2">
        <p className="font-label-md font-semibold text-primary">{reservation.alumnoNombre}</p>
        <p className="font-body-sm text-[11px] text-on-surface-variant">
          {reservation.origen === 'admin_sin_cupo'
            ? 'Asignada sin cupo'
            : 'Alumna confirmada'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isMutating}
          data-testid={`admin-bed-present-btn-${reservation.id}`}
          onClick={() => onMarkAttendance(reservation, 'presente')}
          className={`py-1.5 px-2.5 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
            isPresent
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
          }`}
        >
          <Icon name="check_circle" className="text-[14px]" />
          <span>Presente</span>
        </button>
        <button
          type="button"
          disabled={isMutating}
          data-testid={`admin-bed-absent-btn-${reservation.id}`}
          onClick={() => onMarkAttendance(reservation, 'ausente')}
          className={`py-1.5 px-2.5 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
            isAbsent
              ? 'bg-rose-600 text-white'
              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
          }`}
        >
          <Icon name="cancel" className="text-[14px]" />
          <span>Ausente</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Dashboard overview for AdministratorPage: active-turn 4-bed studio check-in grid and pending payment summary.
 */
export default function AdminDashboardOverview({
  turns = EMPTY_LIST,
  reservations = EMPTY_LIST,
  isLoadingCalendar = false,
  isMutatingCalendar = false,
  pendingPayments = EMPTY_LIST,
  isAdmin = false,
  isMutatingPayments = false,
  onMarkAttendance,
  onApprovePayment,
  onRejectPayment,
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const { activeTurn, nextTurn } = useMemo(
    () => findActiveAndNextTurn(turns, now, DEFAULT_CLASS_DURATION_MINUTES),
    [turns, now]
  );

  const activeReservations = useMemo(() => {
    if (!activeTurn) return [];
    return reservations.filter(
      (res) => res.turnoId === activeTurn.id && res.estado === 'confirmada'
    );
  }, [activeTurn, reservations]);

  const maxBeds = Number(activeTurn?.cuposMaximos || DEFAULT_MAX_CAPACITY);
  const bedSlots = useMemo(() => {
    if (!activeTurn) return [];
    const totalSlots = Math.max(maxBeds, activeReservations.length);
    return Array.from({ length: totalSlots }, (_, idx) => ({
      bedNumber: idx + 1,
      reservation: activeReservations[idx] || null,
    }));
  }, [activeTurn, maxBeds, activeReservations]);

  return (
    <div className="space-y-6">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Panel de Administración y Sala • Rol: Staff
          </span>
          <h1
            data-testid="admin-dashboard-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            {activeTurn
              ? `Matriz de Sala • Turno ${activeTurn.startTime} hs`
              : 'Matriz de Sala • Sin turno en curso'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {activeTurn
              ? 'Monitoreo y registro de asistencia (Presente / Ausente) durante el turno en curso.'
              : 'La lista de alumnos y el control de asistencia se habilitan al comenzar cada turno.'}
          </p>
        </div>

        {activeTurn && (
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold">
              Cupo: {activeReservations.length} / {maxBeds} Camas Ocupadas
            </span>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
            <Icon name="bed" className="text-secondary text-[20px]" />
            <span>Ocupación de Camas Reformer (Cupo Máximo {maxBeds})</span>
          </h2>
          {activeTurn && (
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              Marca Presente o Ausente durante todo el turno
            </span>
          )}
        </div>

        {isLoadingCalendar ? (
          <div
            data-testid="admin-dashboard-calendar-loading"
            className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center text-body-md text-on-surface-variant"
          >
            Cargando estado del turno actual...
          </div>
        ) : activeTurn ? (
          <div
            data-testid="admin-beds-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {bedSlots.map((slot) => (
              <ActiveTurnBedCard
                key={slot.bedNumber}
                bedNumber={slot.bedNumber}
                reservation={slot.reservation}
                isMutating={isMutatingCalendar}
                onMarkAttendance={onMarkAttendance}
              />
            ))}
          </div>
        ) : (
          <div
            data-testid="admin-next-turn-banner"
            className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col items-center justify-center text-center gap-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/60 text-on-secondary-container flex items-center justify-center mb-1">
              <Icon name="schedule" className="text-[24px]" />
            </div>
            <p className="font-headline-sm text-headline-sm text-primary font-semibold">
              {nextTurn
                ? `El próximo turno es el ${formatShortDate(nextTurn.dateKey)} a las ${nextTurn.startTime} hs`
                : 'No hay próximos turnos programados en esta semana.'}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Cuando comience el horario del turno verás aquí a las alumnas anotadas para registrar su asistencia.
            </p>
          </div>
        )}
      </section>

      <section
        data-testid="admin-payments-section"
        className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs"
      >
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
              <Icon name="account_balance" className="text-secondary text-[20px]" />
              <span>Conciliación Manual de Transferencias</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Valida los comprobantes para acreditar las clases al saldo de las alumnas.
            </p>
          </div>
          <span className="font-label-sm text-label-sm bg-surface-container px-2.5 py-1 rounded-full text-secondary font-semibold">
            {pendingPayments.length} pendientes
          </span>
        </div>

        <div className="divide-y divide-surface-container-high/60 mt-3">
          {pendingPayments.length === 0 ? (
            <p className="py-6 text-center text-body-sm text-on-surface-variant">
              No hay transferencias pendientes de conciliación.
            </p>
          ) : (
            pendingPayments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                data-testid={`dashboard-payment-row-${pay.id}`}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-label-md font-semibold text-primary">{pay.alumnoNombre}</p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    {pay.paqueteNombre} 
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-primary font-label-lg mr-1">
                    ${Number(pay.monto || 0).toLocaleString('es-AR')}
                  </span>
                  {isAdmin && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutatingPayments}
                        data-testid={`dashboard-reject-payment-${pay.id}`}
                        onClick={() => onRejectPayment(pay, 'Pago no acreditado / rechazado')}
                        className="border-error/40 text-error hover:bg-error-container/40"
                      >
                        <Icon name="close" className="text-[14px] mr-1" />
                        <span>Rechazar</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isMutatingPayments}
                        data-testid={`dashboard-approve-payment-${pay.id}`}
                        onClick={() => onApprovePayment(pay)}
                      >
                        <Icon name="check" className="text-[14px] mr-1" />
                        <span>Acreditar</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
