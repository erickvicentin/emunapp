import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/atoms/Icon';
import Button from '../components/atoms/Button';

/**
 * CustomerPage View
 * Path: /customer
 * Workspace for users with role="customer" (alumnas)
 */
export default function CustomerPage() {
  return (
    <DashboardLayout
      roleName="Alumna"
      roleBadge="customer"
      userName="Lucía González"
      userEmail="lucia.alumna@gmail.com"
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Espacio Alumna • Emuná Pilates
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
              ¡Hola, Lucía!
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Tenés turnos disponibles para reservar en las 4 camas reformer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => alert('Próximamente: Selección de turno en el calendario interactivo.')}
              className="cursor-pointer"
            >
              <Icon name="add_circle" className="text-[18px] mr-2" />
              <span>Reservar Turno</span>
            </Button>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Saldo de Clases */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Saldo de Clases
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary-container/60 text-secondary flex items-center justify-center">
                <Icon name="confirmation_number" className="text-[18px]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-primary">6 / 8</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                Créditos disponibles en tu paquete móvil.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Vencimiento: 28 Oct 2026</span>
              <span className="text-secondary font-semibold">Activo</span>
            </div>
          </div>

          {/* Card 2: Próximo Turno */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Próxima Clase Confirmada
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container text-primary flex items-center justify-center">
                <Icon name="calendar_month" className="text-[18px]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl font-bold text-primary">Miércoles • 18:00 hs</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                Cama 2 • Instructora Carolina
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
              <span className="text-secondary font-medium flex items-center gap-1">
                <Icon name="schedule" className="text-[14px]" />
                Cancela con 2h de anticipación
              </span>
            </div>
          </div>

          {/* Card 3: Asistencias del Mes */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Asistencias este Mes
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container text-secondary flex items-center justify-center">
                <Icon name="self_improvement" className="text-[18px]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-primary">4 asistencias</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                Constancia postural y bienestar integral.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs text-on-surface-variant">
              <span>0 clases perdidas</span>
              <span className="text-primary font-semibold">100% Presente</span>
            </div>
          </div>
        </section>

        {/* Studio Policy Reminder */}
        <section className="p-4 rounded-xl bg-surface-container border border-surface-container-highest flex items-start gap-3">
          <Icon name="info" className="text-secondary text-[20px] shrink-0 mt-0.5" />
          <div className="text-body-sm text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface font-semibold">Política de cupos y cancelación:</strong>{' '}
            Las clases tienen cupo estricto de 4 camas para garantizar corrección personalizada. Podés cancelar o reprogramar con hasta 2 horas de anticipación sin perder el crédito de tu paquete.
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
