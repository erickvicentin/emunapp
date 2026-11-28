import React, { useEffect, useId, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import { validateEmailField } from '../../utils/registrationValidator';

function EmailChangeForm({
  titleId,
  currentEmail,
  isSubmitting,
  onClose,
  onRequestCode,
  onConfirmCode,
}) {
  const [step, setStep] = useState('email');
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');

    const normalized = newEmail.trim().toLowerCase();
    const emailError = validateEmailField(normalized);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (currentEmail && normalized === currentEmail.trim().toLowerCase()) {
      setError('Ingresá un correo distinto al actual.');
      return;
    }

    try {
      await onRequestCode?.(normalized);
      setNewEmail(normalized);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(err?.message || 'No se pudo enviar el código de confirmación.');
    }
  };

  const handleConfirmCode = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedCode = code.trim();
    if (!/^\d{6}$/.test(cleanedCode)) {
      setError('Ingresá el código numérico de 6 dígitos.');
      return;
    }

    try {
      await onConfirmCode?.(newEmail.trim().toLowerCase(), cleanedCode);
      onClose?.();
    } catch (err) {
      setError(err?.message || 'El código ingresado no es válido o venció.');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Verificación por correo
          </span>
          <h1
            id={titleId}
            data-testid="email-change-modal-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5"
          >
            {currentEmail ? 'Cambiar correo electrónico' : 'Agregar correo electrónico'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de correo"
          data-testid="email-change-close-btn"
          className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleRequestCode} noValidate className="space-y-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Te vamos a enviar un código de 6 dígitos al nuevo correo para confirmar que te pertenece.
          </p>

          <Input
            id="profile-new-email"
            data-testid="profile-new-email-input"
            name="newEmail"
            type="email"
            label="Nuevo correo electrónico"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="Ej. lucia@gmail.com"
            icon="mail"
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            required
          />

          {error && (
            <div
              role="alert"
              aria-live="polite"
              data-testid="email-change-error"
              className="p-3 rounded-xl bg-error/10 border border-error/25 text-error text-body-sm flex items-center gap-2"
            >
              <Icon name="error" className="text-[18px] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="email-change-cancel-btn"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              data-testid="email-change-send-code-btn"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar código'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleConfirmCode} noValidate className="space-y-4">
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm text-on-surface-variant">
            Enviamos un código de 6 dígitos a{' '}
            <strong className="text-on-surface">{newEmail}</strong>. Revisá tu bandeja de entrada o spam.
          </div>

          <Input
            id="profile-email-code"
            data-testid="profile-email-code-input"
            name="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            label="Código de confirmación"
            value={code}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(digits);
              if (error) setError('');
            }}
            placeholder="123456"
            icon="pin"
            autoFocus
            required
          />

          {error && (
            <div
              role="alert"
              aria-live="polite"
              data-testid="email-change-error"
              className="p-3 rounded-xl bg-error/10 border border-error/25 text-error text-body-sm flex items-center gap-2"
            >
              <Icon name="error" className="text-[18px] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
              }}
              disabled={isSubmitting}
              data-testid="email-change-back-btn"
              className="text-label-md font-medium text-secondary hover:underline"
            >
              Cambiar dirección
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                data-testid="email-change-cancel-btn"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                data-testid="email-change-confirm-btn"
              >
                {isSubmitting ? 'Verificando...' : 'Confirmar correo'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * EmailChangeModal Molecule
 * Two-step native dialog to add or update a student's email address
 * using a 6-digit verification code sent via Cloud Functions.
 */
export default function EmailChangeModal({
  open,
  currentEmail = '',
  isSubmitting = false,
  onClose,
  onRequestCode,
  onConfirmCode,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      data-testid="email-change-modal"
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-surface-container-high bg-surface-container-lowest p-0 shadow-xl backdrop:bg-scrim/45 backdrop:backdrop-blur-xs"
    >
      {open && (
        <EmailChangeForm
          titleId={titleId}
          currentEmail={currentEmail}
          isSubmitting={isSubmitting}
          onClose={handleClose}
          onRequestCode={onRequestCode}
          onConfirmCode={onConfirmCode}
        />
      )}
    </dialog>
  );
}
