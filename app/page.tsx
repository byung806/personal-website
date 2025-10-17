'use client';

import HeroSection from '@/components/hero-section';
import ProjectsGallery from '@/components/projects-gallery';
import { cards } from '@/content/cards';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F0F]">
      <HeroSection />
      <ProjectsGallery cards={cards} />
    </main>
  );
}