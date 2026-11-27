import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { validateEmailField } from '../../utils/registrationValidator';
import StudioBanner from '../molecules/StudioBanner';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * ForgotPasswordForm Organism
 * Allows users to request a Firebase Auth password reset email.
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const normalizedEmail = email.trim().toLowerCase();
    const emailValidation = validateEmailField(normalizedEmail);
    if (emailValidation) {
      setFieldError(emailValidation);
      return;
    }

    setFieldError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSentToEmail(normalizedEmail);
    } catch (err) {
      if (err?.code === 'auth/invalid-email') {
        setFieldError('Ingresá un correo electrónico válido.');
      } else if (err?.code === 'auth/too-many-requests') {
        setSubmitError(
          'Demasiados intentos en poco tiempo. Esperá unos minutos e intentá nuevamente.'
        );
      } else if (err?.code === 'auth/user-not-found') {
        // Avoid enumerating whether an email exists; show the same confirmation message
        setSentToEmail(normalizedEmail);
      } else {
        setSubmitError(
          'No pudimos enviar el correo de recuperación. Intentá nuevamente en unos minutos.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="forgot-password-card"
      className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-surface-container-high/60"
    >
      <StudioBanner
        badgeText="Recuperación de Cuenta"
        badgeIcon="lock_reset"
        headline="Emuná Estudio"
        description="Te enviaremos un enlace seguro a tu correo para que puedas crear una nueva contraseña."
      />

      <div className="w-full lg:w-7/12 p-space-lg sm:p-space-xl lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
        <div>
          <div className="space-y-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Acceso a tu cuenta
            </span>
            <h1
              data-testid="forgot-password-title"
              className="font-headline-lg text-headline-lg text-primary tracking-tight"
            >
              Recuperar contraseña
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Ingresá el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones para restablecerla.
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant/90 bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-2">
              ¿Te registraste solo con DNI (sin email)? Solicitale a la administradora del estudio que restablezca tu contraseña a tu DNI.
            </p>
          </div>

          {submitError && (
            <div
              role="alert"
              data-testid="forgot-password-error-alert"
              className="mt-space-md p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2"
            >
              <Icon name="error" className="text-[18px] text-error shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {sentToEmail ? (
            <div
              data-testid="forgot-password-success"
              className="mt-space-lg p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Icon
                  name="mark_email_read"
                  className="text-[24px] text-emerald-700 shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <h2 className="font-title-md text-title-md text-emerald-950 font-semibold">
                    Revisá tu correo electrónico
                  </h2>
                  <p className="font-body-md text-body-md text-emerald-900">
                    Si existe una cuenta registrada para{' '}
                    <span className="font-semibold">{sentToEmail}</span>, te enviamos un enlace para restablecer tu contraseña.
                  </p>
                  <p className="font-body-sm text-body-sm text-emerald-800">
                    Si no lo ves en tu bandeja principal, revisá la carpeta de spam o correo no deseado.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/login">
                  <Button
                    variant="primary"
                    size="md"
                    data-testid="forgot-password-login-btn"
                  >
                    <span>Volver a iniciar sesión</span>
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  data-testid="forgot-password-retry-btn"
                  onClick={() => {
                    setSentToEmail('');
                    setEmail('');
                  }}
                >
                  <span>Usar otro correo</span>
                </Button>
              </div>
            </div>
          ) : (
            <form
              data-testid="forgot-password-form"
              className="mt-space-lg space-y-space-md"
              onSubmit={handleSubmit}
              noValidate
            >
              <Input
                id="forgot-password-email"
                data-testid="forgot-password-email-input"
                name="email"
                type="email"
                label="Correo Electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError('');
                }}
                placeholder="tu@email.com"
                icon="alternate_email"
                required
                error={fieldError}
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                data-testid="forgot-password-submit-btn"
                className="w-full justify-center shadow-md cursor-pointer"
              >
                <span>{loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}</span>
              </Button>
            </form>
          )}
        </div>

        <div className="mt-space-lg pt-space-sm border-t border-surface-container text-center">
          <Link
            to="/login"
            data-testid="forgot-password-back-link"
            className="inline-flex items-center gap-1.5 font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
