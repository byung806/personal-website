'use client';

import Image from 'next/image';
import ProjectCard from './project-card';

export default function FirstLightCard() {
  return (
    <ProjectCard
      title="First Light"
      description="Apple Swift Student Challenge Winner — teaching firework chemistry through 3D."
      tags={['Swift', 'SceneKit', 'Physics']}
      bgColor="#ffd6e8"
      borderColor="rgba(236, 72, 153, 0.2)"
      textColor="#be185d"
    >
      <div className="p-6 h-full flex items-center justify-center gap-4">
        <div className="relative w-32 h-32 opacity-90">
          <Image src="/first-light-1.png" alt="First Light 1" width={128} height={128} className="rounded-lg shadow-md" />
        </div>
        <div className="relative w-32 h-32 opacity-90">
          <Image src="/first-light-2.png" alt="First Light 2" width={128} height={128} className="rounded-lg shadow-md" />
        </div>
        <div className="relative w-32 h-32 opacity-90">
          <Image src="/first-light-3.png" alt="First Light 3" width={128} height={128} className="rounded-lg shadow-md" />
        </div>
      </div>
    </ProjectCard>
  );
}
