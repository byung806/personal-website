'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function RunwayCard() {
  return (
    <ProjectCard
      title="Runway"
      subtitle="MOBILE APP"
      year="2024"
      tags={['React Native, Firebase, Swift', '1k+ Users']}
      projectUrl="/p/runway"
      bgColor="#32193d"
    >
      <div className="relative w-full min-h-[400px] md:min-h-[500px] p-8 md:p-12 flex items-center justify-center">
        <div className="relative w-full max-w-[200px] md:max-w-[220px]">
          <Image src="/runway.png" alt="Runway" width={280} height={280} className="w-full h-auto" priority />
        </div>
      </div>
    </ProjectCard>
  );
}
