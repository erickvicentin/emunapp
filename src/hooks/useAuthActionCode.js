import { useEffect, useState } from 'react';
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { auth } from '../config/firebase';

function mapActionCodeError(code) {
  switch (code) {
    case 'auth/expired-action-code':
      return 'El enlace expiró. Solicitá uno nuevo para restablecer tu contraseña.';
    case 'auth/invalid-action-code':
      return 'El enlace no es válido o ya fue utilizado.';
    case 'auth/user-disabled':
      return 'Esta cuenta se encuentra deshabilitada. Contactá a la administración de Emuná.';
    default:
      return 'No pudimos validar el enlace de seguridad. Solicitá uno nuevo.';
  }
}

/**
 * Manages Firebase Auth email action code verification and password reset submission.
 */
export function useAuthActionCode(mode, oobCode) {
  const [status, setStatus] = useState(() => (oobCode ? 'verifying' : 'invalid'));
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [actionError, setActionError] = useState(() =>
    oobCode ? '' : 'El enlace no contiene un código de verificación válido.'
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) return;

    let active = true;

    const validateCode = async () => {
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          if (active) setStatus('success');
          return;
        }

        if (mode !== 'resetPassword') {
          if (active) {
            setActionError('La acción solicitada en el enlace no es compatible.');
            setStatus('invalid');
          }
          return;
        }

        const email = await verifyPasswordResetCode(auth, oobCode);
        if (!active) return;
        setVerifiedEmail(email || '');
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setActionError(mapActionCodeError(err?.code));
        setStatus('invalid');
      }
    };

    validateCode();
    return () => {
      active = false;
    };
  }, [mode, oobCode]);

  const submitNewPassword = async (password) => {
    setActionError('');
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('success');
    } catch (err) {
      setActionError(mapActionCodeError(err?.code));
      if (
        err?.code === 'auth/expired-action-code' ||
        err?.code === 'auth/invalid-action-code'
      ) {
        setStatus('invalid');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    status,
    verifiedEmail,
    actionError,
    submitting,
    submitNewPassword,
  };
}
