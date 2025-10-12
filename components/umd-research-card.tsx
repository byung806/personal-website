'use client';

import Image from 'next/image';
import ProjectCard from './project-card';

export default function UMDResearchCard() {
  return (
    <ProjectCard
      title="EEG Research"
      description="Using wavelets and ML to explain & improve dementia diagnosis from brain signals."
      tags={['Python', 'NumPy', 'Pandas']}
      codeUrl="https://github.com/byung806/EEG-Classification"
      bgColor="#d4a574"
      borderColor="rgba(120, 53, 15, 0.2)"
      textColor="#78350f"
    >
      <div className="p-6 h-full">
        <div className="absolute top-2 left-2 w-32 h-32 opacity-80">
          <Image src="/umd_eeg.png" alt="EEG Data" width={128} height={128} />
        </div>
        <div className="absolute top-12 right-2 w-28 h-28 opacity-70">
          <Image src="/umd_eeg_tsne.png" alt="t-SNE" width={112} height={112} />
        </div>
        <div className="absolute bottom-2 left-8 w-36 h-36 opacity-60">
          <Image src="/umd_eeg_graph.png" alt="Graph" width={144} height={144} />
        </div>
      </div>
    </ProjectCard>
  );
}