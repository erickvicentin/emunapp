import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import GoogleIcon from '../atoms/GoogleIcon';
import StudioBanner from '../molecules/StudioBanner';
import GenderSelector from '../molecules/GenderSelector';
import GoogleOnboardingBanner from '../molecules/GoogleOnboardingBanner';
import RegisterSuccessCard from '../molecules/RegisterSuccessCard';
import AccountCredentialsFields from '../molecules/AccountCredentialsFields';
import TermsNotice from '../molecules/TermsNotice';
import { calculateAge } from '../../utils/dateUtils';
import { validateRegistration } from '../../utils/registrationValidator';

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
  const [isGoogleMode, setIsGoogleMode] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentAge = calculateAge(formData.fechaNacimiento);

  const handleGoogleRegister = () => {
    const mockProfile = {
      nombre: 'Lucía',
      apellido: '',
      email: 'lucia.alumna@gmail.com',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      fechaNacimiento: '1996-05-18',
    };
    setGoogleUser(mockProfile);
    setIsGoogleMode(true);
    setFormData((prev) => ({
      ...prev,
      nombre: mockProfile.nombre,
      email: mockProfile.email,
      fechaNacimiento: mockProfile.fechaNacimiento,
    }));
    setErrors({});
  };

  const handleResetGoogle = () => {
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

  const handleSubmit = (e) => {
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

    if (onSubmit) {
      onSubmit(submissionPayload);
    } else {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 700);
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
                <div className="mt-space-md">
                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="w-full py-3 px-space-lg rounded-full bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-space-sm shadow-sm cursor-pointer"
                  >
                    <GoogleIcon />
                    <span>Registrate con Google</span>
                  </button>
                  <p className="text-center font-body-sm text-[12px] text-on-surface-variant mt-1.5 px-space-xs leading-snug">
                    De Google solo tomamos foto de perfil, nombre y fecha de nacimiento para el cálculo de tu edad.
                  </p>

                  <div className="relative flex items-center justify-center my-3">
                    <span className="w-full h-[1px] bg-surface-container-high" />
                    <span className="absolute bg-surface-container-lowest px-space-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      o completá el formulario
                    </span>
                  </div>
                </div>
              )}

              {/* Form Elements */}
              <form onSubmit={handleSubmit} className="mt-space-md space-y-space-md" noValidate>
                {/* Nombre & Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <Input
                    id="register-nombre"
                    name="nombre"
                    label="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Lucía"
                    icon="person"
                    required
                    error={errors.nombre}
                    autoComplete="given-name"
                  />
                  <Input
                    id="register-apellido"
                    name="apellido"
                    label="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Ej. González"
                    icon="person"
                    required
                    error={errors.apellido}
                    autoComplete="family-name"
                  />
                </div>

                {/* Teléfono */}
                <Input
                  id="register-telefono"
                  name="telefono"
                  type="tel"
                  label="Teléfono / WhatsApp"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. +54 9 362 4123456"
                  icon="call"
                  required
                  error={errors.telefono}
                  helperText="Para avisos de tus turnos y lista de espera."
                  autoComplete="tel"
                />

                {/* Fecha de Nacimiento & Género (Dropdown) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <Input
                    id="register-fecha-nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    label="Fecha de Nacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                    error={errors.fechaNacimiento}
                    helperText={getBirthdateHelper()}
                  />

                  <GenderSelector
                    id="register-genero"
                    value={formData.genero}
                    onChange={handleChange}
                    error={errors.genero}
                  />
                </div>

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
