'use client';

import { projects } from '@/content/projects';

interface ProjectCardProps {
  projectId: string;
  children?: React.ReactNode;
}

export default function ProjectCard({
  projectId,
  children,
}: ProjectCardProps) {
  const meta = projects[projectId];
  const metadataLabel = meta?.year || meta?.subtitle;
  const title = meta?.title || '';
  const tags = [...(meta?.tools || []), ...(meta?.special || [])];
  const specialTags = meta?.special || [];
  const bgColor = meta?.bgColor || '#ffffff';
  const borderColor = meta?.borderColor;
  const baseBorderThickness = meta?.borderThickness || 1;
  const isVeryWhite = bgColor === '#ffffff' || bgColor === '#f6f6f6' || bgColor === '#f1f1f1';
  const borderThickness = borderColor && isVeryWhite ? Math.max(baseBorderThickness, 3) : baseBorderThickness;
  const projectUrl = `/p/${projectId}`;

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

  // Use dark text on frosted glass when card background is light (so text is readable). Per-project override optional.
  const tagTextDark = meta?.tagTextDark ?? isVeryWhite;

  const glassPillClass = tagTextDark
    ? 'bg-white/15 backdrop-blur-md border border-black/10 text-gray-900 shadow-[0_2px_12px_rgba(0,0,0,0.12)]'
    : 'bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-[0_2px_12px_rgba(0,0,0,0.2)]';
  const revealClass = 'md:opacity-0 md:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out';

  const content = (
    <>
      {/* Single rounded container scales as a whole so corners stay consistent on hover */}
      <div
        className={`relative overflow-hidden rounded-xl transition-transform duration-500 will-change-transform ${hasLink ? 'group-hover:scale-[0.985]' : 'group-active:scale-[0.985]'}`}
        style={{
          backgroundColor: effectiveBg,
          ...(borderColor && { border: `${borderThickness}px solid ${borderColor}` }),
        }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity"
            style={{ backgroundColor: darkBgColor }}
          />
          {/* Dark mode border - using box-shadow to avoid layout shift */}
          <div className="absolute inset-0 rounded-xl opacity-0 dark:opacity-100 pointer-events-none" style={{ boxShadow: `inset 0 0 0 ${borderThickness}px #2A2A2A` }} />
          {/* Image content */}
          <div className="relative">
            {children}
          </div>

          {/* Title/subtitle chip - hover reveal, pill tags (liquid glass + year pill); text color from card bg */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2.5 pointer-events-none">
            <span className={`inline-flex items-center gap-2.5 px-3.5 py-2 font-sans text-sm rounded-full ${glassPillClass} ${revealClass}`}>
              {metadataLabel && (
                <span className="inline-flex items-center rounded-full bg-stone-600/90 backdrop-blur-sm px-2.5 py-1 text-sm font-medium text-white leading-none whitespace-nowrap border border-white/5">
                  {metadataLabel}
                </span>
              )}
              <span className="text-sm leading-none whitespace-nowrap [color:inherit]">
                {title}
              </span>
            </span>
            {specialTags.length > 0 && specialTags.map((tag) => (
              <span key={tag} className={`inline-flex items-center px-3.5 py-2 font-sans text-sm rounded-full ${glassPillClass} ${revealClass}`}>
                <span className="text-sm leading-none whitespace-nowrap [color:inherit]">
                  {tag}
                </span>
              </span>
            ))}
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
