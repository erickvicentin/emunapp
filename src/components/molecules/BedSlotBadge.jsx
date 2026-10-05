import React from 'react';
import Badge from '../atoms/Badge';

/**
 * BedSlotBadge Molecule
 * Shows availability for the 4 reformer beds as mandated by CONTEXT.md
 * @param {Object} props
 * @param {number} props.available - Number of free beds (0 to 4)
 * @param {number} [props.total=4] - Total capacity
 * @param {boolean} [props.showDots=false] - Show 4 micro-dots representing each reformer
 */
export default function BedSlotBadge({ available, total = 4, showDots = false }) {
  const isFull = available <= 0;

  if (isFull) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant/80 font-medium">
        <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
        <span>Completo</span>
      </span>
    );
  }

  const label = available === 1 ? '1 cupo libre' : `${available} cupos libres`;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-secondary"></span>
      <span className="text-secondary font-medium text-xs">{label}</span>
      {showDots && (
        <span className="flex items-center gap-0.5 ml-1" title={`${available} de ${total} camas disponibles`}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < available ? 'bg-secondary' : 'bg-outline-variant/60'
              }`}
            />
          ))}
        </span>
      )}
    </div>
  );
}
