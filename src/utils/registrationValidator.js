import { calculateAge } from './dateUtils';
import { validatePhoneNumber } from './phoneUtils';

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

  const phoneError = validatePhoneNumber(formData.telefono);
  if (phoneError) {
    errors.telefono = phoneError;
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

export function validateDniField(rawDni) {
  const compactDni = String(rawDni || '').replace(/\./g, '').trim();
  if (!compactDni) {
    return 'El DNI es obligatorio.';
  }
  if (!/^\d{7,8}$/.test(compactDni)) {
    return 'Ingresá un DNI válido de 7 u 8 dígitos.';
  }
  return null;
}

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Mínimo 6 caracteres',
    test: (pwd) => pwd.length >= 6,
  },
  {
    id: 'uppercase',
    label: 'Al menos 1 letra mayúscula',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'lowercase',
    label: 'Al menos 1 letra minúscula',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'Al menos 1 número',
    test: (pwd) => /\d/.test(pwd),
  },
];

/**
 * Validates password presence and strength rules.
 * @param {string} password
 * @returns {string|null} error message or null
 */
export function validatePasswordField(password = '') {
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula.';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra minúscula.';
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe incluir al menos un número.';
  }
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

  const dniError = validateDniField(formData.dni);
  if (dniError) errors.dni = dniError;

  if (!isGoogleMode) {
    const emailError = validateEmailField(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePasswordField(formData.password);
    if (passwordError) errors.password = passwordError;

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

  const dniError = validateDniField(formData.dni);
  if (dniError) errors.dni = dniError;

  const emailError = validateEmailField(formData.email);
  if (emailError) errors.email = emailError;

  return errors;
}
