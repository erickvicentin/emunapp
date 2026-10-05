import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/organisms/LoginForm';
import { useAuth } from '../hooks/useAuth';

/**
 * LoginPage View
 * Path: /login
 * Renders the login card with authentication options.
 * Redirects already authenticated users with complete profile to their dashboard.
 */
export default function LoginPage() {
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
      <LoginForm />
    </AuthLayout>
  );
}
