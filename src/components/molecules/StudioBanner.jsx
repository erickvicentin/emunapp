import React from 'react';
import Icon from '../atoms/Icon';
import logo from '../../assets/logo.jpeg';
import salonImg from '../../assets/salon.png';

/**
 * StudioBanner Molecule
 * Left-side visual column for Auth pages (Login / Register)
 */
export default function StudioBanner({
  badgeText = 'Pilates Reformer Boutique',
  badgeIcon = 'spa',
  headline = 'Emuná Estudio',
  description = 'Conectá con tu cuerpo en un espacio sereno y exclusivo de 4 camas.',
}) {
  return (
    <div className="relative w-full lg:w-5/12 min-h-[300px] sm:min-h-[380px] lg:min-h-[640px] bg-surface-container-low flex flex-col items-center justify-between p-space-lg lg:p-space-xl overflow-hidden">
      {/* Background Decorative Graphic */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${salonImg})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/80 to-transparent pointer-events-none" />

      {/* Top Tag */}
      <div className="relative z-10 w-full flex items-center justify-start">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-xs text-secondary font-label-sm text-label-sm font-semibold tracking-wider uppercase shadow-xs">
          <Icon name={badgeIcon} className="text-[14px]" />
          {badgeText}
        </span>
      </div>

      {/* Center Logo Showcase */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-[280px] w-full p-space-md text-center">
        <div className="w-50 h-50 sm:w-50 sm:h-50 rounded-full p-1 bg-surface-container-lowest/90 shadow-md mb-4 flex items-center justify-center overflow-hidden">
          <img
            src={logo}
            alt="Emuná Estudio Pilates"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-[220px]">
          {description}
        </p>
      </div>

      {/* Bottom Feature Badges */}
      <div className="relative z-10 w-full hidden sm:flex items-center justify-around pt-space-sm border-t border-surface-container-highest/60 text-center font-label-sm text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1">
          <Icon name="check_circle" className="text-[14px] text-secondary" />
          Cupo de 4 camas
        </span>
        <span className="flex items-center gap-1">
          <Icon name="schedule" className="text-[14px] text-secondary" />
          Cancela con 2h
        </span>
      </div>
    </div>
  );
}
