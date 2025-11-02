'use client';

import { Card } from '@/content/cards';

interface ProjectsGalleryProps {
  cards: Card[];
}

export default function ProjectsGallery({ cards }: ProjectsGalleryProps) {
  return (
    <section id="projects" className="w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-12 -mt-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
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
