/**
 * Generates and downloads an Excel-compatible CSV template with UTF-8 BOM
 * for the Alumnos module.
 * @param {Array<Object>} students - List of student records to include as reference rows
 */
export function exportStudentsExcelTemplate(students = []) {
  const headers = [
    'Nombre y apellido',
    'DNI',
    'Edad',
    'Sexo',
    'Porcentaje de asistencia',
  ];

  const escapeCsvCell = (value) => {
    const str = String(value ?? '');
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = students.map((student) => [
    student.nombreApellido,
    student.dni,
    student.edad,
    student.sexo,
    `${student.porcentajeAsistencia}%`,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(';'))
    .join('\r\n');

  // UTF-8 BOM ensures Excel opens accented Spanish characters correctly
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla-alumnos-emuna.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
