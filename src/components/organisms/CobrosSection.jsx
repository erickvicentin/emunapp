import React, { useMemo, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import CobrosConfigCard from '../molecules/CobrosConfigCard';
import ReceiptPreviewModal from '../molecules/ReceiptPreviewModal';
import CashNoticeModal from '../molecules/CashNoticeModal';

const EMPTY_LIST = [];

const STATUS_MAP = {
  pendiente_conciliacion: {
    label: 'Pendiente conciliación',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  aprobado: {
    label: 'Acreditado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  rechazado: {
    label: 'Rechazado',
    classes: 'bg-error-container text-on-error-container border-error/30',
  },
  vencido: {
    label: 'Vencido',
    classes: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  },
};

const FILTER_TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendiente_conciliacion', label: 'Pendientes' },
  { id: 'aprobado', label: 'Acreditados' },
  { id: 'cerrados', label: 'Rechazados / Vencidos' },
];

/**
 * CobrosSection Organism
 * Manages payment reconciliation, destination account config, receipt preview, and cash notices.
 */
export default function CobrosSection({
  isAdmin = false,
  paymentsManager,
  students = EMPTY_LIST,
  packages = EMPTY_LIST,
}) {
  const [filter, setFilter] = useState('todos');
  const [previewPayment, setPreviewPayment] = useState(null);
  const previewDialogRef = useRef(null);
  const cashDialogRef = useRef(null);

  const {
    payments = EMPTY_LIST,
    cobrosConfig,
    isLoading,
    isMutating,
    saveConfig,
    approvePayment,
    rejectPayment,
    registerCashNotice,
    sweepExpired,
  } = paymentsManager;

  const filteredPayments = useMemo(() => {
    if (filter === 'todos') return payments;
    if (filter === 'cerrados') {
      return payments.filter((p) => p.estado === 'rechazado' || p.estado === 'vencido');
    }
    return payments.filter((p) => p.estado === filter);
  }, [payments, filter]);

  const pendingCount = payments.filter((p) => p.estado === 'pendiente_conciliacion').length;
  const approvedCount = payments.filter((p) => p.estado === 'aprobado').length;

  return (
    <div data-testid="cobros-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración
          </span>
          <h1 data-testid="cobros-title" className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
            Cobros y Conciliación
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Controlá avisos de transferencia o efectivo, comprobantes y conciliación manual dentro de las 24 hs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMutating}
            data-testid="cobros-sweep-expired-btn"
            onClick={sweepExpired}
            className="bg-surface-container-lowest"
          >
            <Icon name="schedule_send" className="text-[17px] mr-1.5" />
            <span>Limpiar vencidos</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            data-testid="cobros-register-cash-btn"
            onClick={() => cashDialogRef.current?.showModal()}
          >
            <Icon name="payments" className="text-[17px] mr-1.5" />
            <span>Registrar efectivo</span>
          </Button>
        </div>
      </section>

      {isAdmin && (
        <CobrosConfigCard config={cobrosConfig} isMutating={isMutating} onSave={saveConfig} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" data-testid="cobros-filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`cobros-filter-${tab.id}`}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-label-md font-semibold border transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-body-sm text-on-surface-variant">
          <strong className="text-primary">{pendingCount}</strong> pendientes •{' '}
          <strong className="text-primary">{approvedCount}</strong> acreditados
        </p>
      </div>

      {isLoading ? (
        <div data-testid="cobros-loading" className="p-8 text-center text-body-md text-on-surface-variant">
          Cargando cobros...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div
          data-testid="cobros-empty"
          className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center text-body-md text-on-surface-variant"
        >
          No hay cobros registrados en esta vista.
        </div>
      ) : (
        <div className="space-y-3" data-testid="cobros-list">
          {filteredPayments.map((pay) => {
            const badge = STATUS_MAP[pay.estado] || STATUS_MAP.pendiente_conciliacion;
            const isPending = pay.estado === 'pendiente_conciliacion';

            return (
              <div
                key={pay.id}
                data-testid={`cobros-row-${pay.id}`}
                className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-label-lg font-semibold text-primary">
                      {pay.alumnoNombre}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                      {pay.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {pay.paqueteNombre} ({pay.clasesCantidad} clases) •{' '}
                    <strong className="text-primary">
                      ${Number(pay.monto || 0).toLocaleString('es-AR')}
                    </strong>
                    {pay.numeroOperacion && (
                      <>
                        {' '}• Op: <code className="font-mono text-secondary">{pay.numeroOperacion}</code>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {(pay.comprobanteDataUrl || pay.comprobanteNombre) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreviewPayment(pay);
                        previewDialogRef.current?.showModal();
                      }}
                    >
                      <span>Ver comprobante</span>
                    </Button>
                  )}

                  {isAdmin && isPending && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        data-testid={`cobros-reject-${pay.id}`}
                        onClick={() => rejectPayment(pay, 'Pago no acreditado / rechazado')}
                        className="border-error/40 text-error hover:bg-error-container/40"
                      >
                        <span>Rechazar</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isMutating}
                        data-testid={`cobros-approve-${pay.id}`}
                        onClick={() => approvePayment(pay)}
                      >
                        <span>Acreditar</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReceiptPreviewModal
        dialogRef={previewDialogRef}
        payment={previewPayment}
        onClose={() => previewDialogRef.current?.close()}
      />

      <CashNoticeModal
        dialogRef={cashDialogRef}
        students={students}
        packages={packages}
        isMutating={isMutating}
        onClose={() => cashDialogRef.current?.close()}
        onSubmit={registerCashNotice}
      />
    </div>
  );
}
