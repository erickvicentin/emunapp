import React from 'react';
import Icon from '../atoms/Icon';

/**
 * RoleSwitcherTabs Molecule
 * Selector between 'alumna' and 'equipo'
 */
export default function RoleSwitcherTabs({ role, onSelectRole }) {
  return (
    <div
      className="mt-space-md p-1 bg-surface-container rounded-full flex gap-1 max-w-xs"
      role="tablist"
      aria-label="Tipo de usuario"
    >
      <button
        id="tab-alumna"
        type="button"
        role="tab"
        aria-selected={role === 'alumna'}
        onClick={() => onSelectRole('alumna')}
        className={`flex-1 py-2 px-space-md rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
          role === 'alumna'
            ? 'bg-primary-container text-on-primary shadow-xs'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <Icon name="person" className="text-[16px]" />
        <span>Alumna</span>
      </button>

      <button
        id="tab-equipo"
        type="button"
        role="tab"
        aria-selected={role === 'equipo'}
        onClick={() => onSelectRole('equipo')}
        className={`flex-1 py-2 px-space-md rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
          role === 'equipo'
            ? 'bg-primary-container text-on-primary shadow-xs'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <Icon name="badge" className="text-[16px]" />
        <span>Equipo</span>
      </button>
    </div>
  );
}
