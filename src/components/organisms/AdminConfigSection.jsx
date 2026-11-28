import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import CobrosConfigCard from '../molecules/CobrosConfigCard';

/**
 * AdminConfigSection Organism
 * Centralized admin-only settings: transfer account & cobros config,
 * cancellation window, default instructor name, and bulk email notice CTA.
 */
export default function AdminConfigSection({
  paymentsManager,
  onSendBulkEmailNotice,
}) {
  const {
    cobrosConfig,
    studioConfig,
    isMutating,
    saveConfig,
    saveStudioSettings,
  } = paymentsManager;

  const [studioDraft, setStudioDraft] = useState(null);
  const currentStudio = studioDraft || studioConfig;

  const updateStudioField = (field, value) => {
    setStudioDraft((prev) => ({ ...(prev || studioConfig), [field]: value }));
  };

  const handleSaveStudio = async (e) => {
    e.preventDefault();
    const ok = await saveStudioSettings?.(currentStudio);
    if (ok) setStudioDraft(null);
  };

  return (
    <div data-testid="admin-config-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Módulo de Administración
        </span>
        <h1
          data-testid="admin-config-title"
          className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
        >
          Configuración
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Administrá la cuenta destino para transferencias, la ventana de cancelación, el nombre de la profesora y los avisos generales.
        </p>
      </section>

      <CobrosConfigCard config={cobrosConfig} isMutating={isMutating} onSave={saveConfig} />

      <form
        onSubmit={handleSaveStudio}
        data-testid="studio-config-card"
        className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-4"
      >
        <div className="pb-3 border-b border-surface-container-high">
          <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
            <Icon name="tune" className="text-secondary text-[20px]" />
            <span>Parámetros de Clases y Cancelación</span>
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Definí con cuántas horas de anticipación pueden cancelar los alumnos y el nombre de la profesora visible en las clases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="block text-label-sm font-semibold text-on-surface">
              Ventana de cancelación (horas antes)
            </span>
            <input
              type="number"
              min="1"
              max="48"
              required
              value={currentStudio.horasVentanaCancelacion ?? 4}
              onChange={(e) => updateStudioField('horasVentanaCancelacion', e.target.value)}
              data-testid="studio-cancel-window-input"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-label-sm font-semibold text-on-surface">
              Nombre de la profesora
            </span>
            <input
              type="text"
              required
              maxLength={80}
              value={currentStudio.nombreProfesora || ''}
              onChange={(e) => updateStudioField('nombreProfesora', e.target.value)}
              placeholder="Ej: Sofía Martínez"
              data-testid="studio-professor-name-input"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isMutating}
            data-testid="studio-config-save-btn"
          >
            <span>{isMutating ? 'Guardando...' : 'Guardar parámetros'}</span>
          </Button>
        </div>
      </form>

      <section
        data-testid="admin-bulk-email-card"
        className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
            <Icon name="campaign" className="text-secondary text-[20px]" />
            <span>Aviso por email a alumnos</span>
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Enviá un comunicado general por correo electrónico a todos los alumnos registrados.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          data-testid="admin-config-bulk-email-btn"
          onClick={onSendBulkEmailNotice}
          className="bg-surface-container-lowest shrink-0"
        >
          <Icon name="mail" className="text-[18px] mr-2" />
          <span>Enviar aviso por mail</span>
        </Button>
      </section>
    </div>
  );
}
