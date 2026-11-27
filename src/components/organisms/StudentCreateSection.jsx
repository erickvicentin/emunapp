import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import StudentFormFields from '../molecules/StudentFormFields';
import { formatDniInput, validateStudentCreate } from '../../utils/registrationValidator';

const INITIAL_STUDENT_FORM = {
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
  genero: '',
  dni: '',
  email: '',
};

/**
 * StudentCreateSection Organism
 * Admin form to register a new student using the same personal fields as customer registration,
 * plus DNI and email. Delegates creation to Firebase Admin SDK via `onCreateStudent`.
 */
export default function StudentCreateSection({ onCreateStudent }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_STUDENT_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'dni' ? formatDniInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
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
      await onCreateStudent(formData);
      navigate('/administrador/alumnos');
    } catch {
      // Error feedback is displayed via floating Snackbar
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="student-create-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración • Alumnos
          </span>
          <h1
            data-testid="student-create-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Registrar nuevo alumno
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Completá los datos personales y de contacto para dar de alta al alumno en el estudio.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          data-testid="student-create-back-btn"
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
          />

          <div
            data-testid="student-create-activation-notice"
            className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3"
          >
            <Icon name="badge" className="text-secondary text-[20px] mt-0.5 shrink-0" />
            <div className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              <p className="font-semibold text-primary">
                Primer ingreso con DNI y cambio obligatorio
              </p>
              <p className="mt-0.5">
                El alumno se registrará en Firebase Auth y Firestore con rol <strong>customer</strong>. Su primer ingreso será utilizando su <strong>DNI como usuario y contraseña</strong>, y el sistema le solicitará definir una contraseña nueva al iniciar sesión.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-surface-container">
            <Button
              variant="outline"
              size="md"
              data-testid="student-create-cancel-btn"
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
              data-testid="student-create-submit-btn"
              disabled={isSubmitting}
              className="gap-2 cursor-pointer"
            >
              <Icon name="person_add" className="text-[18px]" />
              <span>{isSubmitting ? 'Registrando...' : 'Registrar alumno'}</span>
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
