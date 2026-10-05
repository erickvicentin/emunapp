import React, { useState } from 'react';
import ScheduleSlot from '../molecules/ScheduleSlot';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { SCHEDULE_GRID_DATA, STUDIO_INFO } from '../../data/landingData';

/**
 * ScheduleSection Organism
 * Weekly timetable visualizer highlighting 4-bed reformer slot availability
 */
export default function ScheduleSection() {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (slotInfo) => {
    setSelectedSlot(slotInfo);
  };

  const handleReserveSelected = () => {
    if (!selectedSlot) return;
    const msg = `Hola! Quisiera consultar disponibilidad para sumarme al turno de ${selectedSlot.discipline} (${selectedSlot.day} a las ${selectedSlot.time}) en Emuná Pilates.`;
    const url = `https://wa.me/543624890123?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="horarios" className="w-full bg-surface-container-low py-12 md:py-space-xl border-y border-surface-container-high/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop">
        {/* Header and Legend */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-space-lg gap-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Grilla de Turnos
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-primary tracking-tight mt-1">
              Turnos regulares de Lunes a Sábados
            </h2>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              Hasta 4 Camas disponibles
            </span>
            <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
              Turno Completo
            </span>
          </div>
        </div>

        {/* Weekly Matrix Visualizer Card */}
        <div className="p-4 sm:p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/80 overflow-x-auto no-scrollbar">
          <div className="min-w-[720px] grid grid-cols-6 gap-3">
            {/* Table Header */}
            <div className="font-label-sm text-label-sm uppercase text-secondary font-bold pb-2 border-b border-surface-container-high">
              Franja
            </div>
            {SCHEDULE_GRID_DATA.days.map((day) => (
              <div
                key={day}
                className="font-label-sm text-label-sm uppercase text-primary font-bold pb-2 border-b border-surface-container-high"
              >
                {day}
              </div>
            ))}

            {/* Matrix Rows */}
            {SCHEDULE_GRID_DATA.rows.map((row) => (
              <React.Fragment key={row.time}>
                {/* Time slot header */}
                <div className="font-label-md text-label-md text-on-surface-variant font-semibold py-3 flex items-center">
                  {row.time}
                </div>

                {/* Slots for each day */}
                {row.slots.map((slot, dayIndex) => {
                  const dayName = SCHEDULE_GRID_DATA.days[dayIndex];
                  return (
                    <ScheduleSlot
                      key={`${row.time}-${dayIndex}`}
                      discipline={slot.discipline}
                      availableBeds={slot.availableBeds}
                      time={row.time}
                      day={dayName}
                      onSelect={handleSlotClick}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Footnote */}
          <div className="mt-6 pt-4 border-t border-surface-container-high flex flex-wrap items-center justify-between text-on-surface-variant text-xs gap-3">
            <span className="flex items-center gap-1.5">
              <Icon name="info" className="text-secondary text-[16px]" />
              * Sábados turnos especiales de 08:30 a 12:30 hs previa reserva.
            </span>
            <a
              className="text-secondary font-semibold hover:underline flex items-center gap-1"
              href={STUDIO_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Consultar disponibilidad en vivo por WhatsApp</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </a>
          </div>
        </div>

        {/* Selected Slot Quick Drawer / Banner */}
        {selectedSlot && (
          <div className="mt-6 p-4 rounded-2xl bg-surface-container-high border border-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
                <Icon name="event_seat" className="text-[22px]" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Turno Seleccionado: {selectedSlot.day} {selectedSlot.time}
                </span>
                <p className="font-body-md text-primary font-medium">
                  {selectedSlot.discipline} •{' '}
                  {selectedSlot.availableBeds > 0
                    ? `${selectedSlot.availableBeds} cupo(s) disponible(s) de 4 camas`
                    : 'Sin cupos disponibles actualmente'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleReserveSelected}
                ariaLabel={`Reservar turno de ${selectedSlot.discipline}`}
              >
                <span>Solicitar este turno</span>
                <Icon name="open_in_new" className="text-[16px] ml-1.5" />
              </Button>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container"
                aria-label="Cerrar selección"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
