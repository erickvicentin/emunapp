import React from 'react';
import Icon from '../atoms/Icon';
import { STUDIO_INFO } from '../../data/landingData';
import logo from '../../assets/logo.jpeg'

/**
 * Footer Organism
 * Studio branding, address, legal policies, and direct contact avenues
 */
export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface-variant border-t border-surface-container-high/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-12 md:py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-gutter-desktop mb-10 md:mb-space-xl">
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-md text-headline-md text-primary font-bold">
                Emuná
              </span>
              <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest font-semibold">
                Estudio Pilates
              </span>
            </div>
            <p className="font-body-md text-body-md max-w-sm text-on-surface-variant leading-relaxed">
              Un santuario de movimiento consciente, alineación y bienestar
              integral en Resistencia. Redescubrí tu fuerza desde la calma y la
              precisión.
            </p>
          </div>

          {/* Connect & Socials Col */}
          <div className="md:col-span-3 flex flex-col gap-space-xs">
            <span className="font-label-lg text-label-lg text-primary uppercase tracking-wider mb-space-xs font-semibold">
              Conectá
            </span>
            <a
              className="font-body-md text-body-md hover:text-primary transition-colors flex items-center gap-space-xs"
              href={STUDIO_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="call" className="text-[18px] text-secondary shrink-0" />
              <span>{STUDIO_INFO.phone}</span>
            </a>
            <a
              className="font-body-md text-body-md hover:text-primary transition-colors flex items-center gap-space-xs mt-1"
              href={`mailto:${STUDIO_INFO.email}`}
            >
              <Icon name="mail" className="text-[18px] text-secondary shrink-0" />
              <span>{STUDIO_INFO.email}</span>
            </a>
            <a
              className="font-body-md text-body-md hover:text-primary transition-colors flex items-center gap-space-xs mt-1"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                name="photo_camera"
                className="text-[18px] text-secondary shrink-0"
              />
              <span>{STUDIO_INFO.instagram}</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal / Policies Bar */}
        <div className="pt-6 border-t border-surface-container-high flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant font-body-sm text-body-sm">
          <p>© {new Date().getFullYear()} Emuná Estudio Pilates. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 flex-wrap">
            <a href="#tarifas" className="hover:text-primary transition-colors">
              Términos y Condiciones
            </a>
            <a href="#tarifas" className="hover:text-primary transition-colors">
              Políticas de Cancelación (2 hs)
            </a>
            <a href="#inicio" className="hover:text-primary transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
