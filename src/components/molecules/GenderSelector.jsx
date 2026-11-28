import React from 'react';
import Icon from '../atoms/Icon';
import SelectChevron from '../atoms/SelectChevron';

const GENDER_OPTIONS = [
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'no_especificar', label: 'No especificar' },
];

/**
 * GenderSelector Molecule
 * Accessible dropdown select for user gender (Mandatory for Emuná profile)
 */
export default function GenderSelector({
  value,
  onChange,
  error,
  id = 'register-genero',
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-space-xs">
      <label
        htmlFor={id}
        className="block font-label-md text-label-md text-on-surface"
      >
        Género <span className="text-secondary ml-1" aria-hidden="true">*</span>
      </label>

      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none select-none">
          wc
        </span>

        <select
          id={id}
          data-testid="register-genero-select"
          name="genero"
          value={value}
          onChange={onChange}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full bg-surface-container-lowest text-on-surface rounded-xl pl-11 pr-10 py-3 font-body-md text-body-md transition-colors outline-none focus:ring-2 shadow-xs border appearance-none cursor-pointer ${
            error
              ? 'border-error focus:ring-error/40'
              : 'border-outline-variant focus:border-secondary focus:ring-secondary/30'
          } ${!value ? 'text-on-surface-variant/70' : ''}`}
        >
          <option value="" disabled>
            Seleccioná tu género
          </option>
          {GENDER_OPTIONS.map((item) => (
            <option
              key={item.value}
              value={item.value}
              className="text-on-surface bg-surface-container-lowest py-1"
            >
              {item.label}
            </option>
          ))}
        </select>

        <SelectChevron />
      </div>

      {error && (
        <p id={errorId} className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-1">
          <Icon name="error" className="text-[16px]" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
