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
  const CardWrapper = hasLink ? 'a' : 'div';
  const linkProps = hasLink ? {
    href: projectUrl,
    ...(isExternalLink && {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  } : {};

  const content = (
    <>
      {/* Image Card */}
      <div className={`relative overflow-hidden rounded-lg ${hasLink ? 'transition-transform duration-200 group-hover:scale-[0.98]' : ''}`} style={{ backgroundColor: bgColor }}>
        {/* Image content */}
        <div className="relative">
          {children}
        </div>

        {/* Tech chips - only visible on desktop hover */}
        {tags.length > 0 && (
          <div className="hidden md:flex absolute bottom-4 left-4 flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 text-xs font-mono font-medium rounded-sm bg-white text-gray-900">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Title/subtitle below card */}
      <div className={`mt-2 px-1 ${hasLink ? 'group-hover:opacity-70 transition-opacity' : ''}`}>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">{subtitle}</p>
        )}
      </div>
    </>
  );

  if (hasLink) {
    return (
      <a {...linkProps} className="w-full group block">
        {content}
      </a>
    );
  }

  return (
    <div className="w-full group">
      {content}
    </div>
  );
}
