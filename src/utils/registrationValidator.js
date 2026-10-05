import { calculateAge } from './dateUtils';

/**
 * Validates the registration form data
 * @param {Object} formData
 * @param {boolean} isGoogleMode
 * @returns {Object} errors map
 */
export function validateRegistration(formData, isGoogleMode) {
  const errors = {};

  if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
  if (!formData.apellido.trim()) errors.apellido = 'El apellido es obligatorio.';
  if (!formData.telefono.trim()) errors.telefono = 'El teléfono es obligatorio para contactarte por tus turnos.';

  if (!formData.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
  } else {
    const age = calculateAge(formData.fechaNacimiento);
    if (age === null) {
      errors.fechaNacimiento = 'Ingresá una fecha de nacimiento válida.';
    } else if (age <= 13) {
      errors.fechaNacimiento = 'Debes tener más de 13 años para registrarte.';
    } else if (age >= 90) {
      errors.fechaNacimiento = 'Debes tener menos de 90 años para registrarte.';
    }
  }

  if (!formData.genero) errors.genero = 'Seleccioná una opción de género.';

  if (!isGoogleMode) {
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresá un correo electrónico válido.';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
  }

  if (!formData.aceptaTerminos) {
    errors.aceptaTerminos = 'Debes aceptar los términos y políticas del estudio.';
  }

  return errors;
}
