interface CaseStudyVideoProps {
  src: string;
  caption?: string;
  aspectRatio?: 'vertical' | 'horizontal' | 'square';
}

export function CaseStudyVideo({ src, caption, aspectRatio = 'vertical' }: CaseStudyVideoProps) {
  const aspectClasses = {
    vertical: 'aspect-[9/16]',
    horizontal: 'aspect-[16/9]',
    square: 'aspect-square',
  };

  return (
    <div className="my-16">
      <div className={`relative w-full ${aspectClasses[aspectRatio]} bg-gray-100 dark:bg-[#111] rounded-lg overflow-hidden`}>
        <video
          src={src}
          controls
          className="w-full h-full object-cover"
          playsInline
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
