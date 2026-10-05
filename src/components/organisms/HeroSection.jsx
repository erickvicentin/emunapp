import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import salon from '../../assets/salon.png'

/**
 * HeroSection Organism
 * Main value proposition, high-impact studio visuals, social proof, and primary CTAs
 */
export default function HeroSection() {
  return (
    <div id="inicio" className="relative w-full overflow-hidden">
      {/* Top Ambient Warm Glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-8 md:py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter-desktop items-center">
          {/* Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start gap-space-md">

            {/* Main Headline */}
            <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-headline-xl text-primary tracking-tight leading-tight">
              Pilates Reformer personalizado en grupos de hasta 4 personas
            </h1>

            {/* Subtitle */}
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
              Entrená tu cuerpo, conectá tu mente con atención cuidada en cada
              postura y camillas de madera noble en un espacio luminoso de calma
              absoluta.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-space-xs w-full sm:w-auto">
              <Button
                href="#contacto"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <span>Iniciar Sesión / Reservar Turno</span>
                <Icon name="calendar_today" className="text-[18px] ml-2" />
              </Button>
              <Button
                href="#tarifas"
                variant="light"
                size="lg"
                className="w-full sm:w-auto"
              >
                <span>Ver Tarifas y Horarios</span>
                <Icon name="expand_more" className="text-[18px] ml-2" />
              </Button>
            </div>
          </div>

          {/* Visual Hero Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden bg-surface-container shadow-md border border-surface-container-highest/60 group">
              <img
                className="w-full h-[380px] sm:h-[460px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                alt="Estudio boutique de Pilates Reformer con 4 camillas de madera de guatambú y ventanales luminosos"
                src={salon}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent pointer-events-none" />

              {/* Overlaid Feature Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md text-primary font-label-sm text-label-sm shadow-sm border border-white/40">
                  <Icon name="self_improvement" className="text-[15px] text-secondary" />
                  Atención postural personalizada
                </span>
              </div>

              {/* Bottom Location Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-surface/92 backdrop-blur flex items-center justify-between shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                    <Icon name="location_on" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-white font-semibold">
                      Sede Beltrán 245
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-white">
                      Resistencia, Chaco • Acceso y Estacionamiento
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center font-label-sm text-label-sm text-secondary uppercase text-white font-semibold">
                  Estudio Abierto
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
