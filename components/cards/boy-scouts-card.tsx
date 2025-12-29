'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function BoyScoutsCard() {
  return (
    <ProjectCard projectId="troopwebhost">
      <div className="relative w-full min-h-[250px] md:min-h-[320px] p-8 md:p-10 flex items-center justify-center">
        <div className="relative w-full max-w-[280px] md:max-w-[360px]">
          <Image src="/boy-scouts-medium.png" alt="TroopWebHost Improvement Project" width={360} height={360} className="w-full h-auto" />
        </div>
      </div>
    </ProjectCard>
  );
}
