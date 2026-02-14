'use client';

import ProjectsGallery from '@/components/projects-gallery';
import { cards } from '@/content/cards';

export default function HomePage() {
  return (
    <main className="w-full">
      <ProjectsGallery cards={cards} />
    </main>
  );
}
