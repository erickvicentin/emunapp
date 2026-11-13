import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, databaseId, db, functions } from '../config/firebase';
import { calculateAge } from '../utils/dateUtils';

const GENDER_LABEL_MAP = {
  mujer: 'Femenino',
  hombre: 'Masculino',
  no_especificar: 'Otro',
};

function mapCallableError(error, fallbackMessage) {
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
  const nombreApellido =
    data.nombreApellido ||
    `${data.nombre || ''} ${data.apellido || ''}`.trim() ||
    data.email ||
    'Sin nombre';

  return {
    id: id || data.uid,
    nombreApellido,
    email: data.email || '',
    telefono: data.telefono || '',
    fechaNacimiento: data.fechaNacimiento || '',
    dni: data.dni || 'Sin DNI',
    edad: data.edad ?? calculateAge(data.fechaNacimiento) ?? '-',
    sexo: data.sexo || GENDER_LABEL_MAP[data.genero] || 'Otro',
    porcentajeAsistencia: data.porcentajeAsistencia ?? 0,
    tienePaquete: Boolean(data.tienePaquete),
    inscriptoClases: Boolean(data.inscriptoClases),
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
