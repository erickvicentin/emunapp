import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { databaseId, db, functions } from '../config/firebase';
import { getPackageNumericPrice } from './packageService';

const PAYMENTS_COLLECTION = 'pagos';
const MEMBERSHIPS_COLLECTION = 'membresias_usuario';
const RESERVATIONS_COLLECTION = 'reservas';
const TURNS_COLLECTION = 'turnos_clase';
const CONFIG_COLLECTION = 'configuracion';
const COBROS_CONFIG_DOC = 'cobros';
const STUDIO_CONFIG_DOC = 'estudio';

export const DEFAULT_COBROS_CONFIG = {
  alias: 'emuna.pilates.mp',
  cvu: '',
  titularCuenta: 'Emuná Estudio Pilates',
  cuilCuit: '',
  horasVencimientoProvisorio: 24,
};

export const PAYMENT_STATUS_META = {
  pendiente_informar: {
    label: 'Pendiente de informar pago',
    adminLabel: 'Esperando informe',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  pendiente_conciliacion: {
    label: 'Pendiente de confirmación',
    adminLabel: 'Pendiente conciliación',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  aprobado: {
    label: 'Acreditado',
    adminLabel: 'Acreditado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  rechazado: {
    label: 'Rechazado',
    adminLabel: 'Rechazado',
    classes: 'bg-error-container text-on-error-container border-error/30',
  },
  vencido: {
    label: 'Vencido',
    adminLabel: 'Vencido',
    classes: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  },
};

export function formatPaymentDateTime(value) {
  if (!value) return '-';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} hs`;
}

export const DEFAULT_STUDIO_CONFIG = {
  horasVentanaCancelacion: 4,
  nombreProfesora: 'Profesora Titular',
};

function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchCobrosConfig() {
  const snap = await getDoc(doc(db, CONFIG_COLLECTION, COBROS_CONFIG_DOC));
  if (!snap.exists()) return { ...DEFAULT_COBROS_CONFIG };
  const data = snap.data();
  return {
    ...DEFAULT_COBROS_CONFIG,
    ...data,
    alias: data.alias ?? data.aliasCbu ?? DEFAULT_COBROS_CONFIG.alias,
  };
}

export function formatCvuInput(rawValue) {
  return String(rawValue || '').replace(/\D/g, '').slice(0, 22);
}

export function formatCuilInput(rawValue) {
  const digits = String(rawValue || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function validateCobrosConfig(config = {}) {
  const errors = {};
  const cvuDigits = String(config.cvu || '').replace(/\D/g, '');
  if (String(config.cvu || '').trim() && cvuDigits.length !== 22) {
    errors.cvu = 'El CVU / CBU debe tener exactamente 22 dígitos numéricos.';
  }
  const cuilDigits = String(config.cuilCuit || '').replace(/\D/g, '');
  if (String(config.cuilCuit || '').trim() && cuilDigits.length !== 11) {
    errors.cuilCuit = 'El CUIL / CUIT debe tener exactamente 11 dígitos (XX-XXXXXXXX-X).';
  }
  return errors;
}

export async function saveCobrosConfig(config) {
  const validationErrors = validateCobrosConfig(config);
  const firstError = validationErrors.cvu || validationErrors.cuilCuit;
  if (firstError) {
    throw new Error(firstError);
  }

  const cvuDigits = formatCvuInput(config.cvu);
  const cuilFormatted = formatCuilInput(config.cuilCuit);

  const payload = {
    alias: String(config.alias ?? config.aliasCbu ?? '').trim() || DEFAULT_COBROS_CONFIG.alias,
    cvu: cvuDigits,
    titularCuenta:
      String(config.titularCuenta || '').trim() || DEFAULT_COBROS_CONFIG.titularCuenta,
    cuilCuit: cuilFormatted,
    horasVencimientoProvisorio: Math.max(
      1,
      Math.min(168, Number(config.horasVencimientoProvisorio) || 24)
    ),
    actualizadoEn: serverTimestamp(),
  };
  await setDoc(doc(db, CONFIG_COLLECTION, COBROS_CONFIG_DOC), payload, { merge: true });
  return payload;
}

export async function fetchStudioConfig() {
  const snap = await getDoc(doc(db, CONFIG_COLLECTION, STUDIO_CONFIG_DOC));
  if (!snap.exists()) return { ...DEFAULT_STUDIO_CONFIG };
  const data = snap.data() || {};
  return {
    horasVentanaCancelacion:
      Number(data.horasVentanaCancelacion) || DEFAULT_STUDIO_CONFIG.horasVentanaCancelacion,
    nombreProfesora:
      String(data.nombreProfesora || '').trim() || DEFAULT_STUDIO_CONFIG.nombreProfesora,
  };
}

export function subscribeStudioConfig(onData, onError) {
  return onSnapshot(
    doc(db, CONFIG_COLLECTION, STUDIO_CONFIG_DOC),
    (snap) => {
      if (!snap.exists()) {
        onData({ ...DEFAULT_STUDIO_CONFIG });
        return;
      }
      const data = snap.data() || {};
      onData({
        horasVentanaCancelacion:
          Number(data.horasVentanaCancelacion) || DEFAULT_STUDIO_CONFIG.horasVentanaCancelacion,
        nombreProfesora:
          String(data.nombreProfesora || '').trim() || DEFAULT_STUDIO_CONFIG.nombreProfesora,
      });
    },
    onError
  );
}

export async function saveStudioConfig(config = {}) {
  const hours = Math.max(1, Math.min(48, Number(config.horasVentanaCancelacion) || 4));
  const professorName =
    String(config.nombreProfesora || '').trim() || DEFAULT_STUDIO_CONFIG.nombreProfesora;

  const payload = {
    horasVentanaCancelacion: hours,
    nombreProfesora: professorName,
    actualizadoEn: serverTimestamp(),
  };
  await setDoc(doc(db, CONFIG_COLLECTION, STUDIO_CONFIG_DOC), payload, { merge: true });
  return payload;
}

export async function fetchAllPayments() {
  const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchUserPayments(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where('usuarioId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => toMillis(b.creadoEn) - toMillis(a.creadoEn));
}

export async function fetchUserMemberships(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, MEMBERSHIPS_COLLECTION),
    where('usuarioId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeAllPayments(onData, onError) {
  const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('creadoEn', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

export function subscribeUserPayments(userId, onData, onError) {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where('usuarioId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => toMillis(b.creadoEn) - toMillis(a.creadoEn));
      onData(list);
    },
    onError
  );
}

export function subscribeUserMemberships(userId, onData, onError) {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(db, MEMBERSHIPS_COLLECTION),
    where('usuarioId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

/**
 * Registers a payment notice (transfer or cash) and grants provisional credits immediately
 * while awaiting manual reconciliation by an administrator.
 */
export async function reportPaymentNotice({
  userId,
  userName,
  userEmail,
  pkg,
  metodoPago = 'transferencia',
  numeroOperacion = '',
  montoInformado,
  comprobanteNombre = '',
  comprobanteDataUrl = '',
  initialEstado = 'pendiente_conciliacion',
}) {
  if (!userId || !pkg) {
    throw new Error('Seleccioná un alumno y un paquete válido.');
  }

  const safeInitialEstado =
    initialEstado === 'pendiente_informar' ? 'pendiente_informar' : 'pendiente_conciliacion';

  const existingPayments = await fetchUserPayments(userId);
  const hasPending = existingPayments.some((p) =>
    ['pendiente_conciliacion', 'pendiente_informar'].includes(p.estado)
  );
  if (hasPending) {
    throw new Error(
      'Ya existe un pago pendiente de informar o confirmar. Completá o esperá su confirmación antes de reservar otro paquete.'
    );
  }

  const pendingResQ = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('usuarioId', '==', userId),
    where('estado', 'in', ['esperando_comprobante', 'pendiente_confirmacion'])
  );
  const pendingResSnap = await getDocs(pendingResQ);
  if (!pendingResSnap.empty) {
    throw new Error(
      'Tenés una reserva pendiente de informar o confirmar el pago. Completá o esperá su confirmación antes de reservar un paquete.'
    );
  }

  const config = await fetchCobrosConfig();
  const now = new Date();
  const expHours = Number(config.horasVencimientoProvisorio) || 24;
  const expiresAt = new Date(now.getTime() + expHours * 3600_000).toISOString();
  const packageExp = new Date(now.getTime() + 30 * 24 * 3600_000).toISOString();
  const amount = Number(montoInformado) || getPackageNumericPrice(pkg);
  const credits = Number(pkg.classesCount) || 4;

  const memRef = doc(collection(db, MEMBERSHIPS_COLLECTION));
  const pagoRef = doc(collection(db, PAYMENTS_COLLECTION));

  const batch = writeBatch(db);
  batch.set(memRef, {
    usuarioId: userId,
    paqueteId: pkg.id,
    paqueteNombre: pkg.name,
    creditosTotales: credits,
    creditosRestantes: credits,
    fechaVencimiento: packageExp,
    estado: 'pendiente_conciliacion',
    provisional: true,
    pagoId: pagoRef.id,
    expiresAt,
    creadoEn: serverTimestamp(),
  });

  batch.set(pagoRef, {
    usuarioId: userId,
    alumnoNombre: userName || 'Alumna',
    alumnoEmail: userEmail || '',
    paqueteId: pkg.id,
    paqueteNombre: pkg.name,
    clasesCantidad: credits,
    monto: amount,
    metodoPago,
    numeroOperacion: String(numeroOperacion || '').trim(),
    comprobanteNombre: String(comprobanteNombre || '').trim(),
    comprobanteDataUrl: String(comprobanteDataUrl || ''),
    membresiaId: memRef.id,
    estado: safeInitialEstado,
    expiresAt,
    creadoEn: serverTimestamp(),
  });

  await batch.commit();

  return {
    pagoId: pagoRef.id,
    membershipId: memRef.id,
  };
}

/**
 * Registers a transfer payment notice for a single-class reservation made without credits.
 * Only requires the transfer date; amount is fixed to the individual class price and no receipt file is required.
 */
export async function reportReservationPaymentNotice({
  userId,
  userName,
  userEmail,
  reservation,
  individualPackage,
  fechaTransferencia,
}) {
  if (!userId || !reservation?.id) {
    throw new Error('No se encontró la reserva para informar el pago.');
  }
  if (!fechaTransferencia) {
    throw new Error('Ingresá la fecha de la transferencia.');
  }

  const existingPayments = await fetchUserPayments(userId);
  const alreadyReported = existingPayments.some(
    (p) => p.reservaId === reservation.id && p.estado === 'pendiente_conciliacion'
  );
  if (alreadyReported) {
    throw new Error('Ya informaste el pago para esta reserva. Queda pendiente de conciliación.');
  }

  const amount = getPackageNumericPrice(individualPackage) || 1;
  const pagoRef = doc(collection(db, PAYMENTS_COLLECTION));
  const resRef = doc(db, RESERVATIONS_COLLECTION, reservation.id);
  const batch = writeBatch(db);

  batch.set(pagoRef, {
    usuarioId: userId,
    alumnoNombre: userName || 'Alumna',
    alumnoEmail: userEmail || '',
    paqueteId: individualPackage?.id || 'plan-individual',
    paqueteNombre: individualPackage?.name || 'Clase individual',
    clasesCantidad: 1,
    monto: amount,
    metodoPago: 'transferencia',
    fechaTransferencia: String(fechaTransferencia).trim(),
    reservaId: reservation.id,
    turnoId: reservation.turnoId || '',
    estado: 'pendiente_conciliacion',
    creadoEn: serverTimestamp(),
  });

  batch.update(resRef, {
    estado: 'pendiente_confirmacion',
    pagoId: pagoRef.id,
    actualizadoEn: serverTimestamp(),
  });

  await batch.commit();

  return { pagoId: pagoRef.id };
}

export async function approvePaymentByAdmin(pago) {
  await runTransaction(db, async (tx) => {
    const pagoRef = doc(db, PAYMENTS_COLLECTION, pago.id);
    const pagoSnap = await tx.get(pagoRef);
    if (!pagoSnap.exists()) {
      throw new Error('El cobro ya no existe.');
    }

    const memRef = pago.membresiaId
      ? doc(db, MEMBERSHIPS_COLLECTION, pago.membresiaId)
      : null;
    const memSnap = memRef ? await tx.get(memRef) : null;

    const resRef = pago.reservaId
      ? doc(db, RESERVATIONS_COLLECTION, pago.reservaId)
      : null;
    const resSnap = resRef ? await tx.get(resRef) : null;

    tx.update(pagoRef, {
      estado: 'aprobado',
      validadoPor: 'administradora',
      acreditadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });

    if (memSnap?.exists()) {
      tx.update(memRef, {
        estado: 'activa',
        provisional: false,
        actualizadoEn: serverTimestamp(),
      });
    }

    if (resSnap?.exists()) {
      tx.update(resRef, {
        estado: 'confirmada',
        actualizadoEn: serverTimestamp(),
      });
    }
  });
}

export async function rejectPaymentByAdmin(pago, motivo = 'Comprobante no validado') {
  const cleanReason = String(motivo || '').trim() || 'Pago rechazado por administración';

  await updateDoc(doc(db, PAYMENTS_COLLECTION, pago.id), {
    estado: 'rechazado',
    motivoRechazo: cleanReason,
    actualizadoEn: serverTimestamp(),
  });

  if (pago.reservaId) {
    await updateDoc(doc(db, RESERVATIONS_COLLECTION, pago.reservaId), {
      estado: 'comprobante_rechazado',
      motivoRechazo: cleanReason,
      actualizadoEn: serverTimestamp(),
    });
  }

  if (!pago.membresiaId) return;

  await updateDoc(doc(db, MEMBERSHIPS_COLLECTION, pago.membresiaId), {
    estado: 'cancelada',
    creditosRestantes: 0,
    provisional: false,
    actualizadoEn: serverTimestamp(),
  });

  const resQ = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('membresiaId', '==', pago.membresiaId),
    where('estado', '==', 'confirmada')
  );
  const resSnap = await getDocs(resQ);
  await Promise.all(
    resSnap.docs.map(async (resDoc) => {
      const resData = resDoc.data();
      await updateDoc(resDoc.ref, {
        estado: 'cancelado_estudio',
        motivoCancelacion: motivo || 'Pago provisorio rechazado',
        actualizadoEn: serverTimestamp(),
      });
      if (resData.turnoId) {
        await runTransaction(db, async (tx) => {
          const turnRef = doc(db, TURNS_COLLECTION, resData.turnoId);
          const turnSnap = await tx.get(turnRef);
          if (!turnSnap.exists()) return;
          const current = Number(turnSnap.data()?.cuposOcupados) || 0;
          tx.update(turnRef, {
            cuposOcupados: Math.max(0, current - 1),
            actualizadoEn: serverTimestamp(),
          });
        });
      }
    })
  );
}

export async function sweepExpiredProvisionalPayments() {
  const expireFn = httpsCallable(functions, 'expireProvisionalPayments');
  const res = await expireFn({ databaseId });
  return res?.data || { expiredPayments: 0, cancelledBookings: 0 };
}

export async function deleteRejectedPaymentByAdmin(pago) {
  if (!pago?.id) {
    throw new Error('No se encontró el cobro a eliminar.');
  }
  if (pago.estado !== 'rechazado') {
    throw new Error('Solo se pueden eliminar cobros en estado rechazado.');
  }
  await deleteDoc(doc(db, PAYMENTS_COLLECTION, pago.id));
  return { success: true, id: pago.id };
}

/**
 * Hides rejected payments from the student's payment history without deleting admin records.
 */
export async function hideRejectedPaymentsForStudent(payments = []) {
  const toHide = payments.filter(
    (p) => p?.id && p.estado === 'rechazado' && !p.ocultoParaAlumno
  );
  if (toHide.length === 0) return 0;

  const batch = writeBatch(db);
  for (const pay of toHide) {
    batch.update(doc(db, PAYMENTS_COLLECTION, pay.id), {
      ocultoParaAlumno: true,
      actualizadoEn: serverTimestamp(),
    });
  }
  await batch.commit();
  return toHide.length;
}

/**
 * Updates a reserved package payment from `pendiente_informar` to `pendiente_conciliacion`
 * once the student reports the transfer details/receipt.
 */
export async function informPackagePaymentNotice({
  pagoId,
  numeroOperacion = '',
  montoInformado,
  comprobanteNombre = '',
  comprobanteDataUrl = '',
}) {
  if (!pagoId) {
    throw new Error('No se encontró el pago a informar.');
  }
  const amount = Number(montoInformado) || 0;
  if (amount <= 0) {
    throw new Error('Ingresá un importe válido.');
  }
  await updateDoc(doc(db, PAYMENTS_COLLECTION, pagoId), {
    estado: 'pendiente_conciliacion',
    numeroOperacion: String(numeroOperacion || '').trim(),
    monto: amount,
    comprobanteNombre: String(comprobanteNombre || '').trim(),
    comprobanteDataUrl: String(comprobanteDataUrl || ''),
    informadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}
