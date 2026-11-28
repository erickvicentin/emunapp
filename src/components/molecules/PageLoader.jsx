import React from 'react';
import Icon from '../atoms/Icon';

/**
 * PageLoader Molecule
 * Full-screen branded loading indicator for route transitions and auth checks.
 */
export default function PageLoader({ message = 'Cargando tu espacio en Emuná...' }) {
  return (
    <div
      data-testid="page-loader"
      className="min-h-screen flex flex-col items-center justify-center bg-surface p-4"
    >
      <div className="w-12 h-12 rounded-full border-3 border-secondary/30 border-t-secondary animate-spin" />
      <p className="mt-4 font-body-md text-on-surface-variant flex items-center gap-2">
        <Icon name="spa" className="text-secondary text-[18px]" />
        <span>{message}</span>
      </p>
    </div>
  );
}
