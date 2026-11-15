import React, { useEffect, useState } from 'react';
import Icon from '../atoms/Icon';
import PackageCard from '../molecules/PackageCard';
import { PACKAGES_CATALOG, STUDIO_INFO } from '../../data/landingData';
import { fetchPublicPackages } from '../../services/packageService';

const SKELETON_CARD_IDS = ['sk-1', 'sk-2', 'sk-3', 'sk-4'];

/**
 * PricingSection Organism
 * Displays active membership packages from Firestore (with fallback to PACKAGES_CATALOG).
 */
export default function PricingSection() {
  const [packages, setPackages] = useState(PACKAGES_CATALOG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchPublicPackages()
      .then((list) => {
        if (active && Array.isArray(list) && list.length > 0) {
          setPackages(list);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSelectPackage = (pkg) => {
    const text = `Hola! Quiero consultar y reservar el paquete ${pkg.name} (${pkg.frequency}) en Emuná Pilates.`;
    const url = `https://wa.me/543704578354?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="tarifas"
      data-testid="landing-pricing-section"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-12 md:py-space-xl"
    >
      <div className="text-center max-w-xl mx-auto mb-10 md:mb-space-xl">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Membresías Flexibles
        </span>
        <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-primary tracking-tight mt-1">
          Planes mensuales con créditos libres
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
          Los créditos tienen validez de 30 días corridos desde la fecha de
          acreditación. Podés cancelar o reprogramar tus turnos con hasta{' '}
          <strong className="text-primary font-semibold">
            {STUDIO_INFO.cancelationWindowHours} horas
          </strong>{' '}
          de anticipación.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      {loading ? (
        <div
          data-testid="landing-pricing-skeleton"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-gutter-desktop"
        >
          {SKELETON_CARD_IDS.map((id) => (
            <div
              key={id}
              className="h-80 rounded-2xl bg-surface-container-low border border-surface-container-high/60 animate-pulse p-space-lg space-y-4"
            >
              <div className="h-3 w-24 rounded bg-surface-container-high" />
              <div className="h-6 w-36 rounded bg-surface-container-high" />
              <div className="h-10 w-28 rounded bg-surface-container-high mt-4" />
              <div className="h-3 w-full rounded bg-surface-container-high mt-6" />
              <div className="h-3 w-5/6 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid="landing-pricing-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-gutter-desktop items-stretch"
        >
          {packages.map((pkg) => (
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
      )}

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
          Consultar planes y horarios →
        </a>
      </div>
    </section>
  );
}
