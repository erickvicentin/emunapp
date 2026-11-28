import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  calculateAttendancePercentage,
  canCancelWithRefund,
  computeGraceExpiration,
  DEFAULT_BLOCK_MINUTES,
  DEFAULT_CLASS_DURATION_MINUTES,
  DEFAULT_MAX_CAPACITY,
  formatDateKey,
  hasTimeOverlap,
  isTurnBookingOpen,
} from '../utils/scheduleUtils';

const BASE_SCHEDULE_COLLECTION = 'horarios_base';
const CLOSED_DAYS_COLLECTION = 'dias_cerrados';
const TURNS_COLLECTION = 'turnos_clase';
const RESERVATIONS_COLLECTION = 'reservas';
const MEMBERSHIPS_COLLECTION = 'membresias_usuario';
const USERS_COLLECTION = 'usuarios';

function toDateOrNull(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sortTurns(list) {
  return [...list].sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.startTime.localeCompare(b.startTime);
  });
}

async function findEarliestActiveMembership(usuarioId, now = new Date()) {
  const q = query(
    collection(db, MEMBERSHIPS_COLLECTION),
    where('usuarioId', '==', usuarioId)
  );
  const snap = await getDocs(q);
  const candidates = snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((m) => {
      const remaining = Number(m.creditosRestantes) || 0;
      const exp = toDateOrNull(m.fechaVencimiento);
      const provisionalExp = m.provisional ? toDateOrNull(m.expiresAt) : null;
      return (
        m.estado !== 'agotada' &&
        m.estado !== 'vencida' &&
        m.estado !== 'cancelada' &&
        remaining > 0 &&
        (!exp || exp.getTime() >= now.getTime()) &&
        (!provisionalExp || provisionalExp.getTime() >= now.getTime())
      );
    })
    .sort((a, b) => {
      const expA = toDateOrNull(a.fechaVencimiento)?.getTime() || Infinity;
      const expB = toDateOrNull(b.fechaVencimiento)?.getTime() || Infinity;
      return expA - expB;
    });

  return candidates[0] || null;
}

async function refundMembershipCreditInTx(tx, membershipId, { applyGrace = false } = {}) {
  if (!membershipId) return;
  const memRef = doc(db, MEMBERSHIPS_COLLECTION, membershipId);
  const memSnap = await tx.get(memRef);
  if (!memSnap.exists()) return;

  const memData = memSnap.data() || {};
  const nextRemaining = (Number(memData.creditosRestantes) || 0) + 1;
  const updates = {
    creditosRestantes: nextRemaining,
    estado: 'activa',
    actualizadoEn: serverTimestamp(),
  };

  if (applyGrace) {
    const currentExp = toDateOrNull(memData.fechaVencimiento);
    const extendedExp = computeGraceExpiration(currentExp);
    updates.fechaVencimiento = Timestamp.fromDate(extendedExp);
  }

  tx.update(memRef, updates);
}

// ===============================================================
// Weekly Base Schedule (horarios_base - Administradora only writes)
// ===============================================================

export async function fetchWeeklyScheduleTemplate() {
  const snap = await getDocs(collection(db, BASE_SCHEDULE_COLLECTION));
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort(
      (a, b) =>
        Number(a.dayOfWeek) - Number(b.dayOfWeek) ||
        String(a.startTime).localeCompare(String(b.startTime))
    );
}

async function syncFutureTurnsForRemovedSlots(slotIds = []) {
  if (!slotIds.length) return;
  const slotSet = new Set(slotIds);
  const todayKey = formatDateKey(new Date());
  const futureQ = query(
    collection(db, TURNS_COLLECTION),
    where('dateKey', '>=', todayKey)
  );
  const snap = await getDocs(futureQ);
  const matchingTurns = snap.docs.filter((docSnap) => {
    const data = docSnap.data();
    return (
      data?.baseSlotId &&
      slotSet.has(data.baseSlotId) &&
      data.estado !== 'cancelado' &&
      data.estado !== 'inhabilitado'
    );
  });

  await Promise.all(
    matchingTurns.map(async (turnDoc) => {
      const data = turnDoc.data();
      if ((Number(data.cuposOcupados) || 0) > 0) {
        await cancelTurnByStudio(turnDoc.id, 'Modificación de grilla horaria');
      } else {
        await deleteDoc(turnDoc.ref);
      }
    })
  );
}

function assertNoOverlapInList(times = []) {
  const sorted = [...times].sort((a, b) => a.localeCompare(b));
  for (let i = 1; i < sorted.length; i += 1) {
    if (hasTimeOverlap(sorted[i - 1], sorted[i], DEFAULT_BLOCK_MINUTES)) {
      throw new Error(
        `Los horarios ${sorted[i - 1]} y ${sorted[i]} se superponen (cada turno bloquea 60 minutos).`
      );
    }
  }
}

export async function createBaseScheduleSlot({
  dayOfWeek,
  startTime,
  durationMinutes = DEFAULT_CLASS_DURATION_MINUTES,
  instructorName = 'Profesora Titular',
}) {
  const existing = await fetchWeeklyScheduleTemplate();
  const sameDayActive = existing.filter(
    (s) => Number(s.dayOfWeek) === Number(dayOfWeek) && s.active !== false
  );
  const conflict = sameDayActive.find((s) =>
    hasTimeOverlap(s.startTime, startTime, DEFAULT_BLOCK_MINUTES)
  );
  if (conflict) {
    throw new Error(
      `El horario ${startTime} se superpone con ${conflict.startTime} (bloqueo de 60 minutos).`
    );
  }

  const payload = {
    dayOfWeek: Number(dayOfWeek),
    startTime: String(startTime).trim(),
    durationMinutes: Number(durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
    maxCapacity: DEFAULT_MAX_CAPACITY,
    instructorName: String(instructorName).trim() || 'Profesora Titular',
    active: true,
    creadoEn: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, BASE_SCHEDULE_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function applyBatchBaseSchedule({
  dayOfWeeks = [],
  startTimes = [],
  durationMinutes = DEFAULT_CLASS_DURATION_MINUTES,
  replaceExisting = false,
}) {
  const uniqueDays = [...new Set(dayOfWeeks.map(Number))];
  const uniqueDaySet = new Set(uniqueDays);
  const uniqueTimes = [...new Set(startTimes.map((t) => String(t).trim()).filter(Boolean))];
  if (uniqueDays.length === 0) {
    throw new Error('Seleccioná al menos un día de la semana.');
  }
  if (uniqueTimes.length === 0 && !replaceExisting) {
    throw new Error('Seleccioná al menos un horario.');
  }

  assertNoOverlapInList(uniqueTimes);
  const existing = await fetchWeeklyScheduleTemplate();

  const slotsToDelete = [];
  if (replaceExisting) {
    for (const slot of existing) {
      if (uniqueDaySet.has(Number(slot.dayOfWeek))) {
        slotsToDelete.push(slot);
      }
    }
    await Promise.all(
      slotsToDelete.map((slot) => deleteDoc(doc(db, BASE_SCHEDULE_COLLECTION, slot.id)))
    );
    await syncFutureTurnsForRemovedSlots(slotsToDelete.map((s) => s.id));
  }

  const batch = writeBatch(db);
  let createdCount = 0;

  for (const day of uniqueDays) {
    const dayExisting = replaceExisting
      ? []
      : existing.filter((s) => Number(s.dayOfWeek) === day && s.active !== false);

    for (const time of uniqueTimes) {
      const overlaps = dayExisting.some((s) =>
        hasTimeOverlap(s.startTime, time, DEFAULT_BLOCK_MINUTES)
      );
      if (overlaps) continue;

      const ref = doc(collection(db, BASE_SCHEDULE_COLLECTION));
      batch.set(ref, {
        dayOfWeek: day,
        startTime: time,
        durationMinutes: Number(durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
        maxCapacity: DEFAULT_MAX_CAPACITY,
        instructorName: 'Profesora Titular',
        active: true,
        creadoEn: serverTimestamp(),
      });
      createdCount += 1;
    }
  }

  if (createdCount > 0) {
    await batch.commit();
  }
}

export async function saveWeeklyBaseSchedule(draftByDay = {}) {
  const existing = await fetchWeeklyScheduleTemplate();
  const existingById = new Map(existing.map((slot) => [slot.id, slot]));

  const keptIds = new Set();
  const toCreate = [];
  const toUpdate = [];

  for (const [dayKey, daySlots] of Object.entries(draftByDay)) {
    const dayOfWeek = Number(dayKey);
    const normalized = (daySlots || [])
      .map((s) => ({
        id: s.id || null,
        startTime: String(s.startTime || '').trim(),
        endTime: String(s.endTime || '').trim(),
        durationMinutes: Number(s.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
      }))
      .filter((s) => s.startTime);

    assertNoOverlapInList(normalized.map((s) => s.startTime));

    for (const slot of normalized) {
      const prev = slot.id ? existingById.get(slot.id) : null;
      if (prev && Number(prev.dayOfWeek) === dayOfWeek && prev.startTime === slot.startTime) {
        keptIds.add(prev.id);
        if (prev.endTime !== slot.endTime || Number(prev.durationMinutes) !== slot.durationMinutes) {
          toUpdate.push({
            id: prev.id,
            endTime: slot.endTime,
            durationMinutes: slot.durationMinutes,
          });
        }
      } else {
        toCreate.push({ dayOfWeek, ...slot });
      }
    }
  }

  const removedIds = existing.filter((s) => !keptIds.has(s.id)).map((s) => s.id);
  if (removedIds.length > 0) {
    await Promise.all(removedIds.map((id) => deleteDoc(doc(db, BASE_SCHEDULE_COLLECTION, id))));
    await syncFutureTurnsForRemovedSlots(removedIds);
  }

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        updateDoc(doc(db, BASE_SCHEDULE_COLLECTION, item.id), {
          endTime: item.endTime,
          durationMinutes: item.durationMinutes,
          actualizadoEn: serverTimestamp(),
        })
      )
    );
  }

  if (toCreate.length > 0) {
    const batch = writeBatch(db);
    for (const item of toCreate) {
      const ref = doc(collection(db, BASE_SCHEDULE_COLLECTION));
      batch.set(ref, {
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        durationMinutes: item.durationMinutes,
        maxCapacity: DEFAULT_MAX_CAPACITY,
        instructorName: 'Profesora Titular',
        active: true,
        creadoEn: serverTimestamp(),
      });
    }
    await batch.commit();
  }
}

export async function updateBaseScheduleSlot(slotId, updates) {
  await updateDoc(doc(db, BASE_SCHEDULE_COLLECTION, slotId), {
    ...updates,
    actualizadoEn: serverTimestamp(),
  });
  if (updates.active === false) {
    await syncFutureTurnsForRemovedSlots([slotId]);
  }
}

export async function deleteBaseScheduleSlot(slotId) {
  await deleteDoc(doc(db, BASE_SCHEDULE_COLLECTION, slotId));
  await syncFutureTurnsForRemovedSlots([slotId]);
}

// ===============================================================
// Closed Days / Holidays (dias_cerrados - Administradora only writes)
// ===============================================================

export async function fetchClosedDaysForKeys(dateKeys = []) {
  if (!dateKeys.length) return {};
  const q = query(
    collection(db, CLOSED_DAYS_COLLECTION),
    where('dateKey', 'in', dateKeys)
  );
  const snap = await getDocs(q);
  const map = {};
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    map[data.dateKey || docSnap.id] = { id: docSnap.id, ...data };
  }
  return map;
}

export async function markDayClosed(dateKey, reason = 'Feriado / Estudio cerrado') {
  await setDoc(doc(db, CLOSED_DAYS_COLLECTION, dateKey), {
    dateKey,
    reason: String(reason || '').trim() || 'Feriado / Estudio cerrado',
    creadoEn: serverTimestamp(),
  });

  // Cancel any existing turns on that date and refund credits for active bookings
  const turnsQ = query(
    collection(db, TURNS_COLLECTION),
    where('dateKey', '==', dateKey)
  );
  const turnsSnap = await getDocs(turnsQ);
  const activeTurnDocs = turnsSnap.docs.filter((d) => d.data()?.estado !== 'cancelado');
  await Promise.all(activeTurnDocs.map((turnDoc) => cancelTurnByStudio(turnDoc.id, reason)));
}

export async function reopenClosedDay(dateKey) {
  await deleteDoc(doc(db, CLOSED_DAYS_COLLECTION, dateKey));
  const turnsQ = query(
    collection(db, TURNS_COLLECTION),
    where('dateKey', '==', dateKey)
  );
  const turnsSnap = await getDocs(turnsQ);
  const cancelledTurnDocs = turnsSnap.docs.filter(
    (d) => d.data()?.estado === 'cancelado'
  );
  await Promise.all(
    cancelledTurnDocs.map((turnDoc) =>
      updateDoc(turnDoc.ref, {
        estado: 'programado',
        motivoCancelacion: '',
        actualizadoEn: serverTimestamp(),
      })
    )
  );
}

// ===============================================================
// Dated Shifts (turnos_clase)
// ===============================================================

export async function fetchWeekTurns(dateKeys = []) {
  if (!dateKeys.length) return [];
  const q = query(
    collection(db, TURNS_COLLECTION),
    where('dateKey', 'in', dateKeys)
  );
  const snap = await getDocs(q);
  return sortTurns(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
}

/**
 * Ensures dated `turnos_clase` documents exist for active base slots on non-closed days.
 */
export async function ensureWeekTurns(weekDays, baseSlots, closedDaysMap) {
  const todayKey = formatDateKey(new Date());
  const dateKeys = weekDays.map((d) => d.dateKey);
  const existingTurns = await fetchWeekTurns(dateKeys);
  const existingById = new Set(existingTurns.map((t) => t.id));
  const batch = writeBatch(db);
  const createdTurns = [];

  for (const day of weekDays) {
    if (day.dateKey < todayKey) continue;
    if (closedDaysMap[day.dateKey]) continue;

    const slotsForDay = baseSlots.filter(
      (slot) => slot.active !== false && Number(slot.dayOfWeek) === day.dayOfWeek
    );

    for (const slot of slotsForDay) {
      const deterministicId = `${day.dateKey}_${slot.id}`;
      if (existingById.has(deterministicId)) continue;

      const hasMatchingTime = existingTurns.some(
        (t) =>
          t.dateKey === day.dateKey &&
          t.startTime === slot.startTime &&
          t.baseSlotId === slot.id
      );
      if (hasMatchingTime) continue;

      const payload = {
        dateKey: day.dateKey,
        startTime: slot.startTime,
        durationMinutes: Number(slot.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
        maxCapacity: Number(slot.maxCapacity) || DEFAULT_MAX_CAPACITY,
        cuposOcupados: 0,
        instructorName: slot.instructorName || 'Profesora Titular',
        baseSlotId: slot.id,
        estado: 'programado',
        creadoEn: serverTimestamp(),
      };
      batch.set(doc(db, TURNS_COLLECTION, deterministicId), payload);
      createdTurns.push({ id: deterministicId, ...payload });
    }
  }

  if (createdTurns.length > 0) {
    await batch.commit();
  }

  return sortTurns([...existingTurns, ...createdTurns]);
}

export async function createCustomTurn({
  dateKey,
  startTime,
  durationMinutes = DEFAULT_CLASS_DURATION_MINUTES,
  instructorName = 'Profesora Titular',
  closedDaysMap = {},
}) {
  if (closedDaysMap[dateKey]) {
    throw new Error('No se pueden crear turnos en un día marcado como cerrado o feriado.');
  }

  const sameDayTurns = await fetchWeekTurns([dateKey]);
  const conflict = sameDayTurns.find(
    (t) =>
      t.estado !== 'inhabilitado' &&
      hasTimeOverlap(t.startTime, startTime, DEFAULT_BLOCK_MINUTES)
  );
  if (conflict) {
    if (conflict.estado === 'cancelado') {
      throw new Error(
        `Ya existe un turno cancelado a las ${conflict.startTime} hs. Si querés usarlo, habilitalo nuevamente desde ese turno.`
      );
    }
    throw new Error(
      `El horario ${startTime} se superpone con el turno de las ${conflict.startTime} hs (bloqueo de 60 minutos).`
    );
  }

  const payload = {
    dateKey,
    startTime: String(startTime).trim(),
    durationMinutes: Number(durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
    maxCapacity: DEFAULT_MAX_CAPACITY,
    cuposOcupados: 0,
    instructorName: String(instructorName).trim() || 'Profesora Titular',
    baseSlotId: null,
    estado: 'programado',
    creadoEn: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, TURNS_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function cancelTurnByStudio(turnoId, reason = 'Cancelado por el estudio') {
  const resQ = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('turnoId', '==', turnoId)
  );
  const resSnap = await getDocs(resQ);
  const activeReservations = resSnap.docs.filter(
    (d) => d.data()?.estado === 'confirmada'
  );

  const uniqueMembershipIds = [
    ...new Set(
      activeReservations
        .filter((d) => d.data()?.creditoConsumido && d.data()?.membresiaId)
        .map((d) => d.data().membresiaId)
    ),
  ];

  await runTransaction(db, async (tx) => {
    const turnRef = doc(db, TURNS_COLLECTION, turnoId);
    const turnSnap = await tx.get(turnRef);
    if (!turnSnap.exists()) return;

    const memSnaps = await Promise.all(
      uniqueMembershipIds.map((id) => tx.get(doc(db, MEMBERSHIPS_COLLECTION, id)))
    );

    const creditRefundCount = {};
    for (const resDoc of activeReservations) {
      const resData = resDoc.data();
      tx.update(resDoc.ref, {
        estado: 'cancelado_estudio',
        motivoCancelacion: reason,
        actualizadoEn: serverTimestamp(),
      });
      if (resData.creditoConsumido && resData.membresiaId) {
        creditRefundCount[resData.membresiaId] =
          (creditRefundCount[resData.membresiaId] || 0) + 1;
      }
    }

    for (const memSnap of memSnaps) {
      if (!memSnap.exists()) continue;
      const refundQty = creditRefundCount[memSnap.id] || 0;
      if (refundQty > 0) {
        const currentRemaining = Number(memSnap.data()?.creditosRestantes) || 0;
        tx.update(memSnap.ref, {
          creditosRestantes: currentRemaining + refundQty,
          estado: 'activa',
          actualizadoEn: serverTimestamp(),
        });
      }
    }

    tx.update(turnRef, {
      estado: 'cancelado',
      motivoCancelacion: reason,
      cuposOcupados: 0,
      actualizadoEn: serverTimestamp(),
    });
  });
}

export async function reopenTurnByStudio(turnoId) {
  await updateDoc(doc(db, TURNS_COLLECTION, turnoId), {
    estado: 'programado',
    motivoCancelacion: '',
    actualizadoEn: serverTimestamp(),
  });
}

/**
 * Deletes a one-off turn or disables a base-generated turn for this specific date
 * (refunding credits for any confirmed reservations first).
 */
export async function deleteOrDisableTurn(turno) {
  await cancelTurnByStudio(turno.id, 'Turno eliminado de la agenda');
  if (!turno.baseSlotId) {
    await deleteDoc(doc(db, TURNS_COLLECTION, turno.id));
    return;
  }
  await updateDoc(doc(db, TURNS_COLLECTION, turno.id), {
    estado: 'inhabilitado',
    actualizadoEn: serverTimestamp(),
  });
}

/**
 * Deletes or disables all turns on a given date, refunding credits for any confirmed reservations.
 */
export async function clearDayTurns(dateKey) {
  const turns = await fetchWeekTurns([dateKey]);
  const targets = turns.filter((t) => t.estado !== 'inhabilitado');
  await Promise.all(targets.map((turn) => deleteOrDisableTurn(turn)));
}

// ===============================================================
// Reservations & Attendance (reservas)
// ===============================================================

export async function fetchWeekReservations(dateKeys = []) {
  if (!dateKeys.length) return [];
  const q = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('dateKey', 'in', dateKeys)
  );
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function assignStudentToTurn({ turnoId, student }) {
  const existingQ = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('turnoId', '==', turnoId),
    where('usuarioId', '==', student.id)
  );
  const existingSnap = await getDocs(existingQ);
  const alreadyConfirmed = existingSnap.docs.some(
    (d) => d.data()?.estado === 'confirmada'
  );
  if (alreadyConfirmed) {
    throw new Error(`${student.nombreApellido} ya está inscripto/a en este turno.`);
  }

  const membership = await findEarliestActiveMembership(student.id);
  const reservationId = `${turnoId}_${student.id}_${Date.now()}`;

  await runTransaction(db, async (tx) => {
    const turnRef = doc(db, TURNS_COLLECTION, turnoId);
    const turnSnap = await tx.get(turnRef);
    if (!turnSnap.exists()) {
      throw new Error('El turno seleccionado no existe.');
    }

    const turnData = turnSnap.data();
    if (turnData.estado === 'cancelado') {
      throw new Error('No se pueden asignar alumnos a un turno cancelado.');
    }

    const occupied = Number(turnData.cuposOcupados) || 0;
    const capacity = Number(turnData.maxCapacity) || DEFAULT_MAX_CAPACITY;
    if (occupied >= capacity) {
      throw new Error('Este turno ya alcanzó los 4 cupos máximos.');
    }

    let creditoConsumido = false;
    let membresiaId = null;
    let origen = 'admin_sin_cupo';

    if (membership) {
      const memRef = doc(db, MEMBERSHIPS_COLLECTION, membership.id);
      const memSnap = await tx.get(memRef);
      if (memSnap.exists() && (Number(memSnap.data().creditosRestantes) || 0) > 0) {
        const nextCredits = Number(memSnap.data().creditosRestantes) - 1;
        tx.update(memRef, {
          creditosRestantes: nextCredits,
          estado: nextCredits === 0 ? 'agotada' : 'activa',
          actualizadoEn: serverTimestamp(),
        });
        creditoConsumido = true;
        membresiaId = membership.id;
        origen = 'admin_credito';
      }
    }

    tx.set(doc(db, RESERVATIONS_COLLECTION, reservationId), {
      turnoId,
      dateKey: turnData.dateKey,
      startTime: turnData.startTime,
      usuarioId: student.id,
      alumnoNombre: student.nombreApellido || `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      alumnoEmail: student.email || '',
      estado: 'confirmada',
      asistencia: 'pendiente',
      origen,
      creditoConsumido,
      membresiaId,
      creadoEn: serverTimestamp(),
    });

    tx.update(turnRef, {
      cuposOcupados: occupied + 1,
      actualizadoEn: serverTimestamp(),
    });

    tx.update(doc(db, USERS_COLLECTION, student.id), {
      inscriptoClases: true,
    });
  });
}

export async function removeReservationByAdmin(reserva) {
  await runTransaction(db, async (tx) => {
    const resRef = doc(db, RESERVATIONS_COLLECTION, reserva.id);
    const resSnap = await tx.get(resRef);
    if (!resSnap.exists()) return;

    const turnRef = doc(db, TURNS_COLLECTION, reserva.turnoId);
    const turnSnap = await tx.get(turnRef);
    if (turnSnap.exists()) {
      const occupied = Number(turnSnap.data().cuposOcupados) || 0;
      tx.update(turnRef, {
        cuposOcupados: Math.max(0, occupied - 1),
        actualizadoEn: serverTimestamp(),
      });
    }

    if (reserva.creditoConsumido && reserva.membresiaId) {
      await refundMembershipCreditInTx(tx, reserva.membresiaId, { applyGrace: false });
    }

    tx.delete(resRef);
  });
}

export async function markReservationAttendance({ reserva, nextAttendance }) {
  await updateDoc(doc(db, RESERVATIONS_COLLECTION, reserva.id), {
    asistencia: nextAttendance,
    actualizadoEn: serverTimestamp(),
  });

  const userResQ = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('usuarioId', '==', reserva.usuarioId)
  );
  const snap = await getDocs(userResQ);
  const allReservations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const porcentajeAsistencia = calculateAttendancePercentage(allReservations);

  await updateDoc(doc(db, USERS_COLLECTION, reserva.usuarioId), {
    porcentajeAsistencia,
  });

  return porcentajeAsistencia;
}

export async function fetchUserReservations(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('usuarioId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return String(a.dateKey).localeCompare(String(b.dateKey));
      return String(a.startTime).localeCompare(String(b.startTime));
    });
}

/**
 * Student self-booking helper for the Customer Portal.
 * - Enforces closed day check, >= 10 min before start, max 1 active booking/day, max 4 slots.
 * - If the student has an active membership credit, deducts 1 credit and sets `confirmada`.
 * - If the student has 0 credits, reserves the spot with `esperando_comprobante`.
 */
export async function bookTurnAsStudent({ turno, student }) {
  const closedSnap = await getDocs(
    query(collection(db, CLOSED_DAYS_COLLECTION), where('dateKey', '==', turno.dateKey))
  );
  if (!closedSnap.empty) {
    throw new Error('El estudio se encuentra cerrado en esa fecha.');
  }

  if (!isTurnBookingOpen(turno.dateKey, turno.startTime)) {
    throw new Error('Solo podés reservar hasta 10 minutos antes del inicio de la clase.');
  }

  const userReservationsQ = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('usuarioId', '==', student.id)
  );
  const userReservationsSnap = await getDocs(userReservationsQ);
  const hasPendingSinglePayment = userReservationsSnap.docs.some((d) =>
    ['esperando_comprobante', 'pendiente_confirmacion'].includes(d.data()?.estado)
  );
  if (hasPendingSinglePayment) {
    throw new Error(
      'Tenés una reserva pendiente de confirmación de pago. Esperá a que se apruebe antes de realizar otra reserva.'
    );
  }

  const hasActiveSameDay = userReservationsSnap.docs.some(
    (d) =>
      d.data()?.dateKey === turno.dateKey &&
      ['confirmada', 'esperando_comprobante', 'pendiente_confirmacion'].includes(d.data()?.estado)
  );
  if (hasActiveSameDay) {
    throw new Error('Ya tenés una reserva activa para este día.');
  }

  const membership = await findEarliestActiveMembership(student.id);
  const reservationId = `${turno.id}_${student.id}_${Date.now()}`;
  let bookedEstado = membership ? 'confirmada' : 'esperando_comprobante';

  await runTransaction(db, async (tx) => {
    const turnRef = doc(db, TURNS_COLLECTION, turno.id);
    const turnSnap = await tx.get(turnRef);
    const turnExists = turnSnap.exists();
    const turnData = turnExists ? turnSnap.data() : turno;

    if (turnData.estado === 'cancelado') {
      throw new Error('Este turno no se encuentra disponible.');
    }

    const occupied = Number(turnData.cuposOcupados) || 0;
    const capacity = Number(turnData.maxCapacity) || DEFAULT_MAX_CAPACITY;
    if (occupied >= capacity) {
      throw new Error('No quedan lugares disponibles en este horario.');
    }

    let creditoConsumido = false;
    let membresiaId = null;

    if (membership) {
      const memRef = doc(db, MEMBERSHIPS_COLLECTION, membership.id);
      const memSnap = await tx.get(memRef);
      const remaining = Number(memSnap.data()?.creditosRestantes) || 0;
      if (memSnap.exists() && remaining > 0) {
        const nextCredits = remaining - 1;
        tx.update(memRef, {
          creditosRestantes: nextCredits,
          estado: nextCredits === 0 ? 'agotada' : 'activa',
          actualizadoEn: serverTimestamp(),
        });
        creditoConsumido = true;
        membresiaId = membership.id;
        bookedEstado = 'confirmada';
      } else {
        bookedEstado = 'esperando_comprobante';
      }
    }

    tx.set(doc(db, RESERVATIONS_COLLECTION, reservationId), {
      turnoId: turno.id,
      dateKey: turno.dateKey,
      startTime: turno.startTime,
      durationMinutes: Number(turno.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
      instructorName: turno.instructorName || 'Profesora Titular',
      usuarioId: student.id,
      alumnoNombre:
        student.nombreApellido || `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      alumnoEmail: student.email || '',
      estado: bookedEstado,
      asistencia: 'pendiente',
      origen: creditoConsumido ? 'alumno' : 'alumno_sin_credito',
      creditoConsumido,
      membresiaId,
      creadoEn: serverTimestamp(),
    });

    if (turnExists) {
      tx.update(turnRef, {
        cuposOcupados: occupied + 1,
        actualizadoEn: serverTimestamp(),
      });
    } else {
      tx.set(turnRef, {
        dateKey: turno.dateKey,
        startTime: turno.startTime,
        durationMinutes: Number(turno.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
        maxCapacity: capacity,
        cuposOcupados: 1,
        instructorName: turno.instructorName || 'Profesora Titular',
        baseSlotId: turno.baseSlotId || null,
        estado: 'programado',
        creadoEn: serverTimestamp(),
      });
    }
  });

  return { reservationId, estado: bookedEstado };
}

/**
 * Student cancellation helper:
 * >= 4h before start -> refunds 1 credit + 7-day grace window, frees slot.
 * < 4h before start -> marks `cancelado_tarde` (slot stays fixed, credit consumed).
 */
export async function cancelReservationAsStudent(reserva) {
  if (!reserva?.id) {
    throw new Error('No se encontró la reserva a cancelar.');
  }

  if (!canCancelWithRefund(reserva.dateKey, reserva.startTime)) {
    throw new Error('Solo podés cancelar un turno con al menos 4 horas de anticipación.');
  }

  let credited = false;

  await runTransaction(db, async (tx) => {
    const resRef = doc(db, RESERVATIONS_COLLECTION, reserva.id);
    const resSnap = await tx.get(resRef);
    if (!resSnap.exists()) return;
    const resData = resSnap.data() || {};

    const turnRef = reserva.turnoId ? doc(db, TURNS_COLLECTION, reserva.turnoId) : null;
    const turnSnap = turnRef ? await tx.get(turnRef) : null;

    const shouldRefundExisting = Boolean(resData.creditoConsumido && resData.membresiaId);
    const shouldGrantIndividualCredit =
      !shouldRefundExisting && resData.estado === 'confirmada';

    const memRef = shouldRefundExisting
      ? doc(db, MEMBERSHIPS_COLLECTION, resData.membresiaId)
      : null;
    const memSnap = memRef ? await tx.get(memRef) : null;

    if (turnSnap?.exists()) {
      const occupied = Number(turnSnap.data().cuposOcupados) || 0;
      tx.update(turnRef, {
        cuposOcupados: Math.max(0, occupied - 1),
        actualizadoEn: serverTimestamp(),
      });
    }

    if (memSnap?.exists()) {
      const memData = memSnap.data() || {};
      const nextRemaining = (Number(memData.creditosRestantes) || 0) + 1;
      const currentExp = toDateOrNull(memData.fechaVencimiento);
      const extendedExp = computeGraceExpiration(currentExp);
      tx.update(memRef, {
        creditosRestantes: nextRemaining,
        estado: 'activa',
        fechaVencimiento: Timestamp.fromDate(extendedExp),
        actualizadoEn: serverTimestamp(),
      });
      credited = true;
    } else if (shouldGrantIndividualCredit) {
      const newMemRef = doc(collection(db, MEMBERSHIPS_COLLECTION));
      const extendedExp = computeGraceExpiration(null);
      tx.set(newMemRef, {
        usuarioId: resData.usuarioId,
        paqueteId: 'plan-individual',
        paqueteNombre: 'Clase individual (crédito por cancelación)',
        creditosTotales: 1,
        creditosRestantes: 1,
        fechaVencimiento: Timestamp.fromDate(extendedExp),
        estado: 'activa',
        provisional: false,
        origen: 'cancelacion_clase_individual',
        reservaId: reserva.id,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });
      credited = true;
    }

    tx.update(resRef, {
      estado: 'cancelado_tiempo',
      actualizadoEn: serverTimestamp(),
    });
  });

  return { refundable: true, credited };
}

const CANCELLED_RESERVATION_STATES = new Set([
  'cancelada',
  'cancelado_estudio',
  'cancelado_tiempo',
  'cancelado_tarde',
]);

/**
 * Hides cancelled reservations from the student's upcoming list without deleting audit history.
 */
export async function hideCancelledReservationsForStudent(reservations = []) {
  const toHide = reservations.filter(
    (r) => r?.id && CANCELLED_RESERVATION_STATES.has(r.estado) && !r.ocultoParaAlumno
  );
  if (toHide.length === 0) return 0;

  const batch = writeBatch(db);
  for (const res of toHide) {
    batch.update(doc(db, RESERVATIONS_COLLECTION, res.id), {
      ocultoParaAlumno: true,
      actualizadoEn: serverTimestamp(),
    });
  }
  await batch.commit();
  return toHide.length;
}
