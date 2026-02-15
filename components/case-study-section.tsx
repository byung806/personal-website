interface CaseStudySectionProps {
  title?: string;
  children?: React.ReactNode;
}

export function CaseStudySection({ title, children }: CaseStudySectionProps) {
  return (
    <section className="mb-14 md:mb-16">
      {title && (
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-5 md:mb-6">
          {title}
        </h2>
      )}
      <div className="space-y-5 text-gray-600 dark:text-gray-400 leading-[1.65] text-base md:text-lg max-w-[65ch]">
        {children}
      </div>
    </section>
  );
}

export function CaseStudyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base md:text-lg leading-[1.65] text-gray-700 dark:text-gray-300 max-w-[65ch]">
      {children}
    </p>
  );
}

/** Inline highlight (#ebffd7 marker style). */
export function CaseStudyHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 py-0.5 rounded-[3px] text-gray-900 dark:text-gray-100 bg-[#ebffd7] dark:bg-[#ebffd7]/80">
      {children}
    </span>
  );
}

