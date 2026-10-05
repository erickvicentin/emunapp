import React from 'react';

/**
 * Material Symbols Outlined Icon atom
 * @param {Object} props
 * @param {string} props.name - Icon name (e.g. 'calendar_today', 'star')
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.filled] - Whether to render filled style
 * @param {string} [props.ariaLabel] - Accessibility label
 */
export default function Icon({ name, className = '', filled = false, ariaLabel }) {
  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center ${filled ? 'fill' : ''} ${className}`}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      {name}
    </span>
  );
}
