import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * Header Organism
 * Sticky navigation with responsive mobile menu
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Metodología', href: '#metodologia' },
    { label: 'Tarifas y Horarios', href: '#tarifas' },
    { label: 'Grilla de Turnos', href: '#horarios' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(44,36,34,0.04)] border-b border-surface-container-high/40">
      <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a href="#inicio" className="flex items-center gap-space-md group">
          <img
            alt="Logo Emuná Estudio Pilates"
            className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VPLdHB_3ZhBQplBiA9DPpO7X7y2IGsuEpx1i3O2n1B5tWAVC9llF9bo_ML4MSFhh_6vXX5lEFp8E7gr3mFuR4cbZ9U9myPIsEiqhWZSufWwAovEca4BulDJyxiYHNY5Rblbf9CXhK-gGVSXm0JSD_UvEwDiPa7AAJvMk2q9TsezfhGN0KQjzdMPlMi_vKFk5fGWxCrB0z-23TGtzw2VEAYGMDlPxnTW08xR4WD57vxOxBaLJ6ODiV8mvYRdTOdtqWwE-Z53mZI4w"
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-semibold">
              EMUNÁ
            </span>
            <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest font-semibold">
              Estudio Pilates
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-space-xl"
          aria-label="Navegación principal"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-secondary hover:after:w-full after:transition-[width] after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3 sm:gap-space-md">
          <Button
            href="#contacto"
            variant="primary"
            size="md"
            className="hidden sm:inline-flex text-xs md:text-sm py-2 px-4 md:px-5"
          >
            Iniciar Sesión / Reservar
          </Button>

          <a
            href="#contacto"
            aria-label="Perfil y cuenta de alumno"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary-container transition-colors shadow-xs"
          >
            <Icon name="person" className="text-on-primary text-[19px]" />
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-primary hover:bg-surface-container transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="text-[24px]" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface/98 backdrop-blur-2xl border-b border-surface-container-high px-6 py-6 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-label-lg text-lg text-on-surface hover:text-secondary py-1 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-surface-container-high flex flex-col gap-3">
              <Button
                href="#contacto"
                variant="primary"
                size="lg"
                className="w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar Sesión / Reservar Turno
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
