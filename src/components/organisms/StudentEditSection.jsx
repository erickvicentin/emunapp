import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import StudentFormFields from '../molecules/StudentFormFields';
import { validateStudentCreate } from '../../utils/registrationValidator';

function mapStudentToForm(student) {
  if (!student) {
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

  const nameParts = (student.nombreApellido || '').trim().split(/\s+/);
  const fallbackFirst = nameParts[0] || '';
  const fallbackLast = nameParts.slice(1).join(' ');

  return {
    nombre: student.nombre || fallbackFirst,
    apellido: student.apellido || fallbackLast,
    telefono: student.telefono || '',
    fechaNacimiento: student.fechaNacimiento || '',
    genero: student.genero || 'no_especificar',
    dni: student.dni || '',
    email: student.email || '',
  };
}

/**
 * StudentEditSection Organism
 * Admin form to edit an existing student's personal details.
 */
export default function StudentEditSection({ student, onUpdateStudent }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => mapStudentToForm(student));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!student) {
    return (
      <section
        data-testid="student-edit-not-found"
        className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center space-y-4"
      >
        <Icon name="person_off" className="text-[40px] text-secondary/70" />
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Alumno no encontrado
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            No pudimos cargar los datos del alumno para editar.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-testid="student-edit-back-btn"
          onClick={() => navigate('/administrador/alumnos')}
          className="gap-2 cursor-pointer"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Volver a Alumnos</span>
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
      await onUpdateStudent(student, formData);
      navigate('/administrador/alumnos');
    } catch {
      // Error feedback is displayed via floating Snackbar
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="student-edit-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración • Alumnos
          </span>
          <h1
            data-testid="student-edit-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Editar datos del alumno
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Actualizá la información personal y de contacto de{' '}
            <strong className="text-primary">{student.nombreApellido}</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          data-testid="student-edit-back-btn"
          onClick={() => navigate('/administrador/alumnos')}
          className="gap-2 bg-surface-container-lowest cursor-pointer"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Volver a Alumnos</span>
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
              data-testid="student-edit-cancel-btn"
              disabled={isSubmitting}
              onClick={() => navigate('/administrador/alumnos')}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              data-testid="student-edit-submit-btn"
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
