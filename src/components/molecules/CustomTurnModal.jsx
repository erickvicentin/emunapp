import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import SelectChevron from '../atoms/SelectChevron';
import Time24Input from '../atoms/Time24Input';
import { DEFAULT_CLASS_DURATION_MINUTES } from '../../utils/scheduleUtils';

/**
 * CustomTurnModal Molecule
 * Modal to add a one-off dated class shift on any open day.
 */
export default function CustomTurnModal({
  dialogRef,
  weekDays = [],
  closedDaysMap = {},
  isMutating = false,
  onClose,
  onSubmit,
}) {
  const openDays = weekDays.filter((d) => !closedDaysMap[d.dateKey]);
  const [dateKey, setDateKey] = useState(() => openDays[0]?.dateKey || '');
  const [startTime, setStartTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(
    String(DEFAULT_CLASS_DURATION_MINUTES)
  );

  const selectedDateKey = openDays.some((d) => d.dateKey === dateKey)
    ? dateKey
    : openDays[0]?.dateKey || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateKey || !startTime) return;
    const ok = await onSubmit({
      dateKey: selectedDateKey,
      startTime,
      durationMinutes: Number(durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
    });
    if (ok) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="custom-turn-dialog"
      aria-labelledby="custom-turn-title"
      onClose={onClose}
      className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-md w-[calc(100%-2rem)] text-on-surface m-auto"
    >
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Turno Puntual
          </span>
          <h2
            id="custom-turn-title"
            data-testid="custom-turn-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5"
          >
            Agregar turno en la semana
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
          aria-label="Cerrar modal"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="custom-turn-day"
            className="block font-label-md text-label-md text-on-surface mb-1"
          >
            Día hábil de la semana
          </label>
          <div className="relative w-full">
            <select
              id="custom-turn-day"
              data-testid="custom-turn-day-select"
              value={selectedDateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="w-full appearance-none rounded-xl bg-surface-container-low border border-outline-variant pl-3 pr-10 py-2.5 text-body-md cursor-pointer"
            >
              {openDays.map((d) => (
                <option key={d.dateKey} value={d.dateKey}>
                  {d.label} {d.displayDate}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="custom-turn-time"
              className="block font-label-md text-label-md text-on-surface mb-1"
            >
              Hora inicio
            </label>
            <Time24Input
              id="custom-turn-time"
              testId="custom-turn-time-input"
              value={startTime}
              onChange={setStartTime}
              ariaLabel="Hora inicio"
              className="w-full justify-between rounded-xl bg-surface-container-low px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="custom-turn-duration"
              className="block font-label-md text-label-md text-on-surface mb-1"
            >
              Duración (min)
            </label>
            <input
              id="custom-turn-duration"
              data-testid="custom-turn-duration-input"
              type="number"
              min="15"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
              className="w-full rounded-xl bg-surface-container-low border border-outline-variant px-3 py-2.5 text-body-md"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-surface-container-high flex justify-end gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isMutating || openDays.length === 0}
            data-testid="custom-turn-submit-btn"
          >
            <span>{isMutating ? 'Creando...' : 'Crear turno'}</span>
          </Button>
        </div>
      </form>
    </dialog>
  );
}
