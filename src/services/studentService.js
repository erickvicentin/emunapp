import { sendPasswordResetEmail } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, databaseId, db, functions } from '../config/firebase';
import { calculateAge } from '../utils/dateUtils';

const GENDER_LABEL_MAP = {
  mujer: 'Femenino',
  hombre: 'Masculino',
  no_especificar: 'Otro',
};

export function formatDni(rawDni) {
  const digits = String(rawDni || '').replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function mapCallableError(error, fallbackMessage) {
  const code = error?.code || '';
  if (code.includes('not-found') || code.includes('unavailable')) {
    return 'El servicio de administración de Firebase (Cloud Functions) no está desplegado o no responde en este entorno.';
  }
  if (code.includes('permission-denied')) {
    return 'No tenés permisos de administradora para realizar esta operación.';
  }
  if (code.includes('unauthenticated')) {
    return 'Tu sesión expiró. Volvé a iniciar sesión para continuar.';
  }
  if (code.includes('already-exists')) {
    return 'Ya existe un usuario registrado con ese correo electrónico.';
  }
  return error?.message || fallbackMessage;
}

export function mapStudentProfileToRow(data, id) {
  const nombre = data.nombre || '';
  const apellido = data.apellido || '';
  const nombreApellido =
    data.nombreApellido ||
    `${nombre} ${apellido}`.trim() ||
    data.email ||
    'Sin nombre';

  return {
    id: id || data.uid,
    nombre,
    apellido,
    nombreApellido,
    email: data.email || '',
    telefono: data.telefono || '',
    fechaNacimiento: data.fechaNacimiento || '',
    genero: data.genero || 'no_especificar',
    photoURL: data.photoURL || '',
    dni: data.dni || 'Sin DNI',
    edad: data.edad ?? calculateAge(data.fechaNacimiento) ?? '-',
    sexo: data.sexo || GENDER_LABEL_MAP[data.genero] || 'Otro',
    porcentajeAsistencia: data.porcentajeAsistencia ?? 0,
    tienePaquete: Boolean(data.tienePaquete),
    inscriptoClases: Boolean(data.inscriptoClases),
    active: data.active !== false,
    isMock: Boolean(data.isMock),
  };
}

export async function fetchCustomerStudents() {
  const usersRef = collection(db, 'usuarios');
  const customersQuery = query(usersRef, where('rol', '==', 'customer'));
  const snapshot = await getDocs(customersQuery);
  return snapshot.docs.map((docSnap) =>
    mapStudentProfileToRow(docSnap.data(), docSnap.id)
  );
}

export async function createStudentViaAdmin(formData) {
  try {
    const createStudentCallable = httpsCallable(functions, 'createStudentAccount');
    const response = await createStudentCallable({
      ...formData,
      databaseId,
    });

    const createdProfile = response?.data?.student;
    if (!createdProfile) {
      throw new Error('No se recibió el perfil del alumno creado.');
    }

    let emailSent = false;
    try {
      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase());
      emailSent = true;
    } catch {
      emailSent = false;
    }

    return {
      student: mapStudentProfileToRow(createdProfile, createdProfile.uid),
      emailSent,
    };
  } catch (error) {
    throw new Error(
      mapCallableError(error, 'No se pudo registrar el alumno en Firebase.')
    );
  }
}

export async function deleteStudentViaAdmin(uid) {
  try {
    const deleteStudentCallable = httpsCallable(functions, 'deleteStudentAccount');
    await deleteStudentCallable({ uid, databaseId });
    return { success: true, uid };
  } catch (error) {
    throw new Error(
      mapCallableError(
        error,
        'No se pudo eliminar el alumno de Firebase Auth y Firestore.'
      )
    );
  }
}

export async function updateStudentProfile(uid, formData) {
  const updatedFields = {
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    telefono: formData.telefono.trim(),
    fechaNacimiento: formData.fechaNacimiento,
    genero: formData.genero || 'no_especificar',
    dni: formatDni(formData.dni),
  };

  try {
    const userDocRef = doc(db, 'usuarios', uid);
    await updateDoc(userDocRef, {
      ...updatedFields,
      actualizadoEn: serverTimestamp(),
    });
    return updatedFields;
  } catch (error) {
    throw new Error(
      mapCallableError(
        error,
        'No se pudieron actualizar los datos del alumno en Firestore.'
      )
    );
  }
}

export async function updateStudentActiveStatus(uid, active) {
  const nextActive = Boolean(active);
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    await updateDoc(userDocRef, {
      active: nextActive,
      actualizadoEn: serverTimestamp(),
    });
    return nextActive;
  } catch (error) {
    throw new Error(
      mapCallableError(
        error,
        'No se pudo actualizar el estado del alumno en Firestore.'
      )
    );
  }
}
