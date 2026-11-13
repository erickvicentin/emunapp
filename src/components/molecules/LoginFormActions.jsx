import React from 'react';
import Icon from '../atoms/Icon';
import GoogleIcon from '../atoms/GoogleIcon';

/**
 * LoginFormActions Molecule
 * Renders primary submit button, Google OAuth entry, and privacy notice.
 */
export default function LoginFormActions({ loading, onGoogleClick }) {
  return (
    <div className="pt-space-xs space-y-space-sm">
      <button
        type="submit"
        data-testid="login-submit-btn"
        disabled={loading}
        className="w-full py-3.5 px-space-lg rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-space-xs disabled:opacity-60 cursor-pointer"
      >
        <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>

      <div className="relative flex items-center justify-center py-1">
        <span className="w-full h-[1px] bg-surface-container-high" />
        <span className="absolute bg-surface-container-lowest px-space-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          o
        </span>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={onGoogleClick}
        className="w-full py-3 px-space-lg rounded-full bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-space-sm shadow-sm cursor-pointer"
      >
        <GoogleIcon />
        <span>Continuar con Google</span>
      </button>

      <p className="text-center font-body-sm text-[12px] text-on-surface-variant px-space-xs leading-snug">
        Solo utilizaremos tu nombre, fecha de nacimiento y foto de perfil para gestionar tus reservas.
      </p>
    </div>
  );
}
