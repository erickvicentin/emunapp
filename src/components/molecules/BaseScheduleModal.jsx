import { useMemo, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import SelectChevron from '../atoms/SelectChevron';
import Time24Input from '../atoms/Time24Input';
import {
  DEFAULT_BLOCK_MINUTES,
  DEFAULT_CLASS_DURATION_MINUTES,
  WEEK_DAYS,
  formatBlockEndLabel,
  hasTimeOverlap,
  timeToMinutes,
} from '../../utils/scheduleUtils';

const EMPTY_SLOTS = [];

function buildDraftFromBase(baseSlots) {
  const map = {};
  WEEK_DAYS.forEach((day) => {
    map[day.dayOfWeek] = [];
  });
  baseSlots.forEach((slot) => {
    if (slot.active === false) return;
    const dayKey = Number(slot.dayOfWeek);
    if (!map[dayKey]) map[dayKey] = [];
    map[dayKey].push({
      id: slot.id,
      clientKey: slot.id || `${dayKey}-${slot.startTime}`,
      startTime: slot.startTime,
      endTime: slot.endTime || formatBlockEndLabel(slot.startTime),
      durationMinutes: Number(slot.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
    });
  });
  Object.keys(map).forEach((key) => {
    map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
  return map;
}

function getNextSuggestedStart(daySlots) {
  if (!daySlots.length) return '18:00';
  const last = daySlots[daySlots.length - 1];
  const nextMins = timeToMinutes(last.startTime) + DEFAULT_BLOCK_MINUTES;
  if (nextMins >= 22 * 60) return '08:00';
  const hh = String(Math.floor(nextMins / 60)).padStart(2, '0');
  const mm = String(nextMins % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function validateAllDays(draftByDay) {
  for (const day of WEEK_DAYS) {
    const slots = draftByDay[day.dayOfWeek] || [];
    for (let i = 0; i < slots.length; i += 1) {
      const current = slots[i];
      if (!current.startTime || !current.endTime) {
        return `${day.label}: completá horario de inicio y fin.`;
      }
      if (timeToMinutes(current.endTime) <= timeToMinutes(current.startTime)) {
        return `${day.label} (${current.startTime}): el horario de fin debe ser posterior al inicio.`;
      }
      for (let j = i + 1; j < slots.length; j += 1) {
        if (hasTimeOverlap(current.startTime, slots[j].startTime, DEFAULT_BLOCK_MINUTES)) {
          return `${day.label}: ${current.startTime} y ${slots[j].startTime} se superponen (bloqueo de 60 min).`;
        }
      }
    }
  }
  return '';
}

/**
 * Modal to configure recurring weekly schedule per day with start/end times and explicit save.
 */
export default function BaseScheduleModal({
  dialogRef,
  baseSlots = EMPTY_SLOTS,
  isMutating = false,
  onClose,
  onSaveSchedule,
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [draftState, setDraftState] = useState(null);
  const [localError, setLocalError] = useState('');

  const baseDraft = useMemo(() => buildDraftFromBase(baseSlots), [baseSlots]);
  const draftByDay = draftState || baseDraft;

  const dayMeta = WEEK_DAYS.find((d) => d.dayOfWeek === selectedDay) || WEEK_DAYS[0];
  const daySlots = draftByDay[selectedDay] || [];

  const updateDaySlots = (dayOfWeek, updater) => {
    setLocalError('');
    setDraftState((prev) => {
      const source = prev || baseDraft;
      const currentList = source[dayOfWeek] || [];
      return { ...source, [dayOfWeek]: updater(currentList) };
    });
  };

  const handleAddSlot = () => {
    const nextStart = getNextSuggestedStart(daySlots);
    updateDaySlots(selectedDay, (list) => [
      ...list,
      {
        id: null,
        clientKey: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        startTime: nextStart,
        endTime: formatBlockEndLabel(nextStart),
        durationMinutes: DEFAULT_CLASS_DURATION_MINUTES,
      },
    ]);
  };

  const handleChangeSlotTime = (index, field, value) => {
    updateDaySlots(selectedDay, (list) =>
      list.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'startTime') {
          return {
            ...item,
            startTime: value,
            endTime: value ? formatBlockEndLabel(value) : item.endTime,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleRemoveSlot = (index) => {
    updateDaySlots(selectedDay, (list) => list.filter((_, idx) => idx !== index));
  };

  const handleCopyToWorkdays = () => {
    setLocalError('');
    setDraftState((prev) => {
      const source = prev || baseDraft;
      const template = (source[selectedDay] || []).map((item) => ({ ...item, id: null }));
      const next = { ...source };
      [1, 2, 3, 4, 5].forEach((dayKey) => {
        if (dayKey !== selectedDay) {
          next[dayKey] = template.map((item, idx) => ({
            ...item,
            clientKey: `copy-${dayKey}-${Date.now()}-${idx}`,
          }));
        }
      });
      return next;
    });
  };

  const handleCancel = () => {
    setDraftState(null);
    setLocalError('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateAllDays(draftByDay);
    if (error) {
      setLocalError(error);
      return;
    }
    setLocalError('');
    const ok = await onSaveSchedule?.(draftByDay);
    if (ok) {
      setDraftState(null);
      onClose?.();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="base-schedule-dialog"
      aria-labelledby="base-schedule-title"
      onClose={handleCancel}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-black/40"
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-surface-container-high pb-4">
        <div>
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-secondary">
            Configuración semanal
          </span>
          <h3 id="base-schedule-title" data-testid="base-schedule-title" className="font-headline-sm text-headline-sm font-semibold text-primary">
            Grilla Semanal Recurrente
          </h3>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            Configurá los horarios de inicio y fin por día. Cada turno bloquea 60 minutos.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          data-testid="base-schedule-close-btn"
          aria-label="Cerrar modal"
          className="cursor-pointer rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex-1 space-y-1.5">
            <span className="block text-label-md font-semibold text-primary">Día de la semana</span>
            <div className="relative w-full">
              <select
                value={selectedDay}
                onChange={(e) => {
                  setLocalError('');
                  setSelectedDay(Number(e.target.value));
                }}
                data-testid="base-day-select"
                className="w-full h-12 appearance-none rounded-xl border-2 border-outline-variant bg-surface-container-lowest py-2.5 pl-3.5 pr-10 text-body-md font-medium text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                {WEEK_DAYS.map((day) => {
                  const count = (draftByDay[day.dayOfWeek] || []).length;
                  return (
                    <option key={day.dayOfWeek} value={day.dayOfWeek}>
                      {day.label} ({count} {count === 1 ? 'turno' : 'turnos'})
                    </option>
                  );
                })}
              </select>
              <SelectChevron />
            </div>
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className='h-12'
            onClick={handleCopyToWorkdays}
            data-testid="base-copy-workdays-btn"
          >
            <span>Copiar a Lun–Vie</span>
          </Button>
        </div>

        <div className="rounded-2xl border border-surface-container-high bg-surface-container-low p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-label-lg font-semibold text-primary">
              Turnos habilitados — {dayMeta.label}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSlot}
              data-testid="base-add-slot-btn"
            >
              <Icon name="add" className="mr-1 text-[16px]" />
              <span>Agregar horario</span>
            </Button>
          </div>

          {daySlots.length === 0 ? (
            <p
              data-testid="base-day-empty"
              className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-6 text-center text-body-sm text-on-surface-variant"
            >
              No hay turnos habilitados para {dayMeta.label}. Tocá &quot;Agregar horario&quot; para sumar uno.
            </p>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1" data-testid="base-day-slots-list">
              {daySlots.map((slot, index) => (
                <div
                  key={slot.clientKey}
                  data-testid={`base-slot-row-${index}`}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-container-high bg-surface-container-lowest p-3"
                >
                  <div className="flex items-center gap-1.5 text-body-sm font-medium text-on-surface">
                    <span>Inicio</span>
                    <Time24Input
                      value={slot.startTime}
                      onChange={(val) => handleChangeSlotTime(index, 'startTime', val)}
                      ariaLabel={`Horario de inicio turno ${index + 1}`}
                      testId={`base-slot-start-${index}`}
                    />
                  </div>
                  <span className="text-on-surface-variant">—</span>
                  <div className="flex items-center gap-1.5 text-body-sm font-medium text-on-surface">
                    <span>Fin</span>
                    <Time24Input
                      value={slot.endTime}
                      onChange={(val) => handleChangeSlotTime(index, 'endTime', val)}
                      ariaLabel={`Horario de fin turno ${index + 1}`}
                      testId={`base-slot-end-${index}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    data-testid={`base-slot-remove-${index}`}
                    aria-label={`Borrar horario ${slot.startTime}`}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-lg border border-error/30 px-2.5 py-1.5 text-label-sm font-semibold text-error hover:bg-error-container/40"
                  >
                    <Icon name="delete" className="text-[16px]" />
                    <span>Borrar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="rounded-xl border border-secondary/25 bg-secondary/10 px-3.5 py-2.5 text-body-sm text-on-surface">
          Los cambios aplican desde hoy en adelante. Si eliminás o modificás un horario que tenía turnos futuros con alumnos inscriptos,{' '}
          <strong>se cancelarán automáticamente devolviendo los créditos</strong> (sin afectar su presencialidad).
        </p>

        {localError && (
          <p data-testid="base-schedule-error" className="text-body-sm font-semibold text-error">
            {localError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-surface-container-high pt-4">
          <Button type="button" variant="outline" size="md" onClick={handleCancel}>
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isMutating}
            data-testid="base-schedule-apply-btn"
          >
            <span>{isMutating ? 'Guardando...' : 'Guardar cambios'}</span>
          </Button>
        </div>
      </form>
    </dialog>
  );
}
