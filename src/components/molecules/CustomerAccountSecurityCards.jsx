import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * CustomerAccountSecurityCards Molecule
 * Displays email verification, Google account link/unlink, and password modal trigger cards.
 */
export default function CustomerAccountSecurityCards({
  visibleEmail,
  hasGoogleLinked,
  hasPasswordProvider,
  isGoogleMutating,
  onOpenEmailModal,
  onToggleGoogle,
  onOpenPasswordModal,
}) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section
          data-testid="customer-profile-email-card"
          className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-4 text-center sm:text-left"
        >
          <div className="space-y-2 flex flex-col items-center sm:items-start">
            <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center justify-center sm:justify-start gap-2">
              <Icon name="mail" className="text-secondary text-[20px]" />
              <span>Correo electrónico</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Usamos tu correo para enviarte confirmaciones de turnos, pagos y códigos de seguridad.
            </p>
            <div className="pt-1 flex justify-center sm:justify-start w-full">
              {visibleEmail ? (
                <div
                  data-testid="customer-profile-current-email"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-body-sm text-on-surface font-medium max-w-full"
                >
                  <Icon name="verified" className="text-secondary text-[16px] shrink-0" />
                  <span className="truncate">{visibleEmail}</span>
                </div>
              ) : (
                <div
                  data-testid="customer-profile-no-email-badge"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-body-sm text-amber-800"
                >
                  <Icon name="info" className="text-[16px] shrink-0" />
                  <span>Cuenta con ingreso por DNI (sin correo vinculado)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenEmailModal}
              data-testid="customer-profile-email-btn"
              className="bg-surface-container-lowest"
            >
              <Icon name="edit" className="text-[16px] mr-1.5" />
              <span>{visibleEmail ? 'Cambiar correo' : 'Agregar correo'}</span>
            </Button>
          </div>
        </section>

        <section
          data-testid="customer-profile-google-card"
          className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-4 text-center sm:text-left"
        >
          <div className="space-y-2 flex flex-col items-center sm:items-start">
            <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center justify-center sm:justify-start gap-2">
              <Icon name="account_circle" className="text-secondary text-[20px]" />
              <span>Cuenta de Google</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Vinculá tu cuenta de Google para ingresar con un clic sin escribir tu contraseña.
            </p>
            <div className="pt-1 flex justify-center sm:justify-start w-full">
              <span
                data-testid="customer-profile-google-status"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-body-sm font-medium border ${
                  hasGoogleLinked
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800'
                    : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant'
                }`}
              >
                <Icon
                  name={hasGoogleLinked ? 'check_circle' : 'link_off'}
                  className="text-[16px]"
                />
                <span>{hasGoogleLinked ? 'Google vinculado' : 'Google no vinculado'}</span>
              </span>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Button
              type="button"
              variant={hasGoogleLinked ? 'outline' : 'primary'}
              size="sm"
              disabled={isGoogleMutating}
              onClick={onToggleGoogle}
              data-testid="customer-profile-google-btn"
            >
              <Icon name={hasGoogleLinked ? 'link_off' : 'add_link'} className="text-[16px] mr-1.5" />
              <span>
                {isGoogleMutating
                  ? 'Procesando...'
                  : hasGoogleLinked
                    ? 'Desvincular Google'
                    : 'Vincular Google'}
              </span>
            </Button>
          </div>
        </section>
      </div>

      <section
        data-testid="customer-profile-security-card"
        className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
      >
        <div className="space-y-1 flex flex-col items-center sm:items-start">
          <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center justify-center sm:justify-start gap-2">
            <Icon name="lock" className="text-secondary text-[20px]" />
            <span>Contraseña y seguridad</span>
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {hasPasswordProvider
              ? 'Actualizá tu contraseña ingresando primero tu contraseña actual.'
              : 'Tu cuenta aún no tiene contraseña local. Creá una para poder ingresar con correo o DNI.'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onOpenPasswordModal}
          data-testid="customer-profile-open-password-modal-btn"
          className="bg-surface-container-lowest shrink-0"
        >
          <Icon name="key" className="text-[18px] mr-2" />
          <span>{hasPasswordProvider ? 'Cambiar contraseña' : 'Crear contraseña'}</span>
        </Button>
      </section>
    </>
  );
}
