import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import DetailField from '../molecules/DetailField';

function getGenderIcon(genderOrSex) {
  const value = String(genderOrSex || '').toLowerCase();
  if (value === 'mujer' || value === 'femenino') return 'woman';
  if (value === 'hombre' || value === 'masculino') return 'man';
  return 'person';
}

/**
 * StudentDetailSection Organism
 * Displays the student's profile photo (or gender-aware user icon fallback)
 * and personal/enrollment details.
 */
export default function StudentDetailSection({ student }) {
  const navigate = useNavigate();

  if (!student) {
    return (
      <section
        data-testid="student-detail-not-found"
        className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center space-y-4"
      >
        <Icon name="person_off" className="text-[40px] text-secondary/70" />
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Alumno no encontrado
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            No pudimos encontrar el perfil solicitado.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-testid="student-detail-back-btn"
          onClick={() => navigate('/administrador/alumnos')}
          className="gap-2 cursor-pointer"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Volver a Alumnos</span>
        </Button>
      </section>
    );
  }

  const genderIcon = getGenderIcon(student.genero || student.sexo);

  return (
    <div data-testid="student-detail-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración • Alumnos
          </span>
          <h1
            data-testid="student-detail-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Detalle del alumno
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            data-testid="student-detail-back-btn"
            onClick={() => navigate('/administrador/alumnos')}
            className="gap-2 bg-surface-container-lowest cursor-pointer"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Volver a Alumnos</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            data-testid="student-detail-edit-btn"
            onClick={() =>
              navigate(
                `/administrador/alumnos/edit?studentId=${encodeURIComponent(student.id)}`
              )
            }
            className="gap-2 cursor-pointer"
          >
            <Icon name="edit" className="text-[18px]" />
            <span>Editar datos</span>
          </Button>
        </div>
      </section>

      <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-surface-container">
          <Avatar
            src={student.photoURL}
            alt={`Foto de perfil de ${student.nombreApellido}`}
            fallbackIcon={genderIcon}
            size="xl"
            testId="student-detail-avatar"
            className="border-2 border-outline-variant/40"
          />

          <div className="space-y-2">
            <h2
              data-testid="student-detail-name"
              className="font-headline-md text-headline-md text-primary font-semibold"
            >
              {student.nombreApellido}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={student.tienePaquete ? 'success' : 'neutral'}>
                {student.tienePaquete ? 'Con paquete activo' : 'Sin paquete'}
              </Badge>
              <Badge variant={student.inscriptoClases ? 'primary' : 'neutral'}>
                {student.inscriptoClases ? 'Inscripto a clases' : 'Sin inscripción'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailField
            icon="badge"
            label="Nombre"
            value={student.nombre}
            testId="student-detail-first-name"
          />
          <DetailField
            icon="badge"
            label="Apellido"
            value={student.apellido}
            testId="student-detail-last-name"
          />
          <DetailField
            icon="mail"
            label="Correo electrónico"
            value={student.email}
            testId="student-detail-email"
          />
          <DetailField
            icon="id_card"
            label="DNI"
            value={student.dni}
            testId="student-detail-dni"
          />
          <DetailField
            icon="call"
            label="Teléfono / WhatsApp"
            value={student.telefono}
            testId="student-detail-phone"
          />
          <DetailField
            icon="cake"
            label="Fecha de nacimiento"
            value={
              student.fechaNacimiento
                ? `${student.fechaNacimiento} (${student.edad} años)`
                : `${student.edad} años`
            }
            testId="student-detail-birthdate"
          />
          <DetailField
            icon={genderIcon}
            label="Género / Sexo"
            value={student.sexo}
            testId="student-detail-gender"
          />
          <DetailField
            icon="event_available"
            label="% de Asistencia"
            value={`${student.porcentajeAsistencia ?? 0}%`}
            testId="student-detail-attendance"
          />
        </div>
      </section>
    </div>
  );
}
