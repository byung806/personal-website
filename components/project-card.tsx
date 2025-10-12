'use client';

import { ArrowUpRight, Github } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description?: string;
  tags: string[];
  projectUrl?: string;
  codeUrl?: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  children?: React.ReactNode;
}

export default function ProjectCard({
  title,
  description,
  tags,
  projectUrl,
  codeUrl,
  bgColor,
  borderColor,
  textColor,
  children,
}: ProjectCardProps) {
  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor }}>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

        {/* Tech stack */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-white/60 backdrop-blur-sm text-gray-900">
                {tag}
              </span>
            ))}
          </div>
        )}

        {description && (
          <p className="text-sm text-gray-700 leading-snug">{description}</p>
        )}
      </div>

      {/* Content area (images, etc) */}
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>

      {/* Footer */}
      <div className="border-t flex" style={{ borderColor }}>
        {projectUrl && codeUrl ? (
          <>
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-6 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: textColor }}
            >
              <span>View project</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <div className="w-px bg-current opacity-20" style={{ color: borderColor }}></div>
            <a
              href={codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-6 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: textColor }}
            >
              <Github className="w-4 h-4" />
              <span>View code</span>
            </a>
          </>
        ) : projectUrl ? (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-6 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: textColor }}
          >
            <span>View project</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        ) : codeUrl ? (
          <a
            href={codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-6 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: textColor }}
          >
            <Github className="w-4 h-4" />
            <span>View code</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
