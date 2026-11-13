import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const ALLOWED_DATABASES = new Set(['emuna-testing', 'emuna-prod']);
const RELATED_COLLECTIONS = ['reservas', 'membresias_usuario', 'pagos'];

function resolveDatabaseId(databaseId) {
  const target = databaseId || 'emuna-testing';
  if (!ALLOWED_DATABASES.has(target)) {
    throw new HttpsError('invalid-argument', 'Base de datos no permitida.');
  }
  return target;
}

async function assertStaffCaller(request, databaseId) {
  if (!request.auth?.uid) {
    throw new HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para realizar esta operación.'
    );
  }

  const db = getFirestore(databaseId);
  const callerSnap = await db.collection('usuarios').doc(request.auth.uid).get();
  const callerRole = callerSnap.exists ? callerSnap.data()?.rol : null;

  if (callerRole !== 'staff' && callerRole !== 'administradora') {
    throw new HttpsError(
      'permission-denied',
      'Solo el personal autorizado puede gestionar alumnos.'
    );
  }

  return db;
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
      'El DNI debe tener al menos 6 dígitos para usarse como contraseña inicial.'
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
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = await assertStaffCaller(request, databaseId);
  const payload = validateStudentPayload(request.data);
  const auth = getAuth();

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: payload.email,
      password: payload.dniDigits,
      displayName: `${payload.nombre} ${payload.apellido}`.trim(),
      emailVerified: false,
    });
  } catch (error) {
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

  let activationLink = null;
  try {
    activationLink = await auth.generatePasswordResetLink(payload.email);
  } catch {
    // Si no se pudo generar el enlace, el usuario igual queda activo con DNI como clave inicial.
  }

  return {
    student: studentProfile,
    activationLink,
  };
});

/**
 * Elimina un usuario de Firestore (perfil y colecciones relacionadas)
 * y de Firebase Authentication utilizando Firebase Admin SDK.
 */
export const deleteStudentAccount = onCall(async (request) => {
  const databaseId = resolveDatabaseId(request.data?.databaseId);
  const db = await assertStaffCaller(request, databaseId);
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

  for (const collectionName of RELATED_COLLECTIONS) {
    await deleteCollectionByUserId(db, collectionName, uid);
  }

  await db.collection('usuarios').doc(uid).delete();

  try {
    await getAuth().deleteUser(uid);
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
