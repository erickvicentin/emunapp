/**
 * Resolves the authenticated user's destination path and display first name
 * for public-facing navigation CTAs.
 */
export function resolveAuthenticatedCta(user, userProfile) {
  if (!user) {
    return {
      isAuthenticated: false,
      targetPath: '/login',
      firstName: '',
    };
  }

  let targetPath = '/register';
  if (userProfile?.rol === 'staff' || userProfile?.rol === 'administradora') {
    targetPath = '/administrador/dashboard';
  } else if (userProfile?.registroCompleto) {
    targetPath = '/customer';
  }

  const rawName =
    userProfile?.nombre?.trim() ||
    user.displayName?.trim().split(/\s+/)[0] ||
    user.email?.split('@')[0] ||
    '';

  return {
    isAuthenticated: true,
    targetPath,
    firstName: rawName,
  };
}
