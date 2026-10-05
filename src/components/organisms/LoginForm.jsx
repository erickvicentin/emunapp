import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../atoms/Icon';
import GoogleIcon from '../atoms/GoogleIcon';
import StudioBanner from '../molecules/StudioBanner';

/**
 * LoginForm Organism
 * Implements the user login interface for Emuná Pilates.
 * Supports role switching (alumna / equipo), password visibility toggle,
 * Google OAuth entry, and direct navigation to registration.
 */
export default function LoginForm({ onSubmit, onGoogleLogin }) {
  const [role, setRole] = useState('alumna'); // 'alumna' | 'equipo'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Por favor ingresá tu DNI o correo electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor ingresá tu contraseña.');
      return;
    }

    setLoading(true);
    if (onSubmit) {
      onSubmit({ role, identifier, password, rememberMe });
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  const handleForgotPassword = () => {
    alert('Para recuperar tu contraseña, comunicate con la administración de Emuná por WhatsApp o acercate a la recepción.');
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-surface-container-high/60">
      {/* Visual Side Banner Molecule */}
      <StudioBanner
        badgeText="Pilates Reformer Boutique"
        badgeIcon="spa"
        headline="Emuná Estudio"
        description="Conectá con tu cuerpo en un espacio sereno y exclusivo de 4 camas."
      />

      {/* Login Form Container */}
      <div className="w-full lg:w-7/12 p-space-lg sm:p-space-xl lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-space-sm">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Emuná Estudio Pilates
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
                Ingresá para autogestionarte
              </h2>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0 ml-3"
              aria-hidden="true"
            >
              <Icon name="self_improvement" className="text-[20px]" />
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div
            className="mt-space-md p-1 bg-surface-container rounded-full flex gap-1 max-w-xs"
            role="tablist"
            aria-label="Tipo de usuario"
          >
            <button
              id="tab-alumna"
              type="button"
              role="tab"
              aria-selected={role === 'alumna'}
              onClick={() => {
                setRole('alumna');
                setError('');
              }}
              className={`flex-1 py-2 px-space-md rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 ${
                role === 'alumna'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="person" className="text-[16px]" />
              <span>Alumna</span>
            </button>

            <button
              id="tab-equipo"
              type="button"
              role="tab"
              aria-selected={role === 'equipo'}
              onClick={() => {
                setRole('equipo');
                setError('');
              }}
              className={`flex-1 py-2 px-space-md rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 ${
                role === 'equipo'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="badge" className="text-[16px]" />
              <span>Equipo</span>
            </button>
          </div>

          {/* Error notification */}
          {error && (
            <div
              role="alert"
              className="mt-space-md p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2"
            >
              <Icon name="error" className="text-[18px] text-error shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="mt-space-lg space-y-space-md" onSubmit={handleSubmit} noValidate>
            {/* Identifier input */}
            <div className="space-y-space-xs">
              <label
                htmlFor="user-identifier"
                className="block font-label-md text-label-md text-on-surface"
              >
                {role === 'alumna' ? 'DNI o Correo Electrónico' : 'Correo Electrónico Institucional'}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none select-none">
                  alternate_email
                </span>
                <input
                  id="user-identifier"
                  name="identifier"
                  type={role === 'equipo' ? 'email' : 'text'}
                  autoComplete={role === 'equipo' ? 'email' : 'username'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === 'alumna'
                      ? 'Ej. 38450123 o tu@email.com'
                      : 'instructora@emunaestudio.com'
                  }
                  required
                  className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-11 pr-space-md py-3 font-body-md text-body-md transition-colors outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm border border-transparent"
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80">
                {role === 'alumna'
                  ? 'Si sos alumna podés ingresar directamente con tu DNI registrado.'
                  : 'Acceso exclusivo para instructoras certificadas y equipo de gestión.'}
              </p>
            </div>

            {/* Password input */}
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="block font-label-md text-label-md text-on-surface"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none select-none">
                  lock
                </span>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá tu contraseña"
                  required
                  className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-11 pr-11 py-3 font-body-md text-body-md transition-colors outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm border border-transparent"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 transition-colors flex items-center justify-center rounded-lg cursor-pointer"
                >
                  <Icon
                    name={showPassword ? 'visibility_off' : 'visibility'}
                    className="text-[20px]"
                  />
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-space-xs">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-space-xs cursor-pointer select-none"
              >
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-surface-container text-primary-container focus:ring-0 focus:outline-none accent-primary cursor-pointer"
                />
                <span className="font-body-sm text-body-sm text-on-surface">
                  Recordar mi sesión en este dispositivo
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="pt-space-xs space-y-space-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-space-lg rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-space-xs disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>

              <div className="relative flex items-center justify-center py-1">
                <span className="w-full h-[1px] bg-surface-container-high" />
                <span className="absolute bg-surface-container-lowest px-space-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  o
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={onGoogleLogin}
                className="w-full py-3 px-space-lg rounded-full bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-space-sm shadow-sm cursor-pointer"
              >
                <GoogleIcon />
                <span>Continuar con Google</span>
              </button>

              <p className="text-center font-body-sm text-[12px] text-on-surface-variant px-space-xs leading-snug">
                Solo utilizaremos tu nombre, fecha de nacimiento y foto de perfil para gestionar tus reservas.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Navigation Link */}
        <div className="mt-space-lg pt-space-sm border-t border-surface-container text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            ¿Primera vez en Emuná?{' '}
            <Link
              to="/register"
              className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors inline-flex items-center gap-0.5 font-semibold ml-1"
            >
              <span>Registrate aquí</span>
              <Icon name="arrow_outward" className="text-[16px]" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
