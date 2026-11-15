import React from 'react';

/**
 * Skeleton Atom
 * Animated placeholder block for loading states.
 */
export default function Skeleton({ className = '', testId }) {
  return (
    <div
      aria-hidden="true"
      data-testid={testId}
      className={`animate-pulse bg-surface-container-high/70 rounded-md ${className}`}
    />
  );
}
