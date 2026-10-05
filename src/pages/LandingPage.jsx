import React from 'react';
import MainLayout from '../layouts/MainLayout';
import HeroSection from '../components/organisms/HeroSection';
import MetricsSection from '../components/organisms/MetricsSection';
import MethodologySection from '../components/organisms/MethodologySection';
import StudioExperienceSection from '../components/organisms/StudioExperienceSection';
import PricingSection from '../components/organisms/PricingSection';
import ScheduleSection from '../components/organisms/ScheduleSection';
import LocationSection from '../components/organisms/LocationSection';

/**
 * LandingPage View
 * Assembles all organisms in the Atomic Design hierarchy according to CONTEXT.md
 */
export default function LandingPage() {
  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        <HeroSection />
        <MetricsSection />
        <MethodologySection />
        <StudioExperienceSection />
        <PricingSection />
        <ScheduleSection />
        <LocationSection />
      </div>
    </MainLayout>
  );
}
