import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/atoms/Icon';
import logo from '../assets/logo.jpeg';
import { useAuth } from '../hooks/useAuth';

/**
 * DashboardLayout
 * Layout for authenticated role panels (/customer, /administrator)
 */
export default function DashboardLayout({
  children,
  roleName = 'Cliente',
  roleBadge = 'customer',
  userName,
  userEmail,
  renderSidebar,
}) {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const footerRef = useRef(null);
  const openBtnRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerOpenChange = useCallback((nextOpen) => {
    setIsDrawerOpen(nextOpen);
    if (headerRef.current) headerRef.current.inert = nextOpen;
    if (mainRef.current) mainRef.current.inert = nextOpen;
    if (footerRef.current) footerRef.current.inert = nextOpen;
  }, []);

  const effectiveName = userName || userProfile?.nombre || user?.displayName || 'Usuario';
  const effectiveEmail = userEmail || userProfile?.email || user?.email || roleName;
  const effectiveBadge = userProfile?.rol || roleBadge;
  const photoURL = userProfile?.photoURL || user?.photoURL;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-secondary-fixed-variant">
      {/* Top Bar Navigation */}
      <header
        ref={headerRef}
        className="pt-3 pb-3 sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high/60 shadow-xs"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop h-18 flex items-center justify-between">
          {/* Mobile menu trigger + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {renderSidebar && (
              <button
                ref={openBtnRef}
                type="button"
                onClick={() => handleDrawerOpenChange(true)}
                aria-label="Abrir menú"
                aria-expanded={isDrawerOpen}
                aria-controls="admin-drawer"
                className="lg:hidden w-10 h-10 -ml-1 rounded-full inline-flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <Icon name="menu" className="text-[22px]" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logo}
                alt="Logo Emuná"
                className="h-10 w-10 rounded-full object-cover shadow-xs transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-[17px] font-semibold text-primary tracking-tight">
                  Emuná Pilates
                </span>
                <span className="font-label-sm text-[10px] uppercase text-secondary tracking-widest font-semibold">
                  Panel de Gestión
                </span>
              </div>
            </Link>
          </div>

          {/* User info & role badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider ${
                effectiveBadge === 'staff'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container-highest text-primary'
              }`}
            >
              <Icon
                name={effectiveBadge === 'staff' ? 'admin_panel_settings' : 'spa'}
                className="text-[14px]"
              />
              Rol: {effectiveBadge}
            </span>

            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-surface-container-high">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={effectiveName}
                  className="w-9 h-9 rounded-full object-cover shadow-xs border border-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
                  {effectiveName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md font-semibold text-primary leading-tight">
                  {effectiveName}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant leading-tight">
                  {effectiveEmail}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm ml-1 cursor-pointer"
            >
              <Icon name="logout" className="text-[16px]" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-6 md:py-8 flex gap-6 lg:gap-8 items-start">
        {renderSidebar?.({
          openBtnRef,
          isDrawerOpen,
          onDrawerOpenChange: handleDrawerOpenChange,
        })}
        <main ref={mainRef} className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="w-full py-4 text-center font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container-high/40"
      >
        © {new Date().getFullYear()} Emuná Estudio Pilates • Sistema de Gestión de 4 Camas Reformer
      </footer>
    </div>
  );
}
