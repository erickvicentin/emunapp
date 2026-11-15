import React from 'react';
import Icon from '../atoms/Icon';

/**
 * LoginFormHeader Molecule
 * Displays the Emuná studio eyebrow, login heading, and decorative icon.
 */
export default function LoginFormHeader() {
  return (
    <div className="flex items-center justify-between pb-space-sm">
      <div>
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Emuná Estudio Pilates
        </span>
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
          Ingresá para autogestionarte
        </h2>
      </div>
      <div
        className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0 ml-3"
        aria-hidden="true"
      >
        <Icon name="self_improvement" className="text-[20px]" />
      </div>
    </div>
  );
}
