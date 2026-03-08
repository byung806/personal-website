import Image from 'next/image';
import { ProjectMetadata } from '@/content/projects';
import { ReactNode } from 'react';

function MetadataPanel({ logo, year, role, team, tools, links, project, sidebarContent, cols = 2 }: {
  logo?: string; year?: string; role?: string; team?: string; tools?: string[];
  links?: { label: string; url: string }[]; project?: ProjectMetadata; sidebarContent?: ReactNode;
  cols?: 1 | 2;
}) {
  const gridClass = cols === 1 ? 'grid-cols-1' : 'grid-cols-2';
  return (
    <>
      {logo && cols === 1 && (
        <div className="relative w-14 h-14 mb-6">
          <Image src={logo} alt="" fill className="object-contain" sizes="56px" />
        </div>
      )}
      <div className={`grid ${gridClass} gap-x-8 gap-y-6 text-sm`}>
        {year && <div><p className="font-semibold text-[rgb(18,18,19)] dark:text-gray-200 mb-0.5">Year</p><p className="text-gray-500 dark:text-gray-400">{year}</p></div>}
        {role && <div><p className="font-semibold text-[rgb(18,18,19)] dark:text-gray-200 mb-0.5">Role</p><p className="text-gray-500 dark:text-gray-400">{role}</p></div>}
        {team && (
          <div>
            <p className="font-semibold text-[rgb(18,18,19)] dark:text-gray-200 mb-0.5">Team</p>
            <p className="text-gray-500 dark:text-gray-400">
              {project?.teamHighlight && team.startsWith(project.teamHighlight) ? (
                <><span className="text-[#81cc3e] font-medium">{project.teamHighlight}</span>{team.slice(project.teamHighlight.length).trimStart()}</>
              ) : team}
            </p>
          </div>
        )}
        {tools && tools.length > 0 && <div><p className="font-semibold text-[rgb(18,18,19)] dark:text-gray-200 mb-0.5">Tools</p><p className="text-gray-500 dark:text-gray-400">{tools.join(', ')}</p></div>}
      </div>
      {sidebarContent}
      {links && links.length > 0 && (
        <div className={`mt-6 ${cols === 2 ? 'flex flex-row flex-wrap gap-x-6 gap-y-2' : 'space-y-2'}`}>
          {links.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </>
  );
}

interface CaseStudyLayoutProps {
  project?: ProjectMetadata;
  title?: string;

  tagline?: string;
  intro?: ReactNode;
  sidebarContent?: ReactNode;
  children: React.ReactNode;
}

export default function CaseStudyLayout({
  project,
  title: titleProp,

  tagline: taglineProp,
  intro,
  sidebarContent,
  children,
}: CaseStudyLayoutProps) {
  const title = titleProp || project?.title || '';

  const tagline = taglineProp || project?.tagline || '';
  const coverImage = project?.coverImage;
  const year = project?.year;
  const role = project?.role;
  const team = project?.team;
  const tools = project?.tools;
  const links = project?.links;
  const logo = project?.logo;
  const coverBgColor = project?.coverBgColor;
  const coverLarge = project?.coverLarge;
  const coverImmersive = project?.coverImmersive;
  const phoneSizeClass = coverImmersive
    ? 'max-w-[380px] md:max-w-[580px] lg:max-w-[680px]'
    : coverLarge
      ? 'max-w-[320px] md:max-w-[480px]'
      : 'max-w-[260px] md:max-w-[380px]';
  const coverHeightClass = 'h-[50vh] md:h-[58vh] min-h-[320px] md:min-h-[440px]';
  const coverSizes = coverImmersive
    ? '(max-width: 768px) 380px, (max-width: 1024px) 580px, 680px'
    : coverLarge
      ? '(max-width: 768px) 320px, 480px'
      : '(max-width: 768px) 260px, 380px';

  return (
    <div className="w-full">
      {coverImage && (
        <div
          className={`relative w-full mt-6 md:mt-8 ${coverHeightClass} flex items-center justify-center p-6 md:p-10 ${!coverBgColor ? 'bg-gray-100 dark:bg-[#1A1A1A]' : ''}`}
          style={coverBgColor ? { backgroundColor: coverBgColor } : undefined}
        >
          <div className={`relative flex items-center justify-center max-h-full w-full ${phoneSizeClass}`}>
            <Image
              src={coverImage}
              alt={title}
              width={800}
              height={600}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl"
              priority
              sizes={coverSizes}
            />
          </div>
        </div>
      )}

      <div className="px-5 sm:px-8 md:px-12 lg:px-16 pt-10 md:pt-14 pb-14 md:pb-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,200px)_1fr] gap-12 lg:gap-20">
            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <MetadataPanel logo={logo} year={year} role={role} team={team} tools={tools} links={links} project={project} sidebarContent={sidebarContent} cols={1} />
            </aside>

            <main className="min-w-0">
              <h1 className="text-7xl sm:text-[80px] font-[550] text-[rgb(18,18,19)] dark:text-white tracking-tight leading-[1.08]">
                {title}
              </h1>
              {tagline && (
                <p className="mt-6 text-xl leading-9 font-[550] text-[rgb(18,18,19)] dark:text-gray-300 max-w-[65ch]">
                  {tagline}
                </p>
              )}

              {intro}

              {/* Metadata panel: mobile only, after intro text */}
              <div className="block lg:hidden mt-10 mb-4">
                <MetadataPanel logo={logo} year={year} role={role} team={team} tools={tools} links={links} project={project} sidebarContent={sidebarContent} cols={2} />
              </div>

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
