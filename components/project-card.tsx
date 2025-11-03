'use client';

interface ProjectCardProps {
  title: string;
  subtitle?: string;
  tags: string[];
  projectUrl?: string;
  bgColor: string;
  children?: React.ReactNode;
}

export default function ProjectCard({
  title,
  subtitle,
  tags,
  projectUrl,
  bgColor,
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

  const content = (
    <>
      {/* Image Card - outer container maintains layout */}
      <div className="relative overflow-hidden rounded-lg">
        {/* Inner wrapper that scales */}
        <div
          className={`relative transition-transform duration-200 will-change-transform ${hasLink ? 'group-hover:scale-[0.96]' : 'group-active:scale-[0.96]'}`}
          style={{
            backgroundColor: bgColor,
          }}
        >
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity"
            style={{ backgroundColor: darkBgColor }}
          />
          {/* Dark mode border - using box-shadow to avoid layout shift */}
          <div className="absolute inset-0 rounded-lg opacity-0 dark:opacity-100 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px #2A2A2A' }} />
          {/* Image content */}
          <div className="relative">
            {children}
          </div>

          {/* Tech chips - always visible on mobile, hover on desktop */}
          {tags.length > 0 && (
            <div className="flex md:opacity-0 md:group-hover:opacity-100 absolute bottom-3 left-3 flex-wrap gap-2 transition-opacity duration-200 pointer-events-none">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs font-sans font-light rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title/subtitle below card */}
      <div className={`mt-2 px-1 ${hasLink ? 'group-hover:opacity-70 transition-opacity' : ''}`}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && (
          <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider font-medium">{subtitle}</p>
        )}
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
