import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG,
  DEFAULT_COBROS_CONFIG,
  DEFAULT_STUDIO_CONFIG,
  approvePaymentByAdmin,
  deleteRejectedPaymentByAdmin,
  fetchAdminEmailNotifConfig,
  fetchAllPayments,
  fetchCobrosConfig,
  fetchStudioConfig,
  rejectPaymentByAdmin,
  reportPaymentNotice,
  saveAdminEmailNotifConfig,
  saveCobrosConfig,
  saveStudioConfig,
  subscribeAllPayments,
  sweepExpiredProvisionalPayments,
} from '../services/paymentService';

/**
 * Hook for managing Cobros (payments, transfer account config, studio config, and provisional expiry).
 */
export function usePaymentsManager({ isEnabled = true, showSnackbar }) {
  const [payments, setPayments] = useState([]);
  const [cobrosConfig, setCobrosConfig] = useState(DEFAULT_COBROS_CONFIG);
  const [studioConfig, setStudioConfig] = useState(DEFAULT_STUDIO_CONFIG);
  const [adminEmailNotifConfig, setAdminEmailNotifConfig] = useState(
    DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadData = useCallback(async () => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [list, config, studio, adminNotif] = await Promise.all([
        fetchAllPayments(),
        fetchCobrosConfig(),
        fetchStudioConfig(),
        fetchAdminEmailNotifConfig(),
      ]);
      setPayments(list);
      setCobrosConfig(config);
      setStudioConfig(studio);
      setAdminEmailNotifConfig(adminNotif);
    } catch (error) {
      showSnackbar?.('error', error.message || 'No se pudieron cargar los cobros.');
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, showSnackbar]);

  useEffect(() => {
    let active = true;
    if (!isEnabled) {
      return () => {
        active = false;
      };
    }

    const unsubscribePayments = subscribeAllPayments(
      (list) => {
        if (!active) return;
        setPayments(list);
        setIsLoading(false);
      },
      (error) => {
        if (!active) return;
        showSnackbar?.('error', error.message || 'No se pudieron cargar los cobros.');
        setIsLoading(false);
      }
    );

    Promise.all([fetchCobrosConfig(), fetchStudioConfig(), fetchAdminEmailNotifConfig()])
      .then(([config, studio, adminNotif]) => {
        if (!active) return;
        setCobrosConfig(config);
        setStudioConfig(studio);
        setAdminEmailNotifConfig(adminNotif);
      })
      .catch((error) => {
        if (!active) return;
        showSnackbar?.('error', error.message || 'No se pudieron cargar los cobros.');
      });

    return () => {
      active = false;
      unsubscribePayments();
    };
  }, [isEnabled, showSnackbar]);

  const runMutation = async (fn, successMsg, onSuccess) => {
    setIsMutating(true);
    try {
      const result = await fn();
      onSuccess?.(result);
      if (successMsg) showSnackbar?.('success', successMsg);
      return result ?? true;
    } catch (error) {
      showSnackbar?.('error', error.message || 'No se pudo completar la operación.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    payments,
    cobrosConfig,
    studioConfig,
    adminEmailNotifConfig,
    isLoading,
    isMutating,
    refreshPayments: loadData,
    saveConfig: (nextConfig) =>
      runMutation(
        () => saveCobrosConfig(nextConfig),
        'Configuración de cobros actualizada.',
        (saved) => setCobrosConfig((prev) => ({ ...prev, ...saved }))
      ),
    saveStudioSettings: (nextStudio) =>
      runMutation(
        () => saveStudioConfig(nextStudio),
        'Configuración del estudio actualizada.',
        (saved) => setStudioConfig((prev) => ({ ...prev, ...saved }))
      ),
    saveAdminEmailNotifSettings: (nextNotif) =>
      runMutation(
        () => saveAdminEmailNotifConfig(nextNotif),
        'Preferencias de notificaciones por email actualizadas.',
        (saved) => setAdminEmailNotifConfig((prev) => ({ ...prev, ...saved }))
      ),
    approvePayment: (pago) =>
      runMutation(
        () => approvePaymentByAdmin(pago),
        `Pago de ${pago.alumnoNombre} acreditado definitivamente.`,
        () =>
          setPayments((prev) =>
            prev.map((item) =>
              item.id === pago.id ? { ...item, estado: 'aprobado' } : item
            )
          )
      ),
    rejectPayment: (pago, motivo) =>
      runMutation(
        () => rejectPaymentByAdmin(pago, motivo),
        `Pago de ${pago.alumnoNombre} rechazado y créditos provisorios revocados.`,
        () =>
          setPayments((prev) =>
            prev.map((item) =>
              item.id === pago.id
                ? { ...item, estado: 'rechazado', motivoRechazo: motivo }
                : item
            )
          )
      ),
    deletePayment: (pago) =>
      runMutation(
        () => deleteRejectedPaymentByAdmin(pago),
        `Registro de pago rechazado de ${pago.alumnoNombre} eliminado.`,
        () => setPayments((prev) => prev.filter((item) => item.id !== pago.id))
      ),
    registerCashNotice: ({ student, pkg, montoInformado }) =>
      runMutation(
        () =>
          reportPaymentNotice({
            userId: student.id,
            userName: student.nombreApellido,
            userEmail: student.email,
            pkg,
            metodoPago: 'efectivo',
            montoInformado,
          }),
        `Aviso de pago en efectivo registrado para ${student.nombreApellido} (pendiente de confirmación).`
      ),
    sweepExpired: async () => {
      setIsMutating(true);
      try {
        const res = await sweepExpiredProvisionalPayments();
        await loadData();
        showSnackbar?.(
          'success',
          `Vencidos procesados: ${res.expiredPayments || 0} pagos y ${res.cancelledBookings || 0} reservas.`
        );
      } catch (error) {
        showSnackbar?.('error', error.message || 'No se pudieron limpiar los vencidos.');
      } finally {
        setIsMutating(false);
      }
    },
  };
}
