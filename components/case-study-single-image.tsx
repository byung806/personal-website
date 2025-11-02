import Image from 'next/image';

interface CaseStudySingleImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
}

export function CaseStudySingleImage({ src, alt, caption, aspectRatio = 'auto' }: CaseStudySingleImageProps) {
  const aspectClasses = {
    auto: 'aspect-auto',
    square: 'aspect-square',
    video: 'aspect-[16/9]',
    wide: 'aspect-[21/9]',
  };

  return (
    <div className="my-16">
      <div className={`relative w-full ${aspectClasses[aspectRatio]} bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
        />
      </div>
      {caption && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
}
