import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_COBROS_CONFIG,
  approvePaymentByAdmin,
  fetchAllPayments,
  fetchCobrosConfig,
  rejectPaymentByAdmin,
  reportPaymentNotice,
  saveCobrosConfig,
  sweepExpiredProvisionalPayments,
} from '../services/paymentService';

/**
 * Hook for managing Cobros (payments, transfer account config, and provisional expiry).
 */
export function usePaymentsManager({ isEnabled = true, showSnackbar }) {
  const [payments, setPayments] = useState([]);
  const [cobrosConfig, setCobrosConfig] = useState(DEFAULT_COBROS_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadData = useCallback(async () => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [list, config] = await Promise.all([fetchAllPayments(), fetchCobrosConfig()]);
      setPayments(list);
      setCobrosConfig(config);
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
    Promise.all([fetchAllPayments(), fetchCobrosConfig()])
      .then(([list, config]) => {
        if (!active) return;
        setPayments(list);
        setCobrosConfig(config);
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
    isLoading,
    isMutating,
    refreshPayments: loadData,
    saveConfig: (nextConfig) =>
      runMutation(
        () => saveCobrosConfig(nextConfig),
        'Configuración de cobros actualizada.'
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
