'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface CaseStudyVideoProps {
  src: string;
  caption?: string;
  aspectRatio?: 'vertical' | 'horizontal' | 'square' | 'auto';
  autoplay?: boolean;
  clickableUrl?: string;
}

export function CaseStudyVideo({ src, caption, aspectRatio = 'vertical', autoplay = false, clickableUrl }: CaseStudyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const aspectClasses = {
    vertical: 'aspect-[9/16]',
    horizontal: 'aspect-[16/9]',
    square: 'aspect-square',
    auto: '',
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    if (clickableUrl) {
      window.open(clickableUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const videoElement = (
    <div className={`relative w-full ${aspectClasses[aspectRatio]} bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden group/video`}>
      <video
        ref={videoRef}
        src={src}
        className={`w-full ${aspectRatio === 'auto' ? 'h-auto' : 'h-full object-cover'} ${clickableUrl ? 'cursor-pointer' : ''}`}
        playsInline
        preload="none"
        controls={!autoplay}
        autoPlay={autoplay}
        loop={autoplay}
        muted={autoplay}
        onClick={clickableUrl ? handleVideoClick : undefined}
      />
      {autoplay && (
        <button
          onClick={togglePlay}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-md hover:bg-white z-10"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-gray-900" />
          ) : (
            <Play className="w-4 h-4 text-gray-900" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="my-16">
      {videoElement}
      {caption && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
}
