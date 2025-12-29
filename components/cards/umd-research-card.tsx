'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function UMDResearchCard() {
  return (
    <ProjectCard projectId="eeg-classification">
      <div className="relative w-full min-h-[250px] p-8 flex items-center justify-center">
        <div className="relative w-full max-w-[240px]">
          <Image src="/umd_eeg_tsne.png" alt="Neural Systems Lab" width={240} height={240} className="w-full h-auto" priority />
        </div>
      </div>
    </ProjectCard>
  );
}
