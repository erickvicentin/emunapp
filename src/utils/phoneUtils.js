import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from 'libphonenumber-js';

export const DEFAULT_COUNTRY = 'AR';

const regionNames =
  typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['es'], { type: 'region' })
    : null;

function getCountryDisplayName(code) {
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
}

export const COUNTRY_DIAL_OPTIONS = getCountries()
  .map((code) => {
    const dialCode = getCountryCallingCode(code);
    const name = getCountryDisplayName(code);
    return {
      code,
      name,
      dialCode,
      label: `${name} (+${dialCode})`,
    };
  })
  .sort((a, b) => {
    if (a.code === DEFAULT_COUNTRY) return -1;
    if (b.code === DEFAULT_COUNTRY) return 1;
    return a.name.localeCompare(b.name, 'es');
  });

export function getDialCode(countryCode = DEFAULT_COUNTRY) {
  try {
    return getCountryCallingCode(countryCode || DEFAULT_COUNTRY);
  } catch {
    return getCountryCallingCode(DEFAULT_COUNTRY);
  }
}

/**
 * Extracts country ISO code and national digits from a stored phone string.
 */
export function parsePhoneValue(rawValue, fallbackCountry = DEFAULT_COUNTRY) {
  const value = String(rawValue || '').trim();
  if (!value) {
    return { country: fallbackCountry, nationalNumber: '' };
  }

  const parsed = parsePhoneNumberFromString(value, fallbackCountry);
  if (parsed) {
    return {
      country: parsed.country || fallbackCountry,
      nationalNumber: parsed.nationalNumber || '',
    };
  }

  const dialCode = getDialCode(fallbackCountry);
  const digits = value.replace(/\D/g, '');
  const stripped =
    value.startsWith('+') && digits.startsWith(dialCode)
      ? digits.slice(dialCode.length)
      : digits;

  return {
    country: fallbackCountry,
    nationalNumber: stripped,
  };
}

/**
 * Combines a country code and national digits into a clean international string.
 */
export function buildInternationalPhone(country, nationalInput) {
  const digits = String(nationalInput || '').replace(/\D/g, '');
  if (!digits) return '';
  const dialCode = getDialCode(country);
  return `+${dialCode} ${digits}`;
}

/**
 * Checks whether the given national digits exceed the maximum allowed length for the country.
 */
export function isPhoneTooLong(nationalDigits, country = DEFAULT_COUNTRY) {
  const digits = String(nationalDigits || '').replace(/\D/g, '');
  if (!digits) return false;
  return validatePhoneNumberLength(digits, country) === 'TOO_LONG';
}

/**
 * Validates a phone number string using libphonenumber-js length and format rules.
 * Returns null if valid, or a localized Spanish error message.
 */
export function validatePhoneNumber(rawValue, selectedCountry = DEFAULT_COUNTRY) {
  const value = String(rawValue || '').trim();
  if (!value) {
    return 'El teléfono es obligatorio para contactarte por tus turnos.';
  }

  const parsed = parsePhoneNumberFromString(value, selectedCountry);
  const countryToCheck = parsed?.country || selectedCountry;
  const digitsToCheck = parsed?.nationalNumber || value.replace(/\D/g, '');

  if (!digitsToCheck) {
    return 'Ingresá un número de teléfono válido.';
  }

  const lengthStatus = validatePhoneNumberLength(digitsToCheck, countryToCheck);
  if (lengthStatus === 'TOO_SHORT') {
    return 'El número de teléfono es demasiado corto para el país seleccionado.';
  }
  if (lengthStatus === 'TOO_LONG') {
    return 'El número de teléfono supera la cantidad de dígitos permitida.';
  }
  if (!isValidPhoneNumber(value, countryToCheck)) {
    return 'Ingresá un número de teléfono válido para el país seleccionado.';
  }

  return null;
}
