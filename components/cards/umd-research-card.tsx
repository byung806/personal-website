'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function UMDResearchCard() {
  return (
    <ProjectCard projectId="eeg-classification">
      <div className="relative w-full min-h-[300px] md:min-h-[360px] p-10 md:p-12 flex items-center justify-center">
        <div className="relative w-full max-w-[240px] rounded-xl ring-1 ring-black/5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
          <Image src="/umd_eeg_tsne.png" alt="Neural Systems Lab" width={240} height={240} className="w-full h-auto rounded-xl" priority />
        </div>
      </div>
    </ProjectCard>
  );
}
