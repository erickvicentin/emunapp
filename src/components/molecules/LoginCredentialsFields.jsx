import React from 'react';
import Icon from '../atoms/Icon';

/**
 * LoginCredentialsFields Molecule
 * Renders identifier, password (with visibility toggle), and remember-me fields.
 */
export default function LoginCredentialsFields({
  role,
  identifier,
  onIdentifierChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  rememberMe,
  onRememberMeChange,
  onForgotPassword,
}) {
  return (
    <>
      {/* Identifier input */}
      <div className="space-y-space-xs">
        <label
          htmlFor="user-identifier"
          className="block font-label-md text-label-md text-on-surface"
        >
          {role === 'alumna'
            ? 'DNI o Correo Electrónico'
            : 'Correo Electrónico Institucional'}
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none select-none">
            alternate_email
          </span>
          <input
            id="user-identifier"
            data-testid="login-identifier-input"
            name="identifier"
            type={role === 'equipo' ? 'email' : 'text'}
            autoComplete={role === 'equipo' ? 'email' : 'username'}
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            placeholder={
              role === 'alumna'
                ? 'Ej. tu@email.com o 38450123'
                : 'instructora@emunaestudio.com'
            }
            required
            className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-11 pr-space-md py-3 font-body-md text-body-md transition-colors outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm border border-transparent"
          />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant/80">
          {role === 'alumna'
            ? 'Si sos alumna podés ingresar con tu email registrado.'
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
            onClick={onForgotPassword}
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
            data-testid="login-password-input"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Ingresá tu contraseña"
            required
            className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-11 pr-11 py-3 font-body-md text-body-md transition-colors outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm border border-transparent"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            onClick={onToggleShowPassword}
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
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="w-4 h-4 rounded bg-surface-container text-primary-container focus:ring-0 focus:outline-none accent-primary cursor-pointer"
          />
          <span className="font-body-sm text-body-sm text-on-surface">
            Recordar mi sesión en este dispositivo
          </span>
        </label>
      </div>
    </>
  );
}
