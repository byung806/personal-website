'use client';

import Image from 'next/image';
import ProjectCard from './project-card';

export default function RunwayCard() {
  return (
    <ProjectCard
      title="Runway Mobile"
      description="A mobile learning app that gives you a single bite-sized lesson a day."
      tags={['React Native', 'Firebase', 'Swift']}
      projectUrl="https://runwaymobile.app"
      codeUrl="https://github.com/byung806/runway"
      bgColor="#f2e8feff"
      borderColor="rgba(147, 51, 234, 0.2)"
      textColor="#7c3aed"
    >
      <div className="p-6 h-full">
        <div className="absolute top-4 left-4">
          <Image src="/runway.png" alt="Runway" width={180} height={180} className="rotate-[-10deg] opacity-90" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Image src="/runway2.png" alt="Runway" width={180} height={180} className="rotate-[5deg] opacity-90" />
        </div>
      </div>
    </ProjectCard>
  );
}
