import React from 'react';
import GoogleIcon from '../atoms/GoogleIcon';

/**
 * GoogleRegisterButton Molecule
 * Top button and divider on registration page
 */
export default function GoogleRegisterButton({ onClick }) {
  return (
    <div className="mt-space-md">
      <button
        type="button"
        onClick={onClick}
        className="w-full py-3 px-space-lg rounded-full bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-space-sm shadow-sm cursor-pointer"
      >
        <GoogleIcon />
        <span>Registrate con Google</span>
      </button>
      <p className="text-center font-body-sm text-[12px] text-on-surface-variant mt-1.5 px-space-xs leading-snug">
        De Google solo tomamos foto de perfil, nombre y fecha de nacimiento para el cálculo de tu edad.
      </p>

      <div className="relative flex items-center justify-center my-3">
        <span className="w-full h-[1px] bg-surface-container-high" />
        <span className="absolute bg-surface-container-lowest px-space-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          o completá el formulario
        </span>
      </div>
    </div>
  );
}
