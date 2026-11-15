import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * AuthActionStatusCard Molecule
 * Renders verifying, invalid, and success states for Firebase Auth action links.
 */
export default function AuthActionStatusCard({ status, mode, actionError }) {
  if (status === 'verifying') {
    return (
      <div
        data-testid="auth-action-loading"
        className="mt-space-lg p-5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center gap-3 text-on-surface-variant"
      >
        <Icon name="progress_activity" className="text-[22px] text-secondary animate-spin" />
        <span className="font-body-md text-body-md">
          Validando enlace de seguridad...
        </span>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div
        role="alert"
        data-testid="auth-action-invalid"
        className="mt-space-lg p-5 rounded-xl bg-error-container text-on-error-container space-y-4"
      >
        <div className="flex items-start gap-3">
          <Icon name="error" className="text-[22px] text-error shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-title-md text-title-md font-semibold">
              Enlace inválido o vencido
            </h2>
            <p className="font-body-md text-body-md">{actionError}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/recuperar-contrasena">
            <Button variant="primary" size="md" data-testid="auth-action-request-new-btn">
              <span>Solicitar nuevo enlace</span>
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="md">
              <span>Ir al inicio de sesión</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    const isVerifyEmail = mode === 'verifyEmail';
    return (
      <div
        data-testid="auth-action-success"
        className="mt-space-lg p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4"
      >
        <div className="flex items-start gap-3">
          <Icon name="check_circle" className="text-[24px] text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-title-md text-title-md text-emerald-950 font-semibold">
              {isVerifyEmail ? 'Correo verificado correctamente' : 'Contraseña actualizada'}
            </h2>
            <p className="font-body-md text-body-md text-emerald-900">
              {isVerifyEmail
                ? 'Tu correo electrónico ya quedó verificado. Podés ingresar a tu cuenta.'
                : 'Tu nueva contraseña ya está activa. Ahora podés iniciar sesión con tu cuenta.'}
            </p>
          </div>
        </div>

        <Link to="/login">
          <Button variant="primary" size="md" data-testid="auth-action-login-btn">
            <span>Iniciar sesión</span>
          </Button>
        </Link>
      </div>
    );
  }

  return null;
}
