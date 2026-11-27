import React, { useCallback, useEffect, useRef, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/atoms/Icon';
import Button from '../components/atoms/Button';
import Snackbar from '../components/molecules/Snackbar';
import ReportPaymentModal from '../components/molecules/ReportPaymentModal';
import { useAuth } from '../hooks/useAuth';
import { fetchPackages } from '../services/packageService';
import {
  DEFAULT_COBROS_CONFIG,
  fetchCobrosConfig,
  fetchUserMemberships,
  fetchUserPayments,
  reportPaymentNotice,
} from '../services/paymentService';

const PAYMENT_STATUS_LABEL = {
  pendiente_conciliacion: 'Pendiente conciliación',
  aprobado: 'Acreditado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
};

/**
 * CustomerPage View
 * Path: /customer
 * Workspace for users with role="customer" (alumnas)
 */
export default function CustomerPage() {
  const { user, userProfile } = useAuth();
  const reportDialogRef = useRef(null);

  const [packages, setPackages] = useState([]);
  const [cobrosConfig, setCobrosConfig] = useState(DEFAULT_COBROS_CONFIG);
  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, variant: 'success', message: '' });

  const fullName = userProfile?.nombre
    ? `${userProfile.nombre} ${userProfile.apellido || ''}`.trim()
    : user?.displayName || 'Alumna';
  const firstName = userProfile?.nombre || user?.displayName?.split(' ')[0] || 'Alumna';
  const email = userProfile?.email || user?.email || '';

  const uid = user?.uid;

  const loadCustomerData = useCallback(async () => {
    if (!uid) return;
    try {
      const [pkgs, cfg, pays, mems] = await Promise.all([
        fetchPackages(),
        fetchCobrosConfig(),
        fetchUserPayments(uid),
        fetchUserMemberships(uid),
      ]);
      setPackages(pkgs);
      setCobrosConfig(cfg);
      setPayments(pays);
      setMemberships(mems);
    } catch {
      // Keep graceful defaults if a collection is still empty
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return undefined;
    let active = true;
    Promise.all([
      fetchPackages(),
      fetchCobrosConfig(),
      fetchUserPayments(uid),
      fetchUserMemberships(uid),
    ])
      .then(([pkgs, cfg, pays, mems]) => {
        if (!active) return;
        setPackages(pkgs);
        setCobrosConfig(cfg);
        setPayments(pays);
        setMemberships(mems);
      })
      .catch(() => {
        // Keep graceful defaults if a collection is still empty
      });
    return () => {
      active = false;
    };
  }, [uid]);

  const activeMemberships = memberships.filter(
    (m) => m.estado === 'activa' || m.estado === 'pendiente_conciliacion'
  );
  const totalCredits = activeMemberships.reduce(
    (sum, m) => sum + (Number(m.creditosRestantes) || 0),
    0
  );
  const hasProvisional = activeMemberships.some((m) => m.provisional);
  const hasPendingPayment = payments.some((p) => p.estado === 'pendiente_conciliacion');

  const handleReportPayment = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await reportPaymentNotice({
        userId: user.uid,
        userName: fullName,
        userEmail: email,
        ...payload,
      });
      await loadCustomerData();
      setSnackbar({
        open: true,
        variant: 'success',
        message: res?.pagoId
          ? 'Aviso registrado. Tenés créditos provisorios listos para reservar mientras se confirma el cobro.'
          : 'Aviso registrado.',
      });
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        variant: 'error',
        message: error.message || 'No se pudo registrar el aviso de pago.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      roleName="Alumna"
      roleBadge="customer"
      userName={fullName}
      userEmail={email}
    >
      <div className="space-y-6">
        <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Espacio Alumna • Emuná Pilates
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
              ¡Hola, {firstName}!
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Tenés turnos disponibles para reservar en las 4 camas reformer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              disabled={hasPendingPayment}
              data-testid="customer-report-payment-btn"
              onClick={() => reportDialogRef.current?.showModal()}
              className="bg-surface-container-lowest cursor-pointer"
            >
              <Icon name="payments" className="text-[18px] mr-2" />
              <span>{hasPendingPayment ? 'Pago en conciliación' : 'Reportar pago'}</span>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Saldo de Clases
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary-container/60 text-secondary flex items-center justify-center">
                <Icon name="confirmation_number" className="text-[18px]" />
              </div>
            </div>
            <div className="mt-3">
              <p data-testid="customer-credits-count" className="text-3xl font-bold text-primary">
                {totalCredits} {totalCredits === 1 ? 'crédito' : 'créditos'}
              </p>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                {hasProvisional
                  ? 'Incluye créditos provisorios pendientes de conciliación.'
                  : 'Créditos disponibles para reservar clases.'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col justify-between sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Mis avisos de pago
              </span>
              <Icon name="receipt_long" className="text-[18px] text-secondary" />
            </div>
            {payments.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                Todavía no registraste avisos de pago.
              </p>
            ) : (
              <div className="space-y-2" data-testid="customer-payments-list">
                {payments.slice(0, 3).map((pay) => (
                  <div
                    key={pay.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-body-sm border-b border-surface-container-high/50 pb-1.5 last:border-0"
                  >
                    <span>
                      <strong>{pay.paqueteNombre}</strong> (${Number(pay.monto || 0).toLocaleString('es-AR')})
                    </span>
                    <span className="text-xs font-semibold text-secondary">
                      {PAYMENT_STATUS_LABEL[pay.estado] || pay.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="p-4 rounded-xl bg-surface-container border border-surface-container-highest flex items-start gap-3">
          <Icon name="info" className="text-secondary text-[20px] shrink-0 mt-0.5" />
          <div className="text-body-sm text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface font-semibold">Política de cupos y cancelación:</strong>{' '}
            Las clases tienen cupo estricto de 4 camas para garantizar corrección personalizada. Podés cancelar o reprogramar con hasta 4 horas de anticipación sin perder el crédito de tu paquete.
          </div>
        </section>
      </div>

      <ReportPaymentModal
        dialogRef={reportDialogRef}
        packages={packages}
        cobrosConfig={cobrosConfig}
        isMutating={isSubmitting}
        onClose={() => reportDialogRef.current?.close()}
        onSubmit={handleReportPayment}
      />

      <Snackbar
        open={snackbar.open}
        variant={snackbar.variant}
        message={snackbar.message}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </DashboardLayout>
  );
}
