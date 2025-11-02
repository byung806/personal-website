import Image from 'next/image';

interface CaseStudySectionProps {
  title?: string;
  children?: React.ReactNode;
}

export function CaseStudySection({ title, children }: CaseStudySectionProps) {
  return (
    <section className="mb-20">
      {title && (
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
      )}
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
        {children}
      </div>
    </section>
  );
}

interface CaseStudyImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
}

export function CaseStudyImage({ src, alt, caption, aspectRatio = 'video' }: CaseStudyImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-[16/9]',
    wide: 'aspect-[21/9]',
    tall: 'aspect-[9/16]',
  };

  return (
    <figure className="my-16">
      <div className={`relative w-full ${aspectClasses[aspectRatio]} bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-500 dark:text-gray-500 mt-4 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function CaseStudyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
      {children}
    </p>
  );
}
