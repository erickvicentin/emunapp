import React from 'react';
import Input from '../atoms/Input';
import GenderSelector from './GenderSelector';

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
  return (
    <>
      {/* Nombre & Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Input
          id="register-nombre"
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
      <Input
        id="register-telefono"
        name="telefono"
        type="tel"
        label="Teléfono / WhatsApp"
        value={formData.telefono}
        onChange={onChange}
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
          onChange={onChange}
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
