import React from 'react';
import Icon from '../atoms/Icon';

/**
 * DetailField Molecule
 * Displays a labeled icon-value card inside user detail views.
 */
export default function DetailField({ icon, label, value, testId }) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high/50 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        <p
          data-testid={testId}
          className="font-body-md text-body-md font-semibold text-primary mt-0.5 break-words"
        >
          {value || 'No informado'}
        </p>
      </div>
    </div>
  );
}
