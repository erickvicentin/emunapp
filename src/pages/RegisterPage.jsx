import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/organisms/RegisterForm';

/**
 * RegisterPage View
 * Path: /register
 * Renders user registration with standard and Google onboarding flows.
 */
export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
