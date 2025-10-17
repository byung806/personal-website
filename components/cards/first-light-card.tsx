'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import ProjectCard from '../project-card';

export default function FirstLightCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <ProjectCard
      title="First Light"
      subtitle="SWIFT PLAYGROUND"
      tags={['Swift', 'SceneKit', 'Physics']}
      bgColor="#f6f6f6"
    >
      <div className="relative w-full group/video">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto"
        >
          <source src="/first-light-fireworks.mp4" type="video/mp4" />
        </video>

        {/* Play/Pause button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-md opacity-0 group-hover/video:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-gray-900" />
          ) : (
            <Play className="w-4 h-4 text-gray-900" />
          )}
        </button>
      </div>
    </ProjectCard>
  );
}
