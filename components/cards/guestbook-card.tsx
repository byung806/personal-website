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
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);

  useEffect(() => {
    fetch('/api/guestbook')
      .then((res) => res.json())
      .then((data) => setEntries(data.slice(0, 6))) // Show latest 6 entries
      .catch((err) => console.error('Failed to fetch guestbook:', err));
  }, []);

  return (
    <ProjectCard
      title="Guestbook"
      subtitle="INTERACTIVE"
      tags={['Next.js, Prisma, Postgres']}
      projectUrl="/p/guestbook"
      bgColor="#f6f6f6"
    >
      <div className="relative w-full min-h-[250px] p-6 overflow-hidden">
        {/* Museum gallery style - stacked messages with fade */}
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-gray-400 dark:text-gray-600">No messages yet</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
                style={{
                  opacity: 1 - index * 0.15,
                }}
              >
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {entry.username}
                </span>
                : {entry.message}
              </div>
            ))
          )}
        </div>
        
        {/* Fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f6f6f6] dark:from-[#1A1A1A] to-transparent pointer-events-none" />
      </div>
    </ProjectCard>
  );
}
