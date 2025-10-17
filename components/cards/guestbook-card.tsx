'use client';

import ProjectCard from '../project-card';

export default function GuestbookCard() {
  return (
    <ProjectCard
      title="Guestbook"
      subtitle="INTERACTIVE"
      tags={['Next.js', 'Supabase']}
      projectUrl="/guestbook"
      bgColor="#f6f6f6"
    >
      {/* Placeholder for guestbook preview image */}
      <div className="relative w-full min-h-[250px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <span className="text-gray-400 dark:text-gray-600 text-sm">Guestbook Preview</span>
      </div>
    </ProjectCard>
  );
}
