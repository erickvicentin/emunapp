import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import StudentFormFields from '../molecules/StudentFormFields';
import { validateStudentCreate } from '../../utils/registrationValidator';

function mapStaffToForm(staffMember) {
  if (!staffMember) {
    return {
      nombre: '',
      apellido: '',
      telefono: '',
      fechaNacimiento: '',
      genero: '',
      dni: '',
      email: '',
    };
  }

  const nameParts = (staffMember.nombreApellido || '').trim().split(/\s+/);
  return {
    nombre: staffMember.nombre || nameParts[0] || '',
    apellido: staffMember.apellido || nameParts.slice(1).join(' '),
    telefono: staffMember.telefono || '',
    fechaNacimiento: staffMember.fechaNacimiento || '',
    genero: staffMember.genero || 'no_especificar',
    dni: staffMember.dni || '',
    email: staffMember.email || '',
  };
}

/**
 * StaffEditSection Organism
 * Admin-only form to edit an existing staff user's personal details.
 */
export default function StaffEditSection({ staffMember, onUpdateStaff }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => mapStaffToForm(staffMember));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!staffMember) {
    return (
      <section
        data-testid="staff-edit-not-found"
        className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center space-y-4"
      >
        <Icon name="person_off" className="text-[40px] text-secondary/70" />
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Usuario staff no encontrado
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            No pudimos cargar los datos del usuario staff para editar.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-testid="staff-edit-back-btn"
          onClick={() => navigate('/administrador/usuarios')}
          className="gap-2 cursor-pointer"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Volver a Usuarios</span>
        </Button>
      </section>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateStudentCreate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStaff(staffMember, formData);
      navigate('/administrador/usuarios');
    } catch {
      // Error feedback is displayed via floating Snackbar
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="staff-edit-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración • Usuarios (staff)
          </span>
          <h1
            data-testid="staff-edit-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Editar datos del usuario staff
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Actualizá la información personal y de contacto de{' '}
            <strong className="text-primary">{staffMember.nombreApellido}</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          data-testid="staff-edit-back-btn"
          onClick={() => navigate('/administrador/usuarios')}
          className="gap-2 bg-surface-container-lowest cursor-pointer"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Volver a Usuarios</span>
        </Button>
      </section>

      <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-3xl">
          <StudentFormFields
            formData={formData}
            onChange={handleChange}
            errors={errors}
            emailReadOnly
          />

          <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-surface-container">
            <Button
              variant="outline"
              size="md"
              data-testid="staff-edit-cancel-btn"
              disabled={isSubmitting}
              onClick={() => navigate('/administrador/usuarios')}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              data-testid="staff-edit-submit-btn"
              disabled={isSubmitting}
              className="gap-2 cursor-pointer"
            >
              <Icon name="save" className="text-[18px]" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</span>
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
