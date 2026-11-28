import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/molecules/ProtectedRoute';
import PageLoader from './components/molecules/PageLoader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ForcePasswordChangePage = lazy(() => import('./pages/ForcePasswordChangePage'));
const AuthActionPage = lazy(() => import('./pages/AuthActionPage'));
const CustomerPage = lazy(() => import('./pages/CustomerPage'));
const AdministratorPage = lazy(() => import('./pages/AdministratorPage'));

/**
 * Root Application Component
 * Configures AuthProvider, public routes, and ProtectedRoute guards
 * for /customer and /administrator with route-level code splitting.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/cambiar-contrasena" element={<ForcePasswordChangePage />} />
          <Route path="/auth/action" element={<AuthActionPage />} />
          <Route path="/reset-password" element={<AuthActionPage />} />
          <Route
            path="/customer"
            element={<Navigate to="/customer/turnos" replace />}
          />
          <Route
            path="/customer/:section"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administrador"
            element={<Navigate to="/administrador/dashboard" replace />}
          />
          <Route
            path="/administrador/:section"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdministratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administrador/:section/:action"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdministratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administrator/*"
            element={<Navigate to="/administrador/dashboard" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
