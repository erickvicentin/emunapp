import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
          <Route
            path="/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administrator"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdministratorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
