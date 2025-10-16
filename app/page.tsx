'use client';

import HeroSection from '@/components/hero-section';
import ProjectsGallery from '@/components/projects-gallery';
import { cards } from '@/content/cards';

// import ThemeToggle from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* <ThemeToggle /> */}
      <HeroSection />
      <ProjectsGallery cards={cards} />
    </main>
  );
}