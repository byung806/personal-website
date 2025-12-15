'use client';

import { Card } from '@/content/cards';
import { useSnowfall } from './snowfall-provider';

interface ProjectsGalleryProps {
  cards: Card[];
}

export default function ProjectsGallery({ cards }: ProjectsGalleryProps) {
  const { isSnowing } = useSnowfall();
  const bgColor = isSnowing ? 'bg-[#F2F8FB]' : 'bg-[#FBF7F1]';
  
  return (
    <section id="projects" className={`w-full min-h-screen pb-8 pt-6 ${bgColor} transition-colors duration-500`}>
      <div className="w-full h-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8">
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
