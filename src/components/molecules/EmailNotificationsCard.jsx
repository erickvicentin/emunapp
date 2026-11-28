import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Switch from '../atoms/Switch';

const EMPTY_ITEMS = [];
const EMPTY_CONFIG = {};

/**
 * EmailNotificationsCard Molecule
 * Reusable card for toggling automated email notification preferences.
 */
export default function EmailNotificationsCard({
  title,
  description,
  items = EMPTY_ITEMS,
  config = EMPTY_CONFIG,
  isMutating = false,
  onSave,
  cardTestId = 'email-notif-card',
  saveBtnTestId = 'email-notif-save-btn',
}) {
  const [draft, setDraft] = useState(null);
  const current = draft || config;

  const handleToggle = (key, nextValue) => {
    setDraft((prev) => ({ ...(prev || config), [key]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSave?.(current);
    if (ok) setDraft(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid={cardTestId}
      className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-4"
    >
      <div className="pb-3 border-b border-surface-container-high">
        <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
          <Icon name="notifications_active" className="text-secondary text-[20px]" />
          <span>{title}</span>
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {description}
        </p>
      </div>

      <div className="divide-y divide-surface-container-high/70">
        {items.map((item) => (
          <div
            key={item.key}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <p className="text-body-md font-semibold text-on-surface">{item.label}</p>
              <p className="text-body-sm text-on-surface-variant">{item.description}</p>
            </div>
            <Switch
              checked={Boolean(current[item.key])}
              onChange={(val) => handleToggle(item.key, val)}
              disabled={isMutating}
              ariaLabel={item.label}
              testId={item.testId}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isMutating}
          data-testid={saveBtnTestId}
        >
          <span>{isMutating ? 'Guardando...' : 'Guardar notificaciones'}</span>
        </Button>
      </div>
    </form>
  );
}
