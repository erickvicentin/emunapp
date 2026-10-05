import { useContext } from 'react';
import { AuthContext } from '../context/authContextInstance';

/**
 * useAuth Hook
 * Access current authenticated user, profile, role, and auth methods.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
