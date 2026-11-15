import React from 'react';

/**
 * Switch Atom
 * Accessible toggle switch with smooth sliding thumb animation.
 */
export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  ariaLabel,
  testId,
  className = '',
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid={testId}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
        border border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${checked ? 'bg-secondary' : 'bg-outline-variant/60'}
        ${className}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
}
