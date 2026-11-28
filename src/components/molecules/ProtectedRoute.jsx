import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLoader from './PageLoader';

/**
 * ProtectedRoute Molecule
 * Protects private routes (/customer, /administrator) from unauthenticated access.
 * Handles loading state, missing session, missing registration, and role authorization.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  // Not logged in or account deactivated -> redirect to /login
  if (!user || userProfile?.active === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in with Google or Auth, but has not completed mandatory customer registration
  if (!userProfile?.registroCompleto && userProfile?.rol !== 'staff' && userProfile?.rol !== 'administradora') {
    return <Navigate to="/register" replace />;
  }

  // Force password change on first login or after admin password reset
  if (userProfile?.requiereCambioPassword && location.pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  // Role authorization
  if (requiredRole) {
    const isStaffUser = userProfile?.rol === 'staff' || userProfile?.rol === 'administradora';

    // Staff cannot access customer-only routes (/customer) -> send to /administrador
    if (requiredRole === 'customer' && isStaffUser) {
      return <Navigate to="/administrador/dashboard" replace />;
    }

    // Non-staff users cannot access staff routes (/administrator) -> send to /customer
    if (requiredRole === 'staff' && !isStaffUser) {
      return <Navigate to="/customer" replace />;
    }
  }

  return children;
}
