import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../atoms/Icon';

/**
 * ProtectedRoute Molecule
 * Protects private routes (/customer, /administrator) from unauthenticated access.
 * Handles loading state, missing session, missing registration, and role authorization.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4">
        <div className="w-12 h-12 rounded-full border-3 border-secondary/30 border-t-secondary animate-spin" />
        <p className="mt-4 font-body-md text-on-surface-variant flex items-center gap-2">
          <Icon name="spa" className="text-secondary text-[18px]" />
          <span>Cargando tu espacio en Emuná...</span>
        </p>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in with Google or Auth, but has not completed mandatory customer registration
  if (!userProfile?.registroCompleto && userProfile?.rol !== 'staff' && userProfile?.rol !== 'administradora') {
    return <Navigate to="/register" replace />;
  }

  // Role authorization
  if (requiredRole) {
    const isStaffUser = userProfile?.rol === 'staff' || userProfile?.rol === 'administradora';

    // Staff cannot access customer-only routes (/customer) -> send to /administrator
    if (requiredRole === 'customer' && isStaffUser) {
      return <Navigate to="/administrator" replace />;
    }

    // Non-staff users cannot access staff routes (/administrator) -> send to /customer
    if (requiredRole === 'staff' && !isStaffUser) {
      return <Navigate to="/customer" replace />;
    }
  }

  return children;
}
