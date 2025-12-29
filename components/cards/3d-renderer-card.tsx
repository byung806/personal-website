'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import ProjectCard from '../project-card';

export default function ThreeDRendererCard() {
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
      title="3D Wireframe Renderer"
      subtitle="LINEAR ALGEBRA"
      year="2025"
      tags={['Linear Algebra', 'Graphics Programming', 'Python']}
      projectUrl="/p/3d-renderer"
      bgColor="#1a1a1a"
    >
      <div className="relative w-full group/video">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block"
        >
          <source src="/p/3d-renderer/vid.mp4" type="video/mp4" />
        </video>

        {/* Play/Pause button - always visible on mobile, hover on desktop */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-md hover:bg-white z-10 md:opacity-0 md:group-hover/video:opacity-100 transition-opacity duration-200"
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
