import React from 'react';
import Icon from './Icon';

/**
 * Avatar Atom Component
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {string} [props.initials]
 * @param {string} [props.fallbackIcon]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size]
 * @param {string} [props.className]
 * @param {string} [props.testId]
 */
export default function Avatar({
  src,
  alt = 'Avatar',
  initials,
  fallbackIcon,
  size = 'md',
  className = '',
  testId,
}) {
  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-20 h-20 text-2xl',
  };

  const iconSizes = {
    sm: 'text-[16px]',
    md: 'text-[18px]',
    lg: 'text-[22px]',
    xl: 'text-[40px]',
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedIconSize = iconSizes[size] || iconSizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        data-testid={testId}
        className={`${selectedSize} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      data-testid={testId}
      className={`${selectedSize} rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-semibold select-none shrink-0 ${className}`}
      aria-label={alt}
    >
      {fallbackIcon ? (
        <Icon name={fallbackIcon} className={selectedIconSize} />
      ) : (
        initials || 'U'
      )}
    </div>
  );
}
