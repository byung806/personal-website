'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function BoyScoutsCard() {
  return (
    <ProjectCard
      title="TroopWebHost Improvement Project"
      subtitle="DESKTOP APP"
      tags={['Python, Tkinter, BeautifulSoup', '100+ Users']}
      projectUrl="/p/troopwebhost"
      bgColor="#f6f6f6"
    >
      <div className="relative w-full min-h-[250px] p-8 flex items-center justify-center">
        <div className="relative w-full max-w-[280px]">
          <Image src="/boy-scouts-medium.png" alt="TroopWebHost Improvement Project" width={280} height={280} className="w-full h-auto" />
        </div>
      </div>
    </ProjectCard>
  );
}
