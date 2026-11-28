import React, { useEffect, useId, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';
import { validatePasswordField } from '../../utils/registrationValidator';

function PasswordToggleButton({ isVisible, onToggle, testId, label }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={isVisible}
      aria-label={label}
      onClick={onToggle}
      className="text-on-surface-variant hover:text-primary transition-colors p-1"
    >
      <Icon name={isVisible ? 'visibility_off' : 'visibility'} className="text-[18px]" />
    </button>
  );
}

function ChangePasswordForm({
  titleId,
  hasPasswordProvider,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (hasPasswordProvider && !currentPassword) {
      setError('Ingresá tu contraseña actual.');
      return;
    }

    const pwdError = validatePasswordField(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (hasPasswordProvider && currentPassword === newPassword) {
      setError('La nueva contraseña debe ser distinta a la actual.');
      return;
    }

    try {
      await onSubmit?.({ currentPassword, newPassword });
      onClose?.();
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la contraseña.');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Seguridad de la cuenta
          </span>
          <h1
            id={titleId}
            data-testid="change-password-modal-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5"
          >
            {hasPasswordProvider ? 'Cambiar contraseña' : 'Crear contraseña'}
          </h1>
          {!hasPasswordProvider && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Tu cuenta ingresó con Google y aún no tiene contraseña local. Una vez creada, los próximos cambios requerirán tu contraseña actual.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de contraseña"
          data-testid="change-password-close-btn"
          className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {hasPasswordProvider && (
          <Input
            id="profile-current-password"
            data-testid="profile-current-password-input"
            name="currentPassword"
            type={showCurrent ? 'text' : 'password'}
            label="Contraseña actual"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Ingresá tu contraseña actual"
            icon="lock"
            autoComplete="current-password"
            autoFocus
            required
            endAction={
              <PasswordToggleButton
                isVisible={showCurrent}
                onToggle={() => setShowCurrent((prev) => !prev)}
                testId="toggle-current-password-btn"
                label={showCurrent ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
              />
            }
          />
        )}

        <div className="space-y-2">
          <Input
            id="profile-new-password"
            data-testid="profile-new-password-input"
            name="newPassword"
            type={showNew ? 'text' : 'password'}
            label="Nueva contraseña"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Elegí una contraseña segura"
            icon="lock_reset"
            autoComplete="new-password"
            autoFocus={!hasPasswordProvider}
            required
            endAction={
              <PasswordToggleButton
                isVisible={showNew}
                onToggle={() => setShowNew((prev) => !prev)}
                testId="toggle-new-password-btn"
                label={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
              />
            }
          />
          <PasswordRequirementsChecklist password={newPassword} />
        </div>

        <Input
          id="profile-confirm-password"
          data-testid="profile-confirm-password-input"
          name="confirmPassword"
          type={showNew ? 'text' : 'password'}
          label="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError('');
          }}
          placeholder="Repetí la nueva contraseña"
          icon="verified_user"
          autoComplete="new-password"
          required
        />

        {error && (
          <div
            role="alert"
            aria-live="polite"
            data-testid="change-password-error"
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
            data-testid="change-password-cancel-btn"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            data-testid="change-password-submit-btn"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * ChangePasswordModal Molecule
 * Native modal dialog allowing students to update (or create, for Google-only accounts)
 * their account password after verifying their current password.
 */
export default function ChangePasswordModal({
  open,
  hasPasswordProvider = true,
  isSubmitting = false,
  onClose,
  onSubmit,
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
      data-testid="change-password-modal"
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-surface-container-high bg-surface-container-lowest p-0 shadow-xl backdrop:bg-scrim/45 backdrop:backdrop-blur-xs"
    >
      {open && (
        <ChangePasswordForm
          titleId={titleId}
          hasPasswordProvider={hasPasswordProvider}
          isSubmitting={isSubmitting}
          onClose={handleClose}
          onSubmit={onSubmit}
        />
      )}
    </dialog>
  );
}
