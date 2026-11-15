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
 * StaffDetailSection Organism
 * Displays the staff member's profile photo (or gender-aware icon fallback)
 * and personal details.
 */
export default function StaffDetailSection({ staffMember }) {
  const navigate = useNavigate();

  if (!staffMember) {
    return (
      <section
        data-testid="staff-detail-not-found"
        className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-center space-y-4"
      >
        <Icon name="person_off" className="text-[40px] text-secondary/70" />
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Usuario staff no encontrado
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            No pudimos encontrar el perfil solicitado.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-testid="staff-detail-back-btn"
          onClick={() => navigate('/administrador/usuarios')}
          className="gap-2 cursor-pointer"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Volver a Usuarios</span>
        </Button>
      </section>
    );
  }

  const genderIcon = getGenderIcon(staffMember.genero || staffMember.sexo);
  const isActive = staffMember.active !== false;

  return (
    <div data-testid="staff-detail-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Módulo de Administración • Usuarios (staff)
          </span>
          <h1
            data-testid="staff-detail-title"
            className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
          >
            Detalle del usuario staff
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            data-testid="staff-detail-back-btn"
            onClick={() => navigate('/administrador/usuarios')}
            className="gap-2 bg-surface-container-lowest cursor-pointer"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Volver a Usuarios</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            data-testid="staff-detail-edit-btn"
            onClick={() =>
              navigate(
                `/administrador/usuarios/edit?userId=${encodeURIComponent(staffMember.id)}`
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
            src={staffMember.photoURL}
            alt={staffMember.nombreApellido}
            fallbackIcon={genderIcon}
            size="lg"
            testId="staff-detail-avatar"
          />
          <div className="space-y-1.5">
            <h2
              data-testid="staff-detail-name"
              className="font-headline-md text-headline-md text-primary font-semibold"
            >
              {staffMember.nombreApellido}
            </h2>
            <p
              data-testid="staff-detail-email"
              className="font-body-md text-body-md text-on-surface-variant"
            >
              {staffMember.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">Rol: Staff</Badge>
              <Badge variant={isActive ? 'success' : 'neutral'}>
                {isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailField
            icon="badge"
            label="DNI"
            value={staffMember.dni}
            testId="staff-detail-dni"
          />
          <DetailField
            icon="call"
            label="Teléfono / WhatsApp"
            value={staffMember.telefono}
            testId="staff-detail-telefono"
          />
          <DetailField
            icon="cake"
            label="Fecha de nacimiento"
            value={staffMember.fechaNacimiento}
            testId="staff-detail-birthdate"
          />
          <DetailField
            icon="event"
            label="Edad"
            value={staffMember.edad !== '-' ? `${staffMember.edad} años` : 'No informada'}
            testId="staff-detail-age"
          />
          <DetailField
            icon={genderIcon}
            label="Sexo"
            value={staffMember.sexo}
            testId="staff-detail-gender"
          />
          <DetailField
            icon="shield_person"
            label="Estado de cuenta"
            value={isActive ? 'Activo' : 'Inactivo'}
            testId="staff-detail-status"
          />
        </div>
      </section>
    </div>
  );
}
