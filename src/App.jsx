import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForcePasswordChangePage from './pages/ForcePasswordChangePage';
import AuthActionPage from './pages/AuthActionPage';
import CustomerPage from './pages/CustomerPage';
import AdministratorPage from './pages/AdministratorPage';
import ProtectedRoute from './components/molecules/ProtectedRoute';

/**
 * Root Application Component
 * Configures AuthProvider, public routes, and ProtectedRoute guards
 * for /customer and /administrator.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
