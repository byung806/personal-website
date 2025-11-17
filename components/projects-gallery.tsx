'use client';

import { Card } from '@/content/cards';

interface ProjectsGalleryProps {
  cards: Card[];
}

export default function ProjectsGallery({ cards }: ProjectsGalleryProps) {
  return (
    <section id="projects" className="w-full min-h-screen px-4 sm:px-6 md:px-8 pb-8">
      <div className="w-full h-full max-w-[1800px] mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {cards.map((card) => {
            const CardComponent = card.component;
            return (
              <div
                key={card.id}
                className="break-inside-avoid mb-4"
              >
                <CardComponent />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
