import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { STUDIO_INFO } from '../../data/landingData';

/**
 * LocationSection Organism
 * Studio physical address, working hours, and map visual card
 */
export default function LocationSection() {
  return (
    <section id="contacto" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop py-12 md:py-space-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter-desktop items-center">
        {/* Left Column: Contact details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Ubicación Estratégica
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-primary tracking-tight mt-1 mb-space-sm">
              En el corazón residencial de Resistencia
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
              Un punto calmo y accesible a minutos del centro cívico, con veredas
              anchas y seguridad para tu llegada en cualquier horario del día.
            </p>

            <div className="space-y-5">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
                  <Icon name="pin_drop" className="text-[22px]" />
                </div>
                <div>
                  <span className="font-label-md text-label-md text-primary block font-semibold">
                    Dirección
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {STUDIO_INFO.address}
                  </span>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
                  <Icon name="alarm" className="text-[22px]" />
                </div>
                <div>
                  <span className="font-label-md text-label-md text-primary block font-semibold">
                    Horarios de Práctica
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant leading-snug">
                    {STUDIO_INFO.hours.weekdays}
                    <br />
                    {STUDIO_INFO.hours.saturday}
                  </span>
                </div>
              </div>

              {/* Administrative support */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
                  <Icon name="chat" className="text-[22px]" />
                </div>
                <div>
                  <span className="font-label-md text-label-md text-primary block font-semibold">
                    Atención Administrativa
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    WhatsApp: {STUDIO_INFO.phone} • Respuesta en el día
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-space-xs">
            <Button
              href={STUDIO_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <span>Iniciar Consulta por WhatsApp</span>
              <Icon name="open_in_new" className="text-[18px] ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Column: Static Map integration card */}
        <div className="lg:col-span-7">
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden shadow-sm bg-surface-container border border-surface-container-high">
            <div
              className="w-full h-full bg-cover bg-center"
              role="img"
              aria-label="Mapa de ubicación en Fray Luis Beltrán 245, Resistencia, Chaco"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlSHzMNn9EalVl-iX8qiVZ4An5TyFj6HNLKaG1pKO-UM2sa0Fgjg0A7f8zjZMhgZHc0KQi-1fl5mnXauVrIzQbm0INRLpoylex-OMCjsErdibELV7N17suCzgnoCPaJwcOBx5TBoDLcqti96_BVAqmJQOTeCDYxaUnY3hV3g3fePcgE6IqCIOeMBmREmki7NzivNM8o3gp2lhTpEVVi5Xk0NOstvFluaQfjV1Kr9jTJggafwXJ0fHy')",
              }}
            />

            {/* Map Overlay Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto p-4 rounded-xl bg-surface/95 backdrop-blur-md shadow-md border border-white/60 sm:max-w-xs">
              <span className="font-label-sm text-label-sm uppercase text-secondary font-bold block">
                Estudio Emuná
              </span>
              <span className="font-body-sm text-body-sm text-primary font-semibold mt-0.5 block">
                Fray Luis Beltrán 245
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                {STUDIO_INFO.addressReference}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
