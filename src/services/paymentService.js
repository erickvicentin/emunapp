import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
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

export const DEFAULT_COBROS_CONFIG = {
  alias: 'emuna.pilates.mp',
  cvu: '',
  titularCuenta: 'Emuná Estudio Pilates',
  cuilCuit: '',
  horasVencimientoProvisorio: 24,
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

export async function saveCobrosConfig(config) {
  const payload = {
    alias: String(config.alias ?? config.aliasCbu ?? '').trim() || DEFAULT_COBROS_CONFIG.alias,
    cvu: String(config.cvu || '').trim(),
    titularCuenta:
      String(config.titularCuenta || '').trim() || DEFAULT_COBROS_CONFIG.titularCuenta,
    cuilCuit: String(config.cuilCuit || '').trim(),
    horasVencimientoProvisorio: Math.max(
      1,
      Math.min(168, Number(config.horasVencimientoProvisorio) || 24)
    ),
    actualizadoEn: serverTimestamp(),
  };
  await setDoc(doc(db, CONFIG_COLLECTION, COBROS_CONFIG_DOC), payload, { merge: true });
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
}) {
  if (!userId || !pkg) {
    throw new Error('Seleccioná un alumno y un paquete válido.');
  }

  const existingPayments = await fetchUserPayments(userId);
  const hasPending = existingPayments.some((p) => p.estado === 'pendiente_conciliacion');
  if (hasPending) {
    throw new Error(
      'Ya existe un aviso de pago pendiente de conciliación. Esperá su confirmación antes de reportar otro.'
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
    estado: 'pendiente_conciliacion',
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
  const ref = await addDoc(collection(db, PAYMENTS_COLLECTION), {
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

  return { pagoId: ref.id };
}

export async function approvePaymentByAdmin(pago) {
  await runTransaction(db, async (tx) => {
    const pagoRef = doc(db, PAYMENTS_COLLECTION, pago.id);
    const pagoSnap = await tx.get(pagoRef);
    if (!pagoSnap.exists()) {
      throw new Error('El cobro ya no existe.');
    }
    tx.update(pagoRef, {
      estado: 'aprobado',
      validadoPor: 'administradora',
      acreditadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });

    if (pago.membresiaId) {
      const memRef = doc(db, MEMBERSHIPS_COLLECTION, pago.membresiaId);
      const memSnap = await tx.get(memRef);
      if (memSnap.exists()) {
        tx.update(memRef, {
          estado: 'activa',
          provisional: false,
          actualizadoEn: serverTimestamp(),
        });
      }
    }
  });
}

export async function rejectPaymentByAdmin(pago, motivo = 'Comprobante no validado') {
  await updateDoc(doc(db, PAYMENTS_COLLECTION, pago.id), {
    estado: 'rechazado',
    motivoRechazo: String(motivo || '').trim() || 'Pago rechazado por administración',
    actualizadoEn: serverTimestamp(),
  });

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
