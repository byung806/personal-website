'use client';

import { Pause, Play } from 'lucide-react';
import ProjectCard from '../project-card';
import { useVideoControls } from '@/lib/use-video-controls';

export default function ThreeDRendererCard() {
  const { videoRef, isPlaying, togglePlay } = useVideoControls();

  return (
    <ProjectCard projectId="3d-renderer">
      <div className="relative w-full aspect-square min-h-[200px] group/video">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
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
