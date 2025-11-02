'use client';

import ProjectsGallery from '@/components/projects-gallery';
import { cards } from '@/content/cards';

export default function HomePage() {
  return (
    <ProjectsGallery cards={cards} />
  );
}