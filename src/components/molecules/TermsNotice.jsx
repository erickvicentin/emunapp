import React from 'react';

/**
 * TermsNotice Molecule
 * Terms checkbox reminding of the 2-hour cancellation window (CONTEXT.md)
 */
export default function TermsNotice({ checked, onChange, error }) {
  return (
    <div className="pt-space-xs space-y-2">
      <label
        htmlFor="register-terms"
        className="flex items-start gap-space-xs cursor-pointer select-none"
      >
        <input
          id="register-terms"
          name="aceptaTerminos"
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-1 w-4 h-4 rounded bg-surface-container text-primary-container focus:ring-0 accent-primary cursor-pointer shrink-0"
        />
        <span className="font-body-sm text-[13px] text-on-surface-variant leading-snug">
          Acepto las políticas de Emuná Pilates, incluyendo la{' '}
          <strong className="text-on-surface font-semibold">
            ventana de cancelación de hasta 2 horas de anticipación
          </strong>{' '}
          para liberar créditos de clase.
        </span>
      </label>
      {error && (
        <p className="font-body-sm text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
