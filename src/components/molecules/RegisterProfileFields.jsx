import React, { useState } from 'react';
import Input from '../atoms/Input';
import GenderSelector from './GenderSelector';
import PhoneInput from './PhoneInput';
import { getMaxBirthdateForMinAge, MIN_BIRTHDATE } from '../../utils/dateUtils';

/**
 * RegisterProfileFields Molecule
 * Personal information fields: Nombre, Apellido, Teléfono, Fecha de Nacimiento, Género
 */
export default function RegisterProfileFields({
  formData,
  onChange,
  errors,
  birthdateHelper,
}) {
  const [maxBirthdate] = useState(() => getMaxBirthdateForMinAge(14));

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      const parts = val.split('-');
      if (parts[0] && parts[0].length > 4) {
        onChange({
          target: {
            name: 'fechaNacimiento',
            value: [parts[0].slice(0, 4), ...parts.slice(1)].join('-'),
          },
        });
        return;
      }
    }
    onChange(e);
  };
  return (
    <>
      {/* Nombre & Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Input
          id="register-nombre"
          data-testid="register-nombre-input"
          name="nombre"
          label="Nombre"
          value={formData.nombre}
          onChange={onChange}
          placeholder="Ej. Lucía"
          icon="person"
          required
          error={errors.nombre}
          autoComplete="given-name"
        />
        <Input
          id="register-apellido"
          data-testid="register-apellido-input"
          name="apellido"
          label="Apellido"
          value={formData.apellido}
          onChange={onChange}
          placeholder="Ej. González"
          icon="person"
          required
          error={errors.apellido}
          autoComplete="family-name"
        />
      </div>

      {/* Teléfono */}
      <PhoneInput
        id="register-telefono"
        name="telefono"
        label="Teléfono / WhatsApp"
        value={formData.telefono}
        onChange={onChange}
        required
        error={errors.telefono}
        helperText="Para avisos de tus turnos y lista de espera."
      />

      {/* Fecha de Nacimiento & Género (Dropdown) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Input
          id="register-fecha-nacimiento"
          data-testid="register-fecha-nacimiento-input"
          name="fechaNacimiento"
          type="date"
          min={MIN_BIRTHDATE}
          max={maxBirthdate}
          label="Fecha de Nacimiento"
          value={formData.fechaNacimiento}
          onChange={handleDateChange}
          required
          error={errors.fechaNacimiento}
          helperText={birthdateHelper}
        />

        <GenderSelector
          id="register-genero"
          value={formData.genero}
          onChange={onChange}
          error={errors.genero}
        />
      </div>
    </>
  );
}
