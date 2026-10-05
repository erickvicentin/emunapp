import React from 'react';

/**
 * Avatar Atom Component
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {string} [props.initials]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.className]
 */
export default function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}) {
  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${selectedSize} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-semibold select-none shrink-0 ${className}`}
      aria-label={alt}
    >
      {initials || 'U'}
    </div>
  );
}
