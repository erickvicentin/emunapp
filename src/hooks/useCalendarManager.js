import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyBatchBaseSchedule,
  assignStudentToTurn,
  cancelTurnByStudio,
  clearDayTurns,
  createBaseScheduleSlot,
  createCustomTurn,
  deleteBaseScheduleSlot,
  deleteOrDisableTurn,
  ensureWeekTurns,
  fetchClosedDaysForKeys,
  fetchWeeklyScheduleTemplate,
  fetchWeekReservations,
  markDayClosed,
  markReservationAttendance,
  removeReservationByAdmin,
  reopenClosedDay,
  reopenTurnByStudio,
  saveWeeklyBaseSchedule,
  updateBaseScheduleSlot,
} from '../services/scheduleService';
import {
  addDays,
  buildWeekDays,
  getWeekStartMonday,
} from '../utils/scheduleUtils';

/**
 * Custom hook managing the weekly calendar, base template, closed days, turns, and reservations.
 */
export function useCalendarManager({ isEnabled = true, showSnackbar }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStartMonday(new Date()));
  const [baseSlots, setBaseSlots] = useState([]);
  const [closedDaysMap, setClosedDaysMap] = useState({});
  const [turns, setTurns] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(isEnabled));
  const [isMutating, setIsMutating] = useState(false);

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const weekDateKeys = useMemo(() => weekDays.map((d) => d.dateKey), [weekDays]);

  const reloadWeek = useCallback(async () => {
    if (!isEnabled) return;
    try {
      const [template, closed] = await Promise.all([
        fetchWeeklyScheduleTemplate(),
        fetchClosedDaysForKeys(weekDateKeys),
      ]);
      const weekTurns = await ensureWeekTurns(weekDays, template, closed);
      const weekRes = await fetchWeekReservations(weekDateKeys);

      setBaseSlots(template);
      setClosedDaysMap(closed);
      setTurns(weekTurns);
      setReservations(weekRes);
    } catch {
      showSnackbar?.('error', 'No se pudo cargar la agenda semanal.');
    }
  }, [isEnabled, weekDays, weekDateKeys, showSnackbar]);

  useEffect(() => {
    if (!isEnabled) return;
    let active = true;

    async function load() {
      try {
        const [template, closed] = await Promise.all([
          fetchWeeklyScheduleTemplate(),
          fetchClosedDaysForKeys(weekDateKeys),
        ]);
        const weekTurns = await ensureWeekTurns(weekDays, template, closed);
        const weekRes = await fetchWeekReservations(weekDateKeys);

        if (active) {
          setBaseSlots(template);
          setClosedDaysMap(closed);
          setTurns(weekTurns);
          setReservations(weekRes);
        }
      } catch {
        if (active) {
          showSnackbar?.('error', 'No se pudo cargar la agenda semanal.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isEnabled, weekDays, weekDateKeys, showSnackbar]);

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

  const runMutation = async (fn, successMsg) => {
    setIsMutating(true);
    try {
      await fn();
      await reloadWeek();
      if (successMsg) showSnackbar?.('success', successMsg);
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'Ocurrió un error al guardar los cambios.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    weekStart,
    weekDays,
    baseSlots,
    closedDaysMap,
    turns,
    reservations,
    isLoading,
    isMutating,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    addBaseSlot: (data) =>
      runMutation(() => createBaseScheduleSlot(data), 'Horario base agregado.'),
    applyBatchSlots: (data) =>
      runMutation(
        () => applyBatchBaseSchedule(data),
        'Grilla base actualizada desde hoy en adelante.'
      ),
    saveBaseSchedule: (draftByDay) =>
      runMutation(
        () => saveWeeklyBaseSchedule(draftByDay),
        'Grilla semanal guardada. Los turnos futuros afectados fueron cancelados con devolución de créditos.'
      ),
    toggleBaseSlot: (slot) =>
      runMutation(
        () => updateBaseScheduleSlot(slot.id, { active: slot.active === false }),
        `Horario ${slot.startTime} ${slot.active === false ? 'activado' : 'pausado'}.`
      ),
    removeBaseSlot: (slotId) =>
      runMutation(() => deleteBaseScheduleSlot(slotId), 'Horario base eliminado.'),
    addCustomTurn: (data) =>
      runMutation(
        () => createCustomTurn({ ...data, closedDaysMap }),
        'Turno puntual creado correctamente.'
      ),
    cancelTurn: (turnoId, reason) =>
      runMutation(
        () => cancelTurnByStudio(turnoId, reason),
        'Turno cancelado y créditos devueltos.'
      ),
    reopenTurn: (turnoId) =>
      runMutation(
        () => reopenTurnByStudio(turnoId),
        'Turno habilitado nuevamente.'
      ),
    deleteTurn: (turno) =>
      runMutation(
        () => deleteOrDisableTurn(turno),
        'Turno eliminado de esta fecha.'
      ),
    clearDayTurns: (dateKey) =>
      runMutation(
        () => clearDayTurns(dateKey),
        'Todos los turnos del día fueron eliminados y los créditos devueltos.'
      ),
    closeDay: (dateKey, reason) =>
      runMutation(
        () => markDayClosed(dateKey, reason),
        'Día marcado como cerrado / feriado.'
      ),
    reopenDay: (dateKey) =>
      runMutation(() => reopenClosedDay(dateKey), 'Día habilitado nuevamente.'),
    assignStudent: (turnoId, student) =>
      runMutation(
        () => assignStudentToTurn({ turnoId, student }),
        `${student.nombreApellido} asignado/a al turno.`
      ),
    removeReservation: (reserva) =>
      runMutation(
        () => removeReservationByAdmin(reserva),
        'Reserva eliminada del turno.'
      ),
    markAttendance: (reserva, nextAttendance) =>
      runMutation(
        () => markReservationAttendance({ reserva, nextAttendance }),
        'Asistencia actualizada.'
      ),
  };
}
