import React from 'react';
import GoogleIcon from '../atoms/GoogleIcon';

/**
 * GoogleOnboardingBanner Molecule
 * Shows status when user is authenticating / onboarding via Google
 */
export default function GoogleOnboardingBanner({ googleUser, onReset }) {
  return (
    <div className="mt-space-md p-4 rounded-xl bg-surface-container border border-surface-container-highest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={googleUser.avatarUrl}
            alt={`Foto de perfil de ${googleUser.nombre}`}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
            <GoogleIcon className="w-3.5 h-3.5" />
          </span>
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
            <span>Conectado con Google:</span>
            <span className="text-secondary">{googleUser.email}</span>
          </p>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            Foto de perfil, nombre y fecha tomados automáticamente. Completá los campos obligatorios debajo.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="font-label-sm text-label-sm text-secondary hover:underline shrink-0 self-end sm:self-center cursor-pointer"
      >
        Usar otro correo
      </button>
    </div>
  );
}
