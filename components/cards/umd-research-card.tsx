'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function UMDResearchCard() {
  return (
    <ProjectCard
      title="Neural Systems Lab"
      subtitle="RESEARCH PROJECT"
      tags={['Python', 'NumPy', 'Pandas']}
      projectUrl="https://github.com/byung806/EEG-Classification"
      bgColor="#f6f6f6"
    >
      <div className="relative w-full min-h-[250px] p-8 flex items-center justify-center">
        <div className="relative w-full max-w-[240px]">
          <Image src="/umd_eeg_tsne.png" alt="Neural Systems Lab" width={240} height={240} className="w-full h-auto" />
        </div>
      </div>
    </ProjectCard>
  );
}
