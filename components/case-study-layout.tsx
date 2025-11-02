import Image from 'next/image';
import { ProjectMetadata } from '@/content/projects';
import { ReactNode } from 'react';

interface CaseStudyLayoutProps {
  project?: ProjectMetadata;
  title?: string;
  subtitle?: string;
  tagline?: string;
  sidebarContent?: ReactNode;
  children: React.ReactNode;
}

export default function CaseStudyLayout({
  project,
  title: titleProp,
  subtitle: subtitleProp,
  tagline: taglineProp,
  sidebarContent,
  children,
}: CaseStudyLayoutProps) {
  const title = titleProp || project?.title || '';
  const subtitle = subtitleProp || project?.subtitle || '';
  const tagline = taglineProp || project?.tagline || '';
  const coverImage = project?.coverImage;
  const year = project?.year;
  const role = project?.role;
  const team = project?.team;
  const tools = project?.tools;
  const links = project?.links;

  return (
    <div className="w-full">
      {/* Cover Section - Only show if coverImage exists */}
      {coverImage && (
        <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[350px] md:min-h-[500px] bg-gray-200 dark:bg-[#1A1A1A] flex items-center justify-center p-4 md:p-8">
          <div className="relative w-full max-w-[250px] md:max-w-[400px] aspect-[9/19]">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left Column - Sticky Info Panel */}
            <aside className="lg:w-[30%] lg:sticky lg:top-24 lg:self-start">
              {/* Project Title */}
              <div className="mb-12">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                <p className="text-[11px] font-mono text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium">{subtitle}</p>
              </div>

              {/* Custom Sidebar Content */}
              {sidebarContent}

              {/* Links */}
              {links && links.length > 0 && (
                <div className="space-y-2">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label} →
                    </a>
                  ))}
                </div>
              )}
            </aside>

            {/* Right Column - Scrolling Content */}
            <main className="lg:w-[70%]">
              {/* Tagline */}
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-8 leading-tight">
                {tagline}
              </h2>

              {/* Meta info - Only show if any meta fields exist */}
              {(year || role || team || tools) && (
                <div className="flex flex-wrap gap-6 text-sm mb-16 pb-8 border-b border-gray-200 dark:border-gray-800">
                  {year && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Timeline</p>
                      <p className="text-gray-700 dark:text-gray-300">{year}</p>
                    </div>
                  )}
                  {role && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Role</p>
                      <p className="text-gray-700 dark:text-gray-300">{role}</p>
                    </div>
                  )}
                  {team && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Team</p>
                      <p className="text-gray-700 dark:text-gray-300">{team}</p>
                    </div>
                  )}
                  {tools && tools.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">Tools</p>
                      <p className="text-gray-700 dark:text-gray-300">{tools.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
