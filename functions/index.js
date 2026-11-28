import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  isValidRecipientEmail,
  sendAdminDailySummaryEmail,
  sendAdminLastMinuteBookingEmail,
  sendAdminNewPaymentEmail,
  sendAdminStudentCancelledEmail,
  sendClassReminderEmail,
  sendEmailChangeVerificationCodeEmail,
  sendPaymentStatusEmail,
  sendReservationCancelledEmail,
  sendReservationConfirmedEmail,
  sendWelcomeEmail,
} from './services/emailService.js';
import {
  checkAssistantRateLimit,
  generateAssistantReply,
} from './services/assistantService.js';

initializeApp();

const TARGET_DATABASES = process.env.FIREBASE_DATABASE_ID
  ? [process.env.FIREBASE_DATABASE_ID]
  : ['emuna-testing', 'emuna-prod'];
const CANCELLATION_NOTIFY_STATES = new Set([
  'cancelada',
  'cancelada_a_tiempo',
  'cancelado_tiempo',
  'cancelado_tarde',
  'cancelado_estudio',
]);
const STUDENT_CANCELLATION_STATES = new Set([
  'cancelada',
  'cancelada_a_tiempo',
  'cancelado_tiempo',
  'cancelado_tarde',
]);
const PAYMENT_NOTIFY_STATES = new Set(['aprobado', 'rechazado', 'vencido']);
const DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG = {
  nuevoPagoPendiente: true,
  cancelacionAlumno: true,
  reservaUltimoMomento: true,
  resumenDiario: true,
};

const ALLOWED_DATABASES = new Set(['emuna-testing', 'emuna-prod']);
const STAFF_ROLES = new Set(['staff', 'administradora']);
const RELATED_COLLECTIONS = ['reservas', 'membresias_usuario', 'pagos'];
const DNI_AUTH_DOMAIN = 'dni.emuna.local';

function buildDniAuthEmail(dniDigits) {
  return `${dniDigits}@${DNI_AUTH_DOMAIN}`;
}

function resolveDatabaseId(requestedDatabaseId) {
  const configuredDb = process.env.FIREBASE_DATABASE_ID;
  if (configuredDb) {
    if (requestedDatabaseId && requestedDatabaseId !== configuredDb) {
      throw new HttpsError(
        'permission-denied',
        'No está permitido operar sobre una base de datos distinta a la configurada.'
      );
    }
    return configuredDb;
  }

  const target = requestedDatabaseId || 'emuna-testing';
  if (!ALLOWED_DATABASES.has(target)) {
    throw new HttpsError('invalid-argument', 'Base de datos no permitida.');
  }
  return target;
}

function hasStaffClaim(claims = {}) {
  return (
    STAFF_ROLES.has(claims.rol) ||
    claims.staff === true ||
    claims.admin === true
  );
}

function hasAdminClaim(claims = {}) {
  return claims.rol === 'administradora' || claims.admin === true;
}

function assertStaffCaller(request) {
  if (!request.auth?.uid) {
    throw new HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para realizar esta operación.'
    );
  }

  if (!hasStaffClaim(request.auth.token)) {
    throw new HttpsError(
      'permission-denied',
      'Solo el personal autorizado con custom claims de staff puede gestionar alumnos.'
    );
  }
}

function assertAdminCaller(request) {
  if (!request.auth?.uid) {
    throw new HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para realizar esta operación.'
    );
  }

  if (!hasAdminClaim(request.auth.token)) {
    throw new HttpsError(
      'permission-denied',
      'Solo una cuenta con rol administradora puede gestionar usuarios de staff.'
    );
  }
}

function formatDni(rawDni) {
  const digits = String(rawDni || '').replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function validateStudentPayload(data, { requireEmail = true } = {}) {
  const nombre = String(data?.nombre || '').trim();
  const apellido = String(data?.apellido || '').trim();
  const telefono = String(data?.telefono || '').trim();
  const fechaNacimiento = String(data?.fechaNacimiento || '').trim();
  const genero = String(data?.genero || 'no_especificar').trim();
  const email = String(data?.email || '').trim().toLowerCase();
  const dniDigits = String(data?.dni || '').replace(/\D/g, '');

  if (!nombre || !apellido || !telefono || !fechaNacimiento || (requireEmail && !email)) {
    throw new HttpsError(
      'invalid-argument',
      'Faltan campos obligatorios para registrar al alumno.'
    );
  }

  if (dniDigits.length < 6) {
    throw new HttpsError(
      'invalid-argument',
      'El DNI debe tener al menos 6 dígitos.'
    );
  }

  const authEmail = email || buildDniAuthEmail(dniDigits);

  return {
    nombre,
    apellido,
    telefono,
    fechaNacimiento,
    genero,
    email,
    authEmail,
    dniDigits,
    dniFormatted: formatDni(dniDigits),
  };
}

async function deleteCollectionByUserId(db, collectionName, uid) {
  const snapshot = await db
    .collection(collectionName)
    .where('usuarioId', '==', uid)
    .get();

  if (snapshot.empty) return 0;

  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
  return snapshot.size;
}

async function createManagedAccount(request, { targetRole, requireAdminCaller = false }) {
  if (requireAdminCaller) {
    assertAdminCaller(request);
  } else {
    assertStaffCaller(request);
  }

  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const isCustomer = targetRole === 'customer';
  const payload = validateStudentPayload(request.data, { requireEmail: !isCustomer });
  const auth = getAuth();
  const initialPassword = isCustomer
    ? payload.dniDigits
    : randomBytes(24).toString('base64url');

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: payload.authEmail,
      password: initialPassword,
      displayName: `${payload.nombre} ${payload.apellido}`.trim(),
      emailVerified: false,
    });
    await auth.setCustomUserClaims(userRecord.uid, { rol: targetRole });
  } catch (error) {
    if (userRecord?.uid) {
      await auth.deleteUser(userRecord.uid).catch(() => {});
    }
    if (error?.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'Ya existe una cuenta registrada con ese correo electrónico o DNI.'
      );
    }
    throw new HttpsError(
      'internal',
      error?.message || 'No se pudo crear el usuario en Firebase Authentication.'
    );
  }

  const userProfile = {
    uid: userRecord.uid,
    email: payload.email,
    authEmail: payload.authEmail,
    nombre: payload.nombre,
    apellido: payload.apellido,
    telefono: payload.telefono,
    fechaNacimiento: payload.fechaNacimiento,
    genero: payload.genero,
    dni: payload.dniFormatted,
    photoURL: '',
    rol: targetRole,
    active: true,
    estado: 'activo',
    registroCompleto: true,
    requiereCambioPassword: true,
    porcentajeAsistencia: 0,
    tienePaquete: false,
    inscriptoClases: false,
  };

  try {
    await db
      .collection('usuarios')
      .doc(userRecord.uid)
      .set({
        ...userProfile,
        creadoEn: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    await auth.deleteUser(userRecord.uid).catch(() => {});
    throw new HttpsError(
      'internal',
      error?.message || 'No se pudo guardar el perfil del usuario en Firestore.'
    );
  }

  let activationLinkGenerated = false;
  if (!isCustomer && payload.email) {
    try {
      await auth.generatePasswordResetLink(payload.email);
      activationLinkGenerated = true;
    } catch {
      activationLinkGenerated = false;
    }
  }

  if (isCustomer && isValidRecipientEmail(payload.email)) {
    await sendWelcomeEmail({
      to: payload.email,
      nombre: payload.nombre,
    }).catch(() => {});
  }

  return {
    userProfile,
    activationLinkGenerated,
  };
}

async function deleteManagedAccount(
  request,
  { expectedRole, requireAdminCaller = false, blockAdminTargets = true }
) {
  if (requireAdminCaller) {
    assertAdminCaller(request);
  } else {
    assertStaffCaller(request);
  }

  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const auth = getAuth();
  const uid = String(request.data?.uid || '').trim();

  if (!uid) {
    throw new HttpsError('invalid-argument', 'El identificador del usuario es obligatorio.');
  }

  if (uid === request.auth.uid) {
    throw new HttpsError(
      'failed-precondition',
      'No podés eliminar tu propia cuenta.'
    );
  }

  try {
    const targetAuthUser = await auth.getUser(uid);
    const targetClaims = targetAuthUser.customClaims || {};
    if (
      (blockAdminTargets && hasAdminClaim(targetClaims)) ||
      (expectedRole === 'customer' && hasStaffClaim(targetClaims))
    ) {
      throw new HttpsError(
        'permission-denied',
        'No podés eliminar cuentas con mayor o igual privilegio administrativo.'
      );
    }
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (error?.code !== 'auth/user-not-found') {
      throw new HttpsError(
        'internal',
        error?.message || 'No se pudo verificar la cuenta objetivo en Firebase Authentication.'
      );
    }
  }

  const targetUserRef = db.collection('usuarios').doc(uid);
  const targetUserSnap = await targetUserRef.get();
  if (!targetUserSnap.exists) {
    throw new HttpsError('not-found', 'El perfil del usuario no existe en Firestore.');
  }

  if (targetUserSnap.data()?.rol !== expectedRole) {
    throw new HttpsError(
      'permission-denied',
      `Solo se permite eliminar cuentas con rol ${expectedRole}.`
    );
  }

  for (const collectionName of RELATED_COLLECTIONS) {
    await deleteCollectionByUserId(db, collectionName, uid);
  }

  await targetUserRef.delete();

  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      throw new HttpsError(
        'internal',
        error?.message || 'No se pudo eliminar el usuario en Firebase Authentication.'
      );
    }
  }

  return { success: true, uid };
}

/**
 * Crea un alumno en Firebase Auth y en la colección `usuarios` de Firestore
 * con rol `customer` utilizando Firebase Admin SDK.
 */
export const createStudentAccount = onCall(async (request) => {
  const { userProfile, activationLinkGenerated } = await createManagedAccount(
    request,
    { targetRole: 'customer' }
  );
  return { student: userProfile, activationLinkGenerated };
});

/**
 * Elimina un usuario con rol `customer` de Firestore (perfil y colecciones relacionadas)
 * y de Firebase Authentication utilizando Firebase Admin SDK.
 */
export const deleteStudentAccount = onCall(async (request) =>
  deleteManagedAccount(request, { expectedRole: 'customer' })
);

/**
 * Restablece la contraseña de un alumno a su DNI (solo dígitos) y marca
 * `requiereCambioPassword: true` para forzar el cambio en su próximo ingreso.
 */
export const resetStudentPasswordToDni = onCall(async (request) => {
  assertAdminCaller(request);

  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const auth = getAuth();
  const uid = String(request.data?.uid || '').trim();

  if (!uid) {
    throw new HttpsError('invalid-argument', 'El identificador del alumno es obligatorio.');
  }

  const userRef = db.collection('usuarios').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new HttpsError('not-found', 'El perfil del alumno no existe en Firestore.');
  }

  const userData = userSnap.data() || {};
  if (userData.rol !== 'customer') {
    throw new HttpsError('permission-denied', 'Solo se puede restablecer la clave de alumnos.');
  }

  const dniDigits = String(userData.dni || '').replace(/\D/g, '');
  if (dniDigits.length < 6) {
    throw new HttpsError(
      'failed-precondition',
      'El alumno no tiene un DNI válido registrado para usar como contraseña.'
    );
  }

  await auth.updateUser(uid, { password: dniDigits });
  await userRef.update({
    requiereCambioPassword: true,
    actualizadoEn: FieldValue.serverTimestamp(),
  });

  return { success: true, uid };
});

/**
 * Resuelve el `authEmail` asociado a un DNI para permitir login con DNI incluso
 * cuando la cuenta fue registrada con un correo electrónico real.
 */
export const resolveAuthEmailByDni = onCall({ cors: true }, async (request) => {
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const dniDigits = String(request.data?.dni || '').replace(/\D/g, '');

  if (dniDigits.length < 6) {
    throw new HttpsError('invalid-argument', 'Ingresá un DNI válido.');
  }

  const formattedDni = formatDni(dniDigits);
  const snap = await db
    .collection('usuarios')
    .where('dni', '==', formattedDni)
    .limit(1)
    .get();

  if (snap.empty) {
    return { authEmail: buildDniAuthEmail(dniDigits) };
  }

  const data = snap.docs[0].data() || {};
  return {
    authEmail: data.authEmail || data.email || buildDniAuthEmail(dniDigits),
  };
});

/**
 * Crea un usuario con rol `staff` en Firebase Auth (con custom claim `rol: 'staff'`)
 * y en Firestore. Exclusivo para cuentas con rol `administradora`.
 */
export const createStaffAccount = onCall(async (request) => {
  const { userProfile, activationLinkGenerated } = await createManagedAccount(
    request,
    { targetRole: 'staff', requireAdminCaller: true }
  );
  return { staff: userProfile, activationLinkGenerated };
});

/**
 * Elimina un usuario con rol `staff` de Firestore y Firebase Authentication.
 * Exclusivo para cuentas con rol `administradora`.
 */
export const deleteStaffAccount = onCall(async (request) =>
  deleteManagedAccount(request, {
    expectedRole: 'staff',
    requireAdminCaller: true,
    blockAdminTargets: true,
  })
);

/**
 * Devuelve los paquetes activos del catálogo público para la Landing Page
 * sin exponer lectura pública directa en Firestore Rules.
 */
export const getPublicPackages = onCall(async (request) => {
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const snapshot = await db.collection('paquetes_catalogo').get();
  const packages = snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((pkg) => pkg.active !== false)
    .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

  return { packages };
});

async function revokeProvisionalPaymentAndBookings(db, pagoSnap, reason) {
  const pago = pagoSnap.data() || {};
  await pagoSnap.ref.update({
    estado: reason === 'expired' ? 'vencido' : 'rechazado',
    actualizadoEn: FieldValue.serverTimestamp(),
  });

  if (!pago.membresiaId) return 0;

  await db.collection('membresias_usuario').doc(pago.membresiaId).set(
    {
      estado: 'cancelada',
      creditosRestantes: 0,
      provisional: false,
      actualizadoEn: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const resSnap = await db
    .collection('reservas')
    .where('membresiaId', '==', pago.membresiaId)
    .where('estado', '==', 'confirmada')
    .get();

  const cancelResults = await Promise.all(
    resSnap.docs.map(async (resDoc) => {
      const resData = resDoc.data();
      await resDoc.ref.update({
        estado: 'cancelado_estudio',
        motivoCancelacion:
          reason === 'expired'
            ? 'Pago provisorio vencido sin confirmación'
            : 'Pago rechazado por administración',
        actualizadoEn: FieldValue.serverTimestamp(),
      });
      if (resData.turnoId) {
        await db.runTransaction(async (tx) => {
          const turnRef = db.collection('turnos_clase').doc(resData.turnoId);
          const turnSnap = await tx.get(turnRef);
          if (!turnSnap.exists) return;
          const current = Number(turnSnap.data()?.cuposOcupados) || 0;
          tx.update(turnRef, {
            cuposOcupados: Math.max(0, current - 1),
            actualizadoEn: FieldValue.serverTimestamp(),
          });
        });
      }
      return 1;
    })
  );
  return cancelResults.reduce((acc, count) => acc + count, 0);
}

/**
 * Limpia pagos provisorios vencidos sin confirmación y cancela sus reservas asociadas.
 */
export const expireProvisionalPayments = onCall(async (request) => {
  assertStaffCaller(request);
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const nowIso = new Date().toISOString();

  const pendingSnap = await db
    .collection('pagos')
    .where('estado', '==', 'pendiente_conciliacion')
    .get();

  const expiredDocs = pendingSnap.docs.filter((pagoSnap) => {
    const data = pagoSnap.data();
    return Boolean(data.expiresAt && String(data.expiresAt) <= nowIso);
  });

  const cancelCounts = await Promise.all(
    expiredDocs.map((pagoSnap) => revokeProvisionalPaymentAndBookings(db, pagoSnap, 'expired'))
  );

  return {
    expiredPayments: expiredDocs.length,
    cancelledBookings: cancelCounts.reduce((acc, count) => acc + count, 0),
  };
});

async function resolveStudentRecipient(db, usuarioId, fallbackEmail, fallbackName) {
  const defaultPrefs = {
    confirmacionReserva: true,
    cancelacionReserva: true,
    estadoPago: true,
    recordatorioClase: true,
  };
  if (!usuarioId) {
    return {
      email: fallbackEmail || '',
      nombre: fallbackName || 'alumne',
      notificacionesEmail: defaultPrefs,
    };
  }

  const userSnap = await db.collection('usuarios').doc(usuarioId).get();
  if (!userSnap.exists) {
    return {
      email: '',
      nombre: fallbackName || 'alumne',
      notificacionesEmail: defaultPrefs,
    };
  }

  const userData = userSnap.data() || {};
  const isDeactivated =
    userData.active === false ||
    userData.estado === 'inactivo' ||
    userData.estado === 'desactivado';

  const prefs = userData.notificacionesEmail || {};
  const notificacionesEmail = {
    confirmacionReserva: prefs.confirmacionReserva !== false,
    cancelacionReserva: prefs.cancelacionReserva !== false,
    estadoPago: prefs.estadoPago !== false,
    recordatorioClase: prefs.recordatorioClase !== false,
  };

  if (isDeactivated) {
    return {
      email: '',
      nombre: fallbackName || userData.nombre || 'alumne',
      notificacionesEmail,
    };
  }

  const resolvedEmail = isValidRecipientEmail(userData.email)
    ? userData.email
    : fallbackEmail || '';

  return {
    email: resolvedEmail,
    nombre: fallbackName || userData.nombre || 'alumne',
    notificacionesEmail,
  };
}

function parseArgentinaClassDate(dateKey, startTime) {
  if (!dateKey || !startTime) return null;
  const iso = `${String(dateKey).trim()}T${String(startTime).trim()}:00-03:00`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const ARGENTINA_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function getArgentinaDateKey(offsetDays = 0) {
  const target = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = ARGENTINA_DATE_FORMATTER.formatToParts(target);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function getAdminNotificationSettings(db) {
  const snap = await db.collection('configuracion').doc('notificaciones_admin').get();
  if (!snap.exists) {
    return { ...DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG };
  }
  const data = snap.data() || {};
  return {
    nuevoPagoPendiente:
      data.nuevoPagoPendiente ?? DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG.nuevoPagoPendiente,
    cancelacionAlumno:
      data.cancelacionAlumno ?? DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG.cancelacionAlumno,
    reservaUltimoMomento:
      data.reservaUltimoMomento ?? DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG.reservaUltimoMomento,
    resumenDiario:
      data.resumenDiario ?? DEFAULT_ADMIN_EMAIL_NOTIF_CONFIG.resumenDiario,
  };
}

async function resolveAdminRecipients(db) {
  const snap = await db
    .collection('usuarios')
    .where('rol', '==', 'administradora')
    .get();

  return snap.docs
    .map((docSnap) => docSnap.data() || {})
    .filter((userData) => {
      const isDeactivated =
        userData.active === false ||
        userData.estado === 'inactivo' ||
        userData.estado === 'desactivado';
      return !isDeactivated && isValidRecipientEmail(userData.email);
    })
    .map((userData) => ({
      email: String(userData.email).trim(),
      nombre: String(userData.nombre || '').trim() || 'Administradora',
    }));
}

async function notifyAdmins(db, settingKey, sendToAdmin) {
  const settings = await getAdminNotificationSettings(db);
  if (settings[settingKey] === false) return;

  const admins = await resolveAdminRecipients(db);
  if (!admins.length) return;

  await Promise.all(admins.map((admin) => sendToAdmin(admin)));
}

async function handleReservationCreated(databaseId, event) {
  const data = event.data?.data();
  if (!data || data.estado !== 'confirmada') return;

  const db = getFirestore(databaseId);
  const recipient = await resolveStudentRecipient(
    db,
    data.usuarioId,
    data.alumnoEmail,
    data.alumnoNombre
  );
  if (
    recipient.notificacionesEmail.confirmacionReserva &&
    isValidRecipientEmail(recipient.email)
  ) {
    await sendReservationConfirmedEmail({
      to: recipient.email,
      nombre: recipient.nombre,
      dateKey: data.dateKey,
      startTime: data.startTime,
      instructorName: data.instructorName,
    });
  }

  const classDate = parseArgentinaClassDate(data.dateKey, data.startTime);
  const diffHours = classDate ? (classDate.getTime() - Date.now()) / (1000 * 60 * 60) : null;
  const isToday = data.dateKey === getArgentinaDateKey(0);
  const isLastMinute =
    isToday || (diffHours !== null && diffHours >= 0 && diffHours <= 12);

  if (isLastMinute) {
    await notifyAdmins(db, 'reservaUltimoMomento', (admin) =>
      sendAdminLastMinuteBookingEmail({
        to: admin.email,
        adminName: admin.nombre,
        alumnoNombre: recipient.nombre || data.alumnoNombre,
        dateKey: data.dateKey,
        startTime: data.startTime,
        instructorName: data.instructorName,
      })
    );
  }
}

async function handleReservationUpdated(databaseId, event) {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after || before.estado === after.estado) return;

  const db = getFirestore(databaseId);
  const recipient = await resolveStudentRecipient(
    db,
    after.usuarioId,
    after.alumnoEmail,
    after.alumnoNombre
  );

  if (after.estado === 'confirmada') {
    if (
      recipient.notificacionesEmail.confirmacionReserva &&
      isValidRecipientEmail(recipient.email)
    ) {
      await sendReservationConfirmedEmail({
        to: recipient.email,
        nombre: recipient.nombre,
        dateKey: after.dateKey,
        startTime: after.startTime,
        instructorName: after.instructorName,
      });
    }
    return;
  }

  if (
    CANCELLATION_NOTIFY_STATES.has(after.estado) &&
    recipient.notificacionesEmail.cancelacionReserva &&
    isValidRecipientEmail(recipient.email)
  ) {
    await sendReservationCancelledEmail({
      to: recipient.email,
      nombre: recipient.nombre,
      dateKey: after.dateKey,
      startTime: after.startTime,
      status: after.estado,
      reason: after.motivoCancelacion,
    });
  }

  if (STUDENT_CANCELLATION_STATES.has(after.estado)) {
    await notifyAdmins(db, 'cancelacionAlumno', (admin) =>
      sendAdminStudentCancelledEmail({
        to: admin.email,
        adminName: admin.nombre,
        alumnoNombre: recipient.nombre || after.alumnoNombre,
        dateKey: after.dateKey,
        startTime: after.startTime,
        status: after.estado,
      })
    );
  }
}

async function notifyAdminsOfPendingPayment(db, data) {
  await notifyAdmins(db, 'nuevoPagoPendiente', (admin) =>
    sendAdminNewPaymentEmail({
      to: admin.email,
      adminName: admin.nombre,
      alumnoNombre: data.alumnoNombre,
      paqueteNombre: data.paqueteNombre,
      monto: data.monto,
      metodoPago: data.metodoPago,
      fechaTransferencia: data.fechaTransferencia,
      numeroOperacion: data.numeroOperacion,
    })
  );
}

async function handlePaymentCreated(databaseId, event) {
  const data = event.data?.data();
  if (!data) return;
  if (data.estado !== 'pendiente_conciliacion' && data.estado !== 'pendiente') return;

  const db = getFirestore(databaseId);
  await notifyAdminsOfPendingPayment(db, data);
}

async function handlePaymentUpdated(databaseId, event) {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after || before.estado === after.estado) return;

  const db = getFirestore(databaseId);

  if (after.estado === 'pendiente_conciliacion' || after.estado === 'pendiente') {
    await notifyAdminsOfPendingPayment(db, after);
    return;
  }

  if (!PAYMENT_NOTIFY_STATES.has(after.estado)) return;

  const recipient = await resolveStudentRecipient(
    db,
    after.usuarioId,
    after.alumnoEmail,
    after.alumnoNombre
  );
  if (
    !recipient.notificacionesEmail.estadoPago ||
    !isValidRecipientEmail(recipient.email)
  ) {
    return;
  }

  await sendPaymentStatusEmail({
    to: recipient.email,
    nombre: recipient.nombre,
    paqueteNombre: after.paqueteNombre,
    monto: after.monto,
    estado: after.estado,
    motivoRechazo: after.motivoRechazo,
  });
}

async function processClassRemindersForDatabase(databaseId, candidateDates, nowMs) {
  const db = getFirestore(databaseId);
  const snap = await db
    .collection('reservas')
    .where('estado', '==', 'confirmada')
    .where('dateKey', 'in', candidateDates)
    .get();

  await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data() || {};
      if (data.recordatorioEnviado === true) return;

      const classDate = parseArgentinaClassDate(data.dateKey, data.startTime);
      if (!classDate) return;

      const diffHours = (classDate.getTime() - nowMs) / (1000 * 60 * 60);
      if (diffHours < 18 || diffHours > 26) return;

      const recipient = await resolveStudentRecipient(
        db,
        data.usuarioId,
        data.alumnoEmail,
        data.alumnoNombre
      );

      if (
        !recipient.notificacionesEmail.recordatorioClase ||
        !isValidRecipientEmail(recipient.email)
      ) {
        return;
      }

      const result = await sendClassReminderEmail({
        to: recipient.email,
        nombre: recipient.nombre,
        dateKey: data.dateKey,
        startTime: data.startTime,
        instructorName: data.instructorName,
      });

      if (result.sent) {
        await docSnap.ref.update({
          recordatorioEnviado: true,
          recordatorioEnviadoEn: FieldValue.serverTimestamp(),
        });
      }
    })
  );
}

/**
 * Envían confirmación por email cuando se crea una reserva ya confirmada (testing y prod).
 */
export const onReservationCreatedTesting = onDocumentCreated(
  { document: 'reservas/{reservaId}', database: 'emuna-testing' },
  (event) => handleReservationCreated('emuna-testing', event)
);

export const onReservationCreatedProd = onDocumentCreated(
  { document: 'reservas/{reservaId}', database: 'emuna-prod' },
  (event) => handleReservationCreated('emuna-prod', event)
);

/**
 * Envían avisos por email cuando una reserva pasa a confirmada o se cancela (testing y prod).
 */
export const onReservationUpdatedTesting = onDocumentUpdated(
  { document: 'reservas/{reservaId}', database: 'emuna-testing' },
  (event) => handleReservationUpdated('emuna-testing', event)
);

export const onReservationUpdatedProd = onDocumentUpdated(
  { document: 'reservas/{reservaId}', database: 'emuna-prod' },
  (event) => handleReservationUpdated('emuna-prod', event)
);

/**
 * Notifican por email cuando la administración aprueba, rechaza o vence un pago (testing y prod).
 */
export const onPaymentUpdatedTesting = onDocumentUpdated(
  { document: 'pagos/{pagoId}', database: 'emuna-testing' },
  (event) => handlePaymentUpdated('emuna-testing', event)
);

export const onPaymentUpdatedProd = onDocumentUpdated(
  { document: 'pagos/{pagoId}', database: 'emuna-prod' },
  (event) => handlePaymentUpdated('emuna-prod', event)
);

/**
 * Notifican a las administradoras cuando ingresa un nuevo pago pendiente de conciliación (testing y prod).
 */
export const onPaymentCreatedTesting = onDocumentCreated(
  { document: 'pagos/{pagoId}', database: 'emuna-testing' },
  (event) => handlePaymentCreated('emuna-testing', event)
);

export const onPaymentCreatedProd = onDocumentCreated(
  { document: 'pagos/{pagoId}', database: 'emuna-prod' },
  (event) => handlePaymentCreated('emuna-prod', event)
);

async function processDailyAdminSummaryForDatabase(databaseId, todayKey) {
  const db = getFirestore(databaseId);
  const settings = await getAdminNotificationSettings(db);
  if (settings.resumenDiario === false) return;

  const admins = await resolveAdminRecipients(db);
  if (!admins.length) return;

  const [turnsSnap, pendingPaymentsSnap] = await Promise.all([
    db.collection('turnos_clase').where('dateKey', '==', todayKey).get(),
    db.collection('pagos').where('estado', '==', 'pendiente_conciliacion').get(),
  ]);

  const activeTurns = turnsSnap.docs
    .map((docSnap) => docSnap.data() || {})
    .filter((t) => t.estado !== 'cancelado' && t.estado !== 'inhabilitado')
    .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));

  const totalTurns = activeTurns.length;
  const totalReserved = activeTurns.reduce((sum, t) => sum + (Number(t.cuposOcupados) || 0), 0);
  const totalCapacity = activeTurns.reduce((sum, t) => sum + (Number(t.capacidad) || 4), 0);
  const emptyTurns = activeTurns.filter((t) => (Number(t.cuposOcupados) || 0) === 0).length;
  const classesList = activeTurns.map((t) => ({
    startTime: t.startTime || '',
    occupied: Number(t.cuposOcupados) || 0,
    capacity: Number(t.capacidad) || 4,
    instructorName: t.instructorName || '',
  }));

  await Promise.all(
    admins.map((admin) =>
      sendAdminDailySummaryEmail({
        to: admin.email,
        adminName: admin.nombre,
        dateKey: todayKey,
        totalTurns,
        totalReserved,
        totalCapacity,
        emptyTurns,
        pendingPaymentsCount: pendingPaymentsSnap.size,
        classesList,
      })
    )
  );
}

/**
 * Cron diario a las 08:00 hs: envía resumen de la jornada a las administradoras activas.
 */
export const sendAdminDailySummary = onSchedule(
  {
    schedule: '0 8 * * *',
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  async () => {
    const todayKey = getArgentinaDateKey(0);
    await Promise.all(
      TARGET_DATABASES.map((databaseId) =>
        processDailyAdminSummaryForDatabase(databaseId, todayKey)
      )
    );
  }
);

/**
 * Cron cada hora: envía recordatorio ~24 hs antes de cada clase confirmada.
 */
export const sendUpcomingClassReminders = onSchedule(
  {
    schedule: '0 * * * *',
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  async () => {
    const candidateDates = [
      getArgentinaDateKey(0),
      getArgentinaDateKey(1),
      getArgentinaDateKey(2),
    ];
    const nowMs = Date.now();

    await Promise.all(
      TARGET_DATABASES.map((databaseId) =>
        processClassRemindersForDatabase(databaseId, candidateDates, nowMs)
      )
    );
  }
);

const EMAIL_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;

function hashVerificationCode(uid, email, code) {
  return createHash('sha256')
    .update(`${uid}:${email}:${code}`)
    .digest('hex');
}

function normalizeCandidateEmail(rawEmail) {
  return String(rawEmail || '').trim().toLowerCase();
}

/**
 * Genera y envía un código de 6 dígitos al nuevo correo electrónico de la alumna
 * para confirmar el cambio o alta de email en su perfil.
 */
export const requestEmailChangeCode = onCall({ cors: true }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión para realizar esta operación.');
  }

  const uid = request.auth.uid;
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const newEmail = normalizeCandidateEmail(request.data?.newEmail);

  if (!isValidRecipientEmail(newEmail)) {
    throw new HttpsError('invalid-argument', 'Ingresá un correo electrónico válido.');
  }

  const authInstance = getAuth();
  try {
    const existing = await authInstance.getUserByEmail(newEmail);
    if (existing && existing.uid !== uid) {
      throw new HttpsError(
        'already-exists',
        'Ese correo electrónico ya está asociado a otra cuenta.'
      );
    }
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    if (err?.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', 'No se pudo validar la disponibilidad del correo.');
    }
  }

  const db = getFirestore(databaseId);
  const userSnap = await db.collection('usuarios').doc(uid).get();
  const userData = userSnap.exists ? userSnap.data() || {} : {};
  const code = String(randomInt(100000, 1000000));
  const codeHash = hashVerificationCode(uid, newEmail, code);

  await db.collection('email_verification_codes').doc(uid).set({
    uid,
    newEmail,
    codeHash,
    attempts: 0,
    expiresAtMs: Date.now() + EMAIL_VERIFICATION_TTL_MS,
    creadoEn: FieldValue.serverTimestamp(),
  });

  const emailResult = await sendEmailChangeVerificationCodeEmail({
    to: newEmail,
    nombre: userData.nombre || '',
    code,
    expiresInMinutes: 10,
  });

  if (!emailResult?.sent) {
    throw new HttpsError(
      'failed-precondition',
      'No se pudo enviar el código porque el servicio SMTP no está configurado o falló.'
    );
  }

  return { success: true, expiresInMinutes: 10 };
});

/**
 * Verifica el código de 6 dígitos enviado por correo y actualiza el email
 * tanto en Firebase Auth como en el perfil de Firestore.
 */
export const confirmEmailChangeCode = onCall({ cors: true }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión para realizar esta operación.');
  }

  const uid = request.auth.uid;
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const newEmail = normalizeCandidateEmail(request.data?.newEmail);
  const code = String(request.data?.code || '').trim();

  if (!isValidRecipientEmail(newEmail) || !/^\d{6}$/.test(code)) {
    throw new HttpsError('invalid-argument', 'Ingresá un correo válido y un código de 6 dígitos.');
  }

  const db = getFirestore(databaseId);
  const codeRef = db.collection('email_verification_codes').doc(uid);
  const codeSnap = await codeRef.get();

  if (!codeSnap.exists) {
    throw new HttpsError('not-found', 'No hay un código pendiente. Solicitá uno nuevo.');
  }

  const record = codeSnap.data() || {};
  if (record.newEmail !== newEmail) {
    throw new HttpsError('invalid-argument', 'El correo no coincide con el código solicitado.');
  }

  if (Date.now() > Number(record.expiresAtMs || 0)) {
    await codeRef.delete();
    throw new HttpsError('deadline-exceeded', 'El código venció. Solicitá uno nuevo.');
  }

  const attempts = Number(record.attempts || 0);
  if (attempts >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
    await codeRef.delete();
    throw new HttpsError('resource-exhausted', 'Demasiados intentos fallidos. Solicitá un nuevo código.');
  }

  const expectedHash = Buffer.from(String(record.codeHash || ''), 'hex');
  const actualHash = Buffer.from(hashVerificationCode(uid, newEmail, code), 'hex');
  const isMatch =
    expectedHash.length === actualHash.length &&
    timingSafeEqual(expectedHash, actualHash);

  if (!isMatch) {
    await codeRef.update({ attempts: attempts + 1 });
    throw new HttpsError('invalid-argument', 'El código ingresado es incorrecto.');
  }

  await getAuth().updateUser(uid, {
    email: newEmail,
    emailVerified: true,
  });

  await db.collection('usuarios').doc(uid).set(
    {
      email: newEmail,
      authEmail: newEmail,
      actualizadoEn: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await codeRef.delete();
  return { success: true, email: newEmail };
});

async function loadPublicStudioContext(databaseId) {
  try {
    const db = getFirestore(databaseId);
    const [studioSnap, cobrosSnap, packagesSnap] = await Promise.all([
      db.collection('configuracion').doc('estudio').get(),
      db.collection('configuracion').doc('cobros').get(),
      db.collection('paquetes_catalogo').get(),
    ]);

    const studioData = studioSnap.exists ? studioSnap.data() || {} : {};
    const cobrosData = cobrosSnap.exists ? cobrosSnap.data() || {} : {};
    const packages = packagesSnap.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((pkg) => pkg.active !== false)
      .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

    return {
      nombreProfesora: studioData.nombreProfesora || '',
      horasVentanaCancelacion: studioData.horasVentanaCancelacion || 4,
      alias: cobrosData.alias || cobrosData.aliasCbu || '',
      titularCuenta: cobrosData.titularCuenta || '',
      packages,
    };
  } catch {
    return {};
  }
}

/**
 * Asistente virtual de la landing page (contexto directo sobre Emuná Pilates con Gemini API).
 */
export const askLandingAssistant = onCall({ cors: true }, async (request) => {
  const clientIp =
    request.rawRequest?.ip ||
    request.rawRequest?.headers?.['x-forwarded-for'] ||
    request.auth?.uid ||
    'anonymous';

  if (!checkAssistantRateLimit(clientIp)) {
    throw new HttpsError(
      'resource-exhausted',
      'Alcanzaste el límite temporal de consultas. Esperá un minuto o escribinos por WhatsApp.'
    );
  }

  const message = String(request.data?.message || '').trim();
  const history = Array.isArray(request.data?.history) ? request.data.history : [];
  const databaseId = resolveDatabaseId(request.data?.databaseId);

  if (!message) {
    throw new HttpsError('invalid-argument', 'Escribí una consulta antes de enviar.');
  }

  const dynamicContext = await loadPublicStudioContext(databaseId);

  try {
    const result = await generateAssistantReply({
      message,
      history,
      dynamicContext,
    });
    return { reply: result.reply };
  } catch (err) {
    if (err?.message === 'GEMINI_API_KEY_MISSING') {
      throw new HttpsError(
        'failed-precondition',
        'El asistente todavía no tiene configurada la clave de API.'
      );
    }
    throw new HttpsError(
      'internal',
      'No pudimos procesar tu consulta en este momento. Podés escribirnos por WhatsApp al +54 (3704) 578354.'
    );
  }
});
