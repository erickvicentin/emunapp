import React from 'react';
import Input from '../atoms/Input';
import RegisterProfileFields from './RegisterProfileFields';
import { calculateAge } from '../../utils/dateUtils';

/**
 * StudentFormFields Molecule
 * Shared fields for creating or editing a student profile
 * (personal registration fields + DNI + Email).
 */
export default function StudentFormFields({
  formData,
  onChange,
  errors,
  emailReadOnly = false,
}) {
  const currentAge = calculateAge(formData.fechaNacimiento);
  const birthdateHelper =
    currentAge !== null ? `Edad calculada: ${currentAge} años` : undefined;

  return (
    <>
      <RegisterProfileFields
        formData={formData}
        onChange={onChange}
        errors={errors}
        birthdateHelper={birthdateHelper}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <Input
          id="student-dni"
          name="dni"
          label="DNI"
          inputMode="numeric"
          maxLength={10}
          placeholder="38.412.905"
          value={formData.dni}
          onChange={onChange}
          error={errors.dni}
          data-testid="student-form-dni-input"
          required
        />
        <Input
          id="student-email"
          name="email"
          type="email"
          label="Correo electrónico (opcional)"
          placeholder="alumna@emuna.com"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          disabled={emailReadOnly}
          helperText={
            emailReadOnly
              ? 'El correo de acceso no se modifica desde este formulario.'
              : 'Opcional: si no tiene email, ingresará con su DNI.'
          }
          data-testid="student-form-email-input"
        />
      </div>
    </>
  );
}
