import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_COBROS_CONFIG,
  DEFAULT_STUDIO_CONFIG,
  approvePaymentByAdmin,
  deleteRejectedPaymentByAdmin,
  fetchAllPayments,
  fetchCobrosConfig,
  fetchStudioConfig,
  rejectPaymentByAdmin,
  reportPaymentNotice,
  saveCobrosConfig,
  saveStudioConfig,
  sweepExpiredProvisionalPayments,
} from '../services/paymentService';

/**
 * Hook for managing Cobros (payments, transfer account config, studio config, and provisional expiry).
 */
export function usePaymentsManager({ isEnabled = true, showSnackbar }) {
  const [payments, setPayments] = useState([]);
  const [cobrosConfig, setCobrosConfig] = useState(DEFAULT_COBROS_CONFIG);
  const [studioConfig, setStudioConfig] = useState(DEFAULT_STUDIO_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadData = useCallback(async () => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [list, config, studio] = await Promise.all([
        fetchAllPayments(),
        fetchCobrosConfig(),
        fetchStudioConfig(),
      ]);
      setPayments(list);
      setCobrosConfig(config);
      setStudioConfig(studio);
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
    Promise.all([fetchAllPayments(), fetchCobrosConfig(), fetchStudioConfig()])
      .then(([list, config, studio]) => {
        if (!active) return;
        setPayments(list);
        setCobrosConfig(config);
        setStudioConfig(studio);
      })
      .catch((error) => {
        if (!active) return;
        showSnackbar?.('error', error.message || 'No se pudieron cargar los cobros.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isEnabled, showSnackbar]);

  const runMutation = async (fn, successMsg) => {
    setIsMutating(true);
    try {
      const result = await fn();
      await loadData();
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
    isLoading,
    isMutating,
    refreshPayments: loadData,
    saveConfig: (nextConfig) =>
      runMutation(
        () => saveCobrosConfig(nextConfig),
        'Configuración de cobros actualizada.'
      ),
    saveStudioSettings: (nextStudio) =>
      runMutation(
        () => saveStudioConfig(nextStudio),
        'Configuración del estudio actualizada.'
      ),
    approvePayment: (pago) =>
      runMutation(
        () => approvePaymentByAdmin(pago),
        `Pago de ${pago.alumnoNombre} acreditado definitivamente.`
      ),
    rejectPayment: (pago, motivo) =>
      runMutation(
        () => rejectPaymentByAdmin(pago, motivo),
        `Pago de ${pago.alumnoNombre} rechazado y créditos provisorios revocados.`
      ),
    deletePayment: (pago) =>
      runMutation(
        () => deleteRejectedPaymentByAdmin(pago),
        `Registro de pago rechazado de ${pago.alumnoNombre} eliminado.`
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
