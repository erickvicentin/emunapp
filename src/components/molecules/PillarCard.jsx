import React from 'react';
import Icon from '../atoms/Icon';

/**
 * PillarCard Molecule
 * Displays a core pillar in the methodology section
 * @param {Object} props
 * @param {string} props.icon - Material Symbols icon name
 * @param {string} props.numberLabel - e.g. "01 • Biomecánica"
 * @param {string} props.title - e.g. "Alineación Postural"
 * @param {string} props.description - Explanatory text
 * @param {string} props.featureTag - e.g. "Alineación guiada"
 */
export default function PillarCard({
  icon,
  numberLabel,
  title,
  description,
  featureTag,
}) {
  return (
    <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between h-full border border-surface-container-high/60 hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary mb-space-md">
          <Icon name={icon} className="text-[26px]" />
        </div>
        <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
          {numberLabel}
        </span>
        <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-2">
          {title}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-space-lg pt-space-xs flex items-center text-secondary font-label-sm text-label-sm font-medium">
        <span>{featureTag}</span>
        <Icon name="check_circle" className="text-[16px] ml-1.5" />
      </div>
    </div>
  );
}
