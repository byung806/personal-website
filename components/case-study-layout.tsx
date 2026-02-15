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
  const logo = project?.logo;

  return (
    <div className="w-full">
      {/* Cover: image only, no overlay */}
      {coverImage && (
        <div className="relative w-full h-[50vh] md:h-[58vh] min-h-[320px] md:min-h-[440px] bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center p-6 md:p-10">
          <div className="relative w-full max-w-[260px] md:max-w-[380px] aspect-[9/19] rounded-2xl overflow-hidden">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 260px, 380px"
            />
          </div>
        </div>
      )}

      {/* Two-column: left = metadata, right = title + content */}
      <div className="px-5 sm:px-8 md:px-12 lg:px-16 py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,200px)_1fr] gap-12 lg:gap-20">
            <aside className="lg:sticky lg:top-24 lg:self-start order-2 lg:order-1">
              {logo && (
                <div className="relative w-14 h-14 mb-6">
                  <Image
                    src={logo}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
              )}
              <div className="space-y-6 text-sm">
                {year && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 mb-0.5">Year</p>
                    <p className="text-gray-700 dark:text-gray-300">{year}</p>
                  </div>
                )}
                {role && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 mb-0.5">Role</p>
                    <p className="text-gray-700 dark:text-gray-300">{role}</p>
                  </div>
                )}
                {team && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 mb-0.5">Team</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {project?.teamHighlight && team.startsWith(project.teamHighlight) ? (
                        <>
                          <span className="text-[#81cc3e] font-medium">{project.teamHighlight}</span>
                          {team.slice(project.teamHighlight.length).trimStart()}
                        </>
                      ) : (
                        team
                      )}
                    </p>
                  </div>
                )}
                {tools && tools.length > 0 && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 mb-0.5">Tools</p>
                    <p className="text-gray-700 dark:text-gray-300">{tools.join(', ')}</p>
                  </div>
                )}
              </div>
              {sidebarContent}
              {links && links.length > 0 && (
                <div className="mt-8 space-y-2">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </aside>

            <main className="min-w-0 order-1 lg:order-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{subtitle}</p>
              )}
              {tagline && (
                <p className="mt-5 md:mt-6 text-lg font-bold text-gray-500 dark:text-gray-400 leading-[1.55] max-w-[65ch]">
                  {tagline}
                </p>
              )}

              <div className="mt-12 md:mt-14">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
