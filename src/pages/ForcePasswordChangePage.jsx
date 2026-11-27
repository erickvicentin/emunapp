import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import PasswordRequirementsChecklist from '../components/molecules/PasswordRequirementsChecklist';
import { validatePasswordField } from '../utils/registrationValidator';
import { useAuth } from '../hooks/useAuth';

/**
 * ForcePasswordChangePage View
 * Path: /cambiar-contrasena
 * Forces users with `requiereCambioPassword: true` (admin-created or password reset to DNI)
 * to set a new personal password before accessing the dashboard.
 */
export default function ForcePasswordChangePage() {
  const navigate = useNavigate();
  const { user, userProfile, loading, completeRequiredPasswordChange } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <AuthLayout>
        <div className="p-8 text-center text-body-md text-on-surface-variant">
          Verificando tu sesión...
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile?.requiereCambioPassword) {
    const isStaff = userProfile?.rol === 'staff' || userProfile?.rol === 'administradora';
    return <Navigate to={isStaff ? '/administrador/dashboard' : '/customer/turnos'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pwdError = validatePasswordField(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeRequiredPasswordChange(password);
      const isStaff = userProfile?.rol === 'staff' || userProfile?.rol === 'administradora';
      navigate(isStaff ? '/administrador/dashboard' : '/customer/turnos', { replace: true });
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar tu contraseña. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div
        data-testid="force-password-change-card"
        className="w-full max-w-md mx-auto bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Seguridad de tu cuenta
          </span>
          <h1 className="font-headline-md text-headline-md text-primary mt-1">
            Cambiá tu contraseña
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Por seguridad, debés elegir una contraseña personal antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="force-new-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            icon="lock"
            required
            autoComplete="new-password"
            endAction={
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Icon
                  name={showPassword ? 'visibility_off' : 'visibility'}
                  className="text-[20px]"
                />
              </button>
            }
          />

          <Input
            id="force-confirm-password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetí tu nueva contraseña"
            icon="lock"
            required
            autoComplete="new-password"
          />

          <PasswordRequirementsChecklist
            password={password}
            testIdPrefix="force-password-rule"
          />

          {error && (
            <div
              data-testid="force-password-error"
              className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            data-testid="force-password-submit-btn"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar contraseña y continuar'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
