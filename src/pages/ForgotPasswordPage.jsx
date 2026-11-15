import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import ForgotPasswordForm from '../components/organisms/ForgotPasswordForm';

/**
 * ForgotPasswordPage View
 * Path: /recuperar-contrasena
 * Allows users to request a password reset link by email.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
