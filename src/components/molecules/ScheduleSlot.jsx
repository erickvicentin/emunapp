import React from 'react';
import BedSlotBadge from './BedSlotBadge';

/**
 * ScheduleSlot Molecule
 * Represents a single class cell in the schedule grid
 * @param {Object} props
 * @param {string} props.discipline - e.g. "Reformer Suave", "Postural Dinámico"
 * @param {number} props.availableBeds - Beds available (0 to 4)
 * @param {string} [props.time] - e.g. "07:00 hs"
 * @param {string} [props.day] - e.g. "Lunes"
 * @param {Function} [props.onSelect]
 */
export default function ScheduleSlot({
  discipline,
  availableBeds,
  time,
  day,
  onSelect,
}) {
  const isFull = availableBeds <= 0;

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect && onSelect({ discipline, availableBeds, time, day })}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect({ discipline, availableBeds, time, day });
        }
      }}
      className={`p-2.5 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-1.5 ${
        isFull
          ? 'bg-surface-container/60 border-outline-variant/30 opacity-75'
          : 'bg-surface-container border-transparent hover:border-secondary/30 hover:bg-surface-container-high cursor-pointer hover:shadow-xs'
      }`}
      aria-label={`${discipline} ${day ? day + ' ' : ''}${time ? time + ' ' : ''}- ${
        isFull ? 'Completo' : `${availableBeds} cupos libres`
      }`}
    >
      <span className="font-semibold text-primary text-xs tracking-tight line-clamp-1">
        {discipline}
      </span>
      <BedSlotBadge available={availableBeds} total={4} />
    </div>
  );
}
