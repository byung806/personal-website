'use client';

import { useEffect, useState } from 'react';
import ProjectCard from '../project-card';

interface GuestbookEntry {
  id: number;
  username: string;
  message: string;
  createdAt: string;
}

export default function GuestbookCard() {
  const [latestEntry, setLatestEntry] = useState<GuestbookEntry | null>(null);

  useEffect(() => {
    fetch('/api/guestbook')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestEntry(data[0]);
        }
      })
      .catch((err) => console.error('Failed to fetch guestbook:', err));
  }, []);

  return (
    <ProjectCard
      title="Guestbook"
      subtitle="2025"
      tags={['PostgreSQL', 'Prisma', 'Next.js API Routes']}
      projectUrl="/p/guestbook"
      bgColor="#ffffff"
      borderColor="#f1f1f1"
    >
      <div className="relative w-full min-h-[320px] md:min-h-[380px] px-10 py-12 flex items-center">
        <div className="relative max-w-[420px] w-full">
          <div
            className="absolute w-full rounded-[10px]"
            style={{
              backgroundColor: '#fbfbfb',
              transform: 'translate(20px, 20px)',
              height: '140px',
              zIndex: 0,
              boxShadow: '12px 16px 24px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          />

          <div
            className="absolute w-full rounded-[10px]"
            style={{
              backgroundColor: '#fcfcfc',
              transform: 'translate(10px, 10px)',
              height: '140px',
              zIndex: 1,
              boxShadow: '13px 17px 26px rgba(0, 0, 0, 0.085), 0 0 0 0.5px rgba(0,0,0,0.05)',
            }}
          />

          <div
            className="relative rounded-[10px]"
            style={{
              backgroundColor: '#ffffff',
              height: '140px',
              zIndex: 2,
              boxShadow: '14px 20px 32px rgba(0, 0, 0, 0.10), 0 0 0 0.5px rgba(0,0,0,0.05)',
            }}
          >
            {latestEntry && (
              <div className="relative px-6 py-5 h-full flex flex-col">
                <p className="text-[14px] text-gray-800 dark:text-gray-200 font-medium tracking-wide mb-2.5">
                  {latestEntry.username}
                </p>
                <p className="text-[14px] leading-[1.6] text-gray-700 dark:text-gray-300 line-clamp-3">
                  {latestEntry.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProjectCard>
  );
}
