import React from 'react';
import Icon from '../atoms/Icon';
import PackageCard from '../molecules/PackageCard';
import { PACKAGES_CATALOG, STUDIO_INFO } from '../../data/landingData';

/**
 * PricingSection Organism
 * Mobile membership packages conforming to CONTEXT.md rules (30-day mobile validity & 2h cancelation window)
 */
export default function PricingSection() {
  const handleSelectPackage = (pkg) => {
    const text = `Hola! Quiero consultar y reservar la membresía de ${pkg.name} (${pkg.frequency}) en Emuná Pilates.`;
    const url = `https://wa.me/543704578354?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="tarifas" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-12 md:py-space-xl">
      <div className="text-center max-w-xl mx-auto mb-10 md:mb-space-xl">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Membresías Flexibles
        </span>
        <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-primary tracking-tight mt-1">
          Planes mensuales con vigencia móvil
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
          Los créditos tienen validez de 30 días corridos a partir de la
          primera clase realizada. Podés reprogramar tus turnos con hasta{' '}
          <strong className="text-primary font-semibold">
            {STUDIO_INFO.cancelationWindowHours} horas
          </strong>{' '}
          de anticipación.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-gutter-desktop items-stretch">
        {PACKAGES_CATALOG.map((pkg) => (
          <PackageCard
            key={pkg.id}
            category={pkg.category}
            name={pkg.name}
            frequency={pkg.frequency}
            price={pkg.price}
            features={pkg.features}
            isPopular={pkg.isPopular}
            onSelect={() => handleSelectPackage(pkg)}
          />
        ))}
      </div>

      {/* Note on Payment and Terms */}
      <div className="mt-8 md:mt-space-lg p-space-md rounded-2xl bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm border border-surface-container-highest">
        <div className="flex items-center gap-2.5">
          <Icon name="info" className="text-secondary text-[20px] shrink-0" />
          <span>
            Aceptamos transferencias bancarias, tarjetas de débito/crédito y
            Mercado Pago sin recargo.
          </span>
        </div>
        <a
          className="font-label-sm text-label-sm text-secondary hover:text-secondary/80 font-semibold hover:underline shrink-0"
          href={STUDIO_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar planes trimestrales con 15% OFF →
        </a>
      </div>
    </section>
  );
}
