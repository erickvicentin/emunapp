import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../atoms/Icon';

/**
 * RegisterSuccessCard Molecule
 * Confirmation screen shown when student registration completes
 */
export default function RegisterSuccessCard({ nombre }) {
  return (
    <div className="py-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-secondary-container/60 text-secondary mx-auto flex items-center justify-center">
        <Icon name="check_circle" className="text-[36px]" />
      </div>
      <h3 className="font-headline-md text-headline-md text-primary font-semibold">
        ¡Bienvenida a Emuná Pilates, {nombre}!
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
        Tu registro fue completado exitosamente como alumna (rol: customer). Ya podés ingresar a tu panel para autogestionar tus turnos y créditos de clases.
      </p>
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-md transition-colors shadow-md hover:shadow-lg"
        >
          <span>Ir a mi Espacio de Alumna</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 py-3 px-6 rounded-full border border-outline-variant hover:bg-surface-container text-on-surface font-label-md transition-colors"
        >
          <span>Iniciar Sesión</span>
        </Link>
      </div>
    </div>
  );
}
