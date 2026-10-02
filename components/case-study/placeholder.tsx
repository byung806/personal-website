interface CaseStudyPlaceholderProps {
  /** What screenshot/asset belongs here. */
  label: string;
  caption?: string;
  aspectRatio?: 'video' | 'phone' | 'wide';
}

/** Dashed stand-in for a screenshot or diagram that hasn't been added yet. */
export function CaseStudyPlaceholder({ label, caption, aspectRatio = 'video' }: CaseStudyPlaceholderProps) {
  const aspectClasses = {
    video: 'aspect-[16/9]',
    phone: 'aspect-[9/16] max-w-[320px] mx-auto',
    wide: 'aspect-[21/9]',
  };

  return (
    <div className="my-20 md:my-24">
      <div className={`w-full ${aspectClasses[aspectRatio]} rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] flex items-center justify-center p-6`}>
        <p className="text-sm font-mono text-gray-400 dark:text-gray-500 text-center">[ {label} ]</p>
      </div>
      {caption && (
        <p className="text-sm text-[rgb(90,96,112)] dark:text-gray-500 mt-5 leading-relaxed w-full">
          {caption}
        </p>
      )}
    </div>
  );
}
