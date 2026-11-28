import React from 'react';
import Icon from '../atoms/Icon';

/**
 * Dashboard overview for AdministratorPage: 4-bed studio check-in grid and pending payment summary.
 */
export default function AdminDashboardOverview({
  beds,
  pendingPayments,
  isAdmin,
  onToggleCheckIn,
  onApprovePayment,
}) {
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
            Matriz de Sala • Turno 18:00 hs
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Monitoreo y check-in de las 4 camas reformer en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold">
            Cupo: 3 / 4 Camas Ocupadas
          </span>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
            <Icon name="bed" className="text-secondary text-[20px]" />
            <span>Ocupación de Camas Reformer (Cupo Máximo 4)</span>
          </h2>
          <span className="font-body-sm text-[12px] text-on-surface-variant">
            Toca para marcar Presente / Ausente
          </span>
        </div>

        <div data-testid="admin-beds-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {beds.map((bed) => {
            const isAvailable = bed.status === 'disponible';
            const isPresent = bed.status === 'presente';
            return (
              <div
                key={bed.id}
                data-testid={`admin-bed-card-${bed.id}`}
                className={`p-5 rounded-2xl border transition-colors shadow-xs flex flex-col justify-between min-h-[160px] ${
                  isAvailable
                    ? 'bg-surface-container-lowest border-dashed border-outline-variant'
                    : isPresent
                      ? 'bg-surface-container-lowest border-secondary/40'
                      : 'bg-surface-container-lowest border-error/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-lg font-bold text-primary">{bed.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold uppercase ${
                      isAvailable
                        ? 'bg-surface-container text-on-surface-variant'
                        : isPresent
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                <div className="my-2">
                  {bed.alumno ? (
                    <div>
                      <p className="font-label-md font-semibold text-primary">{bed.alumno}</p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">
                        Alumna confirmada
                      </p>
                    </div>
                  ) : (
                    <p className="font-body-sm text-[13px] text-on-surface-variant italic">
                      Cama libre disponible
                    </p>
                  )}
                </div>

                {bed.alumno && (
                  <button
                    type="button"
                    data-testid={`admin-bed-checkin-btn-${bed.id}`}
                    onClick={() => onToggleCheckIn(bed.id)}
                    className={`w-full py-1.5 px-3 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      isPresent
                        ? 'bg-surface-container hover:bg-surface-container-high text-primary'
                        : 'bg-primary-container hover:bg-primary text-on-primary'
                    }`}
                  >
                    <Icon name={isPresent ? 'check_circle' : 'person_check'} className="text-[14px]" />
                    <span>{isPresent ? 'Presente (Cambiar)' : 'Check-in'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-label-md font-semibold text-primary">{pay.alumnoNombre}</p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    {pay.paqueteNombre} •{' '}
                    {pay.metodoPago === 'efectivo'
                      ? 'Efectivo'
                      : `Op: ${pay.numeroOperacion || 'Sin nro'}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary font-label-lg">
                    ${Number(pay.monto || 0).toLocaleString('es-AR')}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onApprovePayment(pay)}
                      className="py-1.5 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Icon name="check" className="text-[14px]" />
                      <span>Acreditar</span>
                    </button>
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
