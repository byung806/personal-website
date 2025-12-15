'use client';

import Image from 'next/image';
import { useSnowfall } from './snowfall-provider';

interface CaseStudySingleImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
}

export function CaseStudySingleImage({ src, alt, caption, aspectRatio = 'auto' }: CaseStudySingleImageProps) {
  const { isSnowing } = useSnowfall();
  const aspectClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-[16/9]',
    wide: 'aspect-[21/9]',
  };

  if (aspectRatio === 'auto') {
    return (
      <div className="my-16">
        <div className={`relative w-full bg-white rounded-lg border ${isSnowing ? 'border-[#A3D5FF]' : 'border-[#ffc080]'} overflow-hidden shadow-sm`}>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
        {caption && (
          <p className="text-sm text-black/60 mt-4 leading-relaxed">
            {caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="my-16">
      <div className={`relative w-full ${aspectClasses[aspectRatio]} bg-white rounded-lg border ${isSnowing ? 'border-[#A3D5FF]' : 'border-[#ffc080]'} overflow-hidden shadow-sm`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          loading="lazy"
        />
      </div>
      {caption && (
        <p className="text-sm text-black/60 mt-4 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
}
