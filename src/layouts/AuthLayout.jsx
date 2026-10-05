import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/atoms/Icon';
import logo from '../assets/logo.jpeg';

/**
 * AuthLayout
 * Layout shell for authentication pages (/login, /register)
 * Matches the layout tokens and structure specified in CONTEXT.md
 */
export default function AuthLayout({ children }) {
  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-secondary-fixed-variant">
      {/* Top Bar Navigation */}
      <header className="w-full py-space-lg">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md group"
          >
            <Icon
              name="arrow_back"
              className="text-[18px] transition-transform group-hover:-translate-x-0.5"
            />
            <span>Volver al inicio</span>
          </Link>

          <Link to="/" className="flex items-center gap-space-sm group">
            <img
              alt="Logo Emuná Estudio Pilates"
              className="h-8 w-auto object-contain rounded-full shadow-xs transition-transform group-hover:scale-105"
              src={logo}
            />
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight hidden sm:inline-block">
              Emuná Estudio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <Icon name="pin_drop" className="text-[16px] text-secondary" />
            <span>Fray Luis Beltrán 245, Resistencia</span>
          </div>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-space-md sm:py-space-xl px-margin">
        <div className="flex flex-col w-full max-w-[1200px] mx-auto py-space-sm lg:py-space-md">
          {children}

          {/* Bottom link to main site */}
          <div className="w-full flex items-center justify-center mt-space-md">
            <Link
              to="/"
              className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors py-1.5 px-space-md rounded-full bg-surface-container/60 hover:bg-surface-container"
            >
              <Icon name="west" className="text-[16px]" />
              <span>Volver al sitio principal</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-space-md text-center font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container/40">
        © {new Date().getFullYear()} Emuná Estudio Pilates • Movimiento Consciente
      </footer>
    </div>
  );
}
