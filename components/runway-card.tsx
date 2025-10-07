'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import HoverLink from './hover-link';

export default function RunwayCard() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open('https://runwaymobile.app', '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="h-full bg-[#ebccff] text-white relative overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Two images with absolute positioning.
      Both images are slightly tilted and Image 2 is slightly overlapping Image 1 */}
      <div className="absolute top-4 left-0 z-0 pointer-events-none">
        <Image src="/runway.png" alt="Runway" width={250} height={250} className="rotate-[-20deg]" />
      </div>
      <div className="absolute top-40 right-0 z-0 pointer-events-none">
        <Image src="/runway2.png" alt="Runway" width={250} height={250} className="rotate-[10deg] translate-x-[-10px]" />
      </div>

      <HoverLink 
        href="https://runwaymobile.app"
        icon={<ArrowUpRight className="w-5 h-5" />}
        text="Runway Mobile App"
        isHovered={isHovered}
        clickable={false}
      />
    </div>
  );
}
