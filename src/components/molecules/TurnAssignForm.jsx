import React, { useState } from 'react';
import Button from '../atoms/Button';
import SelectChevron from '../atoms/SelectChevron';

/**
 * TurnAssignForm Molecule
 * Form to select and assign an available student to a shift.
 */
export default function TurnAssignForm({
  turnId,
  availableStudents,
  isFull,
  isMutating = false,
  onAssignStudent,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!turnId || !selectedStudentId) return;
    const student = availableStudents.find((s) => s.id === selectedStudentId);
    if (!student) return;
    const ok = await onAssignStudent(turnId, student);
    if (ok) setSelectedStudentId('');
  };

  return (
    <form
      onSubmit={handleAssign}
      className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
    >
      <div className="flex-1">
        <label
          htmlFor="turn-assign-student-select"
          className="block font-label-md text-label-md text-on-surface mb-1"
        >
          Asignar alumno al turno (consume crédito si tiene, sino asigna igual)
        </label>
        <div className="relative w-full">
          <select
            id="turn-assign-student-select"
            data-testid="turn-assign-student-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={isFull || isMutating}
            className="w-full appearance-none rounded-xl bg-surface-container-lowest border border-outline-variant pl-3 pr-10 py-2.5 text-body-md disabled:opacity-50 cursor-pointer"
          >
            <option value="">
              {isFull ? 'Turno completo (4/4 cupos)' : 'Seleccioná un alumno...'}
            </option>
            {availableStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.nombreApellido} {student.dni ? `(${student.dni})` : ''}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={!selectedStudentId || isFull || isMutating}
        data-testid="turn-assign-submit-btn"
      >
        <span>Asignar</span>
      </Button>
    </form>
  );
}
