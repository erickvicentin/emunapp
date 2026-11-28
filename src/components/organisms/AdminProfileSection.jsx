import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import CustomerAccountSecurityCards from '../molecules/CustomerAccountSecurityCards';
import ChangePasswordModal from '../molecules/ChangePasswordModal';
import EmailChangeModal from '../molecules/EmailChangeModal';
import {
  formatDniInput,
  validateAdminProfileFields,
} from '../../utils/registrationValidator';
import {
  calculateAge,
  getMaxBirthdateForMinAge,
  MIN_BIRTHDATE,
} from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';

function buildInitialForm(userProfile, user) {
  const names = (user?.displayName || '').trim().split(' ');
  return {
    nombre: userProfile?.nombre || names[0] || '',
    apellido: userProfile?.apellido || names.slice(1).join(' ') || '',
    dni: formatDniInput(userProfile?.dni || ''),
    fechaNacimiento: userProfile?.fechaNacimiento || '',
  };
}

function getVisibleEmail(userProfile, user) {
  const raw = String(userProfile?.email || user?.email || '').trim();
  if (!raw || raw.endsWith('@dni.emuna.local')) return '';
  return raw;
}

/**
 * AdminProfileSection Organism
 * Administrator / staff "Mi perfil" page: personal fields (Nombre, Apellido,
 * optional DNI and Fecha de Nacimiento), email change with 6-digit verification code,
 * Google account link/unlink, and password change modal.
 */
export default function AdminProfileSection({ showSnackbar }) {
  const {
    user,
    userProfile,
    updateOwnProfile,
    linkGoogleAccount,
    unlinkGoogleAccount,
    requestEmailChange,
    confirmEmailChange,
    changeOwnPassword,
  } = useAuth();

  const [maxBirthdate] = useState(() => getMaxBirthdateForMinAge(14));
  const [formDraft, setFormDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isGoogleMutating, setIsGoogleMutating] = useState(false);
  const [isEmailMutating, setIsEmailMutating] = useState(false);
  const [isPasswordMutating, setIsPasswordMutating] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const formData = formDraft || buildInitialForm(userProfile, user);
  const providerIds = new Set(
    (user?.providerData || []).map((provider) => provider.providerId)
  );
  const hasGoogleLinked = providerIds.has('google.com');
  const hasPasswordProvider = providerIds.has('password');
  const visibleEmail = getVisibleEmail(userProfile, user);
  const currentAge = calculateAge(formData.fechaNacimiento);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'dni') {
      nextValue = formatDniInput(value);
    } else if (name === 'fechaNacimiento' && value) {
      const parts = value.split('-');
      if (parts[0] && parts[0].length > 4) {
        nextValue = [parts[0].slice(0, 4), ...parts.slice(1)].join('-');
      }
    }
    setFormDraft((prev) => ({ ...(prev || formData), [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const validationErrors = validateAdminProfileFields(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showSnackbar?.('error', 'Revisá los campos obligatorios antes de guardar.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateOwnProfile({
        ...formData,
        telefono: userProfile?.telefono || '',
        genero: userProfile?.genero || 'no_especificar',
      });
      setFormDraft(null);
      showSnackbar?.('success', 'Tus datos personales fueron actualizados.');
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleGoogle = async () => {
    setIsGoogleMutating(true);
    try {
      if (hasGoogleLinked) {
        await unlinkGoogleAccount();
        showSnackbar?.('success', 'Cuenta de Google desvinculada.');
      } else {
        await linkGoogleAccount();
        showSnackbar?.('success', 'Cuenta de Google vinculada correctamente.');
      }
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo actualizar la vinculación con Google.');
    } finally {
      setIsGoogleMutating(false);
    }
  };

  const handleRequestEmailCode = async (newEmail) => {
    setIsEmailMutating(true);
    try {
      await requestEmailChange(newEmail);
      showSnackbar?.('success', `Enviamos un código de confirmación a ${newEmail}.`);
    } finally {
      setIsEmailMutating(false);
    }
  };

  const handleConfirmEmailCode = async (newEmail, code) => {
    setIsEmailMutating(true);
    try {
      await confirmEmailChange(newEmail, code);
      showSnackbar?.('success', 'Tu correo electrónico fue confirmado y actualizado.');
    } finally {
      setIsEmailMutating(false);
    }
  };

  const handleSubmitPassword = async ({ currentPassword, newPassword }) => {
    setIsPasswordMutating(true);
    try {
      await changeOwnPassword({ currentPassword, newPassword });
      showSnackbar?.(
        'success',
        hasPasswordProvider
          ? 'Tu contraseña se actualizó correctamente.'
          : 'Tu contraseña se creó correctamente.'
      );
    } finally {
      setIsPasswordMutating(false);
    }
  };

  return (
    <div data-testid="admin-profile-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Módulo de Administración • Emuná Pilates
        </span>
        <h1
          data-testid="admin-profile-title"
          className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
        >
          Mi perfil
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Visualizá y actualizá tus datos personales, correo electrónico, vinculación con Google y contraseña.
        </p>
      </section>

      <form
        onSubmit={handleSaveProfile}
        noValidate
        data-testid="admin-profile-personal-form"
        className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-4"
      >
        <div className="pb-3 border-b border-surface-container-high">
          <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
            <Icon name="person" className="text-secondary text-[20px]" />
            <span>Datos personales</span>
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Mantené actualizada tu información personal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <Input
            id="admin-profile-nombre"
            data-testid="admin-profile-nombre-input"
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={handleFieldChange}
            placeholder="Ej. María"
            icon="person"
            required
            error={errors.nombre}
            autoComplete="given-name"
          />
          <Input
            id="admin-profile-apellido"
            data-testid="admin-profile-apellido-input"
            name="apellido"
            label="Apellido"
            value={formData.apellido}
            onChange={handleFieldChange}
            placeholder="Ej. López"
            icon="person"
            required
            error={errors.apellido}
            autoComplete="family-name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <Input
            id="admin-profile-dni"
            data-testid="admin-profile-dni-input"
            name="dni"
            label="DNI (Opcional)"
            value={formData.dni}
            onChange={handleFieldChange}
            placeholder="Ej. 35.123.456"
            icon="badge"
            inputMode="numeric"
            error={errors.dni}
            helperText="Opcional. Podés cargarlo si querés ingresar también con DNI."
          />

          <Input
            id="admin-profile-fecha-nacimiento"
            data-testid="admin-profile-fecha-nacimiento-input"
            name="fechaNacimiento"
            type="date"
            min={MIN_BIRTHDATE}
            max={maxBirthdate}
            label="Fecha de Nacimiento (Opcional)"
            value={formData.fechaNacimiento}
            onChange={handleFieldChange}
            error={errors.fechaNacimiento}
            helperText={currentAge !== null ? `Edad: ${currentAge} años` : 'Opcional.'}
          />
        </div>

        <div className="flex justify-center sm:justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSavingProfile}
            data-testid="admin-profile-save-btn"
          >
            {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      <CustomerAccountSecurityCards
        visibleEmail={visibleEmail}
        hasGoogleLinked={hasGoogleLinked}
        hasPasswordProvider={hasPasswordProvider}
        isGoogleMutating={isGoogleMutating}
        emailDescription="Usamos tu correo para acceder al panel y recibir códigos de seguridad."
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onToggleGoogle={handleToggleGoogle}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        hasPasswordProvider={hasPasswordProvider}
        isSubmitting={isPasswordMutating}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleSubmitPassword}
      />

      <EmailChangeModal
        open={isEmailModalOpen}
        currentEmail={visibleEmail}
        isSubmitting={isEmailMutating}
        onClose={() => setIsEmailModalOpen(false)}
        onRequestCode={handleRequestEmailCode}
        onConfirmCode={handleConfirmEmailCode}
      />
    </div>
  );
}
