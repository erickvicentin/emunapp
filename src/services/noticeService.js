import { httpsCallable } from 'firebase/functions';
import { databaseId, functions } from '../config/firebase';
import { mapCallableError } from './studentService';

const INTERNAL_AUTH_DOMAIN = '@dni.emuna.local';

/**
 * Checks if a student email address is a real deliverable email (excludes internal synthetic DNI emails).
 */
export function isDeliverableStudentEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || normalized.endsWith(INTERNAL_AUTH_DOMAIN)) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

/**
 * Sends a branded email notice to all active students with a valid email address.
 */
export async function sendActiveStudentsNotice({ subject, body }) {
  try {
    const callable = httpsCallable(functions, 'sendActiveStudentsNotice');
    const response = await callable({
      subject: String(subject || '').trim(),
      body: String(body || '').trim(),
      databaseId,
    });
    return response?.data || {
      totalActive: 0,
      eligibleRecipients: 0,
      sentCount: 0,
      failedCount: 0,
      skippedNoEmailCount: 0,
    };
  } catch (error) {
    throw new Error(
      mapCallableError(
        error,
        'No se pudo enviar el aviso por correo electrónico.'
      )
    );
  }
}
