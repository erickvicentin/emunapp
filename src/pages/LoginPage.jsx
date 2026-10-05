import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/organisms/LoginForm';

/**
 * LoginPage View
 * Path: /login
 * Renders the login card with authentication options.
 */
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
