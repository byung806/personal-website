'use client';

import { Brain } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import HoverLink from './hover-link';

export default function UMDResearchCard() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    // Since href is "#", we'll just prevent the default action for now
    // You can replace this with the actual URL when available
    console.log('UMD Research clicked');
  };

  return (
    <div 
      className="h-full bg-white relative overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* EEG Images positioned creatively */}
      <div className="absolute top-2 left-2 w-40 h-40 opacity-90">
        <Image src="/umd_eeg.png" alt="EEG Data" width={160} height={160} />
      </div>
      <div className="absolute top-16 right-2 w-36 h-36 opacity-80">
        <Image src="/umd_eeg_tsne.png" alt="t-SNE Visualization" width={144} height={144} />
      </div>
      <div className="absolute bottom-8 left-6 w-44 h-44 opacity-70">
        <Image src="/umd_eeg_graph.png" alt="EEG Graph" width={176} height={176} />
      </div>

      <HoverLink 
        href="https://github.com/byung806/EEG-Classification"
        icon={<Brain className="w-5 h-5" />}
        text="EEG Research"
        isHovered={isHovered}
        clickable={false}
      />
    </div>
  );
}