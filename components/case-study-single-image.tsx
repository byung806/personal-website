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

  const wrapperClass = 'relative w-full bg-gray-100 dark:bg-[#111] rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-none';

  if (aspectRatio === 'auto') {
    return (
      <div className="my-20 md:my-24">
        <div className={wrapperClass}>
          <Image
            src={src}
            alt={alt}
            width={1400}
            height={900}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
        {caption && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-5 leading-relaxed w-full">
            {caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="my-20 md:my-24">
      <div className={`${wrapperClass} ${aspectClasses[aspectRatio]}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          loading="lazy"
        />
      </div>
      {caption && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-5 leading-relaxed w-full">
          {caption}
        </p>
      )}
    </div>
  );
}
