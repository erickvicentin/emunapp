import React, { useState } from 'react';
import Icon from '../atoms/Icon';

/**
 * Three-dot dropdown menu for day-level actions (close/reopen day or clear all turns).
 */
export default function DayActionsMenu({
  day,
  closedInfo,
  hasVisibleTurns,
  onOpenClosedDayModal,
  onClearDayTurns,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmClear(false);
  };

  const handleToggleClosed = () => {
    closeMenu();
    onOpenClosedDayModal(day);
  };

  const handleClearDay = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    closeMenu();
    await onClearDayTurns?.(day.dateKey);
  };

  return (
    <div className="relative shrink-0">
      {menuOpen && (
        <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 z-10" />
      )}

      <button
        type="button"
        data-testid={`calendar-day-actions-${day.dateKey}`}
        onClick={() => {
          setMenuOpen((prev) => !prev);
          setConfirmClear(false);
        }}
        aria-label={`Acciones del día ${day.label}`}
        aria-expanded={menuOpen}
        className="relative z-20 p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
      >
        <Icon name="more_vert" className="text-[19px]" />
      </button>

      <div
        role="menu"
        aria-hidden={!menuOpen}
        data-testid={`calendar-day-menu-${day.dateKey}`}
        className={`absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-lg py-1 text-left origin-top transition-all duration-200 ease-out ${
          menuOpen
            ? 'opacity-100 translate-y-0 [clip-path:inset(0_0_0_0)]'
            : 'opacity-0 -translate-y-1 [clip-path:inset(0_0_100%_0)] pointer-events-none'
        }`}
      >
        <button
          type="button"
          role="menuitem"
          tabIndex={menuOpen ? 0 : -1}
          data-testid={`calendar-toggle-closed-${day.dateKey}`}
          onClick={handleToggleClosed}
          className="w-full px-3 py-2 text-left text-body-sm font-medium text-primary hover:bg-surface-container flex items-center gap-2 cursor-pointer"
        >
          <Icon
            name={closedInfo ? 'event_available' : 'event_busy'}
            className="text-[16px]"
          />
          <span>{closedInfo ? 'Habilitar día' : 'Cerrar día'}</span>
        </button>

        <button
          type="button"
          role="menuitem"
          tabIndex={menuOpen ? 0 : -1}
          disabled={!hasVisibleTurns}
          data-testid={`calendar-clear-day-${day.dateKey}`}
          onClick={handleClearDay}
          className="w-full px-3 py-2 text-left text-body-sm font-medium text-error hover:bg-error-container/40 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
        >
          <Icon name="delete_sweep" className="text-[16px]" />
          <span>{confirmClear ? 'Confirmar borrado' : 'Borrar todos los turnos'}</span>
        </button>
      </div>
    </div>
  );
}
