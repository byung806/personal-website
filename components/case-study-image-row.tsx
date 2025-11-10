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
  
  if (aspectRatio === 'auto') {
    return (
      <div className="my-16">
        <div className={`grid ${colsClass} gap-4`}>
          {images.map((image, index) => (
            <div key={index} className="relative bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                width={800}
                height={600}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        {caption && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
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
    <div className="my-16">
      <div className={`grid ${colsClass} gap-4`}>
        {images.map((image, index) => (
          <div key={index} className={`relative ${aspectClasses[aspectRatio]} bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden`}>
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
}
