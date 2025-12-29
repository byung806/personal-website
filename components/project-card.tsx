'use client';

interface ProjectCardProps {
  title: string;
  subtitle?: string;
  year?: string;
  tags: string[];
  projectUrl?: string;
  bgColor: string;
  borderColor?: string;
  children?: React.ReactNode;
}

export default function ProjectCard({
  title,
  subtitle,
  year,
  tags,
  projectUrl,
  bgColor,
  borderColor,
  children,
}: ProjectCardProps) {
  const hasLink = !!projectUrl;
  const isExternalLink = projectUrl?.startsWith('http');
  const linkProps = hasLink ? {
    href: projectUrl,
    ...(isExternalLink && {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  } : {};

  // Convert light bg to dark bg
  const darkBgColor = bgColor === '#f6f6f6' ? '#1A1A1A' : bgColor;

  const effectiveBg = bgColor === '#f6f6f6' ? '#f1f1f1' : bgColor;

  const metadataLabel = year || subtitle;

  const content = (
    <>
      {/* Image Card - outer container maintains layout */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Inner wrapper that scales */}
        <div
          className={`relative rounded-xl overflow-hidden transition-transform duration-500 will-change-transform ${hasLink ? 'group-hover:scale-[0.985]' : 'group-active:scale-[0.985]'}`}
          style={{
            backgroundColor: effectiveBg,
            ...(borderColor && { border: `1px solid ${borderColor}` }),
          }}
        >
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity"
            style={{ backgroundColor: darkBgColor }}
          />
          {/* Dark mode border - using box-shadow to avoid layout shift */}
          <div className="absolute inset-0 rounded-xl opacity-0 dark:opacity-100 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px #2A2A2A' }} />
          {/* Image content */}
          <div className="relative">
            {children}
          </div>

          {/* Title/subtitle chip - hover reveal, flat neutral background */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-3 py-2 font-sans text-sm rounded-lg bg-white/70 dark:bg-black/45 text-gray-900 dark:text-gray-100 md:opacity-0 md:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out backdrop-blur-md shadow-[0_0_16px_rgba(0,0,0,0.08)]">
              {metadataLabel && (
                <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-none whitespace-nowrap">
                  {metadataLabel}
                </span>
              )}
              <span className="text-sm text-black dark:text-gray-50 leading-none whitespace-nowrap">
                {title}
              </span>
            </span>
          </div>

          {/* Tech chips pinned in-card, hover reveal to match title treatment */}
          {/* {tags.length > 0 && (
            <div className="flex absolute bottom-3 right-3 flex-wrap justify-end gap-2 pointer-events-none opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3.5 py-1.5 text-[11px] font-sans font-medium tracking-tight rounded-md bg-white/70 dark:bg-black/45 text-gray-800 dark:text-gray-100 leading-none whitespace-nowrap shadow-[0_0_12px_rgba(0,0,0,0.06)]">
                  {tag}
                </span>
              ))}
            </div>
          )} */}
        </div>
      </div>
    </>
  );

  if (hasLink) {
    return (
      <a {...linkProps} className="w-full group block cursor-pointer">
        {content}
      </a>
    );
  }

  return (
    <div className="w-full group cursor-not-allowed">
      {content}
    </div>
  );
}
