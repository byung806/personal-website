'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function RunwayCard() {
  return (
    <ProjectCard
      title="Runway"
      subtitle="MOBILE APP"
      tags={['React Native, Firebase, Swift', '1k+ Users']}
      projectUrl="/p/runway"
      bgColor="#f6f6f6"
    >
      <div className="relative w-full min-h-[400px] p-8 flex items-center justify-center">
        <div className="relative w-full max-w-[200px]">
          <Image src="/runway.png" alt="Runway" width={200} height={200} className="w-full h-auto" />
        </div>
      </div>
    </ProjectCard>
  );
}
