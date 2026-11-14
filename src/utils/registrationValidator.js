import { calculateAge } from './dateUtils';

/**
 * Validates shared personal profile fields (Nombre, Apellido, Teléfono, Fecha de Nacimiento, Género).
 * Reused across customer self-registration and admin student creation.
 * @param {Object} formData
 * @returns {Object} errors map
 */
export function validateProfileFields(formData) {
  const errors = {};

  if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
  if (!formData.apellido.trim()) errors.apellido = 'El apellido es obligatorio.';
  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio para contactarte por tus turnos.';
  }

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

  return errors;
}

/**
 * Validates email format and presence.
 * @param {string} email
 * @returns {string|null} error message or null
 */
export function validateEmailField(email) {
  if (!email.trim()) return 'El correo electrónico es obligatorio.';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Ingresá un correo electrónico válido.';
  return null;
}

/**
 * Validates the customer self-registration form data.
 * @param {Object} formData
 * @param {boolean} isGoogleMode
 * @returns {Object} errors map
 */
export function validateRegistration(formData, isGoogleMode) {
  const errors = validateProfileFields(formData);

  if (!isGoogleMode) {
    const emailError = validateEmailField(formData.email);
    if (emailError) errors.email = emailError;

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

/**
 * Validates the admin "Crear nuevo alumno" form data.
 * Password is not entered by admin (activation email or DNI default).
 * @param {Object} formData
 * @returns {Object} errors map
 */
export function validateStudentCreate(formData) {
  const errors = validateProfileFields(formData);

  const compactDni = formData.dni.replace(/\./g, '').trim();
  if (!compactDni) {
    errors.dni = 'El DNI es obligatorio.';
  } else if (!/^\d{7,8}$/.test(compactDni)) {
    errors.dni = 'Ingresá un DNI válido de 7 u 8 dígitos.';
  }

  const emailError = validateEmailField(formData.email);
  if (emailError) errors.email = emailError;

  return errors;
}
