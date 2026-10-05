import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * PackageCard Molecule
 * Displays a membership tier with pricing and features
 * @param {Object} props
 * @param {string} props.category - e.g. "Inicial / Mantenimiento"
 * @param {string} props.name - e.g. "4 Clases"
 * @param {string} props.frequency - e.g. "1 vez por semana"
 * @param {string} props.price - e.g. "$24.000"
 * @param {string[]} props.features - List of feature strings
 * @param {boolean} [props.isPopular=false] - Highlight popular tier
 * @param {string} [props.ctaText] - Button text
 * @param {Function} [props.onSelect] - Selection handler
 */
export default function PackageCard({
  category,
  name,
  frequency,
  price,
  features = [],
  isPopular = false,
  ctaText,
  onSelect,
}) {
  const defaultCta = isPopular ? `Reservar Membresía ${name}` : `Elegir Plan ${name}`;

  return (
    <div
      className={`p-space-lg rounded-2xl bg-surface-container-lowest flex flex-col justify-between relative transition-all duration-200 ${
        isPopular
          ? 'shadow-md border-2 border-secondary/40 lg:-translate-y-2'
          : 'shadow-sm border border-surface-container-high/60 hover:shadow-md'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-wider shadow-sm font-semibold">
          Más Elegido
        </div>
      )}

      <div>
        <span
          className={`font-label-sm text-label-sm uppercase tracking-wider block font-semibold ${
            isPopular ? 'text-secondary' : 'text-on-surface-variant'
          }`}
        >
          {category}
        </span>
        <h3 className="font-headline-md text-headline-md text-primary mt-1">
          {name}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          {frequency}
        </p>

        <div className="my-space-md flex items-baseline">
          <span className="font-headline-xl text-headline-xl text-primary font-bold">
            {price}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-medium">
            / mes
          </span>
        </div>

        <div className="space-y-2.5 pt-space-xs text-on-surface font-body-sm text-body-sm">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <Icon
                name="check"
                className="text-[18px] text-secondary mt-0.5 shrink-0"
              />
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-space-lg">
        <Button
          variant={isPopular ? 'primary' : 'light'}
          size="md"
          className="w-full text-center"
          onClick={onSelect}
          href={!onSelect ? '#contacto' : undefined}
          ariaLabel={`${ctaText || defaultCta} por ${price} mensuales`}
        >
          {ctaText || defaultCta}
        </Button>
      </div>
    </div>
  );
}
