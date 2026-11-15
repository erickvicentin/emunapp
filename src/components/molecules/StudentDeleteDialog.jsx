import React from 'react';
import Icon from '../atoms/Icon';

/**
 * StudentDeleteDialog Molecule
 * Native modal <dialog> to confirm deleting a student.
 */
export default function StudentDeleteDialog({
  dialogRef,
  studentToDelete,
  isDeleting = false,
  onClose,
  onCancel,
  onConfirm,
}) {
  return (
    <dialog
      ref={dialogRef}
      data-testid="student-delete-dialog"
      aria-labelledby="delete-student-title"
      onClose={onClose}
      className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-md w-[calc(100%-2rem)] text-on-surface"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
          <Icon name="delete_forever" className="text-[22px]" />
        </div>
        <div>
          <h2
            id="delete-student-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold"
          >
            ¿Eliminar usuario?
          </h2>
          <p
            data-testid="student-delete-warning"
            className="font-body-md text-body-md text-on-surface-variant mt-1"
          >
            Estás por eliminar a{' '}
            <strong className="text-primary">
              {studentToDelete?.nombreApellido}
            </strong>
            . Todo lo relacionado al mismo (perfil, reservas, membresías y pagos) será eliminado sin posibilidad de deshacer la acción.
          </p>
        </div>
      </div>

      <form
        method="dialog"
        onSubmit={onConfirm}
        className="mt-6 flex items-center justify-end gap-3"
      >
        <button
          type="button"
          value="cancel"
          data-testid="student-delete-cancel-btn"
          onClick={onCancel}
          disabled={isDeleting}
          autoFocus
          className="px-4 py-2 rounded-full border border-outline-variant text-primary font-label-md text-[13px] font-semibold hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          value="confirm"
          data-testid="student-delete-confirm-btn"
          disabled={isDeleting}
          className="px-4 py-2 rounded-full bg-error text-on-error font-label-md text-[13px] font-semibold hover:bg-error/90 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar usuario'}
        </button>
      </form>
    </dialog>
  );
}
