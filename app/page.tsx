'use client';

import ProjectsGallery from '@/components/projects-gallery';
import { cards } from '@/content/cards';
import { useSnowfall } from '@/components/snowfall-provider';

export default function HomePage() {
  const { isSnowing } = useSnowfall();
  const bgColor = isSnowing ? 'bg-[#F2F8FB]' : 'bg-[#FBF7F1]';
  
  return (
    <div className={`${bgColor} transition-colors duration-500`}>
      {/* Spacer between hero and project gallery */}
      <div className="h-10 sm:h-14" />
      <ProjectsGallery cards={cards} />
    </div>
  );
}