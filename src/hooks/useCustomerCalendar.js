import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bookTurnAsStudent,
  cancelReservationAsStudent,
  fetchClosedDaysForKeys,
  fetchUserReservations,
  fetchWeeklyScheduleTemplate,
  fetchWeekTurns,
  hideCancelledReservationsForStudent,
} from '../services/scheduleService';
import {
  DEFAULT_COBROS_CONFIG,
  fetchCobrosConfig,
  fetchUserMemberships,
  reportReservationPaymentNotice,
} from '../services/paymentService';
import { fetchPackages } from '../services/packageService';
import {
  addDays,
  buildCustomerWeekTurns,
  buildWeekDays,
  formatDateKey,
  getWeekStartMonday,
} from '../utils/scheduleUtils';

function toDateOrNull(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function computeAvailableCredits(memberships = [], nowMs) {
  return memberships
    .filter((m) => {
      const exp = toDateOrNull(m.fechaVencimiento);
      const provisionalExp = m.provisional ? toDateOrNull(m.expiresAt) : null;
      return (
        (m.estado === 'activa' || m.estado === 'pendiente_conciliacion') &&
        (!exp || exp.getTime() >= nowMs) &&
        (!provisionalExp || provisionalExp.getTime() >= nowMs)
      );
    })
    .reduce((sum, m) => sum + (Number(m.creditosRestantes) || 0), 0);
}

/**
 * Read-only weekly calendar, credits, booking & upcoming reservations hook
 * for the Customer (Alumno) panel.
 */
export function useCustomerCalendar({ uid, userName, userEmail, isEnabled = true, showSnackbar }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStartMonday(new Date()));
  const [closedDaysMap, setClosedDaysMap] = useState({});
  const [turns, setTurns] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [cobrosConfig, setCobrosConfig] = useState(DEFAULT_COBROS_CONFIG);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(isEnabled));
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState('');

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const weekDateKeys = useMemo(() => weekDays.map((d) => d.dateKey), [weekDays]);

  const loadAccountData = useCallback(async () => {
    if (!uid) return;
    try {
      const [userMemberships, userReservations, cfg, pkgs] = await Promise.all([
        fetchUserMemberships(uid),
        fetchUserReservations(uid),
        fetchCobrosConfig(),
        fetchPackages(),
      ]);
      setTotalCredits(computeAvailableCredits(userMemberships, Date.now()));
      setReservations(userReservations);
      setCobrosConfig(cfg);
      setPackages(pkgs);
    } catch {
      // Keep graceful defaults if collections are empty
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return undefined;
    let active = true;

    Promise.all([
      fetchUserMemberships(uid),
      fetchUserReservations(uid),
      fetchCobrosConfig(),
      fetchPackages(),
    ])
      .then(([userMemberships, userReservations, cfg, pkgs]) => {
        if (!active) return;
        setTotalCredits(computeAvailableCredits(userMemberships, Date.now()));
        setReservations(userReservations);
        setCobrosConfig(cfg);
        setPackages(pkgs);
      })
      .catch(() => {
        if (active) setTotalCredits(0);
      });

    return () => {
      active = false;
    };
  }, [uid]);

  const reloadWeek = useCallback(async () => {
    if (!isEnabled) return;
    const [template, closed, existingTurns] = await Promise.all([
      fetchWeeklyScheduleTemplate(),
      fetchClosedDaysForKeys(weekDateKeys),
      fetchWeekTurns(weekDateKeys),
    ]);
    setClosedDaysMap(closed);
    setTurns(buildCustomerWeekTurns(weekDays, template, closed, existingTurns));
  }, [isEnabled, weekDays, weekDateKeys]);

  useEffect(() => {
    if (!isEnabled) return undefined;
    let active = true;

    Promise.all([
      fetchWeeklyScheduleTemplate(),
      fetchClosedDaysForKeys(weekDateKeys),
      fetchWeekTurns(weekDateKeys),
    ])
      .then(([template, closed, existingTurns]) => {
        if (!active) return;
        setClosedDaysMap(closed);
        setTurns(buildCustomerWeekTurns(weekDays, template, closed, existingTurns));
        setLoadError('');
      })
      .catch(() => {
        if (!active) return;
        setLoadError('No se pudo cargar la agenda semanal.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isEnabled, weekDays, weekDateKeys]);

  const [todayKey] = useState(() => formatDateKey(new Date()));

  const upcomingReservations = useMemo(
    () =>
      reservations.filter(
        (r) => String(r.dateKey || '') >= todayKey && !r.ocultoParaAlumno
      ),
    [reservations, todayKey]
  );

  const individualPackage = useMemo(
    () =>
      packages.find(
        (p) => p.active !== false && (p.id === 'plan-individual' || Number(p.classesCount) === 1)
      ) || null,
    [packages]
  );

  const bookTurn = async (turno) => {
    if (!uid || !turno) return false;
    setIsMutating(true);
    try {
      const result = await bookTurnAsStudent({
        turno,
        student: {
          id: uid,
          nombreApellido: userName,
          email: userEmail,
        },
      });
      await Promise.all([reloadWeek(), loadAccountData()]);
      showSnackbar?.(
        'success',
        result.estado === 'confirmada'
          ? '¡Turno reservado y confirmado! Se descontó 1 crédito de tu saldo.'
          : 'Reserva registrada. Queda pendiente de aprobación hasta que informes el comprobante de pago.'
      );
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo confirmar la reserva.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const reportReservationPayment = async ({ reservation, fechaTransferencia }) => {
    if (!uid) return false;
    setIsMutating(true);
    try {
      await reportReservationPaymentNotice({
        userId: uid,
        userName,
        userEmail,
        reservation,
        individualPackage,
        fechaTransferencia,
      });
      await loadAccountData();
      showSnackbar?.(
        'success',
        'Pago informado correctamente. Queda pendiente de aprobación del administrador.'
      );
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo informar el pago.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const cancelReservation = async (reserva) => {
    if (!uid || !reserva) return false;
    setIsMutating(true);
    try {
      const res = await cancelReservationAsStudent(reserva);
      await Promise.all([reloadWeek(), loadAccountData()]);
      showSnackbar?.(
        'success',
        res?.credited
          ? 'Turno cancelado correctamente. Se acreditó 1 crédito en tu saldo.'
          : 'Turno cancelado correctamente.'
      );
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo cancelar el turno.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const clearCancelledReservations = async () => {
    if (!uid) return false;
    setIsMutating(true);
    try {
      const count = await hideCancelledReservationsForStudent(upcomingReservations);
      await loadAccountData();
      if (count > 0) {
        showSnackbar?.('success', 'Turnos cancelados limpiados de tu lista.');
      }
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudieron limpiar los turnos cancelados.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const goToPreviousWeek = () => {
    setIsLoading(true);
    setWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setIsLoading(true);
    setWeekStart((prev) => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setIsLoading(true);
    setWeekStart(getWeekStartMonday(new Date()));
  };

  return {
    weekDays,
    closedDaysMap,
    turns,
    totalCredits,
    upcomingReservations,
    cobrosConfig,
    packages,
    individualPackage,
    isLoading,
    isMutating,
    loadError,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    bookTurn,
    reportReservationPayment,
    cancelReservation,
    clearCancelledReservations,
  };
}
