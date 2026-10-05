import React, { useState } from 'react';
import Input from '../atoms/Input';
import Icon from '../atoms/Icon';

/**
 * AccountCredentialsFields Molecule
 * Handles Email, Password, and Confirm Password fields for manual registration
 */
export default function AccountCredentialsFields({
  email,
  password,
  confirmPassword,
  onChange,
  errors,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
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
    </>
  );
}
