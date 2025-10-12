'use client';

import HeroSection from '@/components/hero-section';
import BentoGrid from '@/components/bento-grid';
import { cards } from '@/content/cards';

// import ThemeToggle from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* <ThemeToggle /> */}
      <HeroSection />
      <BentoGrid cards={cards} />
    </main>
  );
}