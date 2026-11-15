import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, databaseId, db, functions } from '../config/firebase';
import {
  formatDni,
  mapCallableError,
  mapStudentProfileToRow,
  updateStudentActiveStatus,
  updateStudentProfile,
} from './studentService';

export { formatDni, mapStudentProfileToRow };

export async function fetchStaffUsers() {
  const usersRef = collection(db, 'usuarios');
  const staffQuery = query(usersRef, where('rol', '==', 'staff'));
  const snapshot = await getDocs(staffQuery);
  return snapshot.docs.map((docSnap) =>
    mapStudentProfileToRow(docSnap.data(), docSnap.id)
  );
}

export async function createStaffViaAdmin(formData) {
  try {
    const createStaffCallable = httpsCallable(functions, 'createStaffAccount');
    const response = await createStaffCallable({
      ...formData,
      databaseId,
    });

    const createdProfile = response?.data?.staff;
    if (!createdProfile) {
      throw new Error('No se recibió el perfil del usuario staff creado.');
    }

    let emailSent = false;
    try {
      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase());
      emailSent = true;
    } catch {
      emailSent = false;
    }

    return {
      staff: mapStudentProfileToRow(createdProfile, createdProfile.uid),
      emailSent,
    };
  } catch (error) {
    throw new Error(
      mapCallableError(error, 'No se pudo registrar el usuario staff en Firebase.')
    );
  }
}

export async function deleteStaffViaAdmin(uid) {
  try {
    const deleteStaffCallable = httpsCallable(functions, 'deleteStaffAccount');
    await deleteStaffCallable({ uid, databaseId });
    return { success: true, uid };
  } catch (error) {
    throw new Error(
      mapCallableError(
        error,
        'No se pudo eliminar el usuario staff de Firebase Auth y Firestore.'
      )
    );
  }
}

export async function updateStaffProfile(uid, formData) {
  return updateStudentProfile(uid, formData);
}

export async function updateStaffActiveStatus(uid, active) {
  return updateStudentActiveStatus(uid, active);
}
