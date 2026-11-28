import React, { useState } from 'react';
import Input from '../atoms/Input';
import Icon from '../atoms/Icon';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';

/**
 * AccountCredentialsFields Molecule
 * Handles Email (or DNI-only opt-out), Password, and Confirm Password fields for manual registration
 */
export default function AccountCredentialsFields({
  email,
  noEmail = false,
  onToggleNoEmail,
  password,
  confirmPassword,
  onChange,
  errors,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-body-sm text-on-surface cursor-pointer select-none">
          <input
            type="checkbox"
            data-testid="register-no-email-checkbox"
            checked={noEmail}
            onChange={(e) => onToggleNoEmail?.(e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
          />
          <span>No tengo email (registrarme solo con mi DNI)</span>
        </label>

        {noEmail ? (
          <p
            data-testid="register-no-email-hint"
            className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm text-on-surface-variant"
          >
            Vas a poder iniciar sesión ingresando directamente tu <strong>DNI</strong> y tu contraseña.
          </p>
        ) : (
          <Input
            id="register-email"
            name="email"
            type="email"
            label="Correo Electrónico"
            value={email}
            onChange={onChange}
            placeholder="tu@email.com"
            icon="alternate_email"
            required
            error={errors.email}
            autoComplete="email"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Input
          id="register-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Contraseña"
          value={password}
          onChange={onChange}
          placeholder="Mínimo 6 caracteres"
          icon="lock"
          required
          error={errors.password}
          autoComplete="new-password"
          endAction={
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-on-surface-variant hover:text-on-surface p-1 transition-colors cursor-pointer"
            >
              <Icon
                name={showPassword ? 'visibility_off' : 'visibility'}
                className="text-[20px]"
              />
            </button>
          }
        />

        <Input
          id="register-confirm-password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChange={onChange}
          placeholder="Repetí tu contraseña"
          icon="lock"
          required
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <PasswordRequirementsChecklist
        password={password}
        testIdPrefix="register-password-rule"
      />
    </>
  );
}
