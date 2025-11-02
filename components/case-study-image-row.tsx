import Image from 'next/image';

interface CaseStudyImageRowProps {
  images: {
    src: string;
    alt: string;
  }[];
  caption?: string;
}

export function CaseStudyImageRow({ images, caption }: CaseStudyImageRowProps) {
  return (
    <div className="my-16">
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-[9/19] bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
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
