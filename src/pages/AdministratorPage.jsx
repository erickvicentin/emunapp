import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/atoms/Icon';
import { useAuth } from '../hooks/useAuth';

const INITIAL_BEDS = [
  { id: 1, name: 'Cama 1', alumno: 'Sofía Martínez', status: 'presente' },
  { id: 2, name: 'Cama 2', alumno: 'Lucía González', status: 'pendiente' },
  { id: 3, name: 'Cama 3', alumno: null, status: 'disponible' },
  { id: 4, name: 'Cama 4', alumno: 'Valentina Romero', status: 'presente' },
];

const INITIAL_PENDING_PAYMENTS = [
  { id: 'pay-1', alumno: 'Camila Benítez', paquete: '12 Clases', monto: '$42.000', comprobante: 'TRF-982341' },
  { id: 'pay-2', alumno: 'Mariana Duarte', paquete: '8 Clases', monto: '$32.000', comprobante: 'TRF-451209' },
];

/**
 * AdministratorPage View
 * Path: /administrator
 * Workspace for users with role="staff" (instructor / admin)
 */
export default function AdministratorPage() {
  const { user, userProfile } = useAuth();
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [payments, setPayments] = useState(INITIAL_PENDING_PAYMENTS);

  const staffName = userProfile?.nombre
    ? `${userProfile.nombre} ${userProfile.apellido || ''}`.trim()
    : user?.displayName || 'Administradora';

  const staffEmail = userProfile?.email || user?.email || 'admin@emuna.com';

  const toggleCheckIn = (bedId) => {
    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id !== bedId || !bed.alumno) return bed;
        return {
          ...bed,
          status: bed.status === 'presente' ? 'ausente' : 'presente',
        };
      })
    );
  };

  const approvePayment = (payId) => {
    setPayments((prev) => prev.filter((p) => p.id !== payId));
  };

  return (
    <DashboardLayout
      roleName="Instructora / Admin"
      roleBadge="staff"
      userName={staffName}
      userEmail={staffEmail}
    >
      <div className="space-y-6">
        {/* Welcome & Shift Selector */}
        <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Panel de Administración y Sala • Rol: Staff
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
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

        {/* 4-Bed Studio Grid */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beds.map((bed) => {
              const isAvailable = bed.status === 'disponible';
              const isPresent = bed.status === 'presente';
              return (
                <div
                  key={bed.id}
                  className={`p-5 rounded-2xl border transition-colors shadow-xs flex flex-col justify-between min-h-[160px] ${isAvailable
                      ? 'bg-surface-container-lowest border-dashed border-outline-variant'
                      : isPresent
                        ? 'bg-surface-container-lowest border-secondary/40'
                        : 'bg-surface-container-lowest border-error/30'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg font-bold text-primary">
                      {bed.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold uppercase ${isAvailable
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
                        <p className="font-label-md font-semibold text-primary">
                          {bed.alumno}
                        </p>
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
                      onClick={() => toggleCheckIn(bed.id)}
                      className={`w-full py-1.5 px-3 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${isPresent
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

        {/* Pending Bank Transfers Validation */}
        <section className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
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
              {payments.length} pendientes
            </span>
          </div>

          <div className="divide-y divide-surface-container-high/60 mt-3">
            {payments.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-on-surface-variant">
                No hay transferencias pendientes de conciliación.
              </p>
            ) : (
              payments.map((pay) => (
                <div key={pay.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-label-md font-semibold text-primary">{pay.alumno}</p>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">
                      {pay.paquete} • Comprobante: <code className="text-secondary font-mono">{pay.comprobante}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary font-label-lg">{pay.monto}</span>
                    <button
                      type="button"
                      onClick={() => approvePayment(pay.id)}
                      className="py-1.5 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Icon name="check" className="text-[14px]" />
                      <span>Acreditar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
