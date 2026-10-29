'use client';

import ProjectsGallery from '@/components/projects-gallery';
import Snowfall from '@/components/snow/snowfall';
import { cards } from '@/content/cards';

export default function HomePage() {
  return (
    <main id="home" className="w-full">
      {/* The hover cards' images, fetched early so they show up instantly (homepage only) */}
      <link rel="preload" href="/p/runway/runway.png" as="image" />
      <link rel="preload" href="/p/eeg-classification/umd_eeg_tsne.png" as="image" />
      <ProjectsGallery cards={cards} />
      <Snowfall rootId="home" />
    </main>
  );
}
