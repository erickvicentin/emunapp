import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import PasswordResetActionForm from '../components/organisms/PasswordResetActionForm';

/**
 * AuthActionPage View
 * Path: /auth/action (and /reset-password)
 * Custom Firebase Auth action handler for password activation, reset, and email verification.
 */
export default function AuthActionPage() {
  return (
    <AuthLayout>
      <PasswordResetActionForm />
    </AuthLayout>
  );
}
