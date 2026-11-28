export const WEEK_DAYS = [
  { dayOfWeek: 1, short: 'Lun', label: 'Lunes' },
  { dayOfWeek: 2, short: 'Mar', label: 'Martes' },
  { dayOfWeek: 3, short: 'Mié', label: 'Miércoles' },
  { dayOfWeek: 4, short: 'Jue', label: 'Jueves' },
  { dayOfWeek: 5, short: 'Vie', label: 'Viernes' },
  { dayOfWeek: 6, short: 'Sáb', label: 'Sábado' },
  { dayOfWeek: 0, short: 'Dom', label: 'Domingo' },
];

export const DEFAULT_CLASS_DURATION_MINUTES = 50;
export const DEFAULT_BLOCK_MINUTES = 60;
export const DEFAULT_MAX_CAPACITY = 4;
export const STUDENT_CANCEL_MIN_HOURS = 4;
export const STUDENT_CANCEL_GRACE_DAYS = 7;
export const STUDENT_BOOK_MIN_HOURS = 1;
export const STUDENT_BOOK_MIN_MINUTES = 10;
export const STUDENT_BOOK_MAX_DAYS = 30;

export const UPCOMING_STATUS_META = {
  esperando_comprobante: {
    label: 'Esperando informe de pago',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  pendiente_confirmacion: {
    label: 'Esperando confirmación',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  confirmada: {
    label: 'Turno confirmado',
    badgeClass: 'bg-secondary-container text-on-secondary-container border-secondary/30',
  },
  comprobante_rechazado: {
    label: 'Comprobante rechazado',
    badgeClass: 'bg-error-container text-on-error-container border-error/40',
  },
  cancelada: {
    label: 'Turno cancelado',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/60',
  },
  cancelado_estudio: {
    label: 'Turno cancelado',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/60',
  },
  cancelado_tiempo: {
    label: 'Turno cancelado',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/60',
  },
  cancelado_tarde: {
    label: 'Turno cancelado',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/60',
  },
};

export const PRESET_HOUR_SLOTS = Array.from({ length: 15 }, (_, idx) => {
  const hour = String(idx + 7).padStart(2, '0');
  return `${hour}:00`;
});

/**
 * Converts HH:mm into minutes from 00:00.
 */
export function timeToMinutes(hhmm = '00:00') {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Formats HH:mm end minute label for a 60-minute block (e.g. 18:00 -> 18:59).
 */
export function formatBlockEndLabel(startTime, blockMinutes = DEFAULT_BLOCK_MINUTES) {
  const endMinutes = timeToMinutes(startTime) + Math.max(1, blockMinutes - 1);
  const hours = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
  const mins = String(endMinutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

/**
 * Returns true if two class start times overlap within the 60-minute block window.
 */
export function hasTimeOverlap(startA, startB, blockMinutes = DEFAULT_BLOCK_MINUTES) {
  return Math.abs(timeToMinutes(startA) - timeToMinutes(startB)) < blockMinutes;
}

/**
 * Formats a Date object as local YYYY-MM-DD.
 */
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a turn's dateKey (YYYY-MM-DD) and startTime (HH:mm) into a local Date.
 */
export function parseTurnStartDate(dateKey, startTime = '00:00') {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const [hours, minutes] = String(startTime).split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

/**
 * Finds the currently active turn (start <= now < end) and the next upcoming turn.
 */
export function findActiveAndNextTurn(
  turns = [],
  now = new Date(),
  defaultDurationMinutes = DEFAULT_CLASS_DURATION_MINUTES
) {
  const nowMs = now.getTime();
  let activeTurn = null;
  let nextTurn = null;
  let nextTurnStartMs = Infinity;

  for (const turn of turns) {
    if (!turn?.dateKey || !turn?.startTime) continue;
    if (turn.estado === 'cancelado' || turn.estado === 'cancelado_estudio') continue;

    const startMs = parseTurnStartDate(turn.dateKey, turn.startTime).getTime();
    const duration = Number(turn.duracionMinutos) || defaultDurationMinutes;
    const endMs = startMs + duration * 60 * 1000;

    if (startMs <= nowMs && nowMs < endMs) {
      activeTurn = turn;
    } else if (startMs > nowMs && startMs < nextTurnStartMs) {
      nextTurn = turn;
      nextTurnStartMs = startMs;
    }
  }

  return { activeTurn, nextTurn };
}

/**
 * Returns the Monday (00:00:00 local) for the week containing `date`.
 */
export function getWeekStartMonday(date = new Date()) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jsDay = copy.getDay(); // 0=Sun..6=Sat
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  copy.setDate(copy.getDate() + diffToMonday);
  return copy;
}

/**
 * Returns a new Date offset by `days`.
 */
export function addDays(date, days) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Builds the 7-day array (Monday to Sunday) for the week starting at `weekStart`.
 */
export function buildWeekDays(weekStart) {
  return WEEK_DAYS.map((dayMeta, index) => {
    const date = addDays(weekStart, index);
    return {
      ...dayMeta,
      date,
      dateKey: formatDateKey(date),
      displayDate: `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`,
    };
  });
}

/**
 * Parses a local YYYY-MM-DD + HH:mm pair into a Date instance.
 */
export function parseTurnDateTime(dateKey, startTime) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  const [hours, minutes] = String(startTime || '00:00').split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

/**
 * Returns true when a student cancellation qualifies for credit refund (>= 4 hours before start).
 */
export function canCancelWithRefund(dateKey, startTime, now = new Date()) {
  const turnStart = parseTurnDateTime(dateKey, startTime);
  const diffMs = turnStart.getTime() - now.getTime();
  return diffMs >= STUDENT_CANCEL_MIN_HOURS * 60 * 60 * 1000;
}

/**
 * Computes the extended expiration Date (7-day grace window from `now` if current expiration is sooner).
 */
export function computeGraceExpiration(currentExpirationDate, now = new Date()) {
  const graceDate = new Date(now.getTime() + STUDENT_CANCEL_GRACE_DAYS * 24 * 60 * 60 * 1000);
  if (!currentExpirationDate) return graceDate;
  return currentExpirationDate.getTime() > graceDate.getTime()
    ? currentExpirationDate
    : graceDate;
}

/**
 * Returns true when a student is within [now + 1h, now + 30d] to book a slot.
 */
export function isWithinStudentBookingWindow(dateKey, startTime, now = new Date()) {
  const turnStart = parseTurnDateTime(dateKey, startTime);
  const diffMs = turnStart.getTime() - now.getTime();
  const minMs = STUDENT_BOOK_MIN_HOURS * 60 * 60 * 1000;
  const maxMs = STUDENT_BOOK_MAX_DAYS * 24 * 60 * 60 * 1000;
  return diffMs >= minMs && diffMs <= maxMs;
}

/**
 * Returns true when a turn starts at least STUDENT_BOOK_MIN_MINUTES (10 min) in the future.
 */
export function isTurnBookingOpen(dateKey, startTime, now = new Date()) {
  const turnStart = parseTurnDateTime(dateKey, startTime);
  return turnStart.getTime() - now.getTime() >= STUDENT_BOOK_MIN_MINUTES * 60 * 1000;
}

/**
 * Builds the read-only weekly turn list for customers by combining persisted
 * `turnos_clase` documents with virtual turns from `horarios_base` for today
 * and future non-closed days.
 */
export function resolveInstructorName(storedName, configuredProfessorName) {
  const fallback = String(configuredProfessorName || '').trim() || 'Profesora Titular';
  const cleanStored = String(storedName || '').trim();
  if (!cleanStored || cleanStored === 'Profesora Titular') {
    return fallback;
  }
  return cleanStored;
}

export function buildCustomerWeekTurns(
  weekDays = [],
  baseSlots = [],
  closedDaysMap = {},
  existingTurns = [],
  configuredProfessorName = 'Profesora Titular'
) {
  const todayKey = formatDateKey(new Date());
  const normalizedExisting = existingTurns.map((t) => ({
    ...t,
    instructorName: resolveInstructorName(t.instructorName, configuredProfessorName),
  }));
  const existingById = new Set(normalizedExisting.map((t) => t.id));
  const virtualTurns = [];

  for (const day of weekDays) {
    if (day.dateKey < todayKey || closedDaysMap[day.dateKey]) continue;

    const slotsForDay = baseSlots.filter(
      (slot) => slot.active !== false && Number(slot.dayOfWeek) === day.dayOfWeek
    );

    for (const slot of slotsForDay) {
      const deterministicId = `${day.dateKey}_${slot.id}`;
      if (existingById.has(deterministicId)) continue;

      const hasMatchingTime = normalizedExisting.some(
        (t) =>
          t.dateKey === day.dateKey &&
          t.startTime === slot.startTime &&
          t.baseSlotId === slot.id
      );
      if (hasMatchingTime) continue;

      virtualTurns.push({
        id: deterministicId,
        dateKey: day.dateKey,
        startTime: slot.startTime,
        durationMinutes: Number(slot.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
        maxCapacity: Number(slot.maxCapacity) || DEFAULT_MAX_CAPACITY,
        cuposOcupados: 0,
        instructorName: resolveInstructorName(slot.instructorName, configuredProfessorName),
        baseSlotId: slot.id,
        estado: 'programado',
        isVirtual: true,
      });
    }
  }

  return [...normalizedExisting, ...virtualTurns].sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return String(a.startTime).localeCompare(String(b.startTime));
  });
}

/**
 * Computes attendance percentage (0..100) over fixed classes marked presente/ausente/fijada_sin_asistencia.
 */
export function calculateAttendancePercentage(reservations = []) {
  let attended = 0;
  let totalFixed = 0;

  for (const res of reservations) {
    if (res.asistencia === 'presente') {
      attended += 1;
      totalFixed += 1;
    } else if (res.asistencia === 'ausente' || res.estado === 'cancelado_tarde') {
      totalFixed += 1;
    }
  }

  if (totalFixed === 0) return 100;
  return Math.round((attended / totalFixed) * 100);
}
