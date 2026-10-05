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
        Tu registro fue completado exitosamente. Ya podés iniciar sesión para autogestionar tus reservas y consultar tus créditos de clases.
      </p>
      <div className="pt-4 flex justify-center gap-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 py-3 px-8 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg transition-colors shadow-md hover:shadow-lg"
        >
          <span>Ir al Inicio de Sesión</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </Link>
      </div>
    </div>
  );
}
