import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchUserPayments,
  hideRejectedPaymentsForStudent,
  informPackagePaymentNotice,
  reportPaymentNotice,
  subscribeUserPayments,
} from '../services/paymentService';
import { getPackageNumericPrice } from '../services/packageService';

/**
 * Custom hook for the customer's payment history and package reservation notices.
 */
export function useCustomerPayments({
  uid,
  userName,
  userEmail,
  reservations = [],
  onAccountUpdated,
  showSnackbar,
}) {
  const [allPayments, setAllPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(uid));
  const [isMutating, setIsMutating] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!uid) {
      setAllPayments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await fetchUserPayments(uid);
      setAllPayments(list);
    } catch {
      showSnackbar?.('error', 'No se pudo cargar tu historial de pagos.');
    } finally {
      setIsLoading(false);
    }
  }, [uid, showSnackbar]);

  useEffect(() => {
    if (!uid) return undefined;
    let active = true;

    const unsubscribe = subscribeUserPayments(
      uid,
      (list) => {
        if (!active) return;
        setAllPayments(list);
        setIsLoading(false);
      },
      () => {
        if (!active) return;
        showSnackbar?.('error', 'No se pudo cargar tu historial de pagos.');
        setIsLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, showSnackbar]);

  const visiblePayments = useMemo(
    () => allPayments.filter((p) => !p.ocultoParaAlumno),
    [allPayments]
  );

  const hasPendingConfirmation = useMemo(
    () =>
      allPayments.some((p) =>
        ['pendiente_informar', 'pendiente_conciliacion'].includes(p.estado)
      ),
    [allPayments]
  );

  const hasPendingReservationPayment = useMemo(
    () =>
      reservations.some((r) =>
        ['esperando_comprobante', 'pendiente_confirmacion'].includes(r.estado)
      ),
    [reservations]
  );

  const isPackageReservationBlocked = hasPendingConfirmation || hasPendingReservationPayment;

  const rejectedCount = useMemo(
    () => visiblePayments.filter((p) => p.estado === 'rechazado').length,
    [visiblePayments]
  );

  const submitPackagePayment = async (pkg) => {
    if (!uid || !pkg) return false;
    setIsMutating(true);
    try {
      await reportPaymentNotice({
        userId: uid,
        userName,
        userEmail,
        pkg,
        metodoPago: 'transferencia',
        montoInformado: getPackageNumericPrice(pkg),
        initialEstado: 'pendiente_informar',
      });
      await Promise.all([loadPayments(), onAccountUpdated?.()]);
      showSnackbar?.(
        'success',
        `Paquete "${pkg.name}" reservado. Tenés créditos provisorios mientras informás la transferencia.`
      );
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo registrar la reserva del paquete.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const informPackagePayment = async ({
    pagoId,
    numeroOperacion,
    montoInformado,
    comprobanteNombre,
    comprobanteDataUrl,
  }) => {
    if (!uid || !pagoId) return false;
    setIsMutating(true);
    try {
      await informPackagePaymentNotice({
        pagoId,
        numeroOperacion,
        montoInformado,
        comprobanteNombre,
        comprobanteDataUrl,
      });
      showSnackbar?.(
        'success',
        'Pago informado correctamente. Queda pendiente de confirmación por Administración.'
      );
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo informar el pago.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const clearRejectedPayments = async () => {
    if (rejectedCount === 0) return false;
    setIsMutating(true);
    try {
      const count = await hideRejectedPaymentsForStudent(visiblePayments);
      await loadPayments();
      if (count > 0) {
        showSnackbar?.(
          'success',
          count === 1
            ? 'Se limpió 1 pago rechazado de tu historial.'
            : `Se limpiaron ${count} pagos rechazados de tu historial.`
        );
      }
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudieron limpiar los pagos rechazados.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    payments: visiblePayments,
    isLoading,
    isMutating,
    hasPendingConfirmation,
    hasPendingReservationPayment,
    isPackageReservationBlocked,
    rejectedCount,
    loadPayments,
    submitPackagePayment,
    informPackagePayment,
    clearRejectedPayments,
  };
}
