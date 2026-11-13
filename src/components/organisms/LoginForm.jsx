import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon';
import StudioBanner from '../molecules/StudioBanner';
import RoleSwitcherTabs from '../molecules/RoleSwitcherTabs';
import LoginFormHeader from '../molecules/LoginFormHeader';
import LoginCredentialsFields from '../molecules/LoginCredentialsFields';
import LoginFormActions from '../molecules/LoginFormActions';
import { useAuth } from '../../hooks/useAuth';

/**
 * LoginForm Organism
 * Implements the user login interface for Emuná Pilates.
 * Supports role switching (alumna / equipo), password visibility toggle,
 * Google OAuth entry, and direct navigation to registration.
 */
export default function LoginForm({ onSubmit, onGoogleLogin }) {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [role, setRole] = useState('alumna'); // 'alumna' | 'equipo'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Por favor ingresá tu correo electrónico o DNI.');
      return;
    }
    if (!password) {
      setError('Por favor ingresá tu contraseña.');
      return;
    }

    setLoading(true);
    if (onSubmit) {
      onSubmit({ role, identifier, password, rememberMe });
      setLoading(false);
      return;
    }

    try {
      const res = await loginWithEmail(identifier.trim(), password);
      const profile = res?.profile;

      // Staff users or Equipo logins always proceed directly to administrator dashboard
      if (role === 'equipo' || profile?.rol === 'staff' || profile?.rol === 'administradora') {
        navigate('/administrador/dashboard');
        return;
      }

      if (!profile || !profile.registroCompleto) {
        navigate('/register');
        return;
      }
      navigate('/customer');
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales inválidas. Verificá tu correo y contraseña.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError(err.message || 'Error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Para recuperar tu contraseña, comunicate con la administración de Emuná por WhatsApp o acercate a la recepción.');
  };

  const handleGoogleClick = async () => {
    if (onGoogleLogin) {
      onGoogleLogin();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      const profile = res?.profile;

      // If user does not have a complete registered account, redirect to /register
      if (!profile || !profile.registroCompleto) {
        navigate('/register');
        return;
      }

      const target = profile.rol === 'staff' || role === 'equipo' ? '/administrador/dashboard' : '/customer';
      navigate(target);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Error al autenticar con Google: ' + (err.message || 'Intentá nuevamente.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-surface-container-high/60">
      {/* Visual Side Banner Molecule */}
      <StudioBanner
        badgeText="Pilates Reformer Boutique"
        badgeIcon="spa"
        headline="Emuná Estudio"
        description="Conectá con tu cuerpo en un espacio sereno y exclusivo de 4 camas."
      />

      {/* Login Form Container */}
      <div className="w-full lg:w-7/12 p-space-lg sm:p-space-xl lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
        <div>
          <LoginFormHeader />

          {/* Role Switcher Tabs Molecule */}
          <RoleSwitcherTabs
            role={role}
            onSelectRole={(newRole) => {
              setRole(newRole);
              setError('');
            }}
          />

          {/* Error notification */}
          {error && (
            <div
              role="alert"
              data-testid="login-error-alert"
              className="mt-space-md p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2"
            >
              <Icon name="error" className="text-[18px] text-error shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="mt-space-lg space-y-space-md" onSubmit={handleSubmit} noValidate>
            <LoginCredentialsFields
              role={role}
              identifier={identifier}
              onIdentifierChange={setIdentifier}
              password={password}
              onPasswordChange={setPassword}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((prev) => !prev)}
              rememberMe={rememberMe}
              onRememberMeChange={setRememberMe}
              onForgotPassword={handleForgotPassword}
            />

            <LoginFormActions loading={loading} onGoogleClick={handleGoogleClick} />
          </form>
        </div>

        {/* Footer Navigation Link */}
        <div className="mt-space-lg pt-space-sm border-t border-surface-container text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            ¿Primera vez en Emuná?{' '}
            <Link
              to="/register"
              className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors inline-flex items-center gap-0.5 font-semibold ml-1"
            >
              <span>Registrate aquí</span>
              <Icon name="arrow_outward" className="text-[16px]" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
