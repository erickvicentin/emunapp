import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import EmailNotificationsCard from '../molecules/EmailNotificationsCard';
import { useAuth } from '../../hooks/useAuth';
import { normalizeCustomerEmailNotifConfig } from '../../services/accountProfileService';

const CUSTOMER_NOTIFICATION_ITEMS = [
  {
    key: 'confirmacionReserva',
    label: 'Confirmación de reserva',
    description: 'Recibí un correo cuando se confirme tu turno o reserva de clase.',
    testId: 'customer-notif-switch-confirmacion-reserva',
  },
  {
    key: 'cancelacionReserva',
    label: 'Cancelación de turno',
    description: 'Enterate por email si un turno fue cancelado por vos o por el estudio.',
    testId: 'customer-notif-switch-cancelacion-reserva',
  },
  {
    key: 'estadoPago',
    label: 'Estado de pagos y acreditaciones',
    description: 'Recibí confirmación cuando aprobemos o rechacemos tu comprobante de pago.',
    testId: 'customer-notif-switch-estado-pago',
  },
  {
    key: 'recordatorioClase',
    label: 'Recordatorio de clase (24 hs antes)',
    description: 'Un aviso previo el día anterior para que no te olvides tu próximo turno.',
    testId: 'customer-notif-switch-recordatorio-clase',
  },
];

function hasRealEmail(userProfile, user) {
  const raw = String(userProfile?.email || user?.email || '').trim();
  return Boolean(raw) && !raw.endsWith('@dni.emuna.local');
}

/**
 * CustomerNotificationsSection Organism
 * Allows students to toggle their automated email notification preferences.
 */
export default function CustomerNotificationsSection({ showSnackbar }) {
  const { user, userProfile, updateEmailNotifications } = useAuth();
  const [isMutating, setIsMutating] = useState(false);

  const currentConfig = normalizeCustomerEmailNotifConfig(userProfile?.notificacionesEmail);
  const emailConfigured = hasRealEmail(userProfile, user);

  const handleSave = async (nextConfig) => {
    setIsMutating(true);
    try {
      await updateEmailNotifications(nextConfig);
      showSnackbar?.('success', 'Tus preferencias de notificaciones fueron actualizadas.');
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudieron guardar tus preferencias.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div data-testid="customer-notifications-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Espacio Alumna • Emuná Pilates
        </span>
        <h1
          data-testid="customer-notifications-title"
          className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
        >
          Notificaciones
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Configurá qué avisos automáticos querés recibir en tu correo electrónico.
        </p>
      </section>

      {!emailConfigured && (
        <div
          data-testid="customer-notifications-no-email-notice"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 flex items-start gap-3"
        >
          <Icon name="info" className="text-[20px] shrink-0 mt-0.5" />
          <p className="text-body-sm">
            Todavía no tenés un correo electrónico vinculado a tu cuenta. Podés configurarlo desde la sección <strong>Mi perfil</strong> para recibir estos avisos.
          </p>
        </div>
      )}

      <EmailNotificationsCard
        title="Notificaciones por Email"
        description="Activá o desactivá cada tipo de correo automático según tu preferencia."
        items={CUSTOMER_NOTIFICATION_ITEMS}
        config={currentConfig}
        isMutating={isMutating}
        onSave={handleSave}
        cardTestId="customer-email-notif-card"
        saveBtnTestId="customer-email-notif-save-btn"
      />
    </div>
  );
}
