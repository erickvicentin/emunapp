import { randomBytes } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

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
