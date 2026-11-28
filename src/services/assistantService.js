import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';

/**
 * Envía una consulta al asistente virtual de la landing page vía Cloud Function.
 */
export async function askLandingAssistant({ message, history = [] }) {
  const callable = httpsCallable(functions, 'askLandingAssistant');
  const response = await callable({
    message,
    history,
    databaseId: db.app.options.databaseId || undefined,
  });
  return String(response?.data?.reply || '').trim();
}
