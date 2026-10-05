import React from 'react';
import Icon from './Icon';

function InputLabel({ id, label, required }) {
  if (!label) return null;
  return (
    <label htmlFor={id} className="block font-label-md text-label-md text-on-surface">
      {label}
      {required && <span className="text-secondary ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

function InputFeedback({ error, helperText, errorId, helperId }) {
  if (error) {
    return (
      <p id={errorId} className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-1">
        <Icon name="error" className="text-[16px]" />
        <span>{error}</span>
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={helperId} className="font-body-sm text-body-sm text-on-surface-variant mt-1">
        {helperText}
      </p>
    );
  }
  return null;
}

/**
 * Reusable Input component (Atom)
 * Complies with accessibility standards (associated label, aria-* attributes)
 */
export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  helperText,
  required = false,
  endAction,
  className = '',
  disabled = false,
  autoComplete,
  min,
  max,
  ...props
}) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;
  const paddingLeft = icon ? 'pl-11' : 'pl-4';
  const paddingRight = endAction ? 'pr-11' : 'pr-space-md';
  const borderState = error
    ? 'border-error focus:ring-error/40'
    : 'border-transparent focus:ring-secondary/40';

  return (
    <div className={`space-y-space-xs ${className}`}>
      <InputLabel id={inputId} label={label} required={required} />

      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none select-none">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          min={min}
          max={max}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId || helperId}
          className={`w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 rounded-xl py-3 font-body-md text-body-md transition-colors outline-none focus:ring-2 shadow-sm border ${paddingLeft} ${paddingRight} ${borderState}`}
          {...props}
        />

        {endAction && (
          <div className="absolute right-3 flex items-center justify-center">
            {endAction}
          </div>
        )}
      </div>

      <InputFeedback
        error={error}
        helperText={helperText}
        errorId={errorId}
        helperId={helperId}
      />
    </div>
  );
}
