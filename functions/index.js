import { randomBytes } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const ALLOWED_DATABASES = new Set(['emuna-testing', 'emuna-prod']);
const STAFF_ROLES = new Set(['staff', 'administradora']);
const RELATED_COLLECTIONS = ['reservas', 'membresias_usuario', 'pagos'];

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

function formatDni(rawDni) {
  const digits = String(rawDni || '').replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function validateStudentPayload(data) {
  const nombre = String(data?.nombre || '').trim();
  const apellido = String(data?.apellido || '').trim();
  const telefono = String(data?.telefono || '').trim();
  const fechaNacimiento = String(data?.fechaNacimiento || '').trim();
  const genero = String(data?.genero || 'no_especificar').trim();
  const email = String(data?.email || '').trim().toLowerCase();
  const dniDigits = String(data?.dni || '').replace(/\D/g, '');

  if (!nombre || !apellido || !telefono || !fechaNacimiento || !email) {
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

  return {
    nombre,
    apellido,
    telefono,
    fechaNacimiento,
    genero,
    email,
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

/**
 * Crea un alumno en Firebase Auth y en la colección `usuarios` de Firestore
 * con rol `customer` utilizando Firebase Admin SDK.
 */
export const createStudentAccount = onCall(async (request) => {
  assertStaffCaller(request);
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const payload = validateStudentPayload(request.data);
  const auth = getAuth();
  const initialRandomPassword = randomBytes(24).toString('base64url');

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: payload.email,
      password: initialRandomPassword,
      displayName: `${payload.nombre} ${payload.apellido}`.trim(),
      emailVerified: false,
    });
    await auth.setCustomUserClaims(userRecord.uid, { rol: 'customer' });
  } catch (error) {
    if (userRecord?.uid) {
      await auth.deleteUser(userRecord.uid).catch(() => {});
    }
    if (error?.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'Ya existe una cuenta registrada con ese correo electrónico.'
      );
    }
    throw new HttpsError(
      'internal',
      error?.message || 'No se pudo crear el usuario en Firebase Authentication.'
    );
  }

  const studentProfile = {
    uid: userRecord.uid,
    email: payload.email,
    nombre: payload.nombre,
    apellido: payload.apellido,
    telefono: payload.telefono,
    fechaNacimiento: payload.fechaNacimiento,
    genero: payload.genero,
    dni: payload.dniFormatted,
    photoURL: '',
    rol: 'customer',
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
        ...studentProfile,
        creadoEn: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    await auth.deleteUser(userRecord.uid).catch(() => {});
    throw new HttpsError(
      'internal',
      error?.message || 'No se pudo guardar el perfil del alumno en Firestore.'
    );
  }

  let activationLinkGenerated = false;
  try {
    await auth.generatePasswordResetLink(payload.email);
    activationLinkGenerated = true;
  } catch {
    activationLinkGenerated = false;
  }

  return {
    student: studentProfile,
    activationLinkGenerated,
  };
});

/**
 * Elimina un usuario con rol `customer` de Firestore (perfil y colecciones relacionadas)
 * y de Firebase Authentication utilizando Firebase Admin SDK.
 */
export const deleteStudentAccount = onCall(async (request) => {
  assertStaffCaller(request);
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = getFirestore(databaseId);
  const auth = getAuth();
  const uid = String(request.data?.uid || '').trim();

  if (!uid) {
    throw new HttpsError('invalid-argument', 'El identificador del alumno es obligatorio.');
  }

  if (uid === request.auth.uid) {
    throw new HttpsError(
      'failed-precondition',
      'No podés eliminar tu propia cuenta de administrador.'
    );
  }

  try {
    const targetAuthUser = await auth.getUser(uid);
    if (hasStaffClaim(targetAuthUser.customClaims)) {
      throw new HttpsError(
        'permission-denied',
        'No podés eliminar cuentas de personal o administración.'
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
    throw new HttpsError('not-found', 'El perfil del alumno no existe en Firestore.');
  }

  if (targetUserSnap.data()?.rol !== 'customer') {
    throw new HttpsError(
      'permission-denied',
      'Solo se permite eliminar cuentas con rol customer.'
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
});
