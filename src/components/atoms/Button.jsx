import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button component (Atom)
 * Supports 'primary', 'secondary', 'light', 'outline', 'ghost'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ariaLabel,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-label-lg rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-4 py-2 text-label-sm',
    md: 'px-6 py-3 text-label-md',
    lg: 'px-6 py-3.5 text-label-lg',
  };

  const variantStyles = {
    primary:
      'bg-primary-container text-on-primary hover:bg-primary shadow-[0_2px_8px_-2px_rgba(44,36,34,0.12)] hover:-translate-y-0.5',
    secondary:
      'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-[0_2px_8px_-2px_rgba(130,83,62,0.25)] hover:-translate-y-0.5',
    light:
      'bg-surface-container text-primary hover:bg-surface-container-high transition-colors',
    outline:
      'border border-outline-variant text-primary hover:bg-surface-container transition-colors',
    ghost:
      'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 transition-colors',
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={combinedStyles}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={combinedStyles}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedStyles}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}
