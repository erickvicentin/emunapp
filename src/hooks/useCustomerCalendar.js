import { useEffect, useMemo, useState } from 'react';
import {
  fetchClosedDaysForKeys,
  fetchWeeklyScheduleTemplate,
  fetchWeekTurns,
} from '../services/scheduleService';
import { fetchUserMemberships } from '../services/paymentService';
import {
  addDays,
  buildCustomerWeekTurns,
  buildWeekDays,
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
 * Read-only weekly calendar & available credits hook for the Customer (Alumno) panel.
 */
export function useCustomerCalendar({ uid, isEnabled = true }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStartMonday(new Date()));
  const [closedDaysMap, setClosedDaysMap] = useState({});
  const [turns, setTurns] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(isEnabled));
  const [loadError, setLoadError] = useState('');

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const weekDateKeys = useMemo(() => weekDays.map((d) => d.dateKey), [weekDays]);

  useEffect(() => {
    if (!uid) return undefined;
    let active = true;

    fetchUserMemberships(uid)
      .then((userMemberships) => {
        if (!active) return;
        setTotalCredits(computeAvailableCredits(userMemberships, Date.now()));
      })
      .catch(() => {
        if (active) setTotalCredits(0);
      });

    return () => {
      active = false;
    };
  }, [uid]);

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
    isLoading,
    loadError,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
