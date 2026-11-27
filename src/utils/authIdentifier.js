const DNI_AUTH_DOMAIN = 'dni.emuna.local';

/**
 * Extracts only numeric digits from a DNI string.
 */
export function normalizeDniDigits(rawDni) {
  return String(rawDni || '').replace(/\D/g, '');
}

/**
 * Builds the synthetic Firebase Auth email for DNI-only accounts.
 */
export function buildDniAuthEmail(rawDni) {
  const digits = normalizeDniDigits(rawDni);
  return `${digits}@${DNI_AUTH_DOMAIN}`;
}

/**
 * Returns true if the login identifier looks like a DNI (no '@' and >= 6 digits).
 */
export function isDniIdentifier(identifier) {
  const trimmed = String(identifier || '').trim();
  if (!trimmed || trimmed.includes('@')) return false;
  return normalizeDniDigits(trimmed).length >= 6;
}
