import React from 'react';
import PillarCard from '../molecules/PillarCard';
import { METHODOLOGY_PILLARS } from '../../data/landingData';

/**
 * MethodologySection Organism
 * 4 Biomechanical Pillars Grid
 */
export default function MethodologySection() {
  return (
    <section id="metodologia" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-12 md:py-space-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-space-lg gap-space-sm">
        <div className="flex flex-col max-w-2xl">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Nuestra Esencia
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-primary tracking-tight mt-1">
            Pilates con precisión biomecánica y respeto por tu ritmo
          </h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Un método refinado donde la respiración y la máquina se integran para
          reeducar la columna y revitalizar la energía corporal.
        </p>
      </div>

      {/* 4 Key Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-gutter-desktop">
        {METHODOLOGY_PILLARS.map((pillar) => (
          <PillarCard key={pillar.numberLabel} {...pillar} />
        ))}
      </div>
    </section>
  );
}
