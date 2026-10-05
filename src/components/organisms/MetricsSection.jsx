import React from 'react';
import { METRICS } from '../../data/landingData';

/**
 * MetricsSection Organism
 * Live studio metrics strip
 */
export default function MetricsSection() {
  return (
    <section className="w-full bg-surface-container-low py-space-md border-y border-surface-container-high/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-gutter">
        {METRICS.map((metric) => (
          <div
            key={metric.title}
            className="flex flex-col items-center md:items-start p-3 rounded-xl hover:bg-surface-container/40 transition-colors"
          >
            <span className="font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-primary font-bold tracking-tight">
              {metric.title}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left mt-0.5">
              {metric.description}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
