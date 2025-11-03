import Image from 'next/image';

interface CaseStudySingleImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
}

export function CaseStudySingleImage({ src, alt, caption, aspectRatio = 'auto' }: CaseStudySingleImageProps) {
  const aspectClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-[16/9]',
    wide: 'aspect-[21/9]',
  };

  if (aspectRatio === 'auto') {
    return (
      <div className="my-16">
        <div className="relative w-full bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="w-full h-auto"
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
