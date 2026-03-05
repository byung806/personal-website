import Image from 'next/image';

interface CaseStudyImageRowProps {
  images: {
    src: string;
    alt: string;
  }[];
  caption?: string;
  columns?: 2 | 3;
  aspectRatio?: 'phone' | 'square' | 'auto';
}

export function CaseStudyImageRow({ images, caption, columns = 3, aspectRatio = 'phone' }: CaseStudyImageRowProps) {
  const colsClass = columns === 2 ? 'grid-cols-2' : 'grid-cols-3';
  
  const gapClass = 'gap-6';
  const cardClass = 'relative bg-gray-100 dark:bg-[#111] rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-none';

  if (aspectRatio === 'auto') {
    return (
      <div className="my-20 md:my-24">
        <div className={`grid ${colsClass} ${gapClass}`}>
          {images.map((image, index) => (
            <div key={index} className={cardClass}>
              <Image
                src={image.src}
                alt={image.alt}
                width={900}
                height={600}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        {caption && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-5 leading-relaxed w-full">
            {caption}
          </p>
        )}
      </div>
    );
  }

  const aspectClasses = {
    phone: 'aspect-[9/19]',
    square: 'aspect-square',
    auto: '',
  };

  return (
    <div className="my-20 md:my-24">
      <div className={`grid ${colsClass} ${gapClass}`}>
        {images.map((image, index) => (
          <div key={index} className={`relative ${aspectClasses[aspectRatio]} ${cardClass}`}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {caption && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-5 leading-relaxed w-full">
          {caption}
        </p>
      )}
    </div>
  );
}
