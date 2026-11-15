/**
 * Normalizes text for accent-insensitive, case-insensitive comparison.
 * @param {string} value
 * @returns {string}
 */
function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filters students by full name, DNI (with or without dots), or email.
 * @param {Array<Object>} students
 * @param {string} query
 * @returns {Array<Object>}
 */
export function filterStudents(students, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return students;

  const compactQuery = normalizedQuery.replace(/\./g, '');

  return students.filter((student) => {
    const fullName = normalizeText(student.nombreApellido);
    const email = normalizeText(student.email);
    const dni = normalizeText(student.dni);
    const compactDni = dni.replace(/\./g, '');

    return (
      fullName.includes(normalizedQuery) ||
      email.includes(normalizedQuery) ||
      dni.includes(normalizedQuery) ||
      compactDni.includes(compactQuery)
    );
  });
}
