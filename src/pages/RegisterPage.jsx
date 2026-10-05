import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/organisms/RegisterForm';
import { useAuth } from '../hooks/useAuth';

/**
 * RegisterPage View
 * Path: /register
 * Renders user registration with standard and Google onboarding flows.
 * Redirects already fully registered users to their dashboard.
 */
export default function RegisterPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userProfile?.registroCompleto) {
      const target = userProfile.rol === 'staff' ? '/administrator' : '/customer';
      navigate(target, { replace: true });
    }
  }, [user, userProfile, loading, navigate]);

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
