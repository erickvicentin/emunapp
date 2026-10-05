import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import StudioBanner from '../molecules/StudioBanner';
import RegisterProfileFields from '../molecules/RegisterProfileFields';
import GoogleOnboardingBanner from '../molecules/GoogleOnboardingBanner';
import GoogleRegisterButton from '../molecules/GoogleRegisterButton';
import RegisterSuccessCard from '../molecules/RegisterSuccessCard';
import AccountCredentialsFields from '../molecules/AccountCredentialsFields';
import TermsNotice from '../molecules/TermsNotice';
import { calculateAge } from '../../utils/dateUtils';
import { validateRegistration } from '../../utils/registrationValidator';
import { useAuth } from '../../hooks/useAuth';

const INITIAL_FORM_STATE = {
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
  genero: '',
  email: '',
  password: '',
  confirmPassword: '',
  aceptaTerminos: true,
};

/**
 * RegisterForm Organism
 * Registration form supporting standard registration and Google onboarding.
 * Mandatory fields: Nombre, Apellido, Teléfono, Fecha de Nacimiento (14-89 años), Género (Dropdown).
 * From Google: only profile picture, name, and birthdate (for age).
 */
export default function RegisterForm({ onSubmit }) {
  const navigate = useNavigate();
  const { user, userProfile, loginWithGoogle, registerWithEmail, completeGoogleRegistration, logout } = useAuth();
  const [isGoogleMode, setIsGoogleMode] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentAge = calculateAge(formData.fechaNacimiento);

  // Auto-complete Google data when an authenticated user arrives at /register with incomplete registration
  useEffect(() => {
    if (user && !userProfile?.registroCompleto) {
      const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com');
      if (!isGoogle) return;

      const names = (user.displayName || '').trim().split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const profile = {
        nombre: firstName,
        apellido: lastName,
        email: user.email || '',
        avatarUrl: user.photoURL || '',
      };

      setGoogleUser(profile);
      setIsGoogleMode(true);
      setFormData((prev) => ({
        ...prev,
        nombre: prev.nombre || firstName,
        apellido: prev.apellido || lastName,
        email: prev.email || user.email || '',
      }));
    }
  }, [user, userProfile]);

  const handleGoogleRegister = async () => {
    try {
      const res = await loginWithGoogle();
      const profile = res?.profile;

      // If user is already registered in Emuná, navigate directly to their portal
      if (profile && profile.registroCompleto) {
        navigate(profile.rol === 'staff' ? '/administrator' : '/customer');
        return;
      }

      const gUser = res.user;
      const names = (gUser.displayName || '').trim().split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const googleInfo = {
        nombre: firstName,
        apellido: lastName,
        email: gUser.email || '',
        avatarUrl: gUser.photoURL || '',
      };

      setGoogleUser(googleInfo);
      setIsGoogleMode(true);
      setFormData((prev) => ({
        ...prev,
        nombre: firstName || prev.nombre,
        apellido: lastName || prev.apellido,
        email: gUser.email || prev.email,
      }));
      setErrors({});
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('Error al conectar con Google: ' + (err.message || 'Intentá de nuevo'));
      }
    }
  };

  const handleResetGoogle = async () => {
    await logout();
    setIsGoogleMode(false);
    setGoogleUser(null);
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData, isGoogleMode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const submissionPayload = {
      ...formData,
      registrationMethod: isGoogleMode ? 'google' : 'password',
      avatarUrl: googleUser?.avatarUrl || null,
      edad: currentAge,
    };

    try {
      if (onSubmit) {
        await onSubmit(submissionPayload);
      } else if (isGoogleMode) {
        await completeGoogleRegistration(submissionPayload);
      } else {
        await registerWithEmail(formData.email, formData.password, submissionPayload);
      }
      setSuccess(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: 'Este correo electrónico ya se encuentra registrado.' });
      } else if (err.code === 'auth/weak-password') {
        setErrors({ password: 'La contraseña debe tener al menos 6 caracteres.' });
      } else {
        alert('Error al registrar: ' + (err.message || 'Verificá los datos ingresados.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getBirthdateHelper = () => {
    if (currentAge === null) {
      return 'Requerida para tu ficha postural y de salud (14 a 89 años).';
    }
    if (currentAge <= 13 || currentAge >= 90) {
      return 'Edad fuera del rango permitido: debes tener entre 14 y 89 años.';
    }
    return `Edad calculada: ${currentAge} años.`;
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-surface-container-high/60">
      {/* Side Studio Banner */}
      <StudioBanner
        badgeText="Nueva Alumna"
        badgeIcon="spa"
        headline="Emuná Pilates"
        description="Unite a nuestro estudio boutique. Clases de hasta 4 camas con kinesiología y cuidado postural."
      />

      {/* Form Content Area */}
      <div className="w-full lg:w-7/12 p-space-lg sm:p-space-xl lg:p-10 flex flex-col justify-between bg-surface-container-lowest">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Emuná Estudio Pilates
              </span>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-0.5">
                {isGoogleMode ? 'Completá tu ficha de registro' : 'Creá tu cuenta de alumna'}
              </h1>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0 ml-3"
              aria-hidden="true"
            >
              <Icon name="person_add" className="text-[20px]" />
            </div>
          </div>

          {success ? (
            <RegisterSuccessCard nombre={formData.nombre} />
          ) : (
            <>
              {isGoogleMode && googleUser ? (
                <GoogleOnboardingBanner
                  googleUser={googleUser}
                  onReset={handleResetGoogle}
                />
              ) : (
                <GoogleRegisterButton onClick={handleGoogleRegister} />
              )}

              {/* Form Elements */}
              <form onSubmit={handleSubmit} className="mt-space-md space-y-space-md" noValidate>
                <RegisterProfileFields
                  formData={formData}
                  onChange={handleChange}
                  errors={errors}
                  birthdateHelper={getBirthdateHelper()}
                />

                {/* Email and Password for direct registration */}
                {!isGoogleMode && (
                  <AccountCredentialsFields
                    email={formData.email}
                    password={formData.password}
                    confirmPassword={formData.confirmPassword}
                    onChange={handleChange}
                    errors={errors}
                  />
                )}

                {/* Terms and Cancellation Notice */}
                <TermsNotice
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                  error={errors.aceptaTerminos}
                />

                {/* Submit button */}
                <div className="pt-space-xs">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-space-lg rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-space-xs disabled:opacity-60 cursor-pointer"
                  >
                    <span>{loading ? 'Creando cuenta...' : 'Crear mi Cuenta de Alumna'}</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer Navigation Link */}
        <div className="mt-space-lg pt-space-sm border-t border-surface-container text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            ¿Ya tenés una cuenta en Emuná?{' '}
            <Link
              to="/login"
              className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors inline-flex items-center gap-0.5 font-semibold ml-1"
            >
              <span>Iniciar sesión</span>
              <Icon name="arrow_outward" className="text-[16px]" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
