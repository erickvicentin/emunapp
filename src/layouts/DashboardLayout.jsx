import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/atoms/Icon';
import logo from '../assets/logo.jpeg';

/**
 * DashboardLayout
 * Layout for authenticated role panels (/customer, /administrator)
 */
export default function DashboardLayout({
  children,
  roleName = 'Cliente',
  roleBadge = 'customer',
  userName = 'Usuario',
  userEmail = '',
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-secondary-fixed-variant">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high/60 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop h-18 flex items-center justify-between">
          {/* Brand */}
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

          {/* User info & role badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider ${
                roleBadge === 'staff'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container-highest text-primary'
              }`}
            >
              <Icon
                name={roleBadge === 'staff' ? 'admin_panel_settings' : 'spa'}
                className="text-[14px]"
              />
              Rol: {roleBadge}
            </span>

            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-surface-container-high">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md font-semibold text-primary leading-tight">
                  {userName}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant leading-tight">
                  {userEmail || roleName}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <Link
              to="/login"
              aria-label="Cerrar sesión"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm ml-1"
            >
              <Icon name="logout" className="text-[16px]" />
              <span className="hidden sm:inline">Salir</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container-high/40">
        © {new Date().getFullYear()} Emuná Estudio Pilates • Sistema de Gestión de 4 Camas Reformer
      </footer>
    </div>
  );
}
