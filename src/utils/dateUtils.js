export const MIN_BIRTHDATE = '1900-01-01';

/**
 * Returns the maximum YYYY-MM-DD birthdate allowed for a minimum age (default 14 years).
 */
export function getMaxBirthdateForMinAge(minAge = 14, now = new Date()) {
  const target = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate age in years based on a strict birthdate string (YYYY-MM-DD).
 * Returns null if the format is not 4-digit year or not a real calendar date.
 * @param {string} dateStr
 * @returns {number|null} Age in years or null if invalid
 */
export function calculateAge(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  if (year < 1900) return null;

  const parsed = new Date(year, month, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 && age <= 130 ? age : null;
}
