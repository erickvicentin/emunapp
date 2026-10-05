import React from 'react';
import Icon from '../atoms/Icon';

/**
 * StudioExperienceSection Organism
 * Highlights premium guatambú reformers, hygiene standards, and physical amenities
 */
export default function StudioExperienceSection() {
  return (
    <section className="w-full bg-surface-container-high py-12 md:py-space-xl border-y border-surface-container-highest/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter-desktop items-center">
        {/* Left Column: Text & Verification points */}
        <div className="lg:col-span-5 flex flex-col gap-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Equipamiento & Espacio
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-primary tracking-tight">
            Camillas Reformer en madera maciza de guatambú
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Cada estación cuenta con accesorios completos: caja de salto (box),
            tabla de salto, bandas elásticas de calibración y aros de pilates
            importados.
          </p>

          <div className="space-y-4 pt-space-xs">
            <div className="flex items-start gap-3">
              <Icon
                name="verified"
                className="text-secondary text-[22px] mt-0.5 shrink-0"
              />
              <div>
                <span className="font-label-md text-label-md text-primary font-semibold block">
                  Sanitización entre cada sesión
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Tapizados higienizados con fórmulas orgánicas hipoalergénicas.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon
                name="verified"
                className="text-secondary text-[22px] mt-0.5 shrink-0"
              />
              <div>
                <span className="font-label-md text-label-md text-primary font-semibold block">
                  Seguimiento individualizado en ficha clínica
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Registramos lesiones previas, embarazos o patologías de
                  columna.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual 2x2 split cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="space-y-space-md">
            <div className="rounded-2xl overflow-hidden shadow-sm bg-surface border border-surface-container-highest/60 group">
              <img
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                alt="Detalle artesanal de los resortes y correas de cuero de las camillas de pilates"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJXOIJsSqaqYExVsXuC4lW2v8icoAQ49egReU3vZ5C0zV0Y4oxANQSpCISyHCYuf1vGq0s540ieQ9NuAw81-J87jbtims-Uh3S_IWm2F-o1iZxfwJAfuwSWxKv-S1EmseQepUzqN3bTcUozDqlC60FlgvVqVAJ8Vcx4PpXanewLmtx8Z2VI-3HWhdJJXtOgRBQhCicVuY45jxDf1xcKA6L_Fm-u5aNuDRj7Vt0KzvkU8cSb_8CK37l"
              />
            </div>
          </div>

          <div className="space-y-space-md sm:pt-space-lg">
            <div className="rounded-2xl overflow-hidden shadow-sm bg-surface border border-surface-container-highest/60 group">
              <img
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                alt="Instructora asistiendo suavemente a una alumna en la alineación de columna sobre la camilla reformer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5JJyuvIFg9y7aBfpPwsOPNfpIHHECXE6h2D7HnPqj5YoyX8iioEW369xtF9bmyW8_uFwMt2txkQ7NpbZ9rikGkioTYa-ypsD4xMlZbzJoKZCpwqf_ncaeRWG4OReZ0QdKXtYpFr-MwgEOOAQhGNny9y684-WLO81gAvuTHXVbcJfXctJydcq3GwFRq0bj_l9y4ilkEgSoWj7G9fjEaT66JanWMaYCwZZ0GikBsfLtgCiDSOCk27-S"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
