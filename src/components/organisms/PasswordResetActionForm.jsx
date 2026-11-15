import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { validatePasswordField } from '../../utils/registrationValidator';
import { useAuthActionCode } from '../../hooks/useAuthActionCode';
import StudioBanner from '../molecules/StudioBanner';
import AuthActionStatusCard from '../molecules/AuthActionStatusCard';
import PasswordRequirementsChecklist from '../molecules/PasswordRequirementsChecklist';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * PasswordResetActionForm Organism
 * Handles Firebase Auth email action links (/auth/action?mode=...&oobCode=...).
 */
export default function PasswordResetActionForm() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'resetPassword';
  const oobCode = searchParams.get('oobCode') || '';

  const { status, verifiedEmail, actionError, submitting, submitNewPassword } =
    useAuthActionCode(mode, oobCode);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    const passwordError = validatePasswordField(password);
    if (passwordError) nextErrors.password = passwordError;

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirmá tu nueva contraseña.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await submitNewPassword(password);
  };

  return (
    <div
      data-testid="auth-action-card"
      className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-surface-container-high/60"
    >
      <StudioBanner
        badgeText="Activación y Seguridad"
        badgeIcon="verified_user"
        headline="Emuná Estudio"
        description="Definí una contraseña segura para acceder a tu cuenta y gestionar tus clases."
      />

      <div className="w-full lg:w-7/12 p-space-lg sm:p-space-xl lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
        <div>
          <div className="space-y-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Seguridad de Cuenta
            </span>
            <h1
              data-testid="auth-action-title"
              className="font-headline-lg text-headline-lg text-primary tracking-tight"
            >
              {mode === 'verifyEmail' ? 'Verificación de correo' : 'Crear nueva contraseña'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {mode === 'verifyEmail'
                ? 'Estamos confirmando tu dirección de correo electrónico.'
                : 'Elegí tu nueva contraseña para activar tu acceso o completar el restablecimiento.'}
            </p>
          </div>

          <AuthActionStatusCard status={status} mode={mode} actionError={actionError} />

          {status === 'ready' && (
            <form
              data-testid="reset-password-form"
              className="mt-space-lg space-y-space-md"
              onSubmit={handleSubmit}
              noValidate
            >
              {verifiedEmail && (
                <div
                  data-testid="reset-password-email-badge"
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center gap-2 text-body-sm text-on-surface-variant"
                >
                  <Icon name="alternate_email" className="text-[18px] text-secondary shrink-0" />
                  <span>
                    Cuenta: <strong className="text-on-surface">{verifiedEmail}</strong>
                  </span>
                </div>
              )}

              {actionError && (
                <div
                  role="alert"
                  data-testid="reset-password-error-alert"
                  className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2"
                >
                  <Icon name="error" className="text-[18px] text-error shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <Input
                id="reset-password-input"
                data-testid="reset-password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Nueva contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Ingresá tu nueva contraseña"
                icon="lock"
                required
                error={errors.password}
                autoComplete="new-password"
                endAction={
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    data-testid="reset-password-toggle-visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-on-surface-variant hover:text-on-surface p-1 transition-colors cursor-pointer"
                  >
                    <Icon
                      name={showPassword ? 'visibility_off' : 'visibility'}
                      className="text-[20px]"
                    />
                  </button>
                }
              />

              <Input
                id="reset-confirm-password-input"
                data-testid="reset-confirm-password-input"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Repetí tu nueva contraseña"
                icon="lock"
                required
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <PasswordRequirementsChecklist
                password={password}
                testIdPrefix="reset-password-rule"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                data-testid="reset-password-submit-btn"
                className="w-full justify-center shadow-md cursor-pointer"
              >
                <span>{submitting ? 'Guardando contraseña...' : 'Guardar nueva contraseña'}</span>
              </Button>
            </form>
          )}
        </div>

        <div className="mt-space-lg pt-space-sm border-t border-surface-container text-center">
          <Link
            to="/login"
            data-testid="auth-action-back-link"
            className="inline-flex items-center gap-1.5 font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
