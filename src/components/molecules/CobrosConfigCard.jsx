import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * Admin-only card to configure bank transfer destination details and provisional credit expiry.
 */
export default function CobrosConfigCard({ config, isMutating = false, onSave }) {
  const [draft, setDraft] = useState(null);
  const current = draft || config;

  const updateField = (field, value) => {
    setDraft((prev) => ({ ...(prev || config), [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSave?.(current);
    if (ok) setDraft(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="cobros-config-card"
      className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-4"
    >
      <div className="pb-3 border-b border-surface-container-high">
        <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
          <Icon name="account_balance" className="text-secondary text-[20px]" />
          <span>Configuración de Cobros y Cuenta Destino</span>
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Configurá los datos bancarios que verán los alumnos al transferir y el plazo para confirmar cobros.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">Alias</span>
          <input
            type="text"
            value={current.alias ?? current.aliasCbu ?? ''}
            onChange={(e) => updateField('alias', e.target.value)}
            placeholder="Ej: emuna.pilates.mp"
            data-testid="cobros-alias-input"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">CVU / CBU</span>
          <input
            type="text"
            value={current.cvu || ''}
            onChange={(e) => updateField('cvu', e.target.value)}
            placeholder="Ej: 00000031000..."
            data-testid="cobros-cvu-input"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">Titular</span>
          <input
            type="text"
            value={current.titularCuenta || ''}
            onChange={(e) => updateField('titularCuenta', e.target.value)}
            placeholder="Ej: Emuná Estudio Pilates"
            data-testid="cobros-titular-input"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">CUIL / CUIT</span>
          <input
            type="text"
            value={current.cuilCuit || ''}
            onChange={(e) => updateField('cuilCuit', e.target.value)}
            placeholder="Ej: 20-12345678-9"
            data-testid="cobros-cuil-input"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-label-sm font-semibold text-on-surface">
            Vencimiento provisorio (hs)
          </span>
          <input
            type="number"
            min="1"
            max="168"
            value={current.horasVencimientoProvisorio ?? 24}
            onChange={(e) => updateField('horasVencimientoProvisorio', e.target.value)}
            data-testid="cobros-expiry-hours-input"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
            required
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isMutating}
          data-testid="cobros-config-save-btn"
        >
          <span>{isMutating ? 'Guardando...' : 'Guardar configuración'}</span>
        </Button>
      </div>
    </form>
  );
}
