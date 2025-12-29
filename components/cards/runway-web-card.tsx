'use client';

import { Pause, Play } from 'lucide-react';
import ProjectCard from '../project-card';
import { useVideoControls } from '@/lib/use-video-controls';

export default function RunwayWebCard() {
  const { videoRef, isPlaying, togglePlay } = useVideoControls();

  return (
    <ProjectCard projectId="runway-web">
      <div className="relative w-full group/video">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto"
        >
          <source src="/runway-web.mp4" type="video/mp4" />
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
