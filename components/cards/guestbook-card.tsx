'use client';

import ProjectCard from '../project-card';

export default function GuestbookCard() {
  return (
    <ProjectCard projectId="guestbook">
      <div className="relative w-full min-h-[320px] md:min-h-[380px] px-10 py-12 flex items-center">
        <div className="relative max-w-[420px] w-full">
          <div
            className="absolute w-full rounded-[6px]"
            style={{
              backgroundColor: '#edf0f5',
              transform: 'translate(20px, 20px)',
              height: '140px',
              zIndex: 0,
              boxShadow: '12px 16px 24px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          />

          <div
            className="absolute w-full rounded-[6px]"
            style={{
              backgroundColor: '#f8f9fc',
              transform: 'translate(10px, 10px)',
              height: '140px',
              zIndex: 1,
              boxShadow: '13px 17px 26px rgba(0, 0, 0, 0.085), 0 0 0 0.5px rgba(0,0,0,0.05)',
            }}
          />

          <div
            className="relative rounded-[6px]"
            style={{
              backgroundColor: '#f8f9fc',
              height: '140px',
              zIndex: 2,
              boxShadow: '14px 20px 32px rgba(0, 0, 0, 0.10), 0 0 0 0.5px rgba(0,0,0,0.05)',
            }}
          >
            <div className="relative px-6 py-5 h-full flex items-center justify-center text-center">
              <p className="antialiased font-sans text-[15px] leading-[1.25] font-medium tracking-[0.14em] uppercase text-gray-400 dark:text-gray-300">
                MAKE YOUR OWN CARD!
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProjectCard>
  );
}
