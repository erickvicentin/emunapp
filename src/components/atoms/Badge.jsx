import React from 'react';

/**
 * Badge Atom Component
 * Following CONTEXT.md design tokens
 * @param {Object} props
 * @param {'available'|'full'|'brand'|'neutral'|'warning'} [props.variant]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Badge({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm tracking-wide font-semibold text-xs transition-colors';

  const variants = {
    // Greenish / active for available reformer beds
    available: 'bg-emerald-100 text-emerald-800 border border-emerald-200/80',
    // Muted / gray for full slot
    full: 'bg-surface-container-highest text-on-surface-variant/70 border border-outline-variant/40',
    // Studio terracotta secondary
    brand: 'bg-secondary-fixed/40 text-secondary border border-secondary-fixed',
    // Soft neutral
    neutral: 'bg-surface-container text-on-surface-variant',
    // Warning
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
